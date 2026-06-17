"""
Shared LangChain chain factory. Eliminates the duplicated build_chain pattern
across summarizer.py and extractor.py.
"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from utils.llm import get_llm


def simple_chain(system_prompt: str):
    """
    One-shot chain: feeds {text} through a system prompt and returns a plain string.
    Usage: simple_chain(MY_PROMPT).invoke(my_text)
    """
    llm = get_llm()
    return (
        {"text": RunnablePassthrough()}
        | ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{text}"),
        ])
        | llm
        | StrOutputParser()
    )
