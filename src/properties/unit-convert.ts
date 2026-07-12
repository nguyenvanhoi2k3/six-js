export function convertToPx(target: HTMLElement, cssKey: string, valueStr: string): number {
  const prev = (target.style as any)[cssKey];
  (target.style as any)[cssKey] = valueStr;
  const px = parseFloat((window.getComputedStyle(target) as any)[cssKey]) || 0;
  (target.style as any)[cssKey] = prev;
  return px;
}