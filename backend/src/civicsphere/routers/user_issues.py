
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.user import UserReactionsResponse
from ..models.api.post import PostResponse,UserPostsResponse
from ..models.api.issue import IssueResponse, UserIssuesResponse


router = APIRouter(tags=["User-Issue"])

config: AppConfig = get_config()

@router.get(
    "/",
    response_model=UserIssuesResponse
)
async def get_user_issue(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserPostsResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=UserIssuesResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        issues_cursor = config.db["issues"].find({"user_id": user_id}).sort("created_at", -1)
        issues = []
        async for issue in issues_cursor:
            issue["issue_id"] = issue.pop("_id", None)
            issues.append(PostResponse(**issue))
        return UserIssuesResponse(
            success=True,
            message="Successfully fetched user issues",
            data=issues
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserIssuesResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )


@router.get(
    "/upvotes",
    response_model=UserReactionsResponse
)
async def get_user_upvotes(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User not authenticated"
                ).dict()
            )
        user_id = req.state.user.get("user_id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content=UserReactionsResponse(
                    success=False,
                    message="User ID not found"
                ).dict()
            )
        reactions_cursor = config.db["issue_reactions"].find({"user_id": user_id})
        issue_ids = []
        async for reaction in reactions_cursor:
            issue_ids.append(reaction[" issue_id"])
        return UserReactionsResponse(
            success=True,
            message="Successfully fetched user issue  upvotes",
            data= issue_ids
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UserReactionsResponse(
                success=False,
                message=f"An internal error occurred: {e}"
            ).dict()
        )


