import { Playable } from "./playable";

export type StaggerFrom = "start" | "end" | "center" | number;

export interface StaggerOptions {
  each: number;
  from?: StaggerFrom;
}

export type StaggerInput = number | StaggerOptions;

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
export class PlayableGroup {
  private delays: number[];

  constructor(private playables: Playable[], delays: number[] = []) {
    this.delays = delays;
  }

  play(): this {
    this.playables.forEach((p) => p.play());
    return this;
  }

  seek(time: number): this {
    this.playables.forEach((p, i) => p.seek(time - (this.delays[i] ?? 0)));
    return this;
  }

  get duration(): number {
    let max = 0;
    this.playables.forEach((p, i) => {
      const total = p.duration + (this.delays[i] ?? 0);
      if (total > max) max = total;
    });
    return max;
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

  get all(): readonly Playable[] {
    return this.playables;
  }
}