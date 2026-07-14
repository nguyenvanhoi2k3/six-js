export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_RE = /^#([0-9a-f]{3,8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i;
const RGB_SPACE_RE = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i;

// A hardcoded table (rather than resolving through the DOM/CSSOM) so parsing is deterministic
// across environments - notably jsdom's CSSOM does not normalize named colors on style
// assignment the way real browsers do, which would make this silently environment-dependent.
const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  aqua: [0, 255, 255],
  magenta: [255, 0, 255],
  fuchsia: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  lime: [0, 255, 0],
  navy: [0, 0, 128],
  teal: [0, 128, 128],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
  gold: [255, 215, 0],
  indigo: [75, 0, 130],
  violet: [238, 130, 238],
  coral: [255, 127, 80],
  salmon: [250, 128, 114],
  khaki: [240, 230, 140],
  crimson: [220, 20, 60],
  chocolate: [210, 105, 30],
  tomato: [255, 99, 71],
  orchid: [218, 112, 214],
  plum: [221, 160, 221],
  turquoise: [64, 224, 208],
  tan: [210, 180, 140],
  beige: [245, 245, 220],
  ivory: [255, 255, 240],
  lavender: [230, 230, 250],
  skyblue: [135, 206, 235],
  steelblue: [70, 130, 180],
  slateblue: [106, 90, 205],
  royalblue: [65, 105, 225],
  dodgerblue: [30, 144, 255],
  deepskyblue: [0, 191, 255],
  cornflowerblue: [100, 149, 237],
  forestgreen: [34, 139, 34],
  seagreen: [46, 139, 87],
  springgreen: [0, 255, 127],
  yellowgreen: [154, 205, 50],
  darkred: [139, 0, 0],
  darkblue: [0, 0, 139],
  darkgreen: [0, 100, 0],
  darkorange: [255, 140, 0],
  darkviolet: [148, 0, 211],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  lightblue: [173, 216, 230],
  lightgreen: [144, 238, 144],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightyellow: [255, 255, 224],
  hotpink: [255, 105, 180],
  deeppink: [255, 20, 147],
  chartreuse: [127, 255, 0],
  aquamarine: [127, 255, 212],
  firebrick: [178, 34, 34],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  peachpuff: [255, 218, 185],
  sienna: [160, 82, 45],
  transparent: [0, 0, 0],
};

/** Resolves a CSS named color (e.g. "cornflowerblue") to an [r,g,b] triple, or null if unrecognized. */
function resolveNamedColor(name: string): [number, number, number] | null {
  return NAMED_COLORS[name.toLowerCase()] ?? null;
}

function hexChannel(hex: string, i: number, size: 1 | 2): number {
  const s = size === 1 ? hex[i] + hex[i] : hex.slice(i, i + 2);
  return parseInt(s, 16);
}

export function parseColor(input: string): RGBA {
  const value = input.trim();

  const hexMatch = value.match(HEX_RE);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      const a = hex.length === 4 ? hexChannel(hex, 3, 1) / 255 : 1;
      return { r: hexChannel(hex, 0, 1), g: hexChannel(hex, 1, 1), b: hexChannel(hex, 2, 1), a };
    }
    if (hex.length === 6 || hex.length === 8) {
      const a = hex.length === 8 ? hexChannel(hex, 6, 2) / 255 : 1;
      return { r: hexChannel(hex, 0, 2), g: hexChannel(hex, 2, 2), b: hexChannel(hex, 4, 2), a };
    }
  }

  const rgbMatch = value.match(RGB_RE) ?? value.match(RGB_SPACE_RE);
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    return {
      r: parseFloat(r),
      g: parseFloat(g),
      b: parseFloat(b),
      a: a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a),
    };
  }

  if (/^[a-z]+$/i.test(value)) {
    const named = resolveNamedColor(value);
    if (named) return { r: named[0], g: named[1], b: named[2], a: value.toLowerCase() === "transparent" ? 0 : 1 };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

export function interpolateColor(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
    a: Math.round((a.a + (b.a - a.a) * t) * 1000) / 1000,
  };
}

export function formatColor(c: RGBA): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

export function isColorLike(value: string): boolean {
  const v = value.trim();
  return HEX_RE.test(v) || RGB_RE.test(v) || RGB_SPACE_RE.test(v) || /^[a-z]+$/i.test(v);
}
