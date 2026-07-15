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

  quadIn: (t) => t * t,
  quadOut: (t) => 1 - (1 - t) * (1 - t),
  quadInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  cubicIn: (t) => t * t * t,
  cubicOut: (t) => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

  quartIn: (t) => t ** 4,
  quartOut: (t) => 1 - (1 - t) ** 4,
  quartInOut: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  quintIn: (t) => t ** 5,
  quintOut: (t) => 1 - (1 - t) ** 5,
  quintInOut: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t) => Math.sin((t * Math.PI) / 2),
  sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  expoIn: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  expoInOut: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  circIn: (t) => 1 - Math.sqrt(1 - t * t),
  circOut: (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
  circInOut: (t) => (t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2),

  backIn: (t) => (BACK + 1) * t * t * t - BACK * t * t,
  backOut: (t) => {
    const u = t - 1;
    return 1 + (BACK + 1) * u * u * u + BACK * u * u;
  },
  backInOut: (t) => {
    if (t < 0.5) {
      const x = 2 * t;
      return (x * x * ((BACK_IN_OUT + 1) * x - BACK_IN_OUT)) / 2;
    }
    const x = 2 * t - 2;
    return (x * x * ((BACK_IN_OUT + 1) * x + BACK_IN_OUT) + 2) / 2;
  },

  bounceIn: (t) => 1 - bounceOut(1 - t),
  bounceOut: bounceOut,
  bounceInOut: (t) => (t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2),

  elasticIn: (t) => (t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C4)),
  elasticOut: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1),
  elasticInOut: (t) => {
    if (t === 0 || t === 1) return t;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_C5)) / 2 + 1;
  },

  // six-js signature eases - not part of any other library's naming.
  // Zero velocity AND zero acceleration at both ends (quintic smootherstep) - reads as
  // noticeably silkier than sineInOut, with no lingering "coast" at the edges.
  smooth: (t) => t * t * t * (t * (t * 6 - 15) + 10),
  // Crisp damped-spring settle (~1.75 oscillations) - overshoots and undershoots 1 before
  // settling, but via a continuous decaying cosine rather than elastic's segmented formula.
  spring: (t) => 1 - Math.cos(t * 3.5 * Math.PI) * Math.pow(2, -6 * t),
  // Looser, slower-decaying wobble (~1.25 oscillations) than `spring` - a softer, jelly-like settle.
  jelly: (t) => 1 - Math.cos(t * 2.5 * Math.PI) * Math.pow(2, -5 * t),
};

export function resolveEase(ease: string | EaseFn | undefined): EaseFn {
  if (typeof ease === "function") return ease;
  if (ease && EASES[ease]) return EASES[ease];
  return EASES["quadOut"];
}
