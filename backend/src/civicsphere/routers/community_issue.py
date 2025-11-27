from datetime import datetime
from bson import ObjectId
import logging
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ..config import AppConfig, get_config
from ..models.api.issue import (
    IssueResponseSingle,
    Issue,
    CreateIssueRequest,
    IssueResponse,
)


router = APIRouter(tags=["Community Issue"])
config: AppConfig = get_config()


@router.get("/all")
async def get_community_issue(community_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        # Validate community
        community = await config.db["communities"].find_one(
            {"_id": ObjectId(community_id)}
        )
        if not community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"},
            )

        issues_cursor = config.db["issue"].find({"community_id": community_id})

        issues = []
        async for issue in issues_cursor:
            issue["issue_id"] = str(issue.pop("_id"))
            issues.append(Issue(**issue))
        issues.sort(key=lambda x: x.created_at, reverse=True)
        return IssueResponse(
            success=True, message="Community issues fetched successfully", data=issues
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.get("/{issue_id}", response_model=IssueResponseSingle)
async def get_issue(community_id: str, issue_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        issue = await config.db["issue"].find_one({"_id": ObjectId(issue_id)})
        if not issue:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Issue not found"},
            )

        issue["issue_id"] = str(issue.pop("_id"))
        return IssueResponseSingle(
            success=True, message="Issue fetched successfully", data=Issue(**issue)
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.post("")
async def create_issue(
    community_id: str, issue_request: CreateIssueRequest, req: Request
):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        # Validate community
        community = await config.db["communities"].find_one(
            {"_id": ObjectId(community_id)}
        )
        if not community:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Community not found"},
            )

        new_issue = issue_request.dict()
        new_issue["community_id"] = community_id
        new_issue["user_id"] = req.state.user["user_id"]
        new_issue["created_at"] = datetime.utcnow()
        new_issue["upvote"] = 0

        result = await config.db["issue"].insert_one(new_issue)
        new_issue["issue_id"] = str(result.inserted_id)

        return IssueResponseSingle(
            success=True, message="Issue created successfully", data=Issue(**new_issue)
        )

    except Exception as e:
        logging.error(f"Error creating issue: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.put("/{issue_id}/upvote")
async def upvote_issue(community_id: str, issue_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        issue = await config.db["issue"].find_one({"_id": ObjectId(issue_id)})
        if not issue:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Issue not found"},
            )

        updated_upvote = issue.get("upvote", 0) + 1
        await config.db["issue"].update_one(
            {"_id": ObjectId(issue_id)}, {"$set": {"upvote": updated_upvote}}
        )

        await config.db["issueReaction"].insert_one(
            {"issue_id": issue_id, "user_id": req.state.user["user_id"]}
        )

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Issue upvoted successfully"},
        )

    except Exception as e:
        logging.error(f"Error upvoting issue: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.delete("/{issue_id}/upvote/delete")
async def remove_upvote_issue(community_id: str, issue_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        issue = await config.db["issue"].find_one({"_id": ObjectId(issue_id)})
        if not issue:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Issue not found"},
            )

        updated_upvote = issue.get("upvote", 1) - 1
        await config.db["issue"].update_one(
            {"_id": ObjectId(issue_id)}, {"$set": {"upvote": updated_upvote}}
        )

        await config.db["issueReaction"].delete_one(
            {"issue_id": issue_id, "user_id": req.state.user["user_id"]}
        )

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Issue upvoted removed successfully"},
        )

    except Exception as e:
        logging.error(f"Error upvoting issue: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.put("/{issue_id}/resolve")
async def resolve_issue(community_id: str, issue_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        issue = await config.db["issue"].find_one({"_id": ObjectId(issue_id)})
        if not issue:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Issue not found"},
            )
        if issue.get("status") == "Open":
            await config.db["issue"].update_one(
                {"_id": ObjectId(issue_id)}, {"$set": {"status": "Resolved"}}
            )

            return JSONResponse(
                status_code=200,
                content={"success": True, "message": "Issue resolved successfully"},
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "Only open issues can be resolved",
                },
            )

    except Exception as e:
        logging.error(f"Error resolving issue: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )


@router.put("/{issue_id}/close")
async def close_issue(community_id: str, issue_id: str, req: Request):
    try:
        # Auth check
        if not hasattr(req.state, "user") or not req.state.user:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "User not authenticated"},
            )

        issue = await config.db["issue"].find_one({"_id": ObjectId(issue_id)})
        if not issue:
            return JSONResponse(
                status_code=404,
                content={"success": False, "message": "Issue not found"},
            )
        if issue.get("status") == "Resolved" and req.state.user["user_id"] == issue.get(
            "user_id"
        ):
            await config.db["issue"].update_one(
                {"_id": ObjectId(issue_id)}, {"$set": {"status": "Closed"}}
            )

            return JSONResponse(
                status_code=200,
                content={"success": True, "message": "Issue closed successfully"},
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "Only the issue creator can close a resolved issue",
                },
            )

    except Exception as e:
        logging.error(f"Error closing issue: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Internal error: {e}"},
        )
