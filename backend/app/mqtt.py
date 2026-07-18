import json
import logging
import paho.mqtt.client as mqtt

logger = logging.getLogger("IRIS_MQTT")

class MQTTManager:
    def __init__(self, broker_host="localhost", broker_port=1883, on_message_callback=None):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.on_message_callback = on_message_callback
        
        # Inicialização compatível com paho-mqtt v2 e v1
        try:
            self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        except AttributeError:
            self.client = mqtt.Client()
            
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

    def on_connect(self, client, userdata, flags, rc, properties=None):
        # O rc para v2 pode ser uma classe ReasonCode. O código de sucesso costuma ter valor inteiro 0 ou nome 'Success'.
        # Para compatibilidade, verificamos se rc é igual a 0 ou se str(rc) indica sucesso.
        rc_val = getattr(rc, "value", rc)
        if rc_val == 0:
            logger.info("Conectado ao Broker MQTT local com sucesso!")
            topics = [
                ("alx/case/temperature", 0),
                ("alx/case/humidity", 0),
                ("alx/vision/face", 0),
                ("alx/voice/state", 0),
                ("alx/status", 0),
            ]
            self.client.subscribe(topics)
            logger.info(f"Subscrito nos tópicos: {[t[0] for t in topics]}")
        else:
            logger.error(f"Erro na conexão com o Broker MQTT. Código: {rc}")

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        try:
            payload_str = msg.payload.decode("utf-8")
        except Exception as e:
            logger.error(f"Erro ao decodificar payload no tópico {topic}: {e}")
            return
            
        logger.debug(f"Mensagem recebida no MQTT - Tópico: {topic} | Payload: {payload_str}")
        
        if self.on_message_callback:
            try:
                self.on_message_callback(topic, payload_str)
            except Exception as e:
                logger.error(f"Erro na execução do callback do MQTT para {topic}: {e}")

    def on_disconnect(self, client, userdata, rc, properties=None):
        logger.warning(f"Desconectado do Broker MQTT. Código: {rc}")

    def start(self):
        try:
            logger.info(f"Tentando conectar ao Broker MQTT em {self.broker_host}:{self.broker_port}...")
            self.client.connect(self.broker_host, self.broker_port, keepalive=60)
            self.client.loop_start()
            logger.info("Loop do cliente MQTT iniciado em background.")
        except Exception as e:
            logger.error(f"Não foi possível conectar ao Broker MQTT. Erro: {e}")

    def stop(self):
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Loop do cliente MQTT parado.")

    def publish(self, topic, payload, qos=0, retain=False):
        try:
            self.client.publish(topic, payload, qos=qos, retain=retain)
            logger.info(f"Publicado no MQTT - Tópico: {topic} | Payload: {payload}")
        except Exception as e:
            logger.error(f"Erro ao publicar no MQTT no tópico {topic}: {e}")
