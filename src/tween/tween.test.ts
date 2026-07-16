import { describe, expect, it } from "vitest";
import { Tween } from "./tween";
import { Timeline } from "../timeline/timeline";

describe("Tween - to()", () => {
  it("animates a numeric CSS property from its current value to the target", () => {
    const el = document.createElement("div");
    el.style.opacity = "0";
    const tw = new Tween(el, { opacity: 1, duration: 1, ease: "none" });

    tw.totalTime(0.5, true);
    expect(el.style.opacity).toBe("0.5");

    tw.totalTime(1, true);
    expect(el.style.opacity).toBe("1");
  });

  it("applies px units to a generic style property", () => {
    const el = document.createElement("div");
    const tw = new Tween(el, { width: 200, duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    expect(el.style.width).toBe("100px");
  });

  it("resolves a relative (+=) value against the current value", () => {
    const el = document.createElement("div");
    el.style.opacity = "0.2";
    const tw = new Tween(el, { opacity: "+=0.4", duration: 1, ease: "none" });
    tw.totalTime(1, true);
    expect(Number(el.style.opacity)).toBeCloseTo(0.6);
  });
});

describe("Tween - from()", () => {
  it("shows the from-value immediately on construction, before any tick", () => {
    const el = document.createElement("div");
    el.style.opacity = "1";
    new Tween(el, { opacity: 0, duration: 1 }, "from");
    expect(el.style.opacity).toBe("0");
  });

  it("animates from the specified value back to the element's natural value", () => {
    const el = document.createElement("div");
    el.style.opacity = "1";
    const tw = new Tween(el, { opacity: 0, duration: 1, ease: "none" }, "from");
    tw.totalTime(0.5, true);
    expect(el.style.opacity).toBe("0.5");
    tw.totalTime(1, true);
    expect(el.style.opacity).toBe("1");
  });
});

describe("Tween - fromTo()", () => {
  it("animates between two explicit values regardless of the element's current state", () => {
    const el = document.createElement("div");
    el.style.opacity = "0.9"; // should be irrelevant - fromTo pins both ends explicitly
    const tw = new Tween(el, { opacity: 1, duration: 1, ease: "none" }, "fromTo", { opacity: 0 });
    tw.totalTime(0.5, true);
    expect(el.style.opacity).toBe("0.5");
  });
});

describe("Tween - transform composition", () => {
  it("composes multiple transform properties into a single transform string per frame", () => {
    const el = document.createElement("div");
    const tw = new Tween(el, { x: 100, rotate: 90, duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    expect(el.style.transform).toContain("translate3d(50px, 0px, 0px)");
    expect(el.style.transform).toContain("rotate(45deg)");
  });

  it("uses translate3d only while actively animating, and plain translate at rest", () => {
    const el = document.createElement("div");
    const tw = new Tween(el, { x: 100, duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    expect(el.style.transform).toContain("translate3d");

    tw.totalTime(1, true);
    expect(el.style.transform).not.toContain("translate3d");
    expect(el.style.transform).toContain("translate(100px, 0px)");
  });

  it("expands the 'scale' shorthand into both scaleX and scaleY", () => {
    const el = document.createElement("div");
    const tw = new Tween(el, { scale: 2, duration: 1, ease: "none" });
    tw.totalTime(1, true);
    expect(el.style.transform).toContain("scale(2, 2)");
  });

  it("still lets 'scaleX'/'scaleY' be animated independently after a 'scale' shorthand tween", () => {
    const el = document.createElement("div");
    new Tween(el, { scale: 2, duration: 1, ease: "none" }).totalTime(1, true);
    const tw = new Tween(el, { scaleX: 0.5, duration: 1, ease: "none" });
    tw.totalTime(1, true);
    expect(el.style.transform).toContain("scale(0.5, 2)");
  });
});

describe("Tween - color properties", () => {
  it("interpolates backgroundColor", () => {
    const el = document.createElement("div");
    el.style.backgroundColor = "rgba(0, 0, 0, 1)";
    const tw = new Tween(el, { backgroundColor: "rgb(200, 100, 0)", duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    // jsdom's CSSOM normalizes rgba(r,g,b,1) to rgb(r,g,b) on assignment (alpha of 1 is dropped);
    // the values themselves (not the string format) are what this test cares about.
    expect(el.style.backgroundColor).toMatch(/^rgba?\(100, 50, 0(, 1)?\)$/);
  });
});

describe("Tween - complex string properties", () => {
  it("interpolates boxShadow numerically", () => {
    const el = document.createElement("div");
    el.style.boxShadow = "0px 0px 0px rgba(0,0,0,0)";
    const tw = new Tween(el, { boxShadow: "10px 10px 10px rgba(200,100,0,1)", duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    expect(el.style.boxShadow).toBe("5px 5px 5px rgba(100, 50, 0, 0.5)");
  });
});

describe("Tween - discrete properties", () => {
  it("swaps a discrete value only once the tween reaches full progress", () => {
    const el = document.createElement("div");
    el.style.display = "none";
    const tw = new Tween(el, { display: "block", duration: 1, ease: "none" });
    tw.totalTime(0.5, true);
    expect(el.style.display).toBe("none");
    tw.totalTime(1, true);
    expect(el.style.display).toBe("block");
  });
});

describe("Tween - multiple targets", () => {
  it("animates every element matched by an array of targets independently", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    a.style.opacity = "0";
    b.style.opacity = "1";

    const tw = new Tween([a, b], { opacity: 0.5, duration: 1, ease: "none" });
    tw.totalTime(1, true);

    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0.5");
  });
});

describe("Tween - ease", () => {
  it("applies the given ease function to the raw progress", () => {
    const el = document.createElement("div");
    el.style.opacity = "0";
    const tw = new Tween(el, { opacity: 1, duration: 1, ease: (t: number) => t * t });
    tw.totalTime(0.5, true);
    expect(Number(el.style.opacity)).toBeCloseTo(0.25);
  });
});

describe("Tween - composes with Timeline", () => {
  it("plays correctly as a child of a Timeline, including nested pause", () => {
    const el = document.createElement("div");
    el.style.opacity = "0";
    const tw = new Tween(el, { opacity: 1, duration: 2, ease: "none" });

    const tl = new Timeline();
    tl.add(tw);

    tl.totalTime(1, true);
    expect(el.style.opacity).toBe("0.5");

    tw.pause();
    tl.totalTime(2, true);
    expect(el.style.opacity).toBe("0.5"); // frozen despite the timeline advancing
  });
});
