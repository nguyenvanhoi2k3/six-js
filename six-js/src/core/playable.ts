// src/core/playable.ts
import { ticker } from "./ticker";
import { Animatable } from "./animatable";

export type PlayableEvent = "start" | "update" | "complete" | "repeat" | "reverseComplete";

export interface PlayableOptions {
  /** Tự chạy ngay khi tạo (mặc định true). Đặt false khi có onScroll điều khiển thủ công. */
  autoplay?: boolean;
  /** Số giây chờ TRƯỚC KHI bắt đầu chạy lần đầu tiên. Chỉ áp dụng 1 lần duy nhất
   *  (không lặp lại mỗi vòng repeat) — đúng ngữ nghĩa `delay` của GSAP. */
  delay?: number;
  /** Số lần lặp lại SAU lần chạy đầu tiên. -1 = lặp vô hạn. Mặc định 0 (không lặp). */
  repeat?: number;
  /** Số giây tạm dừng GIỮA các lượt lặp (không áp dụng cho delay ban đầu, không có
   *  khoảng chờ thừa sau lượt lặp CUỐI CÙNG khi repeat hữu hạn). */
  repeatDelay?: number;
  /** true: tương đương yoyo của GSAP — mỗi lượt lặp tự đảo chiều (0->duration->0->...)
   *  thay vì nhảy về đầu và chạy xuôi lại. Đặt tên "boomerang" (không phải "reverse")
   *  để KHÔNG bị nhầm với method .reverse() (tua ngược thủ công, khái niệm khác hẳn). */
  boomerang?: boolean;
}

/**
 * Playable điều khiển thời gian (play/pause/seek/reverse/repeat) cho 1 Animatable
 * (SxTween, sau này có thể là SxTimeline). Animatable chỉ biết render(localTime).
 *
 * Vòng đời 1 lượt phát đầy đủ:
 *   [delay] -> render 0..duration -> (nếu còn repeat) [repeatDelay] -> lặp lại -> ... -> complete
 *
 * Có 2 tầng callback tách biệt:
 * - animatable.onStart()/onComplete(): hook NỘI BỘ của chính Animatable (vd SxTween dùng
 *   để bật/tắt will-change), gọi lại mỗi lần thật sự bắt đầu chạy (kể cả resume sau pause).
 * - emit("start"|"update"|"complete"|"repeat"|"reverseComplete"): sự kiện dành cho NGƯỜI
 *   DÙNG (map từ onStart/onUpdate/onComplete/onRepeat/onReverseComplete trong TweenVars),
 *   "start" chỉ bắn đúng 1 LẦN DUY NHẤT trong toàn bộ vòng đời (trừ khi restart()).
 */
export class Playable {
  private animatable: Animatable;
  private elapsed = 0; // giây, luôn trong [0, duration]
  private rate = 1; // 1 = xuôi, -1 = ngược
  private running = false;
  private dead = false; // đã kill() -> không thể play/reverse/seek lại được nữa
  private listeners: Partial<Record<PlayableEvent, Set<() => void>>> = {};

  private readonly delay: number;
  private readonly repeat: number;
  private readonly repeatDelay: number;
  private readonly boomerang: boolean;

  private repeatsDone = 0;
  /** Giây còn lại đang trong pha "chờ" (delay ban đầu HOẶC repeatDelay giữa các lượt lặp).
   *  > 0 nghĩa là animatable tạm thời không render giá trị mới, chỉ đếm ngược. */
  private waitRemaining: number;
  /** true nếu tick() ĐÃ từng bắn "start" (đúng 1 lần, trừ khi restart() reset lại). */
  private hasFiredStart = false;
  /** Phân biệt "đang chạy ngược vì boomerang tự đảo" và "đang chạy ngược vì user gọi
   *  .reverse() thủ công" — 2 trường hợp cần xử lý khác nhau khi elapsed chạm mốc 0
   *  (xem onBackwardBoundary). */
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

      if (this.waitRemaining > 0) return; // vẫn còn đang chờ (delay/repeatDelay), chưa làm gì thêm

      // Hết giờ chờ ngay trong frame này -> áp phần dư (overflow) luôn vào animation để
      // không bị "khựng" mất 1 frame khi delay/repeatDelay kết thúc giữa chừng 1 tick.
      const overflowSec = -this.waitRemaining;
      this.waitRemaining = 0;

