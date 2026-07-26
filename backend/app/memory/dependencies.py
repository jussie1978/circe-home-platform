from __future__ import annotations

from .adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from .service import MemoryService
from ..database import SessionLocal


def get_memory_service() -> MemoryService:
    repository = SqlAlchemyMemoryRepository(SessionLocal)
    return MemoryService(repository)
