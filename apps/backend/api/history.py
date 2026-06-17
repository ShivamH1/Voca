from fastapi import APIRouter, HTTPException
from core.vector_store import get_client
from config import collection_name as make_collection
import storage

router = APIRouter()


@router.get("")
async def list_history():
    return [
        {
            "meeting_id": m["meeting_id"],
            "title": m["title"],
            "created_at": m["created_at"],
            "source": m.get("source", ""),
            "language": m.get("language", "english"),
        }
        for m in storage.list_meetings()
    ]


@router.get("/{meeting_id}")
async def get_meeting(meeting_id: str):
    meeting = storage.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: str):
    meeting = storage.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    collection = meeting.get("collection_name", make_collection(meeting_id))
    try:
        client = get_client()
        if client.collection_exists(collection):
            client.delete_collection(collection)
        client.close()
    except Exception:
        pass

    storage.delete_meeting(meeting_id)
    return {"deleted": True}


@router.get("/{meeting_id}/conversations")
async def get_conversations(meeting_id: str):
    if not storage.get_meeting(meeting_id):
        raise HTTPException(status_code=404, detail="Meeting not found")
    return storage.get_messages(meeting_id)


@router.delete("/{meeting_id}/conversations")
async def clear_conversations(meeting_id: str):
    if not storage.get_meeting(meeting_id):
        raise HTTPException(status_code=404, detail="Meeting not found")
    count = storage.clear_messages(meeting_id)
    return {"cleared": count}
