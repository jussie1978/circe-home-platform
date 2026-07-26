from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.context import ContextService, DeterministicContextBuilder
from app.database import Base
from app.memory.adapters.sqlalchemy_repository import SqlAlchemyMemoryRepository
from app.memory.domain import MemoryType
from app.memory.service import MemoryService
from app.providers import OpenAITextProvider, TextCompletionService


def build_memory_service(database_path: Path) -> tuple[Engine, MemoryService]:
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
    )
    return engine, MemoryService(SqlAlchemyMemoryRepository(session_factory))


def main() -> None:
    with TemporaryDirectory(prefix="circe-provider-demo-") as temp_dir:
        database_path = Path(temp_dir) / "memory.db"
        first_engine, first_memory_service = build_memory_service(database_path)
        memory = first_memory_service.remember(
            user_id="provider-demo",
            content="Jussiê prefere respostas diretas e objetivas.",
            memory_type=MemoryType.PREFERENCE,
            metadata={"source": "explicit", "demo": True},
            importance=0.9,
        )
        first_engine.dispose()

        second_engine, reopened_memory_service = build_memory_service(database_path)
        completion_service = TextCompletionService(
            ContextService(
                reopened_memory_service,
                DeterministicContextBuilder(),
            ),
            OpenAITextProvider.from_env(),
        )
        response = completion_service.complete(
            user_id="provider-demo",
            current_message=(
                "Qual estilo de resposta eu prefiro? Responda em uma frase."
            ),
            personality="Você é a CIRCE, um companion direto e confiável.",
        )

        print(f"Memória persistida: {memory.content}")
        print(f"Provedor: {response.provider_id}")
        print(f"Resposta: {response.content}")
        second_engine.dispose()


if __name__ == "__main__":
    main()
