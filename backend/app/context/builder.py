from __future__ import annotations

from abc import ABC, abstractmethod

from app.memory.domain import MemoryRecord, MemoryStatus

from .domain import ContextBuildInput, ModelContext, ToolDefinition


class ContextBuilder(ABC):
    @abstractmethod
    def build(self, input_data: ContextBuildInput) -> ModelContext:
        raise NotImplementedError


class DeterministicContextBuilder(ContextBuilder):
    """Builds provider-neutral context without accessing persistence or AI APIs."""

    def build(self, input_data: ContextBuildInput) -> ModelContext:
        active_memories = (
            memory
            for memory in input_data.memories
            if memory.status is MemoryStatus.ACTIVE
        )

        return ModelContext(
            personality=input_data.personality,
            recent_history=input_data.recent_history,
            memories=tuple(sorted(active_memories, key=self._memory_sort_key)),
            tools=tuple(sorted(input_data.tools, key=self._tool_sort_key)),
            current_message=input_data.current_message,
        )

    @staticmethod
    def _memory_sort_key(memory: MemoryRecord) -> tuple[float, float, str, str]:
        return (
            -memory.importance,
            -memory.confidence,
            memory.created_at.isoformat(),
            str(memory.id),
        )

    @staticmethod
    def _tool_sort_key(tool: ToolDefinition) -> tuple[str, str]:
        return (tool.name.casefold(), tool.description.casefold())
