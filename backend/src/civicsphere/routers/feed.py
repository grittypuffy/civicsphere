from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.post import TrendingResponse, PostResponse

router = APIRouter(tags=["Feed"])

config: AppConfig = get_config()

@router.get(
    "/",
    response_model=TrendingResponse
)
async def get_feed_posts(
    req: Request
):
    try:
        if hasattr(req.state, 'user') and req.state.user:
            user_id = req.state.user.get("user_id")
            if user_id:
                prefs = await config.db["userPreferences"].find_one(
                    {"user_id": user_id},
                    {"interests": 1, "location": 1, "_id": 0}
                )
                if prefs:
                    interests = prefs.get("interests", [])
                    location = prefs.get("location")
                    if interests and location:
                        # Find posts matching interests and location, sorted by created_at descending (recent first)
                        posts_cursor = config.db["posts"].find({
                            "tag_id": {"$in": interests},
                            "location": location
                        }).sort("created_at", -1).limit(20)
                    else:
                        return JSONResponse(
                            status_code=400,
                            content=TrendingResponse(
                                success=False,
                                message="User interests or location not set"
                            ).dict()
                        )
                else:
                    return JSONResponse(
                        status_code=400,
                        content=TrendingResponse(
                            success=False,
                            message="User preferences not found"
                        ).dict()
                    )
            else:
                return JSONResponse(
                    status_code=401,
                    content=TrendingResponse(
                        success=False,
                        message="User not authenticated"
                    ).dict()
                )
        else:
            return JSONResponse(
                status_code=401,
                content=TrendingResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        posts = []
        async for post in posts_cursor:
            post["post_id"] = post.pop("_id", None)
            posts.append(PostResponse(**post))
        return TrendingResponse(
            success=True,
            message="Successfully fetched feed posts",
            data=posts
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=TrendingResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )
