from bson import ObjectId
from datetime import datetime
import httpx
import logging
from typing import Optional, List

from fastapi import APIRouter, Request, Form, File, UploadFile, Depends
from fastapi.responses import JSONResponse
from langchain_core.prompts import PromptTemplate

from ..config import AppConfig, get_config
from .post_comments import router as post_comments_router
from ..models.api.post import TrendingResponse, PostResponse
from ..models.api.post import CreatePostRequest, CreateVoicePostRequest
from ..models.api.post import CreatePostResponse
from ..services.storage import upload_user_file
from ..services.post_analyser import analyze_post_for_user
from ..services.media_processors.audio import AudioProcessor


router = APIRouter()
config: AppConfig = get_config()
router.include_router(post_comments_router, prefix="/posts/{post_id}/comments")


voice_post_template = """\
Provide appropriate title for the transcript provided in the original language:

Transcription:
{transcription}
"""


@router.post(
    "/post",
    response_model=CreatePostResponse
)
async def create_post(
    community_id: str,
    req: Request,
    tags: List[str] = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    try:
        # User authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=CreatePostResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )

        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=CreatePostResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        
        if not files or isinstance(files, str):
            files = []

        # User preferences
        user_prefs = await config.db["userPreferences"].find_one({"user_id": user_id})
        if not user_prefs or "language" not in user_prefs:
            return JSONResponse(
                status_code=400,
                content=CreatePostResponse(
                    success=False,
                    message="User preferences not found"
                ).dict()
            )
        lang = user_prefs["language"]

        # Community information
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community or "community_name" not in community:
            return JSONResponse(
                status_code=404,
                content=CreatePostResponse(
                    success=False,
                    message="Community not found"
                ).dict()
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
                "title": title,
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
                    content=CreatePostResponse(
                        success=False,
                        message=f"Moderation service error. Details: {func_response.text}"
                    ).dict()
                )

            func_result = func_response.json()
            # Extract results safely
            validation = func_result.get("validation", "Uncertain")
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content=CreatePostResponse(
                    success=False,
                    message="Failed to validate content with moderation engine"
                ).dict()
            )

        # Insert post
        post_doc = {
            "community_id": community_id,
            "user_id": user_id,
            "tags": tags,
            "upvote": 0,
            "downvote": 0,
            "title": title,
            "description": description,
            "url": uploaded_urls,
            "lang": lang,
            "location": location,
            "verified": validation,
            "flagged": flagged,
            "created_at": datetime.utcnow()
        }
        result = await config.db["posts"].insert_one(post_doc)

        return CreatePostResponse(
                success=True,
                message="Post created successfully",
                post_id=str(result.inserted_id)
            )

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return JSONResponse(
            status_code=500,
            content=CreatePostResponse(
                success=False,
                message=f"An internal error occurred: {str(e)}"
            ).dict()
        )


