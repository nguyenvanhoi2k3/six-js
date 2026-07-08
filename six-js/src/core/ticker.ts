// six-js\src\core\ticker.ts
export type TickerCallback = (
  time: number,
  delta: number,
  frame: number,
) => void;

export class SxTicker {
  private _listeners = new Set<TickerCallback>();

  private _time = 0; // seconds
  private _delta = 0; // ms
  private _frame = 0;

  private _start = this._now();
  private _last = this._start;

  private _lagThreshold = 500;
  private _adjustedLag = 33;

  private _gap = 1000 / 240;
  private _nextTime = this._gap;

  private _id: number | null = null;

  private _now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  private _request(cb: FrameRequestCallback): number {
    if (typeof requestAnimationFrame !== "undefined") {
      return requestAnimationFrame(cb);
    }

    return setTimeout(cb, 16) as unknown as number;
  }

  private _cancel(id: number): void {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(id);
      return;
    }

    clearTimeout(id);
  }

  private _tick = () => {
    const now = this._now();

    let elapsed = now - this._last;

    if (elapsed > this._lagThreshold || elapsed < 0) {
      this._start += elapsed - this._adjustedLag;
    }

    this._last += elapsed;

    const elapsedSinceStart = this._last - this._start;
    const overlap = elapsedSinceStart - this._nextTime;

    if (overlap > 0) {
      this._frame++;

      this._delta = elapsedSinceStart - this._time * 1000;
      this._time = elapsedSinceStart / 1000;

      this._nextTime += overlap >= this._gap ? overlap + 4 : this._gap;

      const listeners = [...this._listeners];

      for (const listener of listeners) {
        listener(this._time, this._delta, this._frame);
      }
    }

    if (this._listeners.size === 0) {
      this.sleep();
      return;
    }

    this._id = this._request(this._tick);
  };

  private _wake(): void {
    if (this._id !== null) return;

    const now = this._now();

    this._start = now - this._time * 1000;
    this._last = now;

    this._tick(); 
  }

  add(fn: TickerCallback): TickerCallback {
    this._listeners.add(fn);

    this._wake();

    return fn;
  }

  addOnce(fn: TickerCallback): TickerCallback {
    const callback: TickerCallback = (time, delta, frame) => {
      this.remove(callback);
      fn(time, delta, frame);
    };

    this.add(callback);

    return callback;
  }

  remove(fn: TickerCallback): void {
    this._listeners.delete(fn);

    if (this._listeners.size === 0) {
      this.sleep();
    }
  }

  clear(): void {
    this._listeners.clear();
    this.sleep();
  }

  sleep(): void {
    if (this._id !== null) {
      this._cancel(this._id);
      this._id = null;
    }
  }

  fps(fps: number): void {
    fps = Math.max(1, fps);

    this._gap = 1000 / fps;
    this._nextTime = this._time * 1000 + this._gap;
  }

  lagSmoothing(threshold = 500, adjustedLag = 33): void {
    this._lagThreshold = threshold || Infinity;

    this._adjustedLag = Math.min(adjustedLag, this._lagThreshold);
  }

  deltaRatio(fps = 60): number {
    return this._delta / (1000 / fps);
  }

  get time(): number {
    return this._time;
  }

  get delta(): number {
    return this._delta;
  }

  get frame(): number {
    return this._frame;
  }

  get active(): boolean {
    return this._id !== null;
  }

  get listeners(): number {
    return this._listeners.size;
  }
}

export const ticker = new SxTicker();
