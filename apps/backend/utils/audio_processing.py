import os
import shutil
import static_ffmpeg
import yt_dlp
from pydub import AudioSegment
from config import DOWNLOAD_DIR, AUDIO_CHUNK_MINUTES

# Ensure ffmpeg is on PATH (idempotent; also called in main.py before imports)
static_ffmpeg.add_paths()
_FFMPEG_DIR = os.path.dirname(shutil.which("ffmpeg") or "")


def download_youtube_audio(url: str) -> str:
    """Download audio from YouTube and return the path to a WAV file."""
    output_template = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")
    options: dict = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ],
        "quiet": True,
    }
    if _FFMPEG_DIR:
        options["ffmpeg_location"] = _FFMPEG_DIR
    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=True)
        wav_path = os.path.splitext(ydl.prepare_filename(info))[0] + ".wav"
    return wav_path


def convert_to_wav(input_path: str) -> str:
    """Convert any audio/video file to 16 kHz mono WAV."""
    output_path = os.path.splitext(input_path)[0] + "_converted.wav"
    audio = AudioSegment.from_file(input_path)
    audio.set_channels(1).set_frame_rate(16_000).export(output_path, format="wav")
    return output_path


def chunk_audio(wav_path: str, chunk_minutes: int = AUDIO_CHUNK_MINUTES) -> list[str]:
    """Split a WAV file into fixed-length chunks; returns list of chunk paths."""
    audio = AudioSegment.from_wav(wav_path)
    chunk_ms = chunk_minutes * 60 * 1_000
    chunks: list[str] = []
    for i, start in enumerate(range(0, len(audio), chunk_ms)):
        path = f"{wav_path}_chunk_{i}.wav"
        audio[start: start + chunk_ms].export(path, format="wav")
        chunks.append(path)
    return chunks


def process_input(source: str) -> list[str]:
    """
    Accept a YouTube URL or a local audio/video path and return a list of
    chunked WAV file paths ready for transcription.
    """
    if source.startswith("http://") or source.startswith("https://"):
        print("Detected YouTube URL. Downloading audio...")
        wav_path = download_youtube_audio(source)
    else:
        print("Detected local file. Converting to WAV...")
        wav_path = convert_to_wav(source)

    print("Chunking audio...")
    chunks = chunk_audio(wav_path)
    print(f"Audio ready — {len(chunks)} chunk(s).")
    return chunks
