from utils.hf_client import client
import os

WHISPER_MODEL = os.getenv("WHISPER_MODEL")


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
