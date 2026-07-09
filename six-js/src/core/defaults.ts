// src/core/defaults.ts
import { EasingType } from "../easing/easing";

export interface TweenDefaults {
  duration?: number;
  ease?: EasingType;
}

let defaults: TweenDefaults = {};

/** Merge thêm default mới, không xoá default cũ chưa được ghi đè */
export function setDefaults(newDefaults: TweenDefaults): void {
  defaults = { ...defaults, ...newDefaults };
}

export function getDefaults(): TweenDefaults {
  return defaults;
}