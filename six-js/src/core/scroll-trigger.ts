import { ticker } from "./ticker";

interface ScrollDrivable {
  seek(time: number): unknown;
  play?(): unknown;
  readonly duration: number;
}

export interface OnScrollOptions {
  target?: string | HTMLElement;
  start?: string;
  end?: string;
  sync?: boolean | number;
  sticky?: boolean;
  debug?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

interface ResolvedPoint {
  scrollY: number;
  viewportSpec: EdgeSpec;
  viewportLabel: string;
  documentY: number;
  triggerLabel: string;
  triggerSpec: EdgeSpec;
}

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

interface EdgeSpec {
  ratio: number;
  offsetPx: number;
}

function resolveEdgePx(spec: EdgeSpec, dimension: number): number {
  return spec.ratio * dimension + spec.offsetPx;
}

function parseEdgeSpec(token: string): EdgeSpec {
  const trimmed = token.trim();

  const bareNumberMatch = trimmed.match(/^(-?[\d.]+)(px)?$/);
  if (bareNumberMatch) {
    return { ratio: 0, offsetPx: parseFloat(bareNumberMatch[1]) };
  }

  const match = trimmed.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);

  if (!match || (!match[1] && !match[2])) {
    console.warn(`[six-js] onScroll: unknown position "${token}", using "top"`);
    return { ratio: 0, offsetPx: 0 };
  }

  const [, base, op, numStr, unit] = match;

  let ratio = 0;
  if (base === "center") ratio = 0.5;
  else if (base === "bottom") ratio = 1;
  else if (base?.endsWith("%")) ratio = parseFloat(base) / 100;

  let offsetPx = 0;
  if (op && numStr) {
    const num = parseFloat(numStr);
    const signed = op === "+=" ? num : -num;
    if (unit === "%") {
      ratio += signed / 100;
    } else {
      offsetPx += signed;
    }
  }

  return { ratio, offsetPx };
}

function resolvePoint(str: string, rect: { top: number; height: number }, relativeBase?: number): ResolvedPoint {
  const relMatch = str.match(/^([+-]=)(\d+(\.\d+)?)$/);

  if (relMatch) {
    if (relativeBase === undefined) {
      console.warn(`[six-js] onScroll: "${str}" has nothing to be relative to`);
      return {
        scrollY: 0,
        viewportSpec: { ratio: 0, offsetPx: 0 },
        viewportLabel: str,
        documentY: 0,
        triggerLabel: str,
        triggerSpec: { ratio: 0, offsetPx: 0 },
      };
    }
    const sign = relMatch[1] === "+=" ? 1 : -1;
    const resolvedScrollY = relativeBase + sign * parseFloat(relMatch[2]);
    return {
      scrollY: resolvedScrollY,
      viewportSpec: { ratio: 0, offsetPx: 0 },
      viewportLabel: str,
      documentY: resolvedScrollY,
      triggerLabel: str,
      triggerSpec: { ratio: 0, offsetPx: 0 },
    };
  }

  const [triggerToken = "top", viewportToken = "top"] = str.trim().split(/\s+/);

  const triggerSpec = parseEdgeSpec(triggerToken);
  const viewportSpec = parseEdgeSpec(viewportToken);

  const triggerTopAbs = window.scrollY + rect.top;
  const triggerPointAbs = triggerTopAbs + resolveEdgePx(triggerSpec, rect.height);
  const viewportOffset = resolveEdgePx(viewportSpec, getViewportHeight());

  return {
    scrollY: triggerPointAbs - viewportOffset,
    viewportSpec,
    viewportLabel: viewportToken,
    documentY: triggerPointAbs,
    triggerLabel: triggerToken,
    triggerSpec,
  };
}

const SCROLL_MEMORY_PREFIX = "sixjs:scrollY:";

function scrollMemoryKey(): string {
  return SCROLL_MEMORY_PREFIX + location.pathname + location.search;
}

function readSavedScrollY(): number | null {
  try {
    const raw = sessionStorage.getItem(scrollMemoryKey());
    if (raw === null) return null;
    const y = parseFloat(raw);
    return Number.isFinite(y) ? y : null;
  } catch {
    return null;
  }
}

