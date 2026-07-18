import { describe, expect, it } from "vitest";
import { Animation } from "../core/animation";
import { Timeline } from "./timeline";
import { Tween } from "../tween/tween";

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
    expect(b.renders).toHaveLength(0); // not yet reached - deliberately untouched (see Timeline._renderIteration)

    tl.totalTime(3, true);
    expect(a.renders.at(-1)?.localTime).toBe(2); // finished, holds at its end
    expect(b.renders.at(-1)?.localTime).toBe(1);
  });

  it("scales a child's local time by the child's own speed", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    a.speed(2);
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

  it("resuming a paused child continues from where it froze, not jumping ahead by the paused duration", () => {
    // Real bug: the parent (e.g. the always-ticking root timeline) keeps advancing while a
    // child is paused. Without re-anchoring the child's startTime on resume, the very next
    // render recomputes its totalTime from the fixed (start, parentLocalTime) formula and it
    // snaps straight to wherever that formula now points - here, straight to fully complete.
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(2);
    tl.add(a);

    tl.totalTime(0.5, true);
    a.pause();
    tl.totalTime(1.5, true); // parent advances 1s while frozen
    expect(a.totalTime()).toBe(0.5);

    a.play();
    tl.totalTime(2.0, true); // parent advances another 0.5s after resuming
    expect(a.totalTime()).toBe(1.0); // 0.5 (frozen) + 0.5 (elapsed since resume), not 2.0
  });

  it("resuming a child whose scheduled start the timeline hasn't reached yet leaves it waiting for that slot", () => {
    const tl = new Timeline();
    const a = new StubLeaf();
    a.duration(1);
    tl.add(a, 5); // scheduled to start at parent-local-time 5

    a.pause(); // paused before the timeline has ever reached it
    tl.totalTime(2, true);
    a.play();
    tl.totalTime(4, true);
    expect(a.totalTime()).toBe(0); // still hasn't started - not pulled forward to "now"

    tl.totalTime(5.5, true);
    expect(a.totalTime()).toBe(0.5); // starts on schedule once the timeline actually reaches it
  });

  it("resuming a child created paused whose start the timeline has already passed begins it fresh from now (the OnScroll pattern)", () => {
    // This is the shape every OnScroll-driven, non-sync animation is created in:
    // `vars.animation.pause()` runs immediately (attached to the root timeline at "now"),
    // and `.play()` is called much later, once the user actually scrolls into range. By then
    // the (always-advancing) root timeline's playhead is long past the child's original
    // `_start`, even though the child itself never progressed at all (totalTime stayed 0).
    const tl = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline's own construction
    const a = new StubLeaf();
    a.duration(1);

    tl.totalTime(0, true);
    tl.add(a); // _start = tl's current local time (0)
    a.pause();

    tl.totalTime(3, true); // the timeline (e.g. root) keeps advancing while frozen
    expect(a.totalTime()).toBe(0);

    a.play();
    tl.totalTime(3.4, true); // 0.4s after resuming
    expect(a.totalTime()).toBeCloseTo(0.4); // animates fresh from 0, not clamped-complete at 1
  });

  it("restart()ing a child that already finished naturally re-anchors it too, not just on resume-from-pause", () => {
    const tl = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline
    const a = new StubLeaf();
    a.duration(1);

    tl.totalTime(0, true);
    tl.add(a); // _start = tl's current local time (0)

    tl.totalTime(1, true); // finishes naturally, never explicitly paused
    expect(a.totalTime()).toBe(1);

    tl.totalTime(50, true); // the timeline (e.g. root) keeps advancing long after completion

    a.restart();
    tl.totalTime(50.3, true); // 0.3s after restart

    expect(a.totalTime()).toBeCloseTo(0.3);
  });

  it("reverse()ing a live child re-anchors it, so it actually plays backward instead of clamping to a stale start", () => {
    const tl = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline
    const a = new StubLeaf();
    a.duration(2);

    tl.totalTime(0, true);
    tl.add(a); // starts "now" (0)

    tl.totalTime(2, true); // finishes naturally
    expect(a.totalTime()).toBe(2);

    tl.totalTime(5, true); // real time keeps passing before the user reverses it

    a.reverse();
    tl.totalTime(5.5, true); // 0.5s of reverse playback
    expect(a.totalTime()).toBeCloseTo(1.5); // played backward from 2, not clamped instantly to 0

    tl.totalTime(10, true); // keeps reversing until fully back to 0
    expect(a.totalTime()).toBe(0);

    a.play(); // should resume forward, not stay reversed and stuck at 0
    tl.totalTime(10.3, true);
    expect(a.totalTime()).toBeCloseTo(0.3);
  });

  it("reverse()ing an infinite-repeat (repeat: -1) child re-anchors to a finite startTime, not -Infinity", () => {
    // repeat: -1 means totalDuration() is Infinity (see cycle.ts's totalDurationOf) - the
    // reversed-playback offset used to be `tDur` unconditionally (see reverseOffset()'s own doc
    // comment), which poisoned the re-anchor arithmetic with Infinity/NaN for exactly this case.
    const tl = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline
    const a = new StubLeaf();
    a.duration(1);
    a.repeat(-1);

    tl.totalTime(0, true);
    tl.add(a); // starts "now" (0)

    tl.totalTime(3.5, true); // several iterations in, never explicitly paused
    a.reverse();

    expect(Number.isFinite(a.startTime())).toBe(true);

    // still renders sane, finite totalTime afterward - not NaN/-Infinity from here on
    tl.totalTime(3.6, true);
    expect(Number.isFinite(a.totalTime())).toBe(true);

    // and a later play() still recovers forward playback cleanly, same as the finite-duration case
    a.play();
    tl.totalTime(3.9, true);
    expect(Number.isFinite(a.totalTime())).toBe(true);
  });

  it("re-anchoring a child inside a bounded nested timeline stays correct even after that nested timeline's own span was exceeded and it stopped being actively rendered", () => {
    const root = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline
    const childA = new StubLeaf();
    childA.duration(1.4);
    const childB = new StubLeaf();
    childB.duration(1);

    const nestParent = new Timeline(); // bounded, own span ends at 2.4
    nestParent.add(childA, 0);
    nestParent.add(childB); // sequential, starts at 1.4

    root.totalTime(0, true);
    root.add(nestParent); // starts "now" (0)

    root.totalTime(0.6, true);
    expect(childA.totalTime()).toBe(0.6);

    childA.pause();

    // real time keeps advancing well past nestParent's own 2.4s span - root's skip-range
    // optimization (see Timeline._renderIteration) stops calling nestParent.render() at all
    // once that happens, so nestParent's OWN notion of "now" would go stale without the fix
    root.totalTime(5.0, true);
    expect(childA.totalTime()).toBe(0.6); // still frozen, as expected

    childA.resume();
    root.totalTime(5.3, true); // 0.3s more after resuming

    expect(childA.totalTime()).toBeCloseTo(0.9); // continues correctly, not stuck at 0.6
  });
});

