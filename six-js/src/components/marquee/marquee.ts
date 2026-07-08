// six-js\src\components\marquee\marquee.ts
import { ticker } from "../../core/ticker";
import { observe, unobserve } from "../../core/observer";

export type MarqueeDirection = "left" | "right" | "up" | "down";

export class SxMarquee extends HTMLElement {
  private inner: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private setupRafId: number | null = null;

  private offset = 0;
  private isHovered = false;
  private cachedResetBounds = 0;
  private isSettingUp = false;
  private isVisible = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["direction", "speed", "pause-on-hover", "gap", "clone"];
  }

  get clone(): boolean {
    return this.getAttribute("clone") !== "false";
  }
  set clone(val: boolean | string) {
    this.setAttribute("clone", String(val));
  }

  get direction(): MarqueeDirection {
    const dir = this.getAttribute("direction");
    if (dir === "right" || dir === "up" || dir === "down") return dir;
    return "left";
  }
  set direction(val: MarqueeDirection) {
    this.setAttribute("direction", val);
  }

  // Tiện ích kiểm tra nhanh xem có phải đang cuộn dọc hay không
  private get isVertical(): boolean {
    const dir = this.direction;
    return dir === "up" || dir === "down";
  }

  get speed(): number {
    const v = parseFloat(this.getAttribute("speed") ?? "50");
    return isFinite(v) && v >= 0 ? v : 50;
  }
  set speed(val: number) {
    this.setAttribute("speed", String(val));
  }

  get pauseOnHover(): boolean {
    return this.getAttribute("pause-on-hover") !== "false";
  }
  set pauseOnHover(val: boolean | string) {
    this.setAttribute("pause-on-hover", String(val));
  }

  get gap(): string {
    const v = (this.getAttribute("gap") ?? "16").trim();
    return /^\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
  }
  set gap(val: string) {
    this.setAttribute("gap", val);
  }

  connectedCallback() {
    this.render();
    this.inner = this.querySelector("sx-marquee-inner");

    if (!this.inner) {
      console.warn("sx-marquee: Missing <sx-marquee-inner> child.");
      return;
    }

    this.addEventListener("mouseenter", this.onMouseEnter);
    this.addEventListener("mouseleave", this.onMouseLeave);

    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleSetup();
    });
    this.resizeObserver.observe(this);

    observe(this, {
      enter: () => {
        if (!this.isVisible) {
          this.isVisible = true;
          ticker.add(this.updateAnimation);
        }
      },
      leave: () => {
        if (this.isVisible) {
          this.isVisible = false;
          ticker.remove(this.updateAnimation);
        }
      },
    });
  }

  disconnectedCallback() {
    this.removeEventListener("mouseenter", this.onMouseEnter);
    this.removeEventListener("mouseleave", this.onMouseLeave);
    this.resizeObserver?.disconnect();
    if (this.setupRafId !== null) cancelAnimationFrame(this.setupRafId);

    unobserve(this);
    ticker.remove(this.updateAnimation);
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (oldVal === newVal) return;

    if (name === "gap") {
      this.updateGapVar();
      setTimeout(() => this.scheduleSetup(), 50);
    } else if (name === "direction" || name === "speed" || name === "clone") {
      this.scheduleSetup();
    }
  }

  private scheduleSetup() {
    if (this.setupRafId !== null) cancelAnimationFrame(this.setupRafId);
    this.setupRafId = requestAnimationFrame(() => {
      this.setupRafId = null;
      this.setupMarquee();
    });
  }

  private onMouseEnter = () => {
    if (this.pauseOnHover) {
      this.isHovered = true;
    }
  };

  private onMouseLeave = () => {
    if (this.isHovered) {
      this.isHovered = false;
    }
  };

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
          width: 100%;
          --sx-marquee-gap: 16px;
        }
        /* Khi cuộn dọc, sx-marquee cần có một chiều cao cố định kế thừa từ lớp cha */
        :host([direction="up"]), :host([direction="down"]) {
          height: 100%;
        }
        .container {
          display: flex;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        :host([direction="up"]) .container, 
        :host([direction="down"]) .container {
          flex-direction: column;
        }
        ::slotted(sx-marquee-inner) {
          display: flex !important;
          flex-shrink: 0;
          white-space: nowrap;
          gap: var(--sx-marquee-gap) !important;
          will-change: transform;
        }
        :host([direction="up"]) ::slotted(sx-marquee-inner), 
        :host([direction="down"]) ::slotted(sx-marquee-inner) {
          flex-direction: column !important;
          white-space: normal;
        }
      </style>
      <div class="container"><slot></slot></div>
    `;
    this.updateGapVar();
  }

  private updateGapVar() {
    this.style.setProperty("--sx-marquee-gap", this.gap);
  }

  private setupMarquee() {
    if (!this.inner || this.isSettingUp) return;
    this.isSettingUp = true;

    try {
      this.resizeObserver?.unobserve(this.inner);

      const originals = Array.from(
        this.inner.querySelectorAll<HTMLElement>(
          "sx-marquee-item:not([data-clone])",
        ),
      );

      this.inner.replaceChildren(...originals);

      const isVert = this.isVertical;
      // Đo đạc kích thước linh hoạt dựa vào trục cuộn
      const containerSize = isVert ? this.offsetHeight : this.offsetWidth;
      const contentSize = isVert ? this.inner.offsetHeight : this.inner.offsetWidth;

      if (this.clone && contentSize > 0 && containerSize > 0) {
        const clonesNeeded =
          contentSize < containerSize ? Math.ceil((containerSize * 2) / contentSize) : 2;

        const fragment = document.createDocumentFragment();
        for (let i = 1; i < clonesNeeded; i++) {
          for (const item of originals) {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.setAttribute("data-clone", "true");
            fragment.appendChild(clone);
          }
        }
        this.inner.appendChild(fragment);
      }

      this.offset = 0;
      this.applyTransform(0);

      this.calculateBounds();
    } finally {
      this.isSettingUp = false;
    }
  }

  private calculateBounds() {
    if (!this.inner) {
      this.cachedResetBounds = 0;
      return;
    }
    const originals = this.inner.querySelectorAll<HTMLElement>(
      "sx-marquee-item:not([data-clone])",
    );
    if (originals.length === 0) {
      this.cachedResetBounds = 0;
      return;
    }

    let total = 0;
    const isVert = this.isVertical;
    for (let i = 0; i < originals.length; i++) {
      // Đổi hàm đo đạc kích thước theo trục dọc/ngang
      total += isVert ? originals[i].offsetHeight : originals[i].offsetWidth;
    }

    const gap = parseFloat(getComputedStyle(this.inner).gap) || 0;
    total += gap * originals.length;

    this.cachedResetBounds = total;
  }

  private updateAnimation = (_time: number, deltaMs: number) => {
    if (this.isHovered || this.cachedResetBounds <= 0) return;

    const deltaSec = deltaMs / 1000;
    const dist = this.speed * deltaSec;
    
    const dir = this.direction;
    const isVert = this.isVertical;
    const containerSize = isVert ? this.offsetHeight : this.offsetWidth;

    // Hướng "up" giảm offset giống hệt "left"
    if (dir === "left" || dir === "up") {
      this.offset -= dist;

      if (this.clone) {
        if (this.offset <= -this.cachedResetBounds) {
          this.offset += this.cachedResetBounds;
        }
      } else {
        if (this.offset <= -this.cachedResetBounds) {
          this.offset = containerSize;
        }
      }
    } 
    // Hướng "down" tăng offset giống hệt "right"
    else {
      this.offset += dist;

      if (this.clone) {
        if (this.offset >= 0) {
          this.offset -= this.cachedResetBounds;
        }
      } else {
        if (this.offset >= containerSize) {
          this.offset = -this.cachedResetBounds;
        }
      }
    }

    this.applyTransform(this.offset);
  };

  private applyTransform(val: number) {
    if (this.inner) {
      if (this.isVertical) {
        // Cuộn dọc: dùng trục Y
        this.inner.style.transform = `translate3d(0,${val}px,0)`;
      } else {
        // Cuộn ngang: dùng trục X
        this.inner.style.transform = `translate3d(${val}px,0,0)`;
      }
    }
  }
}

export class SxMarqueeInner extends HTMLElement {}

export class SxMarqueeItem extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
