from utils.hf_client import client
import os
import requests

# pyrefly: ignore [missing-import]
from pydub import AudioSegment

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "openai/whisper-small")

SARVAM_PIECE_SECONDS = 25
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_STT = os.getenv(
    "SARVAM_STT_TRANSLATE_URL", "https://api.sarvam.ai/speech-to-text-translate"
)
SARVAM_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")


def transcribe_chunk_whisper(chunk_path: str) -> str:
    """
    Transcribes an audio chunk using the Hugging Face InferenceClient
    instead of a locally loaded Whisper instance.
    """
    # 1. Read the audio chunk file as binary data
    with open(chunk_path, "rb") as f:
        audio_bytes = f.read()

    # 2. Call the Hugging Face Serverless Inference API
    # This completely replaces 'load_model()' and 'model.transcribe()'
    result = client.automatic_speech_recognition(audio_bytes, model=WHISPER_MODEL)

    # 3. Return the transcribed text (Hugging Face returns an object with a .text attribute)
    return result.text


def _send_to_sarvam(piece_path: str) -> str:
    headers = {"api-subscription-key": SARVAM_API_KEY}

    with open(piece_path, "rb") as f:
        files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
        data = {"model": SARVAM_MODEL, "with_diarization": "false"}

    response = requests.post(
        SARVAM_STT,
        headers=headers,
        files=files,
        data=data,
        timeout=120,
    )

    if not response.ok:
        print(f"\n❌ Sarvam returned {response.status_code}")
        print(f"Response body: {response.text}\n")
        response.raise_for_status()

    return response.json().get("transcript", "")


def transcribe_chunk_sarvam(chunk_path: str) -> str:
    """Sarvam sync API only accepts ≤30s audio. We split this chunk into
    25-second pieces, send each separately, and join the transcripts."""
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not set in environment / .env")

    audio = AudioSegment.from_wav(chunk_path)
    piece_ms = SARVAM_PIECE_SECONDS * 1000

    full_text = ""
    total_pieces = (len(audio) + piece_ms - 1) // piece_ms

    for i, start in enumerate(range(0, len(audio), piece_ms)):
        piece = audio[start : start + piece_ms]
        piece_path = f"{chunk_path}_sv_{i}.wav"
        piece.export(piece_path, format="wav")

    try:
        print(f"  → Sarvam piece {i + 1}/{total_pieces} ...")
        full_text += _send_to_sarvam(piece_path) + " "
    finally:
        if os.path.exists(piece_path):
            os.remove(piece_path)

    return full_text.strip()


def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    """
    Route one chunk to Whisper or Sarvam depending on language choice.
    - english  → Whisper (HuggingFace Hub)
    - hinglish → Sarvam (translates to English while transcribing)
    """
    if language.lower() == "hinglish":
        return transcribe_chunk_sarvam(chunk_path)
    return transcribe_chunk_whisper(chunk_path)


def transcribe_all(chunks: list, language: str = "english") -> str:
    """Transcribe all chunks into a single transcript string."""
    full_transcript = ""

    engine = "Sarvam AI" if language.lower() == "hinglish" else "Whisper"
    print(f"Using {engine} for transcription.")

    for i, chunk in enumerate(chunks):
        print(f"Transcribing chunk {i + 1}/{len(chunks)}...")
        text = transcribe_chunk(chunk, language=language)
        full_transcript += text + " "

    print("Transcription complete.")
    return full_transcript.strip()
