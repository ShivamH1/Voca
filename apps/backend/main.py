import os

# ── Environment fixes (must run before ANY other import) ─────────────────────
# Python 3.14 + PyTorch on Windows: torch._dynamo calls getpass.getuser() at
# import time to build its cache directory. When Turborepo spawns the uvicorn
# subprocess, the Windows USERNAME env var is not inherited, causing:
#   OSError: No username set in the environment
# Fix: derive the username from USERPROFILE before torch is ever imported.
if not (os.environ.get("USERNAME") or os.environ.get("USER")):
    os.environ["USERNAME"] = os.path.basename(os.path.expanduser("~"))

# Also pre-set the torch inductor cache dir to skip the getuser() call entirely.
os.environ.setdefault(
    "TORCHINDUCTOR_CACHE_DIR",
    os.path.join(os.path.expanduser("~"), ".cache", "torchinductor"),
)

import static_ffmpeg

# Must happen before any pydub / audio imports
static_ffmpeg.add_paths()

import config  # runs dotenv
from api import upload, analyze, chat, history
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

os.makedirs(config.DOWNLOAD_DIR, exist_ok=True)

app = FastAPI(title="Voca Intelligence API", version="1.0.0")

_cors_origins = ["http://localhost:3000", "http://localhost:3001"]
if os.environ.get("FRONTEND_URL"):
    _cors_origins.append(os.environ["FRONTEND_URL"].rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(history.router, prefix="/api/history")


@app.get("/health")
async def health():
    return {"status": "ok"}
