export interface MarkerHandle {
  /** startY/endY are absolute document-Y coordinates (as computed by ScrollTrigger) - these markers use position:absolute so they naturally scroll with the page and only need updating when start/end change (e.g. on refresh), not on every scroll event. */
  update(startY: number, endY: number): void;
  remove(): void;
}

/** Debug-only start/end line visuals, isolated so this stays out of production bundles that never enable `markers: true`. */
export function createMarkers(label: string): MarkerHandle {
  const startLine = document.createElement("div");
  const endLine = document.createElement("div");

  const style = (el: HTMLElement, color: string): void => {
    el.style.cssText = `position:absolute;left:0;width:100%;border-top:2px dashed ${color};z-index:999999;pointer-events:none;`;
  };

  style(startLine, "#4ade80");
  style(endLine, "#f87171");
  startLine.setAttribute("data-six-marker", `${label}-start`);
  endLine.setAttribute("data-six-marker", `${label}-end`);

  document.body.appendChild(startLine);
  document.body.appendChild(endLine);

  return {
    update(startY: number, endY: number) {
      startLine.style.top = `${startY}px`;
      endLine.style.top = `${endY}px`;
    },
    remove() {
      startLine.remove();
      endLine.remove();
    },
  };
}
