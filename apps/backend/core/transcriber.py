import os
import requests
from pydub import AudioSegment
from utils.hf_client import client
from config import (
    WHISPER_MODEL,
    SARVAM_API_KEY,
    SARVAM_STT_MODEL,
    SARVAM_STT_URL,
    SARVAM_PIECE_SECONDS,
)


def _transcribe_whisper(chunk_path: str) -> str:
    result = client.automatic_speech_recognition(chunk_path, model=WHISPER_MODEL)
    return result.text


def _send_sarvam_piece(piece_path: str) -> str:
    headers = {"api-subscription-key": SARVAM_API_KEY}
    with open(piece_path, "rb") as f:
        files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
        data = {"model": SARVAM_STT_MODEL, "with_diarization": "false"}
        response = requests.post(SARVAM_STT_URL, headers=headers, files=files, data=data, timeout=120)

    if not response.ok:
        print(f"Sarvam error {response.status_code}: {response.text}")
        response.raise_for_status()
    return response.json().get("transcript", "")


def _transcribe_sarvam(chunk_path: str) -> str:
    """Sarvam only accepts ≤30 s audio; split the chunk into pieces and join."""
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not set in .env.local")

    audio = AudioSegment.from_wav(chunk_path)
    piece_ms = SARVAM_PIECE_SECONDS * 1_000
    total = (len(audio) + piece_ms - 1) // piece_ms
    parts: list[str] = []

    for i, start in enumerate(range(0, len(audio), piece_ms)):
        piece_path = f"{chunk_path}_sv_{i}.wav"
        audio[start: start + piece_ms].export(piece_path, format="wav")
        try:
            print(f"  → Sarvam piece {i + 1}/{total}")
            parts.append(_send_sarvam_piece(piece_path))
        finally:
            if os.path.exists(piece_path):
                os.remove(piece_path)

    return " ".join(parts).strip()


def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    """Route one audio chunk to the correct transcription engine."""
    if language.lower() == "hinglish":
        return _transcribe_sarvam(chunk_path)
    return _transcribe_whisper(chunk_path)


def transcribe_all(chunks: list[str], language: str = "english") -> str:
    """Transcribe all chunks and return a single concatenated transcript."""
    engine = "Sarvam AI" if language.lower() == "hinglish" else "Whisper"
    print(f"Transcribing {len(chunks)} chunk(s) with {engine}...")
    parts = [transcribe_chunk(c, language=language) for c in chunks]
    print("Transcription complete.")
    return " ".join(parts).strip()
