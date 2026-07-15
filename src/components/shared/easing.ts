// Named-easing table used only by the sx-* web components (native WAAPI `.animate()` calls,
// slider inertia physics) - deliberately separate from `src/easing/easing.ts` (the six-js Tween
// engine's own easing table), so components never depend on the Tween/Animation engine.
export type EasingFunction = (t: number) => number;

function bounceOut(t: number): number {
  const n = 7.5625;
  const d = 2.75;

  if (t < 1 / d) {
    return n * t * t;
  }

  if (t < 2 / d) {
    t -= 1.5 / d;
    return n * t * t + 0.75;
  }

  if (t < 2.5 / d) {
    t -= 2.25 / d;
    return n * t * t + 0.9375;
  }

  t -= 2.625 / d;
  return n * t * t + 0.984375;
}

const BACK = 1.70158;
const BACK_IN_OUT = BACK * 1.525;

export const EASINGS: Record<string, EasingFunction> = {
  linear: (t) => t,

  "quadIn": (t) => t * t,
  "quadOut": (t) => 1 - (1 - t) * (1 - t),
  "quadInOut": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  "cubicIn": (t) => t * t * t,
  "cubicOut": (t) => 1 - Math.pow(1 - t, 3),
  "cubicInOut": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  "quartIn": (t) => t ** 4,
  "quartOut": (t) => 1 - (1 - t) ** 4,
  "quartInOut": (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  "quintIn": (t) => t ** 5,
  "quintOut": (t) => 1 - (1 - t) ** 5,
  "quintInOut": (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  "strongIn": (t) => t ** 5,
  "strongOut": (t) => 1 - (1 - t) ** 5,
  "strongInOut": (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  "sineIn": (t) => 1 - Math.cos((t * Math.PI) / 2),
  "sineOut": (t) => Math.sin((t * Math.PI) / 2),
  "sineInOut": (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  "expoIn": (t) =>
    t === 0 ? 0 : Math.pow(2, 10 * (t - 1)) * t + Math.pow(t, 6) * (1 - t),

  "expoOut": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  "expoInOut": (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;

    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  "circIn": (t) => 1 - Math.sqrt(1 - t * t),

  "circOut": (t) => Math.sqrt(1 - (t - 1) * (t - 1)),

  "circInOut": (t) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,

  "backIn": (t) => (BACK + 1) * t * t * t - BACK * t * t,

  "backOut": (t) => {
    t--;
    return 1 + (BACK + 1) * t * t * t + BACK * t * t;
  },

  "backInOut": (t) => {
    if (t < 0.5) {
      const x = 2 * t;
      return (x * x * ((BACK_IN_OUT + 1) * x - BACK_IN_OUT)) / 2;
    }

    const x = 2 * t - 2;

    return (x * x * ((BACK_IN_OUT + 1) * x + BACK_IN_OUT) + 2) / 2;
  },

  "bounceIn": (t) => 1 - bounceOut(1 - t),

  "bounceOut": bounceOut,

  "bounceInOut": (t) =>
    t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2,
};

export type EasingType = keyof typeof EASINGS;

export const CSS_EASINGS: Record<string, string> = {
  linear: "linear",

  quadIn: "cubic-bezier(0.11, 0, 0.5, 0)",
  quadOut: "cubic-bezier(0.5, 1, 0.89, 1)",
  quadInOut: "cubic-bezier(0.45, 0, 0.55, 1)",

  cubicIn: "cubic-bezier(0.32, 0, 0.67, 0)",
  cubicOut: "cubic-bezier(0.33, 1, 0.68, 1)",
  cubicInOut: "cubic-bezier(0.65, 0, 0.35, 1)",

  quartIn: "cubic-bezier(0.5, 0, 0.75, 0)",
  quartOut: "cubic-bezier(0.25, 1, 0.5, 1)",
  quartInOut: "cubic-bezier(0.76, 0, 0.24, 1)",

  quintIn: "cubic-bezier(0.64, 0, 0.78, 0)",
  quintOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  quintInOut: "cubic-bezier(0.83, 0, 0.17, 1)",

  strongIn: "cubic-bezier(0.64, 0, 0.78, 0)",
  strongOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  strongInOut: "cubic-bezier(0.83, 0, 0.17, 1)",

  sineIn: "cubic-bezier(0.12, 0, 0.39, 0)",
  sineOut: "cubic-bezier(0.61, 1, 0.88, 1)",
  sineInOut: "cubic-bezier(0.37, 0, 0.63, 1)",

  expoIn: "cubic-bezier(0.7, 0, 0.84, 0)",
  expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  expoInOut: "cubic-bezier(0.87, 0, 0.13, 1)",

  circIn: "cubic-bezier(0.55, 0, 1, 0.45)",
  circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
  circInOut: "cubic-bezier(0.85, 0, 0.15, 1)",

  backIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
  backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  backInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",

  bounceIn: "ease-in",
  bounceOut: "ease-out",
  bounceInOut: "ease-in-out",
};

export function toCssEasing(name: string): string {
  return CSS_EASINGS[name] ?? "ease-out";
}
