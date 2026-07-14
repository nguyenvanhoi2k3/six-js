import { describe, expect, it } from "vitest";
import { getTransformCache } from "./transform-cache";
import { resolveHandler } from "./registry";

describe("resolveHandler - transform properties", () => {
  it("resolves x/y/rotation/scale to numeric handlers backed by the transform cache", () => {
    const el = document.createElement("div");
    const handler = resolveHandler(el, "rotation", 45);
    expect(handler.kind).toBe("numeric");
    if (handler.kind !== "numeric") throw new Error("unreachable");

    handler.set(el, { value: 45, unit: "deg" });
    expect(getTransformCache(el).rotation).toBe(45);
    expect(handler.get(el)).toEqual({ value: 45, unit: "deg" });
  });

  it("resolves the 'rotate'/'rotateX'/'rotateY' aliases to the same cache fields as their long forms", () => {
    const el = document.createElement("div");
    resolveHandler(el, "rotate", 10).set(el, { value: 10, unit: "deg" });
    expect(getTransformCache(el).rotation).toBe(10);
  });

  it("uses % as the default unit for xPercent/yPercent and px for x/y/z", () => {
    const el = document.createElement("div");
    expect((resolveHandler(el, "xPercent") as { defaultUnit: string }).defaultUnit).toBe("%");
    expect((resolveHandler(el, "x") as { defaultUnit: string }).defaultUnit).toBe("px");
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
