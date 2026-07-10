import { Animatable } from "./animatable";
import { Playable, PlayableEvent } from "./playable";
import { SxTween, TweenVars, TweenMode } from "./tween";
import { OnScrollOptions, ScrollTriggerController } from "./scroll-trigger";

export type TimelinePosition = number | string;

export interface TimelineVars {
  paused?: boolean;
  delay?: number;
  repeat?: number;
  repeatDelay?: number;
  boomerang?: boolean;
  defaults?: TweenVars;
  onScroll?: OnScrollOptions;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
  onRepeat?: () => void;
  onReverseComplete?: () => void;
}

interface TimelineChild {
  start: number;
  end: number;
  animatable: Animatable;
}

const POS_PREV = /^<\s*(?:([+-]=)\s*([\d.]+))?$/;
const POS_END_OF_PREV = /^>\s*(?:([+-]=)\s*([\d.]+))?$/;
const POS_RELATIVE = /^([+-]=)\s*([\d.]+)$/;
const POS_LABEL = /^([^\s+-]+)\s*(?:([+-]=)\s*([\d.]+))?$/;

export class SxTimelineEngine implements Animatable {
  private children: TimelineChild[] = [];
  private labels = new Map<string, number>();
  private cursor = 0;
  private activeChildren = new Set<number>();
  private lastLocalTime = 0;

  get duration(): number {
    let max = 0;
    for (const child of this.children) if (child.end > max) max = child.end;
    return max;
  }

  resolvePosition(position: TimelinePosition | undefined): number {
    if (position === undefined) return this.cursor;
    if (typeof position === "number") return Math.max(0, position);

    const trimmed = position.trim();
    const prev = this.children[this.children.length - 1];

    let m = trimmed.match(POS_PREV);
    if (m && trimmed[0] === "<") {
      const base = prev ? prev.start : 0;
      if (!m[1]) return Math.max(0, base);
      const num = parseFloat(m[2]);
      return Math.max(0, base + (m[1] === "-=" ? -num : num));
    }

    m = trimmed.match(POS_END_OF_PREV);
    if (m && trimmed[0] === ">") {
      const base = prev ? prev.end : 0;
      if (!m[1]) return Math.max(0, base);
      const num = parseFloat(m[2]);
      return Math.max(0, base + (m[1] === "-=" ? -num : num));
    }

    m = trimmed.match(POS_RELATIVE);
    if (m) {
      const num = parseFloat(m[2]);
      return Math.max(0, this.cursor + (m[1] === "-=" ? -num : num));
    }

    m = trimmed.match(POS_LABEL);
    if (m) {
      const [, labelName, op, numStr] = m;
      const base = this.labels.get(labelName);

      if (base === undefined) {
        console.warn(`[six-js] timeline: unknown label "${labelName}", appending to end`);
        return this.cursor;
      }

      if (op && numStr) {
        const num = parseFloat(numStr);
        return Math.max(0, base + (op === "-=" ? -num : num));
      }

      return base;
    }

    console.warn(`[six-js] timeline: invalid position "${position}", appending to end`);
    return this.cursor;
  }

  add(animatable: Animatable, position?: TimelinePosition): number {
    const start = this.resolvePosition(position);
    const end = start + animatable.duration;

    this.children.push({ start, end, animatable });
    this.cursor = Math.max(this.cursor, end);

    return start;
  }

  addLabel(name: string, position?: TimelinePosition): number {
    const at = this.resolvePosition(position);
    this.labels.set(name, at);
    return at;
  }

  getLabelTime(name: string): number | undefined {
    return this.labels.get(name);
  }

  render(localTime: number, isJump?: boolean): void {
    const lo = isJump ? localTime : Math.min(this.lastLocalTime, localTime);
    const hi = isJump ? localTime : Math.max(this.lastLocalTime, localTime);
    const newActive = new Set<number>();

    this.children.forEach((child, i) => {
      if (child.end >= lo && child.start <= hi) newActive.add(i);
    });

    this.activeChildren.forEach((i) => {
      if (!newActive.has(i)) this.children[i].animatable.onComplete?.();
    });

    newActive.forEach((i) => {
      if (!this.activeChildren.has(i)) this.children[i].animatable.onStart?.();
    });

    this.children.forEach((child) => {
      const childLocal = localTime - child.start;
      if (isJump || childLocal >= 0) child.animatable.render(childLocal, isJump);
    });

    this.activeChildren = newActive;
    this.lastLocalTime = localTime;
  }

