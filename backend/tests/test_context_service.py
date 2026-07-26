import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.context import (
    ContextService,
    ConversationRole,
    ConversationTurn,
    DeterministicContextBuilder,
    ToolDefinition,
)
from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.domain import MemoryStatus, MemoryType
from app.memory.service import MemoryService


def build_services() -> tuple[MemoryService, ContextService]:
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
    memory_service = MemoryService(SqlAlchemyMemoryRepository(session_factory))
    context_service = ContextService(
        memory_service,
        DeterministicContextBuilder(),
    )
    return memory_service, context_service


def test_builds_context_with_recalled_memory_and_received_inputs() -> None:
    memory_service, context_service = build_services()
    stored_memory = memory_service.remember(
        user_id="user-1",
        content="O projeto se chama Circe OS.",
        memory_type=MemoryType.FACT,
        importance=0.9,
    )
    history = (ConversationTurn(ConversationRole.USER, "Mensagem anterior"),)
    tools = (ToolDefinition("desk_status", "Consulta o estado da mesa."),)

    result = context_service.build_context(
        user_id="user-1",
        current_message="Qual é o projeto?",
        personality="Você é a CIRCE.",
        recent_history=history,
        tools=tools,
    )

    assert result.personality == "Você é a CIRCE."
    assert result.recent_history == history
    assert result.memories == (stored_memory,)
    assert result.tools == tools
    assert result.current_message == "Qual é o projeto?"


def test_isolates_memories_by_user() -> None:
    memory_service, context_service = build_services()
    user_memory = memory_service.remember(
        user_id="user-1",
        content="Memória do usuário correto.",
        memory_type=MemoryType.FACT,
    )
    memory_service.remember(
        user_id="user-2",
        content="Memória de outro usuário.",
        memory_type=MemoryType.FACT,
    )

    result = context_service.build_context(
        user_id="user-1",
        current_message="Continue.",
        personality="Personalidade do Core.",
    )

    assert result.memories == (user_memory,)


def test_excludes_superseded_and_deleted_memories() -> None:
    memory_service, context_service = build_services()
    active = memory_service.remember(
        user_id="user-1",
        content="Memória vigente.",
        memory_type=MemoryType.DECISION,
    )
    superseded = memory_service.remember(
        user_id="user-1",
        content="Decisão substituída.",
        memory_type=MemoryType.DECISION,
    )
    deleted = memory_service.remember(
        user_id="user-1",
        content="Memória removida.",
        memory_type=MemoryType.FACT,
    )
    memory_service.revise(superseded.id, status=MemoryStatus.SUPERSEDED)
    memory_service.revise(deleted.id, status=MemoryStatus.DELETED)

    result = context_service.build_context(
        user_id="user-1",
        current_message="Qual decisão está vigente?",
        personality="Personalidade do Core.",
    )

    assert result.memories == (active,)


def test_normalizes_user_id_before_memory_retrieval() -> None:
    memory_service, context_service = build_services()
    stored_memory = memory_service.remember(
        user_id="user-1",
        content="Memória persistida.",
        memory_type=MemoryType.FACT,
    )

    result = context_service.build_context(
        user_id="  user-1  ",
        current_message="Continue.",
        personality="Personalidade do Core.",
    )

    assert result.memories == (stored_memory,)


def test_rejects_empty_user_id() -> None:
    _, context_service = build_services()

    with pytest.raises(ValueError, match="user_id cannot be empty"):
        context_service.build_context(
            user_id=" ",
            current_message="Continue.",
            personality="Personalidade do Core.",
        )
