import { afterEach, describe, expect, it, vi } from "vitest";
import { Animation } from "../core/animation";
import { ticker, TickerListener } from "../core/ticker";
import { createDirectSync, createSmoothSync } from "./sync";

class StubAnimation extends Animation {
  protected _renderIteration(): void {}
}

function captureTick(): (deltaMs: number) => void {
  let captured: TickerListener | undefined;
  vi.spyOn(ticker, "add").mockImplementation((cb) => {
    captured = cb;
    return cb;
  });
  vi.spyOn(ticker, "remove").mockImplementation(() => {});
  return (deltaMs: number) => captured?.(0, deltaMs, 0);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sync - createDirectSync", () => {
  it("sets progress synchronously, 1:1, both via update() and snapTo()", () => {
    const a = new StubAnimation();
    a.duration(1);
    const sync = createDirectSync(a);

    sync.update(0.42);
    expect(a.totalProgress()).toBeCloseTo(0.42);

    sync.snapTo(0.9);
    expect(a.totalProgress()).toBeCloseTo(0.9);
  });
});

describe("sync - createSmoothSync", () => {
  it("follows an expo.out retarget curve, not a slow-starting continuous decay", () => {
    const fire = captureTick();
    const a = new StubAnimation();
    a.duration(1);
    const sync = createSmoothSync(a, 1); // 1 second smoothing

    fire(16); // one tick to pass the "settled" gate
    a.totalProgress(0);

    sync.update(1); // retarget 0 -> 1 over 1 second
    fire(100); // 0.1s elapsed = 10% of the smoothing duration

    // expo.out(0.1) = 1 - 2^-1 = 0.5 - already halfway there, not barely moved
    expect(a.totalProgress()).toBeCloseTo(0.5, 2);
  });

  it("restarts the ease fresh from wherever it currently is when retargeted again mid-flight", () => {
    const fire = captureTick();
    const a = new StubAnimation();
    a.duration(1);
    const sync = createSmoothSync(a, 1);

    fire(16);
    a.totalProgress(0);

    sync.update(1);
    fire(500); // halfway through the 1s smoothing window
    const midway = a.totalProgress() as number;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1);

    sync.update(midway); // retarget to the value it's already sitting at
    fire(500);
    expect(a.totalProgress()).toBeCloseTo(midway, 5); // no further movement needed
  });

  it("snaps instantly (no easing) until the first real tick has fired, to avoid a page-reload rewind", () => {
    captureTick();
    const a = new StubAnimation();
    a.duration(1);
    const sync = createSmoothSync(a, 1);

    sync.update(0.8); // no tick has fired yet since creation
    expect(a.totalProgress()).toBe(0.8);
  });

  it("snapTo() always sets progress instantly, regardless of settled state", () => {
    const fire = captureTick();
    const a = new StubAnimation();
    a.duration(1);
    const sync = createSmoothSync(a, 1);

    fire(16);
    sync.snapTo(0.33);
    expect(a.totalProgress()).toBeCloseTo(0.33);

    fire(16); // should not move further - already settled at the snapped value
    expect(a.totalProgress()).toBeCloseTo(0.33);
  });
});