function saveScrollY(): void {
  try {
    sessionStorage.setItem(scrollMemoryKey(), String(window.scrollY));
  } catch {
    // ignore
  }
}

function isReloadOrHistoryNavigation(): boolean {
  const [entry] = performance.getEntriesByType?.("navigation") ?? [];
  if (entry && "type" in entry) {
    const type = (entry as PerformanceNavigationTiming).type;
    return type === "reload" || type === "back_forward";
  }

  const legacy = (performance as unknown as { navigation?: { type: number } }).navigation;
  return legacy?.type === 1 || legacy?.type === 2;
}

let scrollMemoryReady = false;

function ensureScrollMemory(): void {
  if (scrollMemoryReady) return;
  scrollMemoryReady = true;

  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    // ignore
  }

  const savedY = isReloadOrHistoryNavigation() ? readSavedScrollY() : null;
  if (savedY !== null) {
    window.scrollTo(0, savedY);
    window.addEventListener("load", () => window.scrollTo(0, savedY), { once: true });
  }

  let pending = false;
  window.addEventListener(
    "scroll",
    () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        saveScrollY();
      });
    },
    { passive: true },
  );
}

const LABEL_FLIP_THRESHOLD = 20;

const LABEL_STACK_THRESHOLD = 24;

const LABEL_ROW_HEIGHT = 20;

interface MarkerHandle {
  line: HTMLElement;
  label: HTMLElement;
}

type LabelAlign = "left" | "right";
type MarkerPosition = "fixed" | "absolute";

export class ScrollTriggerController {
  private triggerEl: HTMLElement;
  private playable: ScrollDrivable;
  private options: OnScrollOptions;

  private startY = 0;
  private endY = 0;

  private startViewportSpec: EdgeSpec = { ratio: 0, offsetPx: 0 };
  private endViewportSpec: EdgeSpec = { ratio: 1, offsetPx: 0 };
  private startViewportLabel = "";
  private endViewportLabel = "";
  private startTriggerY = 0;
  private endTriggerY = 0;
  private startTriggerLabel = "";
  private endTriggerLabel = "";
  private startTriggerSpec: EdgeSpec = { ratio: 0, offsetPx: 0 };
  private triggerLabelsCollide = false;

  private smoothedProgress = 0;
  private smoothInitialized = false;
  private wasInside = false;
  private lastScrollY = window.scrollY;
  private rafPending = false;

  private pinSpacer: HTMLElement | null = null;
  private pinState: "before" | "during" | "after" = "before";
  private pinOriginalStyles: Partial<CSSStyleDeclaration> | null = null;
  private pinRectWidth = 0;
  private pinRectHeight = 0;

  private startMarker: MarkerHandle | null = null; 
  private endMarker: MarkerHandle | null = null; 
  private startTriggerMarker: MarkerHandle | null = null; 
  private endTriggerMarker: MarkerHandle | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private recalcRafPending = false;

  private onScrollBound = () => this.requestUpdate();
  private onResizeBound = () => this.recalc();
  private onLoadBound = () => this.recalc();
  private tickerBound = (_time: number, delta: number) => this.tickSmooth(delta);

  constructor(triggerEl: HTMLElement, playable: ScrollDrivable, options: OnScrollOptions) {
    ensureScrollMemory();

    this.triggerEl = triggerEl;
    this.playable = playable;
    this.options = options;

    if (options.debug) {
      this.setupDebugMarkers();
    }

    this.recalc();

    window.addEventListener("scroll", this.onScrollBound, { passive: true });
    window.addEventListener("resize", this.onResizeBound);
    window.visualViewport?.addEventListener("resize", this.onResizeBound);
    if (document.readyState === "complete") {
      this.recalc();
    } else {
      window.addEventListener("load", this.onLoadBound, { once: true });
    }
    this.setupResizeObserver();

    if (typeof options.sync === "number") {
      ticker.add(this.tickerBound);
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === "undefined") return;

    let firstCallback = true;

    this.resizeObserver = new ResizeObserver(() => {
      if (firstCallback) {
        firstCallback = false;
        return;
      }

      if (this.recalcRafPending) return;
      this.recalcRafPending = true;

      requestAnimationFrame(() => {
        this.recalcRafPending = false;
        this.recalc();
      });
    });

    this.resizeObserver.observe(document.body);
    this.resizeObserver.observe(this.triggerEl);
  }

