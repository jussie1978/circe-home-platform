import json
import logging
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import (
    LOCAL_FRONTEND_ORIGINS,
    OPENAI_REALTIME_URL,
    VOICE_SESSION_RATE_LIMIT,
    app,
    voice_session_attempts,
)


@pytest.fixture(autouse=True)
def reset_voice_session_rate_limit():
    voice_session_attempts.clear()
    yield
    voice_session_attempts.clear()


def _local_test_client(origin=LOCAL_FRONTEND_ORIGINS[0]):
    return TestClient(
        app,
        client=("127.0.0.1", 50000),
        headers={"Origin": origin},
    )


def _mock_async_client(response):
    client = AsyncMock()
    client.post.return_value = response
    context = MagicMock()
    context.__aenter__ = AsyncMock(return_value=client)
    context.__aexit__ = AsyncMock(return_value=None)
    return context, client


def test_voice_session_forwards_sdp_and_server_side_configuration(monkeypatch, caplog):
    caplog.set_level(logging.INFO, logger="IRIS_BACKEND")
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")
    openai_response = MagicMock()
    openai_response.text = "v=0\r\ns=openai-answer"
    openai_response.is_success = True
    async_client, client = _mock_async_client(openai_response)

    with patch("app.main.httpx.AsyncClient", return_value=async_client):
        with _local_test_client() as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
                headers={"Content-Type": "application/sdp"},
            )

    assert response.status_code == 200
    assert response.text == "v=0\r\ns=openai-answer"
    _, kwargs = client.post.call_args
    assert client.post.call_args.args[0] == OPENAI_REALTIME_URL
    assert kwargs["headers"] == {
        "Authorization": "Bearer backend-only-test-key",
    }
    sdp_part = kwargs["files"]["sdp"]
    assert sdp_part == (
        None,
        "v=0\r\ns=browser-offer",
        "application/sdp",
    )
    assert sdp_part[1]
    assert sdp_part[1].startswith("v=0")
    assert set(kwargs["files"]) == {"sdp", "session"}
    session_part = kwargs["files"]["session"]
    assert session_part[0] is None
    assert session_part[2] == "application/json"
    session = json.loads(session_part[1])
    assert session["type"] == "realtime"
    assert session["model"] == "gpt-realtime-2.1"
    assert session["audio"]["output"]["voice"] == "marin"
    assert "length=20" in caplog.text
    assert "starts_with_v0=True" in caplog.text
    assert "browser-offer" not in caplog.text


def test_voice_session_rejects_empty_sdp_before_calling_openai(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")

    with patch("app.main.httpx.AsyncClient") as async_client:
        with _local_test_client() as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="",
                headers={"Content-Type": "application/sdp"},
            )

    assert response.status_code == 400
    assert response.json() == {"detail": "Oferta SDP ausente."}
    async_client.assert_not_called()


def test_voice_session_rejects_sdp_without_version_prefix(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")

    with patch("app.main.httpx.AsyncClient") as async_client:
        with _local_test_client() as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="s=not-an-sdp-offer",
                headers={"Content-Type": "application/sdp"},
            )

    assert response.status_code == 400
    assert response.json() == {
        "detail": 'Oferta SDP inválida: deve começar com "v=0".',
    }
    async_client.assert_not_called()


def test_voice_session_rejects_missing_backend_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with _local_test_client() as test_client:
        response = test_client.post(
            "/api/v1/voice/session",
            content="v=0\r\ns=browser-offer",
        )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "OPENAI_API_KEY não configurada no backend.",
    }


def test_voice_session_reports_sanitized_openai_error(monkeypatch, caplog):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")
    openai_response = MagicMock()
    openai_response.is_success = False
    openai_response.status_code = 400
    openai_response.text = json.dumps(
        {
            "error": {
                "message": "Invalid value for session.audio.output.voice.",
                "type": "invalid_request_error",
            },
        },
    )
    async_client, _ = _mock_async_client(openai_response)

    with patch("app.main.httpx.AsyncClient", return_value=async_client):
        with _local_test_client() as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
            )

    assert response.status_code == 502
    assert response.json() == {
        "detail": (
            "OpenAI Realtime rejeitou a sessão (400): "
            "Invalid value for session.audio.output.voice."
        ),
    }
    assert "status=400" in caplog.text
    assert "Invalid value for session.audio.output.voice." in caplog.text
    assert "backend-only-test-key" not in caplog.text
    assert "v=0" not in caplog.text


def test_voice_session_reports_openai_unavailable(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")
    async_client, client = _mock_async_client(MagicMock())
    client.post.side_effect = httpx.ConnectError("offline")

    with patch("app.main.httpx.AsyncClient", return_value=async_client):
        with _local_test_client() as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
            )

    assert response.status_code == 502
    assert response.json() == {
        "detail": "OpenAI Realtime indisponível.",
    }


def test_voice_session_rejects_non_loopback_client(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")

    with patch("app.main.httpx.AsyncClient") as async_client:
        with TestClient(
            app,
            client=("192.168.1.50", 50000),
            headers={"Origin": LOCAL_FRONTEND_ORIGINS[0]},
        ) as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
            )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Sessões de voz são permitidas apenas para clientes loopback.",
    }
    async_client.assert_not_called()


def test_voice_session_rejects_unauthorized_origin(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")

    with patch("app.main.httpx.AsyncClient") as async_client:
        with _local_test_client("http://example.invalid") as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
            )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Origem não autorizada para criar sessão de voz.",
    }
    async_client.assert_not_called()


def test_voice_session_rejects_missing_origin(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")

    with patch("app.main.httpx.AsyncClient") as async_client:
        with TestClient(
            app,
            client=("127.0.0.1", 50000),
        ) as test_client:
            response = test_client.post(
                "/api/v1/voice/session",
                content="v=0\r\ns=browser-offer",
            )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Origem não autorizada para criar sessão de voz.",
    }
    async_client.assert_not_called()


def test_voice_session_rate_limits_session_creation(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "backend-only-test-key")
    openai_response = MagicMock()
    openai_response.text = "v=0\r\ns=openai-answer"
    openai_response.is_success = True
    async_client, client = _mock_async_client(openai_response)

    with patch("app.main.httpx.AsyncClient", return_value=async_client):
        with _local_test_client() as test_client:
            responses = [
                test_client.post(
                    "/api/v1/voice/session",
                    content="v=0\r\ns=browser-offer",
                )
                for _ in range(VOICE_SESSION_RATE_LIMIT + 1)
            ]

    assert [response.status_code for response in responses[:-1]] == [
        200,
    ] * VOICE_SESSION_RATE_LIMIT
    assert responses[-1].status_code == 429
    assert responses[-1].json() == {
        "detail": "Limite local de criação de sessões de voz excedido.",
    }
    assert int(responses[-1].headers["Retry-After"]) >= 1
    assert client.post.await_count == VOICE_SESSION_RATE_LIMIT
