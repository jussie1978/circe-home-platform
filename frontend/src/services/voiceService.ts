import { globalAudioAnalyser } from '../utils/audioAnalyser';
import type {
  VoiceProvider,
  VoiceProviderCallbacks,
  VoiceProviderConnectOptions,
} from './voiceProvider';

class GeminiLiveProvider implements VoiceProvider {
  private ws: WebSocket | null = null;
  private audioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private callbacks: VoiceProviderCallbacks | null = null;
  private isMuted = false;
  
  // Fila de reprodução de áudio de saída
  private nextPlayTime = 0;
  private audioQueue: AudioBufferSourceNode[] = [];

  constructor() {
    this.audioCtx = globalAudioAnalyser.getAudioContext();
  }

  async connect({
    credential: apiKey,
    model = 'gemini-2.0-flash-exp',
    callbacks,
  }: VoiceProviderConnectOptions) {
    if (this.ws) {
      this.disconnect();
    }

    this.isMuted = false;
    this.callbacks = callbacks;
    this.callbacks.onStateChange('connecting');
    this.callbacks.onConnectionChange('connecting');

    if (!apiKey) {
      this.callbacks.onTextReceived('Credencial Gemini ausente para o adaptador legado.');
      this.callbacks.onStateChange('error');
      this.callbacks.onConnectionChange('error');
      return;
    }

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    
    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.error('Erro ao abrir WebSocket:', e);
      this.callbacks.onStateChange('error');
      return;
    }

    this.ws.onopen = () => {
      console.log('Gemini Live WebSocket conectado!');
      this.callbacks?.onConnectionChange('online');
      this.sendSetup(model);
      this.startMicRecording();
    };

