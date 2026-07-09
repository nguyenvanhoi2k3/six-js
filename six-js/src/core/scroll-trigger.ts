// src/core/scroll-trigger.ts
import { Playable } from "./playable";
import { ticker } from "./ticker";

export interface OnScrollOptions {
  /** Phần tử làm mốc tính vị trí cuộn; mặc định = target của tween */
  target?: string | HTMLElement;
  /** "top top", "center bottom", "+=500"... mặc định "top bottom" */
  start?: string;
  /** mặc định "bottom top" */
  end?: string;
  /** true: scrub 1:1 theo pixel | number: scrub có độ trễ (càng cao càng ì) | false: chạy 1 mạch khi chạm start */
  sync?: boolean | number;
  pin?: boolean;
  /** true: vẽ marker start/end trên trang (giống GSAP markers), để debug trực quan */
  debug?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

function parseEdge(token: string): number {
  if (token === "top") return 0;
  if (token === "center") return 0.5;
  if (token === "bottom") return 1;

  const pctMatch = token.match(/^(-?[\d.]+)%$/);
  if (pctMatch) return parseFloat(pctMatch[1]) / 100;

  console.warn(`[six-js] onScroll: unknown position "${token}", using "top"`);
  return 0;
}

/** Trả về scrollY tuyệt đối (document) tương ứng với "trigger-edge viewport-edge" hoặc "+=N"/"-=N" */
function resolvePoint(str: string, triggerEl: HTMLElement, relativeBase?: number): number {
  const relMatch = str.match(/^([+-]=)(\d+(\.\d+)?)$/);

  if (relMatch) {
    if (relativeBase === undefined) {
      console.warn(`[six-js] onScroll: "${str}" has nothing to be relative to`);
      return 0;
    }
    const sign = relMatch[1] === "+=" ? 1 : -1;
    return relativeBase + sign * parseFloat(relMatch[2]);
  }

  const [triggerToken = "top", viewportToken = "top"] = str.trim().split(/\s+/);

  const rect = triggerEl.getBoundingClientRect();
  const triggerTopAbs = window.scrollY + rect.top;
  const triggerPointAbs = triggerTopAbs + rect.height * parseEdge(triggerToken);
  const viewportOffset = window.innerHeight * parseEdge(viewportToken);

  return triggerPointAbs - viewportOffset;
}

export class ScrollTriggerController {
  private triggerEl: HTMLElement;
  private playable: Playable;
  private options: OnScrollOptions;

  private startY = 0;
  private endY = 0;
  private smoothedProgress = 0;
  private wasInside = false;
  private lastScrollY = window.scrollY;
  private rafPending = false;

  private pinSpacer: HTMLElement | null = null;
  private pinned = false;
  private pinOriginalStyles: Partial<CSSStyleDeclaration> | null = null;

  private startMarker: HTMLElement | null = null;
  private endMarker: HTMLElement | null = null;

  private onScrollBound = () => this.requestUpdate();
  private onResizeBound = () => this.recalc();
  private tickerBound = (_time: number, delta: number) => this.tickSmooth(delta);

  constructor(triggerEl: HTMLElement, playable: Playable, options: OnScrollOptions) {
    this.triggerEl = triggerEl;
    this.playable = playable;
    this.options = options;

    this.recalc();

    if (options.debug) {
      this.setupDebugMarkers();
    }

    window.addEventListener("scroll", this.onScrollBound, { passive: true });
    window.addEventListener("resize", this.onResizeBound);

    if (typeof options.sync === "number") {
      ticker.add(this.tickerBound);
    }

    this.update(); // xử lý ngay trạng thái ban đầu (trang load giữa chừng đã cuộn sẵn)
  }

  private recalc(): void {
    const startStr = this.options.start ?? "top bottom";
    const endStr = this.options.end ?? "bottom top";

    this.startY = resolvePoint(startStr, this.triggerEl);
    this.endY = resolvePoint(endStr, this.triggerEl, this.startY);

    if (this.endY <= this.startY) {
      console.warn(`[six-js] onScroll: "end" resolves before "start", clamping`);
      this.endY = this.startY + 1;
    }

    this.updateDebugMarkers();
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

    if (this.options.pin) {
      this.updatePin(isInsideRange);
    }

    const syncMode = this.options.sync ?? false;

    if (syncMode === false) {
      // Mặc định (không truyền sync) hoặc sync:false -> chạy 1 mạch ngay khi vừa entering
      if (justEntered && goingForward) {
        this.playable.restart();
      }
    } else if (syncMode === true) {
      this.playable.seek(progress * this.playable.duration);
    }
    // sync là number -> xử lý riêng trong tickSmooth() qua ticker
  }

