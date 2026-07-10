import { EASINGS, EasingType } from "../easing/easing";
import { Animatable } from "./animatable";
import {
  getPropertyHandler,
  resolveNumericValue,
  parseNumericValue,
  ParsedValue,
  NumericPropertyHandler,
  ColorPropertyHandler,
  ComplexPropertyHandler,
} from "../properties/registry";
import { parseColor, interpolateColor, RGBA } from "../properties/color-utils";
import { validateComplexPair, interpolateComplexString } from "../properties/complex-utils";
import { setTransformValue, buildTransformString, TransformCache } from "../properties/transform-state";
import { convertToPx } from "../properties/unit-convert";
import { resolveDynamicValue } from "../properties/dynamic-value";
import { getDefaults } from "./defaults";

export type KeyframeArrayItem = Record<string, any> & {
  duration?: number;
  ease?: EasingType;
  delay?: number;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
};

export type KeyframePercentObject = Record<string, Record<string, any>>;

export type KeyframesInput = KeyframeArrayItem[] | KeyframePercentObject;

export interface TweenVars {
  duration?: number;
  ease?: EasingType;
  keyframes?: KeyframesInput;
  delay?: number;
  paused?: boolean;
  repeat?: number;
  repeatDelay?: number;
  boomerang?: boolean;
  overwrite?: boolean | "auto";
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
  onRepeat?: () => void;
  onReverseComplete?: () => void;
  [key: string]: any;
}

export type TweenMode = "to" | "from" | "fromTo";

interface NumericPropState {
  kind: "numeric";
  start: number;
  end: number;
  unit: string;
  isTransform: boolean;
  transformFn?: string;
  apply: NumericPropertyHandler["apply"];
  snapEnd?: string;
}

interface ColorPropState {
  kind: "color";
  start: RGBA;
  end: RGBA;
  apply: ColorPropertyHandler["apply"];
}

interface ComplexPropState {
  kind: "complex";
  start: string;
  end: string;
  apply: ComplexPropertyHandler["apply"];
}

interface DiscretePropState {
  kind: "discrete";
  value: string;
  apply: (target: HTMLElement, value: string) => void;
}

type PropState = NumericPropState | ColorPropState | ComplexPropState | DiscretePropState;

function normalizeTransformLength(
  target: HTMLElement,
  pxAxis: "x" | "y" | undefined,
  value: ParsedValue,
): ParsedValue {
  if (!pxAxis || !value.unit || value.unit === "px") return value;

  const probe = pxAxis === "x" ? "left" : "top";
  const px = convertToPx(target, probe, `${value.num}${value.unit}`);

  return { num: px, unit: "px" };
}

interface TrackEntry {
  startTime: number;
  endTime: number;
  easeFn: (t: number) => number;
  state: PropState;
}

interface KeyTrack {
  key: string;
  isTransform: boolean;
  entries: TrackEntry[];
}

interface PointWindow {
  startTime: number;
  endTime: number;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
}

interface KeyframePoint {
  duration: number;
  delay: number;
  easeFn: (t: number) => number;
  props: Record<string, any>;
  onSegmentStart?: () => void;
  onSegmentUpdate?: () => void;
  onSegmentComplete?: () => void;
}

export class SxTween implements Animatable {
  readonly duration: number;

  private targets: HTMLElement[];
  private targetTracks: KeyTrack[][] = [];
  private pointWindows: PointWindow[] = [];
  private activeWindows = new Set<number>();
  private implicitRefreshers: (() => void)[] = [];

  get targetElements(): readonly HTMLElement[] {
    return this.targets;
  }

