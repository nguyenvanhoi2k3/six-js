import { ticker } from "./ticker";
import { Animatable } from "./animatable";

export type PlayableEvent = "start" | "update" | "complete" | "repeat" | "reverseComplete";

export interface PlayableOptions {
  autoplay?: boolean;
  delay?: number;
  repeat?: number;
  repeatDelay?: number;
  boomerang?: boolean;
}

export class Playable {
  private animatable: Animatable;
  private elapsed = 0; 
  private rate = 1;
  private running = false;
  private dead = false;
  private listeners: Partial<Record<PlayableEvent, Set<() => void>>> = {};

  private readonly delay: number;
  private readonly repeat: number;
  private readonly repeatDelay: number;
  private readonly boomerang: boolean;

  private repeatsDone = 0;
  private waitRemaining: number;
  private hasFiredStart = false;
  private isBoomerangReverse = false;

  constructor(animatable: Animatable, options: PlayableOptions = {}) {
    this.animatable = animatable;

    this.delay = Math.max(0, options.delay ?? 0);
    this.repeat = options.repeat ?? 0;
    this.repeatDelay = Math.max(0, options.repeatDelay ?? 0);
    this.boomerang = options.boomerang ?? false;
    this.waitRemaining = this.delay;

    if (options.autoplay ?? true) {
      this.play();
    } else {
      this.animatable.render(0);
    }
  }

  private tick = (_time: number, deltaMs: number) => {
    const deltaSec = deltaMs / 1000;

    if (this.waitRemaining > 0) {
      this.waitRemaining -= deltaSec;

      if (this.waitRemaining > 0) return; 

      const overflowSec = -this.waitRemaining;
      this.waitRemaining = 0;

      this.fireStartIfNeeded();
      this.elapsed += overflowSec * this.rate;
    } else {
      this.fireStartIfNeeded();
      this.elapsed += deltaSec * this.rate;
    }

    const dur = this.animatable.duration;

    if (this.elapsed >= dur) {
      this.elapsed = dur;
      this.animatable.render(this.elapsed);
      this.emit("update");
      this.onForwardBoundary();
      return;
    }

    if (this.elapsed <= 0) {
      this.elapsed = 0;
      this.animatable.render(this.elapsed);
      this.emit("update");
      this.onBackwardBoundary();
      return;
    }

    this.animatable.render(this.elapsed);
    this.emit("update");
  };

  private fireStartIfNeeded(): void {
    if (this.hasFiredStart) return;

    this.hasFiredStart = true;
    this.animatable.onStart?.();
    this.emit("start");
  }

  private onForwardBoundary(): void {
    const canRepeat = this.repeat === -1 || this.repeatsDone < this.repeat;

    if (!canRepeat) {
      this.stop();
      this.emit("complete");
      return;
    }

    this.repeatsDone++;
    this.emit("repeat");

    if (this.boomerang) {
      this.rate = -1;
      this.isBoomerangReverse = true;
    } else {
      this.elapsed = 0;
      this.rate = 1;
    }

    if (this.repeatDelay > 0) {
      this.waitRemaining = this.repeatDelay;
    }
  }

  private onBackwardBoundary(): void {
    if (this.isBoomerangReverse) {
      const canRepeat = this.repeat === -1 || this.repeatsDone < this.repeat;

      if (!canRepeat) {
        this.stop();
        this.emit("complete");
        return;
      }

      this.repeatsDone++;
      this.emit("repeat");
      this.rate = 1; 
      this.isBoomerangReverse = false;

      if (this.repeatDelay > 0) {
        this.waitRemaining = this.repeatDelay;
      }
      return;
    }

    this.stop();
    this.emit("reverseComplete");
  }

  play(): this {
    if (this.dead || this.running) return this;

    this.running = true;
    this.rate = this.rate < 0 ? this.rate : 1;
    ticker.add(this.tick);

    if (this.waitRemaining <= 0) {
      this.animatable.onStart?.();
    }

    return this;
  }

  reverse(): this {
    if (this.dead) return this;

    this.rate = -1;
    this.isBoomerangReverse = false; 

    if (!this.running) {
      this.running = true;
      this.animatable.onStart?.();
      ticker.add(this.tick);
    }

    return this;
  }

  pause(): this {
    if (this.dead || !this.running) return this;

    this.running = false;
    ticker.remove(this.tick);

    return this;
  }

  private stop(): void {
    this.running = false;
    ticker.remove(this.tick);
    this.animatable.onComplete?.();
  }

  seek(time: number): this {
    if (this.dead) return this;

    this.elapsed = Math.max(0, Math.min(time, this.animatable.duration));
    this.animatable.render(this.elapsed);
    this.emit("update");

    return this;
  }

  restart(): this {
    if (this.dead) return this;

    this.elapsed = 0;
    this.rate = 1;
    this.repeatsDone = 0;
    this.hasFiredStart = false;
    this.isBoomerangReverse = false;
    this.waitRemaining = this.delay;
    this.animatable.render(0);
    this.play();

    return this;
  }

  reset(): this {
    if (this.dead) return this;

    this.pause();
    this.elapsed = 0;
    this.rate = 1;
    this.repeatsDone = 0;
    this.hasFiredStart = false;
    this.isBoomerangReverse = false;
    this.waitRemaining = this.delay;
    this.animatable.render(0);
    this.emit("update");

    return this;
  }

  kill(): this {
    if (this.dead) return this;

    this.dead = true;
    this.pause();

    return this;
  }

  on(event: PlayableEvent, cb: () => void): this {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(cb);

    return this;
  }

  off(event: PlayableEvent, cb: () => void): this {
    this.listeners[event]?.delete(cb);

    return this;
  }

  private emit(event: PlayableEvent): void {
    this.listeners[event]?.forEach((cb) => cb());
  }

  get progress(): number {
    return this.animatable.duration === 0 ? 1 : this.elapsed / this.animatable.duration;
  }

  get duration(): number {
    return this.animatable.duration;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get isDead(): boolean {
    return this.dead;
  }
}