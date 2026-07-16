import { describe, expect, it } from "vitest";
import { Animation, AnimationParent } from "./animation";

interface RenderCall {
  localTime: number;
  reversed: boolean;
  iteration: number;
}

class StubAnimation extends Animation {
  renders: RenderCall[] = [];

  protected _renderIteration(localTime: number, reversed: boolean, iteration: number, _suppressEvents: boolean, _force: boolean): void {
    this.renders.push({ localTime, reversed, iteration });
  }
}

function fakeParent(): AnimationParent & { removed: Animation[]; uncacheCalls: number } {
  return {
    removed: [],
    uncacheCalls: 0,
    _removeChild(child) {
      this.removed.push(child);
    },
    _uncache() {
      this.uncacheCalls++;
    },
  };
}

describe("Animation - duration/totalDuration", () => {
  it("reports duration and totalDuration with no repeat", () => {
    const a = new StubAnimation();
    a.duration(2);
    expect(a.duration()).toBe(2);
    expect(a.totalDuration()).toBe(2);
  });

  it("folds delay into totalDuration", () => {
    const a = new StubAnimation({ delay: 0.5 });
    a.duration(2);
    expect(a.totalDuration()).toBe(2.5);
  });

  it("accounts for repeat and repeatDelay in totalDuration", () => {
    const a = new StubAnimation({ repeat: 2, repeatDelay: 0.5 });
    a.duration(1);
    expect(a.totalDuration()).toBeCloseTo(1 * 3 + 0.5 * 2);
  });
});

describe("Animation - basic rendering", () => {
  it("renders the requested local time within duration", () => {
    const a = new StubAnimation();
    a.duration(2);
    a.totalTime(1);
    expect(a.renders.at(-1)).toEqual({ localTime: 1, reversed: false, iteration: 0 });
    expect(a.time()).toBe(1);
    expect(a.progress()).toBeCloseTo(0.5);
  });

  it("clamps totalTime to [0, totalDuration] for a non-repeating animation", () => {
    const a = new StubAnimation();
    a.duration(2);
    a.totalTime(5);
    expect(a.time()).toBe(2);
    a.totalTime(-5);
    expect(a.time()).toBe(0);
  });

  it("still re-renders when totalTime is set to the same value again", () => {
    // deliberately NOT optimized away (see the comment in Animation.render()): a sibling under
    // the same parent can touch the same target between two renders that coincidentally compute
    // the same totalTime for this animation, so value-equality alone isn't a safe skip signal.
    const a = new StubAnimation();
    a.duration(2);
    a.totalTime(1);
    a.totalTime(1);
    expect(a.renders).toHaveLength(2);
  });

  it("progress()/totalProgress() read and write as fractions", () => {
    const a = new StubAnimation({ repeat: 1 });
    a.duration(2);
    a.totalProgress(0.5);
    expect(a.totalTime()).toBe(2); // halfway through totalDuration of 4 (2 iterations of 2s)
    // landing exactly on the boundary between iterations reads as the END of the first
    // iteration (progress 1), not the start of the second - see core/cycle.ts.
    expect(a.progress()).toBe(1);

    a.totalProgress(0.625); // 2.5s -> just into the 2nd iteration
    expect(a.progress()).toBeCloseTo(0.25);
  });
});

describe("Animation - play/pause/speed/reverse", () => {
  it("paused() reflects speed being forced to 0 without losing the recorded rate", () => {
    const a = new StubAnimation();
    a.speed(2);
    a.pause();
    expect(a.paused()).toBe(true);
    expect(a.speed()).toBe(2); // recorded rate preserved
    a.play();
    expect(a.paused()).toBe(false);
    expect(a.speed()).toBe(2);
  });

  it("reversed() and reverse() are derived from the sign of speed, not a separate flag", () => {
    const a = new StubAnimation();
    expect(a.reversed()).toBe(false);
    a.reverse();
    expect(a.reversed()).toBe(true);
    expect(a.paused()).toBe(false);
    expect((a.speed() as number) < 0).toBe(true);
  });

  it("preserves direction across a pause/resume cycle", () => {
    const a = new StubAnimation();
    a.reversed(true);
    a.pause();
    a.resume();
    expect(a.reversed()).toBe(true);
  });

  it("play() forces forward playback even after reverse(), unlike resume()", () => {
    const a = new StubAnimation();
    a.reverse();
    expect(a.reversed()).toBe(true);
    a.play();
    expect(a.reversed()).toBe(false);
  });
});

