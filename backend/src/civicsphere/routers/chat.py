from fastapi import APIRouter, HTTPException, Request, UploadFile, Form, File
from fastapi.response import JSONResponse
from pydantic import BaseModel
from typing import Optional
import logging
from openai import AzureOpenAI
from ..config import AppConfig
from ..services.rag import search_documents
from ..models.chat import Chat
from langchain.prompts import ChatPromptTemplate
from langchain.chains.llm import LLMChain
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter
from ..services.storage import upload_user_file

config: AppConfig = AppConfig()

router = APIRouter(tags=["Chatbot"])


chatbot_template = """\
You are a helpful civilian assistant that answers a local community queries and \
political queries and local policies and laws. If no data is provided, answer \
using publicly available knowledge, especially by trying to understand the \
location and nationality behind the query to answer based on that country's \
laws, policies and regulations and don't give specific recommendation or bias \
to maintain fairness. Always aim to help the user as best as you can. \
Keep your responses concise and relevant and in simple language.

Here's the query:
{{ query }}

Guidelines:
- Use plain English.
- Give generic answers if needed.
"""

chatbot_prompt_template = ChatPromptTemplate.from_template(chatbot_template)

def chunk_text(text: str, max_chunk_size: int = 1000):
    return [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]

@router.post("/chat", response_model=Chat)
async def chat(
    req: Request,
    query: str = Form(...),
):
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /chat. User is not authenticated.")
        return JSONResponse(status_code=401, detail={"success": False, "message": "User is not authenticated."})


    try:
        client = config.langchain_llm
        document_url = None

        search_results = search_documents(query)
        logging.info(f"Search results content: {search_results}")
        chain = LLMChain(
            llm=client,
            prompt=chatbot_prompt_template
        )
        result = chain.invoke({"query": query})
        final_response = result.get("text", "No response generated.")

        chat_history_doc = {
            "query": {
                "role": "user",
                "content": query
            },
            "response": {
                "role": "bot",
                "content": final_response
            },
            "user_id": user_id
        }
        chat_insert_result = await config.db["chat_history"].insert_one(chat_history_doc)
        chat_history_doc["chat_id"] = str(chat_insert_result.inserted_id)
        chat_history = Chat(**chat_history_doc)

        return chat_history

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        raise HTTPException(status_code=500, detail=str(e))
