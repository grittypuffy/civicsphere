import logging
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.db.post import Post
from ..models.api.post import TrendingResponse, PostResponse

router = APIRouter(tags=["Trending"])

config: AppConfig = get_config()

@router.get(
    "/",
    response_model=TrendingResponse
)
async def get_trending_posts(
    req: Request
):
    try:
        location = req.cookies.get("location")
        if location:
            posts_cursor = config.db["posts"].find({"location": location}).sort("upvote", -1).limit(10)
        else:
            # If no location cookie, get user_id from request.state.user and fetch location from db
            if hasattr(req.state, 'user') and req.state.user:
                user_id = req.state.user.get("user_id")
                if user_id:
                    prefs = await config.db["userPreferences"].find_one(
                        {"user_id": user_id},
                        {"location": 1, "_id": 0}
                    )
                    if prefs and "location" in prefs:
                        location = prefs["location"]
                        posts_cursor = config.db["posts"].find({"location": location}).sort("upvote", -1).limit(10)
                    else:
                        return JSONResponse(
                            status_code=400,
                            content=TrendingResponse(
                                success=False,
                                message="User location not set"
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
            post["post_id" ] = post.pop("_id", None)
            posts.append(PostResponse(**post))
        return TrendingResponse(
            success=True,
            message="Successfully fetched trending posts",
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


@router.get(
    "/analytics",
    response_model=TrendingResponse
)
async def get_topic_analytics(req: Request):
    try:
        location = req.cookies.get("location")

        if not location:
            if hasattr(req.state, 'user') and req.state.user:
                user_id = req.state.user.get("user_id")
                if user_id:
                    prefs = await config.db["userPreferences"].find_one(
                        {"user_id": user_id},
                        {"location": 1, "_id": 0}
                    )
                    if prefs and "location" in prefs:
                        location = prefs["location"]
                    else:
                        return JSONResponse(
                            status_code=400,
                            content=TrendingResponse(
                                success=False,
                                message="User location not set"
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

        week_ago = datetime.utcnow() - timedelta(days=7)
        pipeline = [
            {"$match": {
                "location": location,
                "created_at": {"$gte": week_ago}
            }},
            {"$unwind": "$tags"},
            {"$group": {
                "_id": "$tags",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]

        results = await config.db["posts"].aggregate(pipeline).to_list(length=10)

        analytics = [
            {"tag": item["_id"], "count": item["count"]}
            for item in results
        ]

        return TrendingResponse(
            success=True,
            message="Successfully fetched trending analytics",
            data=analytics
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=TrendingResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )
