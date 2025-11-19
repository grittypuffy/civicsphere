
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.user import UserPreferencesModel, User, UserDataModel,UserPreferences
from ..models.api.user import UserPreferencesRequest, UserPreferencesResponse, UserDataResponse, GetPreferencesResponse, UserPostsResponse, UserReactionsResponse
from ..models.api.post import PostResponse


router = APIRouter(tags=["Post"])

config: AppConfig = get_config()

@router.get(
    "/",
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
            post["post_id"] = post.pop("_id", None)
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
