from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ControlCommand(BaseModel):
    command_id: UUID = Field(default_factory=uuid4)
    desired_state: dict[str, object]
    reported_state: dict[str, object] | None = None
