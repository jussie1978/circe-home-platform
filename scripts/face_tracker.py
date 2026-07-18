#!/usr/bin/env python3
"""
IRIS Face Tracker v4 — MediaPipe + Double EMA
Motor de detecção trocado de Haar Cascade para MediaPipe Face Mesh.
MediaPipe usa landmarks neurais (468 pontos) que são drasticamente mais
estáveis frame-a-frame do que bounding boxes de Haar Cascade.
Usamos o landmark 1 (ponta do nariz) como referência central.
"""
import cv2
import json
import time
import math
import argparse
import paho.mqtt.client as mqtt
import mediapipe as mp

# ── Parâmetros de suavização ──────────────────────────────────────
ALPHA       = 0.45      # EMA alpha (aumentado para maior resposta, MediaPipe já é estável)
VELOCITY_CAP = 0.15     # Deslocamento máximo por frame (aumentado para evitar lentidão)
SENSITIVITY = 2.5       # Multiplicador de amplitude (movimentos pequenos da cabeça geram mais rotação)
HOLD_SECS   = 1.5       # Mantém posição por 1.5s após perder o rosto
RETURN_ALPHA = 0.05     # Velocidade de retorno ao centro (aumentada levemente)
SEND_HZ     = 25        # Frequência de envio MQTT (aumentado para 25Hz)


def clamp(v, lo=-1.0, hi=1.0):
    return max(lo, min(hi, v))


def vel_limit(cur, tgt, cap):
    d = tgt - cur
    if abs(d) > cap:
        d = math.copysign(cap, d)
    return cur + d


def main():
    ap = argparse.ArgumentParser(description="IRIS Face Tracker v4 (MediaPipe → MQTT)")
    ap.add_argument("--host",     default="localhost")
    ap.add_argument("--port",     type=int, default=1883)
    ap.add_argument("--camera",   type=int, default=0)
    ap.add_argument("--invert-x", action="store_true")
    ap.add_argument("--headless", action="store_true", help="Executa sem interface gráfica (economiza CPU)")
    args = ap.parse_args()

    # ── MQTT ──────────────────────────────────────────────────────
    print("IRIS Face Tracker v4 (MediaPipe)")
    try:
        try:
            client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        except AttributeError:
            client = mqtt.Client()
        client.connect(args.host, args.port, 60)
        client.loop_start()
        print(f"MQTT conectado: {args.host}:{args.port}")
    except Exception as e:
        print(f"Erro MQTT: {e}")
        return

    # ── MediaPipe Face Mesh ───────────────────────────────────────
    mp_face = mp.solutions.face_mesh
    mp_draw = mp.solutions.drawing_utils
    face_mesh = mp_face.FaceMesh(
        static_image_mode=False,    # Modo de vídeo (tracking contínuo)
        max_num_faces=1,
        refine_landmarks=True,      # Landmarks refinados (íris, lábios)
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5  # Confiança de tracking entre frames
    )

    # ── Câmera ────────────────────────────────────────────────────
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Erro: câmera {args.camera} não encontrada.")
        return
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    print("Câmera OK. Pressione 'q' para sair.")

    # ── Estado ────────────────────────────────────────────────────
    sx, sy = 0.0, 0.0           # posição suavizada (saída final)
    last_det = 0.0              # último timestamp com rosto
    last_send = 0.0
    tracking = False
    send_interval = 1.0 / SEND_HZ

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            now = time.time()

            # MediaPipe espera RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            detected = False
            raw_x, raw_y = 0.0, 0.0

            if results.multi_face_landmarks:
                detected = True
                lm = results.multi_face_landmarks[0]

                # Landmark 1 = ponta do nariz (o mais estável para tracking de posição)
                nose = lm.landmark[1]

                # Convertemos para [-1, 1] centralizado e aplicamos a sensibilidade
                raw_x = (nose.x - 0.5) * 2.0 * SENSITIVITY
                raw_y = (nose.y - 0.5) * 2.0 * SENSITIVITY

                # Espelhamento de webcam (webcam é espelhada por padrão)
                if not args.invert_x:
                    raw_x = -raw_x

                raw_x = clamp(raw_x)
                raw_y = clamp(raw_y)

                # Visual: desenha ponto do nariz se não estiver em modo headless
                if not args.headless:
                    h, w = frame.shape[:2]
                    nx, ny = int(nose.x * w), int(nose.y * h)
                    cv2.circle(frame, (nx, ny), 6, (0, 243, 255), -1)
                    cv2.circle(frame, (nx, ny), 10, (0, 243, 255), 2)

            # ── Pipeline de suavização ────────────────────────────
            if detected:
                last_det = now
                tracking = True
                # Velocity-limited EMA
                tx = vel_limit(sx, raw_x, VELOCITY_CAP)
                ty = vel_limit(sy, raw_y, VELOCITY_CAP)
                sx += ALPHA * (tx - sx)
                sy += ALPHA * (ty - sy)

            elif tracking and (now - last_det) < HOLD_SECS:
                # Hold: mantém posição congelada (sem nenhum drift)
                pass

            else:
                # Retorno suave ao centro
                tracking = False
                sx += RETURN_ALPHA * (0.0 - sx)
                sy += RETURN_ALPHA * (0.0 - sy)
                if abs(sx) < 0.003 and abs(sy) < 0.003:
                    sx = sy = 0.0

            # ── HUD ───────────────────────────────────────────────
            if not args.headless:
                label = "TRACKING" if tracking else "SEARCHING"
                color = (0, 255, 0) if tracking else (0, 100, 255)
                cv2.putText(frame, f"IRIS v4: {label}", (10, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                cv2.putText(frame, f"X={sx:+.2f}  Y={sy:+.2f}", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1)

            # ── MQTT ──────────────────────────────────────────────
            if now - last_send >= send_interval:
                payload = {
                    "faceDetected": tracking,
                    "faceX": round(sx, 4),
                    "faceY": round(sy, 4)
                }
                client.publish("alx/vision/face", json.dumps(payload))
                last_send = now

            if not args.headless:
                cv2.imshow("IRIS Face Tracker v4", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                # Se headless, podemos suportar a saída por Ctrl+C no terminal
                pass

    except KeyboardInterrupt:
        print("\nEncerrado pelo usuário.")
    finally:
        face_mesh.close()
        cap.release()
        cv2.destroyAllWindows()
        client.loop_stop()
        client.disconnect()
        print("Recursos liberados.")


if __name__ == "__main__":
    main()
