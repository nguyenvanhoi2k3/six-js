import { describe, expect, it } from "vitest";
import { Tween } from "./tween";

function el(): HTMLDivElement {
  return document.createElement("div");
}

describe("Tween keyframes - array form", () => {
  it("chains segments so each one starts from the previous segment's end value", () => {
    const a = el();
    a.style.opacity = "0";
    const tw = new Tween(a, {
      keyframes: [
        { opacity: 1, duration: 1, ease: "none" },
        { opacity: 0, duration: 1, ease: "none" },
      ],
    });

    expect(tw.totalDuration()).toBe(2);

    tw.totalTime(0.5, true);
    expect(a.style.opacity).toBe("0.5"); // first segment: 0 -> 1

    tw.totalTime(1.5, true);
    expect(a.style.opacity).toBe("0.5"); // second segment: 1 -> 0, halfway back down

    tw.totalTime(2, true);
    expect(a.style.opacity).toBe("0");
  });

  it("splits the top-level duration evenly across segments without their own duration", () => {
    const a = el();
    a.style.opacity = "0";
    const tw = new Tween(a, {
      duration: 4,
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
    });
    expect(tw.totalDuration()).toBe(4); // 2s + 2s
  });

  it("respects a segment's own explicit duration when splitting the remainder", () => {
    const a = el();
    const tw = new Tween(a, {
      duration: 3,
      keyframes: [
        { opacity: 1, duration: 1 },
        { opacity: 0 }, // gets the remaining 2s
      ],
    });
    expect(tw.totalDuration()).toBe(3);
  });

  it("carries a property untouched by the first segment forward from wherever it's first set", () => {
    const a = el();
    a.style.opacity = "0";
    const tw = new Tween(a, {
      keyframes: [
        { x: 100, duration: 1, ease: "none" }, // opacity untouched here
        { opacity: 1, duration: 1, ease: "none" }, // starts from a's CURRENT opacity (0), since no earlier segment set it
      ],
    });

    tw.totalTime(1.5, true);
    expect(a.style.opacity).toBe("0.5");
  });
});

describe("Tween keyframes - percent-object form", () => {
  it("splits duration proportionally between percent positions", () => {
    const a = el();
    a.style.opacity = "0";
    const tw = new Tween(a, {
      duration: 4,
      keyframes: {
        "0%": { opacity: 0 },
        "25%": { opacity: 1, ease: "none" },
        "100%": { opacity: 0, ease: "none" },
      },
    });

    // 0% -> 25% is a 1s segment (opacity 0 -> 1), 25% -> 100% is a 3s segment (opacity 1 -> 0)
    expect(tw.totalDuration()).toBe(4);

    tw.totalTime(0.5, true);
    expect(a.style.opacity).toBe("0.5");

    tw.totalTime(1, true);
    expect(a.style.opacity).toBe("1");

    tw.totalTime(2.5, true);
    expect(a.style.opacity).toBe("0.5");
  });
});

describe("Tween keyframes - repeat integration", () => {
  it("replays the whole keyframe sequence on each outer repeat", () => {
    const a = el();
    a.style.opacity = "0";
    const tw = new Tween(a, {
      repeat: 1,
      keyframes: [
        { opacity: 1, duration: 1, ease: "none" },
        { opacity: 0, duration: 1, ease: "none" },
      ],
    });

    expect(tw.totalDuration()).toBe(4); // 2s sequence * 2 iterations

    tw.totalTime(2.5, true); // 0.5s into the 2nd iteration's first segment
    expect(a.style.opacity).toBe("0.5");
  });
});
