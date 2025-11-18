import logging
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.user import UserPreferencesModel, User, UserDataModel,UserPreferences
from ..models.api.user import UserPreferencesRequest, UserPreferencesResponse, UserDataResponse, GetPreferencesResponse, UserPostsResponse, UserReactionsResponse
from ..models.api.post import PostResponse

router = APIRouter(tags=["User"])

config: AppConfig = get_config()

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


@router.get(
    "/posts",
    response_model=UserPostsResponse
)
async def get_user_posts(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserPostsResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=UserPostsResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        posts_cursor = config.db["posts"].find({"user_id": user_id}).sort("created_at", -1)
        posts = []
        async for post in posts_cursor:
            post.pop("_id", None)
            posts.append(PostResponse(**post))
        return UserPostsResponse(
            success=True,
            message="Successfully fetched user posts",
            data=posts
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserPostsResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )


@router.get(
    "/upvotes",
    response_model=UserReactionsResponse
)
async def get_user_upvotes(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        reactions_cursor = config.db["post_reactions"].find({"user_id": user_id, "upvote": True})
        post_ids = []
        async for reaction in reactions_cursor:
            post_ids.append(reaction["post_id"])
        return UserReactionsResponse(
            success=True,
            message="Successfully fetched user upvotes",
            data=post_ids
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserReactionsResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )


@router.get(
    "/downvotes",
    response_model=UserReactionsResponse
)
async def get_user_downvotes(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        reactions_cursor = config.db["post_reactions"].find({"user_id": user_id, "upvote": False})
        post_ids = []
        async for reaction in reactions_cursor:
            post_ids.append(reaction["post_id"])
        return UserReactionsResponse(
            success=True,
            message="Successfully fetched user downvotes",
            data=post_ids
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserReactionsResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )
