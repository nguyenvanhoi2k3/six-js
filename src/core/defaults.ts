import { EasingType } from "../easing/easing";

export interface TweenDefaults {
  duration?: number;
  ease?: EasingType;
}

let defaults: TweenDefaults = {};

export function setDefaults(newDefaults: TweenDefaults): void {
  defaults = { ...defaults, ...newDefaults };
}

export function getDefaults(): TweenDefaults {
  return defaults;
}