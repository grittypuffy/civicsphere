import aiofiles
import os
import json
import logging
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.user import UserPreferencesModel, User, UserPreferences, UserDataModel
from ..models.api.user import UserPreferencesRequest, UserPreferencesResponse, UserDataResponse

router = APIRouter(tags=["User Management"])

config: AppConfig = get_config()

@router.post(
    "/onboarding",
    response_model=UserPreferencesResponse
)
async def onboarding(
    req: Request,
    payload: UserPreferencesRequest
):
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /onboarding. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=UserPreferencesResponse(
                success=False,
                message=f"User is not authenticated"
            ).dict()
        )

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
        
        prefs_insert_result = await config.db["userPreferences"].insert_one(prefs_doc.__dict__)
        return UserPreferencesResponse(
            success=True,
            message="Successfully onboarded"
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserPreferencesResponse(
                success=False,
                message=f"An internal error occured: {e}"
            ).dict()
        )

@router.get(
    "/{username}",
    response_model=UserDataResponse
)
async def get_user_details(
    username: str
):
    try:
        user = await config.db["user"].find_one({"username": username})
        if not user:
            return JSONResponse(
                status_code=404,
                content=UserDataResponse(
                    success=False,
                    message=f"The user {username} does not exist"
                ).dict()
            )
        user.pop("password", None)
        user["user_id"] = str(user.pop("_id"))
        user_data = User(**user)
        logging.info(user_data)
        prefs = await config.db["userPreferences"].find_one(
            {
                "user_id": str(user_data.user_id)
            },
            {
                "location": 1, "profession": 1, "interests": 1, "language": 1, "_id": 0
            }
        )
        logging.info("Preferences:", prefs)
        if not prefs:
            return JSONResponse(
                status_code=500,
                content=UserDataResponse(
                    success=False,
                    message=f"An unknown error occurred while fetching {username}'s data"
                ).dict()
            )
        prefs.pop("user_id", None)
        prefs_data = UserPreferences(**prefs)
        user_details = UserDataModel(
            user=user_data,
            preferences=prefs_data
        )
        return UserDataResponse(
            success=True,
            message=f"Successfully fetched data for {username}",
            data=user_details
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserPreferencesResponse(
                success=False,
                message=f"An internal error occured: {e}"
            ).dict()
        )

