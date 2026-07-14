import { describe, expect, it, vi } from "vitest";
import { Ticker } from "./ticker";

describe("Ticker (manual mode)", () => {
  it("never schedules real rAF frames", () => {
    const t = new Ticker({ manual: true });
    const listener = vi.fn();
    t.add(listener);
    expect(t.isAwake).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it("dispatches to listeners on tick with time/delta/frame", () => {
    const t = new Ticker({ manual: true });
    const listener = vi.fn();
    t.add(listener);

    t.tick(16);

    expect(listener).toHaveBeenCalledTimes(1);
    const [time, delta, frame] = listener.mock.calls[0];
    expect(time).toBeCloseTo(0.016);
    expect(delta).toBe(16);
    expect(frame).toBe(1);
  });

  it("accumulates time across multiple ticks", () => {
    const t = new Ticker({ manual: true });
    t.tick(16);
    t.tick(16);
    t.tick(16);
    expect(t.time).toBeCloseTo(0.048);
    expect(t.currentFrame).toBe(3);
  });

  it("does not add the same listener twice", () => {
    const t = new Ticker({ manual: true });
    const listener = vi.fn();
    t.add(listener);
    t.add(listener);
    expect(t.listenerCount).toBe(1);

    t.tick(16);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("removes a listener so it stops receiving ticks", () => {
    const t = new Ticker({ manual: true });
    const listener = vi.fn();
    t.add(listener);
    t.remove(listener);
    expect(t.listenerCount).toBe(0);

    t.tick(16);
    expect(listener).not.toHaveBeenCalled();
  });

  it("lets a listener remove itself mid-dispatch without skipping the next listener", () => {
    const t = new Ticker({ manual: true });
    const calls: string[] = [];

    const a = vi.fn(() => calls.push("a"));
    const b = vi.fn(() => {
      calls.push("b");
      t.remove(b);
    });
    const c = vi.fn(() => calls.push("c"));

    t.add(a);
    t.add(b);
    t.add(c);

    t.tick(16);
    expect(calls).toEqual(["a", "b", "c"]);

    t.tick(16);
    expect(calls).toEqual(["a", "b", "c", "a", "c"]);
  });

  it("lets a listener remove an earlier listener mid-dispatch without breaking iteration", () => {
    const t = new Ticker({ manual: true });
    const calls: string[] = [];

    const a = vi.fn(() => calls.push("a"));
    const b = vi.fn(() => {
      calls.push("b");
      t.remove(a);
    });
    const c = vi.fn(() => calls.push("c"));

    t.add(a);
    t.add(b);
    t.add(c);

    t.tick(16);
    expect(calls).toEqual(["a", "b", "c"]);

    calls.length = 0;
    t.tick(16);
    expect(calls).toEqual(["b", "c"]);
  });

  it("computes deltaRatio relative to a reference fps", () => {
    const t = new Ticker({ manual: true });
    t.tick(1000 / 30); // exactly half the frame rate of 60fps
    expect(t.deltaRatio(60)).toBeCloseTo(2);
  });

  it("wake()/sleep() are inert in manual mode", () => {
    const t = new Ticker({ manual: true });
    t.wake();
    expect(t.isAwake).toBe(false);
    t.sleep();
    expect(t.isAwake).toBe(false);
  });
});
