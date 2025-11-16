from fastapi import APIRouter

from ..auth import router as auth_router
from ..chat import router as chat_router
from ..tag import router as tag_router
from ..user import router as user_router


router = APIRouter()

router.include_router(auth_router, prefix="/auth")
router.include_router(chat_router, prefix="/chat")
router.include_router(tag_router, prefix="/tag")
router.include_router(user_router, prefix="/user")
