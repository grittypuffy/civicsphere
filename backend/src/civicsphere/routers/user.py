import aiofiles
import os
import json
import logging
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.user import UserPreferencesModel, UserPreferencesRequest

router = APIRouter(tags=["User Management"])

config: AppConfig = get_config()

@router.post("/onboarding")
async def onboarding(
    req: Request,
    payload: UserPreferencesRequest
):
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /onboarding. User is not authenticated.")
        return JSONResponse(status_code=401, detail={"success": False, "message": "User is not authenticated."})

    try:
        language = payload.language
        if payload.language not in config.languages:
            language = "en"
        final_interests = []
        translation_file_path = f"{config.env.translations_path}/tags/{language}.json"
        async with aiofiles.open(translation_file_path, mode='r') as translation_file:
            content = await translation_file.read()
            data = json.loads(content)
            for interest in payload.interests:
                if (interest_key := data.get(interest)) is None:
                    continue
                final_interests.append(interest)

        prefs_doc = UserPreferencesModel(
            user_id=user_id,
            location=payload.location,
            profession=payload.profession,
            interests=final_interests,
            language=language
        )
        
        prefs_insert_result = await config.db["user_preferences"].insert_one(prefs_doc.__dict__)
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Onboarding successful"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "failed",
                "message": f"An internal error occured: {e}"
            }
        )