describe("Animation - restart(includeDelay)", () => {
  it("by default (includeDelay: false) skips the delay, starting from the active portion immediately", () => {
    const a = new StubAnimation({ delay: 1 });
    a.duration(1);
    a.totalTime(2, true); // fully played through delay + active duration

    a.restart();
    expect(a.totalTime()).toBe(1); // _delay, i.e. the boundary where the active portion begins - not re-waiting
  });

  it("includeDelay: true replays the delay from the true beginning", () => {
    const a = new StubAnimation({ delay: 1 });
    a.duration(1);
    a.totalTime(2, true);

    a.restart(true);
    expect(a.totalTime()).toBe(0);
  });
});

describe("Animation - repeat/boomerang cycling via totalTime", () => {
  it("fires repeat when crossing an iteration boundary while advancing", () => {
    const a = new StubAnimation({ repeat: 2 });
    a.duration(1);
    let repeats = 0;
    a.on("repeat", () => repeats++);

    a.totalTime(0.5);
    expect(repeats).toBe(0);
    a.totalTime(1.5);
    expect(repeats).toBe(1);
    a.totalTime(2.5);
    expect(repeats).toBe(2);
  });

  it("reverses local time on odd iterations when boomerang is enabled", () => {
    const a = new StubAnimation({ repeat: 3, boomerang: true });
    a.duration(1);

    a.totalTime(1.25);
    expect(a.renders.at(-1)).toMatchObject({ iteration: 1, reversed: true });
    expect(a.time()).toBeCloseTo(1 - 0.25);
  });
});

describe("Animation - lifecycle events", () => {
  it("fires start once progress leaves 0, and not again on subsequent renders", () => {
    const a = new StubAnimation();
    a.duration(1);
    let starts = 0;
    a.on("start", () => starts++);

    a.totalTime(0);
    expect(starts).toBe(0);
    a.totalTime(0.5);
    expect(starts).toBe(1);
    a.totalTime(0.8);
    expect(starts).toBe(1);
  });

  it("fires complete when advancing forward into full completion, and reverseComplete when receding back to 0", () => {
    const a = new StubAnimation();
    a.duration(1);
    let completes = 0;
    let reverseCompletes = 0;
    a.on("complete", () => completes++);
    a.on("reverseComplete", () => reverseCompletes++);

    a.totalTime(1);
    expect(completes).toBe(1);
    a.totalTime(0);
    expect(reverseCompletes).toBe(1);
  });

  it("suppresses all events when suppressEvents is true (seek default)", () => {
    const a = new StubAnimation();
    a.duration(1);
    let events = 0;
    a.on("start", () => events++);
    a.on("update", () => events++);
    a.on("complete", () => events++);

    a.seek(1);
    expect(events).toBe(0);
    expect(a.renders).toHaveLength(1); // still rendered visually, just silently
  });
});

describe("Animation - kill()", () => {
  it("detaches from its parent and remembers it as the detached parent", () => {
    const a = new StubAnimation();
    const parent = fakeParent();
    a.parent = parent;

    a.kill();

    expect(a.parent).toBeNull();
    expect(parent.removed).toEqual([a]);
  });
});

describe("Animation - cache invalidation", () => {
  it("propagates _uncache() up to the parent when duration/repeat changes", () => {
    const a = new StubAnimation();
    const parent = fakeParent();
    a.parent = parent;

    a.duration(2);
    expect(parent.uncacheCalls).toBeGreaterThan(0);

    const before = parent.uncacheCalls;
    a.repeat(1);
    expect(parent.uncacheCalls).toBeGreaterThan(before);
  });
});
