export type MarqueeDirection = "left" | "right";

export class SxMarquee extends HTMLElement {
  private inner: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private setupRafId: number | null = null;

  private offset = 0;
  private lastTime = 0;
  private isHovered = false;
  private cachedResetBounds = 0;
  private dirtyBounds = true;
  private isSettingUp = false;

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

  get speed(): number {
    const v = parseFloat(this.getAttribute("speed") ?? "50");
    return isFinite(v) && v >= 0 ? v : 50;
  }

  get pauseOnHover(): boolean {
    return this.getAttribute("pause-on-hover") !== "false";
  }

  get gap(): string {
    const v = (this.getAttribute("gap") ?? "16").trim();
    return /^\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
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

    this.lastTime = performance.now();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.removeEventListener("mouseenter", this.onMouseEnter);
    this.removeEventListener("mouseleave", this.onMouseLeave);
    this.resizeObserver?.disconnect();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.setupRafId !== null) cancelAnimationFrame(this.setupRafId);
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
        this.dirtyBounds = true;
        this.scheduleSetup();
      }, 50);
    } else if (name === "direction" || name === "speed") {
      this.dirtyBounds = true;
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
    if (this.pauseOnHover) this.isHovered = true;
  };

  private onMouseLeave = () => {
    this.isHovered = false;
    this.lastTime = performance.now();
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
      this.dirtyBounds = true;
      this.lastTime = performance.now();
    } finally {
      this.isSettingUp = false;
    }
  }

  private getResetBounds(): number {
    if (!this.dirtyBounds) return this.cachedResetBounds;
    if (!this.inner) return 0;

    const originals = this.inner.querySelectorAll<HTMLElement>(
      "sx-marquee-item:not([data-clone])",
    );
    if (originals.length === 0) return 0;

    let total = 0;
    for (const item of originals) total += item.offsetWidth;

    const gap = parseFloat(getComputedStyle(this.inner).gap) || 0;
    total += gap * originals.length;

    this.cachedResetBounds = total;
    this.dirtyBounds = false;
    return total;
  }

  private startAnimation() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    const step = (now: number) => {
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      if (!this.isHovered) {
        const bounds = this.getResetBounds();
        if (bounds > 0) {
          const dist = this.speed * delta;
          if (this.direction === "left") {
            this.offset -= dist;
            if (this.offset <= -bounds) this.offset += bounds;
          } else {
            this.offset += dist;
            if (this.offset >= 0) this.offset -= bounds;
          }
          this.applyTransform(this.offset);
        }
      }

      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

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