    this.ws.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data);
        await this.handleMessage(data);
      } catch (err) {
        console.error('Erro ao ler mensagem WebSocket:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('Erro no WebSocket do Gemini Live:', err);
      this.callbacks?.onStateChange('error');
      this.callbacks?.onConnectionChange('error');
    };

    this.ws.onclose = () => {
      console.log('Gemini Live WebSocket fechado.');
      this.stopMicRecording();
      this.callbacks?.onStateChange('idle');
      this.callbacks?.onConnectionChange('offline');
    };
  }

  disconnect() {
    this.callbacks?.onStateChange('idle');
    this.callbacks?.onConnectionChange('offline');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopMicRecording();
    this.stopAudioPlayback();
    this.callbacks = null;
  }

  mute() {
    this.isMuted = true;
    this.setMicrophoneEnabled(false);
  }

  unmute() {
    this.isMuted = false;
    this.setMicrophoneEnabled(true);
  }

  private sendSetup(model: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupMsg = {
      setup: {
        model: `models/${model}`,
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: 'Puck' // Opções: Puck, Charon, Aoede, Fenrir, Kore
              }
            }
          }
        },
        system_instruction: {
          parts: [
            {
              text: 'Você é a IRIS (Interactive Residential Intelligence System), a inteligência artificial central do gabinete Alienware ALX e da casa inteligente CIRCE. Responda em português brasileiro de forma direta, concisa e conversacional (frases curtas). Você pode controlar o gabinete (ventiladores, LEDs) e consultar sensores de presença na casa chamando as ferramentas fornecidas. Mantenha o tom inteligente e amigável.'
            }
          ]
        },
        tools: [
          {
            function_declarations: [
              {
                name: 'control_fans',
                description: 'Ajusta a velocidade dos ventiladores do gabinete Alienware ALX.',
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    speed: { type: 'INTEGER', description: 'Velocidade desejada em percentual de 0 a 100.' }
                  },
                  required: ['speed']
                }
              },
              {
                name: 'control_leds',
                description: 'Altera a cor dos LEDs RGB da fita do gabinete.',
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    color: { type: 'STRING', description: 'Cor em formato hexadecimal HTML (ex: #FF0000 para vermelho).' }
                  },
                  required: ['color']
                }
              },
              {
                name: 'check_temperature',
                description: 'Retorna a leitura atual de temperatura e umidade física do sensor DHT22.',
                parameters: {
                  type: 'OBJECT',
                  properties: {}
                }
              },
              {
                name: 'check_presence',
                description: 'Verifica a quantidade de pessoas presentes em uma zona ou cômodo da casa via câmeras.',
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    zone: { type: 'STRING', description: 'O cômodo ou zona da casa (ex: sala, cozinha, garagem).' }
                  },
                  required: ['zone']
                }
              }
            ]
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(setupMsg));
    console.log('Mensagem de Setup enviada ao Gemini.');
    this.callbacks?.onStateChange('idle');
  }

  private async startMicRecording() {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setMicrophoneEnabled(!this.isMuted);
      
      // Habilitar analisador visual
      globalAudioAnalyser.init(this.micStream);
      
      this.audioCtx = globalAudioAnalyser.getAudioContext();
      if (!this.audioCtx) return;

      this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);
      
      // Criar ScriptProcessorNode para resampling do mic (tipicamente 44.1kHz -> 16kHz)
      this.scriptProcessor = this.audioCtx.createScriptProcessor(2048, 1, 1);
      
      const sampleRate = this.audioCtx.sampleRate;
      
      this.scriptProcessor.onaudioprocess = (e) => {
        if (this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Conversão e downsampling para 16kHz
        const pcm16 = this.downsampleBuffer(inputData, sampleRate, 16000);
        const base64Audio = this.arrayBufferToBase64(pcm16.buffer);
        
        // Envia o chunk binário envelopado em JSON
        const audioMsg = {
          realtime_input: {
            media_chunks: [
              {
                mime_type: 'audio/pcm',
                data: base64Audio
              }
            ]
          }
        };
        
        this.ws.send(JSON.stringify(audioMsg));
        
        // Se o microfone está captando som ativo, atualiza estado visual para listening
        const currentAvg = globalAudioAnalyser.getAverageFrequency();
        if (currentAvg > 10) {
          this.callbacks?.onStateChange('listening');
        }
      };

      this.micSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioCtx.destination);
      console.log('Gravação de microfone ativa.');

    } catch (e) {
      console.error('Erro ao acessar microfone:', e);
      this.callbacks?.onStateChange('error');
      this.callbacks?.onConnectionChange('error');
    }
  }

  private stopMicRecording() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    console.log('Gravação do microfone desativada.');
  }

  private setMicrophoneEnabled(enabled: boolean) {
    this.micStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  private async handleMessage(msg: any) {
    if (msg.server_content) {
      const turn = msg.server_content.model_turn;
      if (turn && turn.parts) {
        for (const part of turn.parts) {
          // Se receber texto da transcrição
          if (part.text) {
            this.callbacks?.onTextReceived(part.text);
          }
          // Se receber pedaço de áudio de voz da resposta (PCM 24kHz)
          if (part.inline_data && part.inline_data.mime_type?.includes('audio/pcm')) {
            this.callbacks?.onStateChange('speaking');
            const base64Data = part.inline_data.data;
            const arrayBuffer = this.base64ToArrayBuffer(base64Data);
            this.playReceivedAudioChunk(arrayBuffer);
          }
        }
      }
      
      // Suporte nativo ao evento de interrupção (se o usuário começou a falar, cancela falas pendentes)
      if (msg.server_content.interrupted) {
        console.log('IRIS interrompida pelo usuário.');
        this.stopAudioPlayback();
        this.callbacks?.onStateChange('listening');
      }
    }

    // Processamento de chamadas de função (Function Calling)
    if (msg.tool_call) {
      const calls = msg.tool_call.function_calls;
      if (calls) {
        for (const call of calls) {
          const { name, args, id } = call;
          console.log(`Gemini solicitou executar função: ${name} com args:`, args);
          
          let result = {};
          try {
            result = await this.executeLocalFunction(name, args);
            this.callbacks?.onToolExecuted(name, args, result);
          } catch (err) {
            console.error(`Erro ao executar função local ${name}:`, err);
            result = { error: 'Failed to execute tool locally' };
          }

          // Retorna a resposta da função via Websocket
          const responseMsg = {
            tool_response: {
              function_responses: [
                {
                  name,
                  response: result,
                  id
                }
              ]
            }
          };
          this.ws?.send(JSON.stringify(responseMsg));
          console.log('Resposta da função enviada de volta ao Gemini:', responseMsg);
        }
      }
    }
  }

  private async executeLocalFunction(name: string, args: any): Promise<any> {
    const API_BASE = 'http://127.0.0.1:8001/api/v1';

    if (name === 'control_fans') {
      const res = await fetch(`${API_BASE}/controls/fans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: args.speed })
      });
      return await res.json();
    }
    
    if (name === 'control_leds') {
      const res = await fetch(`${API_BASE}/controls/leds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: args.color })
      });
      return await res.json();
    }
    
    if (name === 'check_temperature') {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      return {
        temperature: data.state.temperature,
        humidity: data.state.humidity,
        fan_speed: data.state.fan_speed
      };
    }

    if (name === 'check_presence') {
      // Simula a consulta de presença no endpoint do backend
      // Na R4.0 real, isso chamará o Vision Service e aguardará o retorno do evento.
      const zone = args.zone || 'sala';
      // Mapeamento fictício de zonas para teste
      return {
        zone,
        person_count: 1,
        status: 'occupied',
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(`Função desconhecida: ${name}`);
  }

  private playReceivedAudioChunk(arrayBuffer: ArrayBuffer) {
    if (!this.audioCtx) return;
    
    // Converte o PCM 16-bit (little-endian) recebido em Float32Array
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Criar buffer do Web Audio para reprodução (24kHz Mono conforme retorno do Gemini)
    const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Conectar ao destination e também ao Analisador global (para deforma o Orbe 3D enquanto a IRIS fala!)
    source.connect(this.audioCtx.destination);
    globalAudioAnalyser.connectNode(source);

    // Escalonamento de tempo sem gaps para reprodução de áudio fluida
    const currentTime = this.audioCtx.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.05; // Pequeno delay inicial de segurança para buffer
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
    
    this.audioQueue.push(source);
    
    source.onended = () => {
      this.audioQueue = this.audioQueue.filter(item => item !== source);
      if (this.audioQueue.length === 0) {
        this.callbacks?.onStateChange('idle');
      }
    };
  }

  private stopAudioPlayback() {
    this.audioQueue.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    this.audioQueue = [];
    this.nextPlayTime = 0;
  }

  // Utilitários de processamento de áudio binário
  private downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Int16Array {
    if (inputSampleRate === outputSampleRate) {
      return this.convertFloat32ToInt16(buffer);
    }
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = Math.min(1, Math.max(-1, accum / count)) * 0x7FFF;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private convertFloat32ToInt16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7FFF;
    }
    return buf;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer as ArrayBuffer;
  }
}

export const geminiLiveProvider: VoiceProvider = new GeminiLiveProvider();
