
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.user import UserReactionsResponse
from ..models.api.post import UserPostsResponse
from ..models.api.issue import Issue, UserIssuesResponse


router = APIRouter(tags=["User-Issue"])

config: AppConfig = get_config()

@router.get(
    "",
    response_model=UserIssuesResponse
)
async def get_user_issue(
    req: Request
):
    try:
        if not hasattr(req.state, 'user') or not req.state.user:
            return JSONResponse(
                status_code=401,
                content=UserIssuesResponse(
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
        issues_cursor = config.db["issue"].find({"user_id": user_id})
        issues = []
        async for issue in issues_cursor:
            issue["issue_id"] = str(issue.pop("_id"))
            issues.append(Issue(**issue))
        issues.sort(key=lambda x: x.created_at, reverse=True)
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
        reactions_cursor = config.db["issue_reaction"].find({"user_id": user_id})
        issue_ids = []
        async for reaction in reactions_cursor:
            issue_ids.append(str(reaction["issue_id"]))
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