  /**
   * sync (number) = số giây thực để "đuổi kịp" ~95% vị trí scroll thật, khớp đúng
   * ngữ nghĩa scrub number của GSAP. Dùng hằng số thời gian tau = lagSeconds/3 vì
   * exp(-3) ≈ 0.05 (đã bắt kịp 95%) đúng lúc t = lagSeconds.
   */
  private tickSmooth(delta: number): void {
    if (typeof this.options.sync !== "number") return;

    const target = this.computeProgress();
    const lagSeconds = Math.max(0.05, this.options.sync);
    const deltaSeconds = delta / 1000;

    const factor = 1 - Math.exp((-3 * deltaSeconds) / lagSeconds);
    this.smoothedProgress += (target - this.smoothedProgress) * factor;

    if (Math.abs(target - this.smoothedProgress) < 0.0005) {
      this.smoothedProgress = target;
    }

    this.playable.seek(this.smoothedProgress * this.playable.duration);
  }

  private updatePin(isInsideRange: boolean): void {
    if (isInsideRange && !this.pinned) {
      this.pinElement();
    } else if (!isInsideRange && this.pinned) {
      this.unpinElement();
    }
  }

  private pinElement(): void {
    const rect = this.triggerEl.getBoundingClientRect();

    const spacer = document.createElement("div");
    spacer.style.height = `${rect.height}px`;
    spacer.style.width = `${rect.width}px`;
    this.triggerEl.parentElement?.insertBefore(spacer, this.triggerEl);
    this.pinSpacer = spacer;

    this.pinOriginalStyles = {
      position: this.triggerEl.style.position,
      top: this.triggerEl.style.top,
      left: this.triggerEl.style.left,
      width: this.triggerEl.style.width,
      zIndex: this.triggerEl.style.zIndex,
    };

    this.triggerEl.style.position = "fixed";
    this.triggerEl.style.top = "0px";
    this.triggerEl.style.left = `${rect.left}px`;
    this.triggerEl.style.width = `${rect.width}px`;
    this.triggerEl.style.zIndex = "10";

    this.pinned = true;
  }

  private unpinElement(): void {
    if (!this.pinOriginalStyles) return;

    Object.assign(this.triggerEl.style, this.pinOriginalStyles);
    this.pinSpacer?.remove();
    this.pinSpacer = null;
    this.pinned = false;
  }

  private setupDebugMarkers(): void {
    this.startMarker = this.createMarkerLine("start", "#4ade80");
    this.endMarker = this.createMarkerLine("end", "#f87171");
  }

  private createMarkerLine(label: string, color: string): HTMLElement {
    const line = document.createElement("div");
    line.style.cssText = `
      position: absolute;
      left: 0;
      width: 100%;
      border-top: 2px dashed ${color};
      z-index: 999999;
      pointer-events: none;
    `;

    const tag = document.createElement("span");
    tag.textContent = `${label} (six-js onScroll)`;
    tag.style.cssText = `
      position: absolute;
      left: 0;
      top: -1px;
      transform: translateY(-100%);
      background: ${color};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `;

    line.appendChild(tag);
    document.body.appendChild(line);

    return line;
  }

  private updateDebugMarkers(): void {
    if (this.startMarker) this.startMarker.style.top = `${this.startY}px`;
    if (this.endMarker) this.endMarker.style.top = `${this.endY}px`;
  }

  private removeDebugMarkers(): void {
    this.startMarker?.remove();
    this.endMarker?.remove();
    this.startMarker = null;
    this.endMarker = null;
  }

  destroy(): void {
    window.removeEventListener("scroll", this.onScrollBound);
    window.removeEventListener("resize", this.onResizeBound);
    ticker.remove(this.tickerBound);
    this.unpinElement();
    this.removeDebugMarkers();
  }
}