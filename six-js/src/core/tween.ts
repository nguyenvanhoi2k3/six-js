// src/core/tween.ts
import { EASINGS, EasingType } from "../easing/easing";
import { Animatable } from "./animatable";
import {
  getPropertyHandler,
  resolveNumericValue,
  ParsedValue,
  NumericPropertyHandler,
  ColorPropertyHandler,
  ComplexPropertyHandler,
} from "../properties/registry";
import { parseColor, interpolateColor, RGBA } from "../properties/color-utils";
import { validateComplexPair, interpolateComplexString } from "../properties/complex-utils";
import { setStoredTransform, buildTransformString } from "../properties/transform-state";

export interface TweenVars {
  duration?: number;
  ease?: EasingType;
  [key: string]: any; // x, y, rotation, opacity, backgroundColor, boxShadow, display, ...
}

interface NumericPropState {
  kind: "numeric";
  start: number;
  end: number;
  unit: string;
  isTransform: boolean;
  transformFn?: string;
  apply: NumericPropertyHandler["apply"];
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
 */
export class SxTween implements Animatable {
  readonly duration: number;

  private targets: HTMLElement[];
  private easeFn: (t: number) => number;
  private propStates: { key: string; state: PropState }[][] = [];
  private hasTransform: boolean[] = [];

  constructor(target: string | HTMLElement | HTMLElement[], vars: TweenVars) {
    if (typeof target === "string") {
      this.targets = Array.from(document.querySelectorAll(target));
    } else {
      this.targets = Array.isArray(target) ? target : [target];
    }

    this.duration = vars.duration ?? 0.5;
    const easeKey = vars.ease ?? "linear";
    this.easeFn = EASINGS[easeKey] || EASINGS.linear;

    this.setupProps(vars);
  }

  private setupProps(vars: TweenVars): void {
    this.targets.forEach((target, index) => {
      const states: { key: string; state: PropState }[] = [];
      let transformTouched = false;

      for (const key in vars) {
        if (key === "duration" || key === "ease") continue;

        const rawValue = vars[key];
        const handler = getPropertyHandler(key, rawValue);

        if (handler.type === "discrete") {
          handler.apply(target, String(rawValue));
          continue;
        }

        if (handler.type === "color") {
          const start = handler.getCurrent(target);
          const end = parseColor(String(rawValue));

          states.push({ key, state: { kind: "color", start, end, apply: handler.apply } });
          continue;
        }

        if (handler.type === "complex") {
          const startStr = handler.getCurrent(target);
          const endStr = String(rawValue);

          validateComplexPair(startStr, endStr, key);

          states.push({ key, state: { kind: "complex", start: startStr, end: endStr, apply: handler.apply } });
          continue;
        }

        const startParsed: ParsedValue = handler.getCurrent(target, key);
        const endParsed: ParsedValue = resolveNumericValue(
          rawValue,
          startParsed.num,
          startParsed.unit,
          handler.defaultUnit,
        );

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
            apply: handler.apply,
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
        const { state } = states[i];

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
          setStoredTransform(target, state.transformFn, {
            value: currentVal,
            unit: state.unit,
            fn: state.transformFn,
          });
          touchedTransform = true;
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