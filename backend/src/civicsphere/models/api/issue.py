from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel


class IssueResponse(BaseModel):
    community_id: str
    issue_id: str
    user_id: str
    title: str
    description: str
    upvote: int
    status: Literal["Open", "Closed", "Resolved"]
    created_at: datetime



class UserIssuesResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[IssueResponse]] = None


class CreateIssueRequest(BaseModel):
    community_id: str
    title: str
    description: str
    status: Literal["Open", "Closed", "Resolved"] = "Open"