describe("Timeline - nested timelines keep full lifecycle capability", () => {
  it("a nested timeline's OWN repeat still works when driven by an outer timeline", () => {
    // this is the exact capability the abandoned prototype lost: nesting must not strip
    // repeat/boomerang/pause from a child timeline just because it's no longer top-level.
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

  it("kill() cascades to every child before detaching itself from its own parent", () => {
    const outer = new Timeline();
    const inner = new Timeline();
    const a = new StubLeaf();
    const b = new StubLeaf();
    inner.add(a);
    inner.add(b);
    outer.add(inner);

    inner.kill();

    expect(a.parent).toBeNull();
    expect(b.parent).toBeNull();
    expect(inner.parent).toBeNull();
    expect(outer.getChildren()).toEqual([]);
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

describe("Timeline - zero-duration children (.set()/.call()-style)", () => {
  it("does not re-render an already-settled zero-duration child on a later tick, so it can't stomp a sibling's value written after it", () => {
    const tl = new Timeline({ defaultPosition: "now", unbounded: true }); // matches rootTimeline

    tl.totalTime(5, true);

    const setChild = new StubLeaf();
    setChild.duration(0);
    tl.add(setChild); // starts "now" (5)
    setChild.render(0, true, true); // matches a real Tween's own constructor-time self-render

    const laterChild = new StubLeaf();
    laterChild.duration(0);
    tl.add(laterChild); // also starts "now" (5), added after setChild
    laterChild.render(0, true, true);

    const setRendersBefore = setChild.renders.length;
    const laterRendersBefore = laterChild.renders.length;

    tl.totalTime(5.016, true); // the next real tick

    expect(setChild.renders.length).toBe(setRendersBefore);
    expect(laterChild.renders.length).toBe(laterRendersBefore);
  });

  it("still renders a zero-duration child normally once the timeline's playhead genuinely reaches its scheduled (not-yet-reached) position", () => {
    const tl = new Timeline({ defaultPosition: "now", unbounded: true });
    const futureChild = new StubLeaf();
    futureChild.duration(0);

    tl.totalTime(0, true);
    tl.add(futureChild, 5); // scheduled for local time 5, not "now"

    tl.totalTime(3, true); // hasn't reached 5 yet
    expect(futureChild.renders).toHaveLength(0);

    tl.totalTime(5.5, true); // playhead crosses 5
    expect(futureChild.renders.length).toBeGreaterThan(0);
  });
});

describe("Timeline - chained .to() calls on the same target/property", () => {
  it("does not let a later-added segment's construction-time self-render clobber an earlier segment's in-progress value", () => {
    // Regression test: Tween's constructor unconditionally self-rendered at t=0 - fine for a
    // standalone tween (or one landing at a timeline's actual "now"), but wrong for a tween
    // scheduled at a LATER position in a sequenced timeline: constructing the second .to() here
    // used to immediately write its own from-state (x read as whatever the DOM/cache currently
    // held, i.e. the ORIGINAL untouched value) into the shared per-element transform cache, and
    // since a not-yet-reached child is deliberately skipped by Timeline's own render until its
    // scheduled position is reached, nothing ever corrected it - so the moment the timeline's
    // playhead crossed from segment 1 into segment 2, x visibly snapped back to the original
    // value instead of continuing from segment 1's actual end.
    const el = document.createElement("div");
    const tl = new Timeline();
    tl.to(el, { x: 100, duration: 1, ease: "none" });
    tl.to(el, { x: 300, duration: 1, ease: "none" });

    tl.totalTime(1, true); // exact boundary between the two segments
    expect(el.style.transform).toBe("translate(100px, 0px)"); // must continue from segment 1's end, not snap to 0

    tl.totalTime(1.5, true); // halfway through segment 2
    expect(el.style.transform).toBe("translate3d(200px, 0px, 0px)"); // 100 -> 300, halfway
  });

  it("defers a later segment's own from-value read to when it actually starts playing, not to construction time", () => {
    const el = document.createElement("div");
    const tl = new Timeline();
    tl.to(el, { x: 100, duration: 1, ease: "none" });
    // No explicit "from" for opacity - should read whatever opacity actually IS once this
    // segment's own turn arrives, not whatever it was at construction time.
    tl.to(el, { opacity: 1, duration: 1, ease: "none" });

    el.style.opacity = "0.2"; // changes AFTER both segments were already constructed

    tl.totalTime(1.5, true); // halfway through segment 2
    expect(el.style.opacity).toBe("0.6"); // (0.2 -> 1) halfway, using the value read at its real start
  });
});
