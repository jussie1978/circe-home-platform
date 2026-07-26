from __future__ import annotations

from inspect import signature
from typing import get_type_hints

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.context import ContextService, DeterministicContextBuilder, ModelContext
from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.domain import MemoryType
from app.memory.service import MemoryService
from app.providers import AIProvider, ProviderResponse


class RecordingProvider(AIProvider):
    def __init__(self, provider_id: str) -> None:
        self._provider_id = provider_id
        self.received_contexts: list[ModelContext] = []

    @property
    def provider_id(self) -> str:
        return self._provider_id

    def complete(self, context: ModelContext) -> ProviderResponse:
        self.received_contexts.append(context)
        memories = " | ".join(memory.content for memory in context.memories)
        return ProviderResponse(
            provider_id=self.provider_id,
            content=f"{self.provider_id}: {memories}",
        )


class ProviderA(RecordingProvider):
    def __init__(self) -> None:
        super().__init__("provider-a")


class ProviderB(RecordingProvider):
    def __init__(self) -> None:
        super().__init__("provider-b")


def build_context_service() -> tuple[MemoryService, ContextService]:
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


def test_switches_providers_without_losing_memory_or_personality() -> None:
    memory_service, context_service = build_context_service()
    stored_memory = memory_service.remember(
        user_id="user-1",
        content="Jussiê prefere respostas diretas e objetivas.",
        memory_type=MemoryType.PREFERENCE,
        metadata={"source": "explicit"},
        importance=0.9,
    )
    memory_service.remember(
        user_id="another-user",
        content="Memória que não pode atravessar o isolamento.",
        memory_type=MemoryType.FACT,
    )
    context = context_service.build_context(
        user_id="user-1",
        current_message="Como devo responder?",
        personality="Você é a CIRCE.",
    )
    first_provider = ProviderA()
    second_provider = ProviderB()

    first_response = first_provider.complete(context)
    second_response = second_provider.complete(context)

    assert first_provider.received_contexts == [context]
    assert second_provider.received_contexts == [context]
    assert first_provider.received_contexts[0] is second_provider.received_contexts[0]
    assert context.personality == "Você é a CIRCE."
    assert context.memories == (stored_memory,)
    assert first_response.provider_id == "provider-a"
    assert second_response.provider_id == "provider-b"
    assert stored_memory.content in first_response.content
    assert stored_memory.content in second_response.content


def test_provider_contract_accepts_only_model_context() -> None:
    parameters = list(signature(AIProvider.complete).parameters)
    type_hints = get_type_hints(AIProvider.complete)

    assert parameters == ["self", "context"]
    assert type_hints == {
        "context": ModelContext,
        "return": ProviderResponse,
    }


@pytest.mark.parametrize(
    ("provider_id", "content"),
    [
        (" ", "Resposta válida"),
        ("provider-a", ""),
    ],
)
def test_provider_response_rejects_empty_required_fields(
    provider_id: str,
    content: str,
) -> None:
    with pytest.raises(ValueError):
        ProviderResponse(provider_id=provider_id, content=content)
