import aiofiles
import os
import json
import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..config import AppConfig, get_config


router = APIRouter(tags=["Tags"])

config: AppConfig = get_config()

@router.get("/{language}")
async def get_tags(
    language: str
):
    if language not in config.languages:
        logging.exception(f"Error occurred in /tags/{language}. Language {language} is not available.")
        return JSONResponse(status_code=500, detail={"success": False, "message": "The requested language is not available."})

    try:
        translation_file_path = f"{config.env.translations_path}/tags/{language}.json"
        async with aiofiles.open(translation_file_path, mode='r') as translation_file:
            content = await translation_file.read()
            data = json.loads(content)
            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "tags": data
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "failed",
                "message": f"An internal error occured: {e}"
            }
        )
