"""
Centralised configuration — all environment variables and constants live here.
Load this module first; it runs dotenv and populates everything else.
"""
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path=".env")

# ── LLM ──────────────────────────────────────────────────────────────────────
MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
MISTRAL_TEMPERATURE: float = 0.3

# ── Transcription ─────────────────────────────────────────────────────────────
HF_TOKEN: str = os.getenv("HF_TOKEN", "")
WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "openai/whisper-large-v3-turbo")

SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
SARVAM_STT_MODEL: str = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")
SARVAM_STT_URL: str = os.getenv(
    "SARVAM_STT_TRANSLATE_URL", "https://api.sarvam.ai/speech-to-text-translate"
)
SARVAM_PIECE_SECONDS: int = 25

# ── Vector store ──────────────────────────────────────────────────────────────
QDRANT_URL: str | None = os.getenv("QDRANT_URL")
QDRANT_API_KEY: str | None = os.getenv("QDRANT_API_KEY")
QDRANT_LOCAL_PATH: str = "qdrant_db"
EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
VECTOR_CHUNK_SIZE: int = 500
VECTOR_CHUNK_OVERLAP: int = 50

# ── Audio ─────────────────────────────────────────────────────────────────────
DOWNLOAD_DIR: str = "downloads"
AUDIO_CHUNK_MINUTES: int = 10


def collection_name(meeting_id: str) -> str:
    """Derive a Qdrant-safe collection name from a meeting UUID."""
    return f"meeting_{meeting_id.replace('-', '')}"