  constructor(
    target: string | HTMLElement | HTMLElement[],
    vars: TweenVars,
    mode: TweenMode = "to",
    fromVars?: Record<string, any>,
  ) {
    if (typeof target === "string") {
      this.targets = Array.from(document.querySelectorAll(target));
    } else {
      this.targets = Array.isArray(target) ? target : [target];
    }

    if (this.targets.length === 0) {
      console.warn(`[six-js] No elements matched: "${target}"`);
    }

    if (vars.keyframes) {
      const extraKeys = Object.keys(vars).filter((k) => k !== "duration" && k !== "ease" && k !== "keyframes");

      if (extraKeys.length > 0) {
        console.warn(
          `[six-js] keyframes: property [${extraKeys.join(", ")}] ngoài keyframes sẽ bị BỎ QUA ` +
            `hoàn toàn, không cộng dồn với các mốc bên trong keyframes. Đưa chúng vào 1 mốc ` +
            `trong keyframes nếu muốn animate.`,
        );
      }

      const built = this.buildKeyframeTracks(vars.keyframes, vars);
      this.targetTracks = built.tracks;
      this.pointWindows = built.pointWindows;
      this.duration = built.duration;
    } else {
      const built = this.buildSingleTrackSet(vars, mode, fromVars);
      this.targetTracks = built.tracks;
      this.duration = built.duration;
    }

    this.applyWillChange();
  }

  private resolveEase(easeKey: EasingType | undefined): (t: number) => number {
    if (easeKey && !EASINGS[easeKey]) {
      console.warn(`[six-js] Unknown ease "${easeKey}", falling back to linear`);
    }
    return (easeKey && EASINGS[easeKey]) || EASINGS.linear;
  }

  private resolveDuration(d: number | undefined, defaults: ReturnType<typeof getDefaults>): number {
    let duration = d ?? defaults.duration ?? 0.5;

    if (duration < 0) {
      console.warn(`[six-js] Negative duration (${duration}), using 0 instead`);
      duration = 0;
    }

    return duration;
  }

  private resolveProp(
    target: HTMLElement,
    key: string,
    rawStart: any,
    rawEnd: any,
  ): { key: string; state: PropState; isTransform: boolean } | null {
    const handler = getPropertyHandler(key, rawEnd ?? rawStart);

    if (handler.type === "discrete") {
      const value = String(rawEnd ?? rawStart);
      return {
        key,
        isTransform: false,
        state: { kind: "discrete", value, apply: handler.apply },
      };
    }

    if (handler.type === "color") {
      const start = rawStart !== undefined ? parseColor(String(rawStart)) : handler.getCurrent(target);
      const end = rawEnd !== undefined ? parseColor(String(rawEnd)) : handler.getCurrent(target);

      return { key, isTransform: false, state: { kind: "color", start, end, apply: handler.apply } };
    }

    if (handler.type === "complex") {
      const startStr = rawStart !== undefined ? String(rawStart) : handler.getCurrent(target);
      const endStr = rawEnd !== undefined ? String(rawEnd) : handler.getCurrent(target);

      validateComplexPair(startStr, endStr, key);

      return { key, isTransform: false, state: { kind: "complex", start: startStr, end: endStr, apply: handler.apply } };
    }

    let startParsed: ParsedValue =
      rawStart !== undefined ? parseNumericValue(rawStart, handler.defaultUnit) : handler.getCurrent(target, key);

    let endParsed: ParsedValue =
      rawEnd !== undefined
        ? resolveNumericValue(rawEnd, startParsed.num, startParsed.unit, handler.defaultUnit)
        : handler.getCurrent(target, key);

    let snapEnd: string | undefined;

    if (handler.pxAxis) {
      startParsed = normalizeTransformLength(target, handler.pxAxis, startParsed);
      endParsed = normalizeTransformLength(target, handler.pxAxis, endParsed);
    }

    if (!handler.isTransform && endParsed.unit && startParsed.unit && endParsed.unit !== startParsed.unit) {
      const pxValue = convertToPx(target, key, `${endParsed.num}${endParsed.unit}`);
      snapEnd = `${endParsed.num}${endParsed.unit}`;
      endParsed = { num: pxValue, unit: startParsed.unit };
    }

    return {
      key,
      isTransform: handler.isTransform,
      state: {
        kind: "numeric",
        start: startParsed.num,
        end: endParsed.num,
        unit: endParsed.unit || startParsed.unit,
        isTransform: handler.isTransform,
        transformFn: handler.transformFn,
        apply: handler.apply,
        snapEnd,
      },
    };
  }

