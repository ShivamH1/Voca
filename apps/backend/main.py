import os
import static_ffmpeg
from dotenv import load_dotenv

# Load environment variables before any other imports
load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path=".env")

# Add ffmpeg paths before pydub is imported by other modules
static_ffmpeg.add_paths()

from core.rag_core import build_rag, load_rag_chain, ask_question
from core.vector_store import build_vector_store
from core.summarizer import generate_title, summarize
from core.transcriber import transcribe_all
from core.extractor import (
    extract_action_items,
    extract_key_decisions,
    extract_questions,
)
from utils.audio_processing import process_input
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def close_rag_client(rag_chain):
    try:
        steps = getattr(rag_chain, "steps", [])
        if len(steps) > 0:
            parallel_steps = getattr(steps[0], "steps", {})
            context_chain = parallel_steps.get("context")
            if context_chain:
                context_steps = getattr(context_chain, "steps", [])
                if len(context_steps) > 0:
                    context_steps[0].vector_store.client.close()
    except Exception:
        pass


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def run_pipeline(request: AnalyzeRequest):
    chunks = []

    try:
        chunks = process_input(request.source)

        transcript = transcribe_all(chunks, language=request.language)

        title = generate_title(transcript)
        summary = summarize(transcript)
        action_items = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)

        rag_chain = build_rag(transcript)

        close_rag_client(rag_chain)

        return AnalyzeResponse(
            title=title,
            summary=summary,
            action_items=action_items,
            decisions=decisions,
            questions=questions,
            transcript=transcript,
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline Failed: {str(e)}")

    finally:
        for chunk in chunks:
            if os.path.exists(chunk):
                os.remove(chunk)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        rag_chain = load_rag_chain()

        answer = ask_question(rag_chain, request.question)

        close_rag_client(rag_chain)

        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")
