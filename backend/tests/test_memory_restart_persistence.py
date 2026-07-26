from __future__ import annotations

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

import httpx


BACKEND_DIR = Path(__file__).resolve().parents[1]


def _free_local_port() -> int:
    with socket.socket() as server_socket:
        server_socket.bind(("127.0.0.1", 0))
        return int(server_socket.getsockname()[1])


def _start_backend(
    runtime_dir: Path,
    port: int,
    client: httpx.Client,
) -> subprocess.Popen[str]:
    environment = os.environ.copy()
    environment["PYTHONPATH"] = str(BACKEND_DIR)
    process = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
        ],
        cwd=runtime_dir,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        if process.poll() is not None:
            output = process.stdout.read() if process.stdout else ""
            raise RuntimeError(f"Backend stopped during startup:\n{output}")
        try:
            response = client.get(f"http://127.0.0.1:{port}/health", timeout=0.5)
            if response.status_code == 200:
                return process
        except httpx.HTTPError:
            time.sleep(0.1)

    _stop_backend(process)
    raise RuntimeError("Backend startup timed out")


def _stop_backend(process: subprocess.Popen[str]) -> None:
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)

def test_memory_survives_backend_restart(tmp_path: Path) -> None:
    port = _free_local_port()
    base_url = f"http://127.0.0.1:{port}"
    client = httpx.Client(trust_env=False)
    process: subprocess.Popen[str] | None = None

    try:
        process = _start_backend(tmp_path, port, client)
        created = client.post(
            f"{base_url}/api/v1/memories",
            json={
                "user_id": "restart-validation-user",
                "content": "Memory persisted across a real backend restart.",
                "memory_type": "fact",
                "metadata": {"source": "restart-integration-test"},
                "importance": 1.0,
            },
            timeout=5,
        )
        created.raise_for_status()
        expected_memory = created.json()

        _stop_backend(process)
        process = None

        database_path = tmp_path / "circe_home.db"
        assert database_path.exists()
        assert database_path.stat().st_size > 0

        process = _start_backend(tmp_path, port, client)
        listed = client.get(
            f"{base_url}/api/v1/memories",
            params={"user_id": "restart-validation-user"},
            timeout=5,
        )
        listed.raise_for_status()

        assert listed.json() == [expected_memory]
    finally:
        client.close()
        if process is not None and process.poll() is None:
            _stop_backend(process)
