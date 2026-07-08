// src/core/animatable.ts

/**
 * Bất kỳ thứ gì "chạy theo thời gian cục bộ" đều implement interface này:
 * SxTween, SxTimeline (sau này) đều là Animatable.
 *
 * Animatable KHÔNG biết gì về ticker, KHÔNG tự chạy — nó chỉ biết:
 * "cho tôi biết localTime là X giây, tôi sẽ tự vẽ ra trạng thái tương ứng".
 *
 * Việc điều khiển thời gian (play/pause/seek/reverse) là trách nhiệm của Playable.
 */
export interface Animatable {
  /** Tổng thời lượng, tính bằng giây */
  readonly duration: number;

  /**
   * Vẽ trạng thái tại thời điểm cục bộ `localTime` (giây, luôn trong [0, duration]).
   * Được gọi lại nhiều lần với localTime khác nhau, kể cả lùi về quá khứ (seek ngược).
   */
  render(localTime: number): void;

  /** Playable gọi khi animation bắt đầu chạy (play/reverse từ trạng thái dừng) */
  onStart?(): void;

  /** Playable gọi khi animation chạm 1 trong 2 đầu mút (0 hoặc duration) rồi tự dừng */
  onComplete?(): void;
}