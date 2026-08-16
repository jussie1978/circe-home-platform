# CIRCE OS - Project Rules & Guidelines

Welcome to the **CIRCE OS** workspace. As an Antigravity agent, you must strictly adhere to the following rules, constraints, and methodologies when working on this codebase.

---

## 1. Core Architecture & Philosophy

*   **🔒 Privacy-First / Local-First**: The system operates locally for device control, automation, and state management. External AI services may be used only through explicit provider adapters and policy, without becoming a hidden dependency of essential controls or introducing personal data trackers.
*   **🤖 Conversational Interface (Circe)**: Circe is the canonical Home Companion identity. Voice providers remain replaceable, and every tool or physical command must pass through backend policy and validation.
*   **⚡ Real-Time Messaging**: Communication between components (Frontend, Backend, Firmware) is orchestrated using local MQTT (via Mosquitto) and WebSockets.
*   **📐 Spec-Driven Development (SDD)**: Never write product code without an approved specification (`docs/specs/SPEC-*.md` and/or ADRs in `docs/adrs/`). Any architectural changes must be documented via Architecture Decision Records (ADRs).

---

## 2. Technology Stack Constraints

*   **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic, `paho-mqtt`.
*   **Database**: SQLite for initial development and logs. Ensure indices are set up for performance on timestamps.
*   **Frontend**: React 18, Vite, TypeScript, Vanilla CSS (strictly avoid Tailwind CSS utility classes unless explicitly requested; currently, we use standard configurations for existing pages).
    *   *Visual Engine*: Three.js with React Three Fiber (`@react-three/fiber` and `@react-three/drei`) for the 3D Interactive Orbe.
*   **Firmware**: ESP32 S3 C++ using Arduino/PlatformIO framework.
*   **Deployment**: Docker Compose for local service orchestration (Mosquitto, DB, Web App).

---

## 3. Important Dev & Hardware Quirks

*   **ESP32 S3 USB CDC Delay**: The USB-CDC native port on the ESP32 S3 requires time to stabilize after a connection. **Always** insert `delay(2000)` immediately after `Serial.begin(115200)` in any sketch.
*   **ESP32 S3 Board Settings**:
    *   Flash Size: `8MB (64Mb)`
    *   PSRAM: `OPI PSRAM` (Embedded 8MB PSRAM)
    *   USB CDC On Boot: `Enabled`
*   **Mosquitto Network Access**: The Mosquitto MQTT broker must accept connections from the local network (since the ESP32 is an external network device). `mosquitto.conf` must contain:
    ```conf
    listener 1883 0.0.0.0
    allow_anonymous true
    ```
    Ensure Windows Firewall has an inbound rule allowing TCP traffic on port `1883`.

---

## 4. UI/UX & Spatial UI Guidelines

*   **Spatial UI 2.0 (Quadrant Clicks)**: The frontend uses a 2x2 invisible grid for opening side cards.
    *   `Top-Left`: Telemetria (DHT22)
    *   `Top-Right`: Ventilação (Fans PWM)
    *   `Bottom-Left`: Aletas (Servos)
    *   `Bottom-Right`: Iluminação (LEDs WS2812B)
    *   `Central Circle (320px)`: Close Active Panel (Home Button).
*   **Event Propagation**: Always stop event propagation (`e.stopPropagation()`) in cards, control sliders, and FX menus to prevent clicks from closing panels.
*   **Visual Aesthetics**: Follow premium design guidelines—use rich gradients, subtle micro-animations, neon accents, and dark/glassmorphic backgrounds.

---

## 5. Development Workflow (Swim Lanes)

*   **Single-Focus Sprints**: Only one project in the portfolio (CIRCE OS, LexisPro, CIRCE Intel Desk) can be in active development during a given week. Do not introduce cross-project code changes unless necessary.
*   **Comments and Documentation**: Maintain all comments and docstrings in code. Do not remove existing logic explanations during refactors.
