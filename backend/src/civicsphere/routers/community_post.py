from fastapi import APIRouter, Request, Form, File, UploadFile, Depends
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from typing import Optional, List
from ..models.api.post import TrendingResponse, PostResponse
from ..models.api.post import CreatePostRequest
from datetime import datetime
from bson import ObjectId
from ..services.storage import upload_user_file
import httpx
import logging


router = APIRouter(tags=["Community_Post"])

config: AppConfig = get_config()

@router.post("/post")
async def create_post(
    community_id: str,
    req: Request,
    form: CreatePostRequest = Depends(),
    files: Optional[List[UploadFile]] = File(None)
):
    try:
        # User authentication
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

        
        if not files or isinstance(files, str):
            files = []

        # User preferences
        user_prefs = await config.db["userPreferences"].find_one({"user_id": user_id})
        if not user_prefs or "language" not in user_prefs:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "User preferences not found"}
            )
        lang = user_prefs["language"]

        # Community information
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community or "community_name" not in community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"}
            )
        location = community["community_name"]

        # Upload files
        uploaded_urls = []
        for file in files:
            upload_result = await upload_user_file(file, user_id=user_id)
            uploaded_urls.append(upload_result["url"])

        # Response moderation
        try:
            func_payload = {
                "title": form.title,
                "description": form.description
            }

            async with httpx.AsyncClient(timeout=20) as client:
                func_response = await client.post(
                    config.env.azure_function_app_url,
                    json=func_payload
                )

            if func_response.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content={
                        "success": False,
                        "message": "Moderation service error",
                        "details": func_response.text
                    }
                )

            func_result = func_response.json()
            # Extract results safely
            validation = func_result.get("validation", "Uncertain")
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Failed to validate content with moderation engine"}
            )

        # Insert post
        post_doc = {
            "community_id": community_id,
            "user_id": user_id,
            "tags": form.tags,
            "upvote": 0,
            "downvote": 0,
            "title": form.title,
            "description": form.description,
            "url": uploaded_urls,
            "lang": lang,
            "location": location,
            "verified": validation,  # FIXED
            "flagged": flagged,
            "created_at": datetime.utcnow()
        }
        result = await config.db["posts"].insert_one(post_doc)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Post created successfully",
                "post_id": str(result.inserted_id)
            }
        )

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )

@router.post("/post/voice")
async def create_voice_post(
    community_id: str,
    req: Request,
    form: CreateVoicePostRequest = Depends(),
):
    try:
        # User authentication
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

        # User preferences
        user_prefs = await config.db["userPreferences"].find_one({"user_id": user_id})
        if not user_prefs or "language" not in user_prefs:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "User preferences not found"}
            )
        lang = user_prefs["language"]

        # Community information
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community or "community_name" not in community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"}
            )
        location = community["community_name"]

        # Response moderation
        try:
            func_payload = {
                "title": form.title,
                "description": form.description
            }

            async with httpx.AsyncClient(timeout=20) as client:
                func_response = await client.post(
                    config.env.azure_function_app_url,
                    json=func_payload
                )

            if func_response.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content={
                        "success": False,
                        "message": "Moderation service error",
                        "details": func_response.text
                    }
                )

            func_result = func_response.json()
            # Extract results safely
            validation = func_result.get("validation", "Uncertain")
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Failed to validate content with moderation engine"}
            )

        # Insert post
        post_doc = {
            "community_id": community_id,
            "user_id": user_id,
            "tags": form.tags,
            "upvote": 0,
            "downvote": 0,
            "title": form.title,
            "description": form.description,
            "url": [],
            "lang": lang,
            "location": location,
            "verified": validation,  # FIXED
            "flagged": flagged,
            "created_at": datetime.utcnow().isoformat()
        }
        result = await config.db["posts"].insert_one(post_doc)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Post created successfully",
                "post_id": str(result.inserted_id)
            }
        )

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )


@router.get("/posts")
async def get_community_posts(
    community_id: str,
    req: Request
):
    try:
        # Auth check
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )

        # Validate community
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"}
            )

        posts_cursor = config.db["posts"].find(
            {"community_id": community_id}
        )

        posts = []
        async for post in posts_cursor:
            post["post_id"] = str(post.pop("_id"))
            posts.append(PostResponse(**post))
        posts.sort(key=lambda x: x.created_at, reverse=True)
        return TrendingResponse(
            success=True,
            message="Community posts fetched successfully",
            data=posts
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    req: Request
):
    try:
        # Auth check
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"}
            )

        post = await config.db["posts"].find_one({"_id": ObjectId(post_id)})

        if not post:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )

        post["post_id"] = str(post.pop("_id"))
        return PostResponse(**post)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )
