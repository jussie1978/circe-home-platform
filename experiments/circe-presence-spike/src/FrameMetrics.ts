export interface FrameSnapshot {
  fps: number;
  frameTimeMs: number;
}

export class FrameMetrics {
  private readonly samples: number[] = [];
  private previousTime: number | null = null;
  private readonly windowSize: number;

  constructor(windowSize = 90) {
    this.windowSize = windowSize;
  }

  record(now: number): FrameSnapshot | null {
    if (this.previousTime === null) {
      this.previousTime = now;
      return null;
    }

    const frameTimeMs = now - this.previousTime;
    this.previousTime = now;

    if (frameTimeMs <= 0 || frameTimeMs > 1_000) {
      return null;
    }

    this.samples.push(frameTimeMs);
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }

    const averageFrameTime = this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length;
    return {
      fps: 1_000 / averageFrameTime,
      frameTimeMs: averageFrameTime,
    };
  }

  reset(): void {
    this.samples.length = 0;
    this.previousTime = null;
  }
}

