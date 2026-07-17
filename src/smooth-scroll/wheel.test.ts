import { describe, expect, it } from "vitest";
import { normalizeWheel } from "./wheel";

function wheelEvent(deltaX: number, deltaY: number, deltaMode = 0): WheelEvent {
  return new WheelEvent("wheel", { deltaX, deltaY, deltaMode });
}

describe("normalizeWheel", () => {
  it("passes pixel-mode (deltaMode 0) deltas through unchanged", () => {
    const result = normalizeWheel(wheelEvent(10, 120, 0), 1000, 800);
    expect(result).toEqual({ deltaX: 10, deltaY: 120 });
  });

  it("converts line-mode (deltaMode 1) deltas using the line-height estimate", () => {
    const result = normalizeWheel(wheelEvent(0, 3, 1), 1000, 800);
    expect(result.deltaY).toBeCloseTo(3 * (100 / 6), 5);
  });

  it("converts page-mode (deltaMode 2) deltas using the relevant viewport dimension", () => {
    const result = normalizeWheel(wheelEvent(1, 1, 2), 1000, 800);
    expect(result.deltaX).toBeCloseTo(1000, 5);
    expect(result.deltaY).toBeCloseTo(800, 5);
  });

  it("applies the multiplier on top of the mode conversion", () => {
    const result = normalizeWheel(wheelEvent(10, 20, 0), 1000, 800, 2);
    expect(result).toEqual({ deltaX: 20, deltaY: 40 });
  });
});