  private recalc(): void {
    this.smoothInitialized = false;

    const startStr = this.options.start ?? "top bottom";
    const endStr = this.options.end ?? "bottom top";

    if (this.options.sticky) {
      this.setupPin();
      this.refreshPinRect();
    }

    const measureRect = this.getMeasureRect();

    const startResolved = resolvePoint(startStr, measureRect);
    this.startY = startResolved.scrollY;
    this.startViewportSpec = startResolved.viewportSpec;
    this.startViewportLabel = startResolved.viewportLabel;
    this.startTriggerY = startResolved.documentY;
    this.startTriggerLabel = startResolved.triggerLabel;
    this.startTriggerSpec = startResolved.triggerSpec;

    const endResolved = resolvePoint(endStr, measureRect, this.startY);
    this.endY = endResolved.scrollY;
    this.endViewportSpec = endResolved.viewportSpec;
    this.endViewportLabel = endResolved.viewportLabel;
    this.endTriggerY = endResolved.documentY;
    this.endTriggerLabel = endResolved.triggerLabel;

    if (this.endY <= this.startY) {
      console.warn(`[six-js] onScroll: "end" resolves before "start", clamping`);
      this.endY = this.startY + 1;
    }

    this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < LABEL_STACK_THRESHOLD;

    if (this.options.sticky) {
      this.updatePinSpacer();
    }

    this.updateDebugMarkers();

    this.update();

    if (this.options.sticky) {
      this.applyPinForState(this.pinState);
    }
  }

  private getMeasureRect(): { top: number; height: number } {
    if (this.pinSpacer) {
      return { top: this.pinSpacer.getBoundingClientRect().top, height: this.pinRectHeight };
    }
    return this.triggerEl.getBoundingClientRect();
  }

  private refreshPinRect(): void {
    if (this.pinState !== "before") return;
    const rect = this.triggerEl.getBoundingClientRect();
    this.pinRectWidth = rect.width;
    this.pinRectHeight = rect.height;
  }

  private computeProgress(): number {
    const y = window.scrollY;
    return Math.max(0, Math.min((y - this.startY) / (this.endY - this.startY), 1));
  }

  private requestUpdate(): void {
    if (this.rafPending) return;
    this.rafPending = true;

    requestAnimationFrame(() => {
      this.rafPending = false;
      this.update();
    });
  }

  private update(): void {
    const y = window.scrollY;
    const progress = this.computeProgress();
    const isInsideRange = y >= this.startY && y <= this.endY;
    const goingForward = y >= this.lastScrollY;
    const justEntered = isInsideRange && !this.wasInside;
    const justLeft = !isInsideRange && this.wasInside;

    if (justEntered) {
      if (goingForward) this.options.onEnter?.();
      else this.options.onEnterBack?.();
    } else if (justLeft) {
      if (goingForward) this.options.onLeave?.();
      else this.options.onLeaveBack?.();
    }

    this.wasInside = isInsideRange;
    this.lastScrollY = y;

    if (this.options.sticky) {
      this.updatePinState(y);
    }

    this.updateTriggerMarkerLabelFlip(y);

    const syncMode = this.options.sync ?? false;

    if (syncMode === false) {
      if (justEntered && goingForward) {
        this.playable.play?.();
      }
    } else if (syncMode === true) {
      this.playable.seek(progress * this.playable.duration);
    }
  }

  private tickSmooth(delta: number): void {
    if (typeof this.options.sync !== "number") return;

    const target = this.computeProgress();

    if (!this.smoothInitialized) {
      this.smoothInitialized = true;
      this.smoothedProgress = target;
      this.playable.seek(this.smoothedProgress * this.playable.duration);
      return;
    }

    const lagSeconds = Math.max(0.05, this.options.sync);
    const deltaSeconds = delta / 1000;

    const factor = 1 - Math.exp((-3 * deltaSeconds) / lagSeconds);
    this.smoothedProgress += (target - this.smoothedProgress) * factor;

    if (Math.abs(target - this.smoothedProgress) < 0.0005) {
      this.smoothedProgress = target;
    }

    this.playable.seek(this.smoothedProgress * this.playable.duration);
  }

