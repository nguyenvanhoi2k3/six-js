var F = Object.defineProperty;
var D = (m, o, t) => o in m ? F(m, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : m[o] = t;
var c = (m, o, t) => D(m, typeof o != "symbol" ? o + "" : o, t);
const T = {
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
}, E = /* @__PURE__ */ new WeakMap();
let z = [], w = null;
function B(m, o) {
  z.push({ instance: m, type: o }), w === null && (w = requestAnimationFrame(_));
}
function _() {
  const m = z.slice();
  z.length = 0, w = null;
  for (let o = 0; o < m.length; o++) {
    const { instance: t, type: e } = m[o];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const P = new IntersectionObserver(
  (m) => {
    for (let o = 0; o < m.length; o++) {
      const t = m[o], e = E.get(t.target);
      e && (t.isIntersecting ? B(e, "enter") : B(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function L(m, o) {
  E.set(m, o), P.observe(m);
}
function I(m) {
  E.delete(m), P.unobserve(m);
}
const C = class C extends HTMLElement {
  constructor() {
    super(...arguments);
    c(this, "animation");
    c(this, "options");
    c(this, "order", C.counter++);
  }
  static get reduceMotion() {
    return this.mediaQuery.matches;
  }
  static scheduleGroup() {
    this.isProcessingGroup || !this.groupQueue.size || (this.isProcessingGroup = !0, queueMicrotask(() => {
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
    if (this.options = this.getOptions(), C.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), L(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), I(this), C.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || I(this), this.isGroup ? (C.groupQueue.add(this), C.scheduleGroup()) : this.play();
  }
  handleLeave() {
    this.hasAttribute("replay") && this.reset();
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, e = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, s = this.getAttribute("type") ?? "fade-up", i = this.getAttribute("easing"), [n, h] = e[s] ?? e["fade-up"];
    return {
      x: n,
      y: h,
      easing: i && i in T ? T[i] : T["ease-in-out"],
      duration: Number(this.getAttribute("duration")) || 400,
      delay: Number(this.getAttribute("delay")) || 0
    };
  }
  setInitialState() {
    this.style.opacity = "0", this.style.transform = "none";
  }
  reset() {
    var t;
    (t = this.animation) == null || t.cancel(), this.animation = void 0, this.setInitialState();
  }
  play(t = 0) {
    var a;
    const { x: e, y: s, easing: i, duration: n, delay: h } = this.options;
    (a = this.animation) == null || a.cancel(), this.animation = this.animate(
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
        delay: h + t,
        easing: i,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var r;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (r = this.animation) == null || r.cancel(), this.animation = void 0;
    };
  }
};
c(C, "counter", 0), c(C, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), c(C, "groupQueue", /* @__PURE__ */ new Set()), c(C, "isProcessingGroup", !1);
let M = C;
customElements.get("sx-animate") || customElements.define("sx-animate", M);
class N {
  constructor() {
    c(this, "_listeners", /* @__PURE__ */ new Set());
    c(this, "_time", 0);
    // seconds
    c(this, "_delta", 0);
    // ms
    c(this, "_frame", 0);
    c(this, "_start", this._now());
    c(this, "_last", this._start);
    c(this, "_lagThreshold", 500);
    c(this, "_adjustedLag", 33);
    c(this, "_gap", 1e3 / 240);
    c(this, "_nextTime", this._gap);
    c(this, "_id", null);
    c(this, "_tick", () => {
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
const y = new N();
class q extends HTMLElement {
  constructor() {
    super();
    c(this, "inner", null);
    c(this, "resizeObserver", null);
    c(this, "setupRafId", null);
    c(this, "offset", 0);
    c(this, "isHovered", !1);
    c(this, "cachedResetBounds", 0);
    c(this, "isSettingUp", !1);
    c(this, "isVisible", !1);
    c(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    c(this, "onMouseLeave", () => {
      this.isHovered && (this.isHovered = !1);
    });
    c(this, "updateAnimation", (t, e) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const s = e / 1e3, i = this.speed * s, n = this.direction, a = this.isVertical ? this.offsetHeight : this.offsetWidth;
      n === "left" || n === "up" ? (this.offset -= i, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = a)) : (this.offset += i, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= a && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    const t = this.getAttribute("direction");
    return t === "right" || t === "up" || t === "down" ? t : "left";
  }
  set direction(t) {
    this.setAttribute("direction", t);
  }
  // Tiện ích kiểm tra nhanh xem có phải đang cuộn dọc hay không
  get isVertical() {
    const t = this.direction;
    return t === "up" || t === "down";
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
        this.isVisible || (this.isVisible = !0, y.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, y.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), I(this), y.remove(this.updateAnimation);
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
        const s = this.isVertical, i = s ? this.offsetHeight : this.offsetWidth, n = s ? this.inner.offsetHeight : this.inner.offsetWidth;
        if (this.clone && n > 0 && i > 0) {
          const h = n < i ? Math.ceil(i * 2 / n) : 2, a = document.createDocumentFragment();
          for (let r = 1; r < h; r++)
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
    const s = this.isVertical;
    for (let n = 0; n < t.length; n++)
      e += s ? t[n].offsetHeight : t[n].offsetWidth;
    const i = parseFloat(getComputedStyle(this.inner).gap) || 0;
    e += i * t.length, this.cachedResetBounds = e;
  }
  applyTransform(t) {
    this.inner && (this.isVertical ? this.inner.style.transform = `translate3d(0,${t}px,0)` : this.inner.style.transform = `translate3d(${t}px,0,0)`);
  }
}
class O extends HTMLElement {
}
class V extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", q);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", O);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", V);
class $ {
  constructor() {
    c(this, "sliders", /* @__PURE__ */ new Map());
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
const A = new $();
class R {
  static parse(o) {
    if (!o) return null;
    try {
      let t = o.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(o, t, e) {
    if (!e) return { ...t };
    let s = { ...t };
    const i = Object.keys(e).map(Number).sort((n, h) => n - h);
    for (const n of i)
      if (o >= n) {
        const h = this.kebabToCamel(e[n]);
        s = { ...s, ...h };
      }
    return s;
  }
  static kebabToCamel(o) {
    if (typeof o != "object" || o === null) return o;
    const t = {};
    for (const e in o) {
      const s = e.replace(/-([a-z])/g, (i) => i[1].toUpperCase());
      t[s] = o[e];
    }
    return t;
  }
}
class H {
  constructor(o, t, e = 0.92) {
    c(this, "velocity", 0);
    c(this, "friction");
    c(this, "onUpdate");
    c(this, "onComplete");
    c(this, "isRunning", !1);
    c(this, "tickerCallback");
    this.onUpdate = o, this.onComplete = t, this.friction = e, this.tickerCallback = (s, i, n) => this.loop(i);
  }
  setFriction(o) {
    this.friction = o;
  }
  addVelocity(o) {
    this.velocity += o, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, y.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, y.add(this.tickerCallback));
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
class W extends HTMLElement {
  constructor() {
    super();
    c(this, "sliderCha", null);
    c(this, "isDragging", !1);
    c(this, "startX", 0);
    c(this, "currentTranslate", 0);
    c(this, "prevTranslate", 0);
    c(this, "isResetting", !1);
    c(this, "dragXs", []);
    c(this, "dragTimes", []);
    c(this, "velocity", 0);
    c(this, "scrollDuration", 0);
    c(this, "scrollStartTime", 0);
    c(this, "scrollFrom", 0);
    c(this, "scrollToTarget", 0);
    c(this, "scrollFriction", 1);
    c(this, "isScrollAnimating", !1);
    c(this, "noConstrain", !1);
    c(this, "lastClientAxis", 0);
    c(this, "lastWheelTime", 0);
    c(this, "boundWheel", this.onWheel.bind(this));
    c(this, "boundDragStart", this.dragStart.bind(this));
    c(this, "boundDragMove", this.dragMove.bind(this));
    c(this, "boundDragEnd", this.dragEnd.bind(this));
    c(this, "handleScrollEnd", () => {
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
    c(this, "wheelInertia", new H(
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
    c(this, "scrollTickerCallback", () => this.runScrollLoop());
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
    let n = this.prevTranslate + i;
    if (this.sliderCha.options.loop)
      this.currentTranslate = n, this.checkLoopBoundsInstant();
    else {
      const { max: h, min: a } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
      n > h ? n = r <= 0 ? h : h + Math.min(r, (n - h) * 0.3) : n < a && (n = r <= 0 ? a : a - Math.min(r, (a - n) * 0.3)), this.currentTranslate = n;
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
        const n = parseFloat(this.sliderCha.startPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(i);
        const h = this.sliderCha.getCurrentIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap(), r = t.autoSize ? this.children[h].getBoundingClientRect()[this.sliderCha.sizeDim] + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const l = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          i = n + l / 2 - (a + r / 2);
        } else
          i = n - a;
        if (!t.loop) {
          const { max: l, min: u } = this.sliderCha.getBoundaries();
          i = Math.max(u, Math.min(l, i));
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const { max: n, min: h } = this.sliderCha.getBoundaries(), a = Math.max(
          h,
          Math.min(n, i)
        );
        this.startMomentumScroll(a);
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
    var h;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = i;
    const n = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(n / 1.5, 800), n < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (h = this.sliderCha) != null && h.options.loop && this.checkLoopBoundsInstant(), s && s();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, y.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: r } = this.sliderCha.getBoundaries(), l = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < r) {
        if (this.currentTranslate > a) {
          if (l <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + l) {
            this.currentTranslate = a + l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < r) {
          if (l <= 0) {
            this.currentTranslate = r, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < r - l) {
            this.currentTranslate = r - l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(r, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const f = this.currentTranslate > a ? a : r;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    s >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, y.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, y.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, s = parseFloat(this.sliderCha.startPadding) || 0;
    let i = 0, n = 0;
    if (this.sliderCha.options.autoSize)
      n = this.sliderCha.getOffsetForIndex(e), i = this.sliderCha.getOffsetForIndex(e + t) - n;
    else {
      const b = this.sliderCha.getSlideSizeWithGap();
      n = e * b, i = t * b;
    }
    let h = 0;
    if (this.sliderCha.options.centered) {
      const b = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let x = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), g = this.children[e];
        x = g ? g.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        x = this.sliderCha.getSlideSizeWithGap();
      h = b / 2 - x / 2;
    }
    const a = -n + s + h, r = a - i;
    let l = !1, u = this.currentTranslate, f = 0, d = 0;
    const p = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + p ? (u = this.currentTranslate - i, f = -i, d = t, l = !0) : this.currentTranslate <= r - p && (u = this.currentTranslate + i, f = i, d = -t, l = !0), l && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + d
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (this.style.transform = `${this.sliderCha.transformFn}(${t}px)`, this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const e = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${e.speed}ms ease-out`;
    const s = parseFloat(this.sliderCha.startPadding) || 0, i = this.sliderCha.getCurrentIndex();
    let n = s, h = 0, a = 0;
    if (e.autoSize) {
      h = this.sliderCha.getOffsetForIndex(i);
      const r = Array.from(this.children), l = this.sliderCha.convertToPx(e.gap);
      a = r[i] ? r[i].getBoundingClientRect()[this.sliderCha.sizeDim] + l : 0;
    } else {
      const r = this.sliderCha.getSlideSizeWithGap();
      h = i * r, a = r;
    }
    if (e.centered) {
      const r = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      n += r / 2 - (h + a / 2);
    } else
      n -= h;
    if (!e.loop) {
      const { max: r, min: l } = this.sliderCha.getBoundaries();
      n = Math.max(l, Math.min(r, n));
    }
    if (this.currentTranslate = n, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const r = e.perView, l = this.sliderCha.originalSlidesCount;
      (i >= r + l || i < r) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", W);
class G extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", G);
class X extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (o) => {
      (o.key === "Enter" || o.key === " ") && (o.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Previous slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const o = this.getAttribute("name");
    if (o) {
      const t = A.get(o);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", X);
class U extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (o) => {
      (o.key === "Enter" || o.key === " ") && (o.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Next slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const o = this.getAttribute("name");
    if (o) {
      const t = A.get(o);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", U);
class Y extends HTMLElement {
  constructor() {
    super();
    c(this, "renderedSignature", "");
    c(this, "innerContainer", null);
    c(this, "snakeBar", null);
    c(this, "maxVisibleBullets", 5);
    c(this, "bulletWidthWithGap", 16);
    c(this, "lastActiveIndex", 0);
    this.addEventListener("click", (t) => this.handleAction(t)), this.addEventListener("keydown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.handleAction(t));
    });
  }
  static get observedAttributes() {
    return ["effect", "name"];
  }
  attributeChangedCallback() {
    this.renderedSignature = "";
  }
  handleAction(t) {
    const e = t.target;
    if (e.classList.contains("sx-slider-pagination-bullet")) {
      const s = Number(e.getAttribute("data-index"));
      this.goToSlide(s);
    }
  }
  goToSlide(t) {
    const e = this.getAttribute("name");
    let s = null;
    e ? s = A.get(e) : s = this.closest("sx-slider"), s && typeof s.goTo == "function" && s.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), s = e === "dynamic", i = e === "snake", n = e === "number", h = e === "fraction", a = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature !== a) {
      if (this.renderedSignature = a, this.innerHTML = "", this.snakeBar = null, h) {
        this.innerContainer = null, this.style.width = "";
        const r = document.createElement("span");
        r.className = "sx-slider-pagination-current", r.textContent = "1";
        const l = document.createTextNode(" / "), u = document.createElement("span");
        u.className = "sx-slider-pagination-total", u.textContent = t.length.toString(), this.appendChild(r), this.appendChild(l), this.appendChild(u);
        return;
      }
      if (i) {
        this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((r, l) => {
          this.appendChild(this.createBulletDOM(r, l, !1));
        }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", this.appendChild(this.snakeBar);
        return;
      }
      if (s) {
        this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", this.appendChild(this.innerContainer), t.forEach((r, l) => {
          this.innerContainer.appendChild(
            this.createBulletDOM(r, l, !1)
          );
        }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto";
        return;
      }
      this.innerContainer = null, this.style.width = "", t.forEach((r, l) => {
        this.appendChild(this.createBulletDOM(r, l, n));
      });
    }
  }
  createBulletDOM(t, e, s) {
    const i = document.createElement("span");
    return i.className = "sx-slider-pagination-bullet", i.setAttribute("data-index", t.toString()), i.setAttribute("role", "button"), i.setAttribute("tabindex", "0"), i.setAttribute("aria-label", `Go to slide ${e + 1}`), s && (i.textContent = (e + 1).toString()), i;
  }
  updateActive(t) {
    const e = this.getAttribute("effect");
    if (e === "fraction") {
      const d = this.querySelector(".sx-slider-pagination-current");
      d && (d.textContent = (t + 1).toString());
      return;
    }
    const i = e === "dynamic", n = e === "snake", h = i ? this.innerContainer : this;
    if (!h) return;
    const a = Array.from(
      h.querySelectorAll(".sx-slider-pagination-bullet")
    ), r = a.length;
    if (r === 0) return;
    if (a.forEach((d, p) => {
      i && (d.className = "sx-slider-pagination-bullet"), p === t ? (d.setAttribute("sx-bullet-active", ""), d.setAttribute("aria-current", "true")) : (d.removeAttribute("sx-bullet-active"), d.removeAttribute("aria-current"));
    }), n && this.snakeBar) {
      if (a[t]) {
        const S = t * 20, g = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const v = S - g + 10;
          this.snakeBar.style.left = `${g}px`, this.snakeBar.style.width = `${v}px`, setTimeout(() => {
            this.getAttribute("effect") === "snake" && (this.snakeBar.style.left = `${S}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const v = g - S + 10;
          this.snakeBar.style.left = `${S}px`, this.snakeBar.style.width = `${v}px`, setTimeout(() => {
            this.getAttribute("effect") === "snake" && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${S}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!i || r <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let l = t - Math.floor(this.maxVisibleBullets / 2);
    l < 0 && (l = 0), l > r - this.maxVisibleBullets && (l = r - this.maxVisibleBullets);
    const u = l + this.maxVisibleBullets - 1;
    a.forEach((d, p) => {
      p >= l && p <= u ? p === l ? d.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === l + 1 ? d.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === u ? d.classList.add(
        p === r - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === u - 1 ? d.classList.add(
        p === r - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : d.classList.add("sx-bullet-main") : d.classList.add("sx-bullet-small");
    });
    const f = -l * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${f}px)`;
  }
}
customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Y);
class Q extends HTMLElement {
  constructor() {
    super();
    c(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  // ✅ Add the element to the DOM only when the component connects
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, e, s) {
    const i = Math.max(0, Math.min(1, t));
    this.bar.style.transition = s || "none", e === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${i})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${i})`);
  }
}
customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", Q);
class J extends HTMLElement {
  constructor() {
    super();
    c(this, "options");
    c(this, "originalOptions");
    c(this, "breakpointsConfig", null);
    c(this, "currentIndex", 0);
    c(this, "track", null);
    c(this, "resizeObserver");
    c(this, "originalSlidesCount", 0);
    c(this, "autoplayTimer", null);
    c(this, "isFirstInit", !0);
    c(this, "lastContainerSize", 0);
    c(this, "isFirstHeightMeasure", !0);
    c(this, "isClickRouting", !1);
    c(this, "handleVisibilityChange", () => {
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
  updateProgress(t, e) {
    let s = 0, i = 0;
    const n = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const r = this.originalSlidesCount;
      if (r > 0 && this.track) {
        const l = this.options.autoSize ? r : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let f = 0, d = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(l), d = this.getOffsetForIndex(l + r) - f;
        else {
          const p = this.getSlideSizeWithGap();
          f = l * p, d = r * p;
        }
        if (d > 0) {
          i = n / d;
          let p = 0;
          if (this.options.centered) {
            let S = this.options.autoSize ? this.getRectSize(
              this.track.children[l]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            p = n / 2 - S / 2;
          }
          s = (-f + u + p - t) / d, s = (s % 1 + 1) % 1;
        } else
          s = 1, i = 1;
      }
    } else {
      const { max: r, min: l } = this.getBoundaries(), u = r - l;
      u > 0 ? (s = (r - t) / u, i = n / (u + n)) : (s = 1, i = 1);
    }
    i = Math.max(0, Math.min(1, i));
    const h = i + s * (1 - i);
    let a = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const r = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      a = Array.from(/* @__PURE__ */ new Set([...a, ...r]));
    }
    a.forEach((r) => {
      typeof r.update == "function" && r.update(h, this.options.direction, e);
    });
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
      "breakpoints",
      "sync",
      "lock-active"
    ];
  }
  connectedCallback() {
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && A.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;
        const t = this.getBoundingClientRect()[this.sizeDim];
        t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
      });
    }), this.resizeObserver.observe(this), this.track) {
      let t = 0, e = 0;
      this.track.addEventListener("mousedown", (s) => {
        t = s.clientX, e = s.clientY;
      }), this.track.addEventListener(
        "touchstart",
        (s) => {
          s.touches.length > 0 && (t = s.touches[0].clientX, e = s.touches[0].clientY);
        },
        { passive: !0 }
      ), this.track.addEventListener("click", (s) => {
        const i = Math.abs(s.clientX - t), n = Math.abs(s.clientY - e);
        if (i > 6 || n > 6) return;
        const h = s.target.closest("sx-slider-slide");
        if (!h) return;
        const a = h.getAttribute("data-real-index");
        if (a !== null) {
          const r = parseInt(a, 10);
          this.goTo(r, !0);
        }
      }), this.initLoopClones();
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay();
  }
  disconnectedCallback() {
    this.options.name && A.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (d) => d ? isNaN(Number(d)) ? d : `${d}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), n = i !== null ? Number(i) : 4e3, h = this.getAttribute("start-index"), a = h !== null ? Number(h) : 0, r = this.getAttribute("per-move");
    let l = "auto";
    if (r !== null && r !== "auto") {
      const d = Number(r);
      l = isNaN(d) ? "auto" : d;
    }
    let u = this.getAttribute("direction");
    u !== "horizontal" && u !== "vertical" && (u = "horizontal");
    let f = this.getAttribute("effect");
    f !== "fade" && (f = "slide"), this.options = {
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
      interval: isNaN(n) ? 4e3 : n,
      startIndex: isNaN(a) ? 0 : a,
      autoSize: this.hasAttribute("auto-size"),
      perMove: l,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: u,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: f,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = R.parse(
      this.getAttribute("breakpoints")
    );
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
    e.forEach((i, n) => {
      i.setAttribute("data-real-index", n.toString());
    });
    const s = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
    for (let i = 0; i < s; i++) {
      const h = e[e.length - 1 - i].cloneNode(!0);
      h.setAttribute("data-clone", "prev"), this.track.insertBefore(h, this.track.firstChild);
    }
    for (let i = 0; i < s; i++) {
      const h = e[i].cloneNode(!0);
      h.setAttribute("data-clone", "next"), this.track.appendChild(h);
    }
  }
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    this.style.setProperty("--sx-speed", `${this.options.speed}ms`);
    const t = this.getBoundingClientRect()[this.sizeDim], e = Array.from(this.track.children);
    if (e.length === 0) return;
    if (this.options.loop || e.forEach((d, p) => {
      d.setAttribute("data-real-index", p.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = R.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const d = (p) => p == null || p === "" ? "0px" : isNaN(Number(p)) ? String(p) : `${p}px`;
      this.options.gap = d(this.options.gap), this.options.leftPadding = d(this.options.leftPadding), this.options.rightPadding = d(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 && this.initLoopClones();
    const s = this.track.querySelectorAll("[data-clone]").length, i = e.length - s;
    if (this.isFirstInit && i > 0) {
      const d = Math.max(
        0,
        Math.min(this.options.startIndex, i - 1)
      );
      if (this.options.loop) {
        const p = this.options.autoSize ? i : this.options.perView;
        this.currentIndex = p + d;
      } else
        this.currentIndex = d;
      this.isFirstInit = !1;
    }
    const n = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === i && n && parseFloat(n) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(n), this.options.rightPadding = this.formatUnit(h));
    const a = this.convertToPx(this.options.gap), r = this.convertToPx(this.options.leftPadding), l = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((d) => {
        d.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((d) => {
        const p = d.firstElementChild;
        p ? d.style[this.sizeDim] = `${p.getBoundingClientRect()[this.sizeDim]}px` : d.style[this.sizeDim] = "max-content", d.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - r - l - a * (this.options.perView - 1)) / this.options.perView;
      e.forEach((x) => {
        x.style[this.sizeDim] = `${b}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const f = e.filter((d) => !d.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let d = 0;
      f.forEach((p) => {
        d += this.getRectSize(p) + a;
      }), d -= a, u = d < t;
    } else
      u = i < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((p) => p.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
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
    const i = this.convertToPx(this.options.gap), n = Array.from(this.track.children);
    for (let h = 0; h < n.length && (e += this.getRectSize(n[h]) + i, !(e - i > t)); h++)
      s++;
    return Math.max(1, s);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const e = Array.from(this.track.children), s = this.convertToPx(this.options.gap);
    let i = 0;
    for (let n = 0; n < t; n++)
      e[n] && (i += this.getRectSize(e[n]) + s);
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
    let n = 0, h = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let a = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + s : this.getSlideSizeWithGap();
      n = e + t / 2 - a / 2;
      let r = i - 1, l = this.options.autoSize ? this.getOffsetForIndex(r) : r * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[r] ? this.getRectSize(this.track.children[r]) : 0) + s : this.getSlideSizeWithGap();
      h = e + t / 2 - (l + u / 2);
    }
    return { max: n, min: Math.min(n, h) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, n = (g) => {
      if (!e) return g;
      let v = (g - i) % s;
      return v < 0 && (v += s), v;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = n(this.currentIndex), r = n(this.currentIndex - 1), l = n(this.currentIndex + 1), u = n(this.currentIndex + h), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let d = null;
    f && (d = document.createElement("style"), d.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(d), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !f || t.forEach((g, v) => {
      g.removeAttribute("sx-slide-active"), g.removeAttribute("sx-slide-prev"), g.removeAttribute("sx-slide-next"), g.removeAttribute("sx-slide-center");
      let k = n(v);
      g.setAttribute("aria-label", `${k + 1}/${s}`), k === a && g.setAttribute("sx-slide-active", ""), k === r && g.setAttribute("sx-slide-prev", ""), k === l && g.setAttribute("sx-slide-next", ""), k === u && g.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const p = e ? s - 1 : this.getRealMaxIndex(), b = this.getResolvedPerMove();
    let x = [];
    if (b > 1 && !this.options.autoSize) {
      let g = 0;
      for (; g < p; )
        x.push(g), g += b;
      g !== p && x.push(p);
    } else
      for (let g = 0; g <= p; g++)
        x.push(g);
    let S = x.indexOf(a);
    if (S === -1) {
      for (let g = x.length - 1; g >= 0; g--)
        if (a >= x[g]) {
          S = g;
          break;
        }
    }
    if (this.updatePagination(x, S), this.options.sync && (this.isClickRouting || !this.options.lockActive)) {
      const g = A.get(this.options.sync);
      g && g.syncFromController(a);
    }
    f && d && requestAnimationFrame(() => {
      d == null || d.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, s = Array.from(this.track.children), i = this.track.querySelectorAll("[data-clone]").length, n = e ? this.originalSlidesCount : s.length - i;
    if (((a) => {
      if (!e) return a;
      const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let l = (a - r) % n;
      return l < 0 && (l += n), l;
    })(this.currentIndex) !== t) {
      if (e) {
        const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + a, l = this.originalSlidesCount, u = s.length;
        let f = r, d = Math.abs(r - this.currentIndex);
        [r - l, r, r + l].forEach((b) => {
          if (b >= 0 && b < u) {
            const x = Math.abs(b - this.currentIndex);
            x < d && (d = x, f = b);
          }
        }), this.currentIndex = f;
      } else
        this.currentIndex = Math.max(0, Math.min(t, n - 1));
      this.isClickRouting = !0, this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
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
    let n = this.currentIndex - i;
    this.options.loop || (n = Math.max(0, n));
    for (let h = 0; h < s; h++) {
      let a = n + h;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const r = t[a];
      if (r) {
        const l = r.cloneNode(!0);
        l.style.position = "absolute", l.style.visibility = "hidden", l.style.pointerEvents = "none", l.style.transition = "none", l.style[this.sizeDim] = `${r.getBoundingClientRect()[this.sizeDim]}px`;
        const u = l.firstElementChild;
        u && (u.style.transition = "none"), this.track.appendChild(l);
        const f = u ? u.getBoundingClientRect().height : l.getBoundingClientRect().height;
        f > e && (e = f), this.track.removeChild(l);
      }
    }
    e > 0 && (this.style.transition = `height ${this.options.speed}ms ease-out`, this.style.height = `${e}px`);
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes(), this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: this.currentIndex }
      })
    );
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: e } = this.getBoundaries();
    for (let s = 0; s < t; s++) {
      let i = this.options.autoSize ? this.getOffsetForIndex(s) : s * this.getSlideSizeWithGap(), n = this.options.autoSize ? this.getRectSize(this.track.children[s]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), h = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const a = this.getBoundingClientRect()[this.sizeDim];
        h += a / 2 - (i + n / 2);
      } else
        h -= i;
      if (h <= e + 1)
        return s;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), e = (this.currentIndex % t + t) % t, s = e !== 0 ? t - e : t;
    if (this.options.loop)
      this.currentIndex += s, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const i = this.getRealMaxIndex();
      this.currentIndex < i ? this.currentIndex = Math.min(i, this.currentIndex + s) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), e = (this.currentIndex % t + t) % t, s = e !== 0 ? e : t;
    this.options.loop ? (this.currentIndex -= s, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - s) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  goTo(t, e = !1) {
    if (this.track) {
      if (e && (this.isClickRouting = !0), this.options.loop) {
        const s = this.options.autoSize ? this.originalSlidesCount : this.options.perView, i = t + s, n = this.originalSlidesCount, h = this.track.children.length;
        let a = i, r = Math.abs(i - this.currentIndex);
        [i - n, i, i + n].forEach((u) => {
          if (u >= 0 && u < h) {
            const f = Math.abs(u - this.currentIndex);
            f < r && (r = f, a = u);
          }
        }), this.currentIndex = a;
      } else {
        const s = Array.from(this.track.children), i = this.track.querySelectorAll("[data-clone]").length, n = s.length - i;
        this.currentIndex = Math.max(0, Math.min(t, n - 1));
      }
      this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
  }
  alignIndexToFreeTranslation(t) {
    if (!this.track) return;
    const e = parseFloat(this.startPadding) || 0, s = this.getBoundingClientRect()[this.sizeDim], i = Array.from(this.track.children), n = this.convertToPx(this.options.gap);
    let h = 0, a = 1 / 0;
    const r = this.currentIndex;
    for (let l = 0; l < i.length; l++) {
      let u = 0, f = 0;
      if (this.options.autoSize)
        u = this.getOffsetForIndex(l), f = this.getRectSize(i[l]) + n;
      else {
        const b = this.getSlideSizeWithGap();
        u = l * b, f = b;
      }
      let d = e;
      if (this.options.centered ? d += s / 2 - (u + f / 2) : d -= u, !this.options.loop) {
        const { max: b, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? d = Math.max(
          x,
          Math.min(b, d)
        ) : this.options.centered || (l === 0 && (d = 0), d < x && (d = x), d > 0 && (d = 0));
      }
      const p = Math.abs(t - d);
      p < a - 0.5 ? (a = p, h = l) : Math.abs(p - a) <= 0.5 && Math.abs(l - r) < Math.abs(h - r) && (h = l, a = p);
    }
    if (this.currentIndex = h, !this.options.loop) {
      const l = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, l);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
  updateNavigation() {
    let t = Array.from(this.querySelectorAll("sx-slider-prev")), e = Array.from(this.querySelectorAll("sx-slider-next"));
    if (this.options.name) {
      const i = Array.from(
        document.querySelectorAll(
          `sx-slider-prev[name="${this.options.name}"]`
        )
      ), n = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`
        )
      );
      t = Array.from(
        /* @__PURE__ */ new Set([...t, ...i])
      ), e = Array.from(
        /* @__PURE__ */ new Set([...e, ...n])
      );
    }
    if (this.options.loop || this.options.rewind) {
      t.forEach((i) => i.removeAttribute("sx-disabled")), e.forEach((i) => i.removeAttribute("sx-disabled"));
      return;
    }
    this.currentIndex <= 0 ? t.forEach((i) => i.setAttribute("sx-disabled", "")) : t.forEach((i) => i.removeAttribute("sx-disabled"));
    const s = this.getRealMaxIndex();
    this.currentIndex >= s ? e.forEach((i) => i.setAttribute("sx-disabled", "")) : e.forEach((i) => i.removeAttribute("sx-disabled"));
  }
  updatePagination(t, e) {
    let s = Array.from(
      this.querySelectorAll("sx-slider-pagination")
    );
    if (this.options.name) {
      const i = Array.from(
        document.querySelectorAll(
          `sx-slider-pagination[name="${this.options.name}"]`
        )
      );
      s = Array.from(/* @__PURE__ */ new Set([...s, ...i]));
    }
    s.forEach((i) => {
      typeof i.renderBullets == "function" && i.renderBullets(t), typeof i.updateActive == "function" && i.updateActive(e);
    });
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", J);
const j = "0.0.26";
console.log(`@six-js/core v${j}`);
export {
  M as SxAnimate,
  q as SxMarquee,
  O as SxMarqueeInner,
  V as SxMarqueeItem,
  j as VERSION
};
