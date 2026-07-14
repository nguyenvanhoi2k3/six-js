export type TickerListener = (time: number, deltaMs: number, frame: number) => void;

const now = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());

/**
 * Single shared rAF-driven clock. Only one listener is ever registered in steady state -
 * the root Timeline's update function (see core/root.ts) - everything else receives time
 * via recursive Animation.render() calls, not by registering its own ticker callback.
 */
export class Ticker {
  private listeners: TickerListener[] = [];
  private i = 0; // live cursor into `listeners` during dispatch, adjusted by remove()

  private frame = 0;
  private timeMs = 0;
  private deltaMs = 0;

  private startTime = now();
  private lastUpdate = this.startTime;

  private lagThreshold = 500;
  private adjustedLag = 33;

  private gap = 1000 / 240;
  private nextTime = this.gap;

  private rafId: number | null = null;
  private manual: boolean;

  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(opts: { manual?: boolean } = {}) {
    this.manual = !!opts.manual;
  }

  private request(cb: () => void): number {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(cb);
    return setTimeout(cb, 16) as unknown as number;
  }

  private cancel(id: number): void {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
  }

  private loop = (): void => {
    if (this.manual) return;
    this.advance(now() - this.lastUpdate);
    if (this.rafId !== null) this.rafId = this.request(this.loop);
  };

  private advance(elapsed: number): void {
    if (elapsed > this.lagThreshold || elapsed < 0) {
      this.startTime += elapsed - this.adjustedLag;
    }
    this.lastUpdate += elapsed;

    const elapsedSinceStart = this.lastUpdate - this.startTime;
    const overlap = elapsedSinceStart - this.nextTime;

    if (overlap < 0) return;

    this.frame++;
    this.deltaMs = elapsedSinceStart - this.timeMs * 1000;
    this.timeMs = elapsedSinceStart / 1000;
    this.nextTime += overlap >= this.gap ? overlap + 4 : this.gap;

    this.dispatch();
  }

  private dispatch(): void {
    const time = this.timeMs;
    const delta = this.deltaMs;
    const frame = this.frame;

    for (this.i = 0; this.i < this.listeners.length; this.i++) {
      this.listeners[this.i](time, delta, frame);
    }
  }

  add(listener: TickerListener): TickerListener {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
      this.wake();
    }
    return listener;
  }

  remove(listener: TickerListener): void {
    const index = this.listeners.indexOf(listener);
    if (index === -1) return;

    this.listeners.splice(index, 1);
    if (index <= this.i) this.i--;
  }

  /** Restarts the internal clock (used on wake so a long sleep doesn't register as lag) and starts the rAF loop. */
  wake(): void {
    if (this.manual || this.rafId !== null) return;

    const n = now();
    this.startTime = n - this.timeMs * 1000;
    this.lastUpdate = n;
    this.rafId = this.request(this.loop);
  }

  sleep(): void {
    if (this.rafId !== null) {
      this.cancel(this.rafId);
      this.rafId = null;
    }
  }

  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(deltaMs = 1000 / 60): void {
    this.frame++;
    this.deltaMs = deltaMs;
    this.timeMs += deltaMs / 1000;
    this.lastUpdate = now();
    this.startTime = this.lastUpdate - this.timeMs * 1000;
    this.nextTime = this.timeMs * 1000 + this.gap;

    this.dispatch();
  }

  fps(fps: number): void {
    const f = Math.max(1, fps);
    this.gap = 1000 / f;
    this.nextTime = this.timeMs * 1000 + this.gap;
  }

  lagSmoothing(threshold = 500, adjustedLag = 33): void {
    this.lagThreshold = threshold || Infinity;
    this.adjustedLag = Math.min(adjustedLag, this.lagThreshold);
  }

  deltaRatio(fps = 60): number {
    return this.deltaMs / (1000 / fps);
  }

  get time(): number {
    return this.timeMs;
  }

  get delta(): number {
    return this.deltaMs;
  }

  get currentFrame(): number {
    return this.frame;
  }

  get isAwake(): boolean {
    return this.rafId !== null;
  }

  get listenerCount(): number {
    return this.listeners.length;
  }
}

export const ticker = new Ticker();