  private registerImplicitRefresh(
    target: HTMLElement,
    key: string,
    rawStart: any,
    rawEnd: any,
    state: PropState,
  ): void {
    if (state.kind === "discrete") return;

    const handler = getPropertyHandler(key, rawEnd ?? rawStart);

    if (rawStart === undefined) {
      if (state.kind === "numeric" && handler.type === "numeric") {
        this.implicitRefreshers.push(() => {
          state.start = handler.getCurrent(target, key).num;
        });
      } else if (state.kind === "color" && handler.type === "color") {
        this.implicitRefreshers.push(() => {
          state.start = handler.getCurrent(target);
        });
      } else if (state.kind === "complex" && handler.type === "complex") {
        this.implicitRefreshers.push(() => {
          state.start = handler.getCurrent(target);
        });
      }
    }

    if (rawEnd === undefined) {
      if (state.kind === "numeric" && handler.type === "numeric") {
        this.implicitRefreshers.push(() => {
          state.end = handler.getCurrent(target, key).num;
        });
      } else if (state.kind === "color" && handler.type === "color") {
        this.implicitRefreshers.push(() => {
          state.end = handler.getCurrent(target);
        });
      } else if (state.kind === "complex" && handler.type === "complex") {
        this.implicitRefreshers.push(() => {
          state.end = handler.getCurrent(target);
        });
      }
    }
  }

  private buildSingleTrackSet(
    vars: TweenVars,
    mode: TweenMode,
    fromVars?: Record<string, any>,
  ): { tracks: KeyTrack[][]; duration: number } {
    const defaults = getDefaults();
    const duration = this.resolveDuration(vars.duration, defaults);
    const easeFn = this.resolveEase(vars.ease ?? defaults.ease);

    const keys = new Set<string>();
    for (const k in vars) keys.add(k);
    if (fromVars) for (const k in fromVars) keys.add(k);
    keys.delete("duration");
    keys.delete("ease");
    keys.delete("keyframes");

    const tracks: KeyTrack[][] = this.targets.map(() => []);

    this.targets.forEach((target, index) => {
      for (const key of keys) {
        let rawStart: any;
        let rawEnd: any;

        if (mode === "to") {
          rawEnd = resolveDynamicValue(vars[key], index, target);
        } else if (mode === "from") {
          rawStart = resolveDynamicValue(vars[key], index, target);
        } else {
          if (key in vars) rawEnd = resolveDynamicValue(vars[key], index, target);
          if (fromVars && key in fromVars) rawStart = resolveDynamicValue(fromVars[key], index, target);
        }

        const handler = getPropertyHandler(key, rawEnd ?? rawStart);
        if (handler.type === "discrete") {
          const state: PropState = { kind: "discrete", value: String(rawEnd ?? rawStart), apply: handler.apply };
          tracks[index].push({ key, isTransform: false, entries: [{ startTime: 0, endTime: duration, easeFn, state }] });
          continue;
        }

        const resolved = this.resolveProp(target, key, rawStart, rawEnd);
        if (!resolved) continue;

        tracks[index].push({
          key: resolved.key,
          isTransform: resolved.isTransform,
          entries: [{ startTime: 0, endTime: duration, easeFn, state: resolved.state }],
        });

        this.registerImplicitRefresh(target, key, rawStart, rawEnd, resolved.state);
      }
    });

    return { tracks, duration };
  }

