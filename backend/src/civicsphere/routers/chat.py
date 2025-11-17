from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import logging
from ..config import AppConfig
from ..services.chatbot.rag import search_documents
from ..models.api.chat import Chat, ChatData, ChatRequest, ChatResponse
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser


config: AppConfig = AppConfig()
router = APIRouter(tags=["Chatbot"])


chatbot_template = """\
You are a helpful civilian assistant that answers a local community queries and \
political queries and local policies and laws. If no data is provided, answer \
using publicly available knowledge, especially by trying to understand the \
location and nationality behind the prompt to answer based on that country's \
laws, policies and regulations and don't give specific recommendation or bias \
to maintain fairness. Always aim to help the user as best as you can. \
Keep your responses concise and relevant and in simple language.

Here's the prompt:
{{ prompt }}

Guidelines:
- Use plain English.
- Give generic answers if needed.
"""

def chunk_text(text: str, max_chunk_size: int = 1000):
    return [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]

@router.post(
    "/new",
    response_model=ChatResponse
)
async def chat(
    req: Request,
    prompt: ChatRequest,
):
    """
    Prompt chatbot with user queries
    """
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /chat. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=ChatResponse(
                success=False,
                message="User is not authenticated"
            ).dict()
        )


    try:
        client = config.langchain_llm
        search_results = search_documents(prompt.prompt)
        logging.info(f"Search results content: {search_results}")
        chatbot_prompt = PromptTemplate(
            input_variables=["prompt"],
            template=chatbot_template
        )
        chain = chatbot_prompt | client | StrOutputParser() 
        result = chain.invoke(prompt.prompt)
        final_response = result.get("text", "No response generated.")

        chat_query = ChatData(
            role="user",
            content=prompt.prompt
        )
        chat_response = ChatData(
            role="bot",
            content=final_response
        )

        chat_data = Chat(
            query=chat_query,
            response=chat_response
        )
        chat_resp = ChatResponse(
            success=True,
            message="Chat successful",
            data=chat_data
        )
        return chat_resp

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        return JSONResponse(
            status_code=500,
            content=ChatResponse(
                success=False,
                message=str(e)
            ).dict()
        )
