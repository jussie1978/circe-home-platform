from __future__ import annotations

import os
from typing import Any

import httpx

from app.context import ModelContext

from .contract import AIProvider, ProviderResponse


class ProviderConfigurationError(RuntimeError):
    """Raised when a provider cannot be configured safely."""


class ProviderRequestError(RuntimeError):
    """Raised when a provider request fails or returns no usable text."""


class OpenAITextProvider(AIProvider):
    """Minimal OpenAI Responses API adapter for provider-neutral text context."""

    _endpoint = "https://api.openai.com/v1/responses"

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        client: httpx.Client | None = None,
        timeout_seconds: float = 15.0,
        max_output_tokens: int = 256,
    ) -> None:
        self._api_key = self._required(api_key, "OPENAI_API_KEY")
        self._model = self._required(model, "CIRCE_OPENAI_MODEL")
        if max_output_tokens < 1:
            raise ProviderConfigurationError("max_output_tokens must be positive")
        self._max_output_tokens = max_output_tokens
        self._client = client or httpx.Client(timeout=timeout_seconds)

    @classmethod
    def from_env(
        cls,
        *,
        client: httpx.Client | None = None,
        timeout_seconds: float = 15.0,
        max_output_tokens: int = 256,
    ) -> OpenAITextProvider:
        return cls(
            api_key=os.getenv("OPENAI_API_KEY", ""),
            model=os.getenv("CIRCE_OPENAI_MODEL", ""),
            client=client,
            timeout_seconds=timeout_seconds,
            max_output_tokens=max_output_tokens,
        )

    @property
    def provider_id(self) -> str:
        return "openai"

    def complete(self, context: ModelContext) -> ProviderResponse:
        try:
            response = self._client.post(
                self._endpoint,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self._model,
                    "instructions": self._render_instructions(context),
                    "input": self._render_input(context),
                    "max_output_tokens": self._max_output_tokens,
                    "store": False,
                },
            )
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict):
                raise ValueError("provider response must be an object")
            content = self._extract_text(payload)
        except httpx.HTTPStatusError as exc:
            raise ProviderRequestError(
                f"OpenAI request failed with HTTP {exc.response.status_code}"
            ) from exc
        except (httpx.RequestError, ValueError) as exc:
            raise ProviderRequestError("OpenAI request failed") from exc

        if not content:
            raise ProviderRequestError("OpenAI response contained no text")

        return ProviderResponse(provider_id=self.provider_id, content=content)

    @staticmethod
    def _required(value: str, variable_name: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ProviderConfigurationError(
                f"backend environment variable {variable_name} is required"
            )
        return normalized

    @staticmethod
    def _render_instructions(context: ModelContext) -> str:
        sections = [context.personality]

        if context.memories:
            memories = "\n".join(
                f"- {memory.content}" for memory in context.memories
            )
            sections.append(
                "Memórias persistentes autorizadas pelo CIRCE Core:\n"
                f"{memories}\n"
                "Use estas memórias quando forem relevantes para responder."
            )

        if context.tools:
            tools = "\n".join(
                f"- {tool.name}: {tool.description}" for tool in context.tools
            )
            sections.append(
                "Ferramentas conhecidas pelo Core (somente descrição; não execute):\n"
                f"{tools}"
            )

        return "\n\n".join(sections)

    @staticmethod
    def _render_input(context: ModelContext) -> str:
        lines = [
            f"{turn.role.value}: {turn.content}"
            for turn in context.recent_history
        ]
        lines.append(f"user: {context.current_message}")
        return "\n".join(lines)

    @staticmethod
    def _extract_text(payload: dict[str, Any]) -> str:
        direct_text = payload.get("output_text")
        if isinstance(direct_text, str) and direct_text.strip():
            return direct_text.strip()

        fragments: list[str] = []
        output = payload.get("output")
        if not isinstance(output, list):
            return ""

        for item in output:
            if not isinstance(item, dict):
                continue
            content = item.get("content")
            if not isinstance(content, list):
                continue
            for part in content:
                if not isinstance(part, dict) or part.get("type") != "output_text":
                    continue
                text = part.get("text")
                if isinstance(text, str) and text.strip():
                    fragments.append(text.strip())

        return "\n".join(fragments)
