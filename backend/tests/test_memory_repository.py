import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.domain import MemoryStatus, MemoryType
from app.memory.service import MemoryService


def build_service() -> MemoryService:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
    )
    return MemoryService(SqlAlchemyMemoryRepository(session_factory))


def test_memory_lifecycle_is_provider_independent():
    service = build_service()

    saved = service.remember(
        user_id="user-1",
        content="O usuário prefere respostas objetivas.",
        memory_type=MemoryType.PREFERENCE,
        metadata={"source": "explicit"},
        importance=0.9,
    )

    recalled = service.recall("user-1")
    assert recalled == [saved]

    revised = service.revise(
        saved.id,
        content="O usuário prefere respostas objetivas durante o trabalho.",
        confidence=0.95,
    )
    assert revised.content.endswith("durante o trabalho.")
    assert revised.confidence == 0.95

    assert service.forget(saved.id) is True
    assert service.recall("user-1") == []


def test_recall_filters_memory_type_and_user():
    service = build_service()

    service.remember(
        user_id="user-1",
        content="Prefere português brasileiro.",
        memory_type=MemoryType.PREFERENCE,
    )
    service.remember(
        user_id="user-1",
        content="O projeto se chama Circe OS.",
        memory_type=MemoryType.FACT,
    )
    service.remember(
        user_id="user-2",
        content="Outra pessoa.",
        memory_type=MemoryType.FACT,
    )

    memories = service.recall("user-1", memory_type=MemoryType.FACT)

    assert len(memories) == 1
    assert memories[0].content == "O projeto se chama Circe OS."


def test_superseded_memory_is_not_returned_as_active():
    service = build_service()
    memory = service.remember(
        user_id="user-1",
        content="Usa o provedor A.",
        memory_type=MemoryType.FACT,
    )

    service.revise(memory.id, status=MemoryStatus.SUPERSEDED)

    assert service.recall("user-1") == []


def test_recall_normalizes_and_validates_user_id():
    service = build_service()
    saved = service.remember(
        user_id="user-1",
        content="Memória recuperável.",
        memory_type=MemoryType.FACT,
    )

    assert service.recall("  user-1  ") == [saved]

    with pytest.raises(ValueError, match="user_id cannot be empty"):
        service.recall(" ")
