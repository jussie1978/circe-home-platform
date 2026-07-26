from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, ConfigDict, Field

from .dependencies import get_memory_service
from .domain import MemoryRecord, MemoryStatus, MemoryType
from .service import MemoryNotFoundError, MemoryService


router = APIRouter(prefix="/api/v1/memories", tags=["memories"])


class MemoryCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    memory_type: MemoryType
    metadata: dict[str, Any] = Field(default_factory=dict)
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class MemoryUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1)
    metadata: dict[str, Any] | None = None
    importance: float | None = Field(default=None, ge=0.0, le=1.0)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    status: MemoryStatus | None = None


class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: str
    content: str
    memory_type: MemoryType
    metadata: dict[str, Any]
    importance: float
    confidence: float
    status: MemoryStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, memory: MemoryRecord) -> "MemoryResponse":
        return cls.model_validate(memory)


@router.post(
    "",
    response_model=MemoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_memory(
    payload: MemoryCreate,
    service: MemoryService = Depends(get_memory_service),
) -> MemoryResponse:
    memory = service.remember(
        user_id=payload.user_id,
        content=payload.content,
        memory_type=payload.memory_type,
        metadata=payload.metadata,
        importance=payload.importance,
        confidence=payload.confidence,
    )
    return MemoryResponse.from_domain(memory)


@router.get("", response_model=list[MemoryResponse])
def list_memories(
    user_id: str = Query(min_length=1, max_length=255),
    memory_type: MemoryType | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    service: MemoryService = Depends(get_memory_service),
) -> list[MemoryResponse]:
    memories = service.recall(
        user_id,
        memory_type=memory_type,
        limit=limit,
    )
    return [MemoryResponse.from_domain(memory) for memory in memories]


@router.patch("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: UUID,
    payload: MemoryUpdate,
    service: MemoryService = Depends(get_memory_service),
) -> MemoryResponse:
    try:
        memory = service.revise(
            memory_id,
            content=payload.content,
            metadata=payload.metadata,
            importance=payload.importance,
            confidence=payload.confidence,
            status=payload.status,
        )
    except MemoryNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found",
        ) from exc

    return MemoryResponse.from_domain(memory)


@router.delete(
    "/{memory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_memory(
    memory_id: UUID,
    service: MemoryService = Depends(get_memory_service),
) -> Response:
    if not service.forget(memory_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
