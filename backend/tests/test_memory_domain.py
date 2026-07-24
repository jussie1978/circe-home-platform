import pytest

from app.memory.domain import MemoryRecord, MemoryType


def test_memory_record_normalizes_content_and_user_id():
    memory = MemoryRecord(
        user_id=" user-1 ",
        content=" Prefere respostas objetivas. ",
        memory_type=MemoryType.PREFERENCE,
    )

    assert memory.user_id == "user-1"
    assert memory.content == "Prefere respostas objetivas."


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("importance", -0.1),
        ("importance", 1.1),
        ("confidence", -0.1),
        ("confidence", 1.1),
    ],
)
def test_memory_record_rejects_invalid_scores(field_name, value):
    kwargs = {
        "user_id": "user-1",
        "content": "Memória válida",
        "memory_type": MemoryType.FACT,
        field_name: value,
    }

    with pytest.raises(ValueError):
        MemoryRecord(**kwargs)
