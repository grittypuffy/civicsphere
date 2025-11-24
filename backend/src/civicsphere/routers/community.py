from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from .community_post import router as community_post_router
from .community_issue import router as community_issue_router


router = APIRouter(tags=["Community"])

router.include_router(community_post_router, prefix="/{community_id}")
router.include_router(community_issue_router, prefix="/{community_id}/issues")

config: AppConfig = get_config()

@router.get("/communities")
async def get_communities(
    req: Request,
):
    try:
        communities_cursor = config.db["communities"].find({})
        communities = []
        async for community in communities_cursor:
            community["_id"] = str(community["_id"])
            communities.append(community)
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Successfully fetched communities", "data": communities}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"An internal error occurred: {str(e)}"}
        )