  onStart(): void {}

  onComplete(): void {}
}

export class SxTimeline {
  private engine = new SxTimelineEngine();
  private playable: Playable;
  private defaults: TweenVars;

  constructor(vars: TimelineVars = {}) {
    this.defaults = vars.defaults ?? {};

    this.playable = new Playable(this.engine, {
      autoplay: vars.onScroll ? false : !vars.paused,
      delay: vars.delay,
      repeat: vars.repeat,
      repeatDelay: vars.repeatDelay,
      boomerang: vars.boomerang,
    });

    if (vars.onStart) this.playable.on("start", vars.onStart);
    if (vars.onUpdate) this.playable.on("update", vars.onUpdate);
    if (vars.onComplete) this.playable.on("complete", vars.onComplete);
    if (vars.onRepeat) this.playable.on("repeat", vars.onRepeat);
    if (vars.onReverseComplete) this.playable.on("reverseComplete", vars.onReverseComplete);

    if (vars.onScroll) {
      const target = vars.onScroll.target;
      const triggerEl = typeof target === "string" ? document.querySelector(target) : target;

      if (!triggerEl) {
        console.warn(`[six-js] timeline onScroll: trigger element not found, cần chỉ định onScroll.target`);
      } else {
        new ScrollTriggerController(triggerEl as HTMLElement, this.playable, vars.onScroll);
      }
    }
  }

  private buildChildTween(
    target: string | HTMLElement | HTMLElement[],
    vars: TweenVars,
    mode: TweenMode,
    fromVars: Record<string, any> | undefined,
    position: TimelinePosition | undefined,
  ): this {
    const merged = { ...this.defaults, ...vars };
    const tween = new SxTween(target, merged, mode, fromVars);

    this.engine.add(tween, position);

    return this;
  }

  to(target: string | HTMLElement | HTMLElement[], vars: TweenVars, position?: TimelinePosition): this {
    return this.buildChildTween(target, vars, "to", undefined, position);
  }

  from(target: string | HTMLElement | HTMLElement[], vars: TweenVars, position?: TimelinePosition): this {
    return this.buildChildTween(target, vars, "from", undefined, position);
  }

  fromTo(
    target: string | HTMLElement | HTMLElement[],
    fromVars: Record<string, any>,
    toVars: TweenVars,
    position?: TimelinePosition,
  ): this {
    return this.buildChildTween(target, toVars, "fromTo", fromVars, position);
  }

  set(target: string | HTMLElement | HTMLElement[], vars: Record<string, any>, position?: TimelinePosition): this {
    return this.buildChildTween(target, { ...vars, duration: 0 }, "to", undefined, position);
  }

  call(fn: () => void, position?: TimelinePosition): this {
    this.engine.add({ duration: 0, render: () => {}, onStart: fn }, position);
    return this;
  }

  add(child: Animatable | SxTimeline | Playable, position?: TimelinePosition): this {
    let animatable: Animatable;

    if (child instanceof SxTimeline) {
      child.playable.pause();
      animatable = child.engine;
    } else if (child instanceof Playable) {
      child.pause();
      animatable = child.getAnimatable();
    } else {
      animatable = child;
    }

    this.engine.add(animatable, position);

    return this;
  }

  addLabel(name: string, position?: TimelinePosition): this {
    this.engine.addLabel(name, position);
    return this;
  }

  play(): this {
    this.playable.play();
    return this;
  }

  pause(): this {
    this.playable.pause();
    return this;
  }

  reverse(): this {
    this.playable.reverse();
    return this;
  }

  seek(time: number | string): this {
    const at = typeof time === "number" ? time : this.engine.getLabelTime(time) ?? 0;
    this.playable.seek(at);
    return this;
  }

  restart(): this {
    this.playable.restart();
    return this;
  }

  reset(): this {
    this.playable.reset();
    return this;
  }

  kill(): this {
    this.playable.kill();
    return this;
  }

  on(event: PlayableEvent, cb: () => void): this {
    this.playable.on(event, cb);
    return this;
  }

  off(event: PlayableEvent, cb: () => void): this {
    this.playable.off(event, cb);
    return this;
  }

  get duration(): number {
    return this.playable.duration;
  }

  get progress(): number {
    return this.playable.progress;
  }

  get isRunning(): boolean {
    return this.playable.isRunning;
  }

  get isDead(): boolean {
    return this.playable.isDead;
  }
}
