from typing import Optional, List
import logging
from fastapi import (
    APIRouter,
    Request,
    Depends,
    File,
    UploadFile,
    Form
)
from fastapi.responses import JSONResponse
from langchain_core.prompts import PromptTemplate
from src.civicsphere.config import AppConfig
from src.civicsphere.models.db.user import UserPreferences
from src.civicsphere.models.api.chat import (
    Chat,
    ChatData,
    ChatRequest,
    ChatResponse
)
from src.civicsphere.models.api.post import PostResponse
from src.civicsphere.services.chatbot.rag import search_documents
from src.civicsphere.services.chatbot.core.chat import execute_agent_query
from src.civicsphere.services.chatbot.scraper.web.nyc import (
    parse_address,
    get_pollsite_info,
    summarize_pollsite,
    summarize_accessibility
)
from src.civicsphere.services.chatbot.external.nyc import process_voice_prompt
from src.civicsphere.services.chatbot.external.nyc import get_accessibility_summary, get_pollsite_summary, get_trending_posts


config: AppConfig = AppConfig()
router = APIRouter(tags=["Chatbot"])

@router.post(
    "/new",
    response_model=ChatResponse
)
async def chat(
    req: Request,
    prompt: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    voice: Optional[UploadFile] = File(None)
):
    """
    Prompt chatbot with user queries
    """

    # User authentication
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
    logging.info(user_id)
    # Get preferences
    try:
        prefs = await config.db["userPreferences"].find_one(
            {"user_id": user_id},
            {
                "location": 1,
                "address": 1,
                "profession": 1,
                "interests": 1,
                "language": 1,
                "_id": 0,
            },
        )

        if not prefs:
            raise ValueError("Preferences not found. User may not have completed onboarding.")
        language = prefs.get("language", "en")
        address = prefs.get("address")
        location = prefs.get("location")
        user_language = prefs.get("language") or "en"
        # Process voice prompt        
        if voice:
            prompt_text = await process_voice_prompt(voice, language)
        else:
            prompt_text = prompt

        match prompt_text:
            case "Find my nearest pollsites":
                summary = await get_pollsite_summary(address)
                return ChatResponse(success=True, message="Fetched pollsite summary", data=ChatData(role="assistant", content=summary))

            case "Trending discussions in my area":
                if not location:
                    return JSONResponse(status_code=400, content=ChatResponse(success=False, message="User location not set").dict())
                summary = await get_trending_posts(location)
                return ChatResponse(success=True, message="Successfully fetched trending posts", data=ChatData(role="assistant", content=summary))

            case "Accessibility options available at my nearest polling sites":
                summary = await get_accessibility_summary(address)
                return ChatResponse(success=True, message="Fetched pollsite accessibility summary", data=ChatData(role="assistant", content=summary))
            case _:
                response = await execute_agent_query(prompt_text, language, user_language)
                return ChatResponse(success=True, message="Agent executed successfully", data=ChatData(role="assistant", content=response))

    except ValueError as e:
        return JSONResponse(status_code=400, content=ChatResponse(success=False, message=str(e)).model_dump())

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        return JSONResponse(
            status_code=500,
            content=ChatResponse(
                success=False,
                message=str(e)
            ).model_dump()
        )


