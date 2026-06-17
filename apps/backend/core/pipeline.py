"""
End-to-end meeting analysis pipeline.
run_analysis        — synchronous, used by the plain /api/analyze endpoint.
run_analysis_stream — async generator that yields SSE-ready dicts as each step
                      completes, used by /api/analyze/stream.

Recovery / checkpointing:
  After step 1 (transcription) completes, the transcript is persisted via
  storage.save_pipeline_state so that if step 2 or 3 later fails, a retry
  using the same meeting_id resumes without re-downloading / re-transcribing.
  After step 2 (LLM analysis) all extracted fields are also checkpointed.
  On successful completion, the checkpoint is cleared.
"""
import os
import asyncio
from typing import AsyncGenerator
from config import collection_name as make_collection
from core.transcriber import transcribe_all
from core.summarizer import generate_title, summarize
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_core import build_rag, close_rag_client
from utils.audio_processing import process_input
import storage


def _build_rag_and_close(transcript: str, collection: str) -> None:
    rag_chain = build_rag(transcript, collection_name=collection)
    close_rag_client(rag_chain)


def run_analysis(meeting_id: str, source: str, language: str) -> dict:
    """Blocking pipeline. Returns result dict. Cleans up chunks on exit."""
    collection = make_collection(meeting_id)
    chunks: list[str] = []

    try:
        chunks = process_input(source)
        transcript = transcribe_all(chunks, language=language)
        title = generate_title(transcript)
        summary = summarize(transcript)
        action_items = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)
        _build_rag_and_close(transcript, collection)

        result = {
            "title": title,
            "summary": summary,
            "action_items": action_items,
            "decisions": decisions,
            "questions": questions,
            "transcript": transcript,
        }
        storage.save_meeting(
            meeting_id,
            {**result, "source": source, "language": language, "collection_name": collection},
        )
        return result

    finally:
        for chunk in chunks:
            if os.path.exists(chunk):
                os.remove(chunk)


async def run_analysis_stream(
    meeting_id: str, source: str, language: str
) -> AsyncGenerator[dict, None]:
    """
    Async generator that yields progress dicts as each pipeline step completes.
    Blocking operations run in a thread pool so SSE events flush in real-time.

    Checkpoints are saved after step 1 and step 2 so that a retry using the
    same meeting_id resumes from the last completed step instead of restarting.

    Event shapes:
      {"type": "start", "meeting_id": str}           — first event, always
      {"step": 0-3, "status": "active"|"done"}        — step progress
      {"done": True, "meeting_id": str, ...results}   — pipeline complete
      {"error": str}                                  — unrecoverable failure
    """
    collection = make_collection(meeting_id)

    # Load any existing checkpoint for this meeting_id
    state = storage.get_pipeline_state(meeting_id) or {}
    if not state:
        storage.save_pipeline_state(meeting_id, {
            "source": source,
            "language": language,
            "collection_name": collection,
        })

    # Load checkpointed values (None if not yet computed)
    transcript: str | None = state.get("transcript")
    title: str | None = state.get("title")
    summary: str | None = state.get("summary")
    action_items: str | None = state.get("action_items")
    decisions: str | None = state.get("decisions")
    questions: str | None = state.get("questions")

    # Determine the step to resume from
    if state.get("step_2_done") and title:
        start_from = 3
    elif state.get("step_1_done") and transcript:
        start_from = 2
    else:
        start_from = 0

    chunks: list[str] = []

    # First event always carries meeting_id so the client can store it for retry
    yield {"type": "start", "meeting_id": meeting_id}

    # Flash already-completed steps as done immediately
    for i in range(start_from):
        yield {"step": i, "status": "done"}

    try:
        if start_from <= 0:
            # Step 0 — Audio processing
            yield {"step": 0, "status": "active"}
            chunks = await asyncio.to_thread(process_input, source)
            yield {"step": 0, "status": "done"}

            # Step 1 — Transcription (runs immediately after step 0 within the same resume block)
            yield {"step": 1, "status": "active"}
            transcript = await asyncio.to_thread(transcribe_all, chunks, language)
            # Checkpoint: transcript saved — later failure resumes from step 2
            storage.save_pipeline_state(meeting_id, {
                "step_1_done": True,
                "transcript": transcript,
            })
            yield {"step": 1, "status": "done"}

        if start_from <= 2:
            # Step 2 — LLM analysis (all 5 calls run concurrently)
            yield {"step": 2, "status": "active"}
            title, summary, action_items, decisions, questions = await asyncio.gather(
                asyncio.to_thread(generate_title, transcript),
                asyncio.to_thread(summarize, transcript),
                asyncio.to_thread(extract_action_items, transcript),
                asyncio.to_thread(extract_key_decisions, transcript),
                asyncio.to_thread(extract_questions, transcript),
            )
            # Checkpoint: all LLM outputs saved — later failure resumes from step 3
            storage.save_pipeline_state(meeting_id, {
                "step_2_done": True,
                "title": title,
                "summary": summary,
                "action_items": action_items,
                "decisions": decisions,
                "questions": questions,
            })
            yield {"step": 2, "status": "done"}

        # Step 3 — Vector DB indexing (always runs; not checkpointed since it's fast to redo)
        yield {"step": 3, "status": "active"}
        await asyncio.to_thread(_build_rag_and_close, transcript, collection)
        yield {"step": 3, "status": "done"}

        result = {
            "title": title,
            "summary": summary,
            "action_items": action_items,
            "decisions": decisions,
            "questions": questions,
            "transcript": transcript,
        }
        storage.save_meeting(
            meeting_id,
            {**result, "source": source, "language": language, "collection_name": collection},
        )
        storage.clear_pipeline_state(meeting_id)

        yield {"done": True, "meeting_id": meeting_id, **result}

    except Exception as e:
        import traceback
        traceback.print_exc()
        yield {"error": str(e)}

    finally:
        for chunk in chunks:
            if os.path.exists(chunk):
                try:
                    os.remove(chunk)
                except OSError:
                    pass
