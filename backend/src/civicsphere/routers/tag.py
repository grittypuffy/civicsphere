import aiofiles
import os
import json
from enum import Enum
import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.tag import TagResponse

router = APIRouter(tags=["Tags"])

config: AppConfig = get_config()

LanguageEnum = Enum("LanguageEnum", {lang: lang for lang in config.languages})

@router.get(
    "/{language}",
    response_model=TagResponse
)
async def get_tags(
    language: LanguageEnum
):
    lang_value = language.value
    if lang_value not in config.languages:
        logging.exception(f"Error occurred in /tag/{lang_value}. Language {lang_value} is not available.")
        return JSONResponse(
            status_code=500,
            content=TagResponse(
                success=False,
                message="The requested language is not available."
            ).dict()
        )

    try:
        translation_file_path = f"{config.env.translations_path}/tags/{lang_value}.json"
        async with aiofiles.open(translation_file_path, mode='r') as translation_file:
            content = await translation_file.read()
            data = json.loads(content)
            return TagResponse(
                success=True,
                message=f"Successfuly fetched tags in {lang_value}",
                tags=data
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=TagResponse(
                success=False,
                message=f"An internal error occured while fetching tags: {e}"
            ).dict()
        )
