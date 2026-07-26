from datetime import datetime, timedelta, timezone

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


def test_memory_record_detaches_nested_metadata_from_input():
    metadata = {"source": "explicit", "details": {"approved": True}}
    memory = MemoryRecord(
        user_id="user-1",
        content="Memória auditável.",
        memory_type=MemoryType.FACT,
        metadata=metadata,
    )

    metadata["source"] = "tampered"
    metadata["details"]["approved"] = False

    assert memory.metadata == {
        "source": "explicit",
        "details": {"approved": True},
    }


def test_memory_record_normalizes_timestamps_to_utc():
    created_at = datetime(2026, 7, 26, 10, 0)
    updated_at = datetime(
        2026,
        7,
        26,
        9,
        30,
        tzinfo=timezone(timedelta(hours=-1)),
    )

    memory = MemoryRecord(
        user_id="user-1",
        content="Memória com datas normalizadas.",
        memory_type=MemoryType.FACT,
        created_at=created_at,
        updated_at=updated_at,
    )

    assert memory.created_at == datetime(2026, 7, 26, 10, 0, tzinfo=timezone.utc)
    assert memory.updated_at == datetime(2026, 7, 26, 10, 30, tzinfo=timezone.utc)


def test_memory_record_rejects_updated_at_before_created_at():
    created_at = datetime(2026, 7, 26, 10, 0, tzinfo=timezone.utc)

    with pytest.raises(ValueError, match="updated_at cannot be earlier"):
        MemoryRecord(
            user_id="user-1",
            content="Memória com cronologia inválida.",
            memory_type=MemoryType.FACT,
            created_at=created_at,
            updated_at=created_at - timedelta(seconds=1),
        )
