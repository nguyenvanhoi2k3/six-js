import { afterEach, describe, expect, it } from "vitest";
import { createMarkers } from "./markers";

describe("createMarkers", () => {
  afterEach(() => {
    document.querySelectorAll("[data-six-marker]").forEach((el) => el.remove());
  });

  it("renders visible 'start'/'end' text labels, not just bare lines", () => {
    createMarkers("");

    const startMarker = document.querySelector('[data-six-marker$="-start"]')!;
    const endMarker = document.querySelector('[data-six-marker$="-end"]')!;

    expect(startMarker.textContent).toContain("start");
    expect(endMarker.textContent).toContain("end");
  });

  it("includes the given label/id in the marker text so multiple triggers are distinguishable", () => {
    createMarkers("gallery");

    const startMarker = document.querySelector('[data-six-marker="gallery-start"]')!;
    expect(startMarker.textContent).toContain("gallery");
    expect(startMarker.textContent).toContain("start");
  });

  it("positions the lines at the given document-Y coordinates", () => {
    const handle = createMarkers("m");
    handle.update(120, 640);

    const startMarker = document.querySelector('[data-six-marker="m-start"]') as HTMLElement;
    const endMarker = document.querySelector('[data-six-marker="m-end"]') as HTMLElement;

    expect(startMarker.style.top).toBe("120px");
    expect(endMarker.style.top).toBe("640px");
  });

  it("remove() cleans up both lines", () => {
    const handle = createMarkers("gone");
    expect(document.querySelectorAll('[data-six-marker^="gone"]')).toHaveLength(2);

    handle.remove();
    expect(document.querySelectorAll('[data-six-marker^="gone"]')).toHaveLength(0);
  });
});
