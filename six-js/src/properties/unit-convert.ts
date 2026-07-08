// src/properties/unit-convert.ts

/**
 * Convert any CSS length unit (%, vw, rem...) to its px equivalent by temporarily
 * applying it to the element and reading back the computed px value. One-time cost
 * at setup, never called inside the render loop.
 */
export function convertToPx(target: HTMLElement, cssKey: string, valueStr: string): number {
  const prev = (target.style as any)[cssKey];
  (target.style as any)[cssKey] = valueStr;
  const px = parseFloat((window.getComputedStyle(target) as any)[cssKey]) || 0;
  (target.style as any)[cssKey] = prev;
  return px;
}