import { describe, expect, it } from "vitest";
import { computeStaggerDelay } from "./stagger";

describe("computeStaggerDelay", () => {
  it("treats a bare number as a fixed per-index delay", () => {
    expect(computeStaggerDelay(0, 5, 0.1)).toBe(0);
    expect(computeStaggerDelay(3, 5, 0.1)).toBeCloseTo(0.3);
  });

  it("staggers from the start by default", () => {
    expect(computeStaggerDelay(2, 5, { each: 0.1 })).toBeCloseTo(0.2);
  });

  it("staggers from the end", () => {
    expect(computeStaggerDelay(0, 5, { each: 0.1, from: "end" })).toBeCloseTo(0.4);
    expect(computeStaggerDelay(4, 5, { each: 0.1, from: "end" })).toBeCloseTo(0);
  });

  it("staggers from the center outward symmetrically", () => {
    expect(computeStaggerDelay(0, 5, { each: 0.1, from: "center" })).toBeCloseTo(0.2);
    expect(computeStaggerDelay(2, 5, { each: 0.1, from: "center" })).toBeCloseTo(0);
    expect(computeStaggerDelay(4, 5, { each: 0.1, from: "center" })).toBeCloseTo(0.2);
  });

  it("staggers from an arbitrary index", () => {
    expect(computeStaggerDelay(1, 5, { each: 0.1, from: 3 })).toBeCloseTo(0.2);
  });
});
