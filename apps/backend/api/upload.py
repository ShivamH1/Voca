import os
import time
import shutil
from fastapi import APIRouter, UploadFile, File
from config import DOWNLOAD_DIR

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "upload")[1] or ".bin"
    dest = os.path.join(DOWNLOAD_DIR, f"upload_{int(time.time())}{ext}")
    with open(dest, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {"file_path": os.path.abspath(dest)}
