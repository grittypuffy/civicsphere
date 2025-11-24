from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
import logging
from ..models.db.comments import Comment, CommentReply
from ..models.api.comments import CommentType, CommentResponse
import httpx
from bson import ObjectId

router = APIRouter(tags=["Post_Comments"])

config: AppConfig = get_config()

@router.post("")
async def add_comment(
    post_id:str,
    description:str,
    req: Request
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
        post_obj_id = ObjectId(post_id)
        posts_cursor = await config.db["posts"].find_one({"_id": post_obj_id})
        if not posts_cursor:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
            
        try:
            func_payload = {
                "title": "Comment",
                "description": description
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
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Failed to validate content with moderation engine"}
            )
        # Create comment object
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            description=description,
            flagged=flagged,
            comments=[]
        )
        result = await config.db["comments"].insert_one(comment.dict())
        return JSONResponse(
            status_code=201,
            content={"success": True, "message": "Comment added successfully", "comment_id": str(result.inserted_id)}
        )
    
    except Exception as e:
        logging.error(f"Error in user authentication: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error during authentication"}
        )

@router.post("/{comment_id}/reply")
async def add_comment_reply(
    post_id:str,
    comment_id:str,
    description:str,
    req: Request
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
        comment_cursor = await config.db["comments"].find_one({"_id": ObjectId(comment_id)})
        if not comment_cursor:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Comment not found"}
            )
        if comment_cursor["post_id"] != post_id:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Comment does not belong to the specified post"}
            )
        try:
            func_payload = {
                "title": "Comment",
                "description": description
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
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"success": False, "message": "Failed to validate content with moderation engine"}
            )
        commet= CommentReply(
             user_id=user_id,
            description=description,
            flagged=flagged
        )
        result = await config.db["comments"].update_one(
            {"_id": ObjectId(comment_id)},
            {"$push": {"comments": commet.dict()}}
        )
        return JSONResponse(
            status_code=201,
            content={"success": True, "message": "Reply added successfully"}
        )
    except Exception as e:
        logging.error(f"Error in user authentication: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error during authentication"}
        )

@router.get("")
async def get_post_comments(
    post_id:str,
    req: Request
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
        post_obj_id = ObjectId(post_id)
        posts_cursor = await config.db["posts"].find_one({"_id": post_obj_id})
        if not posts_cursor:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
        comments_cursor = config.db["comments"].find({"post_id": post_id})
        comments = []
        async for comment in comments_cursor:
            comment["id"] = str(comment.pop("_id"))
            comments.append(CommentType(**comment))
        return CommentResponse(
            success=True,
            message="Comments fetched successfully",
            comments=comments
        )
    except Exception as e:
        logging.error(f"Error fetching comments: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error while fetching comments"}
        )