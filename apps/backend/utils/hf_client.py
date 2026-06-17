from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path=".env")

client = InferenceClient(token=os.getenv("HF_TOKEN"), provider="hf-inference")