      this.fireStartIfNeeded();
      this.elapsed += overflowSec * this.rate;
    } else {
      // Không (hoặc không còn) trong pha chờ -> đây có thể là tick ĐẦU TIÊN của 1 tween
      // không có delay (trường hợp mặc định, delay=0) -> vẫn phải kiểm tra hasFiredStart
      // ở đây, KHÔNG chỉ trong nhánh chờ ở trên (bug cũ: onStart không bao giờ bắn khi
      // không truyền delay, vì waitRemaining luôn = 0 nên không bao giờ vào nhánh if trên).
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

  /** Bắn onStart/emit("start") đúng 1 lần duy nhất mỗi vòng đời (reset lại bởi restart()).
   *  Tách riêng vì cần gọi từ CẢ 2 nhánh của tick() (có delay hoặc không có delay). */
  private fireStartIfNeeded(): void {
    if (this.hasFiredStart) return;

    this.hasFiredStart = true;
    this.animatable.onStart?.();
    this.emit("start");
  }

  /** Chạm mốc cuối (duration) trong khi đang phát XUÔI: xử lý repeat/boomerang hoặc hoàn tất. */
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
      // Boomerang: đảo hướng ngay tại duration, KHÔNG nhảy elapsed về 0 -> lượt kế tiếp
      // tự chạy ngược mượt mà từ duration về 0.
      this.rate = -1;
      this.isBoomerangReverse = true;
    } else {
      // Không boomerang: nhảy lại đầu, giữ nguyên hướng xuôi (loop kiểu "restart").
      this.elapsed = 0;
      this.rate = 1;
    }

    if (this.repeatDelay > 0) {
      this.waitRemaining = this.repeatDelay;
    }
  }

  /** Chạm mốc đầu (0). Có 2 nguồn gốc khác nhau cần phân biệt: boomerang tự đảo, hay
   *  user chủ động gọi .reverse() để tua ngược thủ công (không liên quan gì tới
   *  boomerang/repeat). */
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
      this.rate = 1; // boomerang: lượt kế tiếp chạy xuôi trở lại
      this.isBoomerangReverse = false;

      if (this.repeatDelay > 0) {
        this.waitRemaining = this.repeatDelay;
      }
      return;
    }

    // User chủ động .reverse() và tua hết về 0 -> coi là "hoàn tất theo chiều ngược",
    // KHÔNG áp dụng repeat/boomerang (đây là override thủ công, không phải 1 phần của vòng lặp).
    this.stop();
    this.emit("reverseComplete");
  }

  play(): this {
    if (this.dead || this.running) return this;

    this.running = true;
    this.rate = this.rate < 0 ? this.rate : 1;
    ticker.add(this.tick);

    // Nếu KHÔNG còn trong pha chờ (delay đã qua hoặc bằng 0) thì animatable coi như bắt
    // đầu chạy ngay bây giờ -> bắn hook nội bộ luôn (emit("start") vẫn chờ tick() xử lý
    // đúng 1 lần duy nhất, tránh bắn trùng nếu play() được gọi lại nhiều lần khi đang chờ).
    if (this.waitRemaining <= 0) {
      this.animatable.onStart?.();
    }

    return this;
  }

  /** Tua ngược thủ công (khác với boomerang tự động) — dùng vd cho hiệu ứng hover-out. */
  reverse(): this {
    if (this.dead) return this;

    this.rate = -1;
    this.isBoomerangReverse = false; // đây là override thủ công, không phải boomerang

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

  /** Tua tới thời điểm bất kỳ (giây) trong 1 lượt hiện tại, không phụ thuộc trạng thái
   *  đang chạy hay không. Không tính tới nhiều vòng repeat (chỉ trong [0, duration]). */
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

  /** Đưa tween về đúng trạng thái BAN ĐẦU (elapsed=0, hướng xuôi, đếm repeat/delay reset
   *  lại từ đầu) và DỪNG LUÔN, khác với restart() (reset xong tự play() ngay). Dùng khi
   *  muốn "rewind" 1 tween về trạng thái nghỉ mà không muốn nó chạy lại ngay lập tức. */
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

  /** Dừng vĩnh viễn — sau khi kill(), mọi lệnh play/reverse/seek/restart đều là no-op.
   *  Dùng nội bộ bởi overwrite-manager để huỷ tween cũ khi bị tween mới ghi đè. */
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