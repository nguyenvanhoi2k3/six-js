export interface MarkerHandle {
  /**
   * Two pairs of lines, matching GSAP's actual 4-marker debug output:
   * - triggerStartY/triggerEndY: absolute DOCUMENT-Y coordinates of the trigger's own start/end
   *   position. These lines use `position: absolute` (left-aligned) so they scroll with the
   *   page, showing WHERE IN THE DOCUMENT the trigger boundary sits.
   * - viewportStartY/viewportEndY: viewport-relative pixel offsets from the top of the viewport.
   *   These lines use `position: fixed` (right-aligned) so they stay put on screen, showing the
   *   fixed on-screen boundary the document lines must visually cross for the trigger to fire.
   * When the two "start" lines visually meet, the trigger plays; when the two "end" lines meet,
   * it stops - each label reads exactly "start" or "end", nothing else.
   * Only need updating when start/end change (e.g. on refresh/resize), never on scroll.
   */
  update(triggerStartY: number, triggerEndY: number, viewportStartY: number, viewportEndY: number): void;
  remove(): void;
}

// If a viewport-fixed line sits within this many px of the viewport's bottom edge, its label
// can't fit below the line (the default position) without being clipped off-screen, so it flips
// above instead. A line near the TOP edge needs no such override - the default already has room.
const LABEL_FLIP_MARGIN = 24;

function createLine(color: string, text: string, align: "left" | "right", fixed: boolean): { line: HTMLElement; label: HTMLElement } {
  const line = document.createElement("div");
  line.style.cssText = `position:${fixed ? "fixed" : "absolute"};left:0;width:100%;border-top:2px dashed ${color};z-index:999999;pointer-events:none;`;

  const label = document.createElement("span");
  label.textContent = text;
  label.style.cssText = `position:absolute;${align}:0;top:2px;background:${color};color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`;
  line.appendChild(label);

  return { line, label };
}

function positionLabel(label: HTMLElement, viewportY: number): void {
  const flipAbove = viewportY > window.innerHeight - LABEL_FLIP_MARGIN;
  label.style.top = flipAbove ? "" : "2px";
  label.style.bottom = flipAbove ? "2px" : "";
}

/** Debug-only marker visuals (matching GSAP's own 4-line markers), isolated so this stays out of production bundles that never enable `debug: true`. */
export function createMarkers(label: string): MarkerHandle {
  const prefix = label ? `${label} ` : "";

  const triggerStart = createLine("#4ade80", `${prefix}start`, "left", false);
  const triggerEnd = createLine("#f87171", `${prefix}end`, "left", false);
  const viewportStart = createLine("#4ade80", `${prefix}start`, "right", true);
  const viewportEnd = createLine("#f87171", `${prefix}end`, "right", true);

  triggerStart.line.setAttribute("data-six-marker", `${label}-start`);
  triggerEnd.line.setAttribute("data-six-marker", `${label}-end`);
  viewportStart.line.setAttribute("data-six-marker", `${label}-start-viewport`);
  viewportEnd.line.setAttribute("data-six-marker", `${label}-end-viewport`);

  document.body.appendChild(triggerStart.line);
  document.body.appendChild(triggerEnd.line);
  document.body.appendChild(viewportStart.line);
  document.body.appendChild(viewportEnd.line);

  return {
    update(triggerStartY: number, triggerEndY: number, viewportStartY: number, viewportEndY: number) {
      triggerStart.line.style.top = `${triggerStartY}px`;
      triggerEnd.line.style.top = `${triggerEndY}px`;
      viewportStart.line.style.top = `${viewportStartY}px`;
      viewportEnd.line.style.top = `${viewportEndY}px`;
      positionLabel(viewportStart.label, viewportStartY);
      positionLabel(viewportEnd.label, viewportEndY);
    },
    remove() {
      triggerStart.line.remove();
      triggerEnd.line.remove();
      viewportStart.line.remove();
      viewportEnd.line.remove();
    },
  };
}
