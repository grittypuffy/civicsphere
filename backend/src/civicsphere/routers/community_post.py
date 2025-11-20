from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.post import TrendingResponse, PostResponse

router = APIRouter(tags=["Community_Post"])

config: AppConfig = get_config()

