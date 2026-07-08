export function parseTimeValue(value: string | null, fallbackMs: number): number {
  if (value == null) return fallbackMs;

  const trimmed = value.trim();
  if (!trimmed) return fallbackMs;

  const match = trimmed.match(/^(-?\d*\.?\d+)(ms|s)?$/i);
  if (!match) {
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed * 1000 : fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();

  if (unit === "ms") return amount;
  if (unit === "s") return amount * 1000;
  if (!Number.isInteger(amount)) return amount * 1000;
  return amount <= 10 ? amount * 1000 : amount;
}
