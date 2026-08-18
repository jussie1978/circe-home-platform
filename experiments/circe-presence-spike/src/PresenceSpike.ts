import * as THREE from 'three/webgpu';
import { FrameMetrics } from './FrameMetrics';
import { PARTICLE_COUNT, ParticleField } from './ParticleField';

export type PresenceState = 'idle' | 'listening';

interface BackendFlags {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
  constructor?: { name?: string };
}

export class PresenceSpike {
  private readonly stage: HTMLElement;
  private readonly backendOutput: HTMLElement;
  private readonly fpsOutput: HTMLElement;
  private readonly frameOutput: HTMLElement;
  private readonly stateOutput: HTMLElement;
  private readonly motionOutput: HTMLElement;
  private readonly errorOutput: HTMLOutputElement;
  private readonly idleButton: HTMLButtonElement;
  private readonly listeningButton: HTMLButtonElement;
  private readonly fullscreenButton: HTMLButtonElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(48, 1, 0.05, 50);
  private readonly renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
  private readonly particles = new ParticleField();
  private readonly metrics = new FrameMetrics();
  private readonly reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  private stateTarget = 0;
  private stateValue = 0;
  private lastAnimationTime: number | null = null;
  private lastHudUpdate = 0;
  private disposed = false;

  constructor() {
    this.stage = this.requireElement<HTMLElement>('stage');
    this.backendOutput = this.requireElement<HTMLElement>('metric-backend');
    this.fpsOutput = this.requireElement<HTMLElement>('metric-fps');
    this.frameOutput = this.requireElement<HTMLElement>('metric-frame');
    this.stateOutput = this.requireElement<HTMLElement>('metric-state');
    this.motionOutput = this.requireElement<HTMLElement>('motion-mode');
    this.errorOutput = this.requireElement<HTMLOutputElement>('error-message');
    this.idleButton = this.requireElement<HTMLButtonElement>('state-idle');
    this.listeningButton = this.requireElement<HTMLButtonElement>('state-listening');
    this.fullscreenButton = this.requireElement<HTMLButtonElement>('fullscreen');

    this.camera.position.set(0, 0, 4.5);
    this.scene.background = new THREE.Color(0x000000);
    this.scene.add(this.particles.mesh);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  }

  async initialize(): Promise<void> {
    this.stage.appendChild(this.renderer.domElement);
    this.resize();
    this.installListeners();
    this.applyReducedMotion(this.reducedMotionQuery.matches);

    await this.renderer.init();
    this.backendOutput.textContent = this.readBackendName();
    this.particles.initialize(this.renderer);
    this.renderer.setAnimationLoop(this.animate);
  }

  readonly dispose = (): void => {
    if (this.disposed) return;
    this.disposed = true;

    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('beforeunload', this.dispose);
    this.reducedMotionQuery.removeEventListener('change', this.handleReducedMotionChange);
    this.idleButton.removeEventListener('click', this.selectIdle);
    this.listeningButton.removeEventListener('click', this.selectListening);
    this.fullscreenButton.removeEventListener('click', this.toggleFullscreen);

    this.particles.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.metrics.reset();
  };

  showError(error: unknown): void {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    this.backendOutput.textContent = 'indisponível';
    this.errorOutput.hidden = false;
    this.errorOutput.textContent = `Não foi possível iniciar o renderer do spike.\n${message}`;
  }

  private readonly animate = (time: number): void => {
    if (this.disposed) return;

    const elapsedSeconds = this.lastAnimationTime === null
      ? 0
      : Math.max((time - this.lastAnimationTime) / 1_000, 0);
    this.lastAnimationTime = time;

    const transitionDelta = Math.min(elapsedSeconds, 0.1);
    this.stateValue = THREE.MathUtils.damp(this.stateValue, this.stateTarget, 4.8, transitionDelta);
    this.particles.stateMix.value = this.stateValue;
    this.particles.advance(this.renderer, elapsedSeconds);
    this.renderer.render(this.scene, this.camera);

    const snapshot = this.metrics.record(time);
    if (snapshot && time - this.lastHudUpdate >= 250) {
      this.fpsOutput.textContent = snapshot.fps.toFixed(1);
      this.frameOutput.textContent = `${snapshot.frameTimeMs.toFixed(2)} ms`;
      this.lastHudUpdate = time;
    }
  };

  private readonly resize = (): void => {
    const width = Math.max(1, this.stage.clientWidth);
    const height = Math.max(1, this.stage.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private installListeners(): void {
    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('beforeunload', this.dispose);
    this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange);
    this.idleButton.addEventListener('click', this.selectIdle);
    this.listeningButton.addEventListener('click', this.selectListening);
    this.fullscreenButton.addEventListener('click', this.toggleFullscreen);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;

    if (event.key === '1' || event.key.toLowerCase() === 'i') {
      this.setState('idle');
    } else if (event.key === '2' || event.key.toLowerCase() === 'l') {
      this.setState('listening');
    } else if (event.key.toLowerCase() === 'f') {
      void this.toggleFullscreen();
    }
  };

  private readonly selectIdle = (): void => this.setState('idle');
  private readonly selectListening = (): void => this.setState('listening');

  private setState(nextState: PresenceState): void {
    this.stateTarget = nextState === 'listening' ? 1 : 0;
    this.stateOutput.textContent = nextState;
    this.idleButton.setAttribute('aria-pressed', String(nextState === 'idle'));
    this.listeningButton.setAttribute('aria-pressed', String(nextState === 'listening'));
  }

  private readonly toggleFullscreen = async (): Promise<void> => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorOutput.hidden = false;
      this.errorOutput.textContent = `Não foi possível alternar o modo de tela cheia.\n${message}`;
    }
  };

  private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    this.applyReducedMotion(event.matches);
  };

  private applyReducedMotion(reduced: boolean): void {
    this.particles.motionScale.value = reduced ? 0.28 : 1;
    this.motionOutput.textContent = reduced ? 'movimento reduzido' : '';
  }

  private readBackendName(): string {
    const backend = this.renderer.backend as BackendFlags;
    if (backend.isWebGPUBackend) return 'WebGPU';
    if (backend.isWebGLBackend) return 'WebGL 2 fallback';
    return backend.constructor?.name ?? 'desconhecido';
  }

  private requireElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Elemento obrigatório ausente: #${id}`);
    return element as T;
  }
}

export const SPIKE_PARTICLE_COUNT = PARTICLE_COUNT;
