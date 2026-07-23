// src/utils/audioAnalyser.ts

class GlobalAudioAnalyser {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: any = new Uint8Array(0);

  // Inicializa o analyser com o microfone do usuário
  init(stream: MediaStream) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.source?.disconnect();
      this.analyser?.disconnect();
      this.source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128; // tamanho compacto para performance ideal no Canvas
      this.source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      console.log('AudioAnalyser iniciado com sucesso!');
    } catch (e) {
      console.error('Erro ao inicializar AudioAnalyser:', e);
    }
  }

  // Permite conectar nós de áudio extras (como o player de voz da IRIS)
  connectNode(node: AudioNode) {
    if (this.analyser) {
      try {
        node.connect(this.analyser);
      } catch (e) {
        console.error('Erro ao conectar node no Analyser:', e);
      }
    }
  }

  getAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getAverageFrequency(): number {
    if (!this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length;
  }

  getFrequencyData(): any {
    if (!this.analyser) return new Uint8Array(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  disconnect(): void {
    this.source?.disconnect();
    this.source = null;
    this.analyser?.disconnect();
    this.analyser = null;
    this.dataArray = new Uint8Array(0);
  }
}

export const globalAudioAnalyser = new GlobalAudioAnalyser();
