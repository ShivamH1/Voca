from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    source: str = Field(
        ..., description="YouTube URL or local path to audio/video file"
    )
    language: str = Field(
        "english", description="Language of the video: 'english' or 'hinglish'"
    )


class AnalyzeResponse(BaseModel):
    title: str
    summary: str
    action_items: str
    decisions: str
    questions: str
    transcript: str


class ChatRequest(BaseModel):
    question: str = Field(..., description="The user's query about the meeting")


class ChatResponse(BaseModel):
    answer: str
