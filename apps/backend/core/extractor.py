from utils.chains import simple_chain
from core import prompts


def extract_action_items(transcript: str) -> str:
    return simple_chain(prompts.ACTION_ITEMS).invoke(transcript)


def extract_key_decisions(transcript: str) -> str:
    return simple_chain(prompts.KEY_DECISIONS).invoke(transcript)


def extract_questions(transcript: str) -> str:
    return simple_chain(prompts.OPEN_QUESTIONS).invoke(transcript)
