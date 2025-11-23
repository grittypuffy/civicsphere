from datetime import datetime
from typing import List, Optional,Literal
from pydantic import BaseModel


class Issue(BaseModel):
    community_id: str
    issue_id: str
    user_id: str
    upvote: int = 0
    title: str
    description: str
    status: Literal["Open", "Resolved", "Closed"] = "Open"
    created_at: datetime

    model_config = dict(
        arbitrary_types_allowed=True,
        validate_by_name=True
    )
