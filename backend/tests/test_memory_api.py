from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.api import router
from app.memory.dependencies import get_memory_service
from app.memory.service import MemoryService


def build_client() -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_memory_service] = lambda: MemoryService(
        SqlAlchemyMemoryRepository(session_factory)
    )
    return TestClient(app)


def test_memory_api_lifecycle() -> None:
    client = build_client()

    created = client.post(
        "/api/v1/memories",
        json={
            "user_id": "local-user",
            "content": "O usuário prefere respostas objetivas.",
            "memory_type": "preference",
            "metadata": {"source": "explicit"},
            "importance": 0.9,
        },
    )
    assert created.status_code == 201
    memory = created.json()
    memory_id = memory["id"]

    listed = client.get(
        "/api/v1/memories",
        params={"user_id": "local-user"},
    )
    assert listed.status_code == 200
    assert listed.json() == [memory]

    updated = client.patch(
        f"/api/v1/memories/{memory_id}",
        json={"content": "O usuário prefere respostas diretas e objetivas."},
    )
    assert updated.status_code == 200
    assert updated.json()["content"] == (
        "O usuário prefere respostas diretas e objetivas."
    )

    deleted = client.delete(f"/api/v1/memories/{memory_id}")
    assert deleted.status_code == 204

    listed_after_delete = client.get(
        "/api/v1/memories",
        params={"user_id": "local-user"},
    )
    assert listed_after_delete.status_code == 200
    assert listed_after_delete.json() == []


def test_memory_api_returns_404_for_unknown_memory() -> None:
    client = build_client()
    response = client.delete(
        "/api/v1/memories/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404
