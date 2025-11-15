from fastapi import APIRouter

from ..auth import router as auth_router
from ..case import router as case_router
from ..gis import router as gis_router
from ..chat import router as chat_router
from ..report import router as report_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth")
router.include_router(chatbot_router, prefix="/chatbot")
