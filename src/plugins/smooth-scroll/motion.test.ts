import { describe, expect, it } from "vitest";
import { damp, lerp, ScrollMotion } from "./motion";

describe("motion - lerp/damp", () => {
  it("lerp interpolates linearly, unclamped", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(0, 100, 1.5)).toBe(150);
  });

  it("damp matches the frame-rate-independent exponential decay formula", () => {
    // damp(x, y, lambda, dt) = lerp(x, y, 1 - e^(-lambda*dt))
    const result = damp(0, 100, 5, 0.1);
    expect(result).toBeCloseTo(100 * (1 - Math.exp(-0.5)), 10);
  });

  it("damping is exactly composable across split time steps (true frame-rate independence)", () => {
    // Two half-steps toward a FIXED target must equal one full step, to floating precision -
    // this is what a naive `value += (to-value)*factor` per-frame formula gets wrong.
    const oneStep = damp(0, 100, 6, 0.2);
    const twoSteps = damp(damp(0, 100, 6, 0.1), 100, 6, 0.1);
    expect(twoSteps).toBeCloseTo(oneStep, 12);
  });
});

describe("ScrollMotion - lerp mode", () => {
  it("chases the target asymptotically and settles once rounded-equal", () => {
    const m = new ScrollMotion(0);
    m.retarget(1000, { lerp: 0.1 });

    expect(m.isSettled).toBe(false);
    const completed = m.advance(1 / 60);
    expect(completed).toBe(false);
    expect(m.value).toBeGreaterThan(0);
    expect(m.value).toBeLessThan(1000);

    // Enough real time for a lerp(0.1) chase to converge well within rounding distance.
    let settledOnThisCall = false;
    for (let i = 0; i < 600 && !settledOnThisCall; i++) {
      settledOnThisCall = m.advance(1 / 60);
    }
    expect(settledOnThisCall).toBe(true);
    expect(m.value).toBe(1000);
    expect(m.isSettled).toBe(true);

    // Completion fires once, not on every already-settled call after.
    expect(m.advance(1 / 60)).toBe(false);
  });

  it("redirecting mid-chase continues from the current value, not from the original start", () => {
    const m = new ScrollMotion(0);
    m.retarget(1000, { lerp: 0.1 });
    for (let i = 0; i < 30; i++) m.advance(1 / 60);
    const midway = m.value;
    expect(midway).toBeGreaterThan(0);

    m.retarget(2000, { lerp: 0.1 });
    expect(m.value).toBe(midway); // no jump/reset on redirect
    m.advance(1 / 60);
    expect(m.value).toBeGreaterThan(midway);
    expect(m.value).toBeLessThan(2000);
  });

  it("lerp: 0 behaves as an instant jump, matching Lenis's own falsy-lerp fallthrough", () => {
    const m = new ScrollMotion(0);
    m.retarget(500, { lerp: 0 });
    const completed = m.advance(1 / 60);
    expect(completed).toBe(true);
    expect(m.value).toBe(500);
  });

  it("retargeting to the current value is already settled - advance() is a no-op", () => {
    const m = new ScrollMotion(42);
    m.retarget(42, { lerp: 0.1 });
    expect(m.isSettled).toBe(true);
    expect(m.advance(1 / 60)).toBe(false);
    expect(m.value).toBe(42);
  });
});

describe("ScrollMotion - duration/ease mode", () => {
  it("interpolates linearly-in-time through the given ease and completes at duration", () => {
    const m = new ScrollMotion(0);
    m.retarget(100, { duration: 1, ease: (t) => t }); // linear ease

    m.advance(0.5);
    expect(m.value).toBeCloseTo(50, 5);
    expect(m.isSettled).toBe(false);

    const completed = m.advance(0.5);
    expect(completed).toBe(true);
    expect(m.value).toBe(100);
  });

  it("applies the given easing function, not linear-in-value", () => {
    const m = new ScrollMotion(0);
    m.retarget(100, { duration: 1, ease: (t) => t * t }); // quadIn

    m.advance(0.5);
    expect(m.value).toBeCloseTo(25, 5); // 0.5^2 * 100
  });

  it("redirecting resets elapsed and eases fresh from the current value", () => {
    const m = new ScrollMotion(0);
    m.retarget(100, { duration: 1, ease: (t) => t });
    m.advance(0.5); // value = 50

    m.retarget(200, { duration: 1, ease: (t) => t });
    expect(m.value).toBe(50); // unchanged at the moment of redirect
    m.advance(0.5); // halfway through the NEW tween: 50 -> 200
    expect(m.value).toBeCloseTo(125, 5);
  });

  it("zero duration completes immediately on the first advance", () => {
    const m = new ScrollMotion(0);
    m.retarget(100, { duration: 0, ease: (t) => t });
    expect(m.advance(1 / 60)).toBe(true);
    expect(m.value).toBe(100);
  });
});

describe("ScrollMotion - jump", () => {
  it("moves value/target together with no animation", () => {
    const m = new ScrollMotion(0);
    m.retarget(1000, { lerp: 0.1 });
    m.advance(1 / 60);
    expect(m.isSettled).toBe(false);

    m.jump(250);
    expect(m.value).toBe(250);
    expect(m.target).toBe(250);
    expect(m.isSettled).toBe(true);
    expect(m.advance(1 / 60)).toBe(false);
  });
});
