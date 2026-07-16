import { describe, expect, it } from "vitest";
import { Tween } from "./tween";
import { Timeline } from "../timeline/timeline";

describe("Tween - overwrite", () => {
  it("without overwrite, two tweens on the same property keep fighting (no auto-kill by default)", () => {
    const el = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween(el, { x: 100, duration: 1 });
    tl.add(first, 0);

    const second = new Tween(el, { x: 200, duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBe(tl);
    expect(second.parent).toBe(tl);
  });

  it("overwrite: true kills the entire previous tween on the same target, even its non-overlapping properties", () => {
    const el = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween(el, { x: 100, opacity: 0.5, duration: 1 });
    tl.add(first, 0);
    expect(first.parent).toBe(tl);

    const second = new Tween(el, { x: 200, overwrite: true, duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBeNull();
  });

  it("overwrite: true kills the whole previous tween even when only one of its several targets overlaps", () => {
    const elA = document.createElement("div");
    const elB = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween([elA, elB], { x: 100, duration: 1 });
    tl.add(first, 0);

    const second = new Tween(elA, { x: 200, overwrite: true, duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBeNull();
  });

  it('overwrite: "auto" removes only the overlapping property, leaving the rest of the old tween running', () => {
    const el = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween(el, { x: 100, opacity: 0.5, duration: 1 });
    tl.add(first, 0);

    const second = new Tween(el, { x: 200, overwrite: "auto", duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBe(tl); // still alive - opacity wasn't touched

    tl.totalTime(1, true);
    expect(el.style.opacity).toBe("0.5"); // first's untouched track kept animating
  });

  it('overwrite: "auto" only drops the conflicting target\'s track, leaving a sibling target untouched', () => {
    const elA = document.createElement("div");
    const elB = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween([elA, elB], { x: 100, duration: 1 });
    tl.add(first, 0);

    const second = new Tween(elA, { x: 200, overwrite: "auto", duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBe(tl); // elB's track keeps it alive

    tl.totalTime(1, true);
    expect(elB.style.transform).toContain("100px"); // elB still animated by `first`
  });

  it('overwrite: "auto" kills the previous tween entirely once ALL its properties get overwritten', () => {
    const el = document.createElement("div");
    const tl = new Timeline();

    const first = new Tween(el, { x: 100, duration: 1 });
    tl.add(first, 0);

    const second = new Tween(el, { x: 200, overwrite: "auto", duration: 1 });
    tl.add(second, 0);

    expect(first.parent).toBeNull();
  });
});