  private setupPin(): void {
    if (this.pinSpacer) return;

    const rect = this.triggerEl.getBoundingClientRect();

    const spacer = document.createElement("div");
    spacer.style.position = "relative";

    this.triggerEl.parentElement?.insertBefore(spacer, this.triggerEl);
    spacer.appendChild(this.triggerEl);

    this.pinOriginalStyles = {
      position: this.triggerEl.style.position,
      top: this.triggerEl.style.top,
      left: this.triggerEl.style.left,
      width: this.triggerEl.style.width,
      zIndex: this.triggerEl.style.zIndex,
    };

    this.pinSpacer = spacer;
    this.pinRectWidth = rect.width;
    this.pinRectHeight = rect.height;
  }

  private updatePinSpacer(): void {
    if (!this.pinSpacer) return;

    const pinDistance = Math.max(0, this.endY - this.startY);
    this.pinSpacer.style.width = `${this.pinRectWidth}px`;
    this.pinSpacer.style.height = `${this.pinRectHeight + pinDistance}px`;
  }

  private updatePinState(y: number): void {
    if (!this.pinSpacer) return;

    const nextState: "before" | "during" | "after" = y < this.startY ? "before" : y > this.endY ? "after" : "during";

    if (nextState === this.pinState) return;
    this.pinState = nextState;
    this.applyPinForState(nextState);
  }

  private applyPinForState(state: "before" | "during" | "after"): void {
    if (state === "before") {
      this.applyPinBefore();
    } else if (state === "during") {
      this.applyPinDuring();
    } else {
      this.applyPinAfter();
    }
  }

  private applyPinDuring(): void {
    if (!this.pinSpacer) return;

    const spacerRect = this.pinSpacer.getBoundingClientRect();
    const viewportOffset = resolveEdgePx(this.startViewportSpec, getViewportHeight());
    const triggerOffset = resolveEdgePx(this.startTriggerSpec, this.pinRectHeight);
    const topPx = viewportOffset - triggerOffset;

    this.triggerEl.style.position = "fixed";
    this.triggerEl.style.top = `${topPx}px`;
    this.triggerEl.style.left = `${spacerRect.left}px`;
    this.triggerEl.style.width = `${this.pinRectWidth}px`;
    this.triggerEl.style.zIndex = "10";
  }

  private applyPinAfter(): void {
    const pinDistance = Math.max(0, this.endY - this.startY);

    this.triggerEl.style.position = "absolute";
    this.triggerEl.style.top = `${pinDistance}px`;
    this.triggerEl.style.left = "0px";
    this.triggerEl.style.width = `${this.pinRectWidth}px`;
    this.triggerEl.style.zIndex = "10";
  }

  private applyPinBefore(): void {
    if (!this.pinOriginalStyles) return;
    Object.assign(this.triggerEl.style, this.pinOriginalStyles);
  }

  private teardownPin(): void {
    if (!this.pinSpacer) return;

    if (this.pinOriginalStyles) {
      Object.assign(this.triggerEl.style, this.pinOriginalStyles);
    }

    this.pinSpacer.parentElement?.insertBefore(this.triggerEl, this.pinSpacer);
    this.pinSpacer.remove();
    this.pinSpacer = null;
    this.pinState = "before";
  }

  private setupDebugMarkers(): void {
    this.startMarker = this.createMarkerLine({ color: "#4ade80", align: "left", position: "fixed" });
    this.startTriggerMarker = this.createMarkerLine({ color: "#4ade80", align: "right", position: "absolute" });

    this.endMarker = this.createMarkerLine({ color: "#f87171", align: "left", position: "fixed" });
    this.endTriggerMarker = this.createMarkerLine({ color: "#f87171", align: "right", position: "absolute" });
  }

