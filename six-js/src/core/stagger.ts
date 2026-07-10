// src/core/stagger.ts
import { Playable } from "./playable";

export type StaggerFrom = "start" | "end" | "center" | number;

export interface StaggerOptions {
  /** Giây, khoảng lệch giữa 2 phần tử liên tiếp theo "khoảng cách" tính từ `from` */
  each: number;
  /** "start" (mặc định): lệch dần từ phần tử đầu. "end": lệch dần từ phần tử cuối.
   *  "center": lan ra từ giữa. number: lan ra từ đúng index đó. */
  from?: StaggerFrom;
}

export type StaggerInput = number | StaggerOptions;

/** Tính độ lệch delay (giây) cho 1 phần tử tại `index` trong tổng số `total` phần tử */
export function computeStaggerDelay(index: number, total: number, stagger: StaggerInput): number {
  if (typeof stagger === "number") {
    return index * stagger;
  }

  const { each, from = "start" } = stagger;

  if (typeof each !== "number" || isNaN(each)) {
    console.warn(`[six-js] stagger.each phải là số, nhận được ${each} — dùng 0 thay thế`);
    return 0;
  }

  let distance: number;

  if (from === "start") distance = index;
  else if (from === "end") distance = total - 1 - index;
  else if (from === "center") distance = Math.abs(index - (total - 1) / 2);
  else distance = Math.abs(index - from);

  return distance * each;
}

/**
 * Bọc nhiều Playable (mỗi phần tử stagger 1 cái) thành 1 điều khiển chung — gọi play()
 * là TẤT CẢ cùng play() (giữ nguyên độ lệch delay đã tính từ trước), không phải là
 * Timeline thật (chưa hỗ trợ seek() đồng bộ toàn nhóm theo % tổng thể).
 */
export class PlayableGroup {
  constructor(private playables: Playable[]) {}

  play(): this {
    this.playables.forEach((p) => p.play());
    return this;
  }

  pause(): this {
    this.playables.forEach((p) => p.pause());
    return this;
  }

  restart(): this {
    this.playables.forEach((p) => p.restart());
    return this;
  }

  reset(): this {
    this.playables.forEach((p) => p.reset());
    return this;
  }

  reverse(): this {
    this.playables.forEach((p) => p.reverse());
    return this;
  }

  kill(): this {
    this.playables.forEach((p) => p.kill());
    return this;
  }

  /** Danh sách Playable con, dùng khi cần điều khiển riêng lẻ từng phần tử */
  get all(): readonly Playable[] {
    return this.playables;
  }
}