import { globalAudioAnalyser } from '../utils/audioAnalyser';
import type {
  VoiceProvider,
  VoiceProviderCallbacks,
  VoiceProviderConnectOptions,
} from './voiceProvider';

const VOICE_SESSION_URL = 'http://127.0.0.1:8001/api/v1/voice/session';
const VOICE_NEGOTIATION_TIMEOUT_MS = 15_000;

interface RealtimeServerEvent {
  type?: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
  response?: { status?: string };
}

class OpenAIRealtimeProvider implements VoiceProvider {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private micStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private callbacks: VoiceProviderCallbacks | null = null;
  private negotiationAbortController: AbortController | null = null;
  private negotiationTimeout: ReturnType<typeof setTimeout> | null = null;
  private isMuted = false;
  private transcript = '';

  async connect({ callbacks }: VoiceProviderConnectOptions): Promise<void> {
    this.disconnect();
    this.callbacks = callbacks;
    this.isMuted = false;
    this.transcript = '';
    callbacks.onStateChange('connecting');
    callbacks.onConnectionChange('connecting');

    const abortController = new AbortController();
    this.negotiationAbortController = abortController;
    this.negotiationTimeout = setTimeout(() => {
      if (this.negotiationAbortController !== abortController) return;
      this.reportError('A negociação da sessão de voz excedeu o tempo limite.');
      this.cleanup();
    }, VOICE_NEGOTIATION_TIMEOUT_MS);

    try {
      const peerConnection = new RTCPeerConnection();
      this.peerConnection = peerConnection;
      this.configurePeerConnection(peerConnection);

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (
        abortController.signal.aborted
        || this.negotiationAbortController !== abortController
      ) {
        micStream.getTracks().forEach(track => track.stop());
        return;
      }

      this.micStream = micStream;
      this.setMicrophoneEnabled(true);
      globalAudioAnalyser.init(micStream);
      micStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, micStream);
      });

      const dataChannel = peerConnection.createDataChannel('oai-events');
      this.dataChannel = dataChannel;
      this.configureDataChannel(dataChannel);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (!offer.sdp || offer.sdp.trim().length === 0 || !offer.sdp.startsWith('v=0')) {
        throw new Error('Oferta SDP local inválida; a sessão de voz não foi enviada ao backend.');
      }

      const response = await fetch(VOICE_SESSION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(await this.readBackendError(response));
      }

      const answerSdp = await response.text();
      if (
        abortController.signal.aborted
        || this.negotiationAbortController !== abortController
      ) return;

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
      this.finishNegotiation(abortController);
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === 'AbortError')
        || this.negotiationAbortController !== abortController
      ) return;
      this.handleConnectionError(error);
    }
  }

  disconnect(): void {
    const callbacks = this.callbacks;
    this.cleanup();
    callbacks?.onStateChange('idle');
    callbacks?.onConnectionChange('offline');
    this.callbacks = null;
  }

  mute(): void {
    this.isMuted = true;
    this.setMicrophoneEnabled(false);
  }

  unmute(): void {
    this.isMuted = false;
    this.setMicrophoneEnabled(true);
  }

  private configurePeerConnection(peerConnection: RTCPeerConnection): void {
    peerConnection.ontrack = event => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.remoteAudio = new Audio();
      this.remoteAudio.autoplay = true;
      this.remoteAudio.srcObject = stream;
      this.remoteAudio.play().catch(error => {
        console.error('Não foi possível reproduzir o áudio Realtime:', error);
        this.reportError('O navegador bloqueou a reprodução do áudio da IRIS.');
      });
    };

    peerConnection.onconnectionstatechange = () => {
      switch (peerConnection.connectionState) {
        case 'connected':
          this.callbacks?.onConnectionChange('online');
          this.callbacks?.onStateChange('idle');
          break;
        case 'failed':
          this.reportError('A conexão WebRTC com a OpenAI falhou.');
          this.cleanup();
          break;
        case 'disconnected':
        case 'closed':
          this.callbacks?.onConnectionChange('offline');
          this.callbacks?.onStateChange('idle');
          break;
      }
    };
  }

  private configureDataChannel(dataChannel: RTCDataChannel): void {
    dataChannel.onmessage = event => {
      try {
        this.handleServerEvent(JSON.parse(event.data) as RealtimeServerEvent);
      } catch (error) {
        console.error('Evento Realtime inválido:', error);
      }
    };

    dataChannel.onerror = () => {
      this.reportError('O canal de eventos da OpenAI apresentou erro.');
    };
  }

  private handleServerEvent(event: RealtimeServerEvent): void {
    switch (event.type) {
      case 'session.created':
        this.callbacks?.onStateChange('idle');
        break;
      case 'input_audio_buffer.speech_started':
        this.callbacks?.onStateChange('listening');
        break;
      case 'input_audio_buffer.speech_stopped':
        this.callbacks?.onStateChange('thinking');
        break;
      case 'response.created':
        this.transcript = '';
        this.callbacks?.onStateChange('thinking');
        break;
      case 'response.output_audio.delta':
        this.callbacks?.onStateChange('speaking');
        break;
      case 'response.output_audio_transcript.delta':
        this.transcript += event.delta ?? '';
        this.callbacks?.onTextReceived(this.transcript);
        break;
      case 'response.output_audio_transcript.done':
        this.transcript = event.transcript ?? this.transcript;
        this.callbacks?.onTextReceived(this.transcript);
        break;
      case 'output_audio_buffer.stopped':
        this.transcript = '';
        this.callbacks?.onStateChange('idle');
        break;
      case 'response.done':
        if (event.response?.status === 'failed') {
          this.reportError('A OpenAI não conseguiu concluir a resposta.');
        }
        break;
      case 'error':
        this.reportError(event.error?.message ?? 'A OpenAI retornou um erro de sessão.');
        break;
    }
  }

  private async readBackendError(response: Response): Promise<string> {
    try {
      const payload = await response.json() as { detail?: string };
      return payload.detail ?? `Backend de voz respondeu com erro (${response.status}).`;
    } catch {
      return `Backend de voz respondeu com erro (${response.status}).`;
    }
  }

  private handleConnectionError(error: unknown): void {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      this.reportError('Acesso ao microfone negado.');
    } else if (error instanceof TypeError) {
      this.reportError('Backend de voz indisponível.');
    } else if (error instanceof Error) {
      this.reportError(error.message);
    } else {
      this.reportError('Não foi possível iniciar a sessão de voz.');
    }
    this.cleanup();
  }

  private reportError(message: string): void {
    console.error('OpenAI Realtime:', message);
    this.callbacks?.onTextReceived(message);
    this.callbacks?.onStateChange('error');
    this.callbacks?.onConnectionChange('error');
  }

  private setMicrophoneEnabled(enabled: boolean): void {
    this.micStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled && !this.isMuted;
    });
  }

  private finishNegotiation(abortController: AbortController): void {
    if (this.negotiationAbortController !== abortController) return;
    this.negotiationAbortController = null;
    if (this.negotiationTimeout) {
      clearTimeout(this.negotiationTimeout);
      this.negotiationTimeout = null;
    }
  }

  private cleanup(): void {
    this.negotiationAbortController?.abort();
    this.negotiationAbortController = null;
    if (this.negotiationTimeout) {
      clearTimeout(this.negotiationTimeout);
      this.negotiationTimeout = null;
    }

    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.onerror = null;
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.micStream?.getTracks().forEach(track => track.stop());
    this.micStream = null;
    globalAudioAnalyser.disconnect();

    if (this.remoteAudio) {
      this.remoteAudio.pause();
      this.remoteAudio.srcObject = null;
      this.remoteAudio = null;
    }
  }
}

export const openAIRealtimeProvider: VoiceProvider = new OpenAIRealtimeProvider();
