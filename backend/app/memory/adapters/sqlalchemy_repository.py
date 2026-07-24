from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..domain import MemoryRecord, MemoryStatus, MemoryType
from ..repository import MemoryRepository
from .sqlalchemy_model import MemoryRecordModel


class SqlAlchemyMemoryRepository(MemoryRepository):
    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def add(self, memory: MemoryRecord) -> MemoryRecord:
        with self._session_factory() as session:
            session.add(self._to_model(memory))
            session.commit()
        return memory

    def get(self, memory_id: UUID) -> MemoryRecord | None:
        with self._session_factory() as session:
            model = session.get(MemoryRecordModel, str(memory_id))
            return None if model is None else self._to_domain(model)

    def list_for_user(
        self,
        user_id: str,
        *,
        memory_type: MemoryType | None = None,
        status: MemoryStatus = MemoryStatus.ACTIVE,
        limit: int = 100,
    ) -> list[MemoryRecord]:
        statement = (
            select(MemoryRecordModel)
            .where(
                MemoryRecordModel.user_id == user_id,
                MemoryRecordModel.status == status.value,
            )
            .order_by(MemoryRecordModel.updated_at.desc())
            .limit(limit)
        )
        if memory_type is not None:
            statement = statement.where(
                MemoryRecordModel.memory_type == memory_type.value
            )

        with self._session_factory() as session:
            models = session.scalars(statement).all()
            return [self._to_domain(model) for model in models]

    def update(self, memory: MemoryRecord) -> MemoryRecord:
        with self._session_factory() as session:
            model = session.get(MemoryRecordModel, str(memory.id))
            if model is None:
                raise LookupError(str(memory.id))

            model.user_id = memory.user_id
            model.memory_type = memory.memory_type.value
            model.content = memory.content
            model.metadata_json = dict(memory.metadata)
            model.importance = memory.importance
            model.confidence = memory.confidence
            model.status = memory.status.value
            model.updated_at = memory.updated_at
            session.commit()

        return memory

    def delete(self, memory_id: UUID) -> bool:
        with self._session_factory() as session:
            model = session.get(MemoryRecordModel, str(memory_id))
            if model is None:
                return False
            session.delete(model)
            session.commit()
            return True

    @staticmethod
    def _to_model(memory: MemoryRecord) -> MemoryRecordModel:
        return MemoryRecordModel(
            id=str(memory.id),
            user_id=memory.user_id,
            memory_type=memory.memory_type.value,
            content=memory.content,
            metadata_json=dict(memory.metadata),
            importance=memory.importance,
            confidence=memory.confidence,
            status=memory.status.value,
            created_at=memory.created_at,
            updated_at=memory.updated_at,
        )

    @staticmethod
    def _as_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @classmethod
    def _to_domain(cls, model: MemoryRecordModel) -> MemoryRecord:
        return MemoryRecord(
            id=UUID(model.id),
            user_id=model.user_id,
            memory_type=MemoryType(model.memory_type),
            content=model.content,
            metadata=dict(model.metadata_json or {}),
            importance=model.importance,
            confidence=model.confidence,
            status=MemoryStatus(model.status),
            created_at=cls._as_utc(model.created_at),
            updated_at=cls._as_utc(model.updated_at),
        )
