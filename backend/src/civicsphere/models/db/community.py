from datetime import datetime
from typing import List
from pydantic import BaseModel


class Community(BaseModel):
    id: str
    community_name: str