  private buildKeyframeTracks(
    input: KeyframesInput,
    vars: TweenVars,
  ): { tracks: KeyTrack[][]; pointWindows: PointWindow[]; duration: number } {
    const defaults = getDefaults();
    const topDuration = vars.duration;
    const topEase = vars.ease ?? defaults.ease;

    const points = Array.isArray(input)
      ? this.normalizeArrayKeyframes(input, topDuration, topEase, defaults)
      : this.normalizePercentKeyframes(input, topDuration, topEase, defaults);

    if (points.length < 2) {
      console.warn(`[six-js] keyframes needs at least 2 points, got ${points.length}`);
    }

    const carry: Record<string, any>[] = this.targets.map(() => ({}));
    const tracks: KeyTrack[][] = this.targets.map(() => []);
    const trackIndexByKey: Record<string, number>[] = this.targets.map(() => ({}));
    const pointWindows: PointWindow[] = [];

    let prevEnd = 0;
    let maxEnd = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const fromPoint = points[i];
      const toPoint = points[i + 1];

      const startTime = prevEnd + toPoint.delay;
      const endTime = startTime + toPoint.duration;
      prevEnd = endTime;
      maxEnd = Math.max(maxEnd, endTime);

      const keys = new Set<string>();
      for (const k in toPoint.props) keys.add(k);

      this.targets.forEach((target, index) => {
        for (const key of keys) {
          const rawEnd = resolveDynamicValue(toPoint.props[key], index, target);

          const rawStart =
            key in fromPoint.props
              ? resolveDynamicValue(fromPoint.props[key], index, target)
              : key in carry[index]
                ? carry[index][key]
                : undefined;

          const handler = getPropertyHandler(key, rawEnd);

          let state: PropState;
          let isTransform = false;

          if (handler.type === "discrete") {
            state = { kind: "discrete", value: String(rawEnd), apply: handler.apply };
          } else {
            const resolved = this.resolveProp(target, key, rawStart, rawEnd);
            if (!resolved) continue;
            state = resolved.state;
            isTransform = resolved.isTransform;
          }

          carry[index][key] = rawEnd;

          if (i === 0) {
            this.registerImplicitRefresh(target, key, rawStart, rawEnd, state);
          }

          const entry: TrackEntry = { startTime, endTime, easeFn: toPoint.easeFn, state };

          const existingIdx = trackIndexByKey[index][key];
          if (existingIdx !== undefined) {
            tracks[index][existingIdx].entries.push(entry);
          } else {
            trackIndexByKey[index][key] = tracks[index].length;
            tracks[index].push({ key, isTransform, entries: [entry] });
          }
        }
      });

      pointWindows.push({
        startTime,
        endTime,
        onStart: toPoint.onSegmentStart,
        onUpdate: toPoint.onSegmentUpdate,
        onComplete: toPoint.onSegmentComplete,
      });
    }

