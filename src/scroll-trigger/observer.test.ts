import { afterEach, describe, expect, it, vi } from "vitest";
import { addResizeListener, addScrollListener, currentGeneration, getScroll, invalidateReads, removeResizeListener, removeScrollListener, setScroll } from "./observer";

describe("observer - getScroll memoization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("only reads the raw scrollTop once per generation, no matter how many times it's queried", () => {
    const el = document.createElement("div");
    let reads = 0;
    Object.defineProperty(el, "scrollTop", {
      configurable: true,
      get() {
        reads++;
        return 42;
      },
    });

    invalidateReads();
    expect(getScroll(el, "y")).toBe(42);
    expect(getScroll(el, "y")).toBe(42);
    expect(getScroll(el, "y")).toBe(42);
    expect(reads).toBe(1);
  });

  it("re-reads after invalidateReads() bumps the generation", () => {
    const el = document.createElement("div");
    let value = 10;
    Object.defineProperty(el, "scrollTop", {
      configurable: true,
      get: () => value,
    });

    invalidateReads();
    expect(getScroll(el, "y")).toBe(10);

    value = 20;
    invalidateReads();
    expect(getScroll(el, "y")).toBe(20);
  });

  it("currentGeneration() increases every time invalidateReads() is called", () => {
    const before = currentGeneration();
    invalidateReads();
    expect(currentGeneration()).toBe(before + 1);
  });
});

describe("observer - setScroll", () => {
  it("writes scrollTop/scrollLeft on an element scroller and invalidates the cache", () => {
    const el = document.createElement("div");
    setScroll(el, "y", 15);
    expect(el.scrollTop).toBe(15);

    setScroll(el, "x", 25);
    expect(el.scrollLeft).toBe(25);
  });
});

describe("observer - scroll listeners", () => {
  it("dispatches to a registered listener on a native scroll event", () => {
    const el = document.createElement("div");
    const listener = vi.fn();

    addScrollListener(el, listener);
    el.dispatchEvent(new Event("scroll"));

    expect(listener).toHaveBeenCalledOnce();
    removeScrollListener(el, listener);
  });

  it("stops dispatching once removed", () => {
    const el = document.createElement("div");
    const listener = vi.fn();

    addScrollListener(el, listener);
    removeScrollListener(el, listener);
    el.dispatchEvent(new Event("scroll"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("supports multiple independent listeners on the same scroller", () => {
    const el = document.createElement("div");
    const a = vi.fn();
    const b = vi.fn();

    addScrollListener(el, a);
    addScrollListener(el, b);
    el.dispatchEvent(new Event("scroll"));

    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();

    removeScrollListener(el, a);
    el.dispatchEvent(new Event("scroll"));
    expect(a).toHaveBeenCalledOnce(); // still just once
    expect(b).toHaveBeenCalledTimes(2);

    removeScrollListener(el, b);
  });
});

describe("observer - resize listeners", () => {
  it("dispatches to registered resize listeners on window resize", () => {
    const listener = vi.fn();
    addResizeListener(listener);

    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce();

    removeResizeListener(listener);
    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce(); // no further calls after removal
  });
});
