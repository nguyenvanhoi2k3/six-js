const NUMBER_REGEX = /-?[\d.]+/g;

function countNumbers(str: string): number {
  return (str.match(NUMBER_REGEX) || []).length;
}

export function validateComplexPair(startStr: string, endStr: string, key: string): boolean {
  const startCount = countNumbers(startStr);
  const endCount = countNumbers(endStr);
  const ok = startCount === endCount && endCount > 0;

  if (!ok) {
    console.warn(`[six-js] "${key}": shape mismatch (${startCount} vs ${endCount} numbers), will snap instead of interpolate`);
  }

  return ok;
}

export function interpolateComplexString(startStr: string, endStr: string, t: number): string {
  const startNums = (startStr.match(NUMBER_REGEX) || []).map(Number);
  let i = 0;

  return endStr.replace(NUMBER_REGEX, (match) => {
    const end = parseFloat(match);
    const start = startNums[i] ?? end;
    i++;

    const value = start + (end - start) * t;
    return String(Math.round(value * 1000) / 1000);
  });
}