    return { tracks, pointWindows, duration: maxEnd };
  }

  private normalizeArrayKeyframes(
    input: KeyframeArrayItem[],
    topDuration: number | undefined,
    topEase: EasingType | undefined,
    defaults: ReturnType<typeof getDefaults>,
  ): KeyframePoint[] {
    const points: KeyframePoint[] = [{ duration: 0, delay: 0, easeFn: EASINGS.linear, props: {} }];

    const withoutOwnDuration = input.filter((kf) => kf.duration === undefined).length;
    const explicitTotal = input.reduce((sum, kf) => sum + (kf.duration ?? 0), 0);

    const evenShare =
      topDuration !== undefined
        ? withoutOwnDuration > 0
          ? Math.max(0, topDuration - explicitTotal) / withoutOwnDuration
          : 0
        : defaults.duration ?? 0.5;

    for (const kf of input) {
      const { duration: kfDuration, ease: kfEase, delay: kfDelay, onStart, onUpdate, onComplete, ...props } = kf;
      const duration = this.resolveDuration(kfDuration ?? evenShare, defaults);
      const easeFn = this.resolveEase(kfEase ?? topEase);

      points.push({
        duration,
        delay: kfDelay ?? 0,
        easeFn,
        props,
        onSegmentStart: onStart,
        onSegmentUpdate: onUpdate,
        onSegmentComplete: onComplete,
      });
    }

    return points;
  }

  private normalizePercentKeyframes(
    input: KeyframePercentObject,
    topDuration: number | undefined,
    topEase: EasingType | undefined,
    defaults: ReturnType<typeof getDefaults>,
  ): KeyframePoint[] {
    const totalDuration = this.resolveDuration(topDuration, defaults);

    const parsed = Object.entries(input)
      .map(([posKey, props]) => {
        const m = posKey.trim().match(/^(-?[\d.]+)%$/);
        if (!m) {
          console.warn(`[six-js] keyframes: invalid position "${posKey}", expected e.g. "50%"`);
          return null;
        }
        return { pos: parseFloat(m[1]) / 100, props };
      })
      .filter((v): v is { pos: number; props: Record<string, any> } => v !== null)
      .sort((a, b) => a.pos - b.pos);

    if (parsed.length > 0 && parsed[0].pos !== 0) {
      console.warn(`[six-js] keyframes: first position should be "0%", got "${parsed[0].pos * 100}%"`);
    }

    const points: KeyframePoint[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const { ease: pointEase, delay: pointDelay, onStart, onUpdate, onComplete, ...props } = parsed[i].props as Record<
        string,
        any
      > & {
        ease?: EasingType;
        delay?: number;
        onStart?: () => void;
        onUpdate?: () => void;
        onComplete?: () => void;
      };
      const prevPos = i === 0 ? parsed[0].pos : parsed[i - 1].pos;
      const segDuration = i === 0 ? 0 : (parsed[i].pos - prevPos) * totalDuration;

      points.push({
        duration: Math.max(0, segDuration),
        delay: pointDelay ?? 0,
        easeFn: this.resolveEase(pointEase ?? topEase),
        props,
        onSegmentStart: onStart,
        onSegmentUpdate: onUpdate,
        onSegmentComplete: onComplete,
      });
    }

    return points;
  }

  render(localTime: number): void {
    this.targets.forEach((target, index) => {
      const tracks = this.targetTracks[index];
      let touchedTransform = false;

      for (const track of tracks) {
        const entries = track.entries;
        let entry = entries[0];

        for (const candidate of entries) {
          if (candidate.startTime <= localTime) entry = candidate;
          else break;
        }

        const span = entry.endTime - entry.startTime;
        const progress =
          span <= 0 ? (localTime >= entry.startTime ? 1 : 0) : Math.min(Math.max((localTime - entry.startTime) / span, 0), 1);
        const eased = entry.easeFn(progress);
        const state = entry.state;

        if (state.kind === "discrete") {
          if (localTime >= entry.startTime) state.apply(target, state.value);
          continue;
        }

        if (state.kind === "color") {
          state.apply(target, interpolateColor(state.start, state.end, eased));
          continue;
        }

        if (state.kind === "complex") {
          state.apply(target, interpolateComplexString(state.start, state.end, eased));
          continue;
        }

        const currentVal = state.start + (state.end - state.start) * eased;

        if (state.isTransform && state.transformFn) {
          setTransformValue(target, state.transformFn as keyof TransformCache, currentVal);
          touchedTransform = true;
        } else if (progress === 1 && localTime >= entry.endTime && state.snapEnd !== undefined) {
          (target.style as any)[track.key] = state.snapEnd;
        } else {
          state.apply(target, { num: currentVal, unit: state.unit });
        }
      }

      if (touchedTransform) {
        target.style.transform = buildTransformString(target);
      }
    });

    this.updateSegmentCallbacks(localTime);
  }

  private updateSegmentCallbacks(localTime: number): void {
    if (this.pointWindows.length === 0) return;

    const newActive = new Set<number>();

    this.pointWindows.forEach((w, i) => {
      if (localTime >= w.startTime && localTime <= w.endTime) newActive.add(i);
    });

    this.activeWindows.forEach((i) => {
      if (!newActive.has(i)) this.pointWindows[i].onComplete?.();
    });

    newActive.forEach((i) => {
      if (!this.activeWindows.has(i)) this.pointWindows[i].onStart?.();
    });

    newActive.forEach((i) => {
      this.pointWindows[i].onUpdate?.();
    });

    this.activeWindows = newActive;
  }

  onStart(): void {
    for (const refresh of this.implicitRefreshers) refresh();
    this.applyWillChange();
  }

  private applyWillChange(): void {
    this.targets.forEach((_target, index) => {
      if (this.targetTracks[index]?.some((track) => track.isTransform)) {
        this.targets[index].style.willChange = "transform";
      }
    });
  }

  onComplete(): void {
    this.targets.forEach((_target, index) => {
      if (this.targetTracks[index]?.some((track) => track.isTransform)) {
        this.targets[index].style.willChange = "";
      }
    });
  }

  getTouchedProperties(): { target: HTMLElement; keys: string[] }[] {
    return this.targets.map((target, index) => ({
      target,
      keys: this.targetTracks[index].map((track) => track.key),
    }));
  }
}
