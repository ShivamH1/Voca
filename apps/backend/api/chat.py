from fastapi import APIRouter, HTTPException
from schemas import ChatRequest, ChatResponse
from core.rag_core import load_rag_chain, ask_question, close_rag_client
from config import collection_name as make_collection
import storage

router = APIRouter()


def _resolve_collection(meeting_id: str | None) -> str:
    if not meeting_id:
        return "meeting_transcript"
    meeting = storage.get_meeting(meeting_id)
    if not meeting:
        return "meeting_transcript"
    return meeting.get("collection_name", make_collection(meeting_id))


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        collection = _resolve_collection(request.meeting_id)
        rag_chain = load_rag_chain(collection_name=collection)
        answer = ask_question(rag_chain, request.question)
        close_rag_client(rag_chain)

        if request.meeting_id:
            storage.save_message(request.meeting_id, "user", request.question)
            storage.save_message(request.meeting_id, "assistant", answer)

        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {e}")
