import { describe, expect, it } from "vitest";
import { getTransformCache } from "./transform-cache";
import { resolveHandler } from "./registry";

describe("resolveHandler - transform properties", () => {
  it("resolves x/y/rotate/scale to numeric handlers backed by the transform cache", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "rotate", 45);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");

    handler.set(el, { value: 45, unit: "deg" });
    expect(getTransformCache(el).rotation).toBe(45);
    expect(handler.get(el)).toEqual({ value: 45, unit: "deg" });
  });

  it("resolves 'rotateX'/'rotateY' to their own cache fields, independent of 'rotate'", () => {
    const el = document.createElement("div");
    resolveHandler(el, "rotateX", 10).set(el, { value: 10, unit: "deg" });
    resolveHandler(el, "rotateY", 20).set(el, { value: 20, unit: "deg" });
    expect(getTransformCache(el).rotationX).toBe(10);
    expect(getTransformCache(el).rotationY).toBe(20);
  });

  it("routes x/y to the percent-translate cache field only when given an explicit '%' string, otherwise px", () => {
    const el = document.createElement("div");
    expect((resolveHandler(el, "x", "-50%") as { defaultUnit: string }).defaultUnit).toBe("%");
    expect((resolveHandler(el, "y", "-50%") as { defaultUnit: string }).defaultUnit).toBe("%");
    expect((resolveHandler(el, "x", 50) as { defaultUnit: string }).defaultUnit).toBe("px");
    expect((resolveHandler(el, "x") as { defaultUnit: string }).defaultUnit).toBe("px");

    resolveHandler(el, "x", "-50%").set(el, { value: -50, unit: "%" });
    expect(getTransformCache(el).xPercent).toBe(-50);
  });

  it("a bare 0 end value for x/y continues animating whichever field (px or percent) currently holds the live offset", () => {
    const el = document.createElement("div");

    // currently offset via the percent field only (e.g. six.set(el, { y: "120%" })) - a bare
    // "0" should resolve back to that same field, not the untouched (already-zero) px field.
    getTransformCache(el).yPercent = 120;
    const backToOrigin = resolveHandler(el, "y", 0);
    expect(backToOrigin.kind).toBe("numeric");
    if (backToOrigin.kind !== "numeric") throw new Error("unreachable");
    expect(backToOrigin.transformKey).toBe("yPercent");

    // once the px field is also live, "0" falls back to resetting px (the default/primary field)
    // rather than guessing which of the two the caller means.
    getTransformCache(el).y = 40;
    expect((resolveHandler(el, "y", 0) as { transformKey: string }).transformKey).toBe("y");

    // a non-zero bare number is unambiguous and always means px, regardless of cache state.
    getTransformCache(el).y = 0;
    expect((resolveHandler(el, "y", 50) as { transformKey: string }).transformKey).toBe("y");
  });
});

describe("resolveHandler - color properties", () => {
  it("resolves backgroundColor/color/fill to color handlers", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "backgroundColor");
    expect(handler.kind).toBe("color");
    if (handler.kind !== "color") throw new Error("unreachable");

    handler.set(el, { r: 10, g: 20, b: 30, a: 0.5 });
    expect(el.style.backgroundColor).toBe("rgba(10, 20, 30, 0.5)");
    expect(handler.get(el)).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });
});

describe("resolveHandler - complex string properties", () => {
  it("resolves boxShadow/clipPath to complex handlers that read/write the raw string", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "boxShadow");
    expect(handler.kind).toBe("complex");
    if (handler.kind !== "complex") throw new Error("unreachable");

    handler.set(el, "0px 0px 10px rgba(0,0,0,0.5)");
    expect(handler.get(el)).toBe("0px 0px 10px rgba(0,0,0,0.5)");
  });
});

describe("resolveHandler - CSS custom properties", () => {
  it("treats a numeric-looking custom property as numeric", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "--gap", 10);
    expect(handler.kind).toBe("numeric");
  });

  it("treats a non-numeric custom property as discrete", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "--theme", "dark");
    expect(handler.kind).toBe("discrete");
  });
});

describe("resolveHandler - generic style properties", () => {
  it("resolves opacity as numeric with no unit", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "opacity", 0.5);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");
    expect(handler.defaultUnit).toBe("");

    handler.set(el, { value: 0.5, unit: "" });
    expect(el.style.opacity).toBe("0.5");
  });

  it("resolves width as numeric with a px unit", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "width", 200);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");

    handler.set(el, { value: 200, unit: "px" });
    expect(el.style.width).toBe("200px");
  });

  it("falls back to discrete for a style property with a non-numeric value", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "display", "none");
    expect(handler.kind).toBe("discrete");

    if (handler.kind === "discrete") {
      handler.set(el, "none");
      expect(el.style.display).toBe("none");
    }
  });
});

describe("resolveHandler - plain object properties", () => {
  it("resolves a genuine numeric non-style property (e.g. scrollTop-like) via direct field access", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "customNumeric", { value: 5, writable: true, configurable: true });

    const handler = resolveHandler(el, "customNumeric", 10);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");

    handler.set(el, { value: 42, unit: "" });
    expect((el as unknown as { customNumeric: number }).customNumeric).toBe(42);
  });
});

describe("resolveHandler - attribute fallback", () => {
  it("falls back to setAttribute for a property with no style or plain-number counterpart", () => {
    const el = document.createElement("div");
    // "data-progress" is neither a CSS style property nor a direct IDL property (only reachable
    // via getAttribute/dataset), so it must fall all the way through to the setAttribute branch.
    const handler = resolveHandler(el, "data-progress", 50);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");

    handler.set(el, { value: 50, unit: "" });
    expect(el.getAttribute("data-progress")).toBe("50");
    expect(handler.get(el)).toEqual({ value: 50, unit: "" });
  });
});
