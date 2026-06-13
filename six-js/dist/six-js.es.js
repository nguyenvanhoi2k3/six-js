var P = Object.defineProperty;
var E = (p, n, t) => n in p ? P(p, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : p[n] = t;
var o = (p, n, t) => E(p, typeof n != "symbol" ? n + "" : n, t);
const B = "0.0.13", v = {
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
    o(this, "animation");
    o(this, "options");
    o(this, "order", S.counter++);
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
      easing: i && i in v ? v[i] : v["ease-in-out"],
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
o(S, "counter", 0), o(S, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), o(S, "groupQueue", /* @__PURE__ */ new Set()), o(S, "isProcessingGroup", !1), o(S, "observer", new IntersectionObserver(
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
class F {
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
  _request(n) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(n) : setTimeout(n, 16);
  }
  _cancel(n) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(n);
      return;
    }
    clearTimeout(n);
  }
  _wake() {
    if (this._id !== null) return;
    const n = this._now();
    this._start = n - this._time * 1e3, this._last = n, this._tick();
  }
  add(n) {
    return this._listeners.add(n), this._wake(), n;
  }
  addOnce(n) {
    const t = (e, s, i) => {
      this.remove(t), n(e, s, i);
    };
    return this.add(t), t;
  }
  remove(n) {
    this._listeners.delete(n), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(n) {
    n = Math.max(1, n), this._gap = 1e3 / n, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(n = 500, t = 33) {
    this._lagThreshold = n || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(n = 60) {
    return this._delta / (1e3 / n);
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
const b = new F(), A = /* @__PURE__ */ new WeakMap();
let y = [], k = null;
function I(p, n) {
  y.push({ instance: p, type: n }), k === null && (k = requestAnimationFrame(L));
}
function L() {
  const p = y.slice();
  y.length = 0, k = null;
  for (let n = 0; n < p.length; n++) {
    const { instance: t, type: e } = p[n];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const M = new IntersectionObserver(
  (p) => {
    for (let n = 0; n < p.length; n++) {
      const t = p[n], e = A.get(t.target);
      e && (t.isIntersecting ? I(e, "enter") : I(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function _(p, n) {
  A.set(p, n), M.observe(p);
}
function D(p) {
  A.delete(p), M.unobserve(p);
}
class O extends HTMLElement {
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
    }), this.resizeObserver.observe(this), _(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, b.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, b.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), D(this), b.remove(this.updateAnimation);
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
class N extends HTMLElement {
}
class q extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", O);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", N);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", q);
class W {
  constructor() {
    o(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(n, t) {
    this.sliders.set(n, t);
  }
  unregister(n) {
    this.sliders.delete(n);
  }
  get(n) {
    return this.sliders.get(n);
  }
}
const C = new W();
class w {
  static parse(n) {
    if (!n) return null;
    try {
      let t = n.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(n, t, e) {
    if (!e) return { ...t };
    let s = { ...t };
    const i = Object.keys(e).map(Number).sort((r, a) => r - a);
    for (const r of i)
      if (n >= r) {
        const a = this.kebabToCamel(e[r]);
        s = { ...s, ...a };
      }
    return s;
  }
  static kebabToCamel(n) {
    if (typeof n != "object" || n === null) return n;
    const t = {};
    for (const e in n) {
      const s = e.replace(/-([a-z])/g, (i) => i[1].toUpperCase());
      t[s] = n[e];
    }
    return t;
  }
}
class H {
  constructor(n, t, e = 0.92) {
    o(this, "velocity", 0);
    o(this, "friction");
    o(this, "onUpdate");
    o(this, "onComplete");
    o(this, "isRunning", !1);
    o(this, "tickerCallback");
    this.onUpdate = n, this.onComplete = t, this.friction = e, this.tickerCallback = (s, i, r) => this.loop(i);
  }
  setFriction(n) {
    this.friction = n;
  }
  addVelocity(n) {
    this.velocity += n, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, b.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, b.add(this.tickerCallback));
  }
  loop(n) {
    if (!this.isRunning) return;
    const t = n / 16.67, e = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= e;
  }
}
class V extends HTMLElement {
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
    o(this, "scrollDuration", 0);
    o(this, "scrollStartTime", 0);
    o(this, "scrollFrom", 0);
    o(this, "scrollToTarget", 0);
    o(this, "scrollFriction", 1);
    o(this, "isScrollAnimating", !1);
    o(this, "noConstrain", !1);
    o(this, "lastClientAxis", 0);
    o(this, "lastWheelTime", 0);
    o(this, "boundWheel", this.onWheel.bind(this));
    o(this, "boundDragStart", this.dragStart.bind(this));
    o(this, "boundDragMove", this.dragMove.bind(this));
    o(this, "boundDragEnd", this.dragEnd.bind(this));
    o(this, "handleScrollEnd", () => {
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
    o(this, "wheelInertia", new H(
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
    o(this, "scrollTickerCallback", () => this.runScrollLoop());
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
          const { max: c, min: f } = this.sliderCha.getBoundaries();
          i = Math.max(f, Math.min(c, i));
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
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, b.add(this.scrollTickerCallback);
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
          const g = this.currentTranslate > h ? h : l;
          this.startMomentumScroll(g, 600, void 0, !0);
          return;
        }
      }
    }
    s >= 1 && Math.abs(a) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, b.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, b.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, s = parseFloat(this.sliderCha.startPadding) || 0;
    let i = 0, r = 0;
    if (this.sliderCha.options.autoSize)
      r = this.sliderCha.getOffsetForIndex(e), i = this.sliderCha.getOffsetForIndex(e + t) - r;
    else {
      const m = this.sliderCha.getSlideSizeWithGap();
      r = e * m, i = t * m;
    }
    let a = 0;
    if (this.sliderCha.options.centered) {
      const m = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let x = 0;
      if (this.sliderCha.options.autoSize) {
        const R = this.sliderCha.convertToPx(this.sliderCha.options.gap), z = this.children[e];
        x = z ? z.getBoundingClientRect()[this.sliderCha.sizeDim] + R : 0;
      } else
        x = this.sliderCha.getSlideSizeWithGap();
      a = m / 2 - x / 2;
    }
    const h = -r + s + a, l = h - i;
    let c = !1, f = this.currentTranslate, g = 0, d = 0;
    const u = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > h + u ? (f = this.currentTranslate - i, g = -i, d = t, c = !0) : this.currentTranslate <= l - u && (f = this.currentTranslate + i, g = i, d = -t, c = !0), c && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = f, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += g, this.scrollToTarget += g), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + d
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
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", V);
class G extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", G);
class $ extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const n = this.getAttribute("name");
    if (n) {
      const t = C.get(n);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", $);
class X extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction());
  }
  handleAction() {
    const n = this.getAttribute("name");
    if (n) {
      const t = C.get(n);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", X);
class U extends HTMLElement {
  constructor() {
    super();
    o(this, "options");
    o(this, "originalOptions");
    o(this, "breakpointsConfig", null);
    o(this, "currentIndex", 0);
    o(this, "track", null);
    o(this, "resizeObserver");
    o(this, "originalSlidesCount", 0);
    o(this, "autoplayTimer", null);
    o(this, "isFirstInit", !0);
    o(this, "lastContainerSize", 0);
    o(this, "isFirstHeightMeasure", !0);
    o(this, "handleVisibilityChange", () => {
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
      "vertical-scroll",
      "effect",
      "breakpoints"
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
    const t = (d) => d ? isNaN(Number(d)) ? d : `${d}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), r = i !== null ? Number(i) : 4e3, a = this.getAttribute("start-index"), h = a !== null ? Number(a) : 0, l = this.getAttribute("per-move");
    let c = "auto";
    if (l !== null && l !== "auto") {
      const d = Number(l);
      c = isNaN(d) ? "auto" : d;
    }
    let f = this.getAttribute("direction");
    f !== "horizontal" && f !== "vertical" && (f = "horizontal");
    let g = this.getAttribute("effect");
    g !== "fade" && (g = "slide"), this.options = {
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
      direction: f,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: g
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = w.parse(
      this.getAttribute("breakpoints")
    ), this.style.setProperty("--sx-speed", `${this.options.speed}ms`);
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
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    const t = this.getBoundingClientRect()[this.sizeDim];
    if (this.breakpointsConfig && this.originalOptions) {
      this.options = w.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const d = (u) => u == null || u === "" ? "0px" : isNaN(Number(u)) ? String(u) : `${u}px`;
      this.options.gap = d(this.options.gap), this.options.leftPadding = d(this.options.leftPadding), this.options.rightPadding = d(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor");
    const e = Array.from(this.track.children);
    if (e.length === 0) return;
    this.options.loop && this.originalSlidesCount === 0 && this.initLoopClones();
    const s = this.track.querySelectorAll("[data-clone]").length, i = e.length - s;
    if (this.isFirstInit && i > 0) {
      const d = Math.max(
        0,
        Math.min(this.options.startIndex, i - 1)
      );
      if (this.options.loop) {
        const u = this.options.autoSize ? i : this.options.perView;
        this.currentIndex = u + d;
      } else
        this.currentIndex = d;
      this.isFirstInit = !1;
    }
    const r = this.getAttribute("left-padding"), a = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === i && r && parseFloat(r) > 0 && a && parseFloat(a) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(r), this.options.rightPadding = this.formatUnit(a));
    const h = this.convertToPx(this.options.gap), l = this.convertToPx(this.options.leftPadding), c = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((d) => {
        d.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((d) => {
        const u = d.firstElementChild;
        u ? d.style[this.sizeDim] = `${u.getBoundingClientRect()[this.sizeDim]}px` : d.style[this.sizeDim] = "max-content", d.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - l - c - h * (this.options.perView - 1)) / this.options.perView;
      e.forEach((x) => {
        x.style[this.sizeDim] = `${m}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let f = !1;
    const g = e.filter((d) => !d.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let d = 0;
      g.forEach((u) => {
        d += this.getRectSize(u) + h;
      }), d -= h, f = d < t;
    } else
      f = i < this.options.perView;
    this.options.centerIfShort && f ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((u) => u.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
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
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], e = parseFloat(this.startPadding) || 0, s = this.convertToPx(this.options.gap), i = this.track.children.length;
    let r = 0, a = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let h = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + s : this.getSlideSizeWithGap();
      r = e + t / 2 - h / 2;
      let l = i - 1, c = this.options.autoSize ? this.getOffsetForIndex(l) : l * this.getSlideSizeWithGap(), f = this.options.autoSize ? (this.track.children[l] ? this.getRectSize(this.track.children[l]) : 0) + s : this.getSlideSizeWithGap();
      a = e + t / 2 - (c + f / 2);
    }
    return { max: r, min: Math.min(r, a) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, r = (u) => {
      if (!e) return u;
      let m = (u - i) % s;
      return m < 0 && (m += s), m;
    }, a = this.options.centered ? 0 : Math.floor(this.options.perView / 2), h = r(this.currentIndex), l = r(this.currentIndex - 1), c = r(this.currentIndex + 1), f = r(this.currentIndex + a), g = this.isFirstHeightMeasure;
    g && (this.isFirstHeightMeasure = !1);
    let d = null;
    g && (d = document.createElement("style"), d.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(d), this.offsetHeight), t.forEach((u, m) => {
      u.removeAttribute("sx-slide-active"), u.removeAttribute("sx-slide-prev"), u.removeAttribute("sx-slide-next"), u.removeAttribute("sx-slide-center");
      let x = r(m);
      u.setAttribute("aria-label", `${x + 1}/${s}`), x === h && u.setAttribute("sx-slide-active", ""), x === l && u.setAttribute("sx-slide-prev", ""), x === c && u.setAttribute("sx-slide-next", ""), x === f && u.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), g && d && requestAnimationFrame(() => {
      d == null || d.remove();
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
    const s = this.options.perView, i = this.options.centered ? Math.floor(s / 2) : 0;
    let r = this.currentIndex - i;
    this.options.loop || (r = Math.max(0, r));
    for (let a = 0; a < s; a++) {
      let h = r + a;
      this.options.loop && (h < 0 ? h = t.length + h : h >= t.length && (h = h % t.length));
      const l = t[h];
      if (l) {
        const c = l.cloneNode(!0);
        c.style.position = "absolute", c.style.visibility = "hidden", c.style.pointerEvents = "none", c.style.transition = "none", c.style[this.sizeDim] = `${l.getBoundingClientRect()[this.sizeDim]}px`;
        const f = c.firstElementChild;
        f && (f.style.transition = "none"), this.track.appendChild(c);
        const g = f ? f.getBoundingClientRect().height : c.getBoundingClientRect().height;
        g > e && (e = g), this.track.removeChild(c);
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
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
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
      let f = 0, g = 0;
      if (this.options.autoSize)
        f = this.getOffsetForIndex(c), g = this.getRectSize(i[c]) + r;
      else {
        const m = this.getSlideSizeWithGap();
        f = c * m, g = m;
      }
      let d = e;
      if (this.options.centered ? d += s / 2 - (f + g / 2) : d -= f, !this.options.loop) {
        const { max: m, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? d = Math.max(
          x,
          Math.min(m, d)
        ) : this.options.centered || (c === 0 && (d = 0), d < x && (d = x), d > 0 && (d = 0));
      }
      const u = Math.abs(t - d);
      u < h - 0.5 ? (h = u, a = c) : Math.abs(u - h) <= 0.5 && Math.abs(c - l) < Math.abs(a - l) && (a = c, h = u);
    }
    if (this.currentIndex = a, !this.options.loop) {
      const c = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, c);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", U);
console.log(`@six-js/core v${B}`);
