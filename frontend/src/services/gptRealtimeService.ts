// src/services/gptRealtimeService.ts
import { VoiceServiceCallbacks } from './voiceService';

class GptRealtimeService {
  private ws: WebSocket | null = null;
  private callbacks: VoiceServiceCallbacks | null = null;

  connect(_apiKey: string, model: string = 'gpt-4o-realtime-preview-2024-10-01', callbacks: VoiceServiceCallbacks) {
    this.callbacks = callbacks;
    this.callbacks.onStateChange('connecting');

    // Nota: A API Realtime da OpenAI exige cabeçalhos customizados (Authorization Bearer).
    // Como navegadores nativos não enviam headers customizados em WebSockets,
    // o padrão é conectar a um proxy/relay local no nosso backend ou usar
    // parâmetros de URL se suportados pelo provedor.
    // Aqui implementamos a estrutura base que se conecta via WebSocket.
    
    const url = `wss://api.openai.com/v1/realtime?model=${model}`;
    
    try {
      // Como não podemos passar headers no browser direto, esta chamada falhará em navegadores normais
      // se não houver um relay intermediário configurado. Deixamos a estrutura de handshake documentada.
      this.ws = new WebSocket(url);
    } catch (e) {
      console.error('Erro de inicialização do WebSocket do GPT:', e);
      this.callbacks.onStateChange('error');
      return;
    }

    this.ws.onopen = () => {
      console.log('GPT Realtime WebSocket conectado! Iniciando handshake...');
      this.sendInitialSetup();
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('Erro ao ler mensagem GPT:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('Erro no WebSocket do GPT Realtime:', err);
      this.callbacks?.onStateChange('error');
    };

    this.ws.onclose = () => {
      console.log('GPT Realtime WebSocket fechado.');
      this.callbacks?.onStateChange('idle');
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks = null;
  }

  private sendInitialSetup() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Mensagem de configuração inicial (session.update) para o GPT
    const setupMsg = {
      type: 'session.update',
      session: {
        modalities: ['audio', 'text'],
        instructions: 'Você é a IRIS, assistente virtual do Alienware ALX. Responda em português de forma concisa e natural.',
        voice: 'alloy', // alloy, echo, shimmer
        input_audio_format: 'g711_ulaw', // ou pcm16
        output_audio_format: 'pcm16',
        tools: [
          {
            type: 'function',
            name: 'control_fans',
            description: 'Ajusta ventiladores do case.',
            parameters: {
              type: 'object',
              properties: {
                speed: { type: 'integer' }
              },
              required: ['speed']
            }
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(setupMsg));
    this.callbacks?.onStateChange('idle');
  }

  private handleMessage(msg: any) {
    // Processamento de respostas e chamadas de função do GPT
    console.log('Mensagem do GPT Realtime recebida:', msg);
    
    // Tratamento de transcrição
    if (msg.type === 'response.audio_transcript.delta') {
      this.callbacks?.onTextReceived(msg.delta);
    }
    
    // Suporte ao audio de saída
    if (msg.type === 'response.audio.delta') {
      this.callbacks?.onStateChange('speaking');
      // Reprodução de áudio binário
    }

    // Tratamento de interrupção
    if (msg.type === 'input_audio_buffer.speech_started') {
      this.callbacks?.onStateChange('listening');
    }

    // Chamadas de função
    if (msg.type === 'response.function_call_arguments.done') {
      console.log('GPT solicitou chamada de função:', msg.name, msg.arguments);
      // Executa localmente e responde com conversation.item.create + response.create
    }
  }
}

export const gptRealtimeService = new GptRealtimeService();
