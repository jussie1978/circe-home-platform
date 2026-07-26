from dataclasses import replace

import pytest

from app.context import (
    ContextBuildInput,
    ConversationRole,
    ConversationTurn,
    DeterministicContextBuilder,
    ToolDefinition,
)
from app.memory.domain import MemoryRecord, MemoryStatus, MemoryType


def memory(
    content: str,
    *,
    importance: float,
    confidence: float = 1.0,
    status: MemoryStatus = MemoryStatus.ACTIVE,
) -> MemoryRecord:
    return MemoryRecord(
        user_id="user-1",
        content=content,
        memory_type=MemoryType.FACT,
        importance=importance,
        confidence=confidence,
        status=status,
    )


def test_builds_complete_provider_neutral_context() -> None:
    history = (
        ConversationTurn(ConversationRole.USER, "Mensagem anterior"),
        ConversationTurn(ConversationRole.ASSISTANT, "Resposta anterior"),
    )
    stored_memory = memory("O projeto se chama Circe OS.", importance=0.8)
    tool = ToolDefinition("desk_status", "Lê o estado atual da mesa.")

    result = DeterministicContextBuilder().build(
        ContextBuildInput(
            current_message="Qual é o próximo passo?",
            personality="Você é a CIRCE.",
            recent_history=history,
            memories=(stored_memory,),
            tools=(tool,),
        )
    )

    assert result.personality == "Você é a CIRCE."
    assert result.recent_history == history
    assert result.memories == (stored_memory,)
    assert result.tools == (tool,)
    assert result.current_message == "Qual é o próximo passo?"


def test_preserves_history_and_orders_memories_and_tools_deterministically() -> None:
    first_turn = ConversationTurn(ConversationRole.USER, "Primeiro")
    second_turn = ConversationTurn(ConversationRole.ASSISTANT, "Segundo")
    less_relevant = memory("Menor relevância", importance=0.4)
    more_relevant = memory("Maior relevância", importance=0.9)
    same_importance_lower_confidence = memory(
        "Menor confiança",
        importance=0.9,
        confidence=0.7,
    )

    input_data = ContextBuildInput(
        current_message="Agora",
        personality="Personalidade do Core",
        recent_history=(first_turn, second_turn),
        memories=(
            less_relevant,
            same_importance_lower_confidence,
            more_relevant,
        ),
        tools=(
            ToolDefinition("weather", "Consulta o clima."),
            ToolDefinition("Desk_Status", "Consulta a mesa."),
        ),
    )

    result = DeterministicContextBuilder().build(input_data)

    assert result.recent_history == (first_turn, second_turn)
    assert result.memories == (
        more_relevant,
        same_importance_lower_confidence,
        less_relevant,
    )
    assert [tool.name for tool in result.tools] == ["Desk_Status", "weather"]
    assert DeterministicContextBuilder().build(input_data) == result


def test_excludes_non_active_memories() -> None:
    active = memory("Memória ativa", importance=0.5)
    superseded = replace(active, content="Memória antiga", status=MemoryStatus.SUPERSEDED)
    deleted = replace(active, content="Memória excluída", status=MemoryStatus.DELETED)

    result = DeterministicContextBuilder().build(
        ContextBuildInput(
            current_message="Mensagem",
            personality="Personalidade",
            memories=(superseded, active, deleted),
        )
    )

    assert result.memories == (active,)


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("current_message", " "),
        ("personality", ""),
    ],
)
def test_rejects_empty_required_context_fields(field_name: str, value: str) -> None:
    kwargs = {
        "current_message": "Mensagem",
        "personality": "Personalidade",
        field_name: value,
    }

    with pytest.raises(ValueError):
        ContextBuildInput(**kwargs)


def test_normalizes_context_text_without_mutable_sequence_leaks() -> None:
    history = [ConversationTurn(ConversationRole.USER, "  Olá  ")]
    tools = [ToolDefinition(" status ", " Consulta o estado. ")]

    input_data = ContextBuildInput(
        current_message="  Continue  ",
        personality="  Personalidade  ",
        recent_history=history,
        tools=tools,
    )
    history.clear()
    tools.clear()

    assert input_data.current_message == "Continue"
    assert input_data.personality == "Personalidade"
    assert input_data.recent_history[0].content == "Olá"
    assert input_data.tools == (
        ToolDefinition("status", "Consulta o estado."),
    )
