import aiofiles
import os
import json
import logging
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.user import UserPreferencesModel, User, UserDataModel,UserPreferences
from ..models.api.user import UserPreferencesRequest, UserPreferencesUpdateRequest, UserPreferencesResponse, UserDataResponse, GetPreferencesResponse

router = APIRouter(tags=["User Management"])

config: AppConfig = get_config()

@router.post(
    "/onboarding",
    response_model=UserPreferencesResponse
)
async def onboarding(
    req: Request,
    payload: UserPreferencesRequest,
    response: JSONResponse
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
        response.set_cookie(
            key="location",
            value=payload.location,
            httponly=False,
            secure=True,
            samesite="lax",
        )
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
    "/preferences",
    response_model=GetPreferencesResponse
)
async def get_preferences(
    req: Request
): 
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /preferences. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=GetPreferencesResponse(
                success=False,
                message="User is not authenticated"
            ).dict()
        )

    try:
        prefs = await config.db["userPreferences"].find_one(
            {"user_id": user_id},
            {"location": 1, "profession": 1, "interests": 1, "language": 1, "_id": 0}
        )
        logging.info("prefs:",prefs)
        if not prefs:
            return JSONResponse(
                status_code=404,
                content=GetPreferencesResponse(
                    success=False,
                    message="Preferences not found. User may not have completed onboarding."
                ).dict()
            )
        prefs_data = UserPreferences(**prefs)
        return GetPreferencesResponse(
            success=True,
            message="Successfully retrieved preferences",
            data=prefs_data
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=GetPreferencesResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )


@router.put(
    "/preferences",
    response_model=UserPreferencesResponse
)
async def update_preferences(
    req: Request,
    payload: UserPreferencesUpdateRequest,
    response: JSONResponse
):
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /preferences/update. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=UserPreferencesResponse(
                success=False,
                message="User is not authenticated"
            ).dict()
        )

    try:
        # Fetch existing preferences
        existing_prefs = await config.db["userPreferences"].find_one(
            {"user_id": user_id},
            {"location": 1, "profession": 1, "interests": 1, "language": 1, "_id": 0}
        )
        if not existing_prefs:
            return JSONResponse(
                status_code=404,
                content=UserPreferencesResponse(
                    success=False,
                    message="Preferences not found. User may not have completed onboarding."
                ).dict()
            )

        # Use existing values as defaults
        language = payload.language if payload.language is not None else existing_prefs.get("language", "en")
        if language not in config.languages:
            language = "en"
        final_interests = []
        if payload.interests is not None:
            translation_file_path = f"{config.env.translations_path}/tags/{language}.json"
            async with aiofiles.open(translation_file_path, mode='r') as translation_file:
                content = await translation_file.read()
                data = json.loads(content)
                for interest in payload.interests:
                    if (interest_key := data.get(interest)) is None:
                        continue
                    final_interests.append(interest)
        else:
            final_interests = existing_prefs.get("interests", [])

        update_data = {}
        if payload.location is not None:
            update_data["location"] = payload.location
            response.set_cookie(
                key="location",
                value=payload.location,
                httponly=False,
                secure=True,
                samesite="lax",
            )
        if payload.profession is not None:
            update_data["profession"] = payload.profession
        update_data["interests"] = final_interests
        update_data["language"] = language

        prefs_update_result = await config.db["userPreferences"].update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )

        if prefs_update_result.matched_count == 0:
            return JSONResponse(
                status_code=404,
                content=UserPreferencesResponse(
                    success=False,
                    message="Preferences not found. User may not have completed onboarding."
                ).dict()
            )

        return UserPreferencesResponse(
            success=True,
            message="Successfully updated preferences"
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserPreferencesResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )
