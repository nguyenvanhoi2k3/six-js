var m = Object.defineProperty;
var g = (a, o, e) => o in a ? m(a, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[o] = e;
var i = (a, o, e) => g(a, typeof o != "symbol" ? o + "" : o, e);
const b = "0.0.9", d = {
  "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
  "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
  "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
  linear: "linear",
  "expo-in": "cubic-bezier(0.7, 0, 0.84, 0)",
  "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
  "back-in": "cubic-bezier(0.36, 0, 0.66, -0.56)",
  "back-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "back-in-out": "cubic-bezier(0.68, -0.6, 0.32, 1.6)"
}, n = class n extends HTMLElement {
  constructor() {
    super(...arguments);
    i(this, "animation");
    i(this, "options");
    i(this, "order", n.counter++);
  }
  static get reduceMotion() {
    return this.mediaQuery.matches;
  }
  static scheduleGroup() {
    this.isProcessingGroup || !this.groupQueue.size || (this.isProcessingGroup = !0, requestAnimationFrame(() => {
      this.handleGroup([...this.groupQueue]), this.groupQueue.clear(), this.isProcessingGroup = !1;
    }));
  }
  static handleGroup(e) {
    e.sort((t, r) => t.order - r.order), e.forEach((t, r) => {
      t.play(r * 120);
    });
  }
  get isGroup() {
    return this.hasAttribute("group");
  }
  connectedCallback() {
    if (this.options = this.getOptions(), n.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), n.observer.observe(this);
  }
  disconnectedCallback() {
    var e;
    (e = this.animation) == null || e.cancel(), n.observer.unobserve(this), n.groupQueue.delete(this);
  }
  getOptions() {
    const e = Number(this.getAttribute("strength")) || 30, t = {
      fade: [0, 0],
      "fade-up": [0, e],
      "fade-down": [0, -e],
      "fade-left": [e, 0],
      "fade-right": [-e, 0]
    }, r = this.getAttribute("type") ?? "fade-up", s = this.getAttribute("easing"), [u, h] = t[r] ?? t["fade-up"];
    return {
      x: u,
      y: h,
      easing: s && s in d ? d[s] : d["ease-in-out"],
      duration: Number(this.getAttribute("duration")) || 400,
      delay: Number(this.getAttribute("delay")) || 0
    };
  }
  setInitialState() {
    const { x: e, y: t } = this.options;
    this.style.opacity = "0", this.style.transform = `translate3d(${e}px, ${t}px, 0)`;
  }
  play(e = 0) {
    var c;
    const { x: t, y: r, easing: s, duration: u, delay: h } = this.options;
    (c = this.animation) == null || c.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${t}px, ${r}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: u,
        delay: h + e,
        easing: s,
        fill: "forwards"
      }
    ), this.animation.onfinish = () => {
      var l;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (l = this.animation) == null || l.cancel(), this.animation = void 0;
    };
  }
};
i(n, "counter", 0), i(n, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), i(n, "groupQueue", /* @__PURE__ */ new Set()), i(n, "isProcessingGroup", !1), i(n, "observer", new IntersectionObserver(
  (e) => {
    for (const t of e) {
      if (t.intersectionRect.width * t.intersectionRect.height < 1)
        continue;
      const s = t.target;
      n.observer.unobserve(s), s.isGroup ? n.groupQueue.add(s) : s.play();
    }
    n.scheduleGroup();
  },
  {
    threshold: [0],
    rootMargin: "-1px 0px -1px 0px"
  }
));
let p = n;
customElements.define("sx-animate", p);
class y extends HTMLElement {
  constructor() {
    super();
    i(this, "inner", null);
    i(this, "resizeObserver", null);
    i(this, "rafId", null);
    i(this, "setupRafId", null);
    i(this, "offset", 0);
    i(this, "lastTime", 0);
    i(this, "isHovered", !1);
    i(this, "cachedResetBounds", 0);
    i(this, "dirtyBounds", !0);
    i(this, "isSettingUp", !1);
    i(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    i(this, "onMouseLeave", () => {
      this.isHovered = !1, this.lastTime = performance.now();
    });
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["direction", "speed", "pause-on-hover", "gap"];
  }
  get direction() {
    return this.getAttribute("direction") === "right" ? "right" : "left";
  }
  get speed() {
    const e = parseFloat(this.getAttribute("speed") ?? "50");
    return isFinite(e) && e >= 0 ? e : 50;
  }
  get pauseOnHover() {
    return this.getAttribute("pause-on-hover") !== "false";
  }
  get gap() {
    const e = (this.getAttribute("gap") ?? "16").trim();
    return /^\d+(\.\d+)?$/.test(e) ? `${e}px` : e;
  }
  connectedCallback() {
    if (this.render(), this.inner = this.querySelector("sx-marquee-inner"), !this.inner) {
      console.warn("sx-marquee: Missing <sx-marquee-inner> child.");
      return;
    }
    this.addEventListener("mouseenter", this.onMouseEnter), this.addEventListener("mouseleave", this.onMouseLeave), this.resizeObserver = new ResizeObserver(() => {
      this.scheduleSetup();
    }), this.resizeObserver.observe(this), this.lastTime = performance.now(), this.startAnimation();
  }
  disconnectedCallback() {
    var e;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (e = this.resizeObserver) == null || e.disconnect(), this.rafId !== null && cancelAnimationFrame(this.rafId), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId);
  }
  attributeChangedCallback(e, t, r) {
    t !== r && (e === "gap" ? (this.updateGapVar(), setTimeout(() => {
      this.dirtyBounds = !0, this.scheduleSetup();
    }, 50)) : (e === "direction" || e === "speed") && (this.dirtyBounds = !0, this.scheduleSetup()));
  }
  scheduleSetup() {
    this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), this.setupRafId = requestAnimationFrame(() => {
      this.setupRafId = null, this.setupMarquee();
    });
  }
  render() {
    this.shadowRoot && (this.shadowRoot.innerHTML = `
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
    `, this.updateGapVar());
  }
  updateGapVar() {
    this.style.setProperty("--sx-marquee-gap", this.gap);
  }
  setupMarquee() {
    var e;
    if (!(!this.inner || this.isSettingUp)) {
      this.isSettingUp = !0;
      try {
        (e = this.resizeObserver) == null || e.unobserve(this.inner);
        const t = Array.from(
          this.inner.querySelectorAll(
            "sx-marquee-item:not([data-clone])"
          )
        );
        this.inner.replaceChildren(...t);
        const r = this.offsetWidth, s = this.inner.offsetWidth;
        if (s > 0 && r > 0) {
          const u = s < r ? Math.ceil(r * 2 / s) : 2, h = document.createDocumentFragment();
          for (let c = 1; c < u; c++)
            for (const l of t) {
              const f = l.cloneNode(!0);
              f.setAttribute("data-clone", "true"), h.appendChild(f);
            }
          this.inner.appendChild(h);
        }
        this.offset = 0, this.applyTransform(0), this.dirtyBounds = !0, this.lastTime = performance.now();
      } finally {
        this.isSettingUp = !1;
      }
    }
  }
  getResetBounds() {
    if (!this.dirtyBounds) return this.cachedResetBounds;
    if (!this.inner) return 0;
    const e = this.inner.querySelectorAll(
      "sx-marquee-item:not([data-clone])"
    );
    if (e.length === 0) return 0;
    let t = 0;
    for (const s of e) t += s.offsetWidth;
    const r = parseFloat(getComputedStyle(this.inner).gap) || 0;
    return t += r * e.length, this.cachedResetBounds = t, this.dirtyBounds = !1, t;
  }
  startAnimation() {
    this.rafId !== null && cancelAnimationFrame(this.rafId);
    const e = (t) => {
      const r = (t - this.lastTime) / 1e3;
      if (this.lastTime = t, !this.isHovered) {
        const s = this.getResetBounds();
        if (s > 0) {
          const u = this.speed * r;
          this.direction === "left" ? (this.offset -= u, this.offset <= -s && (this.offset += s)) : (this.offset += u, this.offset >= 0 && (this.offset -= s)), this.applyTransform(this.offset);
        }
      }
      this.rafId = requestAnimationFrame(e);
    };
    this.rafId = requestAnimationFrame(e);
  }
  applyTransform(e) {
    this.inner && (this.inner.style.transform = `translate3d(${e}px,0,0)`);
  }
}
class v extends HTMLElement {
}
class x extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.define("sx-marquee", y);
customElements.define("sx-marquee-inner", v);
customElements.define("sx-marquee-item", x);
console.log(`@six-js/core v${b}`);
export {
  p as SxAnimate,
  y as SxMarquee,
  v as SxMarqueeInner,
  x as SxMarqueeItem
};
