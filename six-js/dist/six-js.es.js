var R = Object.defineProperty;
var P = (u, o, t) => o in u ? R(u, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[o] = t;
var n = (u, o, t) => P(u, typeof o != "symbol" ? o + "" : o, t);
const E = "0.0.13", b = {
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
}, S = class S extends HTMLElement {
  constructor() {
    super(...arguments);
    n(this, "animation");
    n(this, "options");
    n(this, "order", S.counter++);
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
    if (this.options = this.getOptions(), S.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), S.observer.observe(this);
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), S.observer.unobserve(this), S.groupQueue.delete(this);
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, e = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, s = this.getAttribute("type") ?? "fade-up", i = this.getAttribute("easing"), [r, a] = e[s] ?? e["fade-up"];
    return {
      x: r,
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
    const { x: e, y: s, easing: i, duration: r, delay: a } = this.options;
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
        duration: r,
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
n(S, "counter", 0), n(S, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), n(S, "groupQueue", /* @__PURE__ */ new Set()), n(S, "isProcessingGroup", !1), n(S, "observer", new IntersectionObserver(
  (t) => {
    for (const e of t) {
      if (e.intersectionRect.width * e.intersectionRect.height < 1)
        continue;
      const i = e.target;
      S.observer.unobserve(i), i.isGroup ? S.groupQueue.add(i) : i.play();
    }
    S.scheduleGroup();
  },
  {
    threshold: [0],
    rootMargin: "-1px 0px -1px 0px"
  }
));
let T = S;
customElements.get("sx-animate") || customElements.define("sx-animate", T);
class B {
  constructor() {
    n(this, "_listeners", /* @__PURE__ */ new Set());
    n(this, "_time", 0);
    // seconds
    n(this, "_delta", 0);
    // ms
    n(this, "_frame", 0);
    n(this, "_start", this._now());
    n(this, "_last", this._start);
    n(this, "_lagThreshold", 500);
    n(this, "_adjustedLag", 33);
    n(this, "_gap", 1e3 / 240);
    n(this, "_nextTime", this._gap);
    n(this, "_id", null);
    n(this, "_tick", () => {
      let t = this._now() - this._last;
      (t > this._lagThreshold || t < 0) && (this._start += t - this._adjustedLag), this._last += t;
      const e = this._last - this._start, s = e - this._nextTime;
      if (s > 0) {
        this._frame++, this._delta = e - this._time * 1e3, this._time = e / 1e3, this._nextTime += s >= this._gap ? s + 4 : this._gap;
        const i = [...this._listeners];
        for (const r of i)
          r(this._time, this._delta, this._frame);
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
const v = new B(), z = /* @__PURE__ */ new WeakMap();
let y = [], A = null;
function I(u, o) {
  y.push({ instance: u, type: o }), A === null && (A = requestAnimationFrame(F));
}
function F() {
  const u = y.slice();
  y.length = 0, A = null;
  for (let o = 0; o < u.length; o++) {
    const { instance: t, type: e } = u[o];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const w = new IntersectionObserver(
  (u) => {
    for (let o = 0; o < u.length; o++) {
      const t = u[o], e = z.get(t.target);
      e && (t.isIntersecting ? I(e, "enter") : I(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function L(u, o) {
  z.set(u, o), w.observe(u);
}
function _(u) {
  z.delete(u), w.unobserve(u);
}
class D extends HTMLElement {
  constructor() {
    super();
    n(this, "inner", null);
    n(this, "resizeObserver", null);
    n(this, "setupRafId", null);
    n(this, "offset", 0);
    n(this, "isHovered", !1);
    n(this, "cachedResetBounds", 0);
    n(this, "isSettingUp", !1);
    n(this, "isVisible", !1);
    n(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    n(this, "onMouseLeave", () => {
      this.isHovered = !1;
    });
    n(this, "updateAnimation", (t, e) => {
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
    }), this.resizeObserver.observe(this), L(this, {
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
          const r = i < s ? Math.ceil(s * 2 / i) : 2, a = document.createDocumentFragment();
          for (let h = 1; h < r; h++)
            for (const l of e) {
              const c = l.cloneNode(!0);
              c.setAttribute("data-clone", "true"), a.appendChild(c);
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
class q extends HTMLElement {
}
class O extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", D);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", q);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", O);
class N {
  constructor() {
    n(this, "sliders", /* @__PURE__ */ new Map());
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
const C = new N();
class V {
  constructor(o, t, e = 0.92) {
    n(this, "velocity", 0);
    n(this, "friction");
    n(this, "onUpdate");
    n(this, "onComplete");
    n(this, "isRunning", !1);
    n(this, "tickerCallback");
    this.onUpdate = o, this.onComplete = t, this.friction = e, this.tickerCallback = (s, i, r) => this.loop(i);
  }
  setFriction(o) {
    this.friction = o;
  }
  addVelocity(o) {
    this.velocity += o, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, v.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, v.add(this.tickerCallback));
  }
  loop(o) {
    if (!this.isRunning) return;
    const t = o / 16.67, e = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= e;
  }
}
class H extends HTMLElement {
  constructor() {
    super();
    n(this, "sliderCha", null);
    n(this, "isDragging", !1);
    n(this, "startX", 0);
    n(this, "currentTranslate", 0);
    n(this, "prevTranslate", 0);
    n(this, "isResetting", !1);
    n(this, "dragXs", []);
    n(this, "dragTimes", []);
    n(this, "velocity", 0);
    n(this, "scrollDuration", 0);
    n(this, "scrollStartTime", 0);
    n(this, "scrollFrom", 0);
    n(this, "scrollToTarget", 0);
    n(this, "scrollFriction", 1);
    n(this, "isScrollAnimating", !1);
    n(this, "noConstrain", !1);
    n(this, "lastClientAxis", 0);
    n(this, "lastWheelTime", 0);
    n(this, "boundWheel", this.onWheel.bind(this));
    n(this, "boundDragStart", this.dragStart.bind(this));
    n(this, "boundDragMove", this.dragMove.bind(this));
    n(this, "boundDragEnd", this.dragEnd.bind(this));
    n(this, "handleScrollEnd", () => {
      if (!this.sliderCha) return;
      const t = this.sliderCha.options;
      if (t.snap || t.drag !== "free")
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.updatePosition();
      else if (!t.loop) {
        const { max: e, min: s } = this.sliderCha.getBoundaries(), i = Math.max(
          s,
          Math.min(e, this.currentTranslate)
        );
        i !== this.currentTranslate && this.startMomentumScroll(i, 400);
      }
      this.sliderCha.startAutoplay();
    });
    n(this, "wheelInertia", new V(
      (t) => {
        if (this.sliderCha) {
          if (this.currentTranslate += t, this.sliderCha.options.loop)
            this.checkLoopBoundsInstant();
          else {
            const { max: e, min: s } = this.sliderCha.getBoundaries(), i = this.sliderCha.options.edgeResistance;
            this.currentTranslate > e ? i <= 0 ? (this.currentTranslate = e, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate > e + i ? (this.currentTranslate = e + i, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.currentTranslate < s ? i <= 0 ? (this.currentTranslate = s, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate < s - i ? (this.currentTranslate = s - i, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.wheelInertia.setFriction(0.92);
          }
          this.setTransform(this.currentTranslate);
        }
      },
      () => this.handleScrollEnd(),
      0.92
    ));
    n(this, "scrollTickerCallback", () => this.runScrollLoop());
  }
  connectedCallback() {
    this.sliderCha = this.closest("sx-slider"), this.initDragEvents(), this.addEventListener("transitionend", () => {
      this.isResetting || this.checkLoopBoundsInstant();
    });
  }
  disconnectedCallback() {
    this.sliderCha && (this.sliderCha.removeEventListener("mousedown", this.boundDragStart), this.sliderCha.removeEventListener("touchstart", this.boundDragStart), this.sliderCha.removeEventListener("wheel", this.boundWheel)), window.removeEventListener("mousemove", this.boundDragMove), window.removeEventListener("mouseup", this.boundDragEnd), window.removeEventListener("touchmove", this.boundDragMove), window.removeEventListener("touchend", this.boundDragEnd), this.wheelInertia.stop(), this.cancelMomentumScroll();
  }
  initDragEvents() {
    this.sliderCha && (this.sliderCha.addEventListener("mousedown", this.boundDragStart), window.addEventListener("mousemove", this.boundDragMove), window.addEventListener("mouseup", this.boundDragEnd), this.sliderCha.addEventListener("touchstart", this.boundDragStart, {
      passive: !0
    }), window.addEventListener("touchmove", this.boundDragMove, {
      passive: !1
    }), window.addEventListener("touchend", this.boundDragEnd), this.sliderCha.addEventListener("wheel", this.boundWheel, {
      passive: !1
    }));
  }
  onWheel(t) {
    if (!(!this.sliderCha || this.sliderCha.options.direction !== "vertical" || !this.sliderCha.options.verticalScroll))
      if (t.preventDefault(), this.sliderCha.stopAutoplay(), this.sliderCha.options.drag === "free") {
        this.cancelMomentumScroll(), this.style.transition = "none", this.wheelInertia.setFriction(0.92);
        let e = -t.deltaY * 0.15;
        if (!this.sliderCha.options.loop) {
          const { max: s, min: i } = this.sliderCha.getBoundaries();
          (this.currentTranslate > s && e > 0 || this.currentTranslate < i && e < 0) && (e *= 0.2);
        }
        this.wheelInertia.addVelocity(e);
      } else {
        const e = performance.now();
        e - this.lastWheelTime > 400 && (t.deltaY > 0 ? this.sliderCha.next() : t.deltaY < 0 && this.sliderCha.prev(), this.lastWheelTime = e);
      }
  }
  getPositionAxis(t) {
    if (!this.sliderCha) return 0;
    const e = this.sliderCha.options.direction === "vertical";
    return t instanceof MouseEvent ? e ? t.clientY : t.clientX : e ? t.touches[0].clientY : t.touches[0].clientX;
  }
  dragStart(t) {
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.isResetting || (this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.wheelInertia.stop(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionAxis(t), this.lastClientAxis = this.startX, this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant());
  }
  dragMove(t) {
    if (!this.isDragging || !this.sliderCha) return;
    t.cancelable && t.preventDefault();
    const e = this.getPositionAxis(t);
    this.lastClientAxis = e;
    const s = performance.now();
    for (this.dragXs.push(e), this.dragTimes.push(s); this.dragTimes.length > 0 && s - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const i = e - this.startX;
    let r = this.prevTranslate + i;
    if (this.sliderCha.options.loop)
      this.currentTranslate = r, this.checkLoopBoundsInstant();
    else {
      const { max: a, min: h } = this.sliderCha.getBoundaries(), l = this.sliderCha.options.edgeResistance;
      r > a ? r = l <= 0 ? a : a + Math.min(l, (r - a) * 0.3) : r < h && (r = l <= 0 ? h : h - Math.min(l, (h - r) * 0.3)), this.currentTranslate = r;
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
        const r = parseFloat(this.sliderCha.startPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(i);
        const a = this.sliderCha.getCurrentIndex();
        let h = t.autoSize ? this.sliderCha.getOffsetForIndex(a) : a * this.sliderCha.getSlideSizeWithGap(), l = t.autoSize ? this.children[a].getBoundingClientRect()[this.sliderCha.sizeDim] + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const c = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          i = r + c / 2 - (h + l / 2);
        } else
          i = r - h;
        if (!t.loop) {
          const { max: c, min: m } = this.sliderCha.getBoundaries();
          i = Math.max(m, Math.min(c, i));
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const { max: r, min: a } = this.sliderCha.getBoundaries(), h = Math.max(
          a,
          Math.min(r, i)
        );
        this.startMomentumScroll(h);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out`;
      const s = this.lastClientAxis - this.startX;
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
    const r = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(r / 1.5, 800), r < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (a = this.sliderCha) != null && a.options.loop && this.checkLoopBoundsInstant(), s && s();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, v.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), a = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += a, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: h, min: l } = this.sliderCha.getBoundaries(), c = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > h || this.currentTranslate < l) {
        if (this.currentTranslate > h) {
          if (c <= 0) {
            this.currentTranslate = h, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > h + c) {
            this.currentTranslate = h + c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(h, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < l) {
          if (c <= 0) {
            this.currentTranslate = l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < l - c) {
            this.currentTranslate = l - c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(l, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(a) < 1) {
          const p = this.currentTranslate > h ? h : l;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    s >= 1 && Math.abs(a) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, v.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, v.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, s = parseFloat(this.sliderCha.startPadding) || 0;
    let i = 0, r = 0;
    if (this.sliderCha.options.autoSize)
      r = this.sliderCha.getOffsetForIndex(e), i = this.sliderCha.getOffsetForIndex(e + t) - r;
    else {
      const f = this.sliderCha.getSlideSizeWithGap();
      r = e * f, i = t * f;
    }
    let a = 0;
    if (this.sliderCha.options.centered) {
      const f = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let x = 0;
      if (this.sliderCha.options.autoSize) {
        const M = this.sliderCha.convertToPx(this.sliderCha.options.gap), k = this.children[e];
        x = k ? k.getBoundingClientRect()[this.sliderCha.sizeDim] + M : 0;
      } else
        x = this.sliderCha.getSlideSizeWithGap();
      a = f / 2 - x / 2;
    }
    const h = -r + s + a, l = h - i;
    let c = !1, m = this.currentTranslate, p = 0, g = 0;
    const d = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > h + d ? (m = this.currentTranslate - i, p = -i, g = t, c = !0) : this.currentTranslate <= l - d && (m = this.currentTranslate + i, p = i, g = -t, c = !0), c && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = m, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + g
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (this.style.transform = `${this.sliderCha.transformFn}(${t}px)`);
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const e = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${e.speed}ms ease-out`;
    const s = parseFloat(this.sliderCha.startPadding) || 0, i = this.sliderCha.getCurrentIndex();
    let r = s, a = 0, h = 0;
    if (e.autoSize) {
      a = this.sliderCha.getOffsetForIndex(i);
      const l = Array.from(this.children), c = this.sliderCha.convertToPx(e.gap);
      h = l[i] ? l[i].getBoundingClientRect()[this.sliderCha.sizeDim] + c : 0;
    } else {
      const l = this.sliderCha.getSlideSizeWithGap();
      a = i * l, h = l;
    }
    if (e.centered) {
      const l = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      r += l / 2 - (a + h / 2);
    } else
      r -= a;
    if (!e.loop) {
      const { max: l, min: c } = this.sliderCha.getBoundaries();
      r = Math.max(c, Math.min(l, r));
    }
    if (this.currentTranslate = r, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const l = e.perView, c = this.sliderCha.originalSlidesCount;
      (i >= l + c || i < l) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", H);
class W extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", W);
class G extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const o = this.getAttribute("name");
    if (o) {
      const t = C.get(o);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", G);
class $ extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const o = this.getAttribute("name");
    if (o) {
      const t = C.get(o);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", $);
class X extends HTMLElement {
  constructor() {
    super();
    n(this, "options");
    n(this, "currentIndex", 0);
    n(this, "track", null);
    n(this, "resizeObserver");
    n(this, "originalSlidesCount", 0);
    n(this, "autoplayTimer", null);
    n(this, "isFirstInit", !0);
    n(this, "lastContainerSize", 0);
    n(this, "isFirstHeightMeasure", !0);
    n(this, "handleVisibilityChange", () => {
      document.hidden ? this.stopAutoplay() : this.options.autoplay && this.startAutoplay();
    });
    this.parseOptions();
  }
  get sizeDim() {
    return this.options.direction === "vertical" ? "height" : "width";
  }
  get marginProp() {
    return this.options.direction === "vertical" ? "marginBottom" : "marginRight";
  }
  get clientAxis() {
    return this.options.direction === "vertical" ? "clientY" : "clientX";
  }
  get transformFn() {
    return this.options.direction === "vertical" ? "translateY" : "translateX";
  }
  get startPadding() {
    return this.options.leftPadding;
  }
  getRectSize(t) {
    return t.getBoundingClientRect()[this.sizeDim];
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
      "auto-size",
      "per-move",
      "auto-height",
      "centered",
      "auto-centered",
      "center-if-short",
      "direction",
      "vertical-scroll"
    ];
  }
  connectedCallback() {
    this.track = this.querySelector("sx-slider-track"), this.options.name && C.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      const t = this.getBoundingClientRect()[this.sizeDim];
      t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
    }), this.resizeObserver.observe(this), this.track && this.initLoopClones(), document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay();
  }
  disconnectedCallback() {
    this.options.name && C.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), r = i !== null ? Number(i) : 4e3, a = this.getAttribute("start-index"), h = a !== null ? Number(a) : 0, l = this.getAttribute("per-move");
    let c = "auto";
    if (l !== null && l !== "auto") {
      const p = Number(l);
      c = isNaN(p) ? "auto" : p;
    }
    let m = this.getAttribute("direction");
    m !== "horizontal" && m !== "vertical" && (m = "horizontal"), this.options = {
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
      interval: isNaN(r) ? 4e3 : r,
      startIndex: isNaN(h) ? 0 : h,
      autoSize: this.hasAttribute("auto-size"),
      perMove: c,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: m,
      verticalScroll: this.hasAttribute("vertical-scroll")
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
    const s = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
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
      const d = Math.max(
        0,
        Math.min(this.options.startIndex, s - 1)
      );
      if (this.options.loop) {
        const f = this.options.autoSize ? s : this.options.perView;
        this.currentIndex = f + d;
      } else
        this.currentIndex = d;
      this.isFirstInit = !1;
    }
    const i = this.getAttribute("left-padding"), r = this.getAttribute("right-padding"), a = (d) => d ? isNaN(Number(d)) ? d : `${d}px` : "0px";
    !this.options.autoSize && this.options.perView === s && i && parseFloat(i) > 0 && r && parseFloat(r) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : (this.options.leftPadding = a(i), this.options.rightPadding = a(r));
    const h = this.getBoundingClientRect()[this.sizeDim], l = this.convertToPx(this.options.gap), c = this.convertToPx(this.options.leftPadding), m = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      t.forEach((d) => {
        d.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, t.forEach((d) => {
        const f = d.firstElementChild;
        f ? d.style[this.sizeDim] = `${f.getBoundingClientRect()[this.sizeDim]}px` : d.style[this.sizeDim] = "max-content", d.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const f = (h - c - m - l * (this.options.perView - 1)) / this.options.perView;
      t.forEach((x) => {
        x.style[this.sizeDim] = `${f}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let p = !1;
    const g = t.filter((d) => !d.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let d = 0;
      g.forEach((f) => {
        d += this.getRectSize(f) + l;
      }), d -= l, p = d < h;
    } else
      p = s < this.options.perView;
    this.options.centerIfShort && p ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((f) => f.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    const e = document.createElement("div");
    e.style.display = "none", e.style.width = t, document.body.appendChild(e);
    const s = parseFloat(getComputedStyle(e).width);
    return document.body.removeChild(e), s || 0;
  }
  getSlideSizeWithGap() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children[0];
    return this.getRectSize(t) + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let e = 0, s = 0;
    const i = this.convertToPx(this.options.gap), r = Array.from(this.track.children);
    for (let a = 0; a < r.length && (e += this.getRectSize(r[a]) + i, !(e - i > t)); a++)
      s++;
    return Math.max(1, s);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const e = Array.from(this.track.children), s = this.convertToPx(this.options.gap);
    let i = 0;
    for (let r = 0; r < t; r++)
      e[r] && (i += this.getRectSize(e[r]) + s);
    return i;
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let e = 0;
    if (this.options.autoSize)
      e = this.getOffsetForIndex(this.track.children.length), e -= this.convertToPx(this.options.gap);
    else {
      const s = this.track.children.length;
      e = this.getSlideSizeWithGap() * s - this.convertToPx(this.options.gap);
    }
    return Math.max(0, e - t);
  }
  getBoundaries() {
    if (!this.track || this.track.children.length === 0) return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], e = parseFloat(this.startPadding) || 0, s = this.convertToPx(this.options.gap), i = this.track.children.length;
    let r = 0, a = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let h = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + s : this.getSlideSizeWithGap();
      r = e + t / 2 - h / 2;
      let l = i - 1, c = this.options.autoSize ? this.getOffsetForIndex(l) : l * this.getSlideSizeWithGap(), m = this.options.autoSize ? (this.track.children[l] ? this.getRectSize(this.track.children[l]) : 0) + s : this.getSlideSizeWithGap();
      a = e + t / 2 - (c + m / 2);
    }
    return { max: r, min: Math.min(r, a) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, r = (d) => {
      if (!e) return d;
      let f = (d - i) % s;
      return f < 0 && (f += s), f;
    }, a = this.options.centered ? 0 : Math.floor(this.options.perView / 2), h = r(this.currentIndex), l = r(this.currentIndex - 1), c = r(this.currentIndex + 1), m = r(this.currentIndex + a), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let g = null;
    p && (g = document.createElement("style"), g.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(g), this.offsetHeight), t.forEach((d, f) => {
      d.removeAttribute("sx-slide-active"), d.removeAttribute("sx-slide-prev"), d.removeAttribute("sx-slide-next"), d.removeAttribute("sx-slide-center");
      let x = r(f);
      d.setAttribute("aria-label", `${x + 1}/${s}`), x === h && d.setAttribute("sx-slide-active", ""), x === l && d.setAttribute("sx-slide-prev", ""), x === c && d.setAttribute("sx-slide-next", ""), x === m && d.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), p && g && requestAnimationFrame(() => {
      g == null || g.remove();
    });
  }
  updateAutoHeight() {
    if (!this.track) return;
    if (!this.options.autoHeight) {
      this.style.height = "", this.style.transition = "", this.track.style.alignItems = "";
      return;
    }
    this.track.style.alignItems = "center";
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    let e = 0;
    const s = this.options.perView;
    for (let i = 0; i < s; i++) {
      const r = this.currentIndex + i, a = t[r];
      if (a) {
        const h = a.cloneNode(!0);
        h.style.position = "absolute", h.style.visibility = "hidden", h.style.pointerEvents = "none", h.style.transition = "none", h.style[this.sizeDim] = `${a.getBoundingClientRect()[this.sizeDim]}px`;
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
      let i = this.options.autoSize ? this.getOffsetForIndex(s) : s * this.getSlideSizeWithGap(), r = this.options.autoSize ? this.getRectSize(this.track.children[s]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), a = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const h = this.getBoundingClientRect()[this.sizeDim];
        a += h / 2 - (i + r / 2);
      } else
        a -= i;
      if (a <= e + 1)
        return s;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? this.options.autoSize ? this.getVisibleSlidesCount() : this.options.perView : Math.max(1, this.options.perMove);
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
    const e = parseFloat(this.startPadding) || 0, s = this.getBoundingClientRect()[this.sizeDim], i = Array.from(this.track.children), r = this.convertToPx(this.options.gap);
    let a = 0, h = 1 / 0;
    const l = this.currentIndex;
    for (let c = 0; c < i.length; c++) {
      let m = 0, p = 0;
      if (this.options.autoSize)
        m = this.getOffsetForIndex(c), p = this.getRectSize(i[c]) + r;
      else {
        const f = this.getSlideSizeWithGap();
        m = c * f, p = f;
      }
      let g = e;
      if (this.options.centered ? g += s / 2 - (m + p / 2) : g -= m, !this.options.loop) {
        const { max: f, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? g = Math.max(
          x,
          Math.min(f, g)
        ) : this.options.centered || (c === 0 && (g = 0), g < x && (g = x), g > 0 && (g = 0));
      }
      const d = Math.abs(t - g);
      d < h - 0.5 ? (h = d, a = c) : Math.abs(d - h) <= 0.5 && Math.abs(c - l) < Math.abs(a - l) && (a = c, h = d);
    }
    if (this.currentIndex = a, !this.options.loop) {
      const c = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, c);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", X);
console.log(`@six-js/core v${E}`);
