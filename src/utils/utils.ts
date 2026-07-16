import { resolveTargets, TweenTarget } from "../tween/tween";

export function arrayOf(target: TweenTarget, scope?: Element | Document): Element[] {
  return resolveTargets(target, scope);
}

export function getById(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function getByClass(className: string, scope?: Element | Document): Element[] {
  return Array.from((scope ?? document).getElementsByClassName(className));
}

export function clamp(min: number, max: number, value: number): number;
export function clamp(min: number, max: number): (value: number) => number;
export function clamp(min: number, max: number, value?: number): number | ((value: number) => number) {
  if (value === undefined) return (v: number) => clamp(min, max, v);
  return value < min ? min : value > max ? max : value;
}

export function random(array: readonly unknown[]): unknown;
export function random(min: number, max: number, snapIncrement?: number, returnFunction?: boolean): number | (() => number);
export function random(minOrArray: number | readonly unknown[], max?: number, snapIncrement?: number, returnFunction?: boolean): unknown {
  if (Array.isArray(minOrArray)) {
    return minOrArray[Math.floor(Math.random() * minOrArray.length)];
  }

  const min = minOrArray as number;
  const generate = (): number => {
    const value = min + Math.random() * ((max as number) - min);
    return snapIncrement ? Math.round(value / snapIncrement) * snapIncrement : value;
  };

  return returnFunction ? generate : generate();
}
