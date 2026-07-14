import { describe, expect, it } from "vitest";
import { Animation } from "../core/animation";
import { Timeline } from "./timeline";

interface RenderCall {
  totalTime: number;
  localTime: number;
  reversed: boolean;
  iteration: number;
}

class StubLeaf extends Animation {
  renders: RenderCall[] = [];

  protected _renderIteration(localTime: number, reversed: boolean, iteration: number): void {
    this.renders.push({ totalTime: this.totalTime() as number, localTime, reversed, iteration });
  }
}

describe("Timeline - add() positioning", () => {
  it("appends sequentially by default", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    const b = new StubLeaf();
    b.duration(3);

    tl.add(a);
    tl.add(b);

    expect(a.startTime()).toBe(0);
    expect(b.startTime()).toBe(2);
    expect(tl.totalDuration()).toBe(5);
  });

  it("accepts an explicit numeric position", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(1);
    tl.add(a, 5);
    expect(a.startTime()).toBe(5);
    expect(tl.totalDuration()).toBe(6);
  });

  it("keeps children ordered by start time regardless of insertion order", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    const b = new StubLeaf();
    const c = new StubLeaf();
    tl.add(a, 5);
    tl.add(b, 1);
    tl.add(c, 3);
    expect(tl.getChildren()).toEqual([b, c, a]);
  });

  it("uses the current playhead as the default position in 'now' mode", () => {
    // "now" mode only makes sense paired with `unbounded` in practice (that's what the root
    // timeline uses) - otherwise the timeline's own duration would clamp its playhead to
    // whatever its children already span, capping where "now" can ever point.
    const tl = new Timeline({ defaultPosition: "now", unbounded: true });
    const a = new StubLeaf();
    a.duration(1);
    tl.add(a);
    expect(a.startTime()).toBe(0);

    tl.totalTime(3, true);
    const b = new StubLeaf();
    b.duration(1);
    tl.add(b);
    expect(b.startTime()).toBe(3);
  });
});

describe("Timeline - unbounded (root-like)", () => {
  it("reports Infinity for totalDuration regardless of children", () => {
    const tl = new Timeline({ unbounded: true });
    const a = new StubLeaf();
    a.duration(5);
    tl.add(a);
    expect(tl.totalDuration()).toBe(Infinity);
  });

  it("never clamps its own totalTime, so newly added children keep playing across large gaps", () => {
    const tl = new Timeline({ unbounded: true, defaultPosition: "now" });

    tl.totalTime(100, true);

    const a = new StubLeaf();
    a.duration(2);
    tl.add(a); // starts "now" (100), regardless of how long the timeline had been idle

    tl.totalTime(101, true);
    expect(a.totalTime()).toBe(1);
    tl.totalTime(102, true);
    expect(a.totalTime()).toBe(2);
  });
});

describe("Timeline - rendering drives children via the coordinate transform", () => {
  it("renders each child at parentTime - childStart", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    const b = new StubLeaf();
    b.duration(2);
    tl.add(a); // start 0
    tl.add(b); // start 2 (sequential)

    tl.totalTime(1, true);
    expect(a.renders.at(-1)?.localTime).toBe(1);
    expect(b.renders.at(-1)?.localTime).toBe(0); // not yet started, clamped to 0

    tl.totalTime(3, true);
    expect(a.renders.at(-1)?.localTime).toBe(2); // finished, holds at its end
    expect(b.renders.at(-1)?.localTime).toBe(1);
  });

  it("scales a child's local time by the child's own timeScale", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    a.timeScale(2);
    tl.add(a);

    tl.totalTime(1, true);
    expect(a.totalTime()).toBe(2); // twice as fast -> fully done after 1 parent-second
  });

  it("does not advance a paused child even as the parent keeps advancing", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    tl.add(a);

    tl.totalTime(0.5, true);
    a.pause();
    tl.totalTime(1.5, true);
    expect(a.totalTime()).toBe(0.5);
  });
});

describe("Timeline - nested timelines keep full lifecycle capability", () => {
  it("a nested timeline's OWN repeat still works when driven by an outer timeline", () => {
    // this is the exact capability the abandoned prototype lost: nesting must not strip
    // repeat/yoyo/pause from a child timeline just because it's no longer top-level.
    const inner = new Timeline({ repeat: 1 }); // 2 iterations
    const leaf = new StubLeaf();
    leaf.duration(1);
    inner.add(leaf);
    expect(inner.totalDuration()).toBe(2); // 1s * 2 iterations

    let innerRepeats = 0;
    inner.on("repeat", () => innerRepeats++);

    const outer = new Timeline();
    outer.add(inner);

    // not suppressing events here (unlike the other tests in this file) specifically so the
    // nested "repeat" event can be observed propagating up from inner.
    outer.totalTime(0.5);
    expect(leaf.totalTime()).toBe(0.5);
    const rendersAfterFirstPass = leaf.renders.length;

    outer.totalTime(1.5);
    expect(innerRepeats).toBe(1);
    expect(leaf.totalTime()).toBe(0.5); // 2nd iteration, same local position as before
    // leaf's local time (0.5) numerically coincides with the first pass, but it must still
    // have been force re-rendered for the 2nd iteration rather than silently no-op'ing.
    expect(leaf.renders.length).toBeGreaterThan(rendersAfterFirstPass);
  });

  it("a nested timeline's own pause freezes only that subtree", () => {
    const inner = new Timeline();
    const leaf = new StubLeaf();
    leaf.duration(4);
    inner.add(leaf);

    const outerSibling = new StubLeaf();
    outerSibling.duration(4);

    const outer = new Timeline();
    outer.add(inner);
    outer.add(outerSibling, 0); // runs in parallel with inner

    outer.totalTime(1, true);
    inner.pause();
    outer.totalTime(3, true);

    expect(leaf.totalTime()).toBe(1); // frozen
    expect(outerSibling.totalTime()).toBe(3); // unaffected by inner's pause
  });

  it("a nested timeline's own reverse plays that subtree backwards independent of the outer timeline's direction", () => {
    const inner = new Timeline();
    const leaf = new StubLeaf();
    leaf.duration(2);
    inner.add(leaf);

    const outer = new Timeline();
    outer.add(inner);

    outer.totalTime(1, true);
    expect(leaf.totalTime()).toBe(1);

    inner.reverse();
    outer.totalTime(1.5, true); // 0.5s of outer time passes while inner plays backward

    expect(leaf.totalTime()).toBeCloseTo(0.5);
  });
});

describe("Timeline - remove/kill", () => {
  it("kill() detaches a child so it stops receiving renders", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    tl.add(a);

    tl.totalTime(1, true);
    const rendersBeforeKill = a.renders.length;

    a.kill();
    expect(a.parent).toBeNull();
    expect(tl.getChildren()).toEqual([]);

    tl.totalTime(1.5, true);
    expect(a.renders.length).toBe(rendersBeforeKill); // no further renders once removed
  });

  it("reparenting via add() on a new timeline removes the child from its old one", () => {
    const tlA = new Timeline();
    const tlB = new Timeline();
    const a = new StubLeaf();
    a.duration(1);

    tlA.add(a);
    expect(tlA.getChildren()).toEqual([a]);

    tlB.add(a);
    expect(tlA.getChildren()).toEqual([]);
    expect(tlB.getChildren()).toEqual([a]);
    expect(a.parent).toBe(tlB);
  });
});
