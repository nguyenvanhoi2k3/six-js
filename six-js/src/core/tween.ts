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

export interface TweenVars {
  duration?: number;
  ease?: EasingType;
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

type PropState = NumericPropState | ColorPropState | ComplexPropState;

/**
 * SxTween chỉ biết "vẽ" theo localTime, KHÔNG tự chạy theo ticker.
 * Việc play/pause/seek là trách nhiệm của Playable (xem playable.ts).
 *
 * mode quyết định bên nào đọc DOM, bên nào lấy giá trị tường minh:
 * - "to":     start = đọc DOM hiện tại,  end = vars (tường minh)
 * - "from":   start = vars (tường minh), end = đọc DOM hiện tại
 * - "fromTo": start = fromVars (tường minh), end = vars (tường minh), không đọc DOM
 */
export class SxTween implements Animatable {
  readonly duration: number;

  private targets: HTMLElement[];
  private easeFn: (t: number) => number;
  private propStates: { key: string; state: PropState }[][] = [];
  private hasTransform: boolean[] = [];

  /** Danh sách phần tử DOM thực sự bị tween này chạm vào — dùng bởi overwrite-manager
   *  để biết cần huỷ tween nào khi có tween mới ghi đè lên cùng target. */
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

    const defaults = getDefaults();

    this.duration = vars.duration ?? defaults.duration ?? 0.5;

    if (this.duration < 0) {
      console.warn(`[six-js] Negative duration (${this.duration}), using 0 instead`);
      this.duration = 0;
    }

    const easeKey = vars.ease ?? defaults.ease ?? "linear";

    if (!EASINGS[easeKey]) {
      console.warn(`[six-js] Unknown ease "${easeKey}", falling back to linear`);
    }

    this.easeFn = EASINGS[easeKey] || EASINGS.linear;

    this.setupProps(vars, mode, fromVars);
  }

  private setupProps(vars: TweenVars, mode: TweenMode, fromVars?: Record<string, any>): void {
    const keys = new Set<string>();
    for (const k in vars) keys.add(k);
    if (fromVars) for (const k in fromVars) keys.add(k);
    keys.delete("duration");
    keys.delete("ease");

    this.targets.forEach((target, index) => {
      const states: { key: string; state: PropState }[] = [];
      let transformTouched = false;

      for (const key of keys) {
        // Xác định rawStart/rawEnd tường minh theo mode; undefined nghĩa là "đọc DOM"
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
          handler.apply(target, String(rawEnd ?? rawStart));
          continue;
        }

        if (handler.type === "color") {
          const start = rawStart !== undefined ? parseColor(String(rawStart)) : handler.getCurrent(target);
          const end = rawEnd !== undefined ? parseColor(String(rawEnd)) : handler.getCurrent(target);

          states.push({ key, state: { kind: "color", start, end, apply: handler.apply } });
          continue;
        }

        if (handler.type === "complex") {
          const startStr = rawStart !== undefined ? String(rawStart) : handler.getCurrent(target);
          const endStr = rawEnd !== undefined ? String(rawEnd) : handler.getCurrent(target);

          validateComplexPair(startStr, endStr, key);

          states.push({ key, state: { kind: "complex", start: startStr, end: endStr, apply: handler.apply } });
          continue;
        }

        // numeric
        const startParsed: ParsedValue =
          rawStart !== undefined
            ? parseNumericValue(rawStart, handler.defaultUnit)
            : handler.getCurrent(target, key);

        let endParsed: ParsedValue =
          rawEnd !== undefined
            ? resolveNumericValue(rawEnd, startParsed.num, startParsed.unit, handler.defaultUnit)
            : handler.getCurrent(target, key);

        let snapEnd: string | undefined;

        if (
          !handler.isTransform &&
          endParsed.unit &&
          startParsed.unit &&
          endParsed.unit !== startParsed.unit
        ) {
          const pxValue = convertToPx(target, key, `${endParsed.num}${endParsed.unit}`);
          snapEnd = `${endParsed.num}${endParsed.unit}`;
          endParsed = { num: pxValue, unit: startParsed.unit };
        }

        if (handler.isTransform) transformTouched = true;

        states.push({
          key,
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
        });
      }

      this.propStates[index] = states;
      this.hasTransform[index] = transformTouched;
    });
  }

  render(localTime: number): void {
    const progress = this.duration === 0 ? 1 : Math.min(localTime / this.duration, 1);
    const eased = this.easeFn(progress);

    this.targets.forEach((target, index) => {
      const states = this.propStates[index];
      let touchedTransform = false;

      for (let i = 0; i < states.length; i++) {
        const { key, state } = states[i];

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
  }

  onStart(): void {
    this.targets.forEach((target, index) => {
      if (this.hasTransform[index]) {
        target.style.willChange = "transform";
      }
    });
  }

  onComplete(): void {
    this.targets.forEach((target, index) => {
      if (this.hasTransform[index]) {
        target.style.willChange = "";
      }
    });
  }
}