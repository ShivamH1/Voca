from typing import Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    source: str = Field(
        ..., description="YouTube URL or local path to audio/video file"
    )
    language: str = Field(
        "english", description="Language of the video: 'english' or 'hinglish'"
    )
    meeting_id: Optional[str] = Field(
        None, description="If provided, attempt to resume this meeting from its last checkpoint."
    )


class AnalyzeResponse(BaseModel):
    meeting_id: str
    title: str
    summary: str
    action_items: str
    decisions: str
    questions: str
    transcript: str


class ChatRequest(BaseModel):
    question: str = Field(..., description="The user's query about the meeting")
    meeting_id: Optional[str] = Field(
        None, description="Meeting ID to query. Uses last indexed if not provided."
    )


class ChatResponse(BaseModel):
    answer: str
