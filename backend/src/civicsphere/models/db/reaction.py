from pydantic import BaseModel


class IssueReaction(BaseModel):
    issue_id: str
    user_id: str
    model_config = dict(
        arbitrary_types_allowed=True,
        validate_by_name=True
    )
