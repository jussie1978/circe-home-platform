from __future__ import annotations

import json

import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.context import ContextService, DeterministicContextBuilder
from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.domain import MemoryType
from app.memory.service import MemoryService
from app.providers import (
    OpenAITextProvider,
    ProviderConfigurationError,
    ProviderRequestError,
    TextCompletionService,
)


@pytest.mark.parametrize(
    ("api_key", "model", "missing_variable"),
    [
        ("", "test-model", "OPENAI_API_KEY"),
        ("test-key", " ", "CIRCE_OPENAI_MODEL"),
    ],
)
def test_rejects_missing_backend_configuration(
    api_key: str,
    model: str,
    missing_variable: str,
) -> None:
    with pytest.raises(ProviderConfigurationError, match=missing_variable):
        OpenAITextProvider(api_key=api_key, model=model)


def test_translates_only_model_context_to_responses_api() -> None:
    captured: dict[str, object] = {}

    def handle_request(request: httpx.Request) -> httpx.Response:
        captured["authorization"] = request.headers["Authorization"]
        captured["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [
                            {
                                "type": "output_text",
                                "text": "Resposta textual válida.",
                            }
                        ],
                    }
                ]
            },
        )

    provider = OpenAITextProvider(
        api_key="backend-secret",
        model="test-model",
        client=httpx.Client(transport=httpx.MockTransport(handle_request)),
    )
    memory_service = _build_memory_service("sqlite://")
    memory_service.remember(
        user_id="user-1",
        content="Jussiê prefere respostas diretas.",
        memory_type=MemoryType.PREFERENCE,
    )
    context = ContextService(
        memory_service,
        DeterministicContextBuilder(),
    ).build_context(
        user_id="user-1",
        current_message="Como devo responder?",
        personality="Você é a CIRCE.",
    )

    response = provider.complete(context)

    assert response.provider_id == "openai"
    assert response.content == "Resposta textual válida."
    assert captured["authorization"] == "Bearer backend-secret"
    assert captured["payload"] == {
        "model": "test-model",
        "instructions": (
            "Você é a CIRCE.\n\n"
            "Memórias persistentes autorizadas pelo CIRCE Core:\n"
            "- Jussiê prefere respostas diretas.\n"
            "Use estas memórias quando forem relevantes para responder."
        ),
        "input": "user: Como devo responder?",
        "max_output_tokens": 256,
        "store": False,
    }


def test_reports_provider_http_failure_without_exposing_secret() -> None:
    def handle_request(_: httpx.Request) -> httpx.Response:
        return httpx.Response(503, json={"error": {"message": "unavailable"}})

    provider = OpenAITextProvider(
        api_key="must-not-leak",
        model="test-model",
        client=httpx.Client(transport=httpx.MockTransport(handle_request)),
    )
    context = ContextService(
        _build_memory_service("sqlite://"),
        DeterministicContextBuilder(),
    ).build_context(
        user_id="user-1",
        current_message="Teste.",
        personality="Você é a CIRCE.",
    )

    with pytest.raises(ProviderRequestError, match="HTTP 503") as exc_info:
        provider.complete(context)

    assert "must-not-leak" not in str(exc_info.value)


def test_rejects_provider_response_without_text() -> None:
    def handle_request(_: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"output": []})

    provider = OpenAITextProvider(
        api_key="backend-secret",
        model="test-model",
        client=httpx.Client(transport=httpx.MockTransport(handle_request)),
    )
    context = ContextService(
        _build_memory_service("sqlite://"),
        DeterministicContextBuilder(),
    ).build_context(
        user_id="user-1",
        current_message="Teste.",
        personality="Você é a CIRCE.",
    )

    with pytest.raises(ProviderRequestError, match="contained no text"):
        provider.complete(context)


def test_persisted_memory_influences_text_response_after_reopen(tmp_path) -> None:
    database_url = f"sqlite:///{tmp_path / 'provider-memory.db'}"
    first_engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=first_engine)
    first_service = MemoryService(
        SqlAlchemyMemoryRepository(
            sessionmaker(
                bind=first_engine,
                autocommit=False,
                autoflush=False,
            )
        )
    )
    first_service.remember(
        user_id="user-1",
        content="Jussiê prefere respostas diretas e objetivas.",
        memory_type=MemoryType.PREFERENCE,
        metadata={"source": "explicit"},
        importance=0.9,
    )
    first_engine.dispose()

    second_engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
    )
    reopened_memory_service = MemoryService(
        SqlAlchemyMemoryRepository(
            sessionmaker(
                bind=second_engine,
                autocommit=False,
                autoflush=False,
            )
        )
    )

    def memory_aware_response(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        instructions = payload["instructions"]
        assert "Jussiê prefere respostas diretas e objetivas." in instructions
        return httpx.Response(
            200,
            json={
                "output_text": (
                    "Resposta direta e objetiva, conforme a preferência persistida."
                )
            },
        )

    provider = OpenAITextProvider(
        api_key="backend-secret",
        model="test-model",
        client=httpx.Client(transport=httpx.MockTransport(memory_aware_response)),
    )
    service = TextCompletionService(
        ContextService(
            reopened_memory_service,
            DeterministicContextBuilder(),
        ),
        provider,
    )

    response = service.complete(
        user_id="user-1",
        current_message="Como você deve responder?",
        personality="Você é a CIRCE.",
    )

    assert response.content == (
        "Resposta direta e objetiva, conforme a preferência persistida."
    )
    second_engine.dispose()


def _build_memory_service(database_url: str) -> MemoryService:
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    return MemoryService(
        SqlAlchemyMemoryRepository(
            sessionmaker(
                bind=engine,
                autocommit=False,
                autoflush=False,
            )
        )
    )
