from huggingface_hub import InferenceClient
from config import HF_TOKEN

client = InferenceClient(token=HF_TOKEN, provider="hf-inference")
