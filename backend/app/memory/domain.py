from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any
from uuid import UUID, uuid4


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MemoryType(StrEnum):
    PREFERENCE = "preference"
    FACT = "fact"
    EPISODE = "episode"
    DECISION = "decision"


class MemoryStatus(StrEnum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    DELETED = "deleted"


@dataclass(frozen=True, slots=True)
class MemoryRecord:
    content: str
    memory_type: MemoryType
    user_id: str
    id: UUID = field(default_factory=uuid4)
    metadata: dict[str, Any] = field(default_factory=dict)
    importance: float = 0.5
    confidence: float = 1.0
    status: MemoryStatus = MemoryStatus.ACTIVE
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    def __post_init__(self) -> None:
        normalized_content = self.content.strip()
        normalized_user_id = self.user_id.strip()

        if not normalized_content:
            raise ValueError("memory content cannot be empty")
        if not normalized_user_id:
            raise ValueError("user_id cannot be empty")
        if not 0.0 <= self.importance <= 1.0:
            raise ValueError("importance must be between 0.0 and 1.0")
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0")

        object.__setattr__(self, "content", normalized_content)
        object.__setattr__(self, "user_id", normalized_user_id)
