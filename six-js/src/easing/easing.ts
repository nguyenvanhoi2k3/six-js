// src/easing/easing.ts

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
  // Linear
  linear: (t) => t,

  // Quad
  "quad-in": (t) => t * t,
  "quad-out": (t) => 1 - (1 - t) * (1 - t),
  "quad-in-out": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  // Cubic
  "cubic-in": (t) => t * t * t,
  "cubic-out": (t) => 1 - Math.pow(1 - t, 3),
  "cubic-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Quart
  "quart-in": (t) => t ** 4,
  "quart-out": (t) => 1 - (1 - t) ** 4,
  "quart-in-out": (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  // Quint
  "quint-in": (t) => t ** 5,
  "quint-out": (t) => 1 - (1 - t) ** 5,
  "quint-in-out": (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  // Strong (GSAP alias)
  "strong-in": (t) => t ** 5,
  "strong-out": (t) => 1 - (1 - t) ** 5,
  "strong-in-out": (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  // Sine
  "sine-in": (t) => 1 - Math.cos((t * Math.PI) / 2),
  "sine-out": (t) => Math.sin((t * Math.PI) / 2),
  "sine-in-out": (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Expo
  "expo-in": (t) =>
    t === 0 ? 0 : Math.pow(2, 10 * (t - 1)) * t + Math.pow(t, 6) * (1 - t),

  "expo-out": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  "expo-in-out": (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;

    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Circ
  "circ-in": (t) => 1 - Math.sqrt(1 - t * t),

  "circ-out": (t) => Math.sqrt(1 - (t - 1) * (t - 1)),

  "circ-in-out": (t) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,

  // Back
  "back-in": (t) => (BACK + 1) * t * t * t - BACK * t * t,

  "back-out": (t) => {
    t--;
    return 1 + (BACK + 1) * t * t * t + BACK * t * t;
  },

  "back-in-out": (t) => {
    if (t < 0.5) {
      const x = 2 * t;
      return (x * x * ((BACK_IN_OUT + 1) * x - BACK_IN_OUT)) / 2;
    }

    const x = 2 * t - 2;

    return (x * x * ((BACK_IN_OUT + 1) * x + BACK_IN_OUT) + 2) / 2;
  },

  // Bounce
  "bounce-in": (t) => 1 - bounceOut(1 - t),

  "bounce-out": bounceOut,

  "bounce-in-out": (t) =>
    t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2,
};

export type EasingType = keyof typeof EASINGS;
