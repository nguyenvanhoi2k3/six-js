var O = Object.defineProperty;
var _ = (g, a, t) => a in g ? O(g, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : g[a] = t;
var l = (g, a, t) => _(g, typeof a != "symbol" ? a + "" : a, t);
const w = {
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
}, R = /* @__PURE__ */ new WeakMap();
let z = [], M = null;
function P(g, a) {
  z.push({ instance: g, type: a }), M === null && (M = requestAnimationFrame(q));
}
function q() {
  const g = z.slice();
  z.length = 0, M = null;
  for (let a = 0; a < g.length; a++) {
    const { instance: t, type: e } = g[a];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let E = null;
function D() {
  return typeof window > "u" ? null : (E || (E = new IntersectionObserver(
    (g) => {
      for (let a = 0; a < g.length; a++) {
        const t = g[a], e = R.get(t.target);
        e && (t.isIntersecting ? P(e, "enter") : P(e, "leave"));
      }
    },
    { threshold: 0.05 }
  )), E);
}
function F(g, a) {
  var t;
  R.set(g, a), (t = D()) == null || t.observe(g);
}
function I(g) {
  var a;
  R.delete(g), (a = D()) == null || a.unobserve(g);
}
const S = class S extends HTMLElement {
  constructor() {
    super(...arguments);
    l(this, "animation");
    l(this, "options");
    l(this, "order", S.counter++);
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
    if (this.options = this.getOptions(), S.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), F(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), I(this), S.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || I(this), this.isGroup ? (S.groupQueue.add(this), S.scheduleGroup()) : this.play();
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
      easing: i && i in w ? w[i] : w["ease-in-out"],
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
    var o;
    const { x: e, y: s, easing: i, duration: n, delay: h } = this.options;
    (o = this.animation) == null || o.cancel(), this.animation = this.animate(
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
l(S, "counter", 0), l(S, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), l(S, "groupQueue", /* @__PURE__ */ new Set()), l(S, "isProcessingGroup", !1);
let B = S;
customElements.get("sx-animate") || customElements.define("sx-animate", B);
class N {
  constructor() {
    l(this, "_listeners", /* @__PURE__ */ new Set());
    l(this, "_time", 0);
    // seconds
    l(this, "_delta", 0);
    // ms
    l(this, "_frame", 0);
    l(this, "_start", this._now());
    l(this, "_last", this._start);
    l(this, "_lagThreshold", 500);
    l(this, "_adjustedLag", 33);
    l(this, "_gap", 1e3 / 240);
    l(this, "_nextTime", this._gap);
    l(this, "_id", null);
    l(this, "_tick", () => {
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
const k = new N();
class V extends HTMLElement {
  constructor() {
    super();
    l(this, "inner", null);
    l(this, "resizeObserver", null);
    l(this, "setupRafId", null);
    l(this, "offset", 0);
    l(this, "isHovered", !1);
    l(this, "cachedResetBounds", 0);
    l(this, "isSettingUp", !1);
    l(this, "isVisible", !1);
    l(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    l(this, "onMouseLeave", () => {
      this.isHovered && (this.isHovered = !1);
    });
    l(this, "updateAnimation", (t, e) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const s = e / 1e3, i = this.speed * s, n = this.direction, o = this.isVertical ? this.offsetHeight : this.offsetWidth;
      n === "left" || n === "up" ? (this.offset -= i, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = o)) : (this.offset += i, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= o && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), F(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, k.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, k.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), I(this), k.remove(this.updateAnimation);
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
          const h = n < i ? Math.ceil(i * 2 / n) : 2, o = document.createDocumentFragment();
          for (let r = 1; r < h; r++)
            for (const d of e) {
              const c = d.cloneNode(!0);
              c.setAttribute("data-clone", "true"), o.appendChild(c);
            }
          this.inner.appendChild(o);
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
class $ extends HTMLElement {
}
class H extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", V);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", $);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", H);
class W {
  constructor() {
    l(this, "sliders", /* @__PURE__ */ new Map());
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
const T = new W();
class L {
  static parse(a) {
    if (!a) return null;
    try {
      let t = a.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(a, t, e) {
    if (!e) return { ...t };
    let s = { ...t };
    const i = Object.keys(e).map(Number).sort((n, h) => n - h);
    for (const n of i)
      if (a >= n) {
        const h = this.kebabToCamel(e[n]);
        s = { ...s, ...h };
      }
    return s;
  }
  static kebabToCamel(a) {
    if (typeof a != "object" || a === null) return a;
    const t = {};
    for (const e in a) {
      const s = e.replace(/-([a-z])/g, (i) => i[1].toUpperCase());
      t[s] = a[e];
    }
    return t;
  }
}
class G {
  constructor(a, t, e = 0.92) {
    l(this, "velocity", 0);
    l(this, "friction");
    l(this, "onUpdate");
    l(this, "onComplete");
    l(this, "isRunning", !1);
    l(this, "tickerCallback");
    this.onUpdate = a, this.onComplete = t, this.friction = e, this.tickerCallback = (s, i, n) => this.loop(i);
  }
  setFriction(a) {
    this.friction = a;
  }
  addVelocity(a) {
    this.velocity += a, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, k.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, k.add(this.tickerCallback));
  }
  loop(a) {
    if (!this.isRunning) return;
    const t = a / 16.67, e = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= e;
  }
}
class X extends HTMLElement {
  constructor() {
    super();
    l(this, "sliderCha", null);
    l(this, "isDragging", !1);
    l(this, "startX", 0);
    l(this, "currentTranslate", 0);
    l(this, "prevTranslate", 0);
    l(this, "isResetting", !1);
    l(this, "dragXs", []);
    l(this, "dragTimes", []);
    l(this, "velocity", 0);
    l(this, "scrollDuration", 0);
    l(this, "scrollStartTime", 0);
    l(this, "scrollFrom", 0);
    l(this, "scrollToTarget", 0);
    l(this, "scrollFriction", 1);
    l(this, "isScrollAnimating", !1);
    l(this, "noConstrain", !1);
    l(this, "lastClientAxis", 0);
    l(this, "lastWheelTime", 0);
    l(this, "boundWheel", this.onWheel.bind(this));
    l(this, "boundDragStart", this.dragStart.bind(this));
    l(this, "boundDragMove", this.dragMove.bind(this));
    l(this, "boundDragEnd", this.dragEnd.bind(this));
    l(this, "handleScrollEnd", () => {
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
    l(this, "wheelInertia", new G(
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
    l(this, "scrollTickerCallback", () => this.runScrollLoop());
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
        e - this.lastWheelTime > 400 && (t.deltaY > 0 ? this.sliderCha.next() : t.deltaY < 0 && this.sliderCha.prev(), this.lastWheelTime = e), this.sliderCha.startAutoplay();
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
      const { max: h, min: o } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
      n > h ? n = r <= 0 ? h : h + Math.min(r, (n - h) * 0.3) : n < o && (n = r <= 0 ? o : o - Math.min(r, (o - n) * 0.3)), this.currentTranslate = n;
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
      let i = this.currentTranslate + this.velocity * 400;
      if (t.snap) {
        const n = parseFloat(this.sliderCha.startPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(i);
        const h = this.sliderCha.getCurrentIndex();
        let o = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap();
        const r = this.children[h];
        let d = t.autoSize ? (r ? r.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const c = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          i = n + c / 2 - (o + d / 2);
        } else
          i = n - o;
        if (!t.loop) {
          const { max: c, min: p } = this.sliderCha.getBoundaries();
          i = Math.max(p, Math.min(c, i));
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const { max: n, min: h } = this.sliderCha.getBoundaries(), o = Math.max(
          h,
          Math.min(n, i)
        );
        this.startMomentumScroll(o);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out, height ${t.speed}ms ease-out`;
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
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, k.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: o, min: r } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > o || this.currentTranslate < r) {
        if (this.currentTranslate > o) {
          if (d <= 0) {
            this.currentTranslate = o, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > o + d) {
            this.currentTranslate = o + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(o, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < r) {
          if (d <= 0) {
            this.currentTranslate = r, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < r - d) {
            this.currentTranslate = r - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(r, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const p = this.currentTranslate > o ? o : r;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    s >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, k.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, k.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, s = parseFloat(this.sliderCha.startPadding) || 0;
    let i = 0, n = 0;
    if (this.sliderCha.options.autoSize)
      n = this.sliderCha.getOffsetForIndex(e), i = this.sliderCha.getOffsetForIndex(e + t) - n;
    else {
      const x = this.sliderCha.getSlideSizeWithGap();
      n = e * x, i = t * x;
    }
    let h = 0;
    if (this.sliderCha.options.centered) {
      const x = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let b = 0;
      if (this.sliderCha.options.autoSize) {
        const v = this.sliderCha.convertToPx(this.sliderCha.options.gap), m = this.children[e];
        b = m ? m.getBoundingClientRect()[this.sliderCha.sizeDim] + v : 0;
      } else
        b = this.sliderCha.getSlideSizeWithGap();
      h = x / 2 - b / 2;
    }
    const o = -n + s + h, r = o - i;
    let d = !1, c = this.currentTranslate, p = 0, u = 0;
    const f = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > o + f ? (c = this.currentTranslate - i, p = -i, u = t, d = !0) : this.currentTranslate <= r - f && (c = this.currentTranslate + i, p = i, u = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = c, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + u
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (this.style.transform = `${this.sliderCha.transformFn}(${t}px)`, this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const e = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${e.speed}ms ease-out, height ${e.speed}ms ease-out`;
    const s = parseFloat(this.sliderCha.startPadding) || 0, i = this.sliderCha.getCurrentIndex();
    let n = s, h = 0, o = 0;
    if (e.autoSize) {
      h = this.sliderCha.getOffsetForIndex(i);
      const r = Array.from(this.children), d = this.sliderCha.convertToPx(e.gap);
      o = r[i] ? r[i].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const r = this.sliderCha.getSlideSizeWithGap();
      h = i * r, o = r;
    }
    if (e.centered) {
      const r = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      n += r / 2 - (h + o / 2);
    } else
      n -= h;
    if (!e.loop) {
      const { max: r, min: d } = this.sliderCha.getBoundaries();
      n = Math.max(d, Math.min(r, n));
    }
    if (this.currentTranslate = n, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const r = this.sliderCha.originalSlidesCount, d = e.autoSize ? r : e.perView;
      (i >= d + r || i < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", X);
class Y extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", Y);
class K extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (a) => {
      (a.key === "Enter" || a.key === " ") && (a.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Previous slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const a = this.getAttribute("name");
    if (a) {
      const t = T.get(a);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", K);
class U extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (a) => {
      (a.key === "Enter" || a.key === " ") && (a.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Next slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const a = this.getAttribute("name");
    if (a) {
      const t = T.get(a);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", U);
class Q extends HTMLElement {
  constructor() {
    super();
    l(this, "renderedSignature", "");
    l(this, "innerContainer", null);
    l(this, "snakeBar", null);
    l(this, "maxVisibleBullets", 5);
    l(this, "bulletWidthWithGap", 16);
    l(this, "lastActiveIndex", 0);
    l(this, "cachedBullets", []);
    l(this, "snakeTimeout", null);
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
    e ? s = T.get(e) : s = this.closest("sx-slider"), s && typeof s.goTo == "function" && s.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), s = e === "dynamic", i = e === "snake", n = e === "fraction", h = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature === h) return;
    if (this.renderedSignature = h, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], n) {
      this.innerContainer = null, this.style.width = "";
      const r = document.createElement("span");
      r.className = "sx-slider-pagination-current", r.textContent = "1";
      const d = document.createTextNode(" / "), c = document.createElement("span");
      c.className = "sx-slider-pagination-total", c.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(r), p.appendChild(d), p.appendChild(c), this.appendChild(p);
      return;
    }
    const o = document.createDocumentFragment();
    if (i) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((r, d) => {
        const c = this.createBulletDOM(r, d, !1);
        this.cachedBullets.push(c), o.appendChild(c);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", o.appendChild(this.snakeBar), this.appendChild(o);
      return;
    }
    if (s) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", o.appendChild(this.innerContainer), t.forEach((r, d) => {
        const c = this.createBulletDOM(r, d, !1);
        this.cachedBullets.push(c), this.innerContainer.appendChild(c);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(o);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((r, d) => {
      const c = this.createBulletDOM(r, d, e === "number");
      this.cachedBullets.push(c), o.appendChild(c);
    }), this.appendChild(o);
  }
  createBulletDOM(t, e, s) {
    const i = document.createElement("span");
    return i.className = "sx-slider-pagination-bullet", i.setAttribute("data-index", t.toString()), i.setAttribute("role", "button"), i.setAttribute("tabindex", "0"), i.setAttribute("aria-label", `Go to slide ${e + 1}`), s && (i.textContent = (e + 1).toString()), i;
  }
  updateActive(t) {
    const e = this.getAttribute("effect");
    if (e === "fraction") {
      const c = this.querySelector(".sx-slider-pagination-current");
      c && (c.textContent = (t + 1).toString());
      return;
    }
    const s = e === "dynamic", i = e === "snake", n = this.cachedBullets, h = n.length;
    if (h === 0) return;
    if (n.forEach((c, p) => {
      s && (c.className = "sx-slider-pagination-bullet"), p === t ? (c.setAttribute("sx-bullet-active", ""), c.setAttribute("aria-current", "true")) : (c.removeAttribute("sx-bullet-active"), c.removeAttribute("aria-current"));
    }), i && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), n[t]) {
        const x = t * 20, b = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const v = x - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${v}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const v = b - x + 10;
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = `${v}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!s || h <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let o = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    o = Math.min(o, h - this.maxVisibleBullets);
    const r = o + this.maxVisibleBullets - 1;
    n.forEach((c, p) => {
      p >= o && p <= r ? p === o ? c.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === o + 1 ? c.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === r ? c.classList.add(
        p === h - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === r - 1 ? c.classList.add(
        p === h - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : c.classList.add("sx-bullet-main") : c.classList.add("sx-bullet-small");
    });
    const d = -o * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${d}px)`;
  }
}
customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Q);
class j extends HTMLElement {
  constructor() {
    super();
    l(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, e, s) {
    const i = Math.max(0, Math.min(1, t));
    this.bar.style.transition = s || "none", e === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${i})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${i})`);
  }
}
customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", j);
class J extends HTMLElement {
  constructor() {
    super();
    l(this, "options");
    l(this, "originalOptions");
    l(this, "breakpointsConfig", null);
    l(this, "currentIndex", 0);
    l(this, "lastFiredIndex", -1);
    l(this, "track", null);
    l(this, "resizeObserver");
    l(this, "originalSlidesCount", 0);
    l(this, "autoplayTimer", null);
    l(this, "isFirstInit", !0);
    l(this, "lastContainerSize", 0);
    l(this, "isFirstHeightMeasure", !0);
    l(this, "isClickRouting", !1);
    l(this, "handleVisibilityChange", () => {
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
        const d = this.options.autoSize ? r : this.options.perView, c = parseFloat(this.startPadding) || 0;
        let p = 0, u = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(d), u = this.getOffsetForIndex(d + r) - p;
        else {
          const f = this.getSlideSizeWithGap();
          p = d * f, u = r * f;
        }
        if (u > 0) {
          i = n / u;
          let f = 0;
          if (this.options.centered) {
            let v = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            f = n / 2 - v / 2;
          }
          s = (-p + c + f - t) / u, s = (s % 1 + 1) % 1;
        } else
          s = 1, i = 1;
      }
    } else {
      const { max: r, min: d } = this.getBoundaries(), c = r - d;
      c > 0 ? (s = (r - t) / c, i = n / (c + n)) : (s = 1, i = 1);
    }
    i = Math.max(0, Math.min(1, i));
    const h = i + s * (1 - i);
    let o = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const r = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      o = [.../* @__PURE__ */ new Set([...o, ...r])];
    }
    o.forEach((r) => {
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && T.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
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
        const o = h.getAttribute("data-real-index");
        if (o !== null) {
          const r = parseInt(o, 10);
          this.goTo(r, !0);
        }
      }), this.initLoopClones();
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay(), this.dispatchEvent(
      new CustomEvent("sx-slider-init", {
        bubbles: !0,
        composed: !0,
        detail: { name: this.options.name }
      })
    );
  }
  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("sx-slider-destroy", {
        bubbles: !0,
        composed: !0,
        detail: { name: this.options.name }
      })
    ), this.options.name && T.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (u) => u ? isNaN(Number(u)) ? u : `${u}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), n = i !== null ? Number(i) : 4e3, h = this.getAttribute("start-index"), o = h !== null ? Number(h) : 0, r = this.getAttribute("per-move");
    let d = "auto";
    if (r !== null && r !== "auto") {
      const u = Number(r);
      d = isNaN(u) ? "auto" : u;
    }
    let c = this.getAttribute("direction");
    c !== "horizontal" && c !== "vertical" && (c = "horizontal");
    let p = this.getAttribute("effect");
    p !== "fade" && (p = "slide"), this.options = {
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
      startIndex: isNaN(o) ? 0 : o,
      autoSize: this.hasAttribute("auto-size"),
      perMove: d,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: c,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: p,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = L.parse(
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
  destroyLoopClones() {
    if (!this.track) return;
    this.track.querySelectorAll("[data-clone]").forEach((e) => e.remove()), this.originalSlidesCount = 0;
  }
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    this.style.setProperty("--sx-speed", `${this.options.speed}ms`);
    const t = this.getBoundingClientRect()[this.sizeDim];
    let e = Array.from(this.track.children);
    if (e.length === 0) return;
    if (this.options.loop || e.forEach((u, f) => {
      u.setAttribute("data-real-index", f.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = L.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const u = (f) => f == null || f === "" ? "0px" : isNaN(Number(f)) ? String(f) : `${f}px`;
      this.options.gap = u(this.options.gap), this.options.leftPadding = u(this.options.leftPadding), this.options.rightPadding = u(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), e = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), e = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, e.length - 1)
    ));
    const s = this.track.querySelectorAll("[data-clone]").length, i = e.length - s;
    if (this.isFirstInit && i > 0) {
      const u = Math.max(
        0,
        Math.min(this.options.startIndex, i - 1)
      );
      if (this.options.loop) {
        const f = this.options.autoSize ? i : this.options.perView;
        this.currentIndex = f + u;
      } else
        this.currentIndex = u;
      this.isFirstInit = !1;
    }
    const n = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === i && n && parseFloat(n) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(n), this.options.rightPadding = this.formatUnit(h));
    const o = this.convertToPx(this.options.gap), r = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((u) => {
        u.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((u) => {
        const f = u.firstElementChild;
        f ? u.style[this.sizeDim] = `${f.getBoundingClientRect()[this.sizeDim]}px` : u.style[this.sizeDim] = "max-content", u.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const x = ((t || window.innerWidth) - r - d - o * (this.options.perView - 1)) / this.options.perView;
      e.forEach((b) => {
        b.style[this.sizeDim] = `${x}px`, b.style[this.marginProp] = this.options.gap;
      });
    }
    let c = !1;
    const p = e.filter((u) => !u.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let u = 0;
      p.forEach((f) => {
        u += this.getRectSize(f) + o;
      }), u -= o, c = u < t;
    } else
      c = i < this.options.perView;
    this.options.centerIfShort && c ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((f) => f.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    if (!t || t === "0px" || t === "0") return 0;
    if (t.endsWith("px"))
      return parseFloat(t);
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
      let o = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + s : this.getSlideSizeWithGap();
      n = e + t / 2 - o / 2;
      let r = i - 1, d = this.options.autoSize ? this.getOffsetForIndex(r) : r * this.getSlideSizeWithGap(), c = this.options.autoSize ? (this.track.children[r] ? this.getRectSize(this.track.children[r]) : 0) + s : this.getSlideSizeWithGap();
      h = e + t / 2 - (d + c / 2);
    }
    return { max: n, min: Math.min(n, h) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, n = (m) => {
      if (!e) return m;
      let y = (m - i) % s;
      return y < 0 && (y += s), y;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), o = n(this.currentIndex);
    this.lastFiredIndex !== o && (this.lastFiredIndex = o, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: o }
      })
    ));
    const r = n(this.currentIndex - 1), d = n(this.currentIndex + 1), c = n(this.currentIndex + h), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let u = null;
    p && (u = document.createElement("style"), u.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(u), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((m, y) => {
      m.removeAttribute("sx-slide-active"), m.removeAttribute("sx-slide-prev"), m.removeAttribute("sx-slide-next"), m.removeAttribute("sx-slide-center");
      let C = n(y);
      m.setAttribute("aria-label", `${C + 1}/${s}`), C === o && m.setAttribute("sx-slide-active", ""), C === r && m.setAttribute("sx-slide-prev", ""), C === d && m.setAttribute("sx-slide-next", ""), C === c && m.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const f = e ? s - 1 : this.getRealMaxIndex(), x = this.getResolvedPerMove();
    let b = [];
    if (x > 1 && !this.options.autoSize) {
      let m = 0;
      for (; m < f; )
        b.push(m), m += x;
      m !== f && b.push(f);
    } else
      for (let m = 0; m <= f; m++)
        b.push(m);
    let v = b.indexOf(o);
    if (v === -1) {
      for (let m = b.length - 1; m >= 0; m--)
        if (o >= b[m]) {
          v = m;
          break;
        }
    }
    this.updatePagination(b, v), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((y) => y.trim()).forEach((y) => {
      const C = T.get(y);
      C && C.syncFromController(o);
    }), p && u && requestAnimationFrame(() => {
      u == null || u.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, s = Array.from(this.track.children), i = this.track.querySelectorAll("[data-clone]").length, n = e ? this.originalSlidesCount : s.length - i;
    if (((o) => {
      if (!e) return o;
      const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (o - r) % n;
      return d < 0 && (d += n), d;
    })(this.currentIndex) !== t) {
      if (e) {
        const o = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + o, d = this.originalSlidesCount, c = s.length;
        let p = r, u = Math.abs(r - this.currentIndex);
        [r - d, r, r + d].forEach((x) => {
          if (x >= 0 && x < c) {
            const b = Math.abs(x - this.currentIndex);
            b < u && (u = b, p = x);
          }
        }), this.currentIndex = p;
      } else
        this.currentIndex = Math.max(0, Math.min(t, n - 1));
      this.isClickRouting = !0, this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
  }
  updateAutoHeight() {
    if (!this.track) return;
    if (!this.options.autoHeight) {
      this.track.style.height = "", this.track.style.alignItems = "";
      return;
    }
    this.track.style.alignItems = "flex-start";
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.perView, s = this.options.centered ? Math.floor(e / 2) : 0;
    let i = this.currentIndex - s;
    this.options.loop || (i = Math.max(0, i));
    const n = [];
    for (let o = 0; o < e; o++) {
      let r = i + o;
      this.options.loop && (r < 0 ? r = t.length + r : r >= t.length && (r = r % t.length));
      const d = t[r];
      if (d) {
        const c = d.cloneNode(!0);
        c.style.position = "absolute", c.style.visibility = "hidden", c.style.pointerEvents = "none", c.style.transition = "none", c.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const p = c.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(c), n.push(c);
      }
    }
    let h = 0;
    n.forEach((o) => {
      const r = o.firstElementChild, d = r ? r.getBoundingClientRect().height : o.getBoundingClientRect().height;
      d > h && (h = d);
    }), n.forEach((o) => {
      var r;
      (r = this.track) == null || r.removeChild(o);
    }), h > 0 && (this.track.style.height = `${h}px`);
  }
  getCurrentIndex() {
    if (!this.track) return 0;
    const t = this.options.loop, e = Array.from(this.track.children), s = t ? this.originalSlidesCount : e.length;
    if (s === 0) return 0;
    const i = t ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0;
    let n = t ? (this.currentIndex - i) % s : this.currentIndex;
    return n < 0 && (n += s), n;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: e } = this.getBoundaries();
    for (let s = 0; s < t; s++) {
      let i = this.options.autoSize ? this.getOffsetForIndex(s) : s * this.getSlideSizeWithGap(), n = this.options.autoSize ? this.getRectSize(this.track.children[s]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), h = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const o = this.getBoundingClientRect()[this.sizeDim];
        h += o / 2 - (i + n / 2);
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
        let o = i, r = Math.abs(i - this.currentIndex);
        [i - n, i, i + n].forEach((c) => {
          if (c >= 0 && c < h) {
            const p = Math.abs(c - this.currentIndex);
            p < r && (r = p, o = c);
          }
        }), this.currentIndex = o;
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
    let h = 0, o = 1 / 0;
    const r = this.currentIndex;
    for (let d = 0; d < i.length; d++) {
      let c = 0, p = 0;
      if (this.options.autoSize)
        c = this.getOffsetForIndex(d), p = this.getRectSize(i[d]) + n;
      else {
        const x = this.getSlideSizeWithGap();
        c = d * x, p = x;
      }
      let u = e;
      if (this.options.centered ? u += s / 2 - (c + p / 2) : u -= c, !this.options.loop) {
        const { max: x, min: b } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? u = Math.max(
          b,
          Math.min(x, u)
        ) : this.options.centered || (d === 0 && (u = 0), u < b && (u = b), u > 0 && (u = 0));
      }
      const f = Math.abs(t - u);
      f < o - 0.5 ? (o = f, h = d) : Math.abs(f - o) <= 0.5 && Math.abs(d - r) < Math.abs(h - r) && (h = d, o = f);
    }
    if (this.currentIndex = h, !this.options.loop) {
      const d = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, d);
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
      t = [.../* @__PURE__ */ new Set([...t, ...i])], e = [.../* @__PURE__ */ new Set([...e, ...n])];
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
      s = [.../* @__PURE__ */ new Set([...s, ...i])];
    }
    s.forEach((i) => {
      typeof i.renderBullets == "function" && i.renderBullets(t), typeof i.updateActive == "function" && i.updateActive(e);
    });
  }
}
customElements.get("sx-slider") || customElements.define("sx-slider", J);
class Z extends HTMLElement {
  constructor() {
    super(...arguments);
    l(this, "handleKeyDown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.toggleDialog());
    });
    l(this, "toggleDialog", () => {
      const t = this.getAttribute("name");
      t && window.dispatchEvent(
        new CustomEvent("sx-dialog-toggle", {
          detail: { name: t }
        })
      );
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.addEventListener("click", this.toggleDialog), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.toggleDialog), this.removeEventListener("keydown", this.handleKeyDown);
  }
}
customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Z);
const A = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class tt extends HTMLElement {
  constructor() {
    super();
    l(this, "isOpen", !1);
    l(this, "previousActiveElement", null);
    l(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    l(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    l(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape" && this.closeOnEscKey) {
          t.preventDefault(), this.close();
          return;
        }
        t.key === "Tab" && this.trapFocus(t);
      }
    });
    l(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["sx-open", "duration", "scrollable", "overlay", "overlay-style"];
  }
  // --- Map Attributes về chuẩn DialogOptions ---
  get name() {
    return this.getAttribute("name");
  }
  get duration() {
    const t = this.getAttribute("duration");
    return t ? Number(t) : A.duration;
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : A.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : A.closeOnEscKey;
  }
  get scrollable() {
    return this.getAttribute("scrollable") === "true" || A.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : A.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || A.overlayStyle;
  }
  connectedCallback() {
    this.render(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), this.removeEventListener("keydown", this.handleKeyDown);
  }
  // --- Dispatch Custom Event phục vụ Lifecycle (Mở rộng cho Developer bên ngoài dùng) ---
  dispatchLifecycleEvent(t) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      // Cho phép lọt qua Shadow DOM boundary
      detail: { name: this.name }
    }));
  }
  open() {
    this.isOpen || (this.dispatchLifecycleEvent("sx-dialog-before-open"), this.isOpen = !0, this.setAttribute("sx-open", ""), this.previousActiveElement = document.activeElement, this.lockScroll(), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }));
  }
  close() {
    this.isOpen && (this.dispatchLifecycleEvent("sx-dialog-before-close"), this.isOpen = !1, this.removeAttribute("sx-open"), this.unlockScroll(), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration));
  }
  lockScroll() {
    if (document.body.style.overflow === "hidden") return;
    const t = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty("--sx-scrollbar-width", `${t}px`), document.body.style.paddingRight = "var(--sx-scrollbar-width)", document.body.style.overflow = "hidden";
  }
  unlockScroll() {
    setTimeout(() => {
      document.querySelectorAll("sx-dialog[sx-open]").length === 0 && (document.body.style.paddingRight = "", document.body.style.overflow = "", document.body.style.removeProperty("--sx-scrollbar-width"));
    }, this.duration);
  }
  getFocusableElements() {
    return Array.from(this.querySelectorAll(this.focusableElementsString));
  }
  focusFirstElement() {
    const t = this.getFocusableElements();
    t.length ? t[0].focus() : this.shadowRoot.querySelector(".dialog").focus();
  }
  trapFocus(t) {
    const e = this.getFocusableElements();
    if (e.length === 0) return;
    const s = e[0], i = e[e.length - 1];
    t.shiftKey && document.activeElement === s ? (t.preventDefault(), i.focus()) : !t.shiftKey && document.activeElement === i && (t.preventDefault(), s.focus());
  }
  render() {
    const t = `
      :host {
        --sx-duration: ${this.duration}ms;
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        pointer-events: none;
      }
      
      :host([sx-open]) {
        visibility: visible;
        pointer-events: auto;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        z-index: -1;
        opacity: 0;
        transition: opacity var(--sx-duration) ease;
      }
      
      :host([sx-open]) .backdrop {
        opacity: 1;
      }

      .dialog {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: var(--sx-dialog-max-width, 90vw);
        max-height: calc(100vh - 4rem);
        background: transparent;
        opacity: 0;
        transform: scale(0.96) translateY(10px);
        transition: opacity var(--sx-duration) cubic-bezier(0.4, 0, 0.2, 1), 
                    transform var(--sx-duration) cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
        display: flex;
        flex-direction: column;
        outline: none;
      }

      :host([sx-open]) .dialog {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      .dialog-content {
         background: var(--sx-dialog-bg-color, #ffffff);
         border-radius: var(--sx-dialog-border-radius, 8px);
         box-shadow: var(--sx-dialog-shadow);
         width: 100%;
      }

      :host([scrollable="true"]) .dialog {
        overflow-y: auto;
      }
    `;
    this.shadowRoot.innerHTML = `
      <style>${t}</style>
      ${this.overlay ? `<div class="backdrop" style="${this.overlayStyle}" part="backdrop"></div>` : ""}
      <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
        <div class="dialog-content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
    const e = this.shadowRoot.querySelector(".backdrop");
    e && e.addEventListener("click", this.handleBackdropClick);
  }
}
customElements.get("sx-dialog") || customElements.define("sx-dialog", tt);
const et = "0.0.30";
console.log(`@six-js/core v${et}`);
export {
  B as SxAnimate,
  tt as SxDialog,
  Z as SxDialogTrigger,
  V as SxMarquee,
  $ as SxMarqueeInner,
  H as SxMarqueeItem,
  et as VERSION
};
