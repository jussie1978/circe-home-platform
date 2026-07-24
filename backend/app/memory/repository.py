from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from .domain import MemoryRecord, MemoryStatus, MemoryType


class MemoryRepository(ABC):
    @abstractmethod
    def add(self, memory: MemoryRecord) -> MemoryRecord:
        raise NotImplementedError

    @abstractmethod
    def get(self, memory_id: UUID) -> MemoryRecord | None:
        raise NotImplementedError

    @abstractmethod
    def list_for_user(
        self,
        user_id: str,
        *,
        memory_type: MemoryType | None = None,
        status: MemoryStatus = MemoryStatus.ACTIVE,
        limit: int = 100,
    ) -> list[MemoryRecord]:
        raise NotImplementedError

    @abstractmethod
    def update(self, memory: MemoryRecord) -> MemoryRecord:
        raise NotImplementedError

    @abstractmethod
    def delete(self, memory_id: UUID) -> bool:
        raise NotImplementedError
