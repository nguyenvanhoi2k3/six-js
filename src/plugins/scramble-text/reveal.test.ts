import { describe, expect, it } from "vitest";
import { delayedProgress } from "./reveal";

describe("delayedProgress", () => {
  it("stays at 0 until delay elapses", () => {
    expect(delayedProgress(0, 2, 0.5)).toBe(0);
    expect(delayedProgress(0.4, 2, 0.5)).toBe(0);
    expect(delayedProgress(0.5, 2, 0.5)).toBe(0);
  });

  it("ramps 0->1 over the remaining duration after delay", () => {
    expect(delayedProgress(1.25, 2, 0.5)).toBeCloseTo(0.5); // halfway through the remaining 1.5s
  });

  it("reaches exactly 1 at duration regardless of delay", () => {
    expect(delayedProgress(2, 2, 0.5)).toBe(1);
    expect(delayedProgress(2, 2, 0)).toBe(1);
    expect(delayedProgress(2, 2, 1.9)).toBe(1);
  });

  it("clamps to [0, 1] outside the duration window", () => {
    expect(delayedProgress(-1, 2, 0.5)).toBe(0);
    expect(delayedProgress(5, 2, 0.5)).toBe(1);
  });

  it("degenerates cleanly when duration <= delay (e.g. a zero-duration set)", () => {
    expect(delayedProgress(0, 0, 0)).toBe(1);
    expect(delayedProgress(-0.01, 0, 0)).toBe(0);
    expect(delayedProgress(0.1, 0.05, 0.05)).toBe(1); // delay >= duration
  });
});