@router.post(
    "/post/voice",
    response_model=CreatePostResponse
)
async def create_voice_post(
    community_id: str,
    req: Request,
    form: CreateVoicePostRequest = Depends(),
    voice: UploadFile = File(...)
):
    try:
        # User authentication
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=CreatePostResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )

        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=CreatePostResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )

        # User preferences
        user_prefs = await config.db["userPreferences"].find_one({"user_id": user_id})
        if not user_prefs or "language" not in user_prefs:
            return JSONResponse(
                status_code=400,
                content=CreatePostResponse(
                    success=False,
                    message="User preferences not found"
                ).dict()
            )

        lang = user_prefs["language"]
        # Community information
        community = await config.db["communities"].find_one({"_id": ObjectId(community_id)})
        if not community or "community_name" not in community:
            return JSONResponse(
                status_code=404,
                content=CreatePostResponse(
                    success=False,
                    message="Community not found"
                ).dict()
            )

        location = community["community_name"]
        audio_processor: AudioProcessor = AudioProcessor()
        transcription = None
        try:
            transcript = await audio_processor.process_voice(lang, voice)
            transcription = transcript.get("text", None)
            if transcription is None:
                return JSONResponse(
                    status_code=400,
                    content=CreatePostResponse(
                    success=False,
                        message="No transcriptions found"
                    ).dict()
                )

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content=CreatePostResponse(
                success=False,
                    message=f"Error while transcripting text. Details: {str(e)}"
                ).dict()
            )

        try:
            client = config.langchain_llm
            transcription = transcript.get("text", None)
            chatbot_prompt = PromptTemplate(
                input_variables=["transcription"],
                template=chatbot_template
            )
            chain = chatbot_prompt | client | StrOutputParser()

            title = await chain.ainvoke({
                "transcription": transcription
            }) or "Community post"

            func_payload = {
                "title": title,
                "description": transcription
            }

            async with httpx.AsyncClient(timeout=20) as client:
                func_response = await client.post(
                    config.env.azure_function_app_url,
                    json=func_payload
                )

            if func_response.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content=CreatePostResponse(
                        success=False,
                        message=f"Moderation service error. Details: {func_response.text}"
                    ).dict()
                )

            func_result = func_response.json()
            # Extract results safely
            validation = func_result.get("validation", "Uncertain")
            flagged = func_result.get("flagged", False)

        except Exception as e:
            return JSONResponse(
                status_code=500,
                content=CreatePostResponse(
                    success=False,
                    message=f"Moderation service error. Details: {func_response.text}"
                ).dict()
            )

        # Insert post
        post_doc = {
            "community_id": community_id,
            "user_id": user_id,
            "tags": form.tags,
            "upvote": 0,
            "downvote": 0,
            "title": func_payload.get("title"),
            "description": func_payload.get("description"),
            "url": [],
            "lang": lang,
            "location": location,
            "verified": validation,
            "flagged": flagged,
            "created_at": datetime.utcnow().isoformat()
        }
        result = await config.db["posts"].insert_one(post_doc)

        return CreatePostResponse(
                success=True,
                message="Post created successfully",
                post_id=str(result.inserted_id)
            )

    except Exception as e:
        logging.error(f"Internal server error: {e}")
        return JSONResponse(
            status_code=500,
            content=CreatePostResponse(
                success=False,
                message=f"An internal error occurred: {str(e)}"
            ).dict()
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


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    community_id: str,
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


@router.get("/posts/{post_id}/translate")
async def translate_post(
    community_id: str,
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

        user = await config.db["userPreferences"].find_one({"user_id": req.state.user.get("user_id")})
        user_lang = user.get("language") or "en"

        title = post.get("title"),
        description = post.get("description"),

        if user_lang != post.get("lang"):
            response = await config.text_translator_client.translate(content=[title, description], to=[user_lang])
            translated_content = dict()
            translated_content["title"] = response[0].translations[0].text
            translated_content["description"] = response[1].translations[0].text

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "Post translated successfully",
                    "data": translated_content
                }
            )
        else:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "message": f"Internal error: {e}",
                    "data": {
                        "title": title,
                        "description": description
                    }
                }
            )


    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )



@router.get("/posts/{post_id}/explain")
async def explain_post(
    community_id: str,
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
        user = await config.db["userPreferences"].find_one({"user_id": req.state.user.get("user_id")})
        analysis = await analyze_post_for_user(
            user.get("profession"),
            user.get("location"),
            post["title"],
            post["description"],
            user.get("language")
        )
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Post analysis fetched successfully",
                "data": analysis
            }
        )

        

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )

@router.put("/posts/{post_id}/upvote")
async def upvote_post(
    community_id: str,
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

        post =await config.db["posts"].find_one({"_id": ObjectId(post_id)})
        if not post:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
        
        updated_vote = post.get("upvote", 0) + 1
        await config.db["posts"].update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"upvote": updated_vote}}
        )
        
        await config.db["postReaction"].insert_one({
            "post_id": post_id,
            "user_id": req.state.user["user_id"],
            "upvote": True
        })

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Post upvoted successfully"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )

@router.put("/posts/{post_id}/downvote")
async def downvote_post(
    community_id: str,
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

        post =await config.db["posts"].find_one({"_id": ObjectId(post_id)})
        if not post:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
        
        updated_vote = post.get("downvote", 0) + 1
        await config.db["posts"].update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"downvote": updated_vote}}
        )
        
        await config.db["postReaction"].insert_one({
            "post_id": post_id,
            "user_id": req.state.user["user_id"],
            "upvote": False
        })

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Post downvoted successfully"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )

@router.delete("/posts/{post_id}/upvote/delete")
async def remove_upvote_post(
    community_id: str,
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

        post =await config.db["posts"].find_one({"_id": ObjectId(post_id)})
        if not post:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
        
        updated_vote = post.get("upvote", 1) - 1
        await config.db["posts"].update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"upvote": updated_vote}}
        )
        
        await config.db["postReaction"].delete_one({
            "post_id": post_id,
            "user_id": req.state.user["user_id"],
            "upvote": True
        })

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Post upvote removed successfully"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )


@router.delete("/posts/{post_id}/downvote/delete")
async def remove_downvote_post(
    community_id: str,
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

        post =await config.db["posts"].find_one({"_id": ObjectId(post_id)})
        if not post:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Post not found"}
            )
        
        updated_vote = post.get("downvote", 1) - 1
        await config.db["posts"].update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"downvote": updated_vote}}
        )
        
        await config.db["postReaction"].delete_one({
            "post_id": post_id,
            "user_id": req.state.user["user_id"],
            "upvote": False
        })

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Post downvote removed successfully"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"}
        )