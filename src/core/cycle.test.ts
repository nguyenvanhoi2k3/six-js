import { describe, expect, it } from "vitest";
import { resolveCycle, totalDurationOf } from "./cycle";

describe("totalDurationOf", () => {
  it("equals dur when there is no repeat", () => {
    expect(totalDurationOf(2, 0, 0)).toBe(2);
  });

  it("accounts for repeatDelay between (not after) iterations", () => {
    expect(totalDurationOf(1, 2, 0.5)).toBeCloseTo(1 * 3 + 0.5 * 2);
  });

  it("is Infinity for negative repeat (infinite)", () => {
    expect(totalDurationOf(1, -1, 0)).toBe(Infinity);
  });
});

describe("resolveCycle - no repeat", () => {
  it("clamps below 0 and above dur", () => {
    expect(resolveCycle(-1, 1, 0, 0, false)).toEqual({ iteration: 0, time: 0, reversed: false });
    expect(resolveCycle(2, 1, 0, 0, false)).toEqual({ iteration: 0, time: 1, reversed: false });
  });

  it("passes through the middle unchanged", () => {
    expect(resolveCycle(0.3, 1, 0, 0, false)).toEqual({ iteration: 0, time: 0.3, reversed: false });
  });

  it("treats a zero duration as instantaneous", () => {
    expect(resolveCycle(5, 0, 0, 0, false)).toEqual({ iteration: 0, time: 0, reversed: false });
  });
});

describe("resolveCycle - finite repeat, no repeatDelay", () => {
  const dur = 1;
  const repeat = 2; // 3 total iterations: 0, 1, 2

  it("resolves the middle of the first iteration", () => {
    expect(resolveCycle(0.5, dur, repeat, 0, false)).toEqual({ iteration: 0, time: 0.5, reversed: false });
  });

  it("treats an exact iteration boundary as the end of the previous iteration", () => {
    expect(resolveCycle(1, dur, repeat, 0, false)).toEqual({ iteration: 0, time: 1, reversed: false });
  });

  it("resolves the middle of the second iteration", () => {
    expect(resolveCycle(1.5, dur, repeat, 0, false)).toEqual({ iteration: 1, time: 0.5, reversed: false });
  });

  it("clamps to the final iteration at full completion", () => {
    expect(resolveCycle(3, dur, repeat, 0, false)).toEqual({ iteration: 2, time: 1, reversed: false });
  });

  it("clamps overshoot beyond total duration to the end", () => {
    expect(resolveCycle(100, dur, repeat, 0, false)).toEqual({ iteration: 2, time: 1, reversed: false });
  });

  it("clamps undershoot below 0", () => {
    expect(resolveCycle(-5, dur, repeat, 0, false)).toEqual({ iteration: 0, time: 0, reversed: false });
  });
});

describe("resolveCycle - repeatDelay gap", () => {
  const dur = 1;
  const repeatDelay = 0.5;
  const cycleLength = dur + repeatDelay;

  it("holds at the end value during the gap after an iteration", () => {
    const result = resolveCycle(1.2, dur, 2, repeatDelay, false);
    expect(result.iteration).toBe(0);
    expect(result.time).toBe(1);
  });

  it("resumes at the start of the next iteration once the gap elapses", () => {
    const result = resolveCycle(cycleLength, dur, 2, repeatDelay, false);
    expect(result.iteration).toBe(1);
    expect(result.time).toBe(0);
  });
});

describe("resolveCycle - boomerang", () => {
  const dur = 1;
  const repeat = 3;

  it("does not reverse the first (even) iteration", () => {
    expect(resolveCycle(0.25, dur, repeat, 0, true)).toEqual({ iteration: 0, time: 0.25, reversed: false });
  });

  it("reverses odd iterations", () => {
    const result = resolveCycle(1.25, dur, repeat, 0, true);
    expect(result.iteration).toBe(1);
    expect(result.reversed).toBe(true);
    expect(result.time).toBeCloseTo(1 - 0.25);
  });

  it("reverses back to forward on the third iteration", () => {
    const result = resolveCycle(2.25, dur, repeat, 0, true);
    expect(result.iteration).toBe(2);
    expect(result.reversed).toBe(false);
    expect(result.time).toBeCloseTo(0.25);
  });
});

describe("resolveCycle - infinite repeat", () => {
  it("never clamps the upper bound", () => {
    const result = resolveCycle(1000.5, 1, -1, 0, false);
    expect(result.iteration).toBe(1000);
    expect(result.time).toBeCloseTo(0.5);
  });
});
