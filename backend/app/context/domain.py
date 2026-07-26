from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum

from app.memory.domain import MemoryRecord


def _normalize_required(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} cannot be empty")
    return normalized


class ConversationRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


@dataclass(frozen=True, slots=True)
class ConversationTurn:
    role: ConversationRole
    content: str

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "content",
            _normalize_required(self.content, "conversation turn content"),
        )


@dataclass(frozen=True, slots=True)
class ToolDefinition:
    name: str
    description: str

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "name",
            _normalize_required(self.name, "tool name"),
        )
        object.__setattr__(
            self,
            "description",
            _normalize_required(self.description, "tool description"),
        )


@dataclass(frozen=True, slots=True)
class ContextBuildInput:
    current_message: str
    personality: str
    recent_history: tuple[ConversationTurn, ...] = field(default_factory=tuple)
    memories: tuple[MemoryRecord, ...] = field(default_factory=tuple)
    tools: tuple[ToolDefinition, ...] = field(default_factory=tuple)

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "current_message",
            _normalize_required(self.current_message, "current message"),
        )
        object.__setattr__(
            self,
            "personality",
            _normalize_required(self.personality, "personality"),
        )
        object.__setattr__(self, "recent_history", tuple(self.recent_history))
        object.__setattr__(self, "memories", tuple(self.memories))
        object.__setattr__(self, "tools", tuple(self.tools))


@dataclass(frozen=True, slots=True)
class ModelContext:
    personality: str
    recent_history: tuple[ConversationTurn, ...]
    memories: tuple[MemoryRecord, ...]
    tools: tuple[ToolDefinition, ...]
    current_message: str
