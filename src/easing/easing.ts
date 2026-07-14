export type EaseFn = (t: number) => number;

function bounceOut(t: number): number {
  const n = 7.5625;
  const d = 2.75;

  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) {
    const u = t - 1.5 / d;
    return n * u * u + 0.75;
  }
  if (t < 2.5 / d) {
    const u = t - 2.25 / d;
    return n * u * u + 0.9375;
  }
  const u = t - 2.625 / d;
  return n * u * u + 0.984375;
}

const BACK = 1.70158;
const BACK_IN_OUT = BACK * 1.525;
const ELASTIC_C4 = (2 * Math.PI) / 3;
const ELASTIC_C5 = (2 * Math.PI) / 4.5;

export const EASES: Record<string, EaseFn> = {
  none: (t) => t,
  linear: (t) => t,

  "power1.in": (t) => t * t,
  "power1.out": (t) => 1 - (1 - t) * (1 - t),
  "power1.inOut": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  "power2.in": (t) => t * t * t,
  "power2.out": (t) => 1 - Math.pow(1 - t, 3),
  "power2.inOut": (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  "power3.in": (t) => t ** 4,
  "power3.out": (t) => 1 - (1 - t) ** 4,
  "power3.inOut": (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  "power4.in": (t) => t ** 5,
  "power4.out": (t) => 1 - (1 - t) ** 5,
  "power4.inOut": (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  "sine.in": (t) => 1 - Math.cos((t * Math.PI) / 2),
  "sine.out": (t) => Math.sin((t * Math.PI) / 2),
  "sine.inOut": (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  "expo.in": (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  "expo.out": (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  "expo.inOut": (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  "circ.in": (t) => 1 - Math.sqrt(1 - t * t),
  "circ.out": (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
  "circ.inOut": (t) => (t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2),

  "back.in": (t) => (BACK + 1) * t * t * t - BACK * t * t,
  "back.out": (t) => {
    const u = t - 1;
    return 1 + (BACK + 1) * u * u * u + BACK * u * u;
  },
  "back.inOut": (t) => {
    if (t < 0.5) {
      const x = 2 * t;
      return (x * x * ((BACK_IN_OUT + 1) * x - BACK_IN_OUT)) / 2;
    }
    const x = 2 * t - 2;
    return (x * x * ((BACK_IN_OUT + 1) * x + BACK_IN_OUT) + 2) / 2;
  },

  "bounce.in": (t) => 1 - bounceOut(1 - t),
  "bounce.out": bounceOut,
  "bounce.inOut": (t) => (t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2),

  "elastic.in": (t) => (t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4)),
  "elastic.out": (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1),
  "elastic.inOut": (t) => {
    if (t === 0 || t === 1) return t;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1;
  },
};

export function resolveEase(ease: string | EaseFn | undefined): EaseFn {
  if (typeof ease === "function") return ease;
  if (ease && EASES[ease]) return EASES[ease];
  return EASES["power1.out"];
}
