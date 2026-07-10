const RANDOM_REGEX = /^random\((.+)\)$/i;

function isNumericToken(s: string): boolean {
  return /^-?[\d.]+$/.test(s.trim());
}

function resolveRandomString(value: string): string | number {
  const match = value.match(RANDOM_REGEX);
  if (!match) return value;

  const parts = match[1].split(",").map((s) => s.trim());

  if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) {
    console.warn(`[six-js] Invalid random() syntax: "${value}"`);
    return value;
  }

  if (parts.length === 2 && parts.every(isNumericToken)) {
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    return min + Math.random() * (max - min);
  }

  return parts[Math.floor(Math.random() * parts.length)];
}

export function resolveDynamicValue(raw: any, index: number, target: HTMLElement): any {
  let value = raw;

  if (typeof value === "function") {
    value = value(index, target);
  }

  if (typeof value === "string") {
    value = resolveRandomString(value);
  }

  return value;
}