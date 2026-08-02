from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ControlCommand(BaseModel):
    command_id: UUID = Field(default_factory=uuid4)
    desired_state: dict[str, object]
    reported_state: dict[str, object] | None = None


class PhysicalControlCommand(ControlCommand):
    requested_at: datetime
    actor: Literal["user", "automation", "voice"]
    expires_at: datetime
    status: Literal["pending", "acknowledged", "failed"] = "pending"
