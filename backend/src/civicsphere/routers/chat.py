from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
import logging
from ..config import AppConfig
from ..services.chatbot.rag import search_documents
from ..models.api.chat import Chat, ChatData, ChatRequest, ChatResponse
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from ..services.chatbot.external.bing_search import search_bing


config: AppConfig = AppConfig()
router = APIRouter(tags=["Chatbot"])


chatbot_template = """\
You are a helpful civilian assistant that answers local community queries, \
political queries, and provides information on local policies and laws. \
You have access to a knowledge base and external search results.

Use the provided context to answer the user's question. \
If the context contains relevant information, prioritize it. \
If the user asks about candidates or voting, provide factual information about the candidates \
but DO NOT provide specific recommendations or show bias. \
Maintain strict neutrality and fairness.

Keep your responses concise, relevant, and use simple language that is easy to understand.

Here's the context:
{context}

Here's the prompt:
{prompt}

Guidelines:
- Use plain English.
- Give generic answers if needed.
- Be unbiased and neutral, especially regarding elections.
- Do not say "You should vote for X". Instead, say "Candidate X supports Y".
"""

@router.post(
    "/new",
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
            ).model_dump()
        )


    try:
        client = config.langchain_llm
        # RAG Search
        rag_results = await search_documents(prompt.prompt)
        # Bing Search
        # bing_results = await search_bing(prompt.prompt)
        # logging.info(f"Bing results content: {bing_results}")
        bing_results = []
        # Combine results
        context_parts = []
        if rag_results:
            context_parts.append("Knowledge Base Results:\n" + "\n".join(rag_results))
        if bing_results:
            context_parts.append("External Search Results:\n" + "\n".join(bing_results))
            
        context_str = "\n\n".join(context_parts)
        
        chatbot_prompt = PromptTemplate(
            input_variables=["prompt", "context"],
            template=chatbot_template
        )
        
        # Create chain with context
        chain = chatbot_prompt | client | StrOutputParser()
        
        async def generate():
            async for chunk in chain.astream({"prompt": prompt.prompt, "context": context_str}):
                yield chunk

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        return JSONResponse(
            status_code=500,
            content=ChatResponse(
                success=False,
                message=str(e)
            ).model_dump()
        )


