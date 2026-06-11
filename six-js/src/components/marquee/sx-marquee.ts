import { ticker } from "../../core/ticker";
import { observe, unobserve } from "../../core/observer";

export type MarqueeDirection = "left" | "right";

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
    return ["direction", "speed", "pause-on-hover", "gap"];
  }

  get direction(): MarqueeDirection {
    return this.getAttribute("direction") === "right" ? "right" : "left";
  }
  set direction(val: MarqueeDirection) {
    this.setAttribute("direction", val);
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
      setTimeout(() => {
        this.scheduleSetup();
      }, 50);
    } else if (name === "direction" || name === "speed") {
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
    this.isHovered = false;
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
        .container {
          display: flex;
          overflow: hidden;
        }
        ::slotted(sx-marquee-inner) {
          display: flex !important;
          flex-shrink: 0;
          white-space: nowrap;
          gap: var(--sx-marquee-gap) !important;
          will-change: transform;
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

      const containerW = this.offsetWidth;
      const contentW = this.inner.offsetWidth;

      if (contentW > 0 && containerW > 0) {
        const clonesNeeded =
          contentW < containerW ? Math.ceil((containerW * 2) / contentW) : 2;

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
    for (let i = 0; i < originals.length; i++) {
      total += originals[i].offsetWidth;
    }

    const gap = parseFloat(getComputedStyle(this.inner).gap) || 0;
    total += gap * originals.length;

    this.cachedResetBounds = total;
  }

  private updateAnimation = (_time: number, deltaMs: number) => {
    if (this.isHovered || this.cachedResetBounds <= 0) return;

    const deltaSec = deltaMs / 1000;
    const dist = this.speed * deltaSec;

    if (this.direction === "left") {
      this.offset -= dist;
      if (this.offset <= -this.cachedResetBounds) {
        this.offset += this.cachedResetBounds;
      }
    } else {
      this.offset += dist;
      if (this.offset >= 0) {
        this.offset -= this.cachedResetBounds;
      }
    }

    this.applyTransform(this.offset);
  };

  private applyTransform(x: number) {
    if (this.inner) {
      this.inner.style.transform = `translate3d(${x}px,0,0)`;
    }
  }
}

export class SxMarqueeInner extends HTMLElement {}

export class SxMarqueeItem extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}

customElements.define("sx-marquee", SxMarquee);
customElements.define("sx-marquee-inner", SxMarqueeInner);
customElements.define("sx-marquee-item", SxMarqueeItem);
