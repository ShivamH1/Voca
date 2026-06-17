from langchain_mistralai import ChatMistralAI
import os
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API = os.getenv("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL")


def get_llm():
    return ChatMistralAI(
        model=MISTRAL_MODEL, mistral_api_key=MISTRAL_API, temperature=0.3
    )
