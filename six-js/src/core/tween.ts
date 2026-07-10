// src/core/tween.ts
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
import { setStoredTransform, buildTransformString } from "../properties/transform-state";
import { convertToPx } from "../properties/unit-convert";
import { resolveDynamicValue } from "../properties/dynamic-value";
import { getDefaults } from "./defaults";

/** 1 mốc trong dạng mảng: { x: 100, duration: 1, ease: "..." } — duration/ease riêng cho mốc này.
 *  Có thể thêm onStart/onUpdate/onComplete riêng cho từng mốc, khác với callback tổng của
 *  cả tween (onStart/onComplete truyền ở ngoài keyframes, do Playable quản lý). */
export type KeyframeArrayItem = Record<string, any> & {
  duration?: number;
  ease?: EasingType;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
};

/** Dạng object theo %: { "0%": {...}, "50%": {...}, "100%": {...} } */
export type KeyframePercentObject = Record<string, Record<string, any>>;

export type KeyframesInput = KeyframeArrayItem[] | KeyframePercentObject;

export interface TweenVars {
  duration?: number;
  ease?: EasingType;
  /** Dãy mốc animate tuần tự, giống keyframes của GSAP — xem KeyframesInput. */
  keyframes?: KeyframesInput;
  /** Giây chờ trước khi chạy lần đầu (không lặp lại mỗi vòng repeat). */
  delay?: number;
  /** true: KHÔNG tự chạy khi tạo tween, chờ gọi .play() thủ công. Giống GSAP `paused`. */
  paused?: boolean;
  /** Số lần lặp SAU lần chạy đầu. -1 = vô hạn. */
  repeat?: number;
  /** Giây tạm dừng giữa các lượt lặp. */
  repeatDelay?: number;
  /** Tương đương yoyo của GSAP: mỗi lượt lặp tự đảo chiều thay vì nhảy về đầu. Đặt tên
   *  "boomerang" để KHÔNG bị nhầm với method .reverse() (tua ngược thủ công, khác hẳn). */
  boomerang?: boolean;
  /** true: huỷ toàn bộ tween khác đang chạy trên cùng target. "auto": (tạm thời xử lý
   *  giống true — xem ghi chú trong overwrite-manager.ts) chỉ huỷ property trùng nhau. */
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
  transformStoreKey?: string;
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

interface Segment {
  duration: number;
  easeFn: (t: number) => number;
  /** propStates[targetIndex] = danh sách property của target đó trong đoạn này */
  propStates: { key: string; state: PropState }[][];
  hasTransform: boolean[];
  /** Callback riêng cho keyframe này (khác onStart/onComplete của toàn bộ tween, do
   *  Playable quản lý). Chỉ có ý nghĩa khi dùng keyframes — single segment (to/from/fromTo)
   *  không có callback riêng vì chính là onStart/onComplete của Playable rồi. */
  onSegmentStart?: () => void;
  onSegmentUpdate?: () => void;
  onSegmentComplete?: () => void;
}

/**
 * SxTween chỉ biết "vẽ" theo localTime, KHÔNG tự chạy theo ticker.
 * Việc play/pause/seek là trách nhiệm của Playable (xem playable.ts).
 *
 * Nội bộ luôn biểu diễn dưới dạng danh sách "segment" nối tiếp nhau — to()/from()/fromTo()
 * chỉ là trường hợp đặc biệt "1 segment duy nhất", còn keyframes là N segment nối tiếp,
 * mỗi segment tự có duration/ease riêng, property nào không xuất hiện ở segment sau thì
 * tự động giữ nguyên giá trị segment trước để lại (carry-forward), không cần khai báo lại.
 *
 * mode quyết định bên nào đọc DOM, bên nào lấy giá trị tường minh (chỉ áp dụng khi
 * KHÔNG dùng keyframes):
 * - "to":     start = đọc DOM hiện tại,  end = vars (tường minh)
 * - "from":   start = vars (tường minh), end = đọc DOM hiện tại
 * - "fromTo": start = fromVars (tường minh), end = vars (tường minh), không đọc DOM
 */
export class SxTween implements Animatable {
  readonly duration: number;

  private targets: HTMLElement[];
  private segments: Segment[] = [];
  private lastSegIndex = -1;

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

      this.segments = this.buildKeyframeSegments(vars.keyframes, vars);
    } else {
      this.segments = [this.buildSingleSegment(vars, mode, fromVars)];
    }

    this.duration = this.segments.reduce((sum, seg) => sum + seg.duration, 0);
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

  /** Tạo 1 PropState từ rawStart/rawEnd đã resolve — dùng chung cho single-segment lẫn keyframes */
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

    // numeric
    const startParsed: ParsedValue =
      rawStart !== undefined ? parseNumericValue(rawStart, handler.defaultUnit) : handler.getCurrent(target, key);

    let endParsed: ParsedValue =
      rawEnd !== undefined
        ? resolveNumericValue(rawEnd, startParsed.num, startParsed.unit, handler.defaultUnit)
        : handler.getCurrent(target, key);

