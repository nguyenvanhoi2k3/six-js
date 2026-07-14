import { EaseFn } from "../easing/easing";

export interface GlobalDefaults {
  duration: number;
  ease: string | EaseFn;
}

let defaults: GlobalDefaults = { duration: 0.5, ease: "power1.out" };

/** six.config({ duration, ease }) - sets the fallback duration/ease used when a tween doesn't specify its own. */
export function setDefaults(value: Partial<GlobalDefaults>): void {
  defaults = { ...defaults, ...value };
}

export function getDefaults(): GlobalDefaults {
  return defaults;
}

/** Test-only: restores factory defaults so tests don't leak global state into each other. */
export function resetDefaults(): void {
  defaults = { duration: 0.5, ease: "power1.out" };
}
