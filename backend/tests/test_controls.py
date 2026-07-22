import pytest
from fastapi.testclient import TestClient

from app.main import app, state


@pytest.fixture(autouse=True)
def reset_system_state():
    state.temperature = 42.0
    state.humidity = 62.5
    state.fan_speed = 60
    state.fan_mode = "auto"
    state.roof_angle = 90
    state.fins_state = "open"
    state.led_color = "#06B6D4"
    state.led_mode = "breath"
    state.iris_state = "idle"
    state.connected_clients.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_reports_online(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["state"]["fan_mode"] == "auto"
    assert response.json()["state"]["fins_state"] == "open"


def test_rest_controls_update_software_state(client):
    assert client.post("/api/v1/controls/fans", json={"speed": 75}).json() == {
        "status": "success",
        "fan_speed": 75,
    }
    assert client.post("/api/v1/controls/fans/mode", json={"mode": "manual"}).json() == {
        "status": "success",
        "fan_mode": "manual",
    }
    assert client.post("/api/v1/controls/servos", json={"angle": 0}).json() == {
        "status": "success",
        "roof_angle": 0,
        "fins_state": "closed",
    }
    assert client.post("/api/v1/controls/leds", json={"color": "#ff00ff"}).json() == {
        "status": "success",
        "led_color": "#ff00ff",
    }
    assert client.post("/api/v1/controls/leds/mode", json={"mode": "rainbow"}).json() == {
        "status": "success",
        "led_mode": "rainbow",
    }


def test_websocket_exposes_and_updates_complete_control_state(client):
    with client.websocket_connect("/ws") as websocket:
        initial = websocket.receive_json()
        assert initial["fanMode"] == "auto"
        assert initial["finsState"] == "open"
        assert initial["ledMode"] == "breath"

        websocket.send_json({"topic": "alx/case/fans/mode", "value": "silent"})
        assert websocket.receive_json()["fanMode"] == "silent"

        websocket.send_json({"topic": "alx/case/servos/angle", "value": "100"})
        servo_state = websocket.receive_json()
        assert servo_state["roofAngle"] == 100
        assert servo_state["finsState"] == "open"

        websocket.send_json({"topic": "alx/case/leds/mode", "value": "solid"})
        assert websocket.receive_json()["ledMode"] == "solid"
