import { describe, expect, it } from "vitest";
import { Timeline } from "./timeline";

function el(): HTMLDivElement {
  return document.createElement("div");
}

describe("Timeline sugar - to/from/fromTo/set", () => {
  it("chains .to() calls sequentially by default", () => {
    const a = el();
    a.style.opacity = "0";
    const b = el();
    b.style.opacity = "0";
    const tl = new Timeline();
    tl.to(a, { opacity: 1, duration: 1, ease: "none" });
    tl.to(b, { opacity: 1, duration: 2, ease: "none" });

    expect(tl.totalDuration()).toBe(3);

    tl.totalTime(0.5, true);
    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0"); // not started yet

    tl.totalTime(2, true);
    expect(a.style.opacity).toBe("1");
    expect(b.style.opacity).toBe("0.5");
  });

  it(".from() and .fromTo() work as children of a timeline", () => {
    const a = el();
    a.style.opacity = "1";
    const b = el();
    b.style.opacity = "0.9"; // irrelevant for fromTo

    const tl = new Timeline();
    tl.from(a, { opacity: 0, duration: 1, ease: "none" });
    tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" }, "<");

    tl.totalTime(0.5, true);
    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0.5");
  });

  it(".set() applies instantly with zero duration", () => {
    const a = el();
    const tl = new Timeline();
    tl.to(a, { opacity: 0, duration: 1, ease: "none" });
    tl.set(a, { opacity: 0.75 }, 1);

    tl.totalTime(1, true);
    expect(a.style.opacity).toBe("0.75");
  });
});

describe("Timeline sugar - .call()", () => {
  it("fires once the playhead crosses the call's position", () => {
    const tl = new Timeline();
    let called = 0;
    tl.call(() => called++, 1);

    tl.totalTime(0.5);
    expect(called).toBe(0);
    tl.totalTime(1.5);
    expect(called).toBe(1);
  });
});

describe("Timeline sugar - position strings", () => {
  it("'<' aligns a new child with the previous child's start", () => {
    const a = el();
    const b = el();
    const tl = new Timeline();
    tl.to(a, { opacity: 1, duration: 2, ease: "none" });
    tl.to(b, { opacity: 1, duration: 1, ease: "none" }, "<");

    expect(tl.getChildren()[1].startTime()).toBe(0);
  });

  it("'>+=0.5' offsets from the previous child's end", () => {
    const a = el();
    const b = el();
    const tl = new Timeline();
    tl.to(a, { opacity: 1, duration: 1, ease: "none" });
    tl.to(b, { opacity: 1, duration: 1, ease: "none" }, ">+=0.5");

    expect(tl.getChildren()[1].startTime()).toBeCloseTo(1.5);
  });

  it("labels can be used as position references, including with offsets", () => {
    const a = el();
    const b = el();
    const c = el();
    const tl = new Timeline();
    tl.to(a, { opacity: 1, duration: 1, ease: "none" });
    tl.addLabel("mark");
    tl.to(b, { opacity: 1, duration: 1, ease: "none" }, "mark");
    tl.to(c, { opacity: 1, duration: 1, ease: "none" }, "mark+=0.5");

    expect(tl.getLabelTime("mark")).toBe(1);
    expect(tl.getChildren()[1].startTime()).toBe(1);
    expect(tl.getChildren()[2].startTime()).toBeCloseTo(1.5);
  });
});

describe("Timeline sugar - per-timeline defaults", () => {
  it("merges TimelineVars.defaults under each child's own vars", () => {
    const a = el();
    a.style.opacity = "0";
    const tl = new Timeline({ defaults: { duration: 3, ease: "none" } });
    tl.to(a, { opacity: 1 });

    expect(tl.totalDuration()).toBe(3);
    tl.totalTime(1.5, true);
    expect(a.style.opacity).toBe("0.5");
  });

  it("lets a per-call duration override the timeline default", () => {
    const a = el();
    const tl = new Timeline({ defaults: { duration: 3 } });
    tl.to(a, { opacity: 1, duration: 1 });
    expect(tl.totalDuration()).toBe(1);
  });
});

describe("Timeline sugar - stagger", () => {
  it("gives each target its own delay while sharing the same timeline position", () => {
    const a = el();
    a.style.opacity = "0";
    const b = el();
    b.style.opacity = "0";
    const c = el();
    c.style.opacity = "0";
    const tl = new Timeline();
    tl.to([a, b, c], { opacity: 1, duration: 1, ease: "none", stagger: 0.5 });

    const children = tl.getChildren();
    expect(children).toHaveLength(3);
    expect(children.every((child) => child.startTime() === 0)).toBe(true);

    tl.totalTime(0.5, true);
    expect(a.style.opacity).toBe("0.5"); // no extra delay
    expect(b.style.opacity).toBe("0"); // still waiting out its 0.5s stagger delay
    expect(c.style.opacity).toBe("0");

    tl.totalTime(1.5, true);
    expect(b.style.opacity).toBe("1");
    expect(c.style.opacity).toBe("0.5");
  });
});
