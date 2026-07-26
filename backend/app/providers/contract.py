from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.context import ModelContext


def _normalize_required(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} cannot be empty")
    return normalized


@dataclass(frozen=True, slots=True)
class ProviderResponse:
    provider_id: str
    content: str

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "provider_id",
            _normalize_required(self.provider_id, "provider_id"),
        )
        object.__setattr__(
            self,
            "content",
            _normalize_required(self.content, "provider response content"),
        )


class AIProvider(ABC):
    """Provider boundary: adapters receive only a completed ModelContext."""

    @property
    @abstractmethod
    def provider_id(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def complete(self, context: ModelContext) -> ProviderResponse:
        raise NotImplementedError
