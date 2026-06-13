var R = Object.defineProperty;
var P = (u, a, t) => a in u ? R(u, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[a] = t;
var o = (u, a, t) => P(u, typeof a != "symbol" ? a + "" : a, t);
const E = "0.0.13", C = {
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
}, b = class b extends HTMLElement {
  constructor() {
    super(...arguments);
    o(this, "animation");
    o(this, "options");
    o(this, "order", b.counter++);
  }
  static get reduceMotion() {
    return this.mediaQuery.matches;
  }
  static scheduleGroup() {
    this.isProcessingGroup || !this.groupQueue.size || (this.isProcessingGroup = !0, requestAnimationFrame(() => {
      this.handleGroup([...this.groupQueue]), this.groupQueue.clear(), this.isProcessingGroup = !1;
    }));
  }
  static handleGroup(t) {
    t.sort((e, s) => e.order - s.order), t.forEach((e, s) => {
      e.play(s * 120);
    });
  }
  get isGroup() {
    return this.hasAttribute("group");
  }
  connectedCallback() {
    if (this.options = this.getOptions(), b.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), b.observer.observe(this);
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), b.observer.unobserve(this), b.groupQueue.delete(this);
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, e = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, s = this.getAttribute("type") ?? "fade-up", i = this.getAttribute("easing"), [n, r] = e[s] ?? e["fade-up"];
    return {
      x: n,
      y: r,
      easing: i && i in C ? C[i] : C["ease-in-out"],
      duration: Number(this.getAttribute("duration")) || 400,
      delay: Number(this.getAttribute("delay")) || 0
    };
  }
  setInitialState() {
    const { x: t, y: e } = this.options;
    this.style.opacity = "0", this.style.transform = `translate3d(${t}px, ${e}px, 0)`;
  }
  play(t = 0) {
    var h;
    const { x: e, y: s, easing: i, duration: n, delay: r } = this.options;
    (h = this.animation) == null || h.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${e}px, ${s}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: n,
        delay: r + t,
        easing: i,
        fill: "forwards"
      }
    ), this.animation.onfinish = () => {
      var l;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (l = this.animation) == null || l.cancel(), this.animation = void 0;
    };
  }
};
o(b, "counter", 0), o(b, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), o(b, "groupQueue", /* @__PURE__ */ new Set()), o(b, "isProcessingGroup", !1), o(b, "observer", new IntersectionObserver(
  (t) => {
    for (const e of t) {
      if (e.intersectionRect.width * e.intersectionRect.height < 1)
        continue;
      const i = e.target;
      b.observer.unobserve(i), i.isGroup ? b.groupQueue.add(i) : i.play();
    }
    b.scheduleGroup();
  },
  {
    threshold: [0],
    rootMargin: "-1px 0px -1px 0px"
  }
));
let T = b;
customElements.get("sx-animate") || customElements.define("sx-animate", T);
class B {
  constructor() {
    o(this, "_listeners", /* @__PURE__ */ new Set());
    o(this, "_time", 0);
    // seconds
    o(this, "_delta", 0);
    // ms
    o(this, "_frame", 0);
    o(this, "_start", this._now());
    o(this, "_last", this._start);
    o(this, "_lagThreshold", 500);
    o(this, "_adjustedLag", 33);
    o(this, "_gap", 1e3 / 240);
    o(this, "_nextTime", this._gap);
    o(this, "_id", null);
    o(this, "_tick", () => {
      let t = this._now() - this._last;
      (t > this._lagThreshold || t < 0) && (this._start += t - this._adjustedLag), this._last += t;
      const e = this._last - this._start, s = e - this._nextTime;
      if (s > 0) {
        this._frame++, this._delta = e - this._time * 1e3, this._time = e / 1e3, this._nextTime += s >= this._gap ? s + 4 : this._gap;
        const i = [...this._listeners];
        for (const n of i)
          n(this._time, this._delta, this._frame);
      }
      if (this._listeners.size === 0) {
        this.sleep();
        return;
      }
      this._id = this._request(this._tick);
    });
  }
  _now() {
    return typeof performance < "u" ? performance.now() : Date.now();
  }
  _request(a) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(a) : setTimeout(a, 16);
  }
  _cancel(a) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(a);
      return;
    }
    clearTimeout(a);
  }
  _wake() {
    if (this._id !== null) return;
    const a = this._now();
    this._start = a - this._time * 1e3, this._last = a, this._tick();
  }
  add(a) {
    return this._listeners.add(a), this._wake(), a;
  }
  addOnce(a) {
    const t = (e, s, i) => {
      this.remove(t), a(e, s, i);
    };
    return this.add(t), t;
  }
  remove(a) {
    this._listeners.delete(a), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(a) {
    a = Math.max(1, a), this._gap = 1e3 / a, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(a = 500, t = 33) {
    this._lagThreshold = a || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(a = 60) {
    return this._delta / (1e3 / a);
  }
  get time() {
    return this._time;
  }
  get delta() {
    return this._delta;
  }
  get frame() {
    return this._frame;
  }
  get active() {
    return this._id !== null;
  }
  get listeners() {
    return this._listeners.size;
  }
}
const y = new B(), A = /* @__PURE__ */ new WeakMap();
let S = [], w = null;
function k(u, a) {
  S.push({ instance: u, type: a }), w === null && (w = requestAnimationFrame(L));
}
function L() {
  const u = S.slice();
  S.length = 0, w = null;
  for (let a = 0; a < u.length; a++) {
    const { instance: t, type: e } = u[a];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const M = new IntersectionObserver(
  (u) => {
    for (let a = 0; a < u.length; a++) {
      const t = u[a], e = A.get(t.target);
      e && (t.isIntersecting ? k(e, "enter") : k(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function F(u, a) {
  A.set(u, a), M.observe(u);
}
function _(u) {
  A.delete(u), M.unobserve(u);
}
class q extends HTMLElement {
  constructor() {
    super();
    o(this, "inner", null);
    o(this, "resizeObserver", null);
    o(this, "setupRafId", null);
    o(this, "offset", 0);
    o(this, "isHovered", !1);
    o(this, "cachedResetBounds", 0);
    o(this, "isSettingUp", !1);
    o(this, "isVisible", !1);
    o(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    o(this, "onMouseLeave", () => {
      this.isHovered = !1;
    });
    o(this, "updateAnimation", (t, e) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const s = e / 1e3, i = this.speed * s;
      this.direction === "left" ? (this.offset -= i, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = this.offsetWidth)) : (this.offset += i, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= this.offsetWidth && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
    });
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["direction", "speed", "pause-on-hover", "gap", "clone"];
  }
  get clone() {
    return this.getAttribute("clone") !== "false";
  }
  set clone(t) {
    this.setAttribute("clone", String(t));
  }
  get direction() {
    return this.getAttribute("direction") === "right" ? "right" : "left";
  }
  set direction(t) {
    this.setAttribute("direction", t);
  }
  get speed() {
    const t = parseFloat(this.getAttribute("speed") ?? "50");
    return isFinite(t) && t >= 0 ? t : 50;
  }
  set speed(t) {
    this.setAttribute("speed", String(t));
  }
  get pauseOnHover() {
    return this.getAttribute("pause-on-hover") !== "false";
  }
  set pauseOnHover(t) {
    this.setAttribute("pause-on-hover", String(t));
  }
  get gap() {
    const t = (this.getAttribute("gap") ?? "16").trim();
    return /^\d+(\.\d+)?$/.test(t) ? `${t}px` : t;
  }
  set gap(t) {
    this.setAttribute("gap", t);
  }
  connectedCallback() {
    if (this.render(), this.inner = this.querySelector("sx-marquee-inner"), !this.inner) {
      console.warn("sx-marquee: Missing <sx-marquee-inner> child.");
      return;
    }
    this.addEventListener("mouseenter", this.onMouseEnter), this.addEventListener("mouseleave", this.onMouseLeave), this.resizeObserver = new ResizeObserver(() => {
      this.scheduleSetup();
    }), this.resizeObserver.observe(this), F(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, y.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, y.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), _(this), y.remove(this.updateAnimation);
  }
  attributeChangedCallback(t, e, s) {
    e !== s && (t === "gap" ? (this.updateGapVar(), setTimeout(() => this.scheduleSetup(), 50)) : (t === "direction" || t === "speed" || t === "clone") && this.scheduleSetup());
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
    var t;
    if (!(!this.inner || this.isSettingUp)) {
      this.isSettingUp = !0;
      try {
        (t = this.resizeObserver) == null || t.unobserve(this.inner);
        const e = Array.from(
          this.inner.querySelectorAll(
            "sx-marquee-item:not([data-clone])"
          )
        );
        this.inner.replaceChildren(...e);
        const s = this.offsetWidth, i = this.inner.offsetWidth;
        if (this.clone && i > 0 && s > 0) {
          const n = i < s ? Math.ceil(s * 2 / i) : 2, r = document.createDocumentFragment();
          for (let h = 1; h < n; h++)
            for (const l of e) {
              const c = l.cloneNode(!0);
              c.setAttribute("data-clone", "true"), r.appendChild(c);
            }
          this.inner.appendChild(r);
        }
        this.offset = 0, this.applyTransform(0), this.calculateBounds();
      } finally {
        this.isSettingUp = !1;
      }
    }
  }
  calculateBounds() {
    if (!this.inner) {
      this.cachedResetBounds = 0;
      return;
    }
    const t = this.inner.querySelectorAll(
      "sx-marquee-item:not([data-clone])"
    );
    if (t.length === 0) {
      this.cachedResetBounds = 0;
      return;
    }
    let e = 0;
    for (let i = 0; i < t.length; i++)
      e += t[i].offsetWidth;
    const s = parseFloat(getComputedStyle(this.inner).gap) || 0;
    e += s * t.length, this.cachedResetBounds = e;
  }
  applyTransform(t) {
    this.inner && (this.inner.style.transform = `translate3d(${t}px,0,0)`);
  }
}
class O extends HTMLElement {
}
class N extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", q);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", O);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", N);
class D extends HTMLElement {
  constructor() {
    super();
    o(this, "sliderCha", null);
    o(this, "isDragging", !1);
    o(this, "startX", 0);
    o(this, "currentTranslate", 0);
    o(this, "prevTranslate", 0);
    o(this, "isResetting", !1);
    o(this, "dragXs", []);
    o(this, "dragTimes", []);
    o(this, "velocity", 0);
    o(this, "scrollAnimationFrameId", 0);
    o(this, "scrollDuration", 0);
    o(this, "scrollStartTime", 0);
    o(this, "scrollFrom", 0);
    o(this, "scrollToTarget", 0);
    o(this, "scrollFriction", 1);
    o(this, "isScrollAnimating", !1);
    o(this, "noConstrain", !1);
    o(this, "lastClientX", 0);
    o(this, "boundDragStart", this.dragStart.bind(this));
    o(this, "boundDragMove", this.dragMove.bind(this));
    o(this, "boundDragEnd", this.dragEnd.bind(this));
  }
  connectedCallback() {
    this.sliderCha = this.closest("sx-slider"), this.initDragEvents(), this.addEventListener("transitionend", () => {
      this.isResetting || this.checkLoopBoundsInstant();
    });
  }
  disconnectedCallback() {
    this.removeEventListener("mousedown", this.boundDragStart), window.removeEventListener("mousemove", this.boundDragMove), window.removeEventListener("mouseup", this.boundDragEnd), this.removeEventListener("touchstart", this.boundDragStart), window.removeEventListener("touchmove", this.boundDragMove), window.removeEventListener("touchend", this.boundDragEnd), this.cancelMomentumScroll();
  }
  initDragEvents() {
    this.addEventListener("mousedown", this.boundDragStart), window.addEventListener("mousemove", this.boundDragMove), window.addEventListener("mouseup", this.boundDragEnd), this.addEventListener("touchstart", this.boundDragStart, { passive: !0 }), window.addEventListener("touchmove", this.boundDragMove, {
      passive: !1
    }), window.addEventListener("touchend", this.boundDragEnd);
  }
  getPositionX(t) {
    return t instanceof MouseEvent ? t.clientX : t.touches[0].clientX;
  }
  dragStart(t) {
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.isResetting || (this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionX(t), this.lastClientX = this.startX, this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant());
  }
  dragMove(t) {
    if (!this.isDragging || !this.sliderCha) return;
    t.cancelable && t.preventDefault();
    const e = this.getPositionX(t);
    this.lastClientX = e;
    const s = performance.now();
    for (this.dragXs.push(e), this.dragTimes.push(s); this.dragTimes.length > 0 && s - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const i = e - this.startX;
    let n = this.prevTranslate + i;
    if (this.sliderCha.options.loop)
      this.currentTranslate = n, this.checkLoopBoundsInstant();
    else {
      const { max: r, min: h } = this.sliderCha.getBoundaries(), l = this.sliderCha.options.edgeResistance;
      n > r ? n = l <= 0 ? r : r + Math.min(l, (n - r) * 0.3) : n < h && (n = l <= 0 ? h : h - Math.min(l, (h - n) * 0.3)), this.currentTranslate = n;
    }
    this.setTransform(this.currentTranslate);
  }
  dragEnd() {
    if (!this.isDragging || !this.sliderCha) return;
    this.isDragging = !1;
    const t = this.sliderCha.options, e = performance.now();
    if (this.dragTimes.length > 0) {
      const s = this.dragTimes[this.dragTimes.length - 1];
      if (e - s > 10)
        this.velocity = 0;
      else {
        const i = s - this.dragTimes[0];
        i > 0 ? this.velocity = (this.dragXs[this.dragXs.length - 1] - this.dragXs[0]) / i : this.velocity = 0;
      }
    } else
      this.velocity = 0;
    if (t.drag === "free") {
      this.prevTranslate = this.currentTranslate;
      let i = this.currentTranslate + this.velocity * 600;
      if (t.snap) {
        const n = parseFloat(t.leftPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(i);
        const r = this.sliderCha.getCurrentIndex();
        let h = t.autoWidth ? this.sliderCha.getOffsetForIndex(r) : r * this.sliderCha.getSlideWidthWithGap(), l = t.autoWidth ? this.children[r].getBoundingClientRect().width + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideWidthWithGap();
        if (t.centered) {
          const c = this.sliderCha.getBoundingClientRect().width;
          i = n + c / 2 - (h + l / 2);
        } else
          i = n - h;
        if (!t.loop) {
          const { max: c, min: p } = this.sliderCha.getBoundaries();
          i = Math.max(p, Math.min(c, i));
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const { max: n, min: r } = this.sliderCha.getBoundaries(), h = Math.max(
          r,
          Math.min(n, i)
        );
        this.startMomentumScroll(h);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out`;
      const s = this.lastClientX - this.startX;
      if (t.perMove === "auto") {
        const i = this.sliderCha.getCurrentIndex();
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.getCurrentIndex() === i ? s < -50 ? this.sliderCha.next() : s > 50 ? this.sliderCha.prev() : this.updatePosition() : this.updatePosition();
      } else
        s < -50 ? this.sliderCha.next() : s > 50 ? this.sliderCha.prev() : this.updatePosition();
      this.sliderCha.startAutoplay();
    }
  }
  startMomentumScroll(t, e, s, i = !1) {
    var r;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = i;
    const n = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(n / 1.5, 800), n < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (r = this.sliderCha) != null && r.options.loop && this.checkLoopBoundsInstant();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, this.runScrollLoop();
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), r = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += r, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: h, min: l } = this.sliderCha.getBoundaries();
      if ((this.currentTranslate > h || this.currentTranslate < l) && (this.scrollFriction *= 0.6, Math.abs(r) < 10)) {
        const p = this.currentTranslate > h ? h : l;
        this.startMomentumScroll(p, 600, void 0, !0);
        return;
      }
    }
    s < 1 ? this.scrollAnimationFrameId = requestAnimationFrame(
      this.runScrollLoop.bind(this)
    ) : (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, this.scrollAnimationFrameId && (cancelAnimationFrame(this.scrollAnimationFrameId), this.scrollAnimationFrameId = 0);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoWidth ? t : this.sliderCha.options.perView, s = parseFloat(this.sliderCha.options.leftPadding) || 0;
    let i = 0, n = 0;
    if (this.sliderCha.options.autoWidth)
      n = this.sliderCha.getOffsetForIndex(e), i = this.sliderCha.getOffsetForIndex(e + t) - n;
    else {
      const f = this.sliderCha.getSlideWidthWithGap();
      n = e * f, i = t * f;
    }
    let r = 0;
    if (this.sliderCha.options.centered) {
      const f = this.sliderCha.getBoundingClientRect().width;
      let x = 0;
      if (this.sliderCha.options.autoWidth) {
        const W = this.sliderCha.convertToPx(this.sliderCha.options.gap), I = this.children[e];
        x = I ? I.getBoundingClientRect().width + W : 0;
      } else
        x = this.sliderCha.getSlideWidthWithGap();
      r = f / 2 - x / 2;
    }
    const h = -n + s + r, l = h - i;
    let c = !1, p = this.currentTranslate, m = 0, g = 0;
    const d = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > h + d ? (p = this.currentTranslate - i, m = -i, g = t, c = !0) : this.currentTranslate <= l - d && (p = this.currentTranslate + i, m = i, g = -t, c = !0), c && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = p, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += m, this.scrollToTarget += m), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + g
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.style.transform = `translateX(${t}px)`;
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const e = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${e.speed}ms ease-out`;
    const s = parseFloat(e.leftPadding) || 0, i = this.sliderCha.getCurrentIndex();
    let n = s, r = 0, h = 0;
    if (e.autoWidth) {
      r = this.sliderCha.getOffsetForIndex(i);
      const l = Array.from(this.children), c = this.sliderCha.convertToPx(e.gap);
      h = l[i] ? l[i].getBoundingClientRect().width + c : 0;
    } else {
      const l = this.sliderCha.getSlideWidthWithGap();
      r = i * l, h = l;
    }
    if (e.centered) {
      const l = this.sliderCha.getBoundingClientRect().width;
      n += l / 2 - (r + h / 2);
    } else
      n -= r;
    if (!e.loop) {
      const { max: l, min: c } = this.sliderCha.getBoundaries();
      n = Math.max(c, Math.min(l, n));
    }
    if (this.currentTranslate = n, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const l = e.perView, c = this.sliderCha.originalSlidesCount;
      (i >= l + c || i < l) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", D);
class H extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", H);
class V {
  constructor() {
    o(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(a, t) {
    this.sliders.set(a, t);
  }
  unregister(a) {
    this.sliders.delete(a);
  }
  get(a) {
    return this.sliders.get(a);
  }
}
const v = new V();
class G extends HTMLElement {
  constructor() {
    super();
    o(this, "options");
    o(this, "currentIndex", 0);
    o(this, "track", null);
    o(this, "resizeObserver");
    o(this, "originalSlidesCount", 0);
    o(this, "autoplayTimer", null);
    o(this, "isFirstInit", !0);
    o(this, "lastContainerWidth", 0);
    o(this, "isFirstHeightMeasure", !0);
    o(this, "handleVisibilityChange", () => {
      document.hidden ? this.stopAutoplay() : this.options.autoplay && this.startAutoplay();
    });
    this.parseOptions();
  }
  static get observedAttributes() {
    return [
      "name",
      "per-view",
      "gap",
      "drag",
      "speed",
      "right-padding",
      "left-padding",
      "rewind",
      "edge-resistance",
      "loop",
      "grab-cursor",
      "snap",
      "autoplay",
      "interval",
      "start-index",
      "auto-width",
      "per-move",
      "auto-height",
      "centered",
      "auto-centered",
      "center-if-short"
    ];
  }
  connectedCallback() {
    this.track = this.querySelector("sx-slider-track"), this.options.name && v.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      const t = this.getBoundingClientRect().width;
      t !== this.lastContainerWidth && (this.lastContainerWidth = t, this.updateLayout());
    }), this.resizeObserver.observe(this), this.track && this.initLoopClones(), document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay();
  }
  disconnectedCallback() {
    this.options.name && v.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), n = i !== null ? Number(i) : 3e3, r = this.getAttribute("start-index"), h = r !== null ? Number(r) : 0, l = this.getAttribute("per-move");
    let c = "auto";
    if (l !== null && l !== "auto") {
      const p = Number(l);
      c = isNaN(p) ? "auto" : p;
    }
    this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: t(this.getAttribute("gap")),
      drag: this.getAttribute("drag") || "true",
      speed: Number(this.getAttribute("speed")) || 300,
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(s) ? 0 : s,
      loop: this.hasAttribute("loop"),
      grabCursor: this.hasAttribute("grab-cursor"),
      snap: this.hasAttribute("snap"),
      autoplay: this.hasAttribute("autoplay"),
      interval: isNaN(n) ? 3e3 : n,
      startIndex: isNaN(h) ? 0 : h,
      autoWidth: this.hasAttribute("auto-width"),
      perMove: c,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short")
    };
  }
  startAutoplay() {
    this.stopAutoplay(), this.options.autoplay && this.options.interval > 0 && (this.autoplayTimer = window.setInterval(() => {
      this.next();
    }, this.options.interval));
  }
  stopAutoplay() {
    this.autoplayTimer !== null && (clearInterval(this.autoplayTimer), this.autoplayTimer = null);
  }
  initLoopClones() {
    if (!this.track || !this.options.loop) return;
    this.track.querySelectorAll("[data-clone]").forEach((i) => i.remove());
    const e = Array.from(this.track.children);
    if (this.originalSlidesCount = e.length, this.originalSlidesCount === 0) return;
    const s = this.options.autoWidth ? this.originalSlidesCount : this.options.perView;
    for (let i = 0; i < s; i++) {
      const r = e[e.length - 1 - i].cloneNode(!0);
      r.setAttribute("data-clone", "prev"), this.track.insertBefore(r, this.track.firstChild);
    }
    for (let i = 0; i < s; i++) {
      const r = e[i].cloneNode(!0);
      r.setAttribute("data-clone", "next"), this.track.appendChild(r);
    }
  }
  updateLayout() {
    if (!this.track) return;
    this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor");
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    this.options.loop && this.originalSlidesCount === 0 && this.initLoopClones();
    const e = this.track.querySelectorAll("[data-clone]").length, s = t.length - e;
    if (this.isFirstInit && s > 0) {
      const d = Math.max(
        0,
        Math.min(this.options.startIndex, s - 1)
      );
      if (this.options.loop) {
        const f = this.options.autoWidth ? s : this.options.perView;
        this.currentIndex = f + d;
      } else
        this.currentIndex = d;
      this.isFirstInit = !1;
    }
    const i = this.getAttribute("left-padding"), n = this.getAttribute("right-padding"), r = (d) => d ? isNaN(Number(d)) ? d : `${d}px` : "0px";
    !this.options.autoWidth && this.options.perView === s && i && parseFloat(i) > 0 && n && parseFloat(n) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : (this.options.leftPadding = r(i), this.options.rightPadding = r(n));
    const h = this.getBoundingClientRect().width, l = this.convertToPx(this.options.gap), c = this.convertToPx(this.options.leftPadding), p = this.convertToPx(this.options.rightPadding);
    if (this.options.autoWidth)
      t.forEach((d) => {
        d.style.width = "max-content";
      }), this.track.offsetHeight, t.forEach((d) => {
        const f = d.firstElementChild;
        f ? d.style.width = `${f.getBoundingClientRect().width}px` : d.style.width = "max-content", d.style.marginRight = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const f = (h - c - p - l * (this.options.perView - 1)) / this.options.perView;
      t.forEach((x) => {
        x.style.width = `${f}px`, x.style.marginRight = this.options.gap;
      });
    }
    let m = !1;
    const g = t.filter((d) => !d.hasAttribute("data-clone"));
    if (this.options.autoWidth) {
      let d = 0;
      g.forEach((f) => {
        d += f.getBoundingClientRect().width + l;
      }), d -= l, m = d < h;
    } else
      m = s < this.options.perView;
    this.options.centerIfShort && m ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((f) => f.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    const e = document.createElement("div");
    e.style.display = "none", e.style.width = t, document.body.appendChild(e);
    const s = parseFloat(getComputedStyle(e).width);
    return document.body.removeChild(e), s || 0;
  }
  getSlideWidthWithGap() {
    return !this.track || this.track.children.length === 0 ? 0 : this.track.children[0].getBoundingClientRect().width + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect().width;
    let e = 0, s = 0;
    const i = this.convertToPx(this.options.gap), n = Array.from(this.track.children);
    for (let r = 0; r < n.length && (e += n[r].getBoundingClientRect().width + i, !(e - i > t)); r++)
      s++;
    return Math.max(1, s);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const e = Array.from(this.track.children), s = this.convertToPx(this.options.gap);
    let i = 0;
    for (let n = 0; n < t; n++)
      e[n] && (i += e[n].getBoundingClientRect().width + s);
    return i;
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect().width;
    let e = 0;
    if (this.options.autoWidth)
      e = this.getOffsetForIndex(this.track.children.length), e -= this.convertToPx(this.options.gap);
    else {
      const s = this.track.children.length;
      e = this.getSlideWidthWithGap() * s - this.convertToPx(this.options.gap);
    }
    return Math.max(0, e - t);
  }
  // Trả về ranh giới trượt chính xác dựa trên cấu hình centered / auto-centered
  getBoundaries() {
    var h, l;
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect().width, e = parseFloat(this.options.leftPadding) || 0, s = this.convertToPx(this.options.gap), i = this.track.children.length;
    let n = 0, r = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let c = this.options.autoWidth ? (((h = this.track.children[0]) == null ? void 0 : h.getBoundingClientRect().width) || 0) + s : this.getSlideWidthWithGap();
      n = e + t / 2 - c / 2;
      let p = i - 1, m = this.options.autoWidth ? this.getOffsetForIndex(p) : p * this.getSlideWidthWithGap(), g = this.options.autoWidth ? (((l = this.track.children[p]) == null ? void 0 : l.getBoundingClientRect().width) || 0) + s : this.getSlideWidthWithGap();
      r = e + t / 2 - (m + g / 2);
    }
    return { max: n, min: Math.min(n, r) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoWidth ? this.originalSlidesCount : this.options.perView : 0, n = (d) => {
      if (!e) return d;
      let f = (d - i) % s;
      return f < 0 && (f += s), f;
    }, r = this.options.centered ? 0 : Math.floor(this.options.perView / 2), h = n(this.currentIndex), l = n(this.currentIndex - 1), c = n(this.currentIndex + 1), p = n(this.currentIndex + r), m = this.isFirstHeightMeasure;
    m && (this.isFirstHeightMeasure = !1);
    let g = null;
    m && (g = document.createElement("style"), g.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(g), this.offsetHeight), t.forEach((d, f) => {
      d.removeAttribute("sx-slide-active"), d.removeAttribute("sx-slide-prev"), d.removeAttribute("sx-slide-next"), d.removeAttribute("sx-slide-center");
      let x = n(f);
      d.setAttribute("aria-label", `${x + 1}/${s}`), x === h && d.setAttribute("sx-slide-active", ""), x === l && d.setAttribute("sx-slide-prev", ""), x === c && d.setAttribute("sx-slide-next", ""), x === p && d.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), m && g && requestAnimationFrame(() => {
      g == null || g.remove();
    });
  }
  updateAutoHeight() {
    if (!this.track) return;
    if (!this.options.autoHeight) {
      this.style.height = "", this.style.transition = "", this.track.style.alignItems = "";
      return;
    }
    this.track.style.alignItems = "flex-start";
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    let e = 0;
    const s = this.options.perView;
    for (let i = 0; i < s; i++) {
      const n = this.currentIndex + i, r = t[n];
      if (r) {
        const h = r.cloneNode(!0);
        h.style.position = "absolute", h.style.visibility = "hidden", h.style.pointerEvents = "none", h.style.transition = "none", h.style.width = `${r.getBoundingClientRect().width}px`;
        const l = h.firstElementChild;
        l && (l.style.transition = "none"), this.track.appendChild(h);
        const c = l ? l.getBoundingClientRect().height : h.getBoundingClientRect().height;
        c > e && (e = c), this.track.removeChild(h);
      }
    }
    e > 0 && (this.style.transition = `height ${this.options.speed}ms ease-out`, this.style.height = `${e}px`);
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: e } = this.getBoundaries();
    for (let s = 0; s < t; s++) {
      let i = this.options.autoWidth ? this.getOffsetForIndex(s) : s * this.getSlideWidthWithGap(), n = this.options.autoWidth ? this.track.children[s].getBoundingClientRect().width + this.convertToPx(this.options.gap) : this.getSlideWidthWithGap(), r = parseFloat(this.options.leftPadding) || 0;
      if (this.options.centered) {
        const h = this.getBoundingClientRect().width;
        r += h / 2 - (i + n / 2);
      } else
        r -= i;
      if (r <= e + 1)
        return s;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    if (this.options.perMove === "auto")
      return 1;
    const t = this.getVisibleSlidesCount();
    let e = Math.max(1, this.options.perMove);
    return Math.min(e, t);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove();
    if (this.options.loop)
      this.currentIndex += t, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const e = this.getRealMaxIndex();
      this.currentIndex < e ? this.currentIndex = Math.min(e, this.currentIndex + t) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove();
    this.options.loop ? (this.currentIndex -= t, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - t) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  alignIndexToFreeTranslation(t) {
    if (!this.track) return;
    const e = parseFloat(this.options.leftPadding) || 0, s = this.getBoundingClientRect().width, i = Array.from(this.track.children), n = this.convertToPx(this.options.gap);
    let r = 0, h = 1 / 0;
    const l = this.currentIndex;
    for (let c = 0; c < i.length; c++) {
      let p = 0, m = 0;
      if (this.options.autoWidth)
        p = this.getOffsetForIndex(c), m = i[c].getBoundingClientRect().width + n;
      else {
        const f = this.getSlideWidthWithGap();
        p = c * f, m = f;
      }
      let g = e;
      if (this.options.centered ? g += s / 2 - (p + m / 2) : g -= p, !this.options.loop) {
        const { max: f, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? g = Math.max(
          x,
          Math.min(f, g)
        ) : this.options.centered || (c === 0 && (g = 0), g < x && (g = x), g > 0 && (g = 0));
      }
      const d = Math.abs(t - g);
      d < h - 0.5 ? (h = d, r = c) : Math.abs(d - h) <= 0.5 && Math.abs(c - l) < Math.abs(r - l) && (r = c, h = d);
    }
    if (this.currentIndex = r, !this.options.loop) {
      const c = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, c);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", G);
class X extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const a = this.getAttribute("name");
    if (a) {
      const t = v.get(a);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", X);
class z extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const a = this.getAttribute("name");
    if (a) {
      const t = v.get(a);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", z);
console.log(`@six-js/core v${E}`);
