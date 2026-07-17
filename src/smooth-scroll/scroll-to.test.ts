import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveScrollTarget } from "./scroll-to";

function mockRect(el: Element, partial: Partial<DOMRect>): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...partial,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("resolveScrollTarget - number/keyword targets", () => {
  const ctx = { axis: "y" as const, scroller: window, currentScroll: 50, limit: 900 };

  it("passes a numeric target through plus offset", () => {
    expect(resolveScrollTarget(100, 0, ctx)).toBe(100);
    expect(resolveScrollTarget(100, 25, ctx)).toBe(125);
  });

  it("resolves top/start/# keywords to 0 plus offset", () => {
    expect(resolveScrollTarget("top", 0, ctx)).toBe(0);
    expect(resolveScrollTarget("start", 10, ctx)).toBe(10);
    expect(resolveScrollTarget("#", 0, ctx)).toBe(0);
  });

  it("resolves bottom/end keywords to the limit plus offset", () => {
    expect(resolveScrollTarget("bottom", 0, ctx)).toBe(900);
    expect(resolveScrollTarget("end", -20, ctx)).toBe(880);
  });

  it("uses left/start for the x axis instead of top", () => {
    const xCtx = { ...ctx, axis: "x" as const };
    expect(resolveScrollTarget("left", 0, xCtx)).toBe(0);
    expect(resolveScrollTarget("right", 0, xCtx)).toBe(900);
  });
});

describe("resolveScrollTarget - selector/element targets", () => {
  const ctx = { axis: "y" as const, scroller: window, currentScroll: 0, limit: 900 };

  it("returns null and warns when a selector target isn't found", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveScrollTarget(".does-not-exist", 0, ctx)).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("resolves a '#id' string via getElementById", () => {
    const el = document.createElement("div");
    el.id = "target";
    document.body.appendChild(el);
    mockRect(el, { top: 300 });

    expect(resolveScrollTarget("#target", 0, ctx)).toBe(300);
  });

  it("resolves a plain selector via querySelector", () => {
    const el = document.createElement("div");
    el.className = "target";
    document.body.appendChild(el);
    mockRect(el, { top: 150 });

    expect(resolveScrollTarget(".target", 0, ctx)).toBe(150);
  });

  it("resolves an Element target directly: rect position + current scroll", () => {
    const el = document.createElement("div");
    mockRect(el, { top: 200 });

    expect(resolveScrollTarget(el, 0, { ...ctx, currentScroll: 500 })).toBe(700);
  });

  it("applies offset on top of the resolved element position", () => {
    const el = document.createElement("div");
    mockRect(el, { top: 200 });

    expect(resolveScrollTarget(el, -50, ctx)).toBe(150);
  });

  it("uses rect.left for the x axis instead of rect.top", () => {
    const el = document.createElement("div");
    mockRect(el, { top: 999, left: 40 });

    expect(resolveScrollTarget(el, 0, { ...ctx, axis: "x", currentScroll: 10 })).toBe(50);
  });
});

describe("resolveScrollTarget - scroll-margin / scroll-padding accounting", () => {
  const ctx = { axis: "y" as const, scroller: window, currentScroll: 0, limit: 900 };

  it("subtracts the target's own scroll-margin-top", () => {
    const el = document.createElement("div");
    el.style.scrollMarginTop = "20px";
    mockRect(el, { top: 300 });

    expect(resolveScrollTarget(el, 0, ctx)).toBe(280);
  });

  it("subtracts the scroller's scroll-padding-top (e.g. a sticky header reserving space)", () => {
    document.documentElement.style.scrollPaddingTop = "80px";
    const el = document.createElement("div");
    mockRect(el, { top: 300 });

    try {
      expect(resolveScrollTarget(el, 0, ctx)).toBe(220);
    } finally {
      document.documentElement.style.scrollPaddingTop = "";
    }
  });
});

describe("resolveScrollTarget - nested (non-window) scroller", () => {
  it("subtracts the scroller's own viewport-relative position", () => {
    const container = document.createElement("div");
    mockRect(container, { top: 100 });
    const el = document.createElement("div");
    mockRect(el, { top: 350 });

    const ctx = { axis: "y" as const, scroller: container, currentScroll: 0, limit: 900 };
    // element is at viewport-Y 350, container starts at viewport-Y 100 -> 250 within the container
    expect(resolveScrollTarget(el, 0, ctx)).toBe(250);
  });
});
