import { describe, expect, it } from "vitest";
import { EASES, resolveEase } from "./easing";

describe("EASES", () => {
  it("every named ease returns exactly 0 at t=0 and 1 at t=1", () => {
    for (const [name, fn] of Object.entries(EASES)) {
      expect(fn(0), `${name}(0)`).toBeCloseTo(0, 5);
      expect(fn(1), `${name}(1)`).toBeCloseTo(1, 5);
    }
  });

  it("linear/none pass through unchanged", () => {
    expect(EASES.linear(0.37)).toBeCloseTo(0.37);
    expect(EASES.none(0.37)).toBeCloseTo(0.37);
  });

  it("power1.out is monotonically increasing and front-loaded (decelerating)", () => {
    const fn = EASES["power1.out"];
    expect(fn(0.25)).toBeGreaterThan(0.25);
    expect(fn(0.5)).toBeGreaterThan(fn(0.25));
    expect(fn(0.75)).toBeGreaterThan(fn(0.5));
  });

  it("back.out overshoots past 1 before settling", () => {
    const fn = EASES["back.out"];
    let overshot = false;
    for (let t = 0; t <= 1; t += 0.01) {
      if (fn(t) > 1) overshot = true;
    }
    expect(overshot).toBe(true);
  });

  it("bounce.out dips below a straight line before settling at 1", () => {
    const fn = EASES["bounce.out"];
    expect(fn(0.5)).toBeLessThan(1);
    expect(fn(1)).toBeCloseTo(1);
  });
});

describe("resolveEase", () => {
  it("passes a function through unchanged", () => {
    const custom = (t: number) => t * t;
    expect(resolveEase(custom)).toBe(custom);
  });

  it("resolves a known name", () => {
    expect(resolveEase("power2.in")).toBe(EASES["power2.in"]);
  });

  it("falls back to power1.out for an unknown name", () => {
    expect(resolveEase("not-a-real-ease")).toBe(EASES["power1.out"]);
  });

  it("falls back to power1.out when undefined", () => {
    expect(resolveEase(undefined)).toBe(EASES["power1.out"]);
  });
});
