import { afterEach, describe, expect, it } from "vitest";
import { createMarkers } from "./markers";

describe("createMarkers", () => {
  afterEach(() => {
    document.querySelectorAll("[data-six-marker]").forEach((el) => el.remove());
  });

  it("renders exactly 'start'/'end' text labels on all 4 lines, nothing else appended", () => {
    createMarkers("");

    const triggerStart = document.querySelector('[data-six-marker="-start"] span')!;
    const triggerEnd = document.querySelector('[data-six-marker="-end"] span')!;
    const viewportStart = document.querySelector('[data-six-marker="-start-viewport"] span')!;
    const viewportEnd = document.querySelector('[data-six-marker="-end-viewport"] span')!;

    expect(triggerStart.textContent).toBe("start");
    expect(triggerEnd.textContent).toBe("end");
    expect(viewportStart.textContent).toBe("start");
    expect(viewportEnd.textContent).toBe("end");
  });

  it("includes the given label/id in the marker text so multiple triggers are distinguishable", () => {
    createMarkers("gallery");

    const triggerStart = document.querySelector('[data-six-marker="gallery-start"] span')!;
    expect(triggerStart.textContent).toBe("gallery start");
  });

  it("positions the trigger lines (document-anchored, absolute) and viewport lines (fixed) independently", () => {
    const handle = createMarkers("m");
    handle.update(2000, 3000, 120, 640);

    const triggerStart = document.querySelector('[data-six-marker="m-start"]') as HTMLElement;
    const triggerEnd = document.querySelector('[data-six-marker="m-end"]') as HTMLElement;
    const viewportStart = document.querySelector('[data-six-marker="m-start-viewport"]') as HTMLElement;
    const viewportEnd = document.querySelector('[data-six-marker="m-end-viewport"]') as HTMLElement;

    expect(triggerStart.style.position).toBe("absolute");
    expect(triggerStart.style.top).toBe("2000px");
    expect(triggerEnd.style.top).toBe("3000px");

    expect(viewportStart.style.position).toBe("fixed");
    expect(viewportStart.style.top).toBe("120px");
    expect(viewportEnd.style.top).toBe("640px");

    // labels never change, regardless of the resolved values
    expect((document.querySelector('[data-six-marker="m-start"] span') as HTMLElement).textContent).toBe("m start");
  });

  it("keeps the viewport line's label below by default, but flips above when it's near the viewport's bottom edge", () => {
    const handle = createMarkers("m");
    const label = document.querySelector('[data-six-marker="m-start-viewport"] span') as HTMLElement;

    handle.update(0, 0, 120, 640);
    expect(label.style.top).toBe("2px");
    expect(label.style.bottom).toBe("");

    handle.update(0, 0, window.innerHeight - 5, 640);
    expect(label.style.top).toBe("");
    expect(label.style.bottom).toBe("2px");
  });

  it("remove() cleans up all 4 lines", () => {
    const handle = createMarkers("gone");
    expect(document.querySelectorAll('[data-six-marker^="gone"]')).toHaveLength(4);

    handle.remove();
    expect(document.querySelectorAll('[data-six-marker^="gone"]')).toHaveLength(0);
  });
});
