import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

# Dynamically resolve and add FFmpeg binaries to the system path
import static_ffmpeg
static_ffmpeg.add_paths()

# Add the apps/backend directory to the python path so it finds utils and core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.audio_processing import process_input
from core.transcriber import transcribe_all


def test_pipeline():
    # Example video URL or path to a local audio/video file
    test_source = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Replace with any short video/audio url
    language = "english"  # "english" or "hinglish"

    print(f"--- Starting Audio Processing for: {test_source} ---")
    chunks = process_input(test_source)
    print(f"Chunks generated: {chunks}")

    print(f"\n--- Starting Transcription ({language}) ---")
    transcript = transcribe_all(chunks, language=language)
    print("\n--- Final Transcript ---")
    print(transcript)

    # Clean up generated chunks
    print("\nCleaning up chunks...")
    for chunk in chunks:
        if os.path.exists(chunk):
            os.remove(chunk)
            print(f"Removed {chunk}")


if __name__ == "__main__":
    test_pipeline()
