from __future__ import annotations

from app.context import (
    ContextService,
    ConversationTurn,
    ToolDefinition,
)

from .contract import AIProvider, ProviderResponse


class TextCompletionService:
    """Connects Core context construction to a replaceable text provider."""

    def __init__(
        self,
        context_service: ContextService,
        provider: AIProvider,
    ) -> None:
        self._context_service = context_service
        self._provider = provider

    def complete(
        self,
        *,
        user_id: str,
        current_message: str,
        personality: str,
        recent_history: tuple[ConversationTurn, ...] = (),
        tools: tuple[ToolDefinition, ...] = (),
    ) -> ProviderResponse:
        context = self._context_service.build_context(
            user_id=user_id,
            current_message=current_message,
            personality=personality,
            recent_history=recent_history,
            tools=tools,
        )
        return self._provider.complete(context)
