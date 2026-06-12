var I = Object.defineProperty;
var k = (d, o, t) => o in d ? I(d, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : d[o] = t;
var r = (d, o, t) => k(d, typeof o != "symbol" ? o + "" : o, t);
const M = "0.0.13", b = {
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
}, g = class g extends HTMLElement {
  constructor() {
    super(...arguments);
    r(this, "animation");
    r(this, "options");
    r(this, "order", g.counter++);
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
    if (this.options = this.getOptions(), g.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), g.observer.observe(this);
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), g.observer.unobserve(this), g.groupQueue.delete(this);
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, e = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, s = this.getAttribute("type") ?? "fade-up", i = this.getAttribute("easing"), [n, a] = e[s] ?? e["fade-up"];
    return {
      x: n,
      y: a,
      easing: i && i in b ? b[i] : b["ease-in-out"],
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
    const { x: e, y: s, easing: i, duration: n, delay: a } = this.options;
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
        delay: a + t,
        easing: i,
        fill: "forwards"
      }
    ), this.animation.onfinish = () => {
      var l;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (l = this.animation) == null || l.cancel(), this.animation = void 0;
    };
  }
};
r(g, "counter", 0), r(g, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), r(g, "groupQueue", /* @__PURE__ */ new Set()), r(g, "isProcessingGroup", !1), r(g, "observer", new IntersectionObserver(
  (t) => {
    for (const e of t) {
      if (e.intersectionRect.width * e.intersectionRect.height < 1)
        continue;
      const i = e.target;
      g.observer.unobserve(i), i.isGroup ? g.groupQueue.add(i) : i.play();
    }
    g.scheduleGroup();
  },
  {
    threshold: [0],
    rootMargin: "-1px 0px -1px 0px"
  }
));
let C = g;
customElements.get("sx-animate") || customElements.define("sx-animate", C);
class E {
  constructor() {
    r(this, "_listeners", /* @__PURE__ */ new Set());
    r(this, "_time", 0);
    // seconds
    r(this, "_delta", 0);
    // ms
    r(this, "_frame", 0);
    r(this, "_start", this._now());
    r(this, "_last", this._start);
    r(this, "_lagThreshold", 500);
    r(this, "_adjustedLag", 33);
    r(this, "_gap", 1e3 / 240);
    r(this, "_nextTime", this._gap);
    r(this, "_id", null);
    r(this, "_tick", () => {
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
  _request(o) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(o) : setTimeout(o, 16);
  }
  _cancel(o) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(o);
      return;
    }
    clearTimeout(o);
  }
  _wake() {
    if (this._id !== null) return;
    const o = this._now();
    this._start = o - this._time * 1e3, this._last = o, this._tick();
  }
  add(o) {
    return this._listeners.add(o), this._wake(), o;
  }
  addOnce(o) {
    const t = (e, s, i) => {
      this.remove(t), o(e, s, i);
    };
    return this.add(t), t;
  }
  remove(o) {
    this._listeners.delete(o), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(o) {
    o = Math.max(1, o), this._gap = 1e3 / o, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(o = 500, t = 33) {
    this._lagThreshold = o || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(o = 60) {
    return this._delta / (1e3 / o);
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
const v = new E(), S = /* @__PURE__ */ new WeakMap();
let T = [], y = null;
function A(d, o) {
  T.push({ instance: d, type: o }), y === null && (y = requestAnimationFrame(P));
}
function P() {
  const d = T.slice();
  T.length = 0, y = null;
  for (let o = 0; o < d.length; o++) {
    const { instance: t, type: e } = d[o];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const w = new IntersectionObserver(
  (d) => {
    for (let o = 0; o < d.length; o++) {
      const t = d[o], e = S.get(t.target);
      e && (t.isIntersecting ? A(e, "enter") : A(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function R(d, o) {
  S.set(d, o), w.observe(d);
}
function _(d) {
  S.delete(d), w.unobserve(d);
}
class L extends HTMLElement {
  constructor() {
    super();
    r(this, "inner", null);
    r(this, "resizeObserver", null);
    r(this, "setupRafId", null);
    r(this, "offset", 0);
    r(this, "isHovered", !1);
    r(this, "cachedResetBounds", 0);
    r(this, "isSettingUp", !1);
    r(this, "isVisible", !1);
    r(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    r(this, "onMouseLeave", () => {
      this.isHovered = !1;
    });
    r(this, "updateAnimation", (t, e) => {
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
    }), this.resizeObserver.observe(this), R(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, v.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, v.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), _(this), v.remove(this.updateAnimation);
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
          const n = i < s ? Math.ceil(s * 2 / i) : 2, a = document.createDocumentFragment();
          for (let h = 1; h < n; h++)
            for (const l of e) {
              const u = l.cloneNode(!0);
              u.setAttribute("data-clone", "true"), a.appendChild(u);
            }
          this.inner.appendChild(a);
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
class W extends HTMLElement {
}
class B extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", L);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", W);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", B);
class F extends HTMLElement {
  constructor() {
    super();
    r(this, "sliderCha", null);
    r(this, "isDragging", !1);
    r(this, "startX", 0);
    r(this, "currentTranslate", 0);
    r(this, "prevTranslate", 0);
    r(this, "isResetting", !1);
    r(this, "dragXs", []);
    r(this, "dragTimes", []);
    r(this, "velocity", 0);
    r(this, "scrollAnimationFrameId", 0);
    r(this, "scrollDuration", 0);
    r(this, "scrollStartTime", 0);
    r(this, "scrollFrom", 0);
    r(this, "scrollToTarget", 0);
    r(this, "scrollFriction", 1);
    r(this, "isScrollAnimating", !1);
    r(this, "noConstrain", !1);
    r(this, "boundDragStart", this.dragStart.bind(this));
    r(this, "boundDragMove", this.dragMove.bind(this));
    r(this, "boundDragEnd", this.dragEnd.bind(this));
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
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.isResetting || (this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionX(t), this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant());
  }
  dragMove(t) {
    if (!this.isDragging || !this.sliderCha) return;
    t.cancelable && t.preventDefault();
    const e = this.getPositionX(t), s = performance.now();
    for (this.dragXs.push(e), this.dragTimes.push(s); this.dragTimes.length > 0 && s - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const i = e - this.startX;
    let n = this.prevTranslate + i;
    if (this.sliderCha.options.loop)
      this.currentTranslate = n, this.checkLoopBoundsInstant();
    else {
      const h = -this.sliderCha.getMaxTranslate(), l = this.sliderCha.options.edgeResistance;
      n > 0 ? n = l <= 0 ? 0 : 0 + Math.min(l, (n - 0) * 0.3) : n < h && (n = l <= 0 ? h : h - Math.min(l, (h - n) * 0.3)), this.currentTranslate = n;
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
        let a = i;
        if (t.autoWidth) {
          this.sliderCha.alignIndexToFreeTranslation(i);
          const h = this.sliderCha.getCurrentIndex();
          i = -this.sliderCha.getOffsetForIndex(h) + n;
        } else {
          const h = this.sliderCha.getSlideWidthWithGap();
          i = -(Math.round(
            (n - i) / h
          ) * h) + n;
        }
        if (!t.loop) {
          const h = -this.sliderCha.getMaxTranslate();
          a <= h && (i = h);
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const a = -this.sliderCha.getMaxTranslate(), h = Math.max(
          a,
          Math.min(0, i)
        );
        this.startMomentumScroll(h);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out`;
      const s = this.currentTranslate - this.prevTranslate;
      if (t.perMove === "auto") {
        const i = this.sliderCha.getCurrentIndex();
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.getCurrentIndex() === i ? s < -50 ? this.sliderCha.next() : s > 50 ? this.sliderCha.prev() : this.updatePosition() : this.updatePosition();
      } else
        s < -50 ? this.sliderCha.next() : s > 50 ? this.sliderCha.prev() : this.updatePosition();
      this.sliderCha.startAutoplay();
    }
  }
  startMomentumScroll(t, e, s, i = !1) {
    var a;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = i;
    const n = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(n / 1.5, 800), n < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (a = this.sliderCha) != null && a.options.loop && this.checkLoopBoundsInstant();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, this.runScrollLoop();
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), a = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += a, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const l = -this.sliderCha.getMaxTranslate();
      if ((this.currentTranslate > 0 || this.currentTranslate < l) && (this.scrollFriction *= 0.6, Math.abs(a) < 10)) {
        const c = this.currentTranslate > 0 ? 0 : l;
        this.startMomentumScroll(c, 600, void 0, !0);
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
    const a = -n + s, h = a - i;
    let l = !1, u = this.currentTranslate, c = 0, p = 0;
    if (this.currentTranslate > a ? (u = this.currentTranslate - i, c = -i, p = t, l = !0) : this.currentTranslate <= h && (u = this.currentTranslate + i, c = i, p = -t, l = !0), l) {
      if (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += c, this.scrollToTarget += c), this.setTransform(this.currentTranslate), this.sliderCha.options.autoWidth)
        this.sliderCha.setCurrentIndex(
          this.sliderCha.getCurrentIndex() + p
        );
      else {
        const f = this.sliderCha.getSlideWidthWithGap(), m = Math.round(
          Math.abs(this.currentTranslate - s) / f
        );
        this.sliderCha.setCurrentIndex(m);
      }
      this.isResetting = !1;
    }
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
    let n = s;
    if (e.autoWidth)
      n -= this.sliderCha.getOffsetForIndex(i);
    else {
      const a = this.sliderCha.getSlideWidthWithGap();
      n -= i * a;
    }
    if (!e.loop) {
      i === 0 && (n = 0);
      const a = -this.sliderCha.getMaxTranslate();
      n < a && (n = a), n > 0 && (n = 0);
    }
    if (this.currentTranslate = n, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const a = e.perView, h = this.sliderCha.originalSlidesCount;
      (i >= a + h || i < a) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", F);
class q extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", q);
class D {
  constructor() {
    r(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(o, t) {
    this.sliders.set(o, t);
  }
  unregister(o) {
    this.sliders.delete(o);
  }
  get(o) {
    return this.sliders.get(o);
  }
}
const x = new D();
class O extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const o = this.getAttribute("name");
    if (o) {
      const t = x.get(o);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", O);
class N extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const o = this.getAttribute("name");
    if (o) {
      const t = x.get(o);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", N);
class V extends HTMLElement {
  constructor() {
    super();
    r(this, "options");
    r(this, "currentIndex", 0);
    r(this, "track", null);
    r(this, "resizeObserver");
    r(this, "originalSlidesCount", 0);
    r(this, "autoplayTimer", null);
    r(this, "isFirstInit", !0);
    r(this, "lastContainerWidth", 0);
    r(this, "handleVisibilityChange", () => {
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
      "auto-height"
    ];
  }
  connectedCallback() {
    this.track = this.querySelector("sx-slider-track"), this.options.name && x.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      const t = this.getBoundingClientRect().width;
      t !== this.lastContainerWidth && (this.lastContainerWidth = t, this.updateLayout());
    }), this.resizeObserver.observe(this), this.track && this.initLoopClones(), document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay();
  }
  disconnectedCallback() {
    this.options.name && x.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (c) => c ? isNaN(Number(c)) ? c : `${c}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), n = i !== null ? Number(i) : 3e3, a = this.getAttribute("start-index"), h = a !== null ? Number(a) : 0, l = this.getAttribute("per-move");
    let u = "auto";
    if (l !== null && l !== "auto") {
      const c = Number(l);
      u = isNaN(c) ? "auto" : c;
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
      perMove: u,
      autoHeight: this.hasAttribute("auto-height")
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
      const a = e[e.length - 1 - i].cloneNode(!0);
      a.setAttribute("data-clone", "prev"), this.track.insertBefore(a, this.track.firstChild);
    }
    for (let i = 0; i < s; i++) {
      const a = e[i].cloneNode(!0);
      a.setAttribute("data-clone", "next"), this.track.appendChild(a);
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
      const p = Math.max(
        0,
        Math.min(this.options.startIndex, s - 1)
      );
      if (this.options.loop) {
        const f = this.options.autoWidth ? s : this.options.perView;
        this.currentIndex = f + p;
      } else
        this.currentIndex = p;
      this.isFirstInit = !1;
    }
    const i = this.getAttribute("left-padding"), n = this.getAttribute("right-padding"), a = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px";
    !this.options.autoWidth && this.options.perView === s && i && parseFloat(i) > 0 && n && parseFloat(n) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : (this.options.leftPadding = a(i), this.options.rightPadding = a(n));
    const h = this.getBoundingClientRect().width, l = this.convertToPx(this.options.gap), u = this.convertToPx(this.options.leftPadding), c = this.convertToPx(this.options.rightPadding);
    if (this.options.autoWidth)
      t.forEach((p) => {
        p.style.width = "max-content";
      }), this.track.offsetHeight, t.forEach((p) => {
        const f = p.firstElementChild;
        f ? p.style.width = `${f.getBoundingClientRect().width}px` : p.style.width = "max-content", p.style.marginRight = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const f = (h - u - c - l * (this.options.perView - 1)) / this.options.perView;
      t.forEach((m) => {
        m.style.width = `${f}px`, m.style.marginRight = this.options.gap;
      });
    }
    this.track.updatePosition(!0), this.updateSlideAttributes();
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
  // Đếm xem thực tế có bao nhiêu slide nhét vừa container
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect().width;
    let e = 0, s = 0;
    const i = this.convertToPx(this.options.gap), n = Array.from(this.track.children);
    for (let a = 0; a < n.length && (e += n[a].getBoundingClientRect().width + i, !(e - i > t)); a++)
      s++;
    return Math.max(1, s);
  }
  // Lấy chính xác tọa độ offset của một index bất kỳ (cộng dồn chiều rộng từng thẻ)
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
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoWidth ? this.originalSlidesCount : this.options.perView : 0;
    t.forEach((l, u) => {
      l.removeAttribute("sx-slide-active"), l.removeAttribute("sx-slide-prev"), l.removeAttribute("sx-slide-next");
      let c = u;
      e && (c = (u - i) % s, c < 0 && (c += s)), l.setAttribute("aria-label", `${c + 1}/${s}`);
    });
    const n = this.currentIndex, a = n - 1, h = n + 1;
    t[n] && t[n].setAttribute("sx-slide-active", ""), t[a] && t[a].setAttribute("sx-slide-prev", ""), t[h] && t[h].setAttribute("sx-slide-next", ""), this.updateAutoHeight();
  }
  updateAutoHeight() {
    if (!this.track) return;
    if (!this.options.autoHeight || this.options.perView !== 1) {
      this.style.height = "", this.style.transition = "", this.track.style.alignItems = "";
      return;
    }
    this.track.style.alignItems = "flex-start";
    const e = Array.from(this.track.children)[this.currentIndex];
    if (e) {
      const s = e.firstElementChild, i = s ? s.getBoundingClientRect().height : e.getBoundingClientRect().height;
      this.style.transition = `height ${this.options.speed}ms ease-out`, this.style.height = `${i}px`;
    }
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  // Quét chính xác index tối đa có thể cuộn tới mà không bị overscroll
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = -this.getMaxTranslate(), e = this.track.children.length;
    for (let s = 0; s < e; s++)
      if (-this.getOffsetForIndex(s) <= t)
        return s;
    return Math.max(0, e - 1);
  }
  // Trả về số lượng slide sẽ trượt cho mỗi lần next/prev
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
    const e = parseFloat(this.options.leftPadding) || 0, s = t - e;
    if (s > 0)
      this.currentIndex = 0;
    else {
      const i = Math.abs(s);
      if (this.options.autoWidth && this.track) {
        const n = Array.from(this.track.children), a = this.convertToPx(this.options.gap);
        let h = 0, l = 0;
        for (let u = 0; u < n.length; u++) {
          const c = n[u].getBoundingClientRect().width + a;
          if (h + c / 2 > i) {
            l = u;
            break;
          }
          h += c, l = u;
        }
        this.currentIndex = l;
      } else {
        const n = this.getSlideWidthWithGap();
        this.currentIndex = Math.round(i / n);
      }
    }
    if (!this.options.loop) {
      const i = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, i);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", V);
console.log(`@six-js/core v${M}`);
