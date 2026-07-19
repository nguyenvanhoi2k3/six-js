import { afterEach, describe, expect, it, vi } from "vitest";
import { acquirePointer, releasePointer, getPointerPosition } from "./parallax-pointer";

// Mock innerWidth/innerHeight via vi.spyOn(window, ..., "get"), never Object.defineProperty -
// vi.restoreAllMocks() doesn't undo a raw property override, and it would silently leak into
// later tests in this file (see CLAUDE.md's Testing section).
function mockViewport(width: number, height: number): void {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(height);
}

function fireMouseMove(clientX: number, clientY: number): void {
  window.dispatchEvent(new MouseEvent("mousemove", { clientX, clientY }));
}

describe("parallax-pointer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches exactly one native mousemove listener on first acquire", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    acquirePointer();

    expect(addSpy.mock.calls.filter((call) => call[0] === "mousemove")).toHaveLength(1);

    releasePointer();
  });

  it("does not attach a second listener while a prior acquire is still active", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    acquirePointer();
    acquirePointer();

    expect(addSpy.mock.calls.filter((call) => call[0] === "mousemove")).toHaveLength(1);

    releasePointer();
    releasePointer();
  });

  it("does not detach the listener while another acquire is still outstanding", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    acquirePointer();
    acquirePointer();

    releasePointer();
    expect(removeSpy.mock.calls.filter((call) => call[0] === "mousemove")).toHaveLength(0);

    releasePointer();
    expect(removeSpy.mock.calls.filter((call) => call[0] === "mousemove")).toHaveLength(1);
  });

  it("re-attaches a fresh listener after a full release-to-zero cycle", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    acquirePointer();
    releasePointer();

    acquirePointer();
    expect(addSpy.mock.calls.filter((call) => call[0] === "mousemove")).toHaveLength(2);

    releasePointer();
  });

  it("normalizes a dispatched mousemove event's clientX/clientY to -1..1 via innerWidth/innerHeight", () => {
    mockViewport(1000, 500);
    acquirePointer();

    fireMouseMove(1000, 500); // bottom-right corner
    expect(getPointerPosition()).toEqual({ nx: 1, ny: 1 });

    fireMouseMove(0, 0); // top-left corner
    expect(getPointerPosition()).toEqual({ nx: -1, ny: -1 });

    fireMouseMove(500, 250); // center
    expect(getPointerPosition()).toEqual({ nx: 0, ny: 0 });

    releasePointer();
  });

  it("resets the tracked position back to center once the last instance releases", () => {
    mockViewport(1000, 500);
    acquirePointer();
    fireMouseMove(1000, 500);
    expect(getPointerPosition()).toEqual({ nx: 1, ny: 1 });

    releasePointer();
    expect(getPointerPosition()).toEqual({ nx: 0, ny: 0 });
  });
});
