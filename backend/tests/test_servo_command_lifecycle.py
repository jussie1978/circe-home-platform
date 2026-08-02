import json
from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import (
    SERVO_COMMAND_TOPIC,
    handle_mqtt_message,
    pending_servo_commands,
    process_expired_servo_commands,
    state,
)
from app.main import app
from app.mqtt import MQTTManager


class ConnectedMQTTClient:
    def is_connected(self):
        return True


class RecordingMQTTManager:
    def __init__(self):
        self.client = ConnectedMQTTClient()
        self.published = []

    def publish(self, topic, payload, qos=0, retain=False):
        self.published.append((topic, payload))

    def start(self):
        pass


@pytest.fixture(autouse=True)
def reset_servo_commands():
    pending_servo_commands.clear()
    state.roof_angle = 90
    state.fins_state = "open"


def test_servo_command_publishes_official_envelope_and_legacy_scalar(monkeypatch):
    mqtt = RecordingMQTTManager()
    monkeypatch.setattr("app.main.MQTTManager", lambda **kwargs: mqtt)

    with TestClient(app) as client:
        response = client.post("/api/v1/controls/servos", json={"angle": 25})

    payload = response.json()
    command_id = UUID(payload["command_id"])
    assert payload["status"] == "pending"
    assert payload["reported_state"] is None
    assert state.roof_angle == 90

    official_topic, serialized_envelope = mqtt.published[0]
    envelope = json.loads(serialized_envelope)
    assert official_topic == SERVO_COMMAND_TOPIC == "circe/alx/case/command/servos"
    assert envelope == {
        "command_id": str(command_id),
        "requested_at": payload["requested_at"],
        "actor": "user",
        "value": {"roof_angle": 25},
        "expires_at": payload["expires_at"],
    }
    assert datetime.fromisoformat(envelope["requested_at"]).tzinfo is not None
    assert datetime.fromisoformat(envelope["expires_at"]) > datetime.fromisoformat(
        envelope["requested_at"]
    )
    assert mqtt.published[1] == ("alx/case/servos/angle", "25")


def test_valid_ack_correlates_command_and_updates_reported_state(monkeypatch):
    mqtt = RecordingMQTTManager()
    monkeypatch.setattr("app.main.MQTTManager", lambda **kwargs: mqtt)

    with TestClient(app) as client:
        command = client.post(
            "/api/v1/controls/servos", json={"angle": 25}
        ).json()

    command_id = command["command_id"]
    handle_mqtt_message(
        f"circe/alx/case/ack/{command_id}",
        json.dumps(
            {
                "command_id": command_id,
                "reported_state": {"roof_angle": 25},
            }
        ),
    )

    tracked = pending_servo_commands[UUID(command_id)]
    assert tracked.status == "acknowledged"
    assert tracked.reported_state == {"roof_angle": 25}
    assert state.roof_angle == 25
    assert state.fins_state == "open"


def test_expired_command_fails_deterministically(monkeypatch):
    mqtt = RecordingMQTTManager()
    monkeypatch.setattr("app.main.MQTTManager", lambda **kwargs: mqtt)

    with TestClient(app) as client:
        command = client.post(
            "/api/v1/controls/servos", json={"angle": 0}
        ).json()

    command_id = UUID(command["command_id"])
    expires_at = datetime.fromisoformat(command["expires_at"])
    expired = process_expired_servo_commands(now=expires_at)

    assert expired == [command_id]
    assert pending_servo_commands[command_id].status == "failed"
    assert pending_servo_commands[command_id].reported_state is None
    assert state.roof_angle == 90

    handle_mqtt_message(
        f"circe/alx/case/ack/{command_id}",
        json.dumps(
            {
                "command_id": str(command_id),
                "reported_state": {"roof_angle": 0},
            }
        ),
    )
    assert pending_servo_commands[command_id].status == "failed"
    assert state.roof_angle == 90


def test_mqtt_subscribes_to_servo_ack_pattern():
    manager = MQTTManager.__new__(MQTTManager)

    class SubscribingClient:
        def __init__(self):
            self.topics = None

        def subscribe(self, topics):
            self.topics = topics

    client = SubscribingClient()
    manager.client = client
    manager.on_connect(client, None, None, 0)

    assert ("circe/alx/case/ack/+", 0) in client.topics


@pytest.mark.parametrize(
    ("topic_command_id", "payload"),
    [
        (
            uuid4(),
            lambda command_id: {
                "command_id": str(command_id),
                "reported_state": {"roof_angle": 25},
            },
        ),
        (
            None,
            lambda command_id: {
                "command_id": str(uuid4()),
                "reported_state": {"roof_angle": 25},
            },
        ),
        (
            None,
            lambda command_id: {
                "command_id": {},
                "reported_state": {"roof_angle": 25},
            },
        ),
        (
            None,
            lambda command_id: {
                "command_id": str(command_id),
                "reported_state": {"roof_angle": 99},
            },
        ),
        (None, lambda command_id: {"command_id": str(command_id)}),
    ],
)
def test_unknown_or_invalid_ack_is_ignored(
    monkeypatch, topic_command_id, payload
):
    mqtt = RecordingMQTTManager()
    monkeypatch.setattr("app.main.MQTTManager", lambda **kwargs: mqtt)

    with TestClient(app) as client:
        command = client.post(
            "/api/v1/controls/servos", json={"angle": 25}
        ).json()

    command_id = UUID(command["command_id"])
    ack_command_id = topic_command_id or command_id
    handle_mqtt_message(
        f"circe/alx/case/ack/{ack_command_id}",
        json.dumps(payload(command_id)),
    )

    assert pending_servo_commands[command_id].status == "pending"
    assert pending_servo_commands[command_id].reported_state is None
    assert state.roof_angle == 90
