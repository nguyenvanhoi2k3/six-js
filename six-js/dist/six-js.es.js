var vt = Object.defineProperty;
var Ct = (s, i, t) => i in s ? vt(s, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[i] = t;
var c = (s, i, t) => Ct(s, typeof i != "symbol" ? i + "" : i, t);
const kt = "0.0.31";
let st = !1;
function wt() {
  st || (st = !0, console.log(
    ` SixJS v${kt}`
  ));
}
function F(s) {
  return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? (s -= 1.5 / 2.75, 7.5625 * s * s + 0.75) : s < 2.5 / 2.75 ? (s -= 2.25 / 2.75, 7.5625 * s * s + 0.9375) : (s -= 2.625 / 2.75, 7.5625 * s * s + 0.984375);
}
const L = 1.70158, $ = L * 1.525, P = {
  // Linear
  linear: (s) => s,
  // Quad
  "quad-in": (s) => s * s,
  "quad-out": (s) => 1 - (1 - s) * (1 - s),
  "quad-in-out": (s) => s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2,
  // Cubic
  "cubic-in": (s) => s * s * s,
  "cubic-out": (s) => 1 - Math.pow(1 - s, 3),
  "cubic-in-out": (s) => s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2,
  // Quart
  "quart-in": (s) => s ** 4,
  "quart-out": (s) => 1 - (1 - s) ** 4,
  "quart-in-out": (s) => s < 0.5 ? 8 * s ** 4 : 1 - (-2 * s + 2) ** 4 / 2,
  // Quint
  "quint-in": (s) => s ** 5,
  "quint-out": (s) => 1 - (1 - s) ** 5,
  "quint-in-out": (s) => s < 0.5 ? 16 * s ** 5 : 1 - (-2 * s + 2) ** 5 / 2,
  // Strong (GSAP alias)
  "strong-in": (s) => s ** 5,
  "strong-out": (s) => 1 - (1 - s) ** 5,
  "strong-in-out": (s) => s < 0.5 ? 16 * s ** 5 : 1 - (-2 * s + 2) ** 5 / 2,
  // Sine
  "sine-in": (s) => 1 - Math.cos(s * Math.PI / 2),
  "sine-out": (s) => Math.sin(s * Math.PI / 2),
  "sine-in-out": (s) => -(Math.cos(Math.PI * s) - 1) / 2,
  // Expo
  "expo-in": (s) => s === 0 ? 0 : Math.pow(2, 10 * (s - 1)) * s + Math.pow(s, 6) * (1 - s),
  "expo-out": (s) => s === 1 ? 1 : 1 - Math.pow(2, -10 * s),
  "expo-in-out": (s) => s === 0 ? 0 : s === 1 ? 1 : s < 0.5 ? Math.pow(2, 20 * s - 10) / 2 : (2 - Math.pow(2, -20 * s + 10)) / 2,
  // Circ
  "circ-in": (s) => 1 - Math.sqrt(1 - s * s),
  "circ-out": (s) => Math.sqrt(1 - (s - 1) * (s - 1)),
  "circ-in-out": (s) => s < 0.5 ? (1 - Math.sqrt(1 - (2 * s) ** 2)) / 2 : (Math.sqrt(1 - (-2 * s + 2) ** 2) + 1) / 2,
  // Back
  "back-in": (s) => (L + 1) * s * s * s - L * s * s,
  "back-out": (s) => (s--, 1 + (L + 1) * s * s * s + L * s * s),
  "back-in-out": (s) => {
    if (s < 0.5) {
      const t = 2 * s;
      return t * t * (($ + 1) * t - $) / 2;
    }
    const i = 2 * s - 2;
    return (i * i * (($ + 1) * i + $) + 2) / 2;
  },
  // Bounce
  "bounce-in": (s) => 1 - F(1 - s),
  "bounce-out": F,
  "bounce-in-out": (s) => s < 0.5 ? (1 - F(1 - 2 * s)) / 2 : (1 + F(2 * s - 1)) / 2
}, J = /* @__PURE__ */ new WeakMap();
let G = [], j = null;
function nt(s, i) {
  G.push({ instance: s, type: i }), j === null && (j = requestAnimationFrame(Tt));
}
function Tt() {
  const s = G.slice();
  G.length = 0, j = null;
  for (let i = 0; i < s.length; i++) {
    const { instance: t, type: e } = s[i];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let V = null;
function gt() {
  return typeof window > "u" ? null : (V || (V = new IntersectionObserver(
    (s) => {
      for (let i = 0; i < s.length; i++) {
        const t = s[i], e = J.get(t.target);
        e && (t.isIntersecting ? nt(e, "enter") : nt(e, "leave"));
      }
    },
    { threshold: 0.05 }
  )), V);
}
function mt(s, i) {
  var t;
  J.set(s, i), (t = gt()) == null || t.observe(s);
}
function U(s) {
  var i;
  J.delete(s), (i = gt()) == null || i.unobserve(s);
}
function D(s, i) {
  if (s == null) return i;
  const t = s.trim();
  if (!t) return i;
  const e = Number(t);
  return Number.isFinite(e) ? e * 1e3 : i;
}
const T = class T extends HTMLElement {
  constructor() {
    super(...arguments);
    c(this, "animation");
    c(this, "options");
    c(this, "order", T.counter++);
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
    t.sort((e, n) => e.order - n.order), t.forEach((e, n) => {
      e.play(n * 120);
    });
  }
  get isGroup() {
    return this.hasAttribute("group");
  }
  connectedCallback() {
    if (this.options = this.getOptions(), T.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), mt(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), U(this), T.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || U(this), this.isGroup ? (T.groupQueue.add(this), T.scheduleGroup()) : this.play();
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
    }, n = this.getAttribute("type") ?? "fade-up", r = this.getAttribute("easing"), [o, h] = e[n] ?? e["fade-up"];
    return {
      x: o,
      y: h,
      easing: r && r in P ? r : "ease-in-out",
      duration: D(this.getAttribute("duration"), 400),
      delay: D(this.getAttribute("delay"), 0)
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
    const { x: e, y: n, easing: r, duration: o, delay: h } = this.options;
    (a = this.animation) == null || a.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${e}px, ${n}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: o,
        delay: h + t,
        easing: r,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var l;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (l = this.animation) == null || l.cancel(), this.animation = void 0;
    };
  }
};
c(T, "counter", 0), c(T, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), c(T, "groupQueue", /* @__PURE__ */ new Set()), c(T, "isProcessingGroup", !1);
let K = T;
function At() {
  customElements.get("sx-animate") || customElements.define("sx-animate", K);
}
class Et {
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
      const e = this._last - this._start, n = e - this._nextTime;
      if (n > 0) {
        this._frame++, this._delta = e - this._time * 1e3, this._time = e / 1e3, this._nextTime += n >= this._gap ? n + 4 : this._gap;
        const r = [...this._listeners];
        for (const o of r)
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
  _request(i) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(i) : setTimeout(i, 16);
  }
  _cancel(i) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(i);
      return;
    }
    clearTimeout(i);
  }
  _wake() {
    if (this._id !== null) return;
    const i = this._now();
    this._start = i - this._time * 1e3, this._last = i, this._tick();
  }
  add(i) {
    return this._listeners.add(i), this._wake(), i;
  }
  addOnce(i) {
    const t = (e, n, r) => {
      this.remove(t), i(e, n, r);
    };
    return this.add(t), t;
  }
  remove(i) {
    this._listeners.delete(i), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(i) {
    i = Math.max(1, i), this._gap = 1e3 / i, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(i = 500, t = 33) {
    this._lagThreshold = i || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(i = 60) {
    return this._delta / (1e3 / i);
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
const k = new Et();
class Mt extends HTMLElement {
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
      const n = e / 1e3, r = this.speed * n, o = this.direction, a = this.isVertical ? this.offsetHeight : this.offsetWidth;
      o === "left" || o === "up" ? (this.offset -= r, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = a)) : (this.offset += r, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= a && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), mt(this, {
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
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), U(this), k.remove(this.updateAnimation);
  }
  attributeChangedCallback(t, e, n) {
    e !== n && (t === "gap" ? (this.updateGapVar(), setTimeout(() => this.scheduleSetup(), 50)) : (t === "direction" || t === "speed" || t === "clone") && this.scheduleSetup());
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
        const n = this.isVertical, r = n ? this.offsetHeight : this.offsetWidth, o = n ? this.inner.offsetHeight : this.inner.offsetWidth;
        if (this.clone && o > 0 && r > 0) {
          const h = o < r ? Math.ceil(r * 2 / o) : 2, a = document.createDocumentFragment();
          for (let l = 1; l < h; l++)
            for (const d of e) {
              const u = d.cloneNode(!0);
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
    const n = this.isVertical;
    for (let o = 0; o < t.length; o++)
      e += n ? t[o].offsetHeight : t[o].offsetWidth;
    const r = parseFloat(getComputedStyle(this.inner).gap) || 0;
    e += r * t.length, this.cachedResetBounds = e;
  }
  applyTransform(t) {
    this.inner && (this.isVertical ? this.inner.style.transform = `translate3d(0,${t}px,0)` : this.inner.style.transform = `translate3d(${t}px,0,0)`);
  }
}
class It extends HTMLElement {
}
class zt extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function Rt() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Mt), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", It), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", zt);
}
class Bt extends HTMLElement {
  constructor() {
    super();
  }
}
class Lt {
  constructor() {
    c(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(i, t) {
    this.sliders.set(i, t);
  }
  unregister(i) {
    this.sliders.delete(i);
  }
  get(i) {
    return this.sliders.get(i);
  }
}
const R = new Lt();
class Pt extends HTMLElement {
  constructor() {
    super();
    c(this, "renderedSignature", "");
    c(this, "innerContainer", null);
    c(this, "snakeBar", null);
    c(this, "maxVisibleBullets", 5);
    c(this, "bulletWidthWithGap", 16);
    c(this, "lastActiveIndex", 0);
    c(this, "cachedBullets", []);
    c(this, "snakeTimeout", null);
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
      const n = Number(e.getAttribute("data-index"));
      this.goToSlide(n);
    }
  }
  goToSlide(t) {
    const e = this.getAttribute("name");
    let n = null;
    e ? n = R.get(e) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), n = e === "dynamic", r = e === "snake", o = e === "fraction", h = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature === h) return;
    if (this.renderedSignature = h, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const l = document.createElement("span");
      l.className = "sx-slider-pagination-current", l.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const f = document.createDocumentFragment();
      f.appendChild(l), f.appendChild(d), f.appendChild(u), this.appendChild(f);
      return;
    }
    const a = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((l, d) => {
        const u = this.createBulletDOM(l, d, !1);
        this.cachedBullets.push(u), a.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", a.appendChild(this.snakeBar), this.appendChild(a);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", a.appendChild(this.innerContainer), t.forEach((l, d) => {
        const u = this.createBulletDOM(l, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(a);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((l, d) => {
      const u = this.createBulletDOM(l, d, e === "number");
      this.cachedBullets.push(u), a.appendChild(u);
    }), this.appendChild(a);
  }
  createBulletDOM(t, e, n) {
    const r = document.createElement("span");
    return r.className = "sx-slider-pagination-bullet", r.setAttribute("data-index", t.toString()), r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"), r.setAttribute("aria-label", `Go to slide ${e + 1}`), n && (r.textContent = (e + 1).toString()), r;
  }
  updateActive(t) {
    const e = this.getAttribute("effect");
    if (e === "fraction") {
      const u = this.querySelector(".sx-slider-pagination-current");
      u && (u.textContent = (t + 1).toString());
      return;
    }
    const n = e === "dynamic", r = e === "snake", o = this.cachedBullets, h = o.length;
    if (h === 0) return;
    if (o.forEach((u, f) => {
      n && (u.className = "sx-slider-pagination-bullet"), f === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const b = t * 20, x = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const S = b - x + 10;
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const S = x - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || h <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let a = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    a = Math.min(a, h - this.maxVisibleBullets);
    const l = a + this.maxVisibleBullets - 1;
    o.forEach((u, f) => {
      f >= a && f <= l ? f === a ? u.classList.add(f === 0 ? "sx-bullet-main" : "sx-bullet-small") : f === a + 1 ? u.classList.add(f === 1 ? "sx-bullet-main" : "sx-bullet-medium") : f === l ? u.classList.add(
        f === h - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : f === l - 1 ? u.classList.add(
        f === h - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -a * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${d}px)`;
  }
}
class Dt extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (i) => {
      (i.key === "Enter" || i.key === " ") && (i.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Next slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const i = this.getAttribute("name");
    if (i) {
      const t = R.get(i);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class Ft extends HTMLElement {
  constructor() {
    super();
    c(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, e, n) {
    const r = Math.max(0, Math.min(1, t));
    this.bar.style.transition = n || "none", e === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${r})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${r})`);
  }
}
class $t extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (i) => {
      (i.key === "Enter" || i.key === " ") && (i.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Previous slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const i = this.getAttribute("name");
    if (i) {
      const t = R.get(i);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class Ot {
  constructor(i, t, e = 0.92) {
    c(this, "velocity", 0);
    c(this, "friction");
    c(this, "onUpdate");
    c(this, "onComplete");
    c(this, "isRunning", !1);
    c(this, "tickerCallback");
    this.onUpdate = i, this.onComplete = t, this.friction = e, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(i) {
    this.friction = i;
  }
  addVelocity(i) {
    this.velocity += i, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, k.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, k.add(this.tickerCallback));
  }
  loop(i) {
    if (!this.isRunning) return;
    const t = i / 16.67, e = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= e;
  }
}
class qt extends HTMLElement {
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
        const { max: e, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(e, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    c(this, "wheelInertia", new Ot(
      (t) => {
        if (this.sliderCha) {
          if (this.currentTranslate += t, this.sliderCha.options.loop)
            this.checkLoopBoundsInstant();
          else {
            const { max: e, min: n } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
            this.currentTranslate > e ? r <= 0 ? (this.currentTranslate = e, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate > e + r ? (this.currentTranslate = e + r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.currentTranslate < n ? r <= 0 ? (this.currentTranslate = n, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate < n - r ? (this.currentTranslate = n - r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.wheelInertia.setFriction(0.92);
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
          const { max: n, min: r } = this.sliderCha.getBoundaries();
          (this.currentTranslate > n && e > 0 || this.currentTranslate < r && e < 0) && (e *= 0.2);
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
    const n = performance.now();
    for (this.dragXs.push(e), this.dragTimes.push(n); this.dragTimes.length > 0 && n - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const r = e - this.startX;
    let o = this.prevTranslate + r;
    if (this.sliderCha.options.loop)
      this.currentTranslate = o, this.checkLoopBoundsInstant();
    else {
      const { max: h, min: a } = this.sliderCha.getBoundaries(), l = this.sliderCha.options.edgeResistance;
      o > h ? o = l <= 0 ? h : h + Math.min(l, (o - h) * 0.3) : o < a && (o = l <= 0 ? a : a - Math.min(l, (a - o) * 0.3)), this.currentTranslate = o;
    }
    this.setTransform(this.currentTranslate);
  }
  dragEnd() {
    if (!this.isDragging || !this.sliderCha) return;
    this.isDragging = !1;
    const t = this.sliderCha.options, e = performance.now();
    if (this.dragTimes.length > 0) {
      const n = this.dragTimes[this.dragTimes.length - 1];
      if (e - n > 10)
        this.velocity = 0;
      else {
        const r = n - this.dragTimes[0];
        r > 0 ? this.velocity = (this.dragXs[this.dragXs.length - 1] - this.dragXs[0]) / r : this.velocity = 0;
      }
    } else
      this.velocity = 0;
    if (t.drag === "free") {
      this.prevTranslate = this.currentTranslate;
      let r = this.currentTranslate + this.velocity * 400;
      if (t.snap) {
        const o = parseFloat(this.sliderCha.startPadding) || 0;
        this.sliderCha.alignIndexToFreeTranslation(r);
        const h = this.sliderCha.getCurrentIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap();
        const l = this.children[h];
        let d = t.autoSize ? (l ? l.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (a + d / 2);
        } else
          r = o - a;
        if (!t.loop) {
          const { max: u, min: f } = this.sliderCha.getBoundaries();
          r = Math.max(f, Math.min(u, r));
        }
      }
      if (t.loop)
        this.startMomentumScroll(r);
      else {
        const { max: o, min: h } = this.sliderCha.getBoundaries(), a = Math.max(
          h,
          Math.min(o, r)
        );
        this.startMomentumScroll(a);
      }
    } else {
      this.style.transition = `transform ${t.speed}ms ease-out, height ${t.speed}ms ease-out`;
      const n = this.lastClientAxis - this.startX;
      if (t.perMove === "auto") {
        const r = this.sliderCha.getCurrentIndex();
        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.getCurrentIndex() === r ? n < -50 ? this.sliderCha.next() : n > 50 ? this.sliderCha.prev() : this.updatePosition() : this.updatePosition();
      } else
        n < -50 ? this.sliderCha.next() : n > 50 ? this.sliderCha.prev() : this.updatePosition();
      this.sliderCha.startAutoplay();
    }
  }
  startMomentumScroll(t, e, n, r = !1) {
    var h;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (h = this.sliderCha) != null && h.options.loop && this.checkLoopBoundsInstant(), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, k.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, n = Math.min(e / this.scrollDuration, 1), r = 1 - Math.pow(1 - n, 4), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: l } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < l) {
        if (this.currentTranslate > a) {
          if (d <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + d) {
            this.currentTranslate = a + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < l) {
          if (d <= 0) {
            this.currentTranslate = l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < l - d) {
            this.currentTranslate = l - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(l, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const f = this.currentTranslate > a ? a : l;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, k.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, k.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(e), r = this.sliderCha.getOffsetForIndex(e + t) - o;
    else {
      const b = this.sliderCha.getSlideSizeWithGap();
      o = e * b, r = t * b;
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
    const a = -o + n + h, l = a - r;
    let d = !1, u = this.currentTranslate, f = 0, p = 0;
    const m = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + m ? (u = this.currentTranslate - r, f = -r, p = t, d = !0) : this.currentTranslate <= l - m && (u = this.currentTranslate + r, f = r, p = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + p
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
    const n = parseFloat(this.sliderCha.startPadding) || 0, r = this.sliderCha.getCurrentIndex();
    let o = n, h = 0, a = 0;
    if (e.autoSize) {
      h = this.sliderCha.getOffsetForIndex(r);
      const l = Array.from(this.children), d = this.sliderCha.convertToPx(e.gap);
      a = l[r] ? l[r].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const l = this.sliderCha.getSlideSizeWithGap();
      h = r * l, a = l;
    }
    if (e.centered) {
      const l = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += l / 2 - (h + a / 2);
    } else
      o -= h;
    if (!e.loop) {
      const { max: l, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(l, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const l = this.sliderCha.originalSlidesCount, d = e.autoSize ? l : e.perView;
      (r >= d + l || r < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
class rt {
  static parse(i) {
    if (!i) return null;
    try {
      let t = i.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(i, t, e) {
    if (!e) return { ...t };
    let n = { ...t };
    const r = Object.keys(e).map(Number).sort((o, h) => o - h);
    for (const o of r)
      if (i >= o) {
        const h = this.kebabToCamel(e[o]);
        n = { ...n, ...h };
      }
    return n;
  }
  static kebabToCamel(i) {
    if (typeof i != "object" || i === null) return i;
    const t = {};
    for (const e in i) {
      const n = e.replace(/-([a-z])/g, (r) => r[1].toUpperCase());
      t[n] = i[e];
    }
    return t;
  }
}
class Yt extends HTMLElement {
  constructor() {
    super();
    c(this, "options");
    c(this, "originalOptions");
    c(this, "breakpointsConfig", null);
    c(this, "currentIndex", 0);
    c(this, "lastFiredIndex", -1);
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
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const l = this.originalSlidesCount;
      if (l > 0 && this.track) {
        const d = this.options.autoSize ? l : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let f = 0, p = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(d), p = this.getOffsetForIndex(d + l) - f;
        else {
          const m = this.getSlideSizeWithGap();
          f = d * m, p = l * m;
        }
        if (p > 0) {
          r = o / p;
          let m = 0;
          if (this.options.centered) {
            let S = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            m = o / 2 - S / 2;
          }
          n = (-f + u + m - t) / p, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: l, min: d } = this.getBoundaries(), u = l - d;
      u > 0 ? (n = (l - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const h = r + n * (1 - r);
    let a = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const l = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      a = [.../* @__PURE__ */ new Set([...a, ...l])];
    }
    a.forEach((l) => {
      typeof l.update == "function" && l.update(h, this.options.direction, e);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && R.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;
        const t = this.getBoundingClientRect()[this.sizeDim];
        t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
      });
    }), this.resizeObserver.observe(this), this.track) {
      let t = 0, e = 0;
      this.track.addEventListener("mousedown", (n) => {
        t = n.clientX, e = n.clientY;
      }), this.track.addEventListener(
        "touchstart",
        (n) => {
          n.touches.length > 0 && (t = n.touches[0].clientX, e = n.touches[0].clientY);
        },
        { passive: !0 }
      ), this.track.addEventListener("click", (n) => {
        const r = Math.abs(n.clientX - t), o = Math.abs(n.clientY - e);
        if (r > 6 || o > 6) return;
        const h = n.target.closest("sx-slider-slide");
        if (!h) return;
        const a = h.getAttribute("data-real-index");
        if (a !== null) {
          const l = parseInt(a, 10);
          this.goTo(l, !0);
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
    ), this.options.name && R.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", e = this.getAttribute("edge-resistance"), n = e !== null ? Number(e) : 100, r = this.getAttribute("interval"), o = D(r, 4e3), h = this.getAttribute("start-index"), a = h !== null ? Number(h) : 0, l = this.getAttribute("per-move");
    let d = "auto";
    if (l !== null && l !== "auto") {
      const p = Number(l);
      d = isNaN(p) ? "auto" : p;
    }
    let u = this.getAttribute("direction");
    u !== "horizontal" && u !== "vertical" && (u = "horizontal");
    let f = this.getAttribute("effect");
    f !== "fade" && (f = "slide"), this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: t(this.getAttribute("gap")),
      drag: this.getAttribute("drag") || "true",
      speed: D(this.getAttribute("speed"), 300),
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(n) ? 0 : n,
      loop: this.hasAttribute("loop"),
      grabCursor: this.hasAttribute("grab-cursor"),
      snap: this.hasAttribute("snap"),
      autoplay: this.hasAttribute("autoplay"),
      interval: isNaN(o) ? 4e3 : o,
      startIndex: isNaN(a) ? 0 : a,
      autoSize: this.hasAttribute("auto-size"),
      perMove: d,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: u,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: f,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = rt.parse(
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
    this.track.querySelectorAll("[data-clone]").forEach((r) => r.remove());
    const e = Array.from(this.track.children);
    if (this.originalSlidesCount = e.length, this.originalSlidesCount === 0) return;
    e.forEach((r, o) => {
      r.setAttribute("data-real-index", o.toString());
    });
    const n = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
    for (let r = 0; r < n; r++) {
      const h = e[e.length - 1 - r].cloneNode(!0);
      h.setAttribute("data-clone", "prev"), this.track.insertBefore(h, this.track.firstChild);
    }
    for (let r = 0; r < n; r++) {
      const h = e[r].cloneNode(!0);
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
    if (this.options.loop || e.forEach((p, m) => {
      p.setAttribute("data-real-index", m.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = rt.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const p = (m) => m == null || m === "" ? "0px" : isNaN(Number(m)) ? String(m) : `${m}px`;
      this.options.gap = p(this.options.gap), this.options.leftPadding = p(this.options.leftPadding), this.options.rightPadding = p(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), e = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), e = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, e.length - 1)
    ));
    const n = this.track.querySelectorAll("[data-clone]").length, r = e.length - n;
    if (this.isFirstInit && r > 0) {
      const p = Math.max(
        0,
        Math.min(this.options.startIndex, r - 1)
      );
      if (this.options.loop) {
        const m = this.options.autoSize ? r : this.options.perView;
        this.currentIndex = m + p;
      } else
        this.currentIndex = p;
      this.isFirstInit = !1;
    }
    const o = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(h));
    const a = this.convertToPx(this.options.gap), l = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((p) => {
        p.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((p) => {
        const m = p.firstElementChild;
        m ? p.style[this.sizeDim] = `${m.getBoundingClientRect()[this.sizeDim]}px` : p.style[this.sizeDim] = "max-content", p.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - l - d - a * (this.options.perView - 1)) / this.options.perView;
      e.forEach((x) => {
        x.style[this.sizeDim] = `${b}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const f = e.filter((p) => !p.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let p = 0;
      f.forEach((m) => {
        p += this.getRectSize(m) + a;
      }), p -= a, u = p < t;
    } else
      u = r < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((m) => m.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    if (!t || t === "0px" || t === "0") return 0;
    if (t.endsWith("px"))
      return parseFloat(t);
    const e = document.createElement("div");
    e.style.display = "none", e.style.width = t, document.body.appendChild(e);
    const n = parseFloat(getComputedStyle(e).width);
    return document.body.removeChild(e), n || 0;
  }
  getSlideSizeWithGap() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children[0];
    return this.getRectSize(t) + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let e = 0, n = 0;
    const r = this.convertToPx(this.options.gap), o = Array.from(this.track.children);
    for (let h = 0; h < o.length && (e += this.getRectSize(o[h]) + r, !(e - r > t)); h++)
      n++;
    return Math.max(1, n);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const e = Array.from(this.track.children), n = this.convertToPx(this.options.gap);
    let r = 0;
    for (let o = 0; o < t; o++)
      e[o] && (r += this.getRectSize(e[o]) + n);
    return r;
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let e = 0;
    if (this.options.autoSize)
      e = this.getOffsetForIndex(this.track.children.length), e -= this.convertToPx(this.options.gap);
    else {
      const n = this.track.children.length;
      e = this.getSlideSizeWithGap() * n - this.convertToPx(this.options.gap);
    }
    return Math.max(0, e - t);
  }
  getBoundaries() {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], e = parseFloat(this.startPadding) || 0, n = this.convertToPx(this.options.gap), r = this.track.children.length;
    let o = 0, h = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let a = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + n : this.getSlideSizeWithGap();
      o = e + t / 2 - a / 2;
      let l = r - 1, d = this.options.autoSize ? this.getOffsetForIndex(l) : l * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[l] ? this.getRectSize(this.track.children[l]) : 0) + n : this.getSlideSizeWithGap();
      h = e + t / 2 - (d + u / 2);
    }
    return { max: o, min: Math.min(o, h) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, n = e ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (g) => {
      if (!e) return g;
      let v = (g - r) % n;
      return v < 0 && (v += n), v;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = o(this.currentIndex);
    this.lastFiredIndex !== a && (this.lastFiredIndex = a, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: a }
      })
    ));
    const l = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + h), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let p = null;
    f && (p = document.createElement("style"), p.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(p), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !f || t.forEach((g, v) => {
      g.removeAttribute("sx-slide-active"), g.removeAttribute("sx-slide-prev"), g.removeAttribute("sx-slide-next"), g.removeAttribute("sx-slide-center");
      let C = o(v);
      g.setAttribute("aria-label", `${C + 1}/${n}`), C === a && g.setAttribute("sx-slide-active", ""), C === l && g.setAttribute("sx-slide-prev", ""), C === d && g.setAttribute("sx-slide-next", ""), C === u && g.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const m = e ? n - 1 : this.getRealMaxIndex(), b = this.getResolvedPerMove();
    let x = [];
    if (b > 1 && !this.options.autoSize) {
      let g = 0;
      for (; g < m; )
        x.push(g), g += b;
      g !== m && x.push(m);
    } else
      for (let g = 0; g <= m; g++)
        x.push(g);
    let S = x.indexOf(a);
    if (S === -1) {
      for (let g = x.length - 1; g >= 0; g--)
        if (a >= x[g]) {
          S = g;
          break;
        }
    }
    this.updatePagination(x, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((v) => v.trim()).forEach((v) => {
      const C = R.get(v);
      C && C.syncFromController(a);
    }), f && p && requestAnimationFrame(() => {
      p == null || p.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = e ? this.originalSlidesCount : n.length - r;
    if (((a) => {
      if (!e) return a;
      const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (a - l) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (e) {
        const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView, l = t + a, d = this.originalSlidesCount, u = n.length;
        let f = l, p = Math.abs(l - this.currentIndex);
        [l - d, l, l + d].forEach((b) => {
          if (b >= 0 && b < u) {
            const x = Math.abs(b - this.currentIndex);
            x < p && (p = x, f = b);
          }
        }), this.currentIndex = f;
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
    const e = this.options.perView, n = this.options.centered ? Math.floor(e / 2) : 0;
    let r = this.currentIndex - n;
    this.options.loop || (r = Math.max(0, r));
    const o = [];
    for (let a = 0; a < e; a++) {
      let l = r + a;
      this.options.loop && (l < 0 ? l = t.length + l : l >= t.length && (l = l % t.length));
      const d = t[l];
      if (d) {
        const u = d.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const f = u.firstElementChild;
        f && (f.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let h = 0;
    o.forEach((a) => {
      const l = a.firstElementChild, d = l ? l.getBoundingClientRect().height : a.getBoundingClientRect().height;
      d > h && (h = d);
    }), o.forEach((a) => {
      var l;
      (l = this.track) == null || l.removeChild(a);
    }), h > 0 && (this.track.style.height = `${h}px`);
  }
  getCurrentIndex() {
    if (!this.track) return 0;
    const t = this.options.loop, e = Array.from(this.track.children), n = t ? this.originalSlidesCount : e.length;
    if (n === 0) return 0;
    const r = t ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0;
    let o = t ? (this.currentIndex - r) % n : this.currentIndex;
    return o < 0 && (o += n), o;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: e } = this.getBoundaries();
    for (let n = 0; n < t; n++) {
      let r = this.options.autoSize ? this.getOffsetForIndex(n) : n * this.getSlideSizeWithGap(), o = this.options.autoSize ? this.getRectSize(this.track.children[n]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), h = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const a = this.getBoundingClientRect()[this.sizeDim];
        h += a / 2 - (r + o / 2);
      } else
        h -= r;
      if (h <= e + 1)
        return n;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), e = (this.currentIndex % t + t) % t, n = e !== 0 ? t - e : t;
    if (this.options.loop)
      this.currentIndex += n, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const r = this.getRealMaxIndex();
      this.currentIndex < r ? this.currentIndex = Math.min(r, this.currentIndex + n) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), e = (this.currentIndex % t + t) % t, n = e !== 0 ? e : t;
    this.options.loop ? (this.currentIndex -= n, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - n) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  goTo(t, e = !1) {
    if (this.track) {
      if (e && (this.isClickRouting = !0), this.options.loop) {
        const n = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + n, o = this.originalSlidesCount, h = this.track.children.length;
        let a = r, l = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < h) {
            const f = Math.abs(u - this.currentIndex);
            f < l && (l = f, a = u);
          }
        }), this.currentIndex = a;
      } else {
        const n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = n.length - r;
        this.currentIndex = Math.max(0, Math.min(t, o - 1));
      }
      this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
  }
  alignIndexToFreeTranslation(t) {
    if (!this.track) return;
    const e = parseFloat(this.startPadding) || 0, n = this.getBoundingClientRect()[this.sizeDim], r = Array.from(this.track.children), o = this.convertToPx(this.options.gap);
    let h = 0, a = 1 / 0;
    const l = this.currentIndex;
    for (let d = 0; d < r.length; d++) {
      let u = 0, f = 0;
      if (this.options.autoSize)
        u = this.getOffsetForIndex(d), f = this.getRectSize(r[d]) + o;
      else {
        const b = this.getSlideSizeWithGap();
        u = d * b, f = b;
      }
      let p = e;
      if (this.options.centered ? p += n / 2 - (u + f / 2) : p -= u, !this.options.loop) {
        const { max: b, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? p = Math.max(
          x,
          Math.min(b, p)
        ) : this.options.centered || (d === 0 && (p = 0), p < x && (p = x), p > 0 && (p = 0));
      }
      const m = Math.abs(t - p);
      m < a - 0.5 ? (a = m, h = d) : Math.abs(m - a) <= 0.5 && Math.abs(d - l) < Math.abs(h - l) && (h = d, a = m);
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
      const r = Array.from(
        document.querySelectorAll(
          `sx-slider-prev[name="${this.options.name}"]`
        )
      ), o = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`
        )
      );
      t = [.../* @__PURE__ */ new Set([...t, ...r])], e = [.../* @__PURE__ */ new Set([...e, ...o])];
    }
    if (this.options.loop || this.options.rewind) {
      t.forEach((r) => r.removeAttribute("sx-disabled")), e.forEach((r) => r.removeAttribute("sx-disabled"));
      return;
    }
    this.currentIndex <= 0 ? t.forEach((r) => r.setAttribute("sx-disabled", "")) : t.forEach((r) => r.removeAttribute("sx-disabled"));
    const n = this.getRealMaxIndex();
    this.currentIndex >= n ? e.forEach((r) => r.setAttribute("sx-disabled", "")) : e.forEach((r) => r.removeAttribute("sx-disabled"));
  }
  updatePagination(t, e) {
    let n = Array.from(
      this.querySelectorAll("sx-slider-pagination")
    );
    if (this.options.name) {
      const r = Array.from(
        document.querySelectorAll(
          `sx-slider-pagination[name="${this.options.name}"]`
        )
      );
      n = [.../* @__PURE__ */ new Set([...n, ...r])];
    }
    n.forEach((r) => {
      typeof r.renderBullets == "function" && r.renderBullets(t), typeof r.updateActive == "function" && r.updateActive(e);
    });
  }
}
function _t() {
  customElements.get("sx-slider") || customElements.define("sx-slider", Yt), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", qt), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", Bt), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", Ft), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", $t), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Pt), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", Dt);
}
const I = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class Nt extends HTMLElement {
  constructor() {
    super();
    c(this, "isOpen", !1);
    c(this, "previousActiveElement", null);
    c(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    c(this, "backdropEl", null);
    c(this, "dialogCoreEl", null);
    c(this, "originalContentHTML", "");
    c(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    c(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape" && this.closeOnEscKey) {
          t.preventDefault(), this.close();
          return;
        }
        t.key === "Tab" && this.trapFocus(t);
      }
    });
    c(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
  }
  static get observedAttributes() {
    return ["sx-open", "duration", "scrollable", "overlay", "overlay-style"];
  }
  get name() {
    return this.getAttribute("name");
  }
  get duration() {
    const t = this.getAttribute("duration");
    return D(t, I.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : I.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : I.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : I.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : I.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || I.overlayStyle;
  }
  connectedCallback() {
    this.originalContentHTML = this.innerHTML, this.render(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), this.removeEventListener("keydown", this.handleKeyDown), this.setInertOnSiblings(!1);
  }
  dispatchLifecycleEvent(t) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      detail: { name: this.name }
    }));
  }
  open() {
    var t;
    this.isOpen || (this.dispatchLifecycleEvent("sx-dialog-before-open"), this.isOpen = !0, this.setAttribute("sx-open", ""), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "false"), this.previousActiveElement = document.activeElement, this.lockScroll(), this.setInertOnSiblings(!0), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }));
  }
  close() {
    var t;
    this.isOpen && (this.dispatchLifecycleEvent("sx-dialog-before-close"), this.isOpen = !1, this.removeAttribute("sx-open"), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "true"), this.unlockScroll(), this.setInertOnSiblings(!1), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration));
  }
  // ✅ Inert background helper
  setInertOnSiblings(t) {
    let e = this.parentElement;
    for (; e && (Array.from(e.children).forEach((n) => {
      n !== this && !n.contains(this) && (t ? (n.setAttribute("inert", ""), n.setAttribute("aria-hidden", "true")) : (n.removeAttribute("inert"), n.removeAttribute("aria-hidden")));
    }), e.tagName !== "BODY"); )
      e = e.parentElement;
  }
  lockScroll() {
    if (this.scrollable || document.body.style.overflow === "hidden") return;
    const t = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty("--sx-scrollbar-width", `${t}px`), document.body.style.paddingRight = "var(--sx-scrollbar-width)", document.body.style.overflow = "hidden";
  }
  unlockScroll() {
    this.scrollable || setTimeout(() => {
      Array.from(document.querySelectorAll("sx-dialog[sx-open]")).some((n) => !n.scrollable) || (document.body.style.paddingRight = "", document.body.style.overflow = "", document.body.style.removeProperty("--sx-scrollbar-width"));
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
    const e = this.getFocusableElements();
    e.length ? e[0].focus() : this.dialogCoreEl && this.dialogCoreEl.focus();
  }
  // ✅ Focus Trap logic (Chặn vòng lặp Tab / Shift+Tab)
  trapFocus(t) {
    const e = this.getFocusableElements();
    if (e.length === 0) {
      t.preventDefault();
      return;
    }
    const n = e[0], r = e[e.length - 1];
    t.shiftKey ? document.activeElement === n && (t.preventDefault(), r.focus()) : document.activeElement === r && (t.preventDefault(), n.focus());
  }
  render() {
    this.style.setProperty("--sx-duration", `${this.duration}ms`);
    const t = this.querySelector('[id*="title"], [class*="title"]'), e = this.querySelector('[id*="desc"], [class*="desc"]'), n = t ? `aria-labelledby="${t.id || "sx-dialog-title"}"` : "", r = e ? `aria-describedby="${e.id || "sx-dialog-desc"}"` : "";
    t && !t.id && (t.id = "sx-dialog-title"), e && !e.id && (e.id = "sx-dialog-desc"), this.innerHTML = `
      ${this.overlay ? `<div class="sx-dialog-backdrop" style="${this.overlayStyle}"></div>` : ""}
      <div class="sx-dialog-core" 
           role="dialog" 
           aria-modal="true" 
           aria-hidden="true"
           tabindex="-1"
           ${n}
           ${r}>
        ${this.originalContentHTML}
      </div>
    `, this.backdropEl = this.querySelector(".sx-dialog-backdrop"), this.dialogCoreEl = this.querySelector(".sx-dialog-core"), this.backdropEl && this.backdropEl.addEventListener("click", this.handleBackdropClick);
  }
}
class Vt extends HTMLElement {
  constructor() {
    super(...arguments);
    c(this, "handleKeyDown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.toggleDialog());
    });
    c(this, "toggleDialog", () => {
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
function Ht() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", Nt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Vt);
}
function Xt() {
  Rt(), At(), _t(), Ht();
}
const bt = /* @__PURE__ */ new Map();
function y(s, i) {
  bt.set(s, i);
}
function H(s, i) {
  const t = bt.get(s);
  return t || (s.startsWith("--") ? Wt(s, i) : Gt(s, i));
}
function Wt(s, i) {
  return typeof i == "string" && !xt(i) ? {
    type: "discrete",
    cssKey: s,
    apply(t, e) {
      t.style.setProperty(s, e);
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const e = window.getComputedStyle(t).getPropertyValue(s).trim();
      return e || console.warn(`[six-js] CSS variable "${s}" not set, defaulting to 0`), B(e);
    },
    apply(t, e) {
      t.style.setProperty(s, `${e.num}${e.unit}`);
    }
  };
}
function xt(s) {
  return /^-?[\d.]+[a-z%]*$/i.test(s.trim());
}
function Gt(s, i) {
  return typeof i == "string" && !xt(i) ? {
    type: "discrete",
    cssKey: s,
    apply(t, e) {
      t.style[s] = e;
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const e = window.getComputedStyle(t)[s];
      return e === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${s}"`), { num: 0, unit: "" }) : B(e);
    },
    apply(t, e) {
      t.style[s] = `${e.num}${e.unit}`;
    }
  };
}
function B(s, i = "") {
  if (typeof s == "number")
    return { num: s, unit: i };
  if (typeof s != "string" || s.length === 0)
    return { num: 0, unit: i };
  const t = s.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || i } : { num: parseFloat(s) || 0, unit: i };
}
const jt = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function Ut(s, i, t, e) {
  if (typeof s != "string")
    return B(s, e);
  const n = s.match(jt);
  if (!n)
    return B(s, e);
  const [, r, o, h] = n, a = parseFloat(o), l = h || t || e;
  if (isNaN(a))
    return console.warn(`[six-js] Invalid relative value: "${s}"`), { num: i, unit: l };
  if (r === "/" && a === 0)
    return console.warn(`[six-js] Division by zero: "${s}"`), { num: i, unit: l };
  let d;
  switch (r) {
    case "+":
      d = i + a;
      break;
    case "-":
      d = i - a;
      break;
    case "*":
      d = i * a;
      break;
    case "/":
      d = i / a;
      break;
    default:
      d = i;
  }
  return { num: d, unit: l };
}
const Kt = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function ot(s) {
  const i = document.createElement("span");
  i.style.color = s, i.style.display = "none", document.body.appendChild(i);
  const t = window.getComputedStyle(i).color;
  return document.body.removeChild(i), yt(t);
}
function yt(s) {
  const i = s.match(Kt);
  return i ? {
    r: parseFloat(i[1]),
    g: parseFloat(i[2]),
    b: parseFloat(i[3]),
    a: i[4] !== void 0 ? parseFloat(i[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function Qt(s, i, t) {
  return {
    r: s.r + (i.r - s.r) * t,
    g: s.g + (i.g - s.g) * t,
    b: s.b + (i.b - s.b) * t,
    a: s.a + (i.a - s.a) * t
  };
}
function Zt(s) {
  return `rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a})`;
}
const Q = /-?[\d.]+/g;
function at(s) {
  return (s.match(Q) || []).length;
}
function Jt(s, i, t) {
  const e = at(s), n = at(i), r = e === n && n > 0;
  return r || console.warn(`[six-js] "${t}": shape mismatch (${e} vs ${n} numbers), will snap instead of interpolate`), r;
}
function te(s, i, t) {
  const e = (s.match(Q) || []).map(Number);
  let n = 0;
  return i.replace(Q, (r) => {
    const o = parseFloat(r), h = e[n] ?? o;
    n++;
    const a = h + (o - h) * t;
    return String(Math.round(a * 1e3) / 1e3);
  });
}
const q = /* @__PURE__ */ new WeakMap();
function ee(s) {
  let i = q.get(s);
  return i || (i = /* @__PURE__ */ new Map(), q.set(s, i)), i;
}
function ie(s, i) {
  var t;
  return (t = q.get(s)) == null ? void 0 : t.get(i);
}
function se(s, i, t) {
  ee(s).set(i, t);
}
function ne(s) {
  const i = q.get(s);
  if (!i || i.size === 0) return "";
  let t = "";
  for (const { fn: e, value: n, unit: r } of i.values())
    t += `${e}(${n}${r}) `;
  return t.trim();
}
function re(s, i, t) {
  const e = s.style[i];
  s.style[i] = t;
  const n = parseFloat(window.getComputedStyle(s)[i]) || 0;
  return s.style[i] = e, n;
}
const oe = /^random\((.+)\)$/i;
function ae(s) {
  return /^-?[\d.]+$/.test(s.trim());
}
function le(s) {
  const i = s.match(oe);
  if (!i) return s;
  const t = i[1].split(",").map((e) => e.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${s}"`), s;
  if (t.length === 2 && t.every(ae)) {
    const e = parseFloat(t[0]), n = parseFloat(t[1]);
    return e + Math.random() * (n - e);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function z(s, i, t) {
  let e = s;
  return typeof e == "function" && (e = e(i, t)), typeof e == "string" && (e = le(e)), e;
}
let Z = {};
function he(s) {
  Z = { ...Z, ...s };
}
function lt() {
  return Z;
}
class ce {
  constructor(i, t, e = "to", n) {
    c(this, "duration");
    c(this, "targets");
    c(this, "segments", []);
    c(this, "lastSegIndex", -1);
    if (typeof i == "string" ? this.targets = Array.from(document.querySelectorAll(i)) : this.targets = Array.isArray(i) ? i : [i], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${i}"`), t.keyframes) {
      const r = Object.keys(t).filter((o) => o !== "duration" && o !== "ease" && o !== "keyframes");
      r.length > 0 && console.warn(
        `[six-js] keyframes: property [${r.join(", ")}] ngoài keyframes sẽ bị BỎ QUA hoàn toàn, không cộng dồn với các mốc bên trong keyframes. Đưa chúng vào 1 mốc trong keyframes nếu muốn animate.`
      ), this.segments = this.buildKeyframeSegments(t.keyframes, t);
    } else
      this.segments = [this.buildSingleSegment(t, e, n)];
    this.duration = this.segments.reduce((r, o) => r + o.duration, 0);
  }
  get targetElements() {
    return this.targets;
  }
  resolveEase(i) {
    return i && !P[i] && console.warn(`[six-js] Unknown ease "${i}", falling back to linear`), i && P[i] || P.linear;
  }
  resolveDuration(i, t) {
    let e = i ?? t.duration ?? 0.5;
    return e < 0 && (console.warn(`[six-js] Negative duration (${e}), using 0 instead`), e = 0), e;
  }
  /** Tạo 1 PropState từ rawStart/rawEnd đã resolve — dùng chung cho single-segment lẫn keyframes */
  resolveProp(i, t, e, n) {
    const r = H(t, n ?? e);
    if (r.type === "discrete") {
      const l = String(n ?? e);
      return {
        key: t,
        isTransform: !1,
        state: { kind: "discrete", value: l, apply: r.apply }
      };
    }
    if (r.type === "color") {
      const l = e !== void 0 ? ot(String(e)) : r.getCurrent(i), d = n !== void 0 ? ot(String(n)) : r.getCurrent(i);
      return { key: t, isTransform: !1, state: { kind: "color", start: l, end: d, apply: r.apply } };
    }
    if (r.type === "complex") {
      const l = e !== void 0 ? String(e) : r.getCurrent(i), d = n !== void 0 ? String(n) : r.getCurrent(i);
      return Jt(l, d, t), { key: t, isTransform: !1, state: { kind: "complex", start: l, end: d, apply: r.apply } };
    }
    const o = e !== void 0 ? B(e, r.defaultUnit) : r.getCurrent(i, t);
    let h = n !== void 0 ? Ut(n, o.num, o.unit, r.defaultUnit) : r.getCurrent(i, t), a;
    if (!r.isTransform && h.unit && o.unit && h.unit !== o.unit) {
      const l = re(i, t, `${h.num}${h.unit}`);
      a = `${h.num}${h.unit}`, h = { num: l, unit: o.unit };
    }
    return {
      key: t,
      isTransform: r.isTransform,
      state: {
        kind: "numeric",
        start: o.num,
        end: h.num,
        unit: h.unit || o.unit,
        isTransform: r.isTransform,
        transformFn: r.transformFn,
        transformStoreKey: r.transformStoreKey,
        apply: r.apply,
        snapEnd: a
      }
    };
  }
  // ---------- single segment (to/from/fromTo) ----------
  buildSingleSegment(i, t, e) {
    const n = lt(), r = this.resolveDuration(i.duration, n), o = this.resolveEase(i.ease ?? n.ease), h = /* @__PURE__ */ new Set();
    for (const d in i) h.add(d);
    if (e) for (const d in e) h.add(d);
    h.delete("duration"), h.delete("ease"), h.delete("keyframes");
    const a = [], l = [];
    return this.targets.forEach((d, u) => {
      const f = [];
      let p = !1;
      for (const m of h) {
        let b, x;
        t === "to" ? x = z(i[m], u, d) : t === "from" ? b = z(i[m], u, d) : (m in i && (x = z(i[m], u, d)), e && m in e && (b = z(e[m], u, d)));
        const S = H(m, x ?? b);
        if (S.type === "discrete") {
          S.apply(d, String(x ?? b));
          continue;
        }
        const g = this.resolveProp(d, m, b, x);
        g && (g.isTransform && (p = !0), f.push({ key: g.key, state: g.state }));
      }
      a[u] = f, l[u] = p;
    }), { duration: r, easeFn: o, propStates: a, hasTransform: l };
  }
  // ---------- keyframes ----------
  buildKeyframeSegments(i, t) {
    const e = lt(), n = t.duration, r = t.ease ?? e.ease, o = Array.isArray(i) ? this.normalizeArrayKeyframes(i, n, r, e) : this.normalizePercentKeyframes(i, n, r, e);
    o.length < 2 && console.warn(`[six-js] keyframes needs at least 2 points, got ${o.length}`);
    const h = this.targets.map(() => ({})), a = [];
    for (let l = 0; l < o.length - 1; l++) {
      const d = o[l], u = o[l + 1], f = [], p = [], m = /* @__PURE__ */ new Set();
      for (const b in u.props) m.add(b);
      this.targets.forEach((b, x) => {
        const S = [];
        let g = !1;
        for (const v of m) {
          const C = z(u.props[v], x, b), N = v in d.props ? z(d.props[v], x, b) : v in h[x] ? h[x][v] : void 0, E = H(v, C);
          if (E.type === "discrete") {
            S.push({
              key: v,
              state: { kind: "discrete", value: String(C), apply: E.apply }
            }), h[x][v] = C;
            continue;
          }
          const M = this.resolveProp(b, v, N, C);
          M && (M.isTransform && (g = !0), S.push({ key: M.key, state: M.state }), h[x][v] = C);
        }
        f[x] = S, p[x] = g;
      }), a.push({
        duration: u.duration,
        easeFn: u.easeFn,
        propStates: f,
        hasTransform: p,
        onSegmentStart: u.onSegmentStart,
        onSegmentUpdate: u.onSegmentUpdate,
        onSegmentComplete: u.onSegmentComplete
      });
    }
    return a;
  }
  normalizeArrayKeyframes(i, t, e, n) {
    const r = [{ duration: 0, easeFn: P.linear, props: {} }], o = i.filter((l) => l.duration === void 0).length, h = i.reduce((l, d) => l + (d.duration ?? 0), 0), a = t !== void 0 ? o > 0 ? Math.max(0, t - h) / o : 0 : n.duration ?? 0.5;
    for (const l of i) {
      const { duration: d, ease: u, onStart: f, onUpdate: p, onComplete: m, ...b } = l, x = this.resolveDuration(d ?? a, n), S = this.resolveEase(u ?? e);
      r.push({
        duration: x,
        easeFn: S,
        props: b,
        onSegmentStart: f,
        onSegmentUpdate: p,
        onSegmentComplete: m
      });
    }
    return r;
  }
  normalizePercentKeyframes(i, t, e, n) {
    const r = this.resolveDuration(t, n), o = Object.entries(i).map(([a, l]) => {
      const d = a.trim().match(/^(-?[\d.]+)%$/);
      return d ? { pos: parseFloat(d[1]) / 100, props: l } : (console.warn(`[six-js] keyframes: invalid position "${a}", expected e.g. "50%"`), null);
    }).filter((a) => a !== null).sort((a, l) => a.pos - l.pos);
    o.length > 0 && o[0].pos !== 0 && console.warn(`[six-js] keyframes: first position should be "0%", got "${o[0].pos * 100}%"`);
    const h = [];
    for (let a = 0; a < o.length; a++) {
      const { ease: l, onStart: d, onUpdate: u, onComplete: f, ...p } = o[a].props, m = a === 0 ? o[0].pos : o[a - 1].pos, b = a === 0 ? 0 : (o[a].pos - m) * r;
      h.push({
        duration: Math.max(0, b),
        easeFn: this.resolveEase(l ?? e),
        props: p,
        onSegmentStart: d,
        onSegmentUpdate: u,
        onSegmentComplete: f
      });
    }
    return h;
  }
  // ---------- render ----------
  render(i) {
    var h, a, l, d, u;
    let t = i, e = 0;
    for (; e < this.segments.length - 1 && t > this.segments[e].duration; )
      t -= this.segments[e].duration, e++;
    const n = this.segments[e];
    if (!n) return;
    const r = n.duration === 0 ? 1 : Math.min(Math.max(t / n.duration, 0), 1), o = n.easeFn(r);
    e !== this.lastSegIndex && (this.lastSegIndex !== -1 && e > this.lastSegIndex && ((a = (h = this.segments[this.lastSegIndex]).onSegmentComplete) == null || a.call(h)), (l = n.onSegmentStart) == null || l.call(n), this.lastSegIndex = e), this.targets.forEach((f, p) => {
      const m = n.propStates[p];
      let b = !1;
      for (let x = 0; x < m.length; x++) {
        const { key: S, state: g } = m[x];
        if (g.kind === "discrete") {
          g.apply(f, g.value);
          continue;
        }
        if (g.kind === "color") {
          g.apply(f, Qt(g.start, g.end, o));
          continue;
        }
        if (g.kind === "complex") {
          g.apply(f, te(g.start, g.end, o));
          continue;
        }
        const v = g.start + (g.end - g.start) * o;
        g.isTransform && g.transformFn ? (se(f, g.transformStoreKey ?? g.transformFn, {
          value: v,
          unit: g.unit,
          fn: g.transformFn
        }), b = !0) : r === 1 && g.snapEnd !== void 0 ? f.style[S] = g.snapEnd : g.apply(f, { num: v, unit: g.unit });
      }
      b && (f.style.transform = ne(f));
    }), (d = n.onSegmentUpdate) == null || d.call(n), e === this.segments.length - 1 && r === 1 && ((u = n.onSegmentComplete) == null || u.call(n));
  }
  onStart() {
    this.targets.forEach((i, t) => {
      this.segments.some((e) => e.hasTransform[t]) && (this.targets[t].style.willChange = "transform");
    });
  }
  onComplete() {
    this.targets.forEach((i, t) => {
      this.segments.some((e) => e.hasTransform[t]) && (this.targets[t].style.willChange = "");
    });
  }
  /** Union tất cả property key bị chạm qua mọi segment — dùng bởi overwrite-manager */
  getTouchedProperties() {
    return this.targets.map((i, t) => {
      const e = /* @__PURE__ */ new Set();
      for (const n of this.segments)
        for (const { key: r } of n.propStates[t]) e.add(r);
      return { target: i, keys: Array.from(e) };
    });
  }
}
class de {
  constructor(i, t = {}) {
    c(this, "animatable");
    c(this, "elapsed", 0);
    // giây, luôn trong [0, duration]
    c(this, "rate", 1);
    // 1 = xuôi, -1 = ngược
    c(this, "running", !1);
    c(this, "dead", !1);
    // đã kill() -> không thể play/reverse/seek lại được nữa
    c(this, "listeners", {});
    c(this, "delay");
    c(this, "repeat");
    c(this, "repeatDelay");
    c(this, "boomerang");
    c(this, "repeatsDone", 0);
    /** Giây còn lại đang trong pha "chờ" (delay ban đầu HOẶC repeatDelay giữa các lượt lặp).
     *  > 0 nghĩa là animatable tạm thời không render giá trị mới, chỉ đếm ngược. */
    c(this, "waitRemaining");
    /** true nếu tick() ĐÃ từng bắn "start" (đúng 1 lần, trừ khi restart() reset lại). */
    c(this, "hasFiredStart", !1);
    /** Phân biệt "đang chạy ngược vì boomerang tự đảo" và "đang chạy ngược vì user gọi
     *  .reverse() thủ công" — 2 trường hợp cần xử lý khác nhau khi elapsed chạm mốc 0
     *  (xem onBackwardBoundary). */
    c(this, "isBoomerangReverse", !1);
    c(this, "tick", (i, t) => {
      const e = t / 1e3;
      if (this.waitRemaining > 0) {
        if (this.waitRemaining -= e, this.waitRemaining > 0) return;
        const r = -this.waitRemaining;
        this.waitRemaining = 0, this.fireStartIfNeeded(), this.elapsed += r * this.rate;
      } else
        this.fireStartIfNeeded(), this.elapsed += e * this.rate;
      const n = this.animatable.duration;
      if (this.elapsed >= n) {
        this.elapsed = n, this.animatable.render(this.elapsed), this.emit("update"), this.onForwardBoundary();
        return;
      }
      if (this.elapsed <= 0) {
        this.elapsed = 0, this.animatable.render(this.elapsed), this.emit("update"), this.onBackwardBoundary();
        return;
      }
      this.animatable.render(this.elapsed), this.emit("update");
    });
    this.animatable = i, this.delay = Math.max(0, t.delay ?? 0), this.repeat = t.repeat ?? 0, this.repeatDelay = Math.max(0, t.repeatDelay ?? 0), this.boomerang = t.boomerang ?? !1, this.waitRemaining = this.delay, t.autoplay ?? !0 ? this.play() : this.animatable.render(0);
  }
  /** Bắn onStart/emit("start") đúng 1 lần duy nhất mỗi vòng đời (reset lại bởi restart()).
   *  Tách riêng vì cần gọi từ CẢ 2 nhánh của tick() (có delay hoặc không có delay). */
  fireStartIfNeeded() {
    var i, t;
    this.hasFiredStart || (this.hasFiredStart = !0, (t = (i = this.animatable).onStart) == null || t.call(i), this.emit("start"));
  }
  /** Chạm mốc cuối (duration) trong khi đang phát XUÔI: xử lý repeat/boomerang hoặc hoàn tất. */
  onForwardBoundary() {
    if (!(this.repeat === -1 || this.repeatsDone < this.repeat)) {
      this.stop(), this.emit("complete");
      return;
    }
    this.repeatsDone++, this.emit("repeat"), this.boomerang ? (this.rate = -1, this.isBoomerangReverse = !0) : (this.elapsed = 0, this.rate = 1), this.repeatDelay > 0 && (this.waitRemaining = this.repeatDelay);
  }
  /** Chạm mốc đầu (0). Có 2 nguồn gốc khác nhau cần phân biệt: boomerang tự đảo, hay
   *  user chủ động gọi .reverse() để tua ngược thủ công (không liên quan gì tới
   *  boomerang/repeat). */
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
    var i, t;
    return this.dead || this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, k.add(this.tick), this.waitRemaining <= 0 && ((t = (i = this.animatable).onStart) == null || t.call(i)), this);
  }
  /** Tua ngược thủ công (khác với boomerang tự động) — dùng vd cho hiệu ứng hover-out. */
  reverse() {
    var i, t;
    return this.dead ? this : (this.rate = -1, this.isBoomerangReverse = !1, this.running || (this.running = !0, (t = (i = this.animatable).onStart) == null || t.call(i), k.add(this.tick)), this);
  }
  pause() {
    return this.dead || !this.running ? this : (this.running = !1, k.remove(this.tick), this);
  }
  stop() {
    var i, t;
    this.running = !1, k.remove(this.tick), (t = (i = this.animatable).onComplete) == null || t.call(i);
  }
  /** Tua tới thời điểm bất kỳ (giây) trong 1 lượt hiện tại, không phụ thuộc trạng thái
   *  đang chạy hay không. Không tính tới nhiều vòng repeat (chỉ trong [0, duration]). */
  seek(i) {
    return this.dead ? this : (this.elapsed = Math.max(0, Math.min(i, this.animatable.duration)), this.animatable.render(this.elapsed), this.emit("update"), this);
  }
  restart() {
    return this.dead ? this : (this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0), this.play(), this);
  }
  /** Đưa tween về đúng trạng thái BAN ĐẦU (elapsed=0, hướng xuôi, đếm repeat/delay reset
   *  lại từ đầu) và DỪNG LUÔN, khác với restart() (reset xong tự play() ngay). Dùng khi
   *  muốn "rewind" 1 tween về trạng thái nghỉ mà không muốn nó chạy lại ngay lập tức. */
  reset() {
    return this.dead ? this : (this.pause(), this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0), this.emit("update"), this);
  }
  /** Dừng vĩnh viễn — sau khi kill(), mọi lệnh play/reverse/seek/restart đều là no-op.
   *  Dùng nội bộ bởi overwrite-manager để huỷ tween cũ khi bị tween mới ghi đè. */
  kill() {
    return this.dead ? this : (this.dead = !0, this.pause(), this);
  }
  on(i, t) {
    return this.listeners[i] || (this.listeners[i] = /* @__PURE__ */ new Set()), this.listeners[i].add(t), this;
  }
  off(i, t) {
    var e;
    return (e = this.listeners[i]) == null || e.delete(t), this;
  }
  emit(i) {
    var t;
    (t = this.listeners[i]) == null || t.forEach((e) => e());
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
}
function St() {
  var s;
  return ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight;
}
function Y(s, i) {
  return s.ratio * i + s.offsetPx;
}
function ht(s) {
  const i = s.trim(), t = i.match(/^(-?[\d.]+)(px)?$/);
  if (t)
    return { ratio: 0, offsetPx: parseFloat(t[1]) };
  const e = i.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);
  if (!e || !e[1] && !e[2])
    return console.warn(`[six-js] onScroll: unknown position "${s}", using "top"`), { ratio: 0, offsetPx: 0 };
  const [, n, r, o, h] = e;
  let a = 0;
  n === "center" ? a = 0.5 : n === "bottom" ? a = 1 : n != null && n.endsWith("%") && (a = parseFloat(n) / 100);
  let l = 0;
  if (r && o) {
    const d = parseFloat(o), u = r === "+=" ? d : -d;
    h === "%" ? a += u / 100 : l += u;
  }
  return { ratio: a, offsetPx: l };
}
function ct(s, i, t) {
  const e = s.match(/^([+-]=)(\d+(\.\d+)?)$/);
  if (e) {
    if (t === void 0)
      return console.warn(`[six-js] onScroll: "${s}" has nothing to be relative to`), { scrollY: 0, viewportSpec: { ratio: 0, offsetPx: 0 }, viewportLabel: s, documentY: 0, triggerLabel: s };
    const f = e[1] === "+=" ? 1 : -1, p = t + f * parseFloat(e[2]);
    return {
      scrollY: p,
      viewportSpec: { ratio: 0, offsetPx: 0 },
      viewportLabel: s,
      documentY: p,
      triggerLabel: s
    };
  }
  const [n = "top", r = "top"] = s.trim().split(/\s+/), o = ht(n), h = ht(r), a = i.getBoundingClientRect(), d = window.scrollY + a.top + Y(o, a.height), u = Y(h, St());
  return {
    scrollY: d - u,
    viewportSpec: h,
    viewportLabel: r,
    documentY: d,
    triggerLabel: n
  };
}
const X = 20, dt = 24, ue = 20;
class pe {
  constructor(i, t, e) {
    c(this, "triggerEl");
    c(this, "playable");
    c(this, "options");
    c(this, "startY", 0);
    c(this, "endY", 0);
    // Phía VIEWPORT của start/end (marker position: fixed)
    c(this, "startViewportSpec", { ratio: 0, offsetPx: 0 });
    c(this, "endViewportSpec", { ratio: 1, offsetPx: 0 });
    c(this, "startViewportLabel", "");
    c(this, "endViewportLabel", "");
    // Phía TRIGGER của start/end (marker position: absolute) — đúng theo token truyền
    // vào (top/center/bottom/%), KHÔNG mặc định neo cứng vào top/bottom của trigger.
    c(this, "startTriggerY", 0);
    c(this, "endTriggerY", 0);
    c(this, "startTriggerLabel", "");
    c(this, "endTriggerLabel", "");
    /** true nếu 2 marker trigger-side (start/end) trùng vị trí document -> phải xếp
     *  label thành 2 hàng. Chỉ đổi khi layout đổi (recalc()), không phụ thuộc scroll. */
    c(this, "triggerLabelsCollide", !1);
    c(this, "smoothedProgress", 0);
    c(this, "wasInside", !1);
    c(this, "lastScrollY", window.scrollY);
    c(this, "rafPending", !1);
    c(this, "pinSpacer", null);
    c(this, "pinned", !1);
    c(this, "pinOriginalStyles", null);
    c(this, "startMarker", null);
    // viewport-side của "start"
    c(this, "endMarker", null);
    // viewport-side của "end"
    c(this, "startTriggerMarker", null);
    // trigger-side của "start"
    c(this, "endTriggerMarker", null);
    // trigger-side của "end"
    c(this, "resizeObserver", null);
    c(this, "recalcRafPending", !1);
    c(this, "onScrollBound", () => this.requestUpdate());
    c(this, "onResizeBound", () => this.recalc());
    c(this, "tickerBound", (i, t) => this.tickSmooth(t));
    var n;
    this.triggerEl = i, this.playable = t, this.options = e, e.debug && this.setupDebugMarkers(), this.recalc(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), (n = window.visualViewport) == null || n.addEventListener("resize", this.onResizeBound), this.setupResizeObserver(), typeof e.sync == "number" && k.add(this.tickerBound), this.update();
  }
  /**
   * Ngoài "resize" của window, kích thước trang có thể đổi vì lý do khác:
   * ảnh lazy-load xong, font load xong reflow, accordion mở/đóng, nội dung
   * dynamic được thêm/xoá... Các trường hợp này KHÔNG bắn ra event "resize".
   * Dùng ResizeObserver theo dõi <body> (đại diện chiều cao toàn trang) và
   * triggerEl (đại diện chiều cao riêng của phần tử trigger) để tự recalc().
   */
  setupResizeObserver() {
    typeof ResizeObserver > "u" || (this.resizeObserver = new ResizeObserver(() => {
      this.recalcRafPending || (this.recalcRafPending = !0, requestAnimationFrame(() => {
        this.recalcRafPending = !1, this.recalc();
      }));
    }), this.resizeObserver.observe(document.body), this.resizeObserver.observe(this.triggerEl));
  }
  recalc() {
    const i = this.options.start ?? "top bottom", t = this.options.end ?? "bottom top", e = ct(i, this.triggerEl);
    this.startY = e.scrollY, this.startViewportSpec = e.viewportSpec, this.startViewportLabel = e.viewportLabel, this.startTriggerY = e.documentY, this.startTriggerLabel = e.triggerLabel;
    const n = ct(t, this.triggerEl, this.startY);
    this.endY = n.scrollY, this.endViewportSpec = n.viewportSpec, this.endViewportLabel = n.viewportLabel, this.endTriggerY = n.documentY, this.endTriggerLabel = n.triggerLabel, this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < dt, this.updateDebugMarkers();
  }
  computeProgress() {
    const i = window.scrollY;
    return Math.max(0, Math.min((i - this.startY) / (this.endY - this.startY), 1));
  }
  requestUpdate() {
    this.rafPending || (this.rafPending = !0, requestAnimationFrame(() => {
      this.rafPending = !1, this.update();
    }));
  }
  update() {
    var a, l, d, u, f, p, m, b;
    const i = window.scrollY, t = this.computeProgress(), e = i >= this.startY && i <= this.endY, n = i >= this.lastScrollY, r = e && !this.wasInside, o = !e && this.wasInside;
    r ? n ? (l = (a = this.options).onEnter) == null || l.call(a) : (u = (d = this.options).onEnterBack) == null || u.call(d) : o && (n ? (p = (f = this.options).onLeave) == null || p.call(f) : (b = (m = this.options).onLeaveBack) == null || b.call(m)), this.wasInside = e, this.lastScrollY = i, this.options.pin && this.updatePin(e), this.updateTriggerMarkerLabelFlip(i);
    const h = this.options.sync ?? !1;
    h === !1 ? r && n && this.playable.restart() : h === !0 && this.playable.seek(t * this.playable.duration);
  }
  /**
   * sync (number) = số giây thực để "đuổi kịp" ~95% vị trí scroll thật, khớp đúng
   * ngữ nghĩa scrub number của GSAP. Dùng hằng số thời gian tau = lagSeconds/3 vì
   * exp(-3) ≈ 0.05 (đã bắt kịp 95%) đúng lúc t = lagSeconds.
   */
  tickSmooth(i) {
    if (typeof this.options.sync != "number") return;
    const t = this.computeProgress(), e = Math.max(0.05, this.options.sync), n = i / 1e3, r = 1 - Math.exp(-3 * n / e);
    this.smoothedProgress += (t - this.smoothedProgress) * r, Math.abs(t - this.smoothedProgress) < 5e-4 && (this.smoothedProgress = t), this.playable.seek(this.smoothedProgress * this.playable.duration);
  }
  updatePin(i) {
    i && !this.pinned ? this.pinElement() : !i && this.pinned && this.unpinElement();
  }
  pinElement() {
    var e;
    const i = this.triggerEl.getBoundingClientRect(), t = document.createElement("div");
    t.style.height = `${i.height}px`, t.style.width = `${i.width}px`, (e = this.triggerEl.parentElement) == null || e.insertBefore(t, this.triggerEl), this.pinSpacer = t, this.pinOriginalStyles = {
      position: this.triggerEl.style.position,
      top: this.triggerEl.style.top,
      left: this.triggerEl.style.left,
      width: this.triggerEl.style.width,
      zIndex: this.triggerEl.style.zIndex
    }, this.triggerEl.style.position = "fixed", this.triggerEl.style.top = "0px", this.triggerEl.style.left = `${i.left}px`, this.triggerEl.style.width = `${i.width}px`, this.triggerEl.style.zIndex = "10", this.pinned = !0;
  }
  unpinElement() {
    var i;
    this.pinOriginalStyles && (Object.assign(this.triggerEl.style, this.pinOriginalStyles), (i = this.pinSpacer) == null || i.remove(), this.pinSpacer = null, this.pinned = !1);
  }
  setupDebugMarkers() {
    this.startMarker = this.createMarkerLine({ color: "#4ade80", align: "left", position: "fixed" }), this.startTriggerMarker = this.createMarkerLine({ color: "#4ade80", align: "right", position: "absolute" }), this.endMarker = this.createMarkerLine({ color: "#f87171", align: "left", position: "fixed" }), this.endTriggerMarker = this.createMarkerLine({ color: "#f87171", align: "right", position: "absolute" });
  }
  /**
   * - startMarker/endMarker (viewport-side): position: fixed, neo theo TỈ LỆ VIEWPORT ->
   *   đứng yên trên màn hình khi cuộn (giống marker scroller của GSAP).
   * - startTriggerMarker/endTriggerMarker (trigger-side): position: absolute, neo theo
   *   TOẠ ĐỘ DOCUMENT của đúng điểm được truyền vào start/end (vd "center" -> giữa trigger,
   *   không mặc định là top/bottom) -> tự cuộn theo trang như phần tử absolute bình thường.
   *
   * Khi cuộn tới đúng scrollY đã tính, line viewport-side và trigger-side của cùng 1 cặp
   * sẽ trùng khít nhau trên màn hình — đó chính là lúc điều kiện start/end được kích hoạt.
   *
   * Cả 4 marker chỉ tính lại khi layout thật sự đổi (recalc(), không phải mỗi frame) —
   * không cần vòng lặp render riêng để "đuổi theo" transform của tween.
   *
   * will-change: transform giúp trình duyệt (đặc biệt Safari) composite marker trên riêng
   * 1 layer, tránh giật/lag khi cuộn quán tính (momentum scrolling).
   */
  createMarkerLine(i) {
    const { color: t, align: e, position: n } = i, r = document.createElement("div");
    r.style.cssText = `
      position: ${n};
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
      ${e}: 0;
      background: ${t};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `, this.applyLabelSide(o, "above"), r.appendChild(o), document.body.appendChild(r), { line: r, label: o };
  }
  /** Đặt label phía trên hoặc phía dưới đường kẻ. `stackIndex` > 0 dùng khi có marker
   *  khác cùng nhóm (viewport/trigger) trùng vị trí -> đẩy label ra xa thêm 1 "hàng"
   *  (LABEL_ROW_HEIGHT) theo đúng hướng above/below, để 2 label không đè lên nhau. */
  applyLabelSide(i, t, e = 0) {
    const n = e * ue;
    t === "above" ? (i.style.top = `${-1 - n}px`, i.style.transform = "translateY(-100%)") : (i.style.top = `${1 + n}px`, i.style.transform = "translateY(0)");
  }
  /**
   * Set vị trí (top, px) cho 1 marker, đồng thời tự lật label xuống dưới đường kẻ nếu
   * nó quá sát mép trên của VIEWPORT (không đủ chỗ hiện label phía trên -> label sẽ bị
   * tràn ra ngoài / khuất khỏi màn hình). So sánh luôn dùng vị trí trên-màn-hình thực tế
   * (kể cả marker absolute, vì lúc đó topPx đã được trừ theo scrollY tương ứng).
   *
   * `stackIndex` > 0 khi marker này va chạm vị trí với 1 marker khác cùng nhóm -> đẩy
   * label ra xa thêm để tránh chồng khít lên nhau che mất chữ (xem ảnh chụp bug thực tế).
   */
  setMarkerPosition(i, t, e, n = 0) {
    i.line.style.top = `${t}px`, this.applyLabelSide(i.label, e < X ? "below" : "above", n);
  }
  /** Chỉ tính lại xem label của marker trigger-side (start/end) nên hiện trên hay dưới
   *  đường kẻ (dựa vào khoảng cách hiện tại tới mép trên viewport = docY - scrollY).
   *  KHÔNG đụng tới vị trí đường kẻ (vẫn đứng yên theo document, tính 1 lần ở recalc()). */
  updateTriggerMarkerLabelFlip(i) {
    if (this.startTriggerMarker) {
      const t = this.startTriggerY - i;
      this.applyLabelSide(this.startTriggerMarker.label, t < X ? "below" : "above", 0);
    }
    if (this.endTriggerMarker) {
      const t = this.endTriggerY - i, e = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, t < X ? "below" : "above", e);
    }
  }
  updateDebugMarkers() {
    const i = St(), t = window.scrollY, e = Y(this.startViewportSpec, i), n = Y(this.endViewportSpec, i), r = Math.abs(e - n) < dt;
    if (this.startMarker && (this.setMarkerPosition(this.startMarker, e, e, 0), this.startMarker.label.textContent = `start: "${this.startViewportLabel}"`), this.endMarker && (this.setMarkerPosition(this.endMarker, n, n, r ? 1 : 0), this.endMarker.label.textContent = `end: "${this.endViewportLabel}"`), this.startTriggerMarker && (this.setMarkerPosition(this.startTriggerMarker, this.startTriggerY, this.startTriggerY - t, 0), this.startTriggerMarker.label.textContent = `start: "${this.startTriggerLabel}"`), this.endTriggerMarker) {
      const o = this.triggerLabelsCollide ? 1 : 0;
      this.setMarkerPosition(this.endTriggerMarker, this.endTriggerY, this.endTriggerY - t, o), this.endTriggerMarker.label.textContent = `end: "${this.endTriggerLabel}"`;
    }
  }
  removeDebugMarkers() {
    var i, t, e, n;
    (i = this.startMarker) == null || i.line.remove(), (t = this.endMarker) == null || t.line.remove(), (e = this.startTriggerMarker) == null || e.line.remove(), (n = this.endTriggerMarker) == null || n.line.remove(), this.startMarker = null, this.endMarker = null, this.startTriggerMarker = null, this.endTriggerMarker = null;
  }
  destroy() {
    var i, t;
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), (i = window.visualViewport) == null || i.removeEventListener("resize", this.onResizeBound), (t = this.resizeObserver) == null || t.disconnect(), this.resizeObserver = null, k.remove(this.tickerBound), this.unpinElement(), this.removeDebugMarkers();
  }
}
const ut = /* @__PURE__ */ new WeakMap();
let pt = !1;
function fe(s, i, t) {
  if (t) {
    t === "auto" && !pt && (pt = !0, console.warn(
      '[six-js] overwrite: "auto" (chỉ huỷ property trùng) chưa được hỗ trợ đầy đủ, tạm thời xử lý như overwrite: true (huỷ toàn bộ tween cũ trên cùng target).'
    ));
    for (const e of s) {
      let n = ut.get(e);
      n || (n = /* @__PURE__ */ new Set(), ut.set(e, n));
      for (const o of n)
        o !== i && o.kill();
      n.clear(), n.add(i);
      const r = () => n.delete(i);
      i.on("complete", r), i.on("reverseComplete", r);
    }
  }
}
function ge(s, i, t) {
  if (typeof t == "number")
    return s * t;
  const { each: e, from: n = "start" } = t;
  if (typeof e != "number" || isNaN(e))
    return console.warn(`[six-js] stagger.each phải là số, nhận được ${e} — dùng 0 thay thế`), 0;
  let r;
  return n === "start" ? r = s : n === "end" ? r = i - 1 - s : n === "center" ? r = Math.abs(s - (i - 1) / 2) : r = Math.abs(s - n), r * e;
}
class me {
  constructor(i) {
    this.playables = i;
  }
  play() {
    return this.playables.forEach((i) => i.play()), this;
  }
  pause() {
    return this.playables.forEach((i) => i.pause()), this;
  }
  restart() {
    return this.playables.forEach((i) => i.restart()), this;
  }
  reset() {
    return this.playables.forEach((i) => i.reset()), this;
  }
  reverse() {
    return this.playables.forEach((i) => i.reverse()), this;
  }
  kill() {
    return this.playables.forEach((i) => i.kill()), this;
  }
  /** Danh sách Playable con, dùng khi cần điều khiển riêng lẻ từng phần tử */
  get all() {
    return this.playables;
  }
}
const tt = {
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
}, O = 180 / Math.PI;
function be(s) {
  const i = window.getComputedStyle(s).transform;
  return !i || i === "none" ? { ...tt } : i.startsWith("matrix3d") ? ye(i) : xe(i);
}
function xe(s) {
  const i = s.match(/matrix\(([^)]+)\)/);
  if (!i) return { ...tt };
  const t = i[1].split(",").map((f) => parseFloat(f.trim())), [e, n, r, o, h, a] = t, l = Math.sqrt(e * e + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, e) * O;
  return {
    x: h,
    y: a,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: l,
    scaleX: l,
    scaleY: d,
    skewX: 0,
    skewY: 0
  };
}
function ye(s) {
  const i = s.match(/matrix3d\(([^)]+)\)/);
  if (!i) return { ...tt };
  const t = i[1].split(",").map((g) => parseFloat(g.trim())), e = t[0], n = t[1], r = t[2], o = t[4], h = t[5], a = t[6];
  t[8], t[9];
  const l = t[10], d = t[12], u = t[13], f = t[14], p = Math.sqrt(e * e + n * n + r * r), m = Math.sqrt(o * o + h * h + a * a), b = Math.atan2(n, e) * O, x = Math.atan2(-r, Math.sqrt(a * a + l * l)) * O, S = Math.atan2(a, l) * O;
  return {
    x: d,
    y: u,
    z: f,
    rotate: b,
    rotateX: S,
    rotateY: x,
    rotateZ: b,
    scale: p,
    scaleX: p,
    scaleY: m,
    skewX: 0,
    skewY: 0
  };
}
function w(s, i, t, e = s) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: s,
    transformStoreKey: e,
    defaultUnit: i,
    getCurrent(n) {
      const r = ie(n, e);
      return r ? { num: r.value, unit: r.unit } : { num: be(n)[t], unit: i };
    },
    apply() {
    }
  };
}
y("x", w("translateX", "px", "x"));
y("y", w("translateY", "px", "y"));
y("z", w("translateZ", "px", "z"));
y("translateX", w("translateX", "px", "x", "translateX-2"));
y("translateY", w("translateY", "px", "y", "translateY-2"));
y("rotate", w("rotate", "deg", "rotate"));
y("rotateX", w("rotateX", "deg", "rotateX"));
y("rotateY", w("rotateY", "deg", "rotateY"));
y("rotateZ", w("rotateZ", "deg", "rotateZ"));
y("scale", w("scale", "", "scale"));
y("scaleX", w("scaleX", "", "scaleX"));
y("scaleY", w("scaleY", "", "scaleY"));
y("skewX", w("skewX", "deg", "skewX"));
y("skewY", w("skewY", "deg", "skewY"));
function A(s, i) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: i,
    getCurrent(t) {
      const e = window.getComputedStyle(t)[s];
      return B(e, i);
    },
    apply(t, e) {
      t.style[s] = `${e.num}${e.unit}`;
    }
  };
}
y("width", A("width", "px"));
y("height", A("height", "px"));
y("top", A("top", "px"));
y("left", A("left", "px"));
y("right", A("right", "px"));
y("bottom", A("bottom", "px"));
y("borderWidth", A("borderWidth", "px"));
y("opacity", A("opacity", ""));
y("fontSize", A("fontSize", "px"));
y("letterSpacing", A("letterSpacing", "px"));
function _(s) {
  return {
    type: "color",
    cssKey: s,
    getCurrent(i) {
      const t = window.getComputedStyle(i)[s];
      return yt(t);
    },
    apply(i, t) {
      i.style[s] = Zt(t);
    }
  };
}
y("backgroundColor", _("backgroundColor"));
y("color", _("color"));
y("borderColor", _("borderColor"));
y("background", _("backgroundColor"));
function Se(s) {
  return {
    type: "discrete",
    cssKey: s,
    apply(i, t) {
      i.style[s] = t;
    }
  };
}
const ve = [
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
ve.forEach((s) => y(s, Se(s)));
function et(s) {
  return {
    type: "complex",
    cssKey: s,
    getCurrent(i) {
      const t = window.getComputedStyle(i)[s];
      return t && t !== "none" ? t : "";
    },
    apply(i, t) {
      i.style[s] = t;
    }
  };
}
y("boxShadow", et("boxShadow"));
y("filter", et("filter"));
y("borderRadius", et("borderRadius"));
wt();
let ft = !1;
function Ce() {
  ft || (Xt(), ft = !0);
}
function ke(s) {
  return typeof s == "string" ? document.querySelector(s) : Array.isArray(s) ? s[0] ?? null : s;
}
function we(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : Array.isArray(s) ? s : [s];
}
function W(s, i, t, e, n, r) {
  const o = new ce(s, i, t, e), h = new de(o, {
    autoplay: r.onScroll ? !1 : !r.paused,
    delay: (r.delay ?? 0) + n,
    repeat: r.repeat,
    repeatDelay: r.repeatDelay,
    boomerang: r.boomerang
  });
  if (r.onStart && h.on("start", r.onStart), r.onUpdate && h.on("update", r.onUpdate), r.onComplete && h.on("complete", r.onComplete), r.onRepeat && h.on("repeat", r.onRepeat), r.onReverseComplete && h.on("reverseComplete", r.onReverseComplete), fe(o.targetElements, h, r.overwrite), r.onScroll) {
    const a = ke(r.onScroll.target ?? s);
    a ? new pe(a, h, r.onScroll) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return h;
}
function it(s, i, t, e) {
  const {
    onScroll: n,
    stagger: r,
    delay: o,
    paused: h,
    repeat: a,
    repeatDelay: l,
    boomerang: d,
    overwrite: u,
    onStart: f,
    onUpdate: p,
    onComplete: m,
    onRepeat: b,
    onReverseComplete: x,
    ...S
  } = i, g = { onScroll: n, delay: o, paused: h, repeat: a, repeatDelay: l, boomerang: d, overwrite: u, onStart: f, onUpdate: p, onComplete: m, onRepeat: b, onReverseComplete: x };
  if (r === void 0)
    return W(s, S, t, e, 0, g);
  const v = we(s);
  if (n)
    return console.warn("[six-js] stagger + onScroll chưa được hỗ trợ đồng thời, bỏ qua stagger"), W(s, S, t, e, 0, g);
  v.length === 0 && console.warn("[six-js] stagger: no elements matched"), Object.values(S).some((E) => typeof E == "function") && console.warn(
    "[six-js] stagger: function value (index, el) => ... luôn nhận index=0 vì mỗi phần tử stagger giờ là 1 tween độc lập, không phải index gốc trong danh sách. Nếu cần giá trị theo index gốc, hãy tự tính mảng giá trị trước thay vì dùng callback."
  );
  const N = v.map(
    (E, M) => W(E, S, t, e, ge(M, v.length, r), g)
  );
  return new me(N);
}
function Te(s, i) {
  return it(s, i, "to");
}
function Ae(s, i) {
  return it(s, i, "from");
}
function Ee(s, i, t) {
  return it(s, t, "fromTo", i);
}
const Ie = {
  initElement: Ce,
  to: Te,
  from: Ae,
  fromTo: Ee,
  setDefaults: he
};
export {
  kt as VERSION,
  Ie as six
};
