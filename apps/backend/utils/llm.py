from langchain_mistralai import ChatMistralAI
from config import MISTRAL_API_KEY, MISTRAL_MODEL, MISTRAL_TEMPERATURE

_llm: ChatMistralAI | None = None


def get_llm() -> ChatMistralAI:
    global _llm
    if _llm is None:
        _llm = ChatMistralAI(
            model=MISTRAL_MODEL,
            mistral_api_key=MISTRAL_API_KEY,
            temperature=MISTRAL_TEMPERATURE,
        )
    return _llm
