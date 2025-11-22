from pydantic import BaseModel
from typing import Dict, Optional

class TagResponse(BaseModel):
    success: bool
    tags: Optional[Dict[str, str]] = None
    message: str