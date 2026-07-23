export type VoiceProviderState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'connecting'
  | 'error';

export type VoiceConnectionState = 'offline' | 'connecting' | 'online' | 'error';

export interface VoiceProviderCallbacks {
  onStateChange: (state: VoiceProviderState) => void;
  onConnectionChange: (state: VoiceConnectionState) => void;
  onTextReceived: (text: string) => void;
  onToolExecuted: (name: string, args: any, result: any) => void;
}

export interface VoiceProviderConnectOptions {
  credential?: string;
  model?: string;
  callbacks: VoiceProviderCallbacks;
}

export interface VoiceProvider {
  connect(options: VoiceProviderConnectOptions): Promise<void>;
  disconnect(): void;
  mute(): void;
  unmute(): void;
}
