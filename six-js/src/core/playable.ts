// src/core/playable.ts
import { ticker } from "./ticker";
import { Animatable } from "./animatable";

export type PlayableEvent = "complete" | "start" | "update" | "repeat" | "reverseComplete";

export interface PlayableOptions {
  /** Giây, chờ trước khi bắt đầu chạy thật sự */
  delay?: number;
  /** Số lần lặp THÊM sau lần chạy đầu tiên. -1 = vô hạn. Mặc định 0 (không lặp). */
  repeat?: number;
  /** Giây, khoảng nghỉ giữa các lần lặp */
  repeatDelay?: number;
  /** true: mỗi lần lặp đảo chiều (tương đương yoyo GSAP). false: mỗi lần lặp nhảy về đầu chạy lại xuôi. */
  yoyo?: boolean;
  /** Hệ số tốc độ phát lại (tương đương timeScale GSAP). 1 = bình thường, 2 = nhanh gấp đôi, 0.5 = chậm 1 nửa. Mặc định 1. */
  speed?: number;
}

export class Playable {
  private animatable: Animatable;
  private options: PlayableOptions;

  private elapsed = 0; // giây, luôn trong [0, duration]
  private rate = 1; // 1 = xuôi, -1 = ngược
  private running = false;
  private listeners: Partial<Record<PlayableEvent, Set<() => void>>> = {};

  private delayRemaining: number;
  private repeatsLeft: number;
  private repeatDelayRemaining = 0;
  private hasStartedOnce = false;
  private timeScale: number;

  constructor(animatable: Animatable, autoplay = true, options: PlayableOptions = {}) {
    this.animatable = animatable;
    this.options = options;

    this.delayRemaining = Math.max(0, options.delay ?? 0);
    this.repeatsLeft = options.repeat === -1 ? Infinity : Math.max(0, options.repeat ?? 0);
    this.timeScale = options.speed ?? 1;

    if (autoplay) {
      this.play();
    } else {
      this.animatable.render(0);
    }
  }

  private tick = (_time: number, deltaMs: number) => {
    const deltaSeconds = (deltaMs / 1000) * this.timeScale;

    // Giai đoạn delay: chưa render/animate gì, chỉ đếm ngược
    if (this.delayRemaining > 0) {
      this.delayRemaining -= deltaSeconds;

      if (this.delayRemaining > 0) return;

      // Delay vừa hết -> phần dư (âm) dùng bù luôn vào elapsed cho mượt, không mất 1 frame
      this.elapsed += -this.delayRemaining * this.rate;
      this.delayRemaining = 0;
    }

    // Giai đoạn repeatDelay: đang nghỉ giữa 2 lần lặp, không animate tiếp
    if (this.repeatDelayRemaining > 0) {
      this.repeatDelayRemaining -= deltaSeconds;
      if (this.repeatDelayRemaining > 0) return;
      this.repeatDelayRemaining = 0;
    }

    this.elapsed += deltaSeconds * this.rate;

    const duration = this.animatable.duration;

    if (this.elapsed >= duration) {
      this.elapsed = duration;
      this.animatable.render(this.elapsed);
      this.emit("update");
      this.handleBoundReached(true);
      return;
    }

    if (this.elapsed <= 0 && this.rate < 0) {
      this.elapsed = 0;
      this.animatable.render(0);
      this.emit("update");
      this.handleBoundReached(false);
      return;
    }

    this.animatable.render(this.elapsed);
    this.emit("update");
  };

  /** forward=true: vừa chạm mốc duration. forward=false: vừa chạm mốc 0 khi đang chạy ngược. */
  private handleBoundReached(forward: boolean): void {
    if (this.repeatsLeft > 0) {
      if (this.repeatsLeft !== Infinity) this.repeatsLeft--;

      this.emit("repeat");

      if (this.options.repeatDelay) {
        this.repeatDelayRemaining = this.options.repeatDelay;
      }

      if (this.options.yoyo) {
        this.rate = forward ? -1 : 1; // đảo chiều, tiếp tục chạy
      } else {
        this.elapsed = 0; // không yoyo -> nhảy về đầu, chạy lại xuôi
        this.rate = 1;
      }

      return; // vẫn đang running, không stop
    }

    this.stop();
    this.emit(forward ? "complete" : "reverseComplete");
  }

  play(): this {
    if (this.running) return this;

    this.running = true;
    this.rate = this.rate < 0 ? this.rate : 1;

    this.animatable.onStart?.();
    ticker.add(this.tick);

    if (!this.hasStartedOnce) {
      this.hasStartedOnce = true;
      this.emit("start");
    }

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
    this.delayRemaining = Math.max(0, this.options.delay ?? 0);
    this.repeatsLeft = this.options.repeat === -1 ? Infinity : Math.max(0, this.options.repeat ?? 0);
    this.repeatDelayRemaining = 0;
    this.hasStartedOnce = false;
    this.animatable.render(0);
    this.play();

    return this;
  }

  /** Dừng hẳn, gỡ khỏi ticker, không bắn onComplete (dùng cho overwrite/kill) */
  kill(): void {
    this.running = false;
    ticker.remove(this.tick);
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

  get speed(): number {
    return this.timeScale;
  }

  setSpeed(value: number): this {
    if (value <= 0) {
      console.warn(`[six-js] speed must be > 0, got ${value}, ignoring`);
      return this;
    }

    this.timeScale = value;
    return this;
  }
}