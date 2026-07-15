export interface MarkerHandle {
  /** startY/endY are absolute document-Y coordinates (as computed by ScrollTrigger) - these markers use position:absolute so they naturally scroll with the page and only need updating when start/end change (e.g. on refresh), not on every scroll event. */
  update(startY: number, endY: number): void;
  remove(): void;
}

function createLine(color: string, text: string, align: "left" | "right"): { line: HTMLElement; label: HTMLElement } {
  const line = document.createElement("div");
  line.style.cssText = `position:absolute;left:0;width:100%;border-top:2px dashed ${color};z-index:999999;pointer-events:none;`;

  const label = document.createElement("span");
  label.textContent = text;
  // Below the line, not above (translateY(-100%) would push it) - a marker positioned near the
  // very top of the document would otherwise have its label pushed off-screen above y=0.
  label.style.cssText = `position:absolute;${align}:0;top:2px;background:${color};color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`;
  line.appendChild(label);

  return { line, label };
}

/** Debug-only start/end line visuals (with visible "start"/"end" text labels, matching GSAP's own markers), isolated so this stays out of production bundles that never enable `markers: true`. */
export function createMarkers(label: string): MarkerHandle {
  const start = createLine("#4ade80", `${label ? `${label} ` : ""}start`, "left");
  const end = createLine("#f87171", `${label ? `${label} ` : ""}end`, "right");

  start.line.setAttribute("data-six-marker", `${label}-start`);
  end.line.setAttribute("data-six-marker", `${label}-end`);

  document.body.appendChild(start.line);
  document.body.appendChild(end.line);

  return {
    update(startY: number, endY: number) {
      start.line.style.top = `${startY}px`;
      end.line.style.top = `${endY}px`;
    },
    remove() {
      start.line.remove();
      end.line.remove();
    },
  };
}
