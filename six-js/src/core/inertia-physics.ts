import { ticker, TickerCallback } from "./ticker";

export class InertiaPhysics {
  private velocity: number = 0;
  private friction: number;
  private onUpdate: (delta: number) => void;
  private onComplete: () => void;
  private isRunning: boolean = false;
  private tickerCallback: TickerCallback;

  constructor(
    onUpdate: (delta: number) => void,
    onComplete: () => void,
    friction: number = 0.92
  ) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.friction = friction;
    
    // Đăng ký callback vào Ticker
    this.tickerCallback = (time, delta, frame) => this.loop(delta);
  }

  public setFriction(friction: number) {
    this.friction = friction;
  }

  public addVelocity(v: number) {
    this.velocity += v;
    if (!this.isRunning) {
      this.start();
    }
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.velocity = 0;
    ticker.remove(this.tickerCallback);
  }

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;
    ticker.add(this.tickerCallback);
  }

  private loop(deltaMs: number) {
    if (!this.isRunning) return;

    // Chuẩn hóa friction dựa trên khung hình 60fps (~16.67ms)
    // Giúp tốc độ cuộn mượt mà như nhau trên màn hình 60Hz lẫn 144Hz
    const timeScale = deltaMs / 16.67;
    const currentFriction = Math.pow(this.friction, timeScale);

    if (Math.abs(this.velocity) < 0.1) {
      this.stop();
      this.onComplete();
      return;
    }

    this.onUpdate(this.velocity * timeScale);
    this.velocity *= currentFriction;
  }
}