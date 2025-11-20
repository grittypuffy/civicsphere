from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.post import CreatePostRequest
from .community_post import router as community_post_router
from datetime import datetime
from bson import ObjectId
from typing import Any

router = APIRouter(tags=["Community"])

config: AppConfig = get_config()

def _serialize_value(v: Any) -> Any:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, dict):
        return {k: _serialize_value(val) for k, val in v.items()}
    if isinstance(v, list):
        return [_serialize_value(i) for i in v]
    return v

@router.delete("/community")
async def delete_community(
    req: Request,
    community_id: str,
):
    try:
        # Check authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User ID not found"}
            )

        # Delete all the data in community
        delete_result = await config.db["communities"].delete_many({})
        if delete_result.deleted_count == 0:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "No communities found to delete"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "All communities deleted successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )

@router.post("community")
async def create_community(
    req: Request,
    community_name: str,
):
    try:
        # Check authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User ID not found"}
            )

        # Create community document
        community_doc = {
            "community_name": community_name,
        }

        # Insert into database
        result = await config.db["communities"].insert_one(community_doc)

        return JSONResponse(
            status_code=201,
            content={"success": True, "message": "Community created successfully", "community_id": str(result.inserted_id)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )

@router.get("/communities")
async def get_communities(
    req: Request,
):
    try:
        communities_cursor = config.db["communities"].find({})
        communities = []
        async for community in communities_cursor:
            communities.append(_serialize_value(community))
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Successfully fetched communities", "data": communities}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )

@router.post("/post")
async def create_post(
    community_id: str,
    req: Request,
    post_data: CreatePostRequest
):
    try:
        # Check authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User ID not found"}
            )

        # Fetch user preferences for language
        user_prefs = await config.db["userPreferences"].find_one({"user_id": user_id})
        if not user_prefs or "language" not in user_prefs:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "User preferences not found"}
            )
        lang = user_prefs["language"]

        # Fetch community for location
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community or "community_name" not in community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"}
            )
        location = community["community_name"]

        # Create post document
        post_doc = {
            "community_id": community_id,
            "user_id": user_id,
            "tag_id": post_data.tag_id,
            "upvote": 0,
            "downvote": 0,
            "title": post_data.title,
            "description": post_data.description,
            "url": post_data.url,
            "lang": lang,
            "location": location,
            "verified":True,
            "flagged": False,
            "created_at": datetime.utcnow().isoformat()
        }

        # Insert into database
        result = await config.db["posts"].insert_one(post_doc)

        return JSONResponse(
            status_code=201,
            content={"success": True, "message": "Post created successfully", "post_id": str(result.inserted_id)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )

@router.delete("/posts")
async def delete_user_posts(
    req: Request,
    
):
    try:
        # Check authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User ID not found"}
            )

        # Delete all posts
        delete_result = await config.db["posts"].delete_many({})
        if delete_result.deleted_count == 0:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "No posts found to delete"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "All posts deleted successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )