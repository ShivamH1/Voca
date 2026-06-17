import json
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from schemas import AnalyzeRequest, AnalyzeResponse
from core.pipeline import run_analysis, run_analysis_stream

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Blocking endpoint — returns the full result when the pipeline finishes."""
    meeting_id = str(uuid.uuid4())
    try:
        result = run_analysis(meeting_id, request.source, request.language)
        return AnalyzeResponse(meeting_id=meeting_id, **result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")


@router.post("/analyze/stream")
async def analyze_stream(request: AnalyzeRequest):
    """
    Streaming endpoint — emits Server-Sent Events as each pipeline step
    completes. Clients should read the response body as a stream.

    If request.meeting_id is provided and a checkpoint exists for that ID,
    the pipeline resumes from the last completed step (retry/recovery).

    Event format: data: {json}\\n\\n
    """
    meeting_id = request.meeting_id or str(uuid.uuid4())

    async def event_stream():
        async for event in run_analysis_stream(meeting_id, request.source, request.language):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering if deployed behind proxy
            "Connection": "keep-alive",
        },
    )
