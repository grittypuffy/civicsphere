from ..config import AppConfig, get_config
from fastapi import UploadFile
from ..helpers.filename import get_filename_hash
from azure.storage.blob.aio import BlobClient

config: AppConfig = get_config()


async def upload_user_file(file: UploadFile, user_id: str, post_id: str | None):
    """
    Accept File uploaded from FastAPI endpoint
    """
    file_content = await file.read()
    file_name = file.filename
    hashed_filename, digest = get_filename_hash(file_name)
    
    blob_client: BlobClient = config.uploads.get_blob_client(
        hashed_filename
    )
    await blob_client.upload_blob(
        file_content,
        overwrite=True,
        metadata={
            "user_id": user_id,
            "filename": file_name,
            "post_id": post_id,
            "id": digest,
        })
    return {"status": "success", "url": f"{config.env.uploads_endpoint}{hashed_filename}"}


async def upload_knowledge_base_file(file: UploadFile):
    """
    Upload file to knowledge base from FastAPI endpoint
    """
    file_content = await file.read()
    file_name = file.filename
    hashed_filename, digest = get_filename_hash(file_name)
    
    blob_client: BlobClient = config.knowledge_base.get_blob_client(
        hashed_filename)
    await blob_client.upload_blob(file_content, overwrite=True, metadata={
                            "filename": file_name, "id": digest})
    return {"status": "success", "url": f"{config.env.knowledge_base_endpoint}{hashed_filename}"}
