import { afterEach, describe, expect, it, vi } from "vitest";
import { setupSticky } from "./sticky";

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

describe("setupSticky", () => {
  afterEach(() => vi.restoreAllMocks());

  it("wraps the element in a spacer that reserves its natural size", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 10, 20, 300, 150);

    setupSticky(stickyEl);

    const spacer = stickyEl.parentElement!;
    expect(spacer).not.toBe(parent);
    expect(spacer.parentElement).toBe(parent);
    expect(spacer.style.width).toBe("300px");
    expect(spacer.style.height).toBe("150px");
  });

  it("extends the spacer's height by the sticky distance", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 0, 0, 300, 150);

    const handle = setupSticky(stickyEl);
    handle.setDistance(500);

    expect(stickyEl.parentElement!.style.height).toBe("650px"); // 150 natural + 500 distance
  });

  it("applies position:fixed only during the 'during' phase", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 0, 0, 300, 150);

    const handle = setupSticky(stickyEl);

    handle.setPhase("before");
    expect(stickyEl.style.position).not.toBe("fixed");

    handle.setPhase("during");
    expect(stickyEl.style.position).toBe("fixed");

    handle.setPhase("after");
    expect(stickyEl.style.position).toBe("absolute");
  });

  it("naturalDocTop reflects the element's rect.top plus the scroll position at setup time", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 120, 0, 300, 150); // viewport-relative top of 120
    vi.spyOn(window, "scrollY", "get").mockReturnValue(400);

    const handle = setupSticky(stickyEl);

    expect(handle.naturalDocTop).toBe(520); // 120 + 400
  });

  it("uses the stickyTop set via setStickyTop() during the 'during' phase - NOT always 0", () => {
    // this is the exact bug a user hit: a "center center" trigger needs the element to stay
    // wherever it naturally sat in the viewport (e.g. vertically centered), not snap to y=0.
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 0, 0, 300, 150);

    const handle = setupSticky(stickyEl);
    handle.setStickyTop(213.5);
    handle.setPhase("during");

    expect(stickyEl.style.top).toBe("213.5px");
  });

  it("shares one spacer across multiple setupSticky() calls on the same element (reference counted)", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 0, 0, 300, 150);

    const handleA = setupSticky(stickyEl);
    const spacerAfterFirst = stickyEl.parentElement;

    const handleB = setupSticky(stickyEl);
    expect(stickyEl.parentElement).toBe(spacerAfterFirst); // same spacer, not a second one

    handleA.revert();
    expect(stickyEl.parentElement).toBe(spacerAfterFirst); // still stuck - handleB is still alive

    handleB.revert();
    expect(stickyEl.parentElement).toBe(parent); // fully unstuck once every handle has reverted
  });

  it("revert() restores the element to its original position in the DOM and clears inline overrides", () => {
    const parent = document.createElement("div");
    const stickyEl = document.createElement("div");
    parent.appendChild(stickyEl);
    mockRect(stickyEl, 0, 0, 300, 150);

    const handle = setupSticky(stickyEl);
    handle.setPhase("during");
    handle.revert();

    expect(stickyEl.parentElement).toBe(parent);
    expect(stickyEl.style.position).toBe("");
  });
});
