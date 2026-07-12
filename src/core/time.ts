export function parseTimeValue(value: string | null, fallbackMs: number): number {
  if (value == null) return fallbackMs;

  const trimmed = value.trim();
  if (!trimmed) return fallbackMs;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed * 1000 : fallbackMs;
}
