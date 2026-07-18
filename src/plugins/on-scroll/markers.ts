export interface MarkerHandle {
  /**
   * Two pairs of lines, a 4-marker debug output:
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

// A relative end (`end: "+=500"`, no edge token) has no independent viewport edge, so it falls
// back to the same "top" ratio a plain `start: "top ..."` already uses (see
// resolveMarkerViewportY's own doc comment) - meaning the two lines land on the exact same pixel
// for this common idiom (also possible for the document-anchored pair on a very short trigger
// range). When start/end are within this many px of each other, the end label is pushed
// sideways past the start label's own measured width instead of sitting on top of it - both stay
// readable side by side on the same row, rather than one stacked over the other.
const LABEL_OVERLAP_GAP = 24;
const LABEL_SIDE_GAP = 4;

function withAlpha(rgb: string, alpha: number): string {
  return `rgba(${rgb},${alpha})`;
}

const START_RGB = "74,222,128"; // #4ade80
const END_RGB = "248,113,113"; // #f87171

function createLine(rgb: string, text: string, align: "left" | "right", fixed: boolean): { line: HTMLElement; label: HTMLElement } {
  const line = document.createElement("div");
  // `screen` (not `multiply`) - these markers run over this project's own dark-themed demo
  // pages, and `multiply` darkens toward black against a dark backdrop (crushing both the line
  // AND its label child, since the label paints inside the line's own blend stacking context) -
  // `screen` instead brightens, so two overlapping translucent lines mix toward a visible bright
  // blend instead of toward black, and a solid backdrop is left unchanged (screen against black
  // is the identity).
  line.style.cssText = `position:${fixed ? "fixed" : "absolute"};left:0;width:100%;border-top:1.4px solid ${withAlpha(rgb, 0.8)};z-index:999999;pointer-events:none;mix-blend-mode:screen;`;

  const label = document.createElement("span");
  label.textContent = text;
  label.style.cssText = `position:absolute;${align}:0;top:2px;background:rgb(${rgb});color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`;
  line.appendChild(label);

  return { line, label };
}

function positionVertical(label: HTMLElement, viewportY: number): void {
  const flipAbove = viewportY > window.innerHeight - LABEL_FLIP_MARGIN;
  label.style.top = flipAbove ? "" : "2px";
  label.style.bottom = flipAbove ? "2px" : "";
}

function pushAside(reference: HTMLElement, moving: HTMLElement, align: "left" | "right", overlapping: boolean): void {
  moving.style[align] = overlapping ? `${reference.offsetWidth + LABEL_SIDE_GAP}px` : "0px";
}

/** Debug-only marker visuals (a 4-line marker layout), isolated so this stays out of production bundles that never enable `debug: true`. */
export function createMarkers(label: string): MarkerHandle {
  const prefix = label ? `${label} ` : "";

  const triggerStart = createLine(START_RGB, `${prefix}start`, "left", false);
  const triggerEnd = createLine(END_RGB, `${prefix}end`, "left", false);
  const viewportStart = createLine(START_RGB, `${prefix}start`, "right", true);
  const viewportEnd = createLine(END_RGB, `${prefix}end`, "right", true);

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

      pushAside(triggerStart.label, triggerEnd.label, "left", Math.abs(triggerEndY - triggerStartY) < LABEL_OVERLAP_GAP);

      positionVertical(viewportStart.label, viewportStartY);
      positionVertical(viewportEnd.label, viewportEndY);
      pushAside(viewportStart.label, viewportEnd.label, "right", Math.abs(viewportEndY - viewportStartY) < LABEL_OVERLAP_GAP);
    },
    remove() {
      triggerStart.line.remove();
      triggerEnd.line.remove();
      viewportStart.line.remove();
      viewportEnd.line.remove();
    },
  };
}
