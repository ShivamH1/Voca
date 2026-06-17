import json
import os
import uuid as _uuid
from datetime import datetime, timezone

STORE_FILE = "meetings.json"


def _load() -> dict:
    if not os.path.exists(STORE_FILE):
        return {"meetings": {}, "conversations": {}}
    with open(STORE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict):
    with open(STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def save_meeting(meeting_id: str, data: dict):
    store = _load()
    store["meetings"][meeting_id] = {
        **data,
        "meeting_id": meeting_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save(store)


def list_meetings() -> list:
    store = _load()
    meetings = list(store["meetings"].values())
    return sorted(meetings, key=lambda m: m.get("created_at", ""), reverse=True)


def get_meeting(meeting_id: str) -> dict | None:
    store = _load()
    return store["meetings"].get(meeting_id)


def delete_meeting(meeting_id: str) -> bool:
    store = _load()
    if meeting_id not in store["meetings"]:
        return False
    del store["meetings"][meeting_id]
    store["conversations"].pop(meeting_id, None)
    store.get("_pipeline_states", {}).pop(meeting_id, None)
    _save(store)
    return True


# ── Pipeline state (checkpointing for retry/recovery) ─────────────────────────

def save_pipeline_state(meeting_id: str, updates: dict):
    store = _load()
    if "_pipeline_states" not in store:
        store["_pipeline_states"] = {}
    existing = store["_pipeline_states"].get(meeting_id, {"meeting_id": meeting_id})
    existing.update(updates)
    store["_pipeline_states"][meeting_id] = existing
    _save(store)


def get_pipeline_state(meeting_id: str) -> dict | None:
    store = _load()
    return store.get("_pipeline_states", {}).get(meeting_id)


def clear_pipeline_state(meeting_id: str):
    store = _load()
    store.get("_pipeline_states", {}).pop(meeting_id, None)
    _save(store)


def save_message(meeting_id: str, role: str, content: str) -> dict:
    store = _load()
    if meeting_id not in store["conversations"]:
        store["conversations"][meeting_id] = []
    msg = {
        "id": str(_uuid.uuid4()),
        "meeting_id": meeting_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    store["conversations"][meeting_id].append(msg)
    _save(store)
    return msg


def get_messages(meeting_id: str) -> list:
    store = _load()
    return store["conversations"].get(meeting_id, [])


def clear_messages(meeting_id: str) -> int:
    store = _load()
    count = len(store["conversations"].get(meeting_id, []))
    store["conversations"].pop(meeting_id, None)
    _save(store)
    return count