  private createMarkerLine(opts: { color: string; align: LabelAlign; position: MarkerPosition }): MarkerHandle {
    const { color, align, position } = opts;

    const line = document.createElement("div");
    line.style.cssText = `
      position: ${position};
      left: 0;
      width: 100%;
      border-top: 2px dashed ${color};
      z-index: 999999;
      pointer-events: none;
      will-change: transform;
    `;

    const tag = document.createElement("span");
    tag.style.cssText = `
      position: absolute;
      ${align}: 0;
      background: ${color};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `;
    this.applyLabelSide(tag, "above");

    line.appendChild(tag);
    document.body.appendChild(line);

    return { line, label: tag };
  }

  private applyLabelSide(label: HTMLElement, side: "above" | "below", stackIndex = 0): void {
    const extra = stackIndex * LABEL_ROW_HEIGHT;

    if (side === "above") {
      label.style.top = `${-1 - extra}px`;
      label.style.transform = "translateY(-100%)";
    } else {
      label.style.top = `${1 + extra}px`;
      label.style.transform = "translateY(0)";
    }
  }

  private setMarkerPosition(marker: MarkerHandle, topPx: number, viewportRelativeTop: number, stackIndex = 0): void {
    marker.line.style.top = `${topPx}px`;
    this.applyLabelSide(marker.label, viewportRelativeTop < LABEL_FLIP_THRESHOLD ? "below" : "above", stackIndex);
  }

  private updateTriggerMarkerLabelFlip(scrollY: number): void {
    if (this.startTriggerMarker) {
      const viewportRelativeTop = this.startTriggerY - scrollY;
      this.applyLabelSide(this.startTriggerMarker.label, viewportRelativeTop < LABEL_FLIP_THRESHOLD ? "below" : "above", 0);
    }

    if (this.endTriggerMarker) {
      const viewportRelativeTop = this.endTriggerY - scrollY;
      const stackIndex = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, viewportRelativeTop < LABEL_FLIP_THRESHOLD ? "below" : "above", stackIndex);
    }
  }

  private updateDebugMarkers(): void {
    const viewportH = getViewportHeight();
    const scrollY = window.scrollY;

    const startViewportTop = resolveEdgePx(this.startViewportSpec, viewportH);
    const endViewportTop = resolveEdgePx(this.endViewportSpec, viewportH);
    const viewportLabelsCollide = Math.abs(startViewportTop - endViewportTop) < LABEL_STACK_THRESHOLD;

    if (this.startMarker) {
      this.setMarkerPosition(this.startMarker, startViewportTop, startViewportTop, 0);
      this.startMarker.label.textContent = `start: "${this.startViewportLabel}"`;
    }

    if (this.endMarker) {
      this.setMarkerPosition(this.endMarker, endViewportTop, endViewportTop, viewportLabelsCollide ? 1 : 0);
      this.endMarker.label.textContent = `end: "${this.endViewportLabel}"`;
    }

    if (this.startTriggerMarker) {
      this.setMarkerPosition(this.startTriggerMarker, this.startTriggerY, this.startTriggerY - scrollY, 0);
      this.startTriggerMarker.label.textContent = `start: "${this.startTriggerLabel}"`;
    }

    if (this.endTriggerMarker) {
      const stackIndex = this.triggerLabelsCollide ? 1 : 0;
      this.setMarkerPosition(this.endTriggerMarker, this.endTriggerY, this.endTriggerY - scrollY, stackIndex);
      this.endTriggerMarker.label.textContent = `end: "${this.endTriggerLabel}"`;
    }
  }

  private removeDebugMarkers(): void {
    this.startMarker?.line.remove();
    this.endMarker?.line.remove();
    this.startTriggerMarker?.line.remove();
    this.endTriggerMarker?.line.remove();

    this.startMarker = null;
    this.endMarker = null;
    this.startTriggerMarker = null;
    this.endTriggerMarker = null;
  }

  destroy(): void {
    window.removeEventListener("scroll", this.onScrollBound);
    window.removeEventListener("resize", this.onResizeBound);
    window.visualViewport?.removeEventListener("resize", this.onResizeBound);
    window.removeEventListener("load", this.onLoadBound);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    ticker.remove(this.tickerBound);
    this.teardownPin();
    this.removeDebugMarkers();
  }
}