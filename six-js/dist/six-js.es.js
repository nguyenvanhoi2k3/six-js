var P = Object.defineProperty;
var L = (m, o, t) => o in m ? P(m, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : m[o] = t;
var h = (m, o, t) => L(m, typeof o != "symbol" ? o + "" : o, t);
const F = "0.0.14", k = {
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
    h(this, "animation");
    h(this, "options");
    h(this, "order", S.counter++);
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
    }, s = this.getAttribute("type") ?? "fade-up", i = this.getAttribute("easing"), [n, l] = e[s] ?? e["fade-up"];
    return {
      x: n,
      y: l,
      easing: i && i in k ? k[i] : k["ease-in-out"],
      duration: Number(this.getAttribute("duration")) || 400,
      delay: Number(this.getAttribute("delay")) || 0
    };
  }
  setInitialState() {
    const { x: t, y: e } = this.options;
    this.style.opacity = "0", this.style.transform = `translate3d(${t}px, ${e}px, 0)`;
  }
  play(t = 0) {
    var a;
    const { x: e, y: s, easing: i, duration: n, delay: l } = this.options;
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
        delay: l + t,
        easing: i,
        fill: "forwards"
      }
    ), this.animation.onfinish = () => {
      var r;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (r = this.animation) == null || r.cancel(), this.animation = void 0;
    };
  }
};
h(S, "counter", 0), h(S, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), h(S, "groupQueue", /* @__PURE__ */ new Set()), h(S, "isProcessingGroup", !1), h(S, "observer", new IntersectionObserver(
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
let z = S;
customElements.get("sx-animate") || customElements.define("sx-animate", z);
class D {
  constructor() {
    h(this, "_listeners", /* @__PURE__ */ new Set());
    h(this, "_time", 0);
    // seconds
    h(this, "_delta", 0);
    // ms
    h(this, "_frame", 0);
    h(this, "_start", this._now());
    h(this, "_last", this._start);
    h(this, "_lagThreshold", 500);
    h(this, "_adjustedLag", 33);
    h(this, "_gap", 1e3 / 240);
    h(this, "_nextTime", this._gap);
    h(this, "_id", null);
    h(this, "_tick", () => {
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
const v = new D(), M = /* @__PURE__ */ new WeakMap();
let I = [], w = null;
function B(m, o) {
  I.push({ instance: m, type: o }), w === null && (w = requestAnimationFrame(_));
}
function _() {
  const m = I.slice();
  I.length = 0, w = null;
  for (let o = 0; o < m.length; o++) {
    const { instance: t, type: e } = m[o];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
const R = new IntersectionObserver(
  (m) => {
    for (let o = 0; o < m.length; o++) {
      const t = m[o], e = M.get(t.target);
      e && (t.isIntersecting ? B(e, "enter") : B(e, "leave"));
    }
  },
  { threshold: 0.05 }
);
function O(m, o) {
  M.set(m, o), R.observe(m);
}
function N(m) {
  M.delete(m), R.unobserve(m);
}
class q extends HTMLElement {
  constructor() {
    super();
    h(this, "inner", null);
    h(this, "resizeObserver", null);
    h(this, "setupRafId", null);
    h(this, "offset", 0);
    h(this, "isHovered", !1);
    h(this, "cachedResetBounds", 0);
    h(this, "isSettingUp", !1);
    h(this, "isVisible", !1);
    h(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    h(this, "onMouseLeave", () => {
      this.isHovered = !1;
    });
    h(this, "updateAnimation", (t, e) => {
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
    }), this.resizeObserver.observe(this), O(this, {
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
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), N(this), v.remove(this.updateAnimation);
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
          const n = i < s ? Math.ceil(s * 2 / i) : 2, l = document.createDocumentFragment();
          for (let a = 1; a < n; a++)
            for (const r of e) {
              const d = r.cloneNode(!0);
              d.setAttribute("data-clone", "true"), l.appendChild(d);
            }
          this.inner.appendChild(l);
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
class $ extends HTMLElement {
}
class V extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
customElements.get("sx-marquee") || customElements.define("sx-marquee", q);
customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", $);
customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", V);
class W {
  constructor() {
    h(this, "sliders", /* @__PURE__ */ new Map());
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
const y = new W();
class E {
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
    const i = Object.keys(e).map(Number).sort((n, l) => n - l);
    for (const n of i)
      if (o >= n) {
        const l = this.kebabToCamel(e[n]);
        s = { ...s, ...l };
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
class G {
  constructor(o, t, e = 0.92) {
    h(this, "velocity", 0);
    h(this, "friction");
    h(this, "onUpdate");
    h(this, "onComplete");
    h(this, "isRunning", !1);
    h(this, "tickerCallback");
    this.onUpdate = o, this.onComplete = t, this.friction = e, this.tickerCallback = (s, i, n) => this.loop(i);
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
    h(this, "sliderCha", null);
    h(this, "isDragging", !1);
    h(this, "startX", 0);
    h(this, "currentTranslate", 0);
    h(this, "prevTranslate", 0);
    h(this, "isResetting", !1);
    h(this, "dragXs", []);
    h(this, "dragTimes", []);
    h(this, "velocity", 0);
    h(this, "scrollDuration", 0);
    h(this, "scrollStartTime", 0);
    h(this, "scrollFrom", 0);
    h(this, "scrollToTarget", 0);
    h(this, "scrollFriction", 1);
    h(this, "isScrollAnimating", !1);
    h(this, "noConstrain", !1);
    h(this, "lastClientAxis", 0);
    h(this, "lastWheelTime", 0);
    h(this, "boundWheel", this.onWheel.bind(this));
    h(this, "boundDragStart", this.dragStart.bind(this));
    h(this, "boundDragMove", this.dragMove.bind(this));
    h(this, "boundDragEnd", this.dragEnd.bind(this));
    h(this, "handleScrollEnd", () => {
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
    h(this, "wheelInertia", new G(
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
    h(this, "scrollTickerCallback", () => this.runScrollLoop());
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
      const { max: l, min: a } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
      n > l ? n = r <= 0 ? l : l + Math.min(r, (n - l) * 0.3) : n < a && (n = r <= 0 ? a : a - Math.min(r, (a - n) * 0.3)), this.currentTranslate = n;
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
        const l = this.sliderCha.getCurrentIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(l) : l * this.sliderCha.getSlideSizeWithGap(), r = t.autoSize ? this.children[l].getBoundingClientRect()[this.sliderCha.sizeDim] + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const d = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          i = n + d / 2 - (a + r / 2);
        } else
          i = n - a;
        if (!t.loop) {
          const { max: d, min: p } = this.sliderCha.getBoundaries();
          i = Math.max(p, Math.min(d, i));
        }
      }
      if (t.loop)
        this.startMomentumScroll(i);
      else {
        const { max: n, min: l } = this.sliderCha.getBoundaries(), a = Math.max(
          l,
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
    var l;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = i;
    const n = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(n / 1.5, 800), n < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (l = this.sliderCha) != null && l.options.loop && this.checkLoopBoundsInstant(), s && s();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, v.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, s = Math.min(e / this.scrollDuration, 1), i = 1 - Math.pow(1 - s, 4), l = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * i - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += l, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: r } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < r) {
        if (this.currentTranslate > a) {
          if (d <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + d) {
            this.currentTranslate = a + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
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
        if (this.scrollFriction *= 0.6, Math.abs(l) < 1) {
          const u = this.currentTranslate > a ? a : r;
          this.startMomentumScroll(u, 600, void 0, !0);
          return;
        }
      }
    }
    s >= 1 && Math.abs(l) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, v.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, v.remove(this.scrollTickerCallback);
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
    let l = 0;
    if (this.sliderCha.options.centered) {
      const b = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let x = 0;
      if (this.sliderCha.options.autoSize) {
        const C = this.sliderCha.convertToPx(this.sliderCha.options.gap), g = this.children[e];
        x = g ? g.getBoundingClientRect()[this.sliderCha.sizeDim] + C : 0;
      } else
        x = this.sliderCha.getSlideSizeWithGap();
      l = b / 2 - x / 2;
    }
    const a = -n + s + l, r = a - i;
    let d = !1, p = this.currentTranslate, u = 0, c = 0;
    const f = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + f ? (p = this.currentTranslate - i, u = -i, c = t, d = !0) : this.currentTranslate <= r - f && (p = this.currentTranslate + i, u = i, c = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = p, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += u, this.scrollToTarget += u), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + c
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
    let n = s, l = 0, a = 0;
    if (e.autoSize) {
      l = this.sliderCha.getOffsetForIndex(i);
      const r = Array.from(this.children), d = this.sliderCha.convertToPx(e.gap);
      a = r[i] ? r[i].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const r = this.sliderCha.getSlideSizeWithGap();
      l = i * r, a = r;
    }
    if (e.centered) {
      const r = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      n += r / 2 - (l + a / 2);
    } else
      n -= l;
    if (!e.loop) {
      const { max: r, min: d } = this.sliderCha.getBoundaries();
      n = Math.max(d, Math.min(r, n));
    }
    if (this.currentTranslate = n, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const r = e.perView, d = this.sliderCha.originalSlidesCount;
      (i >= r + d || i < r) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
customElements.get("sx-slider-track") || customElements.define("sx-slider-track", H);
class X extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", X);
class U extends HTMLElement {
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
      const t = y.get(o);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", U);
class Y extends HTMLElement {
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
      const t = y.get(o);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
customElements.get("sx-slider-next") || customElements.define("sx-slider-next", Y);
class Q extends HTMLElement {
  constructor() {
    super();
    h(this, "renderedSignature", "");
    h(this, "innerContainer", null);
    h(this, "snakeBar", null);
    h(this, "maxVisibleBullets", 5);
    h(this, "bulletWidthWithGap", 16);
    h(this, "lastActiveIndex", 0);
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
    e ? s = y.get(e) : s = this.closest("sx-slider"), s && typeof s.goTo == "function" && s.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), s = e === "dynamic", i = e === "snake", n = e === "number", l = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature !== l) {
      if (this.renderedSignature = l, this.innerHTML = "", this.snakeBar = null, i) {
        this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((a, r) => {
          this.appendChild(this.createBulletDOM(a, r, !1));
        }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", this.appendChild(this.snakeBar);
        return;
      }
      if (s) {
        this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", this.appendChild(this.innerContainer), t.forEach((a, r) => {
          this.innerContainer.appendChild(
            this.createBulletDOM(a, r, !1)
          );
        }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto";
        return;
      }
      this.innerContainer = null, this.style.width = "", t.forEach((a, r) => {
        this.appendChild(this.createBulletDOM(a, r, n));
      });
    }
  }
  createBulletDOM(t, e, s) {
    const i = document.createElement("span");
    return i.className = "sx-slider-pagination-bullet", i.setAttribute("data-index", t.toString()), i.setAttribute("role", "button"), i.setAttribute("tabindex", "0"), i.setAttribute("aria-label", `Go to slide ${e + 1}`), s && (i.textContent = (e + 1).toString()), i;
  }
  updateActive(t) {
    const e = this.getAttribute("effect"), s = e === "dynamic", i = e === "snake", n = s ? this.innerContainer : this;
    if (!n) return;
    const l = Array.from(
      n.querySelectorAll(".sx-slider-pagination-bullet")
    ), a = l.length;
    if (a === 0) return;
    if (l.forEach((u, c) => {
      s && (u.className = "sx-slider-pagination-bullet"), c === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), i && this.snakeBar) {
      if (l[t]) {
        const x = t * 20, C = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const g = x - C + 10;
          this.snakeBar.style.left = `${C}px`, this.snakeBar.style.width = `${g}px`, setTimeout(() => {
            this.getAttribute("effect") === "snake" && (this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const g = C - x + 10;
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = `${g}px`, setTimeout(() => {
            this.getAttribute("effect") === "snake" && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!s || a <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let r = t - Math.floor(this.maxVisibleBullets / 2);
    r < 0 && (r = 0), r > a - this.maxVisibleBullets && (r = a - this.maxVisibleBullets);
    const d = r + this.maxVisibleBullets - 1;
    l.forEach((u, c) => {
      c >= r && c <= d ? c === r ? u.classList.add(c === 0 ? "sx-bullet-main" : "sx-bullet-small") : c === r + 1 ? u.classList.add(c === 1 ? "sx-bullet-main" : "sx-bullet-medium") : c === d ? u.classList.add(
        c === a - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : c === d - 1 ? u.classList.add(
        c === a - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const p = -r * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${p}px)`;
  }
}
customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Q);
class J extends HTMLElement {
  constructor() {
    super();
    h(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar", this.appendChild(this.bar);
  }
  update(t, e, s) {
    const i = Math.max(0, Math.min(1, t));
    this.bar.style.transition = s || "none", e === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${i})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${i})`);
  }
}
customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", J);
class j extends HTMLElement {
  constructor() {
    super();
    h(this, "options");
    h(this, "originalOptions");
    h(this, "breakpointsConfig", null);
    h(this, "currentIndex", 0);
    h(this, "track", null);
    h(this, "resizeObserver");
    h(this, "originalSlidesCount", 0);
    h(this, "autoplayTimer", null);
    h(this, "isFirstInit", !0);
    h(this, "lastContainerSize", 0);
    h(this, "isFirstHeightMeasure", !0);
    h(this, "isClickRouting", !1);
    h(this, "handleVisibilityChange", () => {
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
        const d = this.options.autoSize ? r : this.options.perView, p = parseFloat(this.startPadding) || 0;
        let u = 0, c = 0;
        if (this.options.autoSize)
          u = this.getOffsetForIndex(d), c = this.getOffsetForIndex(d + r) - u;
        else {
          const f = this.getSlideSizeWithGap();
          u = d * f, c = r * f;
        }
        if (c > 0) {
          i = n / c;
          let f = 0;
          if (this.options.centered) {
            let C = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            f = n / 2 - C / 2;
          }
          s = (-u + p + f - t) / c, s = (s % 1 + 1) % 1;
        } else
          s = 1, i = 1;
      }
    } else {
      const { max: r, min: d } = this.getBoundaries(), p = r - d;
      p > 0 ? (s = (r - t) / p, i = n / (p + n)) : (s = 1, i = 1);
    }
    i = Math.max(0, Math.min(1, i));
    const l = i + s * (1 - i);
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
      typeof r.update == "function" && r.update(l, this.options.direction, e);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && y.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      const t = this.getBoundingClientRect()[this.sizeDim];
      t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
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
        const l = s.target.closest("sx-slider-slide");
        if (!l) return;
        const a = l.getAttribute("data-real-index");
        if (a !== null) {
          const r = parseInt(a, 10);
          this.goTo(r, !0);
        }
      }), this.initLoopClones();
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange), this.startAutoplay();
  }
  disconnectedCallback() {
    this.options.name && y.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (c) => c ? isNaN(Number(c)) ? c : `${c}px` : "0px", e = this.getAttribute("edge-resistance"), s = e !== null ? Number(e) : 100, i = this.getAttribute("interval"), n = i !== null ? Number(i) : 4e3, l = this.getAttribute("start-index"), a = l !== null ? Number(l) : 0, r = this.getAttribute("per-move");
    let d = "auto";
    if (r !== null && r !== "auto") {
      const c = Number(r);
      d = isNaN(c) ? "auto" : c;
    }
    let p = this.getAttribute("direction");
    p !== "horizontal" && p !== "vertical" && (p = "horizontal");
    let u = this.getAttribute("effect");
    u !== "fade" && (u = "slide"), this.options = {
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
      perMove: d,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: p,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: u,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = E.parse(
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
    e.forEach((i, n) => {
      i.setAttribute("data-real-index", n.toString());
    });
    const s = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
    for (let i = 0; i < s; i++) {
      const l = e[e.length - 1 - i].cloneNode(!0);
      l.setAttribute("data-clone", "prev"), this.track.insertBefore(l, this.track.firstChild);
    }
    for (let i = 0; i < s; i++) {
      const l = e[i].cloneNode(!0);
      l.setAttribute("data-clone", "next"), this.track.appendChild(l);
    }
  }
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    const t = this.getBoundingClientRect()[this.sizeDim], e = Array.from(this.track.children);
    if (e.length === 0) return;
    if (this.options.loop || e.forEach((c, f) => {
      c.setAttribute("data-real-index", f.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = E.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const c = (f) => f == null || f === "" ? "0px" : isNaN(Number(f)) ? String(f) : `${f}px`;
      this.options.gap = c(this.options.gap), this.options.leftPadding = c(this.options.leftPadding), this.options.rightPadding = c(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 && this.initLoopClones();
    const s = this.track.querySelectorAll("[data-clone]").length, i = e.length - s;
    if (this.isFirstInit && i > 0) {
      const c = Math.max(
        0,
        Math.min(this.options.startIndex, i - 1)
      );
      if (this.options.loop) {
        const f = this.options.autoSize ? i : this.options.perView;
        this.currentIndex = f + c;
      } else
        this.currentIndex = c;
      this.isFirstInit = !1;
    }
    const n = this.getAttribute("left-padding"), l = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === i && n && parseFloat(n) > 0 && l && parseFloat(l) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(n), this.options.rightPadding = this.formatUnit(l));
    const a = this.convertToPx(this.options.gap), r = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((c) => {
        c.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((c) => {
        const f = c.firstElementChild;
        f ? c.style[this.sizeDim] = `${f.getBoundingClientRect()[this.sizeDim]}px` : c.style[this.sizeDim] = "max-content", c.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - r - d - a * (this.options.perView - 1)) / this.options.perView;
      e.forEach((x) => {
        x.style[this.sizeDim] = `${b}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let p = !1;
    const u = e.filter((c) => !c.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let c = 0;
      u.forEach((f) => {
        c += this.getRectSize(f) + a;
      }), c -= a, p = c < t;
    } else
      p = i < this.options.perView;
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
    const i = this.convertToPx(this.options.gap), n = Array.from(this.track.children);
    for (let l = 0; l < n.length && (e += this.getRectSize(n[l]) + i, !(e - i > t)); l++)
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
    let n = 0, l = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let a = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + s : this.getSlideSizeWithGap();
      n = e + t / 2 - a / 2;
      let r = i - 1, d = this.options.autoSize ? this.getOffsetForIndex(r) : r * this.getSlideSizeWithGap(), p = this.options.autoSize ? (this.track.children[r] ? this.getRectSize(this.track.children[r]) : 0) + s : this.getSlideSizeWithGap();
      l = e + t / 2 - (d + p / 2);
    }
    return { max: n, min: Math.min(n, l) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, s = e ? this.originalSlidesCount : t.length;
    if (s === 0) return;
    const i = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, n = (g) => {
      if (!e) return g;
      let A = (g - i) % s;
      return A < 0 && (A += s), A;
    }, l = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = n(this.currentIndex), r = n(this.currentIndex - 1), d = n(this.currentIndex + 1), p = n(this.currentIndex + l), u = this.isFirstHeightMeasure;
    u && (this.isFirstHeightMeasure = !1);
    let c = null;
    u && (c = document.createElement("style"), c.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(c), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !u || t.forEach((g, A) => {
      g.removeAttribute("sx-slide-active"), g.removeAttribute("sx-slide-prev"), g.removeAttribute("sx-slide-next"), g.removeAttribute("sx-slide-center");
      let T = n(A);
      g.setAttribute("aria-label", `${T + 1}/${s}`), T === a && g.setAttribute("sx-slide-active", ""), T === r && g.setAttribute("sx-slide-prev", ""), T === d && g.setAttribute("sx-slide-next", ""), T === p && g.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const f = e ? s - 1 : this.getRealMaxIndex(), b = this.getResolvedPerMove();
    let x = [];
    if (b > 1 && !this.options.autoSize) {
      let g = 0;
      for (; g < f; )
        x.push(g), g += b;
      g !== f && x.push(f);
    } else
      for (let g = 0; g <= f; g++)
        x.push(g);
    let C = x.indexOf(a);
    if (C === -1) {
      for (let g = x.length - 1; g >= 0; g--)
        if (a >= x[g]) {
          C = g;
          break;
        }
    }
    if (this.updatePagination(x, C), this.options.sync && (this.isClickRouting || !this.options.lockActive)) {
      const g = y.get(this.options.sync);
      g && g.syncFromController(a);
    }
    u && c && requestAnimationFrame(() => {
      c == null || c.remove();
    });
  }
  /**
   * 🌟 ĐÓN NHẬN ĐỒNG BỘ: Đã sửa tích hợp Circuit Breaker và Thuật toán tìm đường đi ngắn nhất
   */
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, s = Array.from(this.track.children), i = this.track.querySelectorAll("[data-clone]").length, n = e ? this.originalSlidesCount : s.length - i;
    if (((a) => {
      if (!e) return a;
      const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (a - r) % n;
      return d < 0 && (d += n), d;
    })(this.currentIndex) !== t) {
      if (e) {
        const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + a, d = this.originalSlidesCount, p = s.length;
        let u = r, c = Math.abs(r - this.currentIndex);
        [r - d, r, r + d].forEach((b) => {
          if (b >= 0 && b < p) {
            const x = Math.abs(b - this.currentIndex);
            x < c && (c = x, u = b);
          }
        }), this.currentIndex = u;
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
    for (let l = 0; l < s; l++) {
      let a = n + l;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const r = t[a];
      if (r) {
        const d = r.cloneNode(!0);
        d.style.position = "absolute", d.style.visibility = "hidden", d.style.pointerEvents = "none", d.style.transition = "none", d.style[this.sizeDim] = `${r.getBoundingClientRect()[this.sizeDim]}px`;
        const p = d.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(d);
        const u = p ? p.getBoundingClientRect().height : d.getBoundingClientRect().height;
        u > e && (e = u), this.track.removeChild(d);
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
      let i = this.options.autoSize ? this.getOffsetForIndex(s) : s * this.getSlideSizeWithGap(), n = this.options.autoSize ? this.getRectSize(this.track.children[s]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), l = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const a = this.getBoundingClientRect()[this.sizeDim];
        l += a / 2 - (i + n / 2);
      } else
        l -= i;
      if (l <= e + 1)
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
  /**
   * 🌟 ĐỊNH TUYẾN CLICK: Thuật toán tìm đường ngắn nhất (Shortest Path) bảo vệ click bản sao clone
   */
  goTo(t, e = !1) {
    if (this.track) {
      if (e && (this.isClickRouting = !0), this.options.loop) {
        const s = this.options.autoSize ? this.originalSlidesCount : this.options.perView, i = t + s, n = this.originalSlidesCount, l = this.track.children.length;
        let a = i, r = Math.abs(i - this.currentIndex);
        [i - n, i, i + n].forEach((p) => {
          if (p >= 0 && p < l) {
            const u = Math.abs(p - this.currentIndex);
            u < r && (r = u, a = p);
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
    let l = 0, a = 1 / 0;
    const r = this.currentIndex;
    for (let d = 0; d < i.length; d++) {
      let p = 0, u = 0;
      if (this.options.autoSize)
        p = this.getOffsetForIndex(d), u = this.getRectSize(i[d]) + n;
      else {
        const b = this.getSlideSizeWithGap();
        p = d * b, u = b;
      }
      let c = e;
      if (this.options.centered ? c += s / 2 - (p + u / 2) : c -= p, !this.options.loop) {
        const { max: b, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? c = Math.max(
          x,
          Math.min(b, c)
        ) : this.options.centered || (d === 0 && (c = 0), c < x && (c = x), c > 0 && (c = 0));
      }
      const f = Math.abs(t - c);
      f < a - 0.5 ? (a = f, l = d) : Math.abs(f - a) <= 0.5 && Math.abs(d - r) < Math.abs(l - r) && (l = d, a = f);
    }
    if (this.currentIndex = l, !this.options.loop) {
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
      t = Array.from(/* @__PURE__ */ new Set([...t, ...i])), e = Array.from(/* @__PURE__ */ new Set([...e, ...n]));
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
customElements.get("sx-slider") || customElements.define("sx-slider", j);
console.log(`@six-js/core v${F}`);
