from fastapi import APIRouter, HTTPException, Request, UploadFile, Form, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import logging
from openai import AzureOpenAI
from ..config import AppConfig
from ..services.rag import search_documents
from ..models.chat import Chat
from langchain_core.prompts import PromptTemplate
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

def chunk_text(text: str, max_chunk_size: int = 1000):
    return [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]

@router.post("/new", response_model=Chat)
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
        search_results = search_documents(query)
        logging.info(f"Search results content: {search_results}")
        chatbot_prompt = PromptTemplate(
            input_variables=["query"],
            template=chatbot_template
        )
        chain = chatbot_prompt | client | StrOutputParser() 
        result = chain.invoke(query)
        final_response = result.get("text", "No response generated.")

        chat_data = {
            "query": {
                "role": "user",
                "content": query
            },
            "response": {
                "role": "bot",
                "content": final_response
            },
        }
        return chat_data

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        raise HTTPException(status_code=500, detail=str(e))
