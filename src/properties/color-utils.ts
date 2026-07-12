export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const RGB_REGEX = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;

export function parseColor(value: string): RGBA {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = window.getComputedStyle(probe).color;
  document.body.removeChild(probe);

  return parseRgbString(resolved);
}

export function parseRgbString(value: string): RGBA {
  const match = value.match(RGB_REGEX);

  if (!match) return { r: 0, g: 0, b: 0, a: 1 };

  return {
    r: parseFloat(match[1]),
    g: parseFloat(match[2]),
    b: parseFloat(match[3]),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1,
  };
}

export function interpolateColor(start: RGBA, end: RGBA, t: number): RGBA {
  return {
    r: start.r + (end.r - start.r) * t,
    g: start.g + (end.g - start.g) * t,
    b: start.b + (end.b - start.b) * t,
    a: start.a + (end.a - start.a) * t,
  };
}

export function rgbaToString(value: RGBA): string {
  return `rgba(${Math.round(value.r)}, ${Math.round(value.g)}, ${Math.round(value.b)}, ${value.a})`;
}