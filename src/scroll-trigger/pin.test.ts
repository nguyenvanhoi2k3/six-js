import { afterEach, describe, expect, it, vi } from "vitest";
import { setupPin } from "./pin";

function mockRect(el: Element, top: number, left: number, width: number, height: number): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({}),
  });
}

describe("setupPin", () => {
  afterEach(() => vi.restoreAllMocks());

  it("wraps the element in a spacer that reserves its natural size", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 10, 20, 300, 150);

    setupPin(pinEl);

    const spacer = pinEl.parentElement!;
    expect(spacer).not.toBe(parent);
    expect(spacer.parentElement).toBe(parent);
    expect(spacer.style.width).toBe("300px");
    expect(spacer.style.height).toBe("150px");
  });

  it("extends the spacer's height by the pin distance", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 0, 0, 300, 150);

    const handle = setupPin(pinEl);
    handle.setDistance(500);

    expect(pinEl.parentElement!.style.height).toBe("650px"); // 150 natural + 500 distance
  });

  it("applies position:fixed only during the 'during' phase", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 0, 0, 300, 150);

    const handle = setupPin(pinEl);

    handle.setPhase("before");
    expect(pinEl.style.position).not.toBe("fixed");

    handle.setPhase("during");
    expect(pinEl.style.position).toBe("fixed");

    handle.setPhase("after");
    expect(pinEl.style.position).toBe("absolute");
  });

  it("naturalDocTop reflects the element's rect.top plus the scroll position at setup time", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 120, 0, 300, 150); // viewport-relative top of 120
    vi.spyOn(window, "scrollY", "get").mockReturnValue(400);

    const handle = setupPin(pinEl);

    expect(handle.naturalDocTop).toBe(520); // 120 + 400
  });

  it("uses the pinnedTop set via setPinnedTop() during the 'during' phase - NOT always 0", () => {
    // this is the exact bug a user hit: a "center center" trigger needs the element to stay
    // wherever it naturally sat in the viewport (e.g. vertically centered), not snap to y=0.
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 0, 0, 300, 150);

    const handle = setupPin(pinEl);
    handle.setPinnedTop(213.5);
    handle.setPhase("during");

    expect(pinEl.style.top).toBe("213.5px");
  });

  it("shares one spacer across multiple setupPin() calls on the same element (reference counted)", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 0, 0, 300, 150);

    const handleA = setupPin(pinEl);
    const spacerAfterFirst = pinEl.parentElement;

    const handleB = setupPin(pinEl);
    expect(pinEl.parentElement).toBe(spacerAfterFirst); // same spacer, not a second one

    handleA.revert();
    expect(pinEl.parentElement).toBe(spacerAfterFirst); // still pinned - handleB is still alive

    handleB.revert();
    expect(pinEl.parentElement).toBe(parent); // fully unpinned once every handle has reverted
  });

  it("revert() restores the element to its original position in the DOM and clears inline overrides", () => {
    const parent = document.createElement("div");
    const pinEl = document.createElement("div");
    parent.appendChild(pinEl);
    mockRect(pinEl, 0, 0, 300, 150);

    const handle = setupPin(pinEl);
    handle.setPhase("during");
    handle.revert();

    expect(pinEl.parentElement).toBe(parent);
    expect(pinEl.style.position).toBe("");
  });
});
