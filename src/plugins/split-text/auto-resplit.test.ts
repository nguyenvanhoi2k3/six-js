import { afterEach, describe, expect, it, vi } from "vitest";
import { watchForResplit } from "./auto-resplit";

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  callback: () => void;
  observed: Element[] = [];
  disconnected = false;

  constructor(callback: () => void) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observed.push(el);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  trigger(): void {
    this.callback();
  }
}

describe("watchForResplit", () => {
  afterEach(() => {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    delete (document as { fonts?: unknown }).fonts;
    FakeResizeObserver.instances.length = 0;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does nothing and never throws when ResizeObserver/document.fonts are unavailable (jsdom default)", () => {
    const resplit = vi.fn();
    const el = document.createElement("div");
    const handle = watchForResplit([el], resplit);
    expect(resplit).not.toHaveBeenCalled();
    expect(() => handle.disconnect()).not.toThrow();
  });

  it("resplits after a debounced resize once a watched element's offsetWidth actually changes", () => {
    vi.useFakeTimers();
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;

    const el = document.createElement("div");
    vi.spyOn(el, "offsetWidth", "get").mockReturnValue(100);
    const resplit = vi.fn();
    const handle = watchForResplit([el], resplit);

    const observer = FakeResizeObserver.instances[0];
    expect(observer.observed).toEqual([el]);

    vi.spyOn(el, "offsetWidth", "get").mockReturnValue(140);
    observer.trigger();
    expect(resplit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(resplit).toHaveBeenCalledTimes(1);

    handle.disconnect();
  });

  it("does not resplit when a resize fires but width is unchanged", () => {
    vi.useFakeTimers();
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;

    const el = document.createElement("div");
    vi.spyOn(el, "offsetWidth", "get").mockReturnValue(100);
    const resplit = vi.fn();
    watchForResplit([el], resplit);

    FakeResizeObserver.instances[0].trigger();
    vi.advanceTimersByTime(200);

    expect(resplit).not.toHaveBeenCalled();
  });

  it("disconnect() stops observing and cancels any pending debounced check", () => {
    vi.useFakeTimers();
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;

    const el = document.createElement("div");
    vi.spyOn(el, "offsetWidth", "get").mockReturnValue(100);
    const resplit = vi.fn();
    const handle = watchForResplit([el], resplit);
    const observer = FakeResizeObserver.instances[0];

    vi.spyOn(el, "offsetWidth", "get").mockReturnValue(200);
    observer.trigger();
    handle.disconnect();
    vi.advanceTimersByTime(200);

    expect(observer.disconnected).toBe(true);
    expect(resplit).not.toHaveBeenCalled();
  });

  it("resplits when document.fonts fires loadingdone, and stops after disconnect", () => {
    const fonts = new EventTarget();
    Object.defineProperty(document, "fonts", { value: fonts, configurable: true });

    const resplit = vi.fn();
    const el = document.createElement("div");
    const handle = watchForResplit([el], resplit);

    fonts.dispatchEvent(new Event("loadingdone"));
    expect(resplit).toHaveBeenCalledTimes(1);

    handle.disconnect();
    fonts.dispatchEvent(new Event("loadingdone"));
    expect(resplit).toHaveBeenCalledTimes(1);
  });
});
