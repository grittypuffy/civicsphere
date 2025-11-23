import os
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from ..helpers.singleton import singleton


load_dotenv()


@singleton
class EnvVarConfig(BaseSettings):
    environment: str
    cookie_domain: str
    api_domain: str
    frontend_url: str
    mongodb_uri: str
    mongodb_db_name: str
    jwt_secret: str

    # Knowledge base and document processing
    knowledge_base_endpoint: str
    uploads_endpoint: str
    azure_storage_account_connection_string: str
    kb_container_name: str
    uploads_container_name: str
    ai_search_endpoint: str
    ai_search_api_key: str
    ai_search_index_name: str
    document_intelligence_endpoint: str
    document_intelligence_key: str

    # Azure subscription details
    azure_subscription_id: str
    azure_client_id: str
    azure_tenant_id: str
    azure_client_secret: str

    # Azure AI Service configuration
    azure_ai_project_name: str
    azure_rg_name: str
    azure_ai_endpoint: str
    azure_language_api_key: str
    azure_language_endpoint: str
    
    # STT
    azure_stt_key: str
    azure_stt_region: str

    # Azure CV
    azure_cv_key: str
    azure_cv_endpoint: str

    # Azure OpenAI configuration
    azure_openai_api_key: str
    azure_openai_endpoint: str
    azure_openai_deployment: str
    azure_openai_api_version: str
    azure_openai_model_name: str    
    translations_path: str = f"{os.getcwd()}/src/civicsphere/translations"
    tmp_upload_dir: str = "/backend/uploads"

    # Bing Search
    bing_search_api_key: str
    bing_search_endpoint: str
    
    # Function App
    azure_function_app_url: str

    class EnvVarConfig:
        env_file = ".env"
        env_file_encoding = "utf-8"


def get_env_config():
    return EnvVarConfig()