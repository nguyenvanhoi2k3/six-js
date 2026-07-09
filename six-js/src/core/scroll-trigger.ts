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
  /** true: vẽ marker start/end để debug trực quan */
  debug?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

/**
 * Kết quả phân giải 1 điểm "start"/"end". Một điểm scroll-trigger về bản chất là
 * giao điểm giữa 1 vị trí trên TRIGGER và 1 vị trí trên VIEWPORT:
 *   scrollY = triggerPointAbs (toạ độ tuyệt đối trên document) - viewportOffset (px trong viewport)
 * Cả 2 vế đều cần thiết để vẽ marker đúng: 1 line neo theo document (đại diện phía
 * trigger), 1 line neo theo viewport (đại diện phía scroller) — khi 2 line này trùng
 * nhau trên màn hình chính là lúc scrollY === scrollY đã tính, đúng lúc trigger nổ ra.
 */
interface ResolvedPoint {
  /** scrollY tuyệt đối mà tại đó điều kiện trigger xảy ra — dùng để tính progress. */
  scrollY: number;
  /** Đặc tả vị trí phía viewport (base ratio + offset), dùng để vẽ marker fixed và
   *  tính lại đúng mỗi khi viewport đổi kích thước (resize/Safari visualViewport). */
  viewportSpec: EdgeSpec;
  /** Chuỗi gốc user truyền cho phần viewport (vd "bottom-=100") -> label marker viewport. */
  viewportLabel: string;
  /** Toạ độ tuyệt đối trên DOCUMENT của điểm tương ứng phía trigger (đã áp dụng đúng
   *  token + offset truyền vào, KHÔNG mặc định là top/bottom của trigger). */
  documentY: number;
  /** Chuỗi gốc user truyền cho phần trigger (vd "top+=100") -> label marker trigger. */
  triggerLabel: string;
}

/**
 * Lấy chiều cao viewport "thật" — ưu tiên visualViewport nếu có.
 *
 * Lý do (Safari fix): trên iOS Safari, khi thanh địa chỉ ẩn/hiện lúc cuộn,
 * `window.innerHeight` thay đổi nhưng KHÔNG phải lúc nào cũng bắn "resize" trên
 * window một cách đáng tin cậy. `window.visualViewport` phản ánh đúng & ổn định
 * hơn kích thước vùng nhìn thấy thực tế trên Safari/Chrome mobile.
 */
function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

/**
 * Đặc tả 1 vị trí cạnh (edge), tách làm 2 phần vì chúng "co giãn" khác nhau khi
 * dimension (chiều cao viewport/trigger) đổi:
 * - ratio: phần tỉ lệ theo dimension (0 = top, 0.5 = center, 1 = bottom, hoặc %) -> luôn
 *   phải nhân lại với dimension MỚI mỗi lần tính (đúng khi resize).
 * - offsetPx: phần cộng/trừ tuyệt đối tính bằng px (vd từ "+=100") -> CỐ ĐỊNH, không co
 *   giãn theo dimension.
 */
interface EdgeSpec {
  ratio: number;
  offsetPx: number;
}

function resolveEdgePx(spec: EdgeSpec, dimension: number): number {
  return spec.ratio * dimension + spec.offsetPx;
}

/**
 * Hỗ trợ toàn bộ cú pháp edge của GSAP cho 1 token riêng lẻ:
 *   "top" | "center" | "bottom"        - từ khoá cơ bản
 *   "20%"                              - phần trăm của dimension
 *   "100" | "100px"                    - px tuyệt đối từ mép trên (không kèm từ khoá)
 *   "bottom-=100" | "top+=100"         - từ khoá + offset px
 *   "center+=10%" | "50%-=20%"         - từ khoá/% + offset phần trăm (cùng co giãn theo dimension)
 * Trả về EdgeSpec để có thể tính lại đúng khi dimension (viewport/trigger) đổi kích thước.
 */
function parseEdgeSpec(token: string): EdgeSpec {
  const trimmed = token.trim();

  // Chỉ là 1 con số (không từ khoá, không +=/-=) -> px tuyệt đối tính từ mép trên.
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
  // base === "top" hoặc undefined (không truyền base, vd "+=100") -> ratio giữ nguyên 0

  let offsetPx = 0;
  if (op && numStr) {
    const num = parseFloat(numStr);
    const signed = op === "+=" ? num : -num;
    if (unit === "%") {
      // Offset dạng % co giãn theo CÙNG dimension với base -> cộng thẳng vào ratio.
      ratio += signed / 100;
    } else {
      offsetPx += signed;
    }
  }

  return { ratio, offsetPx };
}

/** Phân giải "trigger-edge viewport-edge" hoặc "+=N"/"-=N" thành ResolvedPoint đầy đủ. */
function resolvePoint(str: string, triggerEl: HTMLElement, relativeBase?: number): ResolvedPoint {
  const relMatch = str.match(/^([+-]=)(\d+(\.\d+)?)$/);

  if (relMatch) {
    if (relativeBase === undefined) {
      console.warn(`[six-js] onScroll: "${str}" has nothing to be relative to`);
      return { scrollY: 0, viewportSpec: { ratio: 0, offsetPx: 0 }, viewportLabel: str, documentY: 0, triggerLabel: str };
    }
    const sign = relMatch[1] === "+=" ? 1 : -1;
    const resolvedScrollY = relativeBase + sign * parseFloat(relMatch[2]);
    // Biểu thức tương đối không tham chiếu tới kích thước trigger -> quy ước ratio=0
    // (top), nên documentY tương ứng chính là resolvedScrollY (xem công thức ở đầu file).
    return {
      scrollY: resolvedScrollY,
      viewportSpec: { ratio: 0, offsetPx: 0 },
      viewportLabel: str,
      documentY: resolvedScrollY,
      triggerLabel: str,
    };
  }

  const [triggerToken = "top", viewportToken = "top"] = str.trim().split(/\s+/);

  const triggerSpec = parseEdgeSpec(triggerToken);
  const viewportSpec = parseEdgeSpec(viewportToken);

  const rect = triggerEl.getBoundingClientRect();
  const triggerTopAbs = window.scrollY + rect.top;
  const triggerPointAbs = triggerTopAbs + resolveEdgePx(triggerSpec, rect.height);
  const viewportOffset = resolveEdgePx(viewportSpec, getViewportHeight());

  return {
    scrollY: triggerPointAbs - viewportOffset,
    viewportSpec,
    viewportLabel: viewportToken,
    documentY: triggerPointAbs,
    triggerLabel: triggerToken,
  };
}

/** Dưới ngưỡng này (px từ mép trên viewport), label không đủ chỗ để hiện phía TRÊN
 *  đường kẻ nữa -> phải lật xuống phía DƯỚI đường kẻ để không bị khuất/ẩn. */
const LABEL_FLIP_THRESHOLD = 20;

/** Nếu 2 marker CÙNG NHÓM (viewport-viewport hoặc trigger-trigger) có vị trí lệch
 *  nhau dưới ngưỡng này, coi như "trùng nhau" -> phải xếp label thành 2 hàng thay vì
 *  chồng lên nhau che mất chữ. */
const LABEL_STACK_THRESHOLD = 24;

/** Khoảng cách (px) đẩy thêm cho label bị xếp hàng thứ 2 trở đi. */
const LABEL_ROW_HEIGHT = 20;

/** Cặp phần tử marker: đường kẻ + nhãn text, để có thể cập nhật cả vị trí lẫn nội dung độc lập. */
interface MarkerHandle {
  line: HTMLElement;
  label: HTMLElement;
}

type LabelAlign = "left" | "right";
type MarkerPosition = "fixed" | "absolute";

export class ScrollTriggerController {
  private triggerEl: HTMLElement;
  private playable: Playable;
  private options: OnScrollOptions;

  private startY = 0;
  private endY = 0;

  // Phía VIEWPORT của start/end (marker position: fixed)
  private startViewportSpec: EdgeSpec = { ratio: 0, offsetPx: 0 };
  private endViewportSpec: EdgeSpec = { ratio: 1, offsetPx: 0 };
  private startViewportLabel = "";
  private endViewportLabel = "";

  // Phía TRIGGER của start/end (marker position: absolute) — đúng theo token truyền
  // vào (top/center/bottom/%), KHÔNG mặc định neo cứng vào top/bottom của trigger.
  private startTriggerY = 0;
  private endTriggerY = 0;
  private startTriggerLabel = "";
  private endTriggerLabel = "";
  /** true nếu 2 marker trigger-side (start/end) trùng vị trí document -> phải xếp
   *  label thành 2 hàng. Chỉ đổi khi layout đổi (recalc()), không phụ thuộc scroll. */
  private triggerLabelsCollide = false;

  private smoothedProgress = 0;
  private wasInside = false;
  private lastScrollY = window.scrollY;
  private rafPending = false;

  private pinSpacer: HTMLElement | null = null;
  private pinned = false;
  private pinOriginalStyles: Partial<CSSStyleDeclaration> | null = null;

  private startMarker: MarkerHandle | null = null; // viewport-side của "start"
  private endMarker: MarkerHandle | null = null; // viewport-side của "end"
  private startTriggerMarker: MarkerHandle | null = null; // trigger-side của "start"
  private endTriggerMarker: MarkerHandle | null = null; // trigger-side của "end"

  private resizeObserver: ResizeObserver | null = null;
  private recalcRafPending = false;

  private onScrollBound = () => this.requestUpdate();
  private onResizeBound = () => this.recalc();
  private tickerBound = (_time: number, delta: number) => this.tickSmooth(delta);

  constructor(triggerEl: HTMLElement, playable: Playable, options: OnScrollOptions) {
    this.triggerEl = triggerEl;
    this.playable = playable;
    this.options = options;

    if (options.debug) {
      this.setupDebugMarkers();
    }

    this.recalc();

    window.addEventListener("scroll", this.onScrollBound, { passive: true });
    window.addEventListener("resize", this.onResizeBound);
    // Safari iOS: thanh địa chỉ ẩn/hiện đổi chiều cao viewport mà không luôn bắn "resize"
    // trên window — visualViewport bắn "resize" đáng tin cậy hơn cho trường hợp này.
    window.visualViewport?.addEventListener("resize", this.onResizeBound);
    this.setupResizeObserver();

    if (typeof options.sync === "number") {
      ticker.add(this.tickerBound);
    }

    this.update(); // xử lý ngay trạng thái ban đầu (trang load giữa chừng đã cuộn sẵn)
  }

  /**
   * Ngoài "resize" của window, kích thước trang có thể đổi vì lý do khác:
   * ảnh lazy-load xong, font load xong reflow, accordion mở/đóng, nội dung
   * dynamic được thêm/xoá... Các trường hợp này KHÔNG bắn ra event "resize".
   * Dùng ResizeObserver theo dõi <body> (đại diện chiều cao toàn trang) và
   * triggerEl (đại diện chiều cao riêng của phần tử trigger) để tự recalc().
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver(() => {
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
    const startStr = this.options.start ?? "top bottom";
    const endStr = this.options.end ?? "bottom top";

    const startResolved = resolvePoint(startStr, this.triggerEl);
    this.startY = startResolved.scrollY;
    this.startViewportSpec = startResolved.viewportSpec;
    this.startViewportLabel = startResolved.viewportLabel;
    this.startTriggerY = startResolved.documentY;
    this.startTriggerLabel = startResolved.triggerLabel;

    const endResolved = resolvePoint(endStr, this.triggerEl, this.startY);
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

    // 2 marker trigger-side (start/end) đứng yên theo document (không đổi khi cuộn),
    // nhưng label của chúng cần biết đang cách mép trên VIEWPORT bao nhiêu để tự lật
    // cho khỏi khuất. Đây chỉ là phép cộng trừ đơn giản (không đo lại DOM), nên tận
    // dụng luôn handler scroll đã có sẵn, không cần thêm vòng lặp render nào.
    this.updateTriggerMarkerLabelFlip(y);

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
    // Cặp "start": viewport-side (fixed, label bên trái) + trigger-side (absolute, label
    // bên phải) -> tách 2 bên để không đè lên nhau, kể cả khi trùng vị trí.
    this.startMarker = this.createMarkerLine({ color: "#4ade80", align: "left", position: "fixed" });
    this.startTriggerMarker = this.createMarkerLine({ color: "#4ade80", align: "right", position: "absolute" });

    // Cặp "end": cùng tông đỏ, cùng quy ước trái/phải.
    this.endMarker = this.createMarkerLine({ color: "#f87171", align: "left", position: "fixed" });
    this.endTriggerMarker = this.createMarkerLine({ color: "#f87171", align: "right", position: "absolute" });
  }

  /**
   * - startMarker/endMarker (viewport-side): position: fixed, neo theo TỈ LỆ VIEWPORT ->
   *   đứng yên trên màn hình khi cuộn (giống marker scroller của GSAP).
   * - startTriggerMarker/endTriggerMarker (trigger-side): position: absolute, neo theo
   *   TOẠ ĐỘ DOCUMENT của đúng điểm được truyền vào start/end (vd "center" -> giữa trigger,
   *   không mặc định là top/bottom) -> tự cuộn theo trang như phần tử absolute bình thường.
   *
   * Khi cuộn tới đúng scrollY đã tính, line viewport-side và trigger-side của cùng 1 cặp
   * sẽ trùng khít nhau trên màn hình — đó chính là lúc điều kiện start/end được kích hoạt.
   *
   * Cả 4 marker chỉ tính lại khi layout thật sự đổi (recalc(), không phải mỗi frame) —
   * không cần vòng lặp render riêng để "đuổi theo" transform của tween.
   *
   * will-change: transform giúp trình duyệt (đặc biệt Safari) composite marker trên riêng
   * 1 layer, tránh giật/lag khi cuộn quán tính (momentum scrolling).
   */
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

  /** Đặt label phía trên hoặc phía dưới đường kẻ. `stackIndex` > 0 dùng khi có marker
   *  khác cùng nhóm (viewport/trigger) trùng vị trí -> đẩy label ra xa thêm 1 "hàng"
   *  (LABEL_ROW_HEIGHT) theo đúng hướng above/below, để 2 label không đè lên nhau. */
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

  /**
   * Set vị trí (top, px) cho 1 marker, đồng thời tự lật label xuống dưới đường kẻ nếu
   * nó quá sát mép trên của VIEWPORT (không đủ chỗ hiện label phía trên -> label sẽ bị
   * tràn ra ngoài / khuất khỏi màn hình). So sánh luôn dùng vị trí trên-màn-hình thực tế
   * (kể cả marker absolute, vì lúc đó topPx đã được trừ theo scrollY tương ứng).
   *
   * `stackIndex` > 0 khi marker này va chạm vị trí với 1 marker khác cùng nhóm -> đẩy
   * label ra xa thêm để tránh chồng khít lên nhau che mất chữ (xem ảnh chụp bug thực tế).
   */
  private setMarkerPosition(marker: MarkerHandle, topPx: number, viewportRelativeTop: number, stackIndex = 0): void {
    marker.line.style.top = `${topPx}px`;
    this.applyLabelSide(marker.label, viewportRelativeTop < LABEL_FLIP_THRESHOLD ? "below" : "above", stackIndex);
  }

  /** Chỉ tính lại xem label của marker trigger-side (start/end) nên hiện trên hay dưới
   *  đường kẻ (dựa vào khoảng cách hiện tại tới mép trên viewport = docY - scrollY).
   *  KHÔNG đụng tới vị trí đường kẻ (vẫn đứng yên theo document, tính 1 lần ở recalc()). */
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
    // 2 marker viewport-side chỉ cần tính lại lúc resize (recalc()), nên so sánh va
    // chạm ngay tại đây là đủ, không cần lưu field riêng như phía trigger.
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
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    ticker.remove(this.tickerBound);
    this.unpinElement();
    this.removeDebugMarkers();
  }
}