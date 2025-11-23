import aiofiles
import logging
import os
import datetime
from typing import Dict
from fastapi import UploadFile, File
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.storage.blob.aio import BlobClient, ContainerClient
from ...config import get_config, AppConfig
from ...helpers.singleton import singleton
from ...helpers.service import get_storage_client
from ...helpers.filename import get_filename_hash

cv_languages = ["ar", "de", "el", "en", "es", "fr", "hi", "it", "ja", "ko", "pl", "pt", "ru", "zh"]

config: AppConfig = get_config()


@singleton
class ImageProcessor:
    def __init__(self):
        self.uploads_container: ContainerClient = get_storage_client(
            config.env.st_connection_string,
            config.env.uploads_container
        )


    async def write_image(self, file: UploadFile = File(...)) -> (str, str) | None:
        file_content: bytes = await file.read()
        try:
            img = Image.open(io.BytesIO(file_content))
        except Exception as e:
            raise e

        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        date_now = str(datetime.datetime.now())
        hashed_filename, digest = get_filename_hash(date_now, file_extension=".webp")
        file_path = os.path.join(config.env.tmp_upload_dir, hashed_filename)
        img.save(file_path, "WEBP", quality=100)

        if os.path.exists(file_path):
            return file_path, hashed_filename
        return None, None


    async def upload_post_image(self, webp_file_path: str, hashed_filename: str, post_id: str, language_code: str = "en"):
        blob_client: BlobClient = self.uploads_container.get_blob_client(f"post/image/{hashed_filename}")
        async with aiofiles.open(webp_file_path, mode='wb') as image_file:
            await blob_client.upload_blob(
                image_file,
                overwrite=True
            )
        return blob_client.url

    async def get_description(self, image_url: str, language_code: str = "en"):
        try:
            description = await config.image_analysis_client.analyze_from_url(
                image_url,
                visual_features=[VisualFeatures.CAPTION]
            )
            return {
                "lang": language_code,
                "alt": description
            }, None
        except Exception as e:
            return {
                "lang": language_code,
                "alt": ""
            }, e

    async def process_post_image(self, language_code: str = "en", file: UploadFile = File(...)):
        if language_code not in cv_languages:
            language_code = "en"

        file_path, hashed_filename = await self.write_image(file)
        if not file_path:
            raise Exception("Image file is not written in .webp format")
        blob_url = await self.upload_voice(webp_file_path, hashed_filename)
        return transcription
