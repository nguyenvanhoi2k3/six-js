var Nt = Object.defineProperty;
var Wt = (s, e, t) => e in s ? Nt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var a = (s, e, t) => Wt(s, typeof e != "symbol" ? e + "" : e, t);
function H(s) {
  return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? (s -= 1.5 / 2.75, 7.5625 * s * s + 0.75) : s < 2.5 / 2.75 ? (s -= 2.25 / 2.75, 7.5625 * s * s + 0.9375) : (s -= 2.625 / 2.75, 7.5625 * s * s + 0.984375);
}
const N = 1.70158, G = N * 1.525, F = {
  linear: (s) => s,
  quadIn: (s) => s * s,
  quadOut: (s) => 1 - (1 - s) * (1 - s),
  quadInOut: (s) => s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2,
  cubicIn: (s) => s * s * s,
  cubicOut: (s) => 1 - Math.pow(1 - s, 3),
  cubicInOut: (s) => s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2,
  quartIn: (s) => s ** 4,
  quartOut: (s) => 1 - (1 - s) ** 4,
  quartInOut: (s) => s < 0.5 ? 8 * s ** 4 : 1 - (-2 * s + 2) ** 4 / 2,
  quintIn: (s) => s ** 5,
  quintOut: (s) => 1 - (1 - s) ** 5,
  quintInOut: (s) => s < 0.5 ? 16 * s ** 5 : 1 - (-2 * s + 2) ** 5 / 2,
  strongIn: (s) => s ** 5,
  strongOut: (s) => 1 - (1 - s) ** 5,
  strongInOut: (s) => s < 0.5 ? 16 * s ** 5 : 1 - (-2 * s + 2) ** 5 / 2,
  sineIn: (s) => 1 - Math.cos(s * Math.PI / 2),
  sineOut: (s) => Math.sin(s * Math.PI / 2),
  sineInOut: (s) => -(Math.cos(Math.PI * s) - 1) / 2,
  expoIn: (s) => s === 0 ? 0 : Math.pow(2, 10 * (s - 1)) * s + Math.pow(s, 6) * (1 - s),
  expoOut: (s) => s === 1 ? 1 : 1 - Math.pow(2, -10 * s),
  expoInOut: (s) => s === 0 ? 0 : s === 1 ? 1 : s < 0.5 ? Math.pow(2, 20 * s - 10) / 2 : (2 - Math.pow(2, -20 * s + 10)) / 2,
  circIn: (s) => 1 - Math.sqrt(1 - s * s),
  circOut: (s) => Math.sqrt(1 - (s - 1) * (s - 1)),
  circInOut: (s) => s < 0.5 ? (1 - Math.sqrt(1 - (2 * s) ** 2)) / 2 : (Math.sqrt(1 - (-2 * s + 2) ** 2) + 1) / 2,
  backIn: (s) => (N + 1) * s * s * s - N * s * s,
  backOut: (s) => (s--, 1 + (N + 1) * s * s * s + N * s * s),
  backInOut: (s) => {
    if (s < 0.5) {
      const t = 2 * s;
      return t * t * ((G + 1) * t - G) / 2;
    }
    const e = 2 * s - 2;
    return (e * e * ((G + 1) * e + G) + 2) / 2;
  },
  bounceIn: (s) => 1 - H(1 - s),
  bounceOut: H,
  bounceInOut: (s) => s < 0.5 ? (1 - H(1 - 2 * s)) / 2 : (1 + H(2 * s - 1)) / 2
}, ct = /* @__PURE__ */ new WeakMap();
let et = [], it = null;
function xt(s, e) {
  et.push({ instance: s, type: e }), it === null && (it = requestAnimationFrame(Vt));
}
function Vt() {
  const s = et.slice();
  et.length = 0, it = null;
  for (let e = 0; e < s.length; e++) {
    const { instance: t, type: i } = s[e];
    i === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let J = null;
function Lt() {
  return typeof window > "u" ? null : (J || (J = new IntersectionObserver(
    (s) => {
      for (let e = 0; e < s.length; e++) {
        const t = s[e], i = ct.get(t.target);
        i && (t.isIntersecting ? xt(i, "enter") : xt(i, "leave"));
      }
    },
    { threshold: 0.05 }
  )), J);
}
function Bt(s, e) {
  var t;
  ct.set(s, e), (t = Lt()) == null || t.observe(s);
}
function st(s) {
  var e;
  ct.delete(s), (e = Lt()) == null || e.unobserve(s);
}
function W(s, e) {
  if (s == null) return e;
  const t = s.trim();
  if (!t) return e;
  const i = Number(t);
  return Number.isFinite(i) ? i * 1e3 : e;
}
const w = typeof HTMLElement < "u" ? HTMLElement : class {
}, M = class M extends w {
  constructor() {
    super(...arguments);
    a(this, "animation");
    a(this, "options");
    a(this, "order", M.counter++);
  }
  static get mediaQuery() {
    return this._mediaQuery || (this._mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")), this._mediaQuery;
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
    t.sort((i, r) => i.order - r.order), t.forEach((i, r) => {
      i.play(r * 120);
    });
  }
  get isGroup() {
    return this.hasAttribute("group");
  }
  connectedCallback() {
    if (this.options = this.getOptions(), M.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), Bt(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), st(this), M.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || st(this), this.isGroup ? (M.groupQueue.add(this), M.scheduleGroup()) : this.play();
  }
  handleLeave() {
    this.hasAttribute("replay") && this.reset();
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, i = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, r = this.getAttribute("type") ?? "fade-up", n = this.getAttribute("easing"), [o, h] = i[r] ?? i["fade-up"];
    return {
      x: o,
      y: h,
      easing: n && n in F ? n : "strongInOut",
      duration: W(this.getAttribute("duration"), 400),
      delay: W(this.getAttribute("delay"), 0)
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
    var l;
    const { x: i, y: r, easing: n, duration: o, delay: h } = this.options;
    (l = this.animation) == null || l.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${i}px, ${r}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: o,
        delay: h + t,
        easing: n,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var c;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (c = this.animation) == null || c.cancel(), this.animation = void 0;
    };
  }
};
a(M, "counter", 0), a(M, "_mediaQuery", null), a(M, "groupQueue", /* @__PURE__ */ new Set()), a(M, "isProcessingGroup", !1);
let nt = M;
function Xt() {
  customElements.get("sx-animate") || customElements.define("sx-animate", nt);
}
class Ht {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Set());
    a(this, "_time", 0);
    a(this, "_delta", 0);
    a(this, "_frame", 0);
    a(this, "_start", this._now());
    a(this, "_last", this._start);
    a(this, "_lagThreshold", 500);
    a(this, "_adjustedLag", 33);
    a(this, "_gap", 1e3 / 240);
    a(this, "_nextTime", this._gap);
    a(this, "_id", null);
    a(this, "_tick", () => {
      let t = this._now() - this._last;
      (t > this._lagThreshold || t < 0) && (this._start += t - this._adjustedLag), this._last += t;
      const i = this._last - this._start, r = i - this._nextTime;
      if (r > 0) {
        this._frame++, this._delta = i - this._time * 1e3, this._time = i / 1e3, this._nextTime += r >= this._gap ? r + 4 : this._gap;
        const n = [...this._listeners];
        for (const o of n)
          o(this._time, this._delta, this._frame);
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
  _request(e) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(e) : setTimeout(e, 16);
  }
  _cancel(e) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(e);
      return;
    }
    clearTimeout(e);
  }
  _wake() {
    if (this._id !== null) return;
    const e = this._now();
    this._start = e - this._time * 1e3, this._last = e, this._tick();
  }
  add(e) {
    return this._listeners.add(e), this._wake(), e;
  }
  addOnce(e) {
    const t = (i, r, n) => {
      this.remove(t), e(i, r, n);
    };
    return this.add(t), t;
  }
  remove(e) {
    this._listeners.delete(e), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(e) {
    e = Math.max(1, e), this._gap = 1e3 / e, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(e = 500, t = 33) {
    this._lagThreshold = e || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(e = 60) {
    return this._delta / (1e3 / e);
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
const T = new Ht(), dt = {
  x: 0,
  y: 0,
  z: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0
}, U = 180 / Math.PI;
function Gt(s) {
  const e = window.getComputedStyle(s).transform;
  return !e || e === "none" ? { ...dt } : e.startsWith("matrix3d") ? Ut(e) : jt(e);
}
function jt(s) {
  const e = s.match(/matrix\(([^)]+)\)/);
  if (!e) return { ...dt };
  const t = e[1].split(",").map((p) => parseFloat(p.trim())), [i, r, n, o, h, l] = t, c = Math.sqrt(i * i + r * r), d = Math.sqrt(n * n + o * o), u = Math.atan2(r, i) * U;
  return {
    x: h,
    y: l,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: c,
    scaleX: c,
    scaleY: d,
    skewX: 0,
    skewY: 0
  };
}
function Ut(s) {
  const e = s.match(/matrix3d\(([^)]+)\)/);
  if (!e) return { ...dt };
  const t = e[1].split(",").map((b) => parseFloat(b.trim())), i = t[0], r = t[1], n = t[2], o = t[4], h = t[5], l = t[6];
  t[8], t[9];
  const c = t[10], d = t[12], u = t[13], p = t[14], f = Math.sqrt(i * i + r * r + n * n), g = Math.sqrt(o * o + h * h + l * l), m = Math.atan2(r, i) * U, y = Math.atan2(-n, Math.sqrt(l * l + c * c)) * U, S = Math.atan2(l, c) * U;
  return {
    x: d,
    y: u,
    z: p,
    rotate: m,
    rotateX: S,
    rotateY: y,
    rotateZ: m,
    scale: f,
    scaleX: f,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
const Kt = {
  x: 0,
  y: 0,
  z: 0,
  xPercent: 0,
  yPercent: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0
}, St = /* @__PURE__ */ new WeakMap();
function Qt(s) {
  const e = Gt(s);
  return {
    ...Kt,
    x: e.x,
    y: e.y,
    z: e.z,
    rotate: e.rotate,
    rotateX: e.rotateX,
    rotateY: e.rotateY,
    rotateZ: e.rotateZ,
    scale: e.scale,
    scaleX: e.scaleX,
    scaleY: e.scaleY,
    skewX: e.skewX,
    skewY: e.skewY
  };
}
function ut(s) {
  let e = St.get(s);
  return e || (e = Qt(s), St.set(s, e)), e;
}
function Zt(s, e) {
  return ut(s)[e];
}
function R(s, e, t) {
  ut(s)[e] = t;
}
function q(s) {
  const e = ut(s);
  return `translate(${e.xPercent}%, ${e.yPercent}%) translate3d(${e.x}px, ${e.y}px, ${e.z}px) rotate(${e.rotate}deg) rotateX(${e.rotateX}deg) rotateY(${e.rotateY}deg) rotateZ(${e.rotateZ}deg) scale(${e.scale}) scaleX(${e.scaleX}) scaleY(${e.scaleY}) skewX(${e.skewX}deg) skewY(${e.skewY}deg)`;
}
class Jt extends w {
  constructor() {
    super();
    a(this, "inner", null);
    a(this, "resizeObserver", null);
    a(this, "setupRafId", null);
    a(this, "offset", 0);
    a(this, "isHovered", !1);
    a(this, "cachedResetBounds", 0);
    a(this, "isSettingUp", !1);
    a(this, "isVisible", !1);
    a(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    a(this, "onMouseLeave", () => {
      this.isHovered && (this.isHovered = !1);
    });
    a(this, "updateAnimation", (t, i) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const r = i / 1e3, n = this.speed * r, o = this.direction, l = this.isVertical ? this.offsetHeight : this.offsetWidth;
      o === "left" || o === "up" ? (this.offset -= n, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = l)) : (this.offset += n, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= l && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), Bt(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, T.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, T.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), st(this), T.remove(this.updateAnimation);
  }
  attributeChangedCallback(t, i, r) {
    i !== r && (t === "gap" ? (this.updateGapVar(), setTimeout(() => this.scheduleSetup(), 50)) : (t === "direction" || t === "speed" || t === "clone") && this.scheduleSetup());
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
        const i = Array.from(
          this.inner.querySelectorAll(
            "sx-marquee-item:not([data-clone])"
          )
        );
        this.inner.replaceChildren(...i);
        const r = this.isVertical, n = r ? this.offsetHeight : this.offsetWidth, o = r ? this.inner.offsetHeight : this.inner.offsetWidth;
        if (this.clone && o > 0 && n > 0) {
          const h = o < n ? Math.ceil(n * 2 / o) : 2, l = document.createDocumentFragment();
          for (let c = 1; c < h; c++)
            for (const d of i) {
              const u = d.cloneNode(!0);
              u.setAttribute("data-clone", "true"), l.appendChild(u);
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
    let i = 0;
    const r = this.isVertical;
    for (let o = 0; o < t.length; o++)
      i += r ? t[o].offsetHeight : t[o].offsetWidth;
    const n = parseFloat(getComputedStyle(this.inner).gap) || 0;
    i += n * t.length, this.cachedResetBounds = i;
  }
  applyTransform(t) {
    this.inner && (R(this.inner, this.isVertical ? "y" : "x", t), this.inner.style.transform = q(this.inner));
  }
}
class te extends w {
}
class ee extends w {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function ie() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Jt), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", te), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", ee);
}
class se extends w {
  constructor() {
    super();
  }
}
class ne {
  constructor() {
    a(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(e, t) {
    this.sliders.set(e, t);
  }
  unregister(e) {
    this.sliders.delete(e);
  }
  get(e) {
    return this.sliders.get(e);
  }
}
const Y = new ne();
class re extends w {
  constructor() {
    super();
    a(this, "renderedSignature", "");
    a(this, "innerContainer", null);
    a(this, "snakeBar", null);
    a(this, "maxVisibleBullets", 5);
    a(this, "bulletWidthWithGap", 16);
    a(this, "lastActiveIndex", 0);
    a(this, "cachedBullets", []);
    a(this, "snakeTimeout", null);
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
    const i = t.target;
    if (i.classList.contains("sx-slider-pagination-bullet")) {
      const r = Number(i.getAttribute("data-index"));
      this.goToSlide(r);
    }
  }
  goToSlide(t) {
    const i = this.getAttribute("name");
    let r = null;
    i ? r = Y.get(i) : r = this.closest("sx-slider"), r && typeof r.goTo == "function" && r.goTo(t);
  }
  renderBullets(t) {
    const i = this.getAttribute("effect"), r = i === "dynamic", n = i === "snake", o = i === "fraction", h = t.join(",") + `_effect:${i}`;
    if (this.renderedSignature === h) return;
    if (this.renderedSignature = h, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const c = document.createElement("span");
      c.className = "sx-slider-pagination-current", c.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(c), p.appendChild(d), p.appendChild(u), this.appendChild(p);
      return;
    }
    const l = document.createDocumentFragment();
    if (n) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((c, d) => {
        const u = this.createBulletDOM(c, d, !1);
        this.cachedBullets.push(u), l.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", l.appendChild(this.snakeBar), this.appendChild(l);
      return;
    }
    if (r) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", l.appendChild(this.innerContainer), t.forEach((c, d) => {
        const u = this.createBulletDOM(c, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(l);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((c, d) => {
      const u = this.createBulletDOM(c, d, i === "number");
      this.cachedBullets.push(u), l.appendChild(u);
    }), this.appendChild(l);
  }
  createBulletDOM(t, i, r) {
    const n = document.createElement("span");
    return n.className = "sx-slider-pagination-bullet", n.setAttribute("data-index", t.toString()), n.setAttribute("role", "button"), n.setAttribute("tabindex", "0"), n.setAttribute("aria-label", `Go to slide ${i + 1}`), r && (n.textContent = (i + 1).toString()), n;
  }
  updateActive(t) {
    const i = this.getAttribute("effect");
    if (i === "fraction") {
      const u = this.querySelector(".sx-slider-pagination-current");
      u && (u.textContent = (t + 1).toString());
      return;
    }
    const r = i === "dynamic", n = i === "snake", o = this.cachedBullets, h = o.length;
    if (h === 0) return;
    if (o.forEach((u, p) => {
      r && (u.className = "sx-slider-pagination-bullet"), p === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), n && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const m = t * 20, y = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const S = m - y + 10;
          this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const S = y - m + 10;
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!r || h <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (R(this.innerContainer, "x", 0), this.innerContainer.style.transform = q(this.innerContainer));
      return;
    }
    let l = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    l = Math.min(l, h - this.maxVisibleBullets);
    const c = l + this.maxVisibleBullets - 1;
    o.forEach((u, p) => {
      p >= l && p <= c ? p === l ? u.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === l + 1 ? u.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === c ? u.classList.add(
        p === h - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === c - 1 ? u.classList.add(
        p === h - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -l * this.bulletWidthWithGap;
    R(this.innerContainer, "x", d), this.innerContainer.style.transform = q(this.innerContainer);
  }
}
class oe extends w {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (e) => {
      (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Next slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const e = this.getAttribute("name");
    if (e) {
      const t = Y.get(e);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class ae extends w {
  constructor() {
    super();
    a(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, i, r) {
    const n = Math.max(0, Math.min(1, t));
    this.bar.style.transition = r || "none", i === "vertical" ? (this.bar.style.transformOrigin = "top center", R(this.bar, "scaleY", n), R(this.bar, "scaleX", 1)) : (this.bar.style.transformOrigin = "left center", R(this.bar, "scaleX", n), R(this.bar, "scaleY", 1)), this.bar.style.transform = q(this.bar);
  }
}
class le extends w {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (e) => {
      (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Previous slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const e = this.getAttribute("name");
    if (e) {
      const t = Y.get(e);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class he {
  constructor(e, t, i = 0.92) {
    a(this, "velocity", 0);
    a(this, "friction");
    a(this, "onUpdate");
    a(this, "onComplete");
    a(this, "isRunning", !1);
    a(this, "tickerCallback");
    this.onUpdate = e, this.onComplete = t, this.friction = i, this.tickerCallback = (r, n, o) => this.loop(n);
  }
  setFriction(e) {
    this.friction = e;
  }
  addVelocity(e) {
    this.velocity += e, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, T.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, T.add(this.tickerCallback));
  }
  loop(e) {
    if (!this.isRunning) return;
    const t = e / 16.67, i = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= i;
  }
}
class ce extends w {
  constructor() {
    super();
    a(this, "sliderCha", null);
    a(this, "isDragging", !1);
    a(this, "startX", 0);
    a(this, "currentTranslate", 0);
    a(this, "prevTranslate", 0);
    a(this, "isResetting", !1);
    a(this, "dragXs", []);
    a(this, "dragTimes", []);
    a(this, "velocity", 0);
    a(this, "scrollDuration", 0);
    a(this, "scrollStartTime", 0);
    a(this, "scrollFrom", 0);
    a(this, "scrollToTarget", 0);
    a(this, "scrollFriction", 1);
    a(this, "isScrollAnimating", !1);
    a(this, "noConstrain", !1);
    a(this, "lastClientAxis", 0);
    a(this, "lastWheelTime", 0);
    a(this, "boundWheel", this.onWheel.bind(this));
    a(this, "boundDragStart", this.dragStart.bind(this));
    a(this, "boundDragMove", this.dragMove.bind(this));
    a(this, "boundDragEnd", this.dragEnd.bind(this));
    a(this, "handleScrollEnd", () => {
      if (!this.sliderCha) return;
      const t = this.sliderCha.options;
      if (t.snap || t.drag !== "free")
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.updatePosition();
      else if (!t.loop) {
        const { max: i, min: r } = this.sliderCha.getBoundaries(), n = Math.max(
          r,
          Math.min(i, this.currentTranslate)
        );
        n !== this.currentTranslate && this.startMomentumScroll(n, 400);
      }
      this.sliderCha.startAutoplay();
    });
    a(this, "wheelInertia", new he(
      (t) => {
        if (this.sliderCha) {
          if (this.currentTranslate += t, this.sliderCha.options.loop)
            this.checkLoopBoundsInstant();
          else {
            const { max: i, min: r } = this.sliderCha.getBoundaries(), n = this.sliderCha.options.edgeResistance;
            this.currentTranslate > i ? n <= 0 ? (this.currentTranslate = i, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate > i + n ? (this.currentTranslate = i + n, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.currentTranslate < r ? n <= 0 ? (this.currentTranslate = r, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate < r - n ? (this.currentTranslate = r - n, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.wheelInertia.setFriction(0.92);
          }
          this.setTransform(this.currentTranslate);
        }
      },
      () => this.handleScrollEnd(),
      0.92
    ));
    a(this, "scrollTickerCallback", () => this.runScrollLoop());
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
        let i = -t.deltaY * 0.15;
        if (!this.sliderCha.options.loop) {
          const { max: r, min: n } = this.sliderCha.getBoundaries();
          (this.currentTranslate > r && i > 0 || this.currentTranslate < n && i < 0) && (i *= 0.2);
        }
        this.wheelInertia.addVelocity(i);
      } else {
        const i = performance.now();
        i - this.lastWheelTime > 400 && (t.deltaY > 0 ? this.sliderCha.next() : t.deltaY < 0 && this.sliderCha.prev(), this.lastWheelTime = i), this.sliderCha.startAutoplay();
      }
  }
  getPositionAxis(t) {
    if (!this.sliderCha) return 0;
    const i = this.sliderCha.options.direction === "vertical";
    return t instanceof MouseEvent ? i ? t.clientY : t.clientX : i ? t.touches[0].clientY : t.touches[0].clientX;
  }
  dragStart(t) {
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.isResetting || (this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.wheelInertia.stop(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionAxis(t), this.lastClientAxis = this.startX, this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant());
  }
  dragMove(t) {
    if (!this.isDragging || !this.sliderCha) return;
    t.cancelable && t.preventDefault();
    const i = this.getPositionAxis(t);
    this.lastClientAxis = i;
    const r = performance.now();
    for (this.dragXs.push(i), this.dragTimes.push(r); this.dragTimes.length > 0 && r - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const n = i - this.startX;
    let o = this.prevTranslate + n;
    if (this.sliderCha.options.loop)
      this.currentTranslate = o, this.checkLoopBoundsInstant();
    else {
      const { max: h, min: l } = this.sliderCha.getBoundaries(), c = this.sliderCha.options.edgeResistance;
      o > h ? o = c <= 0 ? h : h + Math.min(c, (o - h) * 0.3) : o < l && (o = c <= 0 ? l : l - Math.min(c, (l - o) * 0.3)), this.currentTranslate = o;
    }
    this.setTransform(this.currentTranslate);
  }
  dragEnd() {
    if (!this.isDragging || !this.sliderCha) return;
    this.isDragging = !1;
    const t = this.sliderCha.options, i = performance.now();
    if (this.dragTimes.length > 0) {
      const r = this.dragTimes[this.dragTimes.length - 1];
      if (i - r > 10)
        this.velocity = 0;
      else {
        const n = r - this.dragTimes[0];
        n > 0 ? this.velocity = (this.dragXs[this.dragXs.length - 1] - this.dragXs[0]) / n : this.velocity = 0;
      }
    } else
      this.velocity = 0;
    if (t.drag === "free") {
      this.prevTranslate = this.currentTranslate;
      let n = this.currentTranslate + this.velocity * 400;
      if (t.snap) {
        const o = parseFloat(this.sliderCha.startPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(n);
        const h = this.sliderCha.getCurrentIndex();
        let l = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap();
        const c = this.children[h];
        let d = t.autoSize ? (c ? c.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          n = o + u / 2 - (l + d / 2);
        } else
          n = o - l;
        if (!t.loop) {
          const { max: u, min: p } = this.sliderCha.getBoundaries();
          n = Math.max(p, Math.min(u, n));
        }
      }
      if (t.loop)
        this.startMomentumScroll(n);
      else {
        const { max: o, min: h } = this.sliderCha.getBoundaries(), l = Math.max(
          h,
          Math.min(o, n)
        );
        this.startMomentumScroll(l);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out, height ${t.speed}ms ease-out`;
      const r = this.lastClientAxis - this.startX;
      if (t.perMove === "auto") {
        const n = this.sliderCha.getCurrentIndex();
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.getCurrentIndex() === n ? r < -50 ? this.sliderCha.next() : r > 50 ? this.sliderCha.prev() : this.updatePosition() : this.updatePosition();
      } else
        r < -50 ? this.sliderCha.next() : r > 50 ? this.sliderCha.prev() : this.updatePosition();
      this.sliderCha.startAutoplay();
    }
  }
  startMomentumScroll(t, i, r, n = !1) {
    var h;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = n;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = i ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (h = this.sliderCha) != null && h.options.loop && this.checkLoopBoundsInstant(), r && r();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, T.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const i = performance.now() - this.scrollStartTime, r = Math.min(i / this.scrollDuration, 1), n = F.quartOut(r), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * n - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: l, min: c } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > l || this.currentTranslate < c) {
        if (this.currentTranslate > l) {
          if (d <= 0) {
            this.currentTranslate = l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > l + d) {
            this.currentTranslate = l + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(l, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < c) {
          if (d <= 0) {
            this.currentTranslate = c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < c - d) {
            this.currentTranslate = c - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(c, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const p = this.currentTranslate > l ? l : c;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    r >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, T.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, T.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, i = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, r = parseFloat(this.sliderCha.startPadding) || 0;
    let n = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(i), n = this.sliderCha.getOffsetForIndex(i + t) - o;
    else {
      const m = this.sliderCha.getSlideSizeWithGap();
      o = i * m, n = t * m;
    }
    let h = 0;
    if (this.sliderCha.options.centered) {
      const m = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let y = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), b = this.children[i];
        y = b ? b.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        y = this.sliderCha.getSlideSizeWithGap();
      h = m / 2 - y / 2;
    }
    const l = -o + r + h, c = l - n;
    let d = !1, u = this.currentTranslate, p = 0, f = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > l + g ? (u = this.currentTranslate - n, p = -n, f = t, d = !0) : this.currentTranslate <= c - g && (u = this.currentTranslate + n, p = n, f = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + f
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (R(this, this.sliderCha.transformFn === "translateY" ? "y" : "x", t), this.style.transform = q(this), this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const i = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${i.speed}ms ease-out, height ${i.speed}ms ease-out`;
    const r = parseFloat(this.sliderCha.startPadding) || 0, n = this.sliderCha.getCurrentIndex();
    let o = r, h = 0, l = 0;
    if (i.autoSize) {
      h = this.sliderCha.getOffsetForIndex(n);
      const c = Array.from(this.children), d = this.sliderCha.convertToPx(i.gap);
      l = c[n] ? c[n].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const c = this.sliderCha.getSlideSizeWithGap();
      h = n * c, l = c;
    }
    if (i.centered) {
      const c = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += c / 2 - (h + l / 2);
    } else
      o -= h;
    if (!i.loop) {
      const { max: c, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(c, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, i.loop) {
      const c = this.sliderCha.originalSlidesCount, d = i.autoSize ? c : i.perView;
      (n >= d + c || n < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, i.speed);
    }
  }
}
class K {
  static parse(e) {
    if (!e) return null;
    try {
      let t = e.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(e, t, i) {
    if (!i) return { ...t };
    let r = { ...t };
    const n = Object.keys(i).map(Number).sort((o, h) => o - h);
    for (const o of n)
      if (e >= o) {
        const h = this.kebabToCamel(i[o]);
        r = { ...r, ...h };
      }
    return r;
  }
  static kebabToCamel(e) {
    if (typeof e != "object" || e === null) return e;
    const t = {};
    for (const i in e) {
      const r = i.replace(/-([a-z])/g, (n) => n[1].toUpperCase());
      t[r] = e[i];
    }
    return t;
  }
}
class de extends w {
  constructor() {
    super();
    a(this, "options");
    a(this, "originalOptions");
    a(this, "breakpointsConfig", null);
    a(this, "currentIndex", 0);
    a(this, "lastFiredIndex", -1);
    a(this, "track", null);
    a(this, "resizeObserver");
    a(this, "originalSlidesCount", 0);
    a(this, "autoplayTimer", null);
    a(this, "isFirstInit", !0);
    a(this, "lastContainerSize", 0);
    a(this, "isFirstHeightMeasure", !0);
    a(this, "isClickRouting", !1);
    a(this, "handleVisibilityChange", () => {
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
  updateProgress(t, i) {
    let r = 0, n = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const c = this.originalSlidesCount;
      if (c > 0 && this.track) {
        const d = this.options.autoSize ? c : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let p = 0, f = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(d), f = this.getOffsetForIndex(d + c) - p;
        else {
          const g = this.getSlideSizeWithGap();
          p = d * g, f = c * g;
        }
        if (f > 0) {
          n = o / f;
          let g = 0;
          if (this.options.centered) {
            let S = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            g = o / 2 - S / 2;
          }
          r = (-p + u + g - t) / f, r = (r % 1 + 1) % 1;
        } else
          r = 1, n = 1;
      }
    } else {
      const { max: c, min: d } = this.getBoundaries(), u = c - d;
      u > 0 ? (r = (c - t) / u, n = o / (u + o)) : (r = 1, n = 1);
    }
    n = Math.max(0, Math.min(1, n));
    const h = n + r * (1 - n);
    let l = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const c = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      l = [.../* @__PURE__ */ new Set([...l, ...c])];
    }
    l.forEach((c) => {
      typeof c.update == "function" && c.update(h, this.options.direction, i);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && Y.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;
        const t = this.getBoundingClientRect()[this.sizeDim];
        t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
      });
    }), this.resizeObserver.observe(this), this.track) {
      let t = 0, i = 0;
      this.track.addEventListener("mousedown", (r) => {
        t = r.clientX, i = r.clientY;
      }), this.track.addEventListener(
        "touchstart",
        (r) => {
          r.touches.length > 0 && (t = r.touches[0].clientX, i = r.touches[0].clientY);
        },
        { passive: !0 }
      ), this.track.addEventListener("click", (r) => {
        const n = Math.abs(r.clientX - t), o = Math.abs(r.clientY - i);
        if (n > 6 || o > 6) return;
        const h = r.target.closest("sx-slider-slide");
        if (!h) return;
        const l = h.getAttribute("data-real-index");
        if (l !== null) {
          const c = parseInt(l, 10);
          this.goTo(c, !0);
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
    ), this.options.name && Y.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (f) => f ? isNaN(Number(f)) ? f : `${f}px` : "0px", i = this.getAttribute("edge-resistance"), r = i !== null ? Number(i) : 100, n = this.getAttribute("interval"), o = W(n, 4e3), h = this.getAttribute("start-index"), l = h !== null ? Number(h) : 0, c = this.getAttribute("per-move");
    let d = "auto";
    if (c !== null && c !== "auto") {
      const f = Number(c);
      d = isNaN(f) ? "auto" : f;
    }
    let u = this.getAttribute("direction");
    u !== "horizontal" && u !== "vertical" && (u = "horizontal");
    let p = this.getAttribute("effect");
    p !== "fade" && (p = "slide"), this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: t(this.getAttribute("gap")),
      drag: this.getAttribute("drag") || "true",
      speed: W(this.getAttribute("speed"), 300),
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(r) ? 0 : r,
      loop: this.hasAttribute("loop"),
      grabCursor: this.hasAttribute("grab-cursor"),
      snap: this.hasAttribute("snap"),
      autoplay: this.hasAttribute("autoplay"),
      interval: isNaN(o) ? 4e3 : o,
      startIndex: isNaN(l) ? 0 : l,
      autoSize: this.hasAttribute("auto-size"),
      perMove: d,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: u,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: p,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = K.parse(
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
    this.track.querySelectorAll("[data-clone]").forEach((n) => n.remove());
    const i = Array.from(this.track.children);
    if (this.originalSlidesCount = i.length, this.originalSlidesCount === 0) return;
    i.forEach((n, o) => {
      n.setAttribute("data-real-index", o.toString());
    });
    const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
    for (let n = 0; n < r; n++) {
      const h = i[i.length - 1 - n].cloneNode(!0);
      h.setAttribute("data-clone", "prev"), this.track.insertBefore(h, this.track.firstChild);
    }
    for (let n = 0; n < r; n++) {
      const h = i[n].cloneNode(!0);
      h.setAttribute("data-clone", "next"), this.track.appendChild(h);
    }
  }
  destroyLoopClones() {
    if (!this.track) return;
    this.track.querySelectorAll("[data-clone]").forEach((i) => i.remove()), this.originalSlidesCount = 0;
  }
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    this.style.setProperty("--sx-speed", `${this.options.speed}ms`);
    const t = this.getBoundingClientRect()[this.sizeDim];
    let i = Array.from(this.track.children);
    if (i.length === 0) return;
    if (this.options.loop || i.forEach((f, g) => {
      f.setAttribute("data-real-index", g.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = K.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const f = (g) => g == null || g === "" ? "0px" : isNaN(Number(g)) ? String(g) : `${g}px`;
      this.options.gap = f(this.options.gap), this.options.leftPadding = f(this.options.leftPadding), this.options.rightPadding = f(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), i = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), i = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, i.length - 1)
    ));
    const r = this.track.querySelectorAll("[data-clone]").length, n = i.length - r;
    if (this.isFirstInit && n > 0) {
      const f = Math.max(
        0,
        Math.min(this.options.startIndex, n - 1)
      );
      if (this.options.loop) {
        const g = this.options.autoSize ? n : this.options.perView;
        this.currentIndex = g + f;
      } else
        this.currentIndex = f;
      this.isFirstInit = !1;
    }
    const o = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === n && o && parseFloat(o) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(h));
    const l = this.convertToPx(this.options.gap), c = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      i.forEach((f) => {
        f.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, i.forEach((f) => {
        const g = f.firstElementChild;
        g ? f.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : f.style[this.sizeDim] = "max-content", f.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - c - d - l * (this.options.perView - 1)) / this.options.perView;
      i.forEach((y) => {
        y.style[this.sizeDim] = `${m}px`, y.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const p = i.filter((f) => !f.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let f = 0;
      p.forEach((g) => {
        f += this.getRectSize(g) + l;
      }), f -= l, u = f < t;
    } else
      u = n < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((g) => g.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    if (!t || t === "0px" || t === "0") return 0;
    if (t.endsWith("px"))
      return parseFloat(t);
    const i = document.createElement("div");
    i.style.display = "none", i.style.width = t, document.body.appendChild(i);
    const r = parseFloat(getComputedStyle(i).width);
    return document.body.removeChild(i), r || 0;
  }
  getSlideSizeWithGap() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children[0];
    return this.getRectSize(t) + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let i = 0, r = 0;
    const n = this.convertToPx(this.options.gap), o = Array.from(this.track.children);
    for (let h = 0; h < o.length && (i += this.getRectSize(o[h]) + n, !(i - n > t)); h++)
      r++;
    return Math.max(1, r);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const i = Array.from(this.track.children), r = this.convertToPx(this.options.gap);
    let n = 0;
    for (let o = 0; o < t; o++)
      i[o] && (n += this.getRectSize(i[o]) + r);
    return n;
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let i = 0;
    if (this.options.autoSize)
      i = this.getOffsetForIndex(this.track.children.length), i -= this.convertToPx(this.options.gap);
    else {
      const r = this.track.children.length;
      i = this.getSlideSizeWithGap() * r - this.convertToPx(this.options.gap);
    }
    return Math.max(0, i - t);
  }
  getBoundaries() {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], i = parseFloat(this.startPadding) || 0, r = this.convertToPx(this.options.gap), n = this.track.children.length;
    let o = 0, h = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let l = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + r : this.getSlideSizeWithGap();
      o = i + t / 2 - l / 2;
      let c = n - 1, d = this.options.autoSize ? this.getOffsetForIndex(c) : c * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[c] ? this.getRectSize(this.track.children[c]) : 0) + r : this.getSlideSizeWithGap();
      h = i + t / 2 - (d + u / 2);
    }
    return { max: o, min: Math.min(o, h) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const i = this.options.loop, r = i ? this.originalSlidesCount : t.length;
    if (r === 0) return;
    const n = i ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (b) => {
      if (!i) return b;
      let v = (b - n) % r;
      return v < 0 && (v += r), v;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), l = o(this.currentIndex);
    this.lastFiredIndex !== l && (this.lastFiredIndex = l, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: l }
      })
    ));
    const c = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + h), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let f = null;
    p && (f = document.createElement("style"), f.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(f), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((b, v) => {
      b.removeAttribute("sx-slide-active"), b.removeAttribute("sx-slide-prev"), b.removeAttribute("sx-slide-next"), b.removeAttribute("sx-slide-center");
      let C = o(v);
      b.setAttribute("aria-label", `${C + 1}/${r}`), C === l && b.setAttribute("sx-slide-active", ""), C === c && b.setAttribute("sx-slide-prev", ""), C === d && b.setAttribute("sx-slide-next", ""), C === u && b.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const g = i ? r - 1 : this.getRealMaxIndex(), m = this.getResolvedPerMove();
    let y = [];
    if (m > 1 && !this.options.autoSize) {
      let b = 0;
      for (; b < g; )
        y.push(b), b += m;
      b !== g && y.push(g);
    } else
      for (let b = 0; b <= g; b++)
        y.push(b);
    let S = y.indexOf(l);
    if (S === -1) {
      for (let b = y.length - 1; b >= 0; b--)
        if (l >= y[b]) {
          S = b;
          break;
        }
    }
    this.updatePagination(y, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((v) => v.trim()).forEach((v) => {
      const C = Y.get(v);
      C && C.syncFromController(l);
    }), p && f && requestAnimationFrame(() => {
      f == null || f.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const i = this.options.loop, r = Array.from(this.track.children), n = this.track.querySelectorAll("[data-clone]").length, o = i ? this.originalSlidesCount : r.length - n;
    if (((l) => {
      if (!i) return l;
      const c = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (l - c) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (i) {
        const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView, c = t + l, d = this.originalSlidesCount, u = r.length;
        let p = c, f = Math.abs(c - this.currentIndex);
        [c - d, c, c + d].forEach((m) => {
          if (m >= 0 && m < u) {
            const y = Math.abs(m - this.currentIndex);
            y < f && (f = y, p = m);
          }
        }), this.currentIndex = p;
      } else
        this.currentIndex = Math.max(0, Math.min(t, o - 1));
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
    const i = this.options.perView, r = this.options.centered ? Math.floor(i / 2) : 0;
    let n = this.currentIndex - r;
    this.options.loop || (n = Math.max(0, n));
    const o = [];
    for (let l = 0; l < i; l++) {
      let c = n + l;
      this.options.loop && (c < 0 ? c = t.length + c : c >= t.length && (c = c % t.length));
      const d = t[c];
      if (d) {
        const u = d.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const p = u.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let h = 0;
    o.forEach((l) => {
      const c = l.firstElementChild, d = c ? c.getBoundingClientRect().height : l.getBoundingClientRect().height;
      d > h && (h = d);
    }), o.forEach((l) => {
      var c;
      (c = this.track) == null || c.removeChild(l);
    }), h > 0 && (this.track.style.height = `${h}px`);
  }
  getCurrentIndex() {
    if (!this.track) return 0;
    const t = this.options.loop, i = Array.from(this.track.children), r = t ? this.originalSlidesCount : i.length;
    if (r === 0) return 0;
    const n = t ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0;
    let o = t ? (this.currentIndex - n) % r : this.currentIndex;
    return o < 0 && (o += r), o;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: i } = this.getBoundaries();
    for (let r = 0; r < t; r++) {
      let n = this.options.autoSize ? this.getOffsetForIndex(r) : r * this.getSlideSizeWithGap(), o = this.options.autoSize ? this.getRectSize(this.track.children[r]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), h = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const l = this.getBoundingClientRect()[this.sizeDim];
        h += l / 2 - (n + o / 2);
      } else
        h -= n;
      if (h <= i + 1)
        return r;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), i = (this.currentIndex % t + t) % t, r = i !== 0 ? t - i : t;
    if (this.options.loop)
      this.currentIndex += r, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const n = this.getRealMaxIndex();
      this.currentIndex < n ? this.currentIndex = Math.min(n, this.currentIndex + r) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), i = (this.currentIndex % t + t) % t, r = i !== 0 ? i : t;
    this.options.loop ? (this.currentIndex -= r, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - r) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  goTo(t, i = !1) {
    if (this.track) {
      if (i && (this.isClickRouting = !0), this.options.loop) {
        const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView, n = t + r, o = this.originalSlidesCount, h = this.track.children.length;
        let l = n, c = Math.abs(n - this.currentIndex);
        [n - o, n, n + o].forEach((u) => {
          if (u >= 0 && u < h) {
            const p = Math.abs(u - this.currentIndex);
            p < c && (c = p, l = u);
          }
        }), this.currentIndex = l;
      } else {
        const r = Array.from(this.track.children), n = this.track.querySelectorAll("[data-clone]").length, o = r.length - n;
        this.currentIndex = Math.max(0, Math.min(t, o - 1));
      }
      this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
  }
  alignIndexToFreeTranslation(t) {
    if (!this.track) return;
    const i = parseFloat(this.startPadding) || 0, r = this.getBoundingClientRect()[this.sizeDim], n = Array.from(this.track.children), o = this.convertToPx(this.options.gap);
    let h = 0, l = 1 / 0;
    const c = this.currentIndex;
    for (let d = 0; d < n.length; d++) {
      let u = 0, p = 0;
      if (this.options.autoSize)
        u = this.getOffsetForIndex(d), p = this.getRectSize(n[d]) + o;
      else {
        const m = this.getSlideSizeWithGap();
        u = d * m, p = m;
      }
      let f = i;
      if (this.options.centered ? f += r / 2 - (u + p / 2) : f -= u, !this.options.loop) {
        const { max: m, min: y } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? f = Math.max(
          y,
          Math.min(m, f)
        ) : this.options.centered || (d === 0 && (f = 0), f < y && (f = y), f > 0 && (f = 0));
      }
      const g = Math.abs(t - f);
      g < l - 0.5 ? (l = g, h = d) : Math.abs(g - l) <= 0.5 && Math.abs(d - c) < Math.abs(h - c) && (h = d, l = g);
    }
    if (this.currentIndex = h, !this.options.loop) {
      const d = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, d);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
  updateNavigation() {
    let t = Array.from(this.querySelectorAll("sx-slider-prev")), i = Array.from(this.querySelectorAll("sx-slider-next"));
    if (this.options.name) {
      const n = Array.from(
        document.querySelectorAll(
          `sx-slider-prev[name="${this.options.name}"]`
        )
      ), o = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`
        )
      );
      t = [.../* @__PURE__ */ new Set([...t, ...n])], i = [.../* @__PURE__ */ new Set([...i, ...o])];
    }
    if (this.options.loop || this.options.rewind) {
      t.forEach((n) => n.removeAttribute("sx-disabled")), i.forEach((n) => n.removeAttribute("sx-disabled"));
      return;
    }
    this.currentIndex <= 0 ? t.forEach((n) => n.setAttribute("sx-disabled", "")) : t.forEach((n) => n.removeAttribute("sx-disabled"));
    const r = this.getRealMaxIndex();
    this.currentIndex >= r ? i.forEach((n) => n.setAttribute("sx-disabled", "")) : i.forEach((n) => n.removeAttribute("sx-disabled"));
  }
  updatePagination(t, i) {
    let r = Array.from(
      this.querySelectorAll("sx-slider-pagination")
    );
    if (this.options.name) {
      const n = Array.from(
        document.querySelectorAll(
          `sx-slider-pagination[name="${this.options.name}"]`
        )
      );
      r = [.../* @__PURE__ */ new Set([...r, ...n])];
    }
    r.forEach((n) => {
      typeof n.renderBullets == "function" && n.renderBullets(t), typeof n.updateActive == "function" && n.updateActive(i);
    });
  }
}
function ue() {
  customElements.get("sx-slider") || customElements.define("sx-slider", de), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", ce), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", se), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", ae), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", le), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", re), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", oe);
}
const z = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);",
  effect: "zoom",
  position: "center"
}, E = class E extends w {
  constructor() {
    super();
    a(this, "isOpen", !1);
    a(this, "previousActiveElement", null);
    a(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    a(this, "backdropEl", null);
    a(this, "dialogCoreEl", null);
    a(this, "closeCursorEl", null);
    a(this, "movingCloseCursor", !1);
    a(this, "originalContentHTML", "");
    a(this, "breakpointsConfig", null);
    a(this, "originalOptions", null);
    a(this, "resizeRaf", null);
    a(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    a(this, "handleResize", () => {
      this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.resizeRaf = requestAnimationFrame(() => this.applyBreakpoints());
    });
    a(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape") {
          t.stopPropagation(), this.closeOnEscKey && (t.preventDefault(), this.close());
          return;
        }
        t.key === "Tab" && (t.stopPropagation(), this.trapFocus(t));
      }
    });
    a(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
    a(this, "handleBackdropPointerMove", (t) => {
      !this.closeCursorEl || !this.closeOnOutsideClick || (this.closeCursorEl.style.transform = `translate3d(${t.clientX}px, ${t.clientY}px, 0) translate(-50%, -50%)`, this.closeCursorEl.classList.contains("is-visible") || (this.closeCursorEl.classList.add("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "none")));
    });
    a(this, "handleBackdropPointerLeave", () => {
      var t;
      (t = this.closeCursorEl) == null || t.classList.remove("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "");
    });
  }
  static get observedAttributes() {
    return ["sx-open", "duration", "scrollable", "overlay", "overlay-style", "effect", "position", "breakpoints"];
  }
  get name() {
    return this.getAttribute("name");
  }
  get duration() {
    const t = this.getAttribute("duration");
    return W(t, z.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : z.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : z.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : z.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : z.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || z.overlayStyle;
  }
  get effect() {
    return this.getAttribute("effect") || z.effect;
  }
  get position() {
    return this.getAttribute("position") || z.position;
  }
  connectedCallback() {
    this.originalContentHTML = this.innerHTML, this.originalOptions = {
      duration: this.duration,
      closeOnOutsideClick: this.closeOnOutsideClick,
      closeOnEscKey: this.closeOnEscKey,
      scrollable: this.scrollable,
      overlay: this.overlay,
      overlayStyle: this.overlayStyle,
      effect: this.effect,
      position: this.position
    }, this.breakpointsConfig = K.parse(this.getAttribute("breakpoints")), this.render(), this.applyBreakpoints(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), window.addEventListener("resize", this.handleResize), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    var i;
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), window.removeEventListener("resize", this.handleResize), this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.removeEventListener("keydown", this.handleKeyDown), this.setInertOnSiblings(!1), (i = this.closeCursorEl) == null || i.remove(), this.closeCursorEl = null;
    const t = E.openStack.indexOf(this);
    t !== -1 && E.openStack.splice(t, 1);
  }
  applyBreakpoints() {
    if (!this.breakpointsConfig || !this.originalOptions) return;
    const t = K.getMatch(
      window.innerWidth,
      this.originalOptions,
      this.breakpointsConfig
    );
    this.setAttribute("effect", t.effect), this.setAttribute("position", t.position), this.setAttribute("duration", String(t.duration / 1e3)), this.setAttribute("close-on-outside-click", String(t.closeOnOutsideClick)), this.setAttribute("close-on-esc-key", String(t.closeOnEscKey)), this.setAttribute("scrollable", String(t.scrollable)), this.setAttribute("overlay", String(t.overlay)), this.setAttribute("overlay-style", t.overlayStyle), this.style.setProperty("--sx-duration", `${this.duration}ms`), this.syncOverlay();
  }
  syncOverlay() {
    this.overlay ? (this.backdropEl || (this.backdropEl = document.createElement("div"), this.backdropEl.className = "sx-dialog-backdrop", this.attachBackdropListeners(this.backdropEl), this.insertBefore(this.backdropEl, this.firstChild)), this.backdropEl.setAttribute("style", this.overlayStyle)) : this.backdropEl && (this.detachBackdropListeners(this.backdropEl), this.backdropEl.remove(), this.backdropEl = null);
  }
  registerCloseCursor(t) {
    if (this.closeCursorEl && this.closeCursorEl !== t) {
      const i = this.closeCursorEl;
      this.closeCursorEl = null, i.remove();
    }
    this.movingCloseCursor = !0, document.body.appendChild(t), this.movingCloseCursor = !1, this.closeCursorEl = t;
  }
  unregisterCloseCursor(t) {
    this.movingCloseCursor || this.closeCursorEl === t && (this.closeCursorEl = null);
  }
  dispatchLifecycleEvent(t, i = !1) {
    const r = new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      cancelable: i,
      detail: { name: this.name }
    });
    return this.dispatchEvent(r), !r.defaultPrevented;
  }
  open() {
    var t;
    return this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-open", !0) ? !1 : (this.isOpen = !0, this.clearDragStyles(), this.dialogCoreEl && (this.dialogCoreEl.scrollTop = 0), E.openStack.push(this), this.style.zIndex = String(E.baseZIndex + E.openStack.length), this.setAttribute("sx-open", ""), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "false"), this.previousActiveElement = document.activeElement, this.lockScroll(), this.setInertOnSiblings(!0), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }), !0);
  }
  close() {
    var i;
    if (!this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-close", !0)) return !1;
    this.isOpen = !1, this.handleBackdropPointerLeave();
    const t = E.openStack.indexOf(this);
    return t !== -1 && E.openStack.splice(t, 1), this.style.zIndex = "", this.removeAttribute("sx-open"), (i = this.dialogCoreEl) == null || i.setAttribute("aria-hidden", "true"), this.unlockScroll(), this.setInertOnSiblings(!1), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration), !0;
  }
  get coreElement() {
    return this.dialogCoreEl;
  }
  get dragAxis() {
    return E.DRAG_MAP[this.position].axis;
  }
  get dragSign() {
    return E.DRAG_MAP[this.position].sign;
  }
  beginDrag() {
    this.dialogCoreEl && (this.dialogCoreEl.style.transition = "none");
  }
  updateDrag(t) {
    if (!this.dialogCoreEl) return;
    const i = this.dragAxis === "y" ? "translateY" : "translateX";
    this.dialogCoreEl.style.transform = `${i}(${t}px)`;
  }
  endDrag(t) {
    if (!this.dialogCoreEl) return;
    const i = `${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    if (t) {
      const r = this.dragAxis === "y" ? "translateY" : "translateX", n = (this.dragAxis === "y" ? window.innerHeight : window.innerWidth) * this.dragSign;
      this.dialogCoreEl.style.transition = `transform ${i}, opacity ${i}`, this.dialogCoreEl.style.transform = `${r}(${n}px)`, this.dialogCoreEl.style.opacity = "0", this.close() || (this.dialogCoreEl.style.transform = "", this.dialogCoreEl.style.opacity = "");
    } else
      this.dialogCoreEl.style.transition = `transform ${i}`, this.dialogCoreEl.style.transform = "";
  }
  clearDragStyles() {
    this.dialogCoreEl && (this.dialogCoreEl.style.transition = "", this.dialogCoreEl.style.transform = "", this.dialogCoreEl.style.opacity = "");
  }
  // ✅ Inert background helper
  setInertOnSiblings(t) {
    let i = this.parentElement;
    for (; i && (Array.from(i.children).forEach((r) => {
      r !== this && r !== this.closeCursorEl && !r.contains(this) && (t ? (r.setAttribute("inert", ""), r.setAttribute("aria-hidden", "true")) : (r.removeAttribute("inert"), r.removeAttribute("aria-hidden")));
    }), i.tagName !== "BODY"); )
      i = i.parentElement;
  }
  lockScroll() {
    if (this.scrollable || document.body.style.overflow === "hidden") return;
    const t = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty("--sx-scrollbar-width", `${t}px`), document.body.style.paddingRight = "var(--sx-scrollbar-width)", document.body.style.overflow = "hidden";
  }
  unlockScroll() {
    this.scrollable || setTimeout(() => {
      Array.from(document.querySelectorAll("sx-dialog[sx-open]")).some((r) => !r.scrollable) || (document.body.style.paddingRight = "", document.body.style.overflow = "", document.body.style.removeProperty("--sx-scrollbar-width"));
    }, this.duration);
  }
  getFocusableElements() {
    return this.dialogCoreEl ? Array.from(this.dialogCoreEl.querySelectorAll(this.focusableElementsString)).filter((t) => t.tabIndex !== -1 && t.disabled !== !0) : [];
  }
  focusFirstElement() {
    const t = this.querySelector("[autofocus]");
    if (t) {
      t.focus();
      return;
    }
    const i = this.getFocusableElements();
    i.length ? i[0].focus() : this.dialogCoreEl && this.dialogCoreEl.focus();
  }
  // ✅ Focus Trap logic (Chặn vòng lặp Tab / Shift+Tab)
  trapFocus(t) {
    const i = this.getFocusableElements();
    if (i.length === 0) {
      t.preventDefault();
      return;
    }
    const r = i[0], n = i[i.length - 1];
    t.shiftKey ? document.activeElement === r && (t.preventDefault(), n.focus()) : document.activeElement === n && (t.preventDefault(), r.focus());
  }
  attachBackdropListeners(t) {
    t.addEventListener("click", this.handleBackdropClick), t.addEventListener("pointermove", this.handleBackdropPointerMove), t.addEventListener("pointerleave", this.handleBackdropPointerLeave);
  }
  detachBackdropListeners(t) {
    t.removeEventListener("click", this.handleBackdropClick), t.removeEventListener("pointermove", this.handleBackdropPointerMove), t.removeEventListener("pointerleave", this.handleBackdropPointerLeave);
  }
  render() {
    this.style.setProperty("--sx-duration", `${this.duration}ms`), this.setAttribute("effect", this.effect), this.setAttribute("position", this.position);
    const t = this.querySelector('[id*="title"], [class*="title"]'), i = this.querySelector('[id*="desc"], [class*="desc"]'), r = t ? `aria-labelledby="${t.id || "sx-dialog-title"}"` : "", n = i ? `aria-describedby="${i.id || "sx-dialog-desc"}"` : "";
    t && !t.id && (t.id = "sx-dialog-title"), i && !i.id && (i.id = "sx-dialog-desc"), this.innerHTML = `
      ${this.overlay ? `<div class="sx-dialog-backdrop" style="${this.overlayStyle}"></div>` : ""}
      <div class="sx-dialog-core" 
           role="dialog" 
           aria-modal="true" 
           aria-hidden="true"
           tabindex="-1"
           ${r}
           ${n}>
        ${this.originalContentHTML}
      </div>
    `, this.backdropEl = this.querySelector(".sx-dialog-backdrop"), this.dialogCoreEl = this.querySelector(".sx-dialog-core"), this.backdropEl && this.attachBackdropListeners(this.backdropEl);
  }
};
a(E, "DRAG_MAP", {
  center: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
  right: { axis: "x", sign: 1 },
  "top-left": { axis: "y", sign: -1 },
  "top-right": { axis: "y", sign: -1 },
  "bottom-left": { axis: "y", sign: 1 },
  "bottom-right": { axis: "y", sign: 1 }
}), a(E, "baseZIndex", 9999), a(E, "openStack", []);
let rt = E;
class pe extends w {
  constructor() {
    super(...arguments);
    a(this, "handleKeyDown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.toggleDialog());
    });
    a(this, "toggleDialog", () => {
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
class fe extends w {
  constructor() {
    super(...arguments);
    a(this, "dialogEl", null);
    a(this, "pointerId", null);
    a(this, "startPos", 0);
    a(this, "startTime", 0);
    a(this, "currentOffset", 0);
    a(this, "dragging", !1);
    a(this, "handlePointerDown", (t) => {
      var i;
      this.dialogEl = this.closest("sx-dialog"), (i = this.dialogEl) != null && i.coreElement && (this.pointerId = t.pointerId, this.dragging = !0, this.startTime = performance.now(), this.currentOffset = 0, this.startPos = this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX, this.dialogEl.beginDrag(), this.setPointerCapture(t.pointerId), this.addEventListener("pointermove", this.handlePointerMove), this.addEventListener("pointerup", this.handlePointerEnd), this.addEventListener("pointercancel", this.handlePointerEnd));
    });
    a(this, "handlePointerMove", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      const r = (this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX) - this.startPos, n = this.dialogEl.dragSign;
      this.currentOffset = r * n > 0 ? r : 0, this.dialogEl.updateDrag(this.currentOffset);
    });
    a(this, "handlePointerEnd", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      this.dragging = !1, this.removeEventListener("pointermove", this.handlePointerMove), this.removeEventListener("pointerup", this.handlePointerEnd), this.removeEventListener("pointercancel", this.handlePointerEnd), this.pointerId !== null && this.releasePointerCapture(this.pointerId);
      const i = performance.now() - this.startTime, r = i > 0 ? Math.abs(this.currentOffset) / i : 0, n = this.dialogEl.coreElement.getBoundingClientRect(), o = this.dialogEl.dragAxis === "y" ? n.height : n.width, h = Math.abs(this.currentOffset) > o * this.threshold || r > 0.5;
      this.dialogEl.endDrag(h);
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "separator"), this.hasAttribute("aria-hidden") || this.setAttribute("aria-hidden", "true"), this.addEventListener("pointerdown", this.handlePointerDown);
  }
  disconnectedCallback() {
    this.removeEventListener("pointerdown", this.handlePointerDown), this.removeEventListener("pointermove", this.handlePointerMove), this.removeEventListener("pointerup", this.handlePointerEnd), this.removeEventListener("pointercancel", this.handlePointerEnd);
  }
  get threshold() {
    const t = Number(this.getAttribute("threshold"));
    return t > 0 && t < 1 ? t : 0.25;
  }
}
class ge extends w {
  constructor() {
    super(...arguments);
    a(this, "dialogEl", null);
  }
  connectedCallback() {
    var t;
    this.hasAttribute("aria-hidden") || this.setAttribute("aria-hidden", "true"), this.dialogEl = this.closest("sx-dialog"), (t = this.dialogEl) == null || t.registerCloseCursor(this);
  }
  disconnectedCallback() {
    var t;
    (t = this.dialogEl) == null || t.unregisterCloseCursor(this), this.dialogEl = null;
  }
}
function me() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", rt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", pe), customElements.get("sx-dialog-pull") || customElements.define("sx-dialog-pull", fe), customElements.get("sx-close-cursor") || customElements.define("sx-close-cursor", ge);
}
function be() {
  ie(), Xt(), ue(), me();
}
const Ot = /* @__PURE__ */ new Map();
function x(s, e) {
  Ot.set(s, e);
}
function j(s, e) {
  const t = Ot.get(s);
  return t ? typeof t == "function" ? t(e) : t : s.startsWith("--") ? ye(s, e) : xe(s, e);
}
function ye(s, e) {
  return typeof e == "string" && !Dt(e) ? {
    type: "discrete",
    cssKey: s,
    apply(t, i) {
      t.style.setProperty(s, i);
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const i = window.getComputedStyle(t).getPropertyValue(s).trim();
      return i || console.warn(`[six-js] CSS variable "${s}" not set, defaulting to 0`), _(i);
    },
    apply(t, i) {
      t.style.setProperty(s, `${i.num}${i.unit}`);
    }
  };
}
function Dt(s) {
  return /^-?[\d.]+[a-z%]*$/i.test(s.trim());
}
function xe(s, e) {
  return typeof e == "string" && !Dt(e) ? {
    type: "discrete",
    cssKey: s,
    apply(t, i) {
      t.style[s] = i;
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const i = window.getComputedStyle(t)[s];
      return i === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${s}"`), { num: 0, unit: "" }) : _(i);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
function _(s, e = "") {
  if (typeof s == "number")
    return { num: s, unit: e };
  if (typeof s != "string" || s.length === 0)
    return { num: 0, unit: e };
  const t = s.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || e } : { num: parseFloat(s) || 0, unit: e };
}
const Se = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function ve(s, e, t, i) {
  if (typeof s != "string")
    return _(s, i);
  const r = s.match(Se);
  if (!r)
    return _(s, i);
  const [, n, o, h] = r, l = parseFloat(o), c = h || t || i;
  if (isNaN(l))
    return console.warn(`[six-js] Invalid relative value: "${s}"`), { num: e, unit: c };
  if (n === "/" && l === 0)
    return console.warn(`[six-js] Division by zero: "${s}"`), { num: e, unit: c };
  let d;
  switch (n) {
    case "+":
      d = e + l;
      break;
    case "-":
      d = e - l;
      break;
    case "*":
      d = e * l;
      break;
    case "/":
      d = e / l;
      break;
    default:
      d = e;
  }
  return { num: d, unit: c };
}
const Ce = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function vt(s) {
  const e = document.createElement("span");
  e.style.color = s, e.style.display = "none", document.body.appendChild(e);
  const t = window.getComputedStyle(e).color;
  return document.body.removeChild(e), Ft(t);
}
function Ft(s) {
  const e = s.match(Ce);
  return e ? {
    r: parseFloat(e[1]),
    g: parseFloat(e[2]),
    b: parseFloat(e[3]),
    a: e[4] !== void 0 ? parseFloat(e[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function ke(s, e, t) {
  return {
    r: s.r + (e.r - s.r) * t,
    g: s.g + (e.g - s.g) * t,
    b: s.b + (e.b - s.b) * t,
    a: s.a + (e.a - s.a) * t
  };
}
function we(s) {
  return `rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a})`;
}
const ot = /-?[\d.]+/g;
function Ct(s) {
  return (s.match(ot) || []).length;
}
function Ee(s, e, t) {
  const i = Ct(s), r = Ct(e), n = i === r && r > 0;
  return n || console.warn(`[six-js] "${t}": shape mismatch (${i} vs ${r} numbers), will snap instead of interpolate`), n;
}
function Te(s, e, t) {
  const i = (s.match(ot) || []).map(Number);
  let r = 0;
  return e.replace(ot, (n) => {
    const o = parseFloat(n), h = i[r] ?? o;
    r++;
    const l = h + (o - h) * t;
    return String(Math.round(l * 1e3) / 1e3);
  });
}
function $t(s, e, t) {
  const i = s.style[e];
  s.style[e] = t;
  const r = parseFloat(window.getComputedStyle(s)[e]) || 0;
  return s.style[e] = i, r;
}
const Ae = /^random\((.+)\)$/i;
function Me(s) {
  return /^-?[\d.]+$/.test(s.trim());
}
function Pe(s) {
  const e = s.match(Ae);
  if (!e) return s;
  const t = e[1].split(",").map((i) => i.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${s}"`), s;
  if (t.length === 2 && t.every(Me)) {
    const i = parseFloat(t[0]), r = parseFloat(t[1]);
    return i + Math.random() * (r - i);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function D(s, e, t) {
  let i = s;
  return typeof i == "function" && (i = i(e, t)), typeof i == "string" && (i = Pe(i)), i;
}
let at = {};
function Re(s) {
  at = { ...at, ...s };
}
function kt() {
  return at;
}
function wt(s, e, t) {
  return !e || !t.unit || t.unit === "px" ? t : { num: $t(s, e === "x" ? "left" : "top", `${t.num}${t.unit}`), unit: "px" };
}
class pt {
  constructor(e, t, i = "to", r) {
    a(this, "duration");
    a(this, "targets");
    a(this, "targetTracks", []);
    a(this, "pointWindows", []);
    a(this, "activeWindows", /* @__PURE__ */ new Set());
    a(this, "implicitRefreshers", []);
    if (typeof e == "string" ? this.targets = Array.from(document.querySelectorAll(e)) : Array.isArray(e) ? this.targets = e.filter((n) => n != null) : this.targets = e ? [e] : [], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${e}"`), t.keyframes) {
      const n = Object.keys(t).filter((h) => h !== "duration" && h !== "ease" && h !== "keyframes");
      n.length > 0 && console.warn(
        `[six-js] keyframes: property [${n.join(", ")}] ngoài keyframes sẽ bị BỎ QUA hoàn toàn, không cộng dồn với các mốc bên trong keyframes. Đưa chúng vào 1 mốc trong keyframes nếu muốn animate.`
      );
      const o = this.buildKeyframeTracks(t.keyframes, t);
      this.targetTracks = o.tracks, this.pointWindows = o.pointWindows, this.duration = o.duration;
    } else {
      const n = this.buildSingleTrackSet(t, i, r);
      this.targetTracks = n.tracks, this.duration = n.duration;
    }
    this.applyWillChange();
  }
  get targetElements() {
    return this.targets;
  }
  resolveEase(e) {
    return e && !F[e] && console.warn(`[six-js] Unknown ease "${e}", falling back to linear`), e && F[e] || F.linear;
  }
  resolveDuration(e, t) {
    let i = e ?? t.duration ?? 0.5;
    return i < 0 && (console.warn(`[six-js] Negative duration (${i}), using 0 instead`), i = 0), i;
  }
  resolveProp(e, t, i, r) {
    const n = j(t, r ?? i);
    if (n.type === "discrete") {
      const c = String(r ?? i);
      return {
        key: t,
        isTransform: !1,
        state: { kind: "discrete", value: c, apply: n.apply }
      };
    }
    if (n.type === "color") {
      const c = i !== void 0 ? vt(String(i)) : n.getCurrent(e), d = r !== void 0 ? vt(String(r)) : n.getCurrent(e);
      return { key: t, isTransform: !1, state: { kind: "color", start: c, end: d, apply: n.apply } };
    }
    if (n.type === "complex") {
      const c = i !== void 0 ? String(i) : n.getCurrent(e), d = r !== void 0 ? String(r) : n.getCurrent(e);
      return Ee(c, d, t), { key: t, isTransform: !1, state: { kind: "complex", start: c, end: d, apply: n.apply } };
    }
    let o = i !== void 0 ? _(i, n.defaultUnit) : n.getCurrent(e, t), h = r !== void 0 ? ve(r, o.num, o.unit, n.defaultUnit) : n.getCurrent(e, t), l;
    if (n.pxAxis && (o = wt(e, n.pxAxis, o), h = wt(e, n.pxAxis, h)), !n.isTransform && h.unit && o.unit && h.unit !== o.unit) {
      const c = $t(e, t, `${h.num}${h.unit}`);
      l = `${h.num}${h.unit}`, h = { num: c, unit: o.unit };
    }
    return {
      key: t,
      isTransform: n.isTransform,
      state: {
        kind: "numeric",
        start: o.num,
        end: h.num,
        unit: h.unit || o.unit,
        isTransform: n.isTransform,
        transformFn: n.transformFn,
        apply: n.apply,
        snapEnd: l
      }
    };
  }
  registerImplicitRefresh(e, t, i, r, n) {
    if (n.kind === "discrete") return;
    const o = j(t, r ?? i);
    i === void 0 && (n.kind === "numeric" && o.type === "numeric" ? this.implicitRefreshers.push(() => {
      n.start = o.getCurrent(e, t).num;
    }) : n.kind === "color" && o.type === "color" ? this.implicitRefreshers.push(() => {
      n.start = o.getCurrent(e);
    }) : n.kind === "complex" && o.type === "complex" && this.implicitRefreshers.push(() => {
      n.start = o.getCurrent(e);
    })), r === void 0 && (n.kind === "numeric" && o.type === "numeric" ? this.implicitRefreshers.push(() => {
      n.end = o.getCurrent(e, t).num;
    }) : n.kind === "color" && o.type === "color" ? this.implicitRefreshers.push(() => {
      n.end = o.getCurrent(e);
    }) : n.kind === "complex" && o.type === "complex" && this.implicitRefreshers.push(() => {
      n.end = o.getCurrent(e);
    }));
  }
  buildSingleTrackSet(e, t, i) {
    const r = kt(), n = this.resolveDuration(e.duration, r), o = this.resolveEase(e.ease ?? r.ease), h = /* @__PURE__ */ new Set();
    for (const c in e) h.add(c);
    if (i) for (const c in i) h.add(c);
    h.delete("duration"), h.delete("ease"), h.delete("keyframes");
    const l = this.targets.map(() => []);
    return this.targets.forEach((c, d) => {
      for (const u of h) {
        let p, f;
        t === "to" ? f = D(e[u], d, c) : t === "from" ? p = D(e[u], d, c) : (u in e && (f = D(e[u], d, c)), i && u in i && (p = D(i[u], d, c)));
        const g = j(u, f ?? p);
        if (g.type === "discrete") {
          const y = { kind: "discrete", value: String(f ?? p), apply: g.apply };
          l[d].push({ key: u, isTransform: !1, entries: [{ startTime: 0, endTime: n, easeFn: o, state: y }] });
          continue;
        }
        const m = this.resolveProp(c, u, p, f);
        m && (l[d].push({
          key: m.key,
          isTransform: m.isTransform,
          entries: [{ startTime: 0, endTime: n, easeFn: o, state: m.state }]
        }), this.registerImplicitRefresh(c, u, p, f, m.state));
      }
    }), { tracks: l, duration: n };
  }
  buildKeyframeTracks(e, t) {
    const i = kt(), r = t.duration, n = t.ease ?? i.ease, o = Array.isArray(e) ? this.normalizeArrayKeyframes(e, r, n, i) : this.normalizePercentKeyframes(e, r, n, i);
    o.length < 2 && console.warn(`[six-js] keyframes needs at least 2 points, got ${o.length}`);
    const h = this.targets.map(() => ({})), l = this.targets.map(() => []), c = this.targets.map(() => ({})), d = [];
    let u = 0, p = 0;
    for (let f = 0; f < o.length - 1; f++) {
      const g = o[f], m = o[f + 1], y = u + m.delay, S = y + m.duration;
      u = S, p = Math.max(p, S);
      const b = /* @__PURE__ */ new Set();
      for (const v in m.props) b.add(v);
      this.targets.forEach((v, C) => {
        for (const k of b) {
          const L = D(m.props[k], C, v), V = k in g.props ? D(g.props[k], C, v) : k in h[C] ? h[C][k] : void 0, X = j(k, L);
          let B, P = !1;
          if (X.type === "discrete")
            B = { kind: "discrete", value: String(L), apply: X.apply };
          else {
            const Z = this.resolveProp(v, k, V, L);
            if (!Z) continue;
            B = Z.state, P = Z.isTransform;
          }
          h[C][k] = L, f === 0 && this.registerImplicitRefresh(v, k, V, L, B);
          const O = { startTime: y, endTime: S, easeFn: m.easeFn, state: B }, yt = c[C][k];
          yt !== void 0 ? l[C][yt].entries.push(O) : (c[C][k] = l[C].length, l[C].push({ key: k, isTransform: P, entries: [O] }));
        }
      }), d.push({
        startTime: y,
        endTime: S,
        onStart: m.onSegmentStart,
        onUpdate: m.onSegmentUpdate,
        onComplete: m.onSegmentComplete
      });
    }
    return { tracks: l, pointWindows: d, duration: p };
  }
  normalizeArrayKeyframes(e, t, i, r) {
    const n = [{ duration: 0, delay: 0, easeFn: F.linear, props: {} }], o = e.filter((c) => c.duration === void 0).length, h = e.reduce((c, d) => c + (d.duration ?? 0), 0), l = t !== void 0 ? o > 0 ? Math.max(0, t - h) / o : 0 : r.duration ?? 0.5;
    for (const c of e) {
      const { duration: d, ease: u, delay: p, onStart: f, onUpdate: g, onComplete: m, ...y } = c, S = this.resolveDuration(d ?? l, r), b = this.resolveEase(u ?? i);
      n.push({
        duration: S,
        delay: p ?? 0,
        easeFn: b,
        props: y,
        onSegmentStart: f,
        onSegmentUpdate: g,
        onSegmentComplete: m
      });
    }
    return n;
  }
  normalizePercentKeyframes(e, t, i, r) {
    const n = this.resolveDuration(t, r), o = Object.entries(e).map(([l, c]) => {
      const d = l.trim().match(/^(-?[\d.]+)%$/);
      return d ? { pos: parseFloat(d[1]) / 100, props: c } : (console.warn(`[six-js] keyframes: invalid position "${l}", expected e.g. "50%"`), null);
    }).filter((l) => l !== null).sort((l, c) => l.pos - c.pos);
    o.length > 0 && o[0].pos !== 0 && console.warn(`[six-js] keyframes: first position should be "0%", got "${o[0].pos * 100}%"`);
    const h = [];
    for (let l = 0; l < o.length; l++) {
      const { ease: c, delay: d, onStart: u, onUpdate: p, onComplete: f, ...g } = o[l].props, m = l === 0 ? o[0].pos : o[l - 1].pos, y = l === 0 ? 0 : (o[l].pos - m) * n;
      h.push({
        duration: Math.max(0, y),
        delay: d ?? 0,
        easeFn: this.resolveEase(c ?? i),
        props: g,
        onSegmentStart: u,
        onSegmentUpdate: p,
        onSegmentComplete: f
      });
    }
    return h;
  }
  render(e) {
    this.targets.forEach((t, i) => {
      const r = this.targetTracks[i];
      let n = !1;
      for (const o of r) {
        const h = o.entries;
        let l = h[0];
        for (const g of h)
          if (g.startTime <= e) l = g;
          else break;
        const c = l.endTime - l.startTime, d = c <= 0 ? e >= l.startTime ? 1 : 0 : Math.min(Math.max((e - l.startTime) / c, 0), 1), u = l.easeFn(d), p = l.state;
        if (p.kind === "discrete") {
          e >= l.startTime && p.apply(t, p.value);
          continue;
        }
        if (p.kind === "color") {
          p.apply(t, ke(p.start, p.end, u));
          continue;
        }
        if (p.kind === "complex") {
          p.apply(t, Te(p.start, p.end, u));
          continue;
        }
        const f = p.start + (p.end - p.start) * u;
        p.isTransform && p.transformFn ? (R(t, p.transformFn, f), n = !0) : d === 1 && e >= l.endTime && p.snapEnd !== void 0 ? t.style[o.key] = p.snapEnd : p.apply(t, { num: f, unit: p.unit });
      }
      n && (t.style.transform = q(t));
    }), this.updateSegmentCallbacks(e);
  }
  updateSegmentCallbacks(e) {
    if (this.pointWindows.length === 0) return;
    const t = /* @__PURE__ */ new Set();
    this.pointWindows.forEach((i, r) => {
      e >= i.startTime && e <= i.endTime && t.add(r);
    }), this.activeWindows.forEach((i) => {
      var r, n;
      t.has(i) || (n = (r = this.pointWindows[i]).onComplete) == null || n.call(r);
    }), t.forEach((i) => {
      var r, n;
      this.activeWindows.has(i) || (n = (r = this.pointWindows[i]).onStart) == null || n.call(r);
    }), t.forEach((i) => {
      var r, n;
      (n = (r = this.pointWindows[i]).onUpdate) == null || n.call(r);
    }), this.activeWindows = t;
  }
  onStart() {
    for (const e of this.implicitRefreshers) e();
    this.applyWillChange();
  }
  applyWillChange() {
    this.targets.forEach((e, t) => {
      var i;
      (i = this.targetTracks[t]) != null && i.some((r) => r.isTransform) && (this.targets[t].style.willChange = "transform");
    });
  }
  onComplete() {
    this.targets.forEach((e, t) => {
      var i;
      (i = this.targetTracks[t]) != null && i.some((r) => r.isTransform) && (this.targets[t].style.willChange = "");
    });
  }
  getTouchedProperties() {
    return this.targets.map((e, t) => ({
      target: e,
      keys: this.targetTracks[t].map((i) => i.key)
    }));
  }
}
class lt {
  constructor(e, t = {}) {
    a(this, "animatable");
    a(this, "elapsed", 0);
    a(this, "rate", 1);
    a(this, "running", !1);
    a(this, "dead", !1);
    a(this, "listeners", {});
    a(this, "delay");
    a(this, "repeat");
    a(this, "repeatDelay");
    a(this, "boomerang");
    a(this, "repeatsDone", 0);
    a(this, "waitRemaining");
    a(this, "hasFiredStart", !1);
    a(this, "isBoomerangReverse", !1);
    a(this, "tick", (e, t) => {
      const i = t / 1e3;
      if (this.waitRemaining > 0) {
        if (this.waitRemaining -= i, this.waitRemaining > 0) return;
        const n = -this.waitRemaining;
        this.waitRemaining = 0, this.fireStartIfNeeded(), this.elapsed += n * this.rate;
      } else
        this.fireStartIfNeeded(), this.elapsed += i * this.rate;
      const r = this.animatable.duration;
      if (this.elapsed >= r) {
        this.elapsed = r, this.animatable.render(this.elapsed), this.emit("update"), this.onForwardBoundary();
        return;
      }
      if (this.elapsed <= 0) {
        this.elapsed = 0, this.animatable.render(this.elapsed), this.emit("update"), this.onBackwardBoundary();
        return;
      }
      this.animatable.render(this.elapsed), this.emit("update");
    });
    this.animatable = e, this.delay = Math.max(0, t.delay ?? 0), this.repeat = t.repeat ?? 0, this.repeatDelay = Math.max(0, t.repeatDelay ?? 0), this.boomerang = t.boomerang ?? !1, this.waitRemaining = this.delay, t.autoplay ?? !0 ? this.play() : this.animatable.render(0);
  }
  fireStartIfNeeded() {
    var e, t;
    this.hasFiredStart || (this.hasFiredStart = !0, (t = (e = this.animatable).onStart) == null || t.call(e), this.emit("start"));
  }
  onForwardBoundary() {
    if (!(this.repeat === -1 || this.repeatsDone < this.repeat)) {
      this.stop(), this.emit("complete");
      return;
    }
    this.repeatsDone++, this.emit("repeat"), this.boomerang ? (this.rate = -1, this.isBoomerangReverse = !0) : (this.elapsed = 0, this.rate = 1, this.animatable.render(this.elapsed, !0)), this.repeatDelay > 0 && (this.waitRemaining = this.repeatDelay);
  }
  onBackwardBoundary() {
    if (this.isBoomerangReverse) {
      if (!(this.repeat === -1 || this.repeatsDone < this.repeat)) {
        this.stop(), this.emit("complete");
        return;
      }
      this.repeatsDone++, this.emit("repeat"), this.rate = 1, this.isBoomerangReverse = !1, this.repeatDelay > 0 && (this.waitRemaining = this.repeatDelay);
      return;
    }
    this.stop(), this.emit("reverseComplete");
  }
  play() {
    var e, t;
    return this.dead || this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, T.add(this.tick), this.waitRemaining <= 0 && ((t = (e = this.animatable).onStart) == null || t.call(e)), this);
  }
  reverse() {
    var e, t;
    return this.dead ? this : (this.rate = -1, this.isBoomerangReverse = !1, this.running || (this.running = !0, (t = (e = this.animatable).onStart) == null || t.call(e), T.add(this.tick)), this);
  }
  pause() {
    return this.dead || !this.running ? this : (this.running = !1, T.remove(this.tick), this);
  }
  stop() {
    var e, t;
    this.running = !1, T.remove(this.tick), (t = (e = this.animatable).onComplete) == null || t.call(e);
  }
  seek(e) {
    return this.dead ? this : (this.elapsed = Math.max(0, Math.min(e, this.animatable.duration)), this.animatable.render(this.elapsed), this.emit("update"), this);
  }
  restart() {
    return this.dead ? this : (this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0, !0), this.play(), this);
  }
  reset() {
    return this.dead ? this : (this.pause(), this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0, !0), this.emit("update"), this);
  }
  kill() {
    return this.dead ? this : (this.dead = !0, this.pause(), this);
  }
  on(e, t) {
    return this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set()), this.listeners[e].add(t), this;
  }
  off(e, t) {
    var i;
    return (i = this.listeners[e]) == null || i.delete(t), this;
  }
  emit(e) {
    var t;
    (t = this.listeners[e]) == null || t.forEach((i) => i());
  }
  get progress() {
    return this.animatable.duration === 0 ? 1 : this.elapsed / this.animatable.duration;
  }
  get duration() {
    return this.animatable.duration;
  }
  get isRunning() {
    return this.running;
  }
  get isDead() {
    return this.dead;
  }
  getAnimatable() {
    return this.animatable;
  }
}
function ht() {
  var s;
  return ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight;
}
function $(s, e) {
  return s.ratio * e + s.offsetPx;
}
function Et(s) {
  const e = s.trim(), t = e.match(/^(-?[\d.]+)(px)?$/);
  if (t)
    return { ratio: 0, offsetPx: parseFloat(t[1]) };
  const i = e.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);
  if (!i || !i[1] && !i[2])
    return console.warn(`[six-js] onScroll: unknown position "${s}", using "top"`), { ratio: 0, offsetPx: 0 };
  const [, r, n, o, h] = i;
  let l = 0;
  r === "center" ? l = 0.5 : r === "bottom" ? l = 1 : r != null && r.endsWith("%") && (l = parseFloat(r) / 100);
  let c = 0;
  if (n && o) {
    const d = parseFloat(o), u = n === "+=" ? d : -d;
    h === "%" ? l += u / 100 : c += u;
  }
  return { ratio: l, offsetPx: c };
}
function Tt(s, e, t) {
  const i = s.match(/^([+-]=)(\d+(\.\d+)?)$/);
  if (i) {
    if (t === void 0)
      return console.warn(`[six-js] onScroll: "${s}" has nothing to be relative to`), {
        scrollY: 0,
        viewportSpec: { ratio: 0, offsetPx: 0 },
        viewportLabel: s,
        documentY: 0,
        triggerLabel: s,
        triggerSpec: { ratio: 0, offsetPx: 0 }
      };
    const u = i[1] === "+=" ? 1 : -1, p = t + u * parseFloat(i[2]);
    return {
      scrollY: p,
      viewportSpec: { ratio: 0, offsetPx: 0 },
      viewportLabel: s,
      documentY: p,
      triggerLabel: s,
      triggerSpec: { ratio: 0, offsetPx: 0 }
    };
  }
  const [r = "top", n = "top"] = s.trim().split(/\s+/), o = Et(r), h = Et(n), c = window.scrollY + e.top + $(o, e.height), d = $(h, ht());
  return {
    scrollY: c - d,
    viewportSpec: h,
    viewportLabel: n,
    documentY: c,
    triggerLabel: r,
    triggerSpec: o
  };
}
const Ie = "sixjs:scrollY:";
function Yt() {
  return Ie + location.pathname + location.search;
}
function ze() {
  try {
    const s = sessionStorage.getItem(Yt());
    if (s === null) return null;
    const e = parseFloat(s);
    return Number.isFinite(e) ? e : null;
  } catch {
    return null;
  }
}
function Le() {
  try {
    sessionStorage.setItem(Yt(), String(window.scrollY));
  } catch {
  }
}
function Be() {
  var t;
  const [s] = ((t = performance.getEntriesByType) == null ? void 0 : t.call(performance, "navigation")) ?? [];
  if (s && "type" in s) {
    const i = s.type;
    return i === "reload" || i === "back_forward";
  }
  const e = performance.navigation;
  return (e == null ? void 0 : e.type) === 1 || (e == null ? void 0 : e.type) === 2;
}
let At = !1;
function Oe() {
  if (At) return;
  At = !0;
  try {
    "scrollRestoration" in history && (history.scrollRestoration = "manual");
  } catch {
  }
  const s = Be() ? ze() : null;
  s !== null && (window.scrollTo(0, s), window.addEventListener("load", () => window.scrollTo(0, s), { once: !0 }));
  let e = !1;
  window.addEventListener(
    "scroll",
    () => {
      e || (e = !0, requestAnimationFrame(() => {
        e = !1, Le();
      }));
    },
    { passive: !0 }
  );
}
const tt = 20, Mt = 24, De = 20;
class ft {
  constructor(e, t, i) {
    a(this, "triggerEl");
    a(this, "playable");
    a(this, "options");
    a(this, "startY", 0);
    a(this, "endY", 0);
    a(this, "startViewportSpec", { ratio: 0, offsetPx: 0 });
    a(this, "endViewportSpec", { ratio: 1, offsetPx: 0 });
    a(this, "startViewportLabel", "");
    a(this, "endViewportLabel", "");
    a(this, "startTriggerY", 0);
    a(this, "endTriggerY", 0);
    a(this, "startTriggerLabel", "");
    a(this, "endTriggerLabel", "");
    a(this, "startTriggerSpec", { ratio: 0, offsetPx: 0 });
    a(this, "triggerLabelsCollide", !1);
    a(this, "smoothedProgress", 0);
    a(this, "smoothInitialized", !1);
    a(this, "wasInside", !1);
    a(this, "lastScrollY", window.scrollY);
    a(this, "rafPending", !1);
    a(this, "pinSpacer", null);
    a(this, "pinState", "before");
    a(this, "pinOriginalStyles", null);
    a(this, "pinRectWidth", 0);
    a(this, "pinRectHeight", 0);
    a(this, "startMarker", null);
    a(this, "endMarker", null);
    a(this, "startTriggerMarker", null);
    a(this, "endTriggerMarker", null);
    a(this, "resizeObserver", null);
    a(this, "recalcRafPending", !1);
    a(this, "onScrollBound", () => this.requestUpdate());
    a(this, "onResizeBound", () => this.recalc());
    a(this, "onLoadBound", () => this.recalc());
    a(this, "tickerBound", (e, t) => this.tickSmooth(t));
    var r;
    Oe(), this.triggerEl = e, this.playable = t, this.options = i, i.debug && this.setupDebugMarkers(), this.recalc(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), (r = window.visualViewport) == null || r.addEventListener("resize", this.onResizeBound), document.readyState === "complete" ? this.recalc() : window.addEventListener("load", this.onLoadBound, { once: !0 }), this.setupResizeObserver(), typeof i.sync == "number" && T.add(this.tickerBound);
  }
  setupResizeObserver() {
    if (typeof ResizeObserver > "u") return;
    let e = !0;
    this.resizeObserver = new ResizeObserver(() => {
      if (e) {
        e = !1;
        return;
      }
      this.recalcRafPending || (this.recalcRafPending = !0, requestAnimationFrame(() => {
        this.recalcRafPending = !1, this.recalc();
      }));
    }), this.resizeObserver.observe(document.body), this.resizeObserver.observe(this.triggerEl);
  }
  recalc() {
    this.smoothInitialized = !1;
    const e = this.options.start ?? "top bottom", t = this.options.end ?? "bottom top";
    this.options.sticky && (this.setupPin(), this.refreshPinRect());
    const i = this.getMeasureRect(), r = Tt(e, i);
    this.startY = r.scrollY, this.startViewportSpec = r.viewportSpec, this.startViewportLabel = r.viewportLabel, this.startTriggerY = r.documentY, this.startTriggerLabel = r.triggerLabel, this.startTriggerSpec = r.triggerSpec;
    const n = Tt(t, i, this.startY);
    this.endY = n.scrollY, this.endViewportSpec = n.viewportSpec, this.endViewportLabel = n.viewportLabel, this.endTriggerY = n.documentY, this.endTriggerLabel = n.triggerLabel, this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < Mt, this.options.sticky && this.updatePinSpacer(), this.updateDebugMarkers(), this.update(), this.options.sticky && this.applyPinForState(this.pinState);
  }
  getMeasureRect() {
    return this.pinSpacer ? { top: this.pinSpacer.getBoundingClientRect().top, height: this.pinRectHeight } : this.triggerEl.getBoundingClientRect();
  }
  refreshPinRect() {
    if (this.pinState !== "before") return;
    const e = this.triggerEl.getBoundingClientRect();
    this.pinRectWidth = e.width, this.pinRectHeight = e.height;
  }
  computeProgress() {
    const e = window.scrollY;
    return Math.max(0, Math.min((e - this.startY) / (this.endY - this.startY), 1));
  }
  requestUpdate() {
    this.rafPending || (this.rafPending = !0, requestAnimationFrame(() => {
      this.rafPending = !1, this.update();
    }));
  }
  update() {
    var l, c, d, u, p, f, g, m, y, S, b, v;
    const e = window.scrollY, t = this.computeProgress(), i = e >= this.startY && e <= this.endY, r = e >= this.lastScrollY, n = i && !this.wasInside, o = !i && this.wasInside;
    n ? r ? (c = (l = this.options).onEnter) == null || c.call(l) : (u = (d = this.options).onEnterBack) == null || u.call(d) : o && (r ? (f = (p = this.options).onLeave) == null || f.call(p) : (m = (g = this.options).onLeaveBack) == null || m.call(g)), this.wasInside = i, this.lastScrollY = e, this.options.sticky && this.updatePinState(e), this.updateTriggerMarkerLabelFlip(e);
    const h = this.options.sync ?? !1;
    h === !1 ? n && r && ((S = (y = this.playable).play) == null || S.call(y)) : h === !0 && this.playable.seek(t * this.playable.duration), (v = (b = this.options).onUpdate) == null || v.call(b);
  }
  tickSmooth(e) {
    var o, h, l, c;
    if (typeof this.options.sync != "number") return;
    const t = this.computeProgress();
    if (!this.smoothInitialized) {
      this.smoothInitialized = !0, this.smoothedProgress = t, this.playable.seek(this.smoothedProgress * this.playable.duration), (h = (o = this.options).onUpdate) == null || h.call(o);
      return;
    }
    const i = Math.max(0.05, this.options.sync), r = e / 1e3, n = 1 - Math.exp(-3 * r / i);
    this.smoothedProgress += (t - this.smoothedProgress) * n, Math.abs(t - this.smoothedProgress) < 5e-4 && (this.smoothedProgress = t), this.playable.seek(this.smoothedProgress * this.playable.duration), (c = (l = this.options).onUpdate) == null || c.call(l);
  }
  setupPin() {
    var i;
    if (this.pinSpacer) return;
    const e = this.triggerEl.getBoundingClientRect(), t = document.createElement("div");
    t.style.position = "relative", (i = this.triggerEl.parentElement) == null || i.insertBefore(t, this.triggerEl), t.appendChild(this.triggerEl), this.pinOriginalStyles = {
      position: this.triggerEl.style.position,
      top: this.triggerEl.style.top,
      left: this.triggerEl.style.left,
      width: this.triggerEl.style.width,
      zIndex: this.triggerEl.style.zIndex
    }, this.pinSpacer = t, this.pinRectWidth = e.width, this.pinRectHeight = e.height;
  }
  updatePinSpacer() {
    if (!this.pinSpacer) return;
    const e = Math.max(0, this.endY - this.startY);
    this.pinSpacer.style.width = `${this.pinRectWidth}px`, this.pinSpacer.style.height = `${this.pinRectHeight + e}px`;
  }
  updatePinState(e) {
    if (!this.pinSpacer) return;
    const t = e < this.startY ? "before" : e > this.endY ? "after" : "during";
    t !== this.pinState && (this.pinState = t, this.applyPinForState(t));
  }
  applyPinForState(e) {
    e === "before" ? this.applyPinBefore() : e === "during" ? this.applyPinDuring() : this.applyPinAfter();
  }
  applyPinDuring() {
    if (!this.pinSpacer) return;
    const e = this.pinSpacer.getBoundingClientRect(), t = $(this.startViewportSpec, ht()), i = $(this.startTriggerSpec, this.pinRectHeight), r = t - i;
    this.triggerEl.style.position = "fixed", this.triggerEl.style.top = `${r}px`, this.triggerEl.style.left = `${e.left}px`, this.triggerEl.style.width = `${this.pinRectWidth}px`, this.triggerEl.style.zIndex = "10";
  }
  applyPinAfter() {
    const e = Math.max(0, this.endY - this.startY);
    this.triggerEl.style.position = "absolute", this.triggerEl.style.top = `${e}px`, this.triggerEl.style.left = "0px", this.triggerEl.style.width = `${this.pinRectWidth}px`, this.triggerEl.style.zIndex = "10";
  }
  applyPinBefore() {
    this.pinOriginalStyles && Object.assign(this.triggerEl.style, this.pinOriginalStyles);
  }
  teardownPin() {
    var e;
    this.pinSpacer && (this.pinOriginalStyles && Object.assign(this.triggerEl.style, this.pinOriginalStyles), (e = this.pinSpacer.parentElement) == null || e.insertBefore(this.triggerEl, this.pinSpacer), this.pinSpacer.remove(), this.pinSpacer = null, this.pinState = "before");
  }
  setupDebugMarkers() {
    this.startMarker = this.createMarkerLine({ color: "#4ade80", align: "left", position: "fixed" }), this.startTriggerMarker = this.createMarkerLine({ color: "#4ade80", align: "right", position: "absolute" }), this.endMarker = this.createMarkerLine({ color: "#f87171", align: "left", position: "fixed" }), this.endTriggerMarker = this.createMarkerLine({ color: "#f87171", align: "right", position: "absolute" });
  }
  createMarkerLine(e) {
    const { color: t, align: i, position: r } = e, n = document.createElement("div");
    n.style.cssText = `
      position: ${r};
      left: 0;
      width: 100%;
      border-top: 2px dashed ${t};
      z-index: 999999;
      pointer-events: none;
      will-change: transform;
    `;
    const o = document.createElement("span");
    return o.style.cssText = `
      position: absolute;
      ${i}: 0;
      background: ${t};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `, this.applyLabelSide(o, "above"), n.appendChild(o), document.body.appendChild(n), { line: n, label: o };
  }
  applyLabelSide(e, t, i = 0) {
    const r = i * De;
    t === "above" ? (e.style.top = `${-1 - r}px`, e.style.transform = "translateY(-100%)") : (e.style.top = `${1 + r}px`, e.style.transform = "translateY(0)");
  }
  setMarkerPosition(e, t, i, r = 0) {
    e.line.style.top = `${t}px`, this.applyLabelSide(e.label, i < tt ? "below" : "above", r);
  }
  updateTriggerMarkerLabelFlip(e) {
    if (this.startTriggerMarker) {
      const t = this.startTriggerY - e;
      this.applyLabelSide(this.startTriggerMarker.label, t < tt ? "below" : "above", 0);
    }
    if (this.endTriggerMarker) {
      const t = this.endTriggerY - e, i = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, t < tt ? "below" : "above", i);
    }
  }
  updateDebugMarkers() {
    const e = ht(), t = window.scrollY, i = $(this.startViewportSpec, e), r = $(this.endViewportSpec, e), n = Math.abs(i - r) < Mt;
    if (this.startMarker && (this.setMarkerPosition(this.startMarker, i, i, 0), this.startMarker.label.textContent = `start: "${this.startViewportLabel}"`), this.endMarker && (this.setMarkerPosition(this.endMarker, r, r, n ? 1 : 0), this.endMarker.label.textContent = `end: "${this.endViewportLabel}"`), this.startTriggerMarker && (this.setMarkerPosition(this.startTriggerMarker, this.startTriggerY, this.startTriggerY - t, 0), this.startTriggerMarker.label.textContent = `start: "${this.startTriggerLabel}"`), this.endTriggerMarker) {
      const o = this.triggerLabelsCollide ? 1 : 0;
      this.setMarkerPosition(this.endTriggerMarker, this.endTriggerY, this.endTriggerY - t, o), this.endTriggerMarker.label.textContent = `end: "${this.endTriggerLabel}"`;
    }
  }
  removeDebugMarkers() {
    var e, t, i, r;
    (e = this.startMarker) == null || e.line.remove(), (t = this.endMarker) == null || t.line.remove(), (i = this.startTriggerMarker) == null || i.line.remove(), (r = this.endTriggerMarker) == null || r.line.remove(), this.startMarker = null, this.endMarker = null, this.startTriggerMarker = null, this.endTriggerMarker = null;
  }
  destroy() {
    var e, t;
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), (e = window.visualViewport) == null || e.removeEventListener("resize", this.onResizeBound), window.removeEventListener("load", this.onLoadBound), (t = this.resizeObserver) == null || t.disconnect(), this.resizeObserver = null, T.remove(this.tickerBound), this.teardownPin(), this.removeDebugMarkers();
  }
}
const Pt = /* @__PURE__ */ new WeakMap();
let Rt = !1;
function Fe(s, e, t) {
  if (t) {
    t === "auto" && !Rt && (Rt = !0, console.warn(
      '[six-js] overwrite: "auto" (chỉ huỷ property trùng) chưa được hỗ trợ đầy đủ, tạm thời xử lý như overwrite: true (huỷ toàn bộ tween cũ trên cùng target).'
    ));
    for (const i of s) {
      let r = Pt.get(i);
      r || (r = /* @__PURE__ */ new Set(), Pt.set(i, r));
      for (const o of r)
        o !== e && o.kill();
      r.clear(), r.add(e);
      const n = () => r.delete(e);
      e.on("complete", n), e.on("reverseComplete", n);
    }
  }
}
function $e(s, e, t) {
  if (typeof t == "number")
    return s * t;
  const { each: i, from: r = "start" } = t;
  if (typeof i != "number" || isNaN(i))
    return console.warn(`[six-js] stagger.each phải là số, nhận được ${i} — dùng 0 thay thế`), 0;
  let n;
  return r === "start" ? n = s : r === "end" ? n = e - 1 - s : r === "center" ? n = Math.abs(s - (e - 1) / 2) : n = Math.abs(s - r), n * i;
}
class Ye {
  constructor(e, t = []) {
    a(this, "delays");
    this.playables = e, this.delays = t;
  }
  play() {
    return this.playables.forEach((e) => e.play()), this;
  }
  seek(e) {
    return this.playables.forEach((t, i) => t.seek(e - (this.delays[i] ?? 0))), this;
  }
  get duration() {
    let e = 0;
    return this.playables.forEach((t, i) => {
      const r = t.duration + (this.delays[i] ?? 0);
      r > e && (e = r);
    }), e;
  }
  pause() {
    return this.playables.forEach((e) => e.pause()), this;
  }
  restart() {
    return this.playables.forEach((e) => e.restart()), this;
  }
  reset() {
    return this.playables.forEach((e) => e.reset()), this;
  }
  reverse() {
    return this.playables.forEach((e) => e.reverse()), this;
  }
  kill() {
    return this.playables.forEach((e) => e.kill()), this;
  }
  get all() {
    return this.playables;
  }
}
const qe = /^<\s*(?:([+-]=)\s*([\d.]+))?$/, _e = /^>\s*(?:([+-]=)\s*([\d.]+))?$/, Ne = /^([+-]=)\s*([\d.]+)$/, We = /^([^\s+-]+)\s*(?:([+-]=)\s*([\d.]+))?$/;
class Ve {
  constructor() {
    a(this, "children", []);
    a(this, "labels", /* @__PURE__ */ new Map());
    a(this, "cursor", 0);
    a(this, "activeChildren", /* @__PURE__ */ new Set());
    a(this, "lastLocalTime", 0);
  }
  get duration() {
    let e = 0;
    for (const t of this.children) t.end > e && (e = t.end);
    return e;
  }
  resolvePosition(e) {
    if (e === void 0) return this.cursor;
    if (typeof e == "number") return Math.max(0, e);
    const t = e.trim(), i = this.children[this.children.length - 1];
    let r = t.match(qe);
    if (r && t[0] === "<") {
      const n = i ? i.start : 0;
      if (!r[1]) return Math.max(0, n);
      const o = parseFloat(r[2]);
      return Math.max(0, n + (r[1] === "-=" ? -o : o));
    }
    if (r = t.match(_e), r && t[0] === ">") {
      const n = i ? i.end : 0;
      if (!r[1]) return Math.max(0, n);
      const o = parseFloat(r[2]);
      return Math.max(0, n + (r[1] === "-=" ? -o : o));
    }
    if (r = t.match(Ne), r) {
      const n = parseFloat(r[2]);
      return Math.max(0, this.cursor + (r[1] === "-=" ? -n : n));
    }
    if (r = t.match(We), r) {
      const [, n, o, h] = r, l = this.labels.get(n);
      if (l === void 0)
        return console.warn(`[six-js] timeline: unknown label "${n}", appending to end`), this.cursor;
      if (o && h) {
        const c = parseFloat(h);
        return Math.max(0, l + (o === "-=" ? -c : c));
      }
      return l;
    }
    return console.warn(`[six-js] timeline: invalid position "${e}", appending to end`), this.cursor;
  }
  add(e, t) {
    const i = this.resolvePosition(t), r = i + e.duration;
    return this.children.push({ start: i, end: r, animatable: e }), this.cursor = Math.max(this.cursor, r), i;
  }
  addLabel(e, t) {
    const i = this.resolvePosition(t);
    return this.labels.set(e, i), i;
  }
  getLabelTime(e) {
    return this.labels.get(e);
  }
  render(e, t) {
    const i = t ? e : Math.min(this.lastLocalTime, e), r = t ? e : Math.max(this.lastLocalTime, e), n = /* @__PURE__ */ new Set();
    this.children.forEach((o, h) => {
      o.end >= i && o.start <= r && n.add(h);
    }), this.activeChildren.forEach((o) => {
      var h, l;
      n.has(o) || (l = (h = this.children[o].animatable).onComplete) == null || l.call(h);
    }), n.forEach((o) => {
      var h, l;
      this.activeChildren.has(o) || (l = (h = this.children[o].animatable).onStart) == null || l.call(h);
    }), this.children.forEach((o) => {
      const h = e - o.start;
      (t || h >= 0) && o.animatable.render(h, t);
    }), this.activeChildren = n, this.lastLocalTime = e;
  }
  onStart() {
  }
  onComplete() {
  }
}
class gt {
  constructor(e = {}) {
    a(this, "engine", new Ve());
    a(this, "playable");
    a(this, "defaults");
    if (this.defaults = e.defaults ?? {}, this.playable = new lt(this.engine, {
      autoplay: e.onScroll ? !1 : !e.paused,
      delay: e.delay,
      repeat: e.repeat,
      repeatDelay: e.repeatDelay,
      boomerang: e.boomerang
    }), e.onStart && this.playable.on("start", e.onStart), e.onUpdate && this.playable.on("update", e.onUpdate), e.onComplete && this.playable.on("complete", e.onComplete), e.onRepeat && this.playable.on("repeat", e.onRepeat), e.onReverseComplete && this.playable.on("reverseComplete", e.onReverseComplete), e.onScroll) {
      const t = e.onScroll.target, i = typeof t == "string" ? document.querySelector(t) : t;
      i ? new ft(i, this.playable, e.onScroll) : console.warn("[six-js] timeline onScroll: trigger element not found, cần chỉ định onScroll.target");
    }
  }
  buildChildTween(e, t, i, r, n) {
    const o = { ...this.defaults, ...t }, h = new pt(e, o, i, r);
    return this.engine.add(h, n), this;
  }
  to(e, t, i) {
    return this.buildChildTween(e, t, "to", void 0, i);
  }
  from(e, t, i) {
    return this.buildChildTween(e, t, "from", void 0, i);
  }
  fromTo(e, t, i, r) {
    return this.buildChildTween(e, i, "fromTo", t, r);
  }
  set(e, t, i) {
    return this.buildChildTween(e, { ...t, duration: 0 }, "to", void 0, i);
  }
  call(e, t) {
    return this.engine.add({ duration: 0, render: () => {
    }, onStart: e }, t), this;
  }
  add(e, t) {
    let i;
    return e instanceof gt ? (e.playable.pause(), i = e.engine) : e instanceof lt ? (e.pause(), i = e.getAnimatable()) : i = e, this.engine.add(i, t), this;
  }
  addLabel(e, t) {
    return this.engine.addLabel(e, t), this;
  }
  play() {
    return this.playable.play(), this;
  }
  pause() {
    return this.playable.pause(), this;
  }
  reverse() {
    return this.playable.reverse(), this;
  }
  seek(e) {
    const t = typeof e == "number" ? e : this.engine.getLabelTime(e) ?? 0;
    return this.playable.seek(t), this;
  }
  restart() {
    return this.playable.restart(), this;
  }
  reset() {
    return this.playable.reset(), this;
  }
  kill() {
    return this.playable.kill(), this;
  }
  on(e, t) {
    return this.playable.on(e, t), this;
  }
  off(e, t) {
    return this.playable.off(e, t), this;
  }
  get duration() {
    return this.playable.duration;
  }
  get progress() {
    return this.playable.progress;
  }
  get isRunning() {
    return this.playable.isRunning;
  }
  get isDead() {
    return this.playable.isDead;
  }
}
const Xe = "0.0.31";
function A(s, e, t) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: s,
    pxAxis: t,
    defaultUnit: e,
    getCurrent(i) {
      return { num: Zt(i, s), unit: e };
    },
    apply(i, r) {
      R(i, s, r.num);
    }
  };
}
function qt(s, e, t) {
  const i = A(s, "px", t), r = A(e, "%");
  return (n) => typeof n == "string" && n.trim().endsWith("%") ? r : i;
}
x("x", qt("x", "xPercent", "x"));
x("y", qt("y", "yPercent", "y"));
x("z", A("z", "px"));
x("rotate", A("rotate", "deg"));
x("rotateX", A("rotateX", "deg"));
x("rotateY", A("rotateY", "deg"));
x("rotateZ", A("rotateZ", "deg"));
x("scale", A("scale", ""));
x("scaleX", A("scaleX", ""));
x("scaleY", A("scaleY", ""));
x("skewX", A("skewX", "deg"));
x("skewY", A("skewY", "deg"));
function I(s, e) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: e,
    getCurrent(t) {
      const i = window.getComputedStyle(t)[s];
      return _(i, e);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
x("width", I("width", "px"));
x("height", I("height", "px"));
x("top", I("top", "px"));
x("left", I("left", "px"));
x("right", I("right", "px"));
x("bottom", I("bottom", "px"));
x("borderWidth", I("borderWidth", "px"));
x("opacity", I("opacity", ""));
x("fontSize", I("fontSize", "px"));
x("letterSpacing", I("letterSpacing", "px"));
function Q(s) {
  return {
    type: "color",
    cssKey: s,
    getCurrent(e) {
      const t = window.getComputedStyle(e)[s];
      return Ft(t);
    },
    apply(e, t) {
      e.style[s] = we(t);
    }
  };
}
x("backgroundColor", Q("backgroundColor"));
x("color", Q("color"));
x("borderColor", Q("borderColor"));
x("background", Q("backgroundColor"));
function He(s) {
  return {
    type: "discrete",
    cssKey: s,
    apply(e, t) {
      e.style[s] = t;
    }
  };
}
const Ge = [
  "display",
  "position",
  "visibility",
  "justifyContent",
  "alignItems",
  "alignContent",
  "alignSelf",
  "flexDirection",
  "flexWrap",
  "textAlign",
  "overflow",
  "overflowX",
  "overflowY",
  "pointerEvents",
  "cursor",
  "whiteSpace",
  "textTransform",
  "textDecoration",
  "listStyleType",
  "float",
  "clear",
  "objectFit"
];
Ge.forEach((s) => x(s, He(s)));
function mt(s) {
  return {
    type: "complex",
    cssKey: s,
    getCurrent(e) {
      const t = window.getComputedStyle(e)[s];
      return t && t !== "none" ? t : "";
    },
    apply(e, t) {
      e.style[s] = t;
    }
  };
}
x("boxShadow", mt("boxShadow"));
x("filter", mt("filter"));
x("borderRadius", mt("borderRadius"));
console.log(` SixJS v${Xe}`);
let It = !1;
function je() {
  It || (be(), It = !0);
}
function Ue(s) {
  return Array.from(document.querySelectorAll(s));
}
function Ke(s) {
  const e = s.startsWith("#") ? s.slice(1) : s;
  return document.getElementById(e);
}
function Qe(s, e) {
  const t = new pt(s, { ...e, duration: 0 }, "to");
  t.render(0), t.onComplete();
}
function _t(s) {
  return typeof s == "string" ? document.querySelector(s) : Array.isArray(s) ? s.find((e) => e != null) ?? null : s ?? null;
}
function Ze(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : Array.isArray(s) ? s.filter((e) => e != null) : s ? [s] : [];
}
function zt(s, e, t, i, r, n) {
  const o = new pt(s, e, t, i), h = new lt(o, {
    autoplay: n.onScroll ? !1 : !n.paused,
    delay: (n.delay ?? 0) + r,
    repeat: n.repeat,
    repeatDelay: n.repeatDelay,
    boomerang: n.boomerang
  });
  if (n.onStart && h.on("start", n.onStart), n.onUpdate && h.on("update", n.onUpdate), n.onComplete && h.on("complete", n.onComplete), n.onRepeat && h.on("repeat", n.onRepeat), n.onReverseComplete && h.on("reverseComplete", n.onReverseComplete), Fe(o.targetElements, h, n.overwrite), n.onScroll) {
    const l = _t(n.onScroll.target ?? s);
    l ? new ft(l, h, n.onScroll) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return h;
}
function bt(s, e, t, i) {
  const {
    onScroll: r,
    stagger: n,
    delay: o,
    paused: h,
    repeat: l,
    repeatDelay: c,
    boomerang: d,
    overwrite: u,
    onStart: p,
    onUpdate: f,
    onComplete: g,
    onRepeat: m,
    onReverseComplete: y,
    ...S
  } = e, b = { onScroll: r, delay: o, paused: h, repeat: l, repeatDelay: c, boomerang: d, overwrite: u, onStart: p, onUpdate: f, onComplete: g, onRepeat: m, onReverseComplete: y };
  if (n === void 0)
    return zt(s, S, t, i, 0, b);
  const v = Ze(s);
  v.length === 0 && console.warn("[six-js] stagger: no elements matched"), Object.values(S).some((P) => typeof P == "function") && console.warn(
    "[six-js] stagger: function value (index, el) => ... luôn nhận index=0 vì mỗi phần tử stagger giờ là 1 tween độc lập, không phải index gốc trong danh sách. Nếu cần giá trị theo index gốc, hãy tự tính mảng giá trị trước thay vì dùng callback."
  );
  const k = v.map((P, O) => $e(O, v.length, n)), L = r ? { ...b, onScroll: void 0, paused: !0 } : b, V = !!r && (r.sync === !0 || typeof r.sync == "number"), X = v.map(
    (P, O) => zt(P, S, t, i, V ? 0 : k[O], L)
  ), B = new Ye(X, k);
  if (r) {
    const P = _t(r.target ?? s);
    P ? new ft(P, B, r) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return B;
}
function Je(s, e) {
  return bt(s, e, "to");
}
function ti(s, e) {
  return bt(s, e, "from");
}
function ei(s, e, t) {
  return bt(s, t, "fromTo", e);
}
function ii(s) {
  return new gt(s);
}
const ni = {
  initElements: je,
  getClass: Ue,
  getId: Ke,
  set: Qe,
  to: Je,
  from: ti,
  fromTo: ei,
  timeline: ii,
  setDefaults: Re
};
export {
  Xe as VERSION,
  ni as six
};
