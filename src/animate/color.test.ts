import { describe, expect, it } from "vitest";
import { formatColor, interpolateColor, parseColor } from "./color";

describe("parseColor", () => {
  it("parses 6-digit hex", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses 3-digit hex (shorthand)", () => {
    expect(parseColor("#0f0")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });

  it("parses 8-digit hex with alpha", () => {
    const c = parseColor("#0000ff80");
    expect(c.r).toBe(0);
    expect(c.g).toBe(0);
    expect(c.b).toBe(255);
    expect(c.a).toBeCloseTo(128 / 255, 2);
  });

  it("parses rgb() and rgba()", () => {
    expect(parseColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    expect(parseColor("rgba(10, 20, 30, 0.5)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  it("parses modern space-separated rgb syntax", () => {
    expect(parseColor("rgb(10 20 30 / 0.5)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  it("parses transparent as alpha 0", () => {
    expect(parseColor("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("resolves a named color via the CSSOM", () => {
    const c = parseColor("red");
    expect(c).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });
});

describe("interpolateColor", () => {
  it("blends channels linearly", () => {
    const a = { r: 0, g: 0, b: 0, a: 1 };
    const b = { r: 100, g: 200, b: 50, a: 0 };
    expect(interpolateColor(a, b, 0.5)).toEqual({ r: 50, g: 100, b: 25, a: 0.5 });
  });
});

describe("formatColor", () => {
  it("formats as rgba()", () => {
    expect(formatColor({ r: 1, g: 2, b: 3, a: 0.4 })).toBe("rgba(1, 2, 3, 0.4)");
  });
});
