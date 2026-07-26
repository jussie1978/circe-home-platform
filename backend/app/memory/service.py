from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from .domain import MemoryRecord, MemoryStatus, MemoryType
from .repository import MemoryRepository


class MemoryNotFoundError(LookupError):
    pass


class MemoryService:
    def __init__(self, repository: MemoryRepository) -> None:
        self._repository = repository

    def remember(
        self,
        *,
        user_id: str,
        content: str,
        memory_type: MemoryType,
        metadata: dict[str, Any] | None = None,
        importance: float = 0.5,
        confidence: float = 1.0,
    ) -> MemoryRecord:
        memory = MemoryRecord(
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            metadata=metadata or {},
            importance=importance,
            confidence=confidence,
        )
        return self._repository.add(memory)

    def recall(
        self,
        user_id: str,
        *,
        memory_type: MemoryType | None = None,
        limit: int = 100,
    ) -> list[MemoryRecord]:
        if limit < 1 or limit > 500:
            raise ValueError("limit must be between 1 and 500")
        normalized_user_id = user_id.strip()
        if not normalized_user_id:
            raise ValueError("user_id cannot be empty")

        return self._repository.list_for_user(
            normalized_user_id,
            memory_type=memory_type,
            limit=limit,
        )

    def revise(
        self,
        memory_id: UUID,
        *,
        content: str | None = None,
        metadata: dict[str, Any] | None = None,
        importance: float | None = None,
        confidence: float | None = None,
        status: MemoryStatus | None = None,
    ) -> MemoryRecord:
        current = self._repository.get(memory_id)
        if current is None:
            raise MemoryNotFoundError(str(memory_id))

        updated = replace(
            current,
            content=current.content if content is None else content,
            metadata=current.metadata if metadata is None else metadata,
            importance=current.importance if importance is None else importance,
            confidence=current.confidence if confidence is None else confidence,
            status=current.status if status is None else status,
            updated_at=datetime.now(timezone.utc),
        )
        return self._repository.update(updated)

    def forget(self, memory_id: UUID) -> bool:
        return self._repository.delete(memory_id)
