from uuid import UUID

import pytest

from app.control_contracts import ControlCommand


def test_control_command_separates_desired_and_reported_state():
    command = ControlCommand(
        desired_state={"fan_speed": 75},
    )

    assert isinstance(command.command_id, UUID)
    assert command.desired_state == {"fan_speed": 75}
    assert command.reported_state is None


def test_each_control_command_receives_a_unique_id():
    first = ControlCommand(desired_state={"fan_speed": 60})
    second = ControlCommand(desired_state={"fan_speed": 60})

    assert first.command_id != second.command_id


@pytest.mark.parametrize(
    ("path", "request_body", "expected_desired_state"),
    [
        (
            "/api/v1/controls/fans",
            {"speed": 75},
            {"fan_speed": 75},
        ),
        (
            "/api/v1/controls/fans/mode",
            {"mode": "manual"},
            {"fan_mode": "manual"},
        ),
        (
            "/api/v1/controls/servos",
            {"angle": 0},
            {"roof_angle": 0},
        ),
        (
            "/api/v1/controls/leds",
            {"color": "#ff00ff"},
            {"led_color": "#ff00ff"},
        ),
        (
            "/api/v1/controls/leds/mode",
            {"mode": "rainbow"},
            {"led_mode": "rainbow"},
        ),
    ],
)
def test_rest_controls_return_command_contract(
    path,
    request_body,
    expected_desired_state,
):
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as client:
        response = client.post(path, json=request_body)

    assert response.status_code == 200
    payload = response.json()

    assert payload["status"] == "success"
    assert isinstance(UUID(payload["command_id"]), UUID)
    assert payload["desired_state"] == expected_desired_state
    assert payload["reported_state"] is None
