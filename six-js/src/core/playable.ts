// src/core/playable.ts
import { ticker } from "./ticker";
import { Animatable } from "./animatable";

export type PlayableEvent = "complete" | "start" | "update";

export class Playable {
  private animatable: Animatable;
  private elapsed = 0; // giây, luôn trong [0, duration]
  private rate = 1; // 1 = xuôi, -1 = ngược
  private running = false;
  private listeners: Partial<Record<PlayableEvent, Set<() => void>>> = {};

  constructor(animatable: Animatable, autoplay = true) {
    this.animatable = animatable;

    if (autoplay) {
      this.play();
    } else {
      this.animatable.render(0);
    }
  }

  private tick = (_time: number, delta: number) => {
    this.elapsed += (delta / 1000) * this.rate;

    if (this.elapsed >= this.animatable.duration) {
      this.elapsed = this.animatable.duration;
      this.animatable.render(this.elapsed);
      this.emit("update");
      this.stop();
      this.emit("complete");
      return;
    }

    if (this.elapsed <= 0) {
      this.elapsed = 0;
      this.animatable.render(this.elapsed);
      this.emit("update");
      this.stop();
      this.emit("complete");
      return;
    }

    this.animatable.render(this.elapsed);
    this.emit("update");
  };

  play(): this {
    if (this.running) return this;

    this.running = true;
    this.rate = this.rate < 0 ? this.rate : 1;
    this.animatable.onStart?.();
    ticker.add(this.tick);
    this.emit("start");

    return this;
  }

  reverse(): this {
    this.rate = -1;

    if (!this.running) {
      this.running = true;
      this.animatable.onStart?.();
      ticker.add(this.tick);
    }

    return this;
  }

  pause(): this {
    if (!this.running) return this;

    this.running = false;
    ticker.remove(this.tick);

    return this;
  }

  private stop(): void {
    this.running = false;
    ticker.remove(this.tick);
    this.animatable.onComplete?.();
  }

  /** Tua tới thời điểm bất kỳ (giây), không phụ thuộc trạng thái đang chạy hay không */
  seek(time: number): this {
    this.elapsed = Math.max(0, Math.min(time, this.animatable.duration));
    this.animatable.render(this.elapsed);
    this.emit("update");

    return this;
  }

  restart(): this {
    this.elapsed = 0;
    this.rate = 1;
    this.animatable.render(0);
    this.play();

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
}