import { describe, expect, it } from "vitest";
import { damp, resolveStrength } from "./parallax-motion";

describe("parallax-motion - damp", () => {
  it("matches the frame-rate-independent exponential decay formula (parity with smooth-scroll/motion.ts's damp)", () => {
    // damp(x, y, lambda, dt) = x + (y-x) * (1 - e^(-lambda*dt))
    const result = damp(0, 100, 5, 0.1);
    expect(result).toBeCloseTo(100 * (1 - Math.exp(-0.5)), 10);
  });

  it("is exactly composable across split time steps (true frame-rate independence)", () => {
    const oneStep = damp(0, 100, 6, 0.2);
    const twoSteps = damp(damp(0, 100, 6, 0.1), 100, 6, 0.1);
    expect(twoSteps).toBeCloseTo(oneStep, 12);
  });

  it("reaches `to` exactly when deltaSeconds is 0 (no movement without elapsed time)", () => {
    expect(damp(10, 100, 5, 0)).toBe(10);
  });

  it("approaches but never overshoots `to` for a growing target", () => {
    const result = damp(0, 100, 5, 0.1);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });
});

describe("parallax-motion - resolveStrength", () => {
  it("parses a valid numeric attribute string", () => {
    expect(resolveStrength("40", 30)).toBe(40);
  });

  it("accepts negative numbers (inverted-direction depth)", () => {
    expect(resolveStrength("-25", 30)).toBe(-25);
  });

  it('treats "0" as a real explicit value, not a missing one', () => {
    expect(resolveStrength("0", 30)).toBe(0);
  });

  it("trims surrounding whitespace", () => {
    expect(resolveStrength("  15  ", 30)).toBe(15);
  });

  it("falls back to the given default for null", () => {
    expect(resolveStrength(null, 30)).toBe(30);
  });

  it("falls back to the given default for an empty/whitespace-only string", () => {
    expect(resolveStrength("", 30)).toBe(30);
    expect(resolveStrength("   ", 30)).toBe(30);
  });

  it("falls back to the given default for a non-numeric string", () => {
    expect(resolveStrength("not-a-number", 30)).toBe(30);
  });
});