    let snapEnd: string | undefined;

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
        transformStoreKey: handler.transformStoreKey,
        apply: handler.apply,
        snapEnd,
      },
    };
  }

  // ---------- single segment (to/from/fromTo) ----------

  private buildSingleSegment(vars: TweenVars, mode: TweenMode, fromVars?: Record<string, any>): Segment {
    const defaults = getDefaults();
    const duration = this.resolveDuration(vars.duration, defaults);
    const easeFn = this.resolveEase(vars.ease ?? defaults.ease);

    const keys = new Set<string>();
    for (const k in vars) keys.add(k);
    if (fromVars) for (const k in fromVars) keys.add(k);
    keys.delete("duration");
    keys.delete("ease");
    keys.delete("keyframes");

    const propStates: { key: string; state: PropState }[][] = [];
    const hasTransform: boolean[] = [];

    this.targets.forEach((target, index) => {
      const states: { key: string; state: PropState }[] = [];
      let transformTouched = false;

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

        // discrete: giữ hành vi CŨ — set ngay lập tức lúc setup (single-segment không có
        // khái niệm "thời điểm trong tương lai" để hoãn áp dụng, khác với keyframes).
        const handler = getPropertyHandler(key, rawEnd ?? rawStart);
        if (handler.type === "discrete") {
          handler.apply(target, String(rawEnd ?? rawStart));
          continue;
        }

        const resolved = this.resolveProp(target, key, rawStart, rawEnd);
        if (!resolved) continue;

        if (resolved.isTransform) transformTouched = true;
        states.push({ key: resolved.key, state: resolved.state });
      }

      propStates[index] = states;
      hasTransform[index] = transformTouched;
    });

    return { duration, easeFn, propStates, hasTransform };
  }

  // ---------- keyframes ----------

  private buildKeyframeSegments(input: KeyframesInput, vars: TweenVars): Segment[] {
    const defaults = getDefaults();
    const topDuration = vars.duration;
    const topEase = vars.ease ?? defaults.ease;

    const points = Array.isArray(input)
      ? this.normalizeArrayKeyframes(input, topDuration, topEase, defaults)
      : this.normalizePercentKeyframes(input, topDuration, topEase, defaults);

    if (points.length < 2) {
      console.warn(`[six-js] keyframes needs at least 2 points, got ${points.length}`);
    }

    // carry[targetIndex][key] = giá trị RAW cuối cùng của key đó tính tới điểm mốc hiện tại
    const carry: Record<string, any>[] = this.targets.map(() => ({}));
    const segments: Segment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const fromPoint = points[i];
      const toPoint = points[i + 1];

      const propStates: { key: string; state: PropState }[][] = [];
      const hasTransform: boolean[] = [];

      const keys = new Set<string>();
      for (const k in toPoint.props) keys.add(k);

      this.targets.forEach((target, index) => {
        const states: { key: string; state: PropState }[] = [];
        let transformTouched = false;

        for (const key of keys) {
          const rawEnd = resolveDynamicValue(toPoint.props[key], index, target);

          const rawStart =
            key in fromPoint.props
              ? resolveDynamicValue(fromPoint.props[key], index, target)
              : key in carry[index]
                ? carry[index][key]
                : undefined; // undefined -> đọc DOM hiện tại (điểm mốc đầu tiên chưa có carry)

          const handler = getPropertyHandler(key, rawEnd);

          if (handler.type === "discrete") {
            states.push({
              key,
              state: { kind: "discrete", value: String(rawEnd), apply: handler.apply },
            });
            carry[index][key] = rawEnd;
            continue;
          }

          const resolved = this.resolveProp(target, key, rawStart, rawEnd);
          if (!resolved) continue;

          if (resolved.isTransform) transformTouched = true;
          states.push({ key: resolved.key, state: resolved.state });
          carry[index][key] = rawEnd;
        }

        propStates[index] = states;
        hasTransform[index] = transformTouched;
      });

      segments.push({
        duration: toPoint.duration,
        easeFn: toPoint.easeFn,
        propStates,
        hasTransform,
        onSegmentStart: toPoint.onSegmentStart,
        onSegmentUpdate: toPoint.onSegmentUpdate,
        onSegmentComplete: toPoint.onSegmentComplete,
      });
    }

    // Điểm mốc đầu tiên (vd "0%") cần được ÁP DỤNG NGAY để phần tử ở đúng trạng thái ban
    // đầu kể cả khi có delay trước khi Playable thật sự bắt đầu chạy — render(0) của segment
    // đầu tiên (progress=0) đã tự làm việc này rồi nên KHÔNG cần xử lý gì thêm ở đây.

    return segments;
  }

  private normalizeArrayKeyframes(
    input: KeyframeArrayItem[],
    topDuration: number | undefined,
    topEase: EasingType | undefined,
    defaults: ReturnType<typeof getDefaults>,
  ): {
    duration: number;
    easeFn: (t: number) => number;
    props: Record<string, any>;
    onSegmentStart?: () => void;
    onSegmentUpdate?: () => void;
    onSegmentComplete?: () => void;
  }[] {
    const points: {
      duration: number;
      easeFn: (t: number) => number;
      props: Record<string, any>;
      onSegmentStart?: () => void;
      onSegmentUpdate?: () => void;
      onSegmentComplete?: () => void;
    }[] = [{ duration: 0, easeFn: EASINGS.linear, props: {} }];

    const withoutOwnDuration = input.filter((kf) => kf.duration === undefined).length;
    const explicitTotal = input.reduce((sum, kf) => sum + (kf.duration ?? 0), 0);

    const evenShare =
      topDuration !== undefined
        ? withoutOwnDuration > 0
          ? Math.max(0, topDuration - explicitTotal) / withoutOwnDuration
          : 0
        : defaults.duration ?? 0.5;

    for (const kf of input) {
      const { duration: kfDuration, ease: kfEase, onStart, onUpdate, onComplete, ...props } = kf;
      const duration = this.resolveDuration(kfDuration ?? evenShare, defaults);
      const easeFn = this.resolveEase(kfEase ?? topEase);

      points.push({
        duration,
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
  ): {
    duration: number;
    easeFn: (t: number) => number;
    props: Record<string, any>;
    onSegmentStart?: () => void;
    onSegmentUpdate?: () => void;
    onSegmentComplete?: () => void;
  }[] {
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

    const points: {
      duration: number;
      easeFn: (t: number) => number;
      props: Record<string, any>;
      onSegmentStart?: () => void;
      onSegmentUpdate?: () => void;
      onSegmentComplete?: () => void;
    }[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const { ease: pointEase, onStart, onUpdate, onComplete, ...props } = parsed[i].props as Record<
        string,
        any
      > & {
        ease?: EasingType;
        onStart?: () => void;
        onUpdate?: () => void;
        onComplete?: () => void;
      };
      const prevPos = i === 0 ? parsed[0].pos : parsed[i - 1].pos;
      const segDuration = i === 0 ? 0 : (parsed[i].pos - prevPos) * totalDuration;

      points.push({
        duration: Math.max(0, segDuration),
        easeFn: this.resolveEase(pointEase ?? topEase),
        props,
        onSegmentStart: onStart,
        onSegmentUpdate: onUpdate,
        onSegmentComplete: onComplete,
      });
    }

    return points;
  }

  // ---------- render ----------

  render(localTime: number): void {
    let t = localTime;
    let segIndex = 0;

    while (segIndex < this.segments.length - 1 && t > this.segments[segIndex].duration) {
      t -= this.segments[segIndex].duration;
      segIndex++;
    }

    const seg = this.segments[segIndex];
    if (!seg) return;

    const progress = seg.duration === 0 ? 1 : Math.min(Math.max(t / seg.duration, 0), 1);
    const eased = seg.easeFn(progress);

    // Phát hiện chuyển segment (chỉ có ý nghĩa với keyframes — single segment không set
    // các callback này nên các dòng dưới là no-op an toàn với to/from/fromTo).
    if (segIndex !== this.lastSegIndex) {
      if (this.lastSegIndex !== -1 && segIndex > this.lastSegIndex) {
        this.segments[this.lastSegIndex].onSegmentComplete?.();
      }
      seg.onSegmentStart?.();
      this.lastSegIndex = segIndex;
    }

    this.targets.forEach((target, index) => {
      const states = seg.propStates[index];
      let touchedTransform = false;

      for (let i = 0; i < states.length; i++) {
        const { key, state } = states[i];

        if (state.kind === "discrete") {
          state.apply(target, state.value);
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
          setStoredTransform(target, state.transformStoreKey ?? state.transformFn, {
            value: currentVal,
            unit: state.unit,
            fn: state.transformFn,
          });
          touchedTransform = true;
        } else if (progress === 1 && state.snapEnd !== undefined) {
          (target.style as any)[key] = state.snapEnd;
        } else {
          state.apply(target, { num: currentVal, unit: state.unit });
        }
      }

      if (touchedTransform) {
        target.style.transform = buildTransformString(target);
      }
    });

    seg.onSegmentUpdate?.();

    if (segIndex === this.segments.length - 1 && progress === 1) {
      seg.onSegmentComplete?.();
    }
  }

  onStart(): void {
    this.targets.forEach((_target, index) => {
      if (this.segments.some((seg) => seg.hasTransform[index])) {
        this.targets[index].style.willChange = "transform";
      }
    });
  }

  onComplete(): void {
    this.targets.forEach((_target, index) => {
      if (this.segments.some((seg) => seg.hasTransform[index])) {
        this.targets[index].style.willChange = "";
      }
    });
  }

  /** Union tất cả property key bị chạm qua mọi segment — dùng bởi overwrite-manager */
  getTouchedProperties(): { target: HTMLElement; keys: string[] }[] {
    return this.targets.map((target, index) => {
      const keySet = new Set<string>();
      for (const seg of this.segments) {
        for (const { key } of seg.propStates[index]) keySet.add(key);
      }
      return { target, keys: Array.from(keySet) };
    });
  }
}