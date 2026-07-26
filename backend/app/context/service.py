from __future__ import annotations

from app.memory.service import MemoryService

from .builder import ContextBuilder
from .domain import (
    ContextBuildInput,
    ConversationTurn,
    ModelContext,
    ToolDefinition,
)


class ContextService:
    """Coordinates memory retrieval and provider-neutral context construction."""

    def __init__(
        self,
        memory_service: MemoryService,
        context_builder: ContextBuilder,
    ) -> None:
        self._memory_service = memory_service
        self._context_builder = context_builder

    def build_context(
        self,
        *,
        user_id: str,
        current_message: str,
        personality: str,
        recent_history: tuple[ConversationTurn, ...] = (),
        tools: tuple[ToolDefinition, ...] = (),
    ) -> ModelContext:
        normalized_user_id = user_id.strip()
        if not normalized_user_id:
            raise ValueError("user_id cannot be empty")

        memories = tuple(self._memory_service.recall(normalized_user_id))
        return self._context_builder.build(
            ContextBuildInput(
                current_message=current_message,
                personality=personality,
                recent_history=recent_history,
                memories=memories,
                tools=tools,
            )
        )
