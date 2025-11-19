import logging
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.user import UserPreferencesModel, User, UserDataModel,UserPreferences
from ..models.api.user import UserPreferencesRequest, UserPreferencesResponse, UserDataResponse, GetPreferencesResponse, UserPostsResponse, UserReactionsResponse
from ..models.api.post import PostResponse
from .user_post import router as post_router

router = APIRouter(tags=["User"])

config: AppConfig = get_config()

router.include_router(post_router,prefix="/posts")

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



