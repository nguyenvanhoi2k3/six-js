var gt = Object.defineProperty;
var mt = (s, i, t) => i in s ? gt(s, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[i] = t;
var a = (s, i, t) => mt(s, typeof i != "symbol" ? i + "" : i, t);
const bt = "0.0.31";
let Z = !1;
function xt() {
  Z || (Z = !0, console.log(
    ` SixJS v${bt}`
  ));
}
function R(s) {
  return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? (s -= 1.5 / 2.75, 7.5625 * s * s + 0.75) : s < 2.5 / 2.75 ? (s -= 2.25 / 2.75, 7.5625 * s * s + 0.9375) : (s -= 2.625 / 2.75, 7.5625 * s * s + 0.984375);
}
const I = 1.70158, P = I * 1.525, D = {
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
  "back-in": (s) => (I + 1) * s * s * s - I * s * s,
  "back-out": (s) => (s--, 1 + (I + 1) * s * s * s + I * s * s),
  "back-in-out": (s) => {
    if (s < 0.5) {
      const t = 2 * s;
      return t * t * ((P + 1) * t - P) / 2;
    }
    const i = 2 * s - 2;
    return (i * i * ((P + 1) * i + P) + 2) / 2;
  },
  // Bounce
  "bounce-in": (s) => 1 - R(1 - s),
  "bounce-out": R,
  "bounce-in-out": (s) => s < 0.5 ? (1 - R(1 - 2 * s)) / 2 : (1 + R(2 * s - 1)) / 2
}, j = /* @__PURE__ */ new WeakMap();
let V = [], N = null;
function J(s, i) {
  V.push({ instance: s, type: i }), N === null && (N = requestAnimationFrame(yt));
}
function yt() {
  const s = V.slice();
  V.length = 0, N = null;
  for (let i = 0; i < s.length; i++) {
    const { instance: t, type: e } = s[i];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let Y = null;
function lt() {
  return typeof window > "u" ? null : (Y || (Y = new IntersectionObserver(
    (s) => {
      for (let i = 0; i < s.length; i++) {
        const t = s[i], e = j.get(t.target);
        e && (t.isIntersecting ? J(e, "enter") : J(e, "leave"));
      }
    },
    { threshold: 0.05 }
  )), Y);
}
function ht(s, i) {
  var t;
  j.set(s, i), (t = lt()) == null || t.observe(s);
}
function H(s) {
  var i;
  j.delete(s), (i = lt()) == null || i.unobserve(s);
}
function L(s, i) {
  if (s == null) return i;
  const t = s.trim();
  if (!t) return i;
  const e = Number(t);
  return Number.isFinite(e) ? e * 1e3 : i;
}
const T = class T extends HTMLElement {
  constructor() {
    super(...arguments);
    a(this, "animation");
    a(this, "options");
    a(this, "order", T.counter++);
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
    this.setInitialState(), ht(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), H(this), T.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || H(this), this.isGroup ? (T.groupQueue.add(this), T.scheduleGroup()) : this.play();
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
    }, n = this.getAttribute("type") ?? "fade-up", r = this.getAttribute("easing"), [o, d] = e[n] ?? e["fade-up"];
    return {
      x: o,
      y: d,
      easing: r && r in D ? r : "ease-in-out",
      duration: L(this.getAttribute("duration"), 400),
      delay: L(this.getAttribute("delay"), 0)
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
    var h;
    const { x: e, y: n, easing: r, duration: o, delay: d } = this.options;
    (h = this.animation) == null || h.cancel(), this.animation = this.animate(
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
        delay: d + t,
        easing: r,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var l;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (l = this.animation) == null || l.cancel(), this.animation = void 0;
    };
  }
};
a(T, "counter", 0), a(T, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), a(T, "groupQueue", /* @__PURE__ */ new Set()), a(T, "isProcessingGroup", !1);
let X = T;
function St() {
  customElements.get("sx-animate") || customElements.define("sx-animate", X);
}
class vt {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Set());
    a(this, "_time", 0);
    // seconds
    a(this, "_delta", 0);
    // ms
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
const C = new vt();
class Ct extends HTMLElement {
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
    a(this, "updateAnimation", (t, e) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const n = e / 1e3, r = this.speed * n, o = this.direction, h = this.isVertical ? this.offsetHeight : this.offsetWidth;
      o === "left" || o === "up" ? (this.offset -= r, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = h)) : (this.offset += r, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= h && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), ht(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, C.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, C.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), H(this), C.remove(this.updateAnimation);
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
          const d = o < r ? Math.ceil(r * 2 / o) : 2, h = document.createDocumentFragment();
          for (let l = 1; l < d; l++)
            for (const c of e) {
              const u = c.cloneNode(!0);
              u.setAttribute("data-clone", "true"), h.appendChild(u);
            }
          this.inner.appendChild(h);
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
class kt extends HTMLElement {
}
class wt extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function Tt() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Ct), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", kt), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", wt);
}
class Et extends HTMLElement {
  constructor() {
    super();
  }
}
class At {
  constructor() {
    a(this, "sliders", /* @__PURE__ */ new Map());
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
const M = new At();
class Mt extends HTMLElement {
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
    const e = t.target;
    if (e.classList.contains("sx-slider-pagination-bullet")) {
      const n = Number(e.getAttribute("data-index"));
      this.goToSlide(n);
    }
  }
  goToSlide(t) {
    const e = this.getAttribute("name");
    let n = null;
    e ? n = M.get(e) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), n = e === "dynamic", r = e === "snake", o = e === "fraction", d = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature === d) return;
    if (this.renderedSignature = d, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const l = document.createElement("span");
      l.className = "sx-slider-pagination-current", l.textContent = "1";
      const c = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(l), p.appendChild(c), p.appendChild(u), this.appendChild(p);
      return;
    }
    const h = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((l, c) => {
        const u = this.createBulletDOM(l, c, !1);
        this.cachedBullets.push(u), h.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", h.appendChild(this.snakeBar), this.appendChild(h);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", h.appendChild(this.innerContainer), t.forEach((l, c) => {
        const u = this.createBulletDOM(l, c, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(h);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((l, c) => {
      const u = this.createBulletDOM(l, c, e === "number");
      this.cachedBullets.push(u), h.appendChild(u);
    }), this.appendChild(h);
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
    const n = e === "dynamic", r = e === "snake", o = this.cachedBullets, d = o.length;
    if (d === 0) return;
    if (o.forEach((u, p) => {
      n && (u.className = "sx-slider-pagination-bullet"), p === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const m = t * 20, b = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const S = m - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const S = b - m + 10;
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || d <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let h = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    h = Math.min(h, d - this.maxVisibleBullets);
    const l = h + this.maxVisibleBullets - 1;
    o.forEach((u, p) => {
      p >= h && p <= l ? p === h ? u.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === h + 1 ? u.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === l ? u.classList.add(
        p === d - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === l - 1 ? u.classList.add(
        p === d - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const c = -h * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${c}px)`;
  }
}
class zt extends HTMLElement {
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
      const t = M.get(i);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class It extends HTMLElement {
  constructor() {
    super();
    a(this, "bar");
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
class Lt extends HTMLElement {
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
      const t = M.get(i);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class Rt {
  constructor(i, t, e = 0.92) {
    a(this, "velocity", 0);
    a(this, "friction");
    a(this, "onUpdate");
    a(this, "onComplete");
    a(this, "isRunning", !1);
    a(this, "tickerCallback");
    this.onUpdate = i, this.onComplete = t, this.friction = e, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(i) {
    this.friction = i;
  }
  addVelocity(i) {
    this.velocity += i, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, C.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, C.add(this.tickerCallback));
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
class Pt extends HTMLElement {
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
        const { max: e, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(e, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    a(this, "wheelInertia", new Rt(
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
      const { max: d, min: h } = this.sliderCha.getBoundaries(), l = this.sliderCha.options.edgeResistance;
      o > d ? o = l <= 0 ? d : d + Math.min(l, (o - d) * 0.3) : o < h && (o = l <= 0 ? h : h - Math.min(l, (h - o) * 0.3)), this.currentTranslate = o;
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
        const d = this.sliderCha.getCurrentIndex();
        let h = t.autoSize ? this.sliderCha.getOffsetForIndex(d) : d * this.sliderCha.getSlideSizeWithGap();
        const l = this.children[d];
        let c = t.autoSize ? (l ? l.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (h + c / 2);
        } else
          r = o - h;
        if (!t.loop) {
          const { max: u, min: p } = this.sliderCha.getBoundaries();
          r = Math.max(p, Math.min(u, r));
        }
      }
      if (t.loop)
        this.startMomentumScroll(r);
      else {
        const { max: o, min: d } = this.sliderCha.getBoundaries(), h = Math.max(
          d,
          Math.min(o, r)
        );
        this.startMomentumScroll(h);
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
    var d;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (d = this.sliderCha) != null && d.options.loop && this.checkLoopBoundsInstant(), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, C.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, n = Math.min(e / this.scrollDuration, 1), r = 1 - Math.pow(1 - n, 4), d = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += d, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
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
        if (this.scrollFriction *= 0.6, Math.abs(d) < 1) {
          const p = this.currentTranslate > h ? h : l;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(d) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, C.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, C.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, e = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(e), r = this.sliderCha.getOffsetForIndex(e + t) - o;
    else {
      const m = this.sliderCha.getSlideSizeWithGap();
      o = e * m, r = t * m;
    }
    let d = 0;
    if (this.sliderCha.options.centered) {
      const m = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let b = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), x = this.children[e];
        b = x ? x.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        b = this.sliderCha.getSlideSizeWithGap();
      d = m / 2 - b / 2;
    }
    const h = -o + n + d, l = h - r;
    let c = !1, u = this.currentTranslate, p = 0, f = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > h + g ? (u = this.currentTranslate - r, p = -r, f = t, c = !0) : this.currentTranslate <= l - g && (u = this.currentTranslate + r, p = r, f = -t, c = !0), c && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + f
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
    let o = n, d = 0, h = 0;
    if (e.autoSize) {
      d = this.sliderCha.getOffsetForIndex(r);
      const l = Array.from(this.children), c = this.sliderCha.convertToPx(e.gap);
      h = l[r] ? l[r].getBoundingClientRect()[this.sliderCha.sizeDim] + c : 0;
    } else {
      const l = this.sliderCha.getSlideSizeWithGap();
      d = r * l, h = l;
    }
    if (e.centered) {
      const l = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += l / 2 - (d + h / 2);
    } else
      o -= d;
    if (!e.loop) {
      const { max: l, min: c } = this.sliderCha.getBoundaries();
      o = Math.max(c, Math.min(l, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const l = this.sliderCha.originalSlidesCount, c = e.autoSize ? l : e.perView;
      (r >= c + l || r < c) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
class tt {
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
    const r = Object.keys(e).map(Number).sort((o, d) => o - d);
    for (const o of r)
      if (i >= o) {
        const d = this.kebabToCamel(e[o]);
        n = { ...n, ...d };
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
class Bt extends HTMLElement {
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
  updateProgress(t, e) {
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const l = this.originalSlidesCount;
      if (l > 0 && this.track) {
        const c = this.options.autoSize ? l : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let p = 0, f = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(c), f = this.getOffsetForIndex(c + l) - p;
        else {
          const g = this.getSlideSizeWithGap();
          p = c * g, f = l * g;
        }
        if (f > 0) {
          r = o / f;
          let g = 0;
          if (this.options.centered) {
            let S = this.options.autoSize ? this.getRectSize(
              this.track.children[c]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            g = o / 2 - S / 2;
          }
          n = (-p + u + g - t) / f, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: l, min: c } = this.getBoundaries(), u = l - c;
      u > 0 ? (n = (l - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const d = r + n * (1 - r);
    let h = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const l = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      h = [.../* @__PURE__ */ new Set([...h, ...l])];
    }
    h.forEach((l) => {
      typeof l.update == "function" && l.update(d, this.options.direction, e);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && M.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
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
        const d = n.target.closest("sx-slider-slide");
        if (!d) return;
        const h = d.getAttribute("data-real-index");
        if (h !== null) {
          const l = parseInt(h, 10);
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
    ), this.options.name && M.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (f) => f ? isNaN(Number(f)) ? f : `${f}px` : "0px", e = this.getAttribute("edge-resistance"), n = e !== null ? Number(e) : 100, r = this.getAttribute("interval"), o = L(r, 4e3), d = this.getAttribute("start-index"), h = d !== null ? Number(d) : 0, l = this.getAttribute("per-move");
    let c = "auto";
    if (l !== null && l !== "auto") {
      const f = Number(l);
      c = isNaN(f) ? "auto" : f;
    }
    let u = this.getAttribute("direction");
    u !== "horizontal" && u !== "vertical" && (u = "horizontal");
    let p = this.getAttribute("effect");
    p !== "fade" && (p = "slide"), this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: t(this.getAttribute("gap")),
      drag: this.getAttribute("drag") || "true",
      speed: L(this.getAttribute("speed"), 300),
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(n) ? 0 : n,
      loop: this.hasAttribute("loop"),
      grabCursor: this.hasAttribute("grab-cursor"),
      snap: this.hasAttribute("snap"),
      autoplay: this.hasAttribute("autoplay"),
      interval: isNaN(o) ? 4e3 : o,
      startIndex: isNaN(h) ? 0 : h,
      autoSize: this.hasAttribute("auto-size"),
      perMove: c,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: u,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: p,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = tt.parse(
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
      const d = e[e.length - 1 - r].cloneNode(!0);
      d.setAttribute("data-clone", "prev"), this.track.insertBefore(d, this.track.firstChild);
    }
    for (let r = 0; r < n; r++) {
      const d = e[r].cloneNode(!0);
      d.setAttribute("data-clone", "next"), this.track.appendChild(d);
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
    if (this.options.loop || e.forEach((f, g) => {
      f.setAttribute("data-real-index", g.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = tt.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const f = (g) => g == null || g === "" ? "0px" : isNaN(Number(g)) ? String(g) : `${g}px`;
      this.options.gap = f(this.options.gap), this.options.leftPadding = f(this.options.leftPadding), this.options.rightPadding = f(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), e = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), e = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, e.length - 1)
    ));
    const n = this.track.querySelectorAll("[data-clone]").length, r = e.length - n;
    if (this.isFirstInit && r > 0) {
      const f = Math.max(
        0,
        Math.min(this.options.startIndex, r - 1)
      );
      if (this.options.loop) {
        const g = this.options.autoSize ? r : this.options.perView;
        this.currentIndex = g + f;
      } else
        this.currentIndex = f;
      this.isFirstInit = !1;
    }
    const o = this.getAttribute("left-padding"), d = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && d && parseFloat(d) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(d));
    const h = this.convertToPx(this.options.gap), l = this.convertToPx(this.options.leftPadding), c = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((f) => {
        f.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((f) => {
        const g = f.firstElementChild;
        g ? f.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : f.style[this.sizeDim] = "max-content", f.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - l - c - h * (this.options.perView - 1)) / this.options.perView;
      e.forEach((b) => {
        b.style[this.sizeDim] = `${m}px`, b.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const p = e.filter((f) => !f.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let f = 0;
      p.forEach((g) => {
        f += this.getRectSize(g) + h;
      }), f -= h, u = f < t;
    } else
      u = r < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((g) => g.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
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
    for (let d = 0; d < o.length && (e += this.getRectSize(o[d]) + r, !(e - r > t)); d++)
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
    let o = 0, d = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let h = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + n : this.getSlideSizeWithGap();
      o = e + t / 2 - h / 2;
      let l = r - 1, c = this.options.autoSize ? this.getOffsetForIndex(l) : l * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[l] ? this.getRectSize(this.track.children[l]) : 0) + n : this.getSlideSizeWithGap();
      d = e + t / 2 - (c + u / 2);
    }
    return { max: o, min: Math.min(o, d) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const e = this.options.loop, n = e ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (x) => {
      if (!e) return x;
      let w = (x - r) % n;
      return w < 0 && (w += n), w;
    }, d = this.options.centered ? 0 : Math.floor(this.options.perView / 2), h = o(this.currentIndex);
    this.lastFiredIndex !== h && (this.lastFiredIndex = h, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: h }
      })
    ));
    const l = o(this.currentIndex - 1), c = o(this.currentIndex + 1), u = o(this.currentIndex + d), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let f = null;
    p && (f = document.createElement("style"), f.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(f), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((x, w) => {
      x.removeAttribute("sx-slide-active"), x.removeAttribute("sx-slide-prev"), x.removeAttribute("sx-slide-next"), x.removeAttribute("sx-slide-center");
      let v = o(w);
      x.setAttribute("aria-label", `${v + 1}/${n}`), v === h && x.setAttribute("sx-slide-active", ""), v === l && x.setAttribute("sx-slide-prev", ""), v === c && x.setAttribute("sx-slide-next", ""), v === u && x.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const g = e ? n - 1 : this.getRealMaxIndex(), m = this.getResolvedPerMove();
    let b = [];
    if (m > 1 && !this.options.autoSize) {
      let x = 0;
      for (; x < g; )
        b.push(x), x += m;
      x !== g && b.push(g);
    } else
      for (let x = 0; x <= g; x++)
        b.push(x);
    let S = b.indexOf(h);
    if (S === -1) {
      for (let x = b.length - 1; x >= 0; x--)
        if (h >= b[x]) {
          S = x;
          break;
        }
    }
    this.updatePagination(b, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((w) => w.trim()).forEach((w) => {
      const v = M.get(w);
      v && v.syncFromController(h);
    }), p && f && requestAnimationFrame(() => {
      f == null || f.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = e ? this.originalSlidesCount : n.length - r;
    if (((h) => {
      if (!e) return h;
      const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let c = (h - l) % o;
      return c < 0 && (c += o), c;
    })(this.currentIndex) !== t) {
      if (e) {
        const h = this.options.autoSize ? this.originalSlidesCount : this.options.perView, l = t + h, c = this.originalSlidesCount, u = n.length;
        let p = l, f = Math.abs(l - this.currentIndex);
        [l - c, l, l + c].forEach((m) => {
          if (m >= 0 && m < u) {
            const b = Math.abs(m - this.currentIndex);
            b < f && (f = b, p = m);
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
    const e = this.options.perView, n = this.options.centered ? Math.floor(e / 2) : 0;
    let r = this.currentIndex - n;
    this.options.loop || (r = Math.max(0, r));
    const o = [];
    for (let h = 0; h < e; h++) {
      let l = r + h;
      this.options.loop && (l < 0 ? l = t.length + l : l >= t.length && (l = l % t.length));
      const c = t[l];
      if (c) {
        const u = c.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${c.getBoundingClientRect()[this.sizeDim]}px`;
        const p = u.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let d = 0;
    o.forEach((h) => {
      const l = h.firstElementChild, c = l ? l.getBoundingClientRect().height : h.getBoundingClientRect().height;
      c > d && (d = c);
    }), o.forEach((h) => {
      var l;
      (l = this.track) == null || l.removeChild(h);
    }), d > 0 && (this.track.style.height = `${d}px`);
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
      let r = this.options.autoSize ? this.getOffsetForIndex(n) : n * this.getSlideSizeWithGap(), o = this.options.autoSize ? this.getRectSize(this.track.children[n]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), d = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const h = this.getBoundingClientRect()[this.sizeDim];
        d += h / 2 - (r + o / 2);
      } else
        d -= r;
      if (d <= e + 1)
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
        const n = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + n, o = this.originalSlidesCount, d = this.track.children.length;
        let h = r, l = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < d) {
            const p = Math.abs(u - this.currentIndex);
            p < l && (l = p, h = u);
          }
        }), this.currentIndex = h;
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
    let d = 0, h = 1 / 0;
    const l = this.currentIndex;
    for (let c = 0; c < r.length; c++) {
      let u = 0, p = 0;
      if (this.options.autoSize)
        u = this.getOffsetForIndex(c), p = this.getRectSize(r[c]) + o;
      else {
        const m = this.getSlideSizeWithGap();
        u = c * m, p = m;
      }
      let f = e;
      if (this.options.centered ? f += n / 2 - (u + p / 2) : f -= u, !this.options.loop) {
        const { max: m, min: b } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? f = Math.max(
          b,
          Math.min(m, f)
        ) : this.options.centered || (c === 0 && (f = 0), f < b && (f = b), f > 0 && (f = 0));
      }
      const g = Math.abs(t - f);
      g < h - 0.5 ? (h = g, d = c) : Math.abs(g - h) <= 0.5 && Math.abs(c - l) < Math.abs(d - l) && (d = c, h = g);
    }
    if (this.currentIndex = d, !this.options.loop) {
      const c = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, c);
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
function Dt() {
  customElements.get("sx-slider") || customElements.define("sx-slider", Bt), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", Pt), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", Et), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", It), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", Lt), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Mt), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", zt);
}
const A = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class Ft extends HTMLElement {
  constructor() {
    super();
    a(this, "isOpen", !1);
    a(this, "previousActiveElement", null);
    a(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    a(this, "backdropEl", null);
    a(this, "dialogCoreEl", null);
    a(this, "originalContentHTML", "");
    a(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    a(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape" && this.closeOnEscKey) {
          t.preventDefault(), this.close();
          return;
        }
        t.key === "Tab" && this.trapFocus(t);
      }
    });
    a(this, "handleBackdropClick", (t) => {
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
    return L(t, A.duration);
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
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : A.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : A.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || A.overlayStyle;
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
class Ot extends HTMLElement {
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
function $t() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", Ft), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Ot);
}
function qt() {
  Tt(), St(), Dt(), $t();
}
const ct = /* @__PURE__ */ new Map();
function y(s, i) {
  ct.set(s, i);
}
function Yt(s, i) {
  const t = ct.get(s);
  return t || (s.startsWith("--") ? _t(s, i) : Vt(s, i));
}
function _t(s, i) {
  return typeof i == "string" && !dt(i) ? {
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
      return e || console.warn(`[six-js] CSS variable "${s}" not set, defaulting to 0`), z(e);
    },
    apply(t, e) {
      t.style.setProperty(s, `${e.num}${e.unit}`);
    }
  };
}
function dt(s) {
  return /^-?[\d.]+[a-z%]*$/i.test(s.trim());
}
function Vt(s, i) {
  return typeof i == "string" && !dt(i) ? {
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
      return e === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${s}"`), { num: 0, unit: "" }) : z(e);
    },
    apply(t, e) {
      t.style[s] = `${e.num}${e.unit}`;
    }
  };
}
function z(s, i = "") {
  if (typeof s == "number")
    return { num: s, unit: i };
  if (typeof s != "string" || s.length === 0)
    return { num: 0, unit: i };
  const t = s.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || i } : { num: parseFloat(s) || 0, unit: i };
}
const Nt = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function Ht(s, i, t, e) {
  if (typeof s != "string")
    return z(s, e);
  const n = s.match(Nt);
  if (!n)
    return z(s, e);
  const [, r, o, d] = n, h = parseFloat(o), l = d || t || e;
  if (isNaN(h))
    return console.warn(`[six-js] Invalid relative value: "${s}"`), { num: i, unit: l };
  if (r === "/" && h === 0)
    return console.warn(`[six-js] Division by zero: "${s}"`), { num: i, unit: l };
  let c;
  switch (r) {
    case "+":
      c = i + h;
      break;
    case "-":
      c = i - h;
      break;
    case "*":
      c = i * h;
      break;
    case "/":
      c = i / h;
      break;
    default:
      c = i;
  }
  return { num: c, unit: l };
}
const Xt = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function et(s) {
  const i = document.createElement("span");
  i.style.color = s, i.style.display = "none", document.body.appendChild(i);
  const t = window.getComputedStyle(i).color;
  return document.body.removeChild(i), ut(t);
}
function ut(s) {
  const i = s.match(Xt);
  return i ? {
    r: parseFloat(i[1]),
    g: parseFloat(i[2]),
    b: parseFloat(i[3]),
    a: i[4] !== void 0 ? parseFloat(i[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function Wt(s, i, t) {
  return {
    r: s.r + (i.r - s.r) * t,
    g: s.g + (i.g - s.g) * t,
    b: s.b + (i.b - s.b) * t,
    a: s.a + (i.a - s.a) * t
  };
}
function Gt(s) {
  return `rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a})`;
}
const W = /-?[\d.]+/g;
function it(s) {
  return (s.match(W) || []).length;
}
function jt(s, i, t) {
  const e = it(s), n = it(i), r = e === n && n > 0;
  return r || console.warn(`[six-js] "${t}": shape mismatch (${e} vs ${n} numbers), will snap instead of interpolate`), r;
}
function Ut(s, i, t) {
  const e = (s.match(W) || []).map(Number);
  let n = 0;
  return i.replace(W, (r) => {
    const o = parseFloat(r), d = e[n] ?? o;
    n++;
    const h = d + (o - d) * t;
    return String(Math.round(h * 1e3) / 1e3);
  });
}
const O = /* @__PURE__ */ new WeakMap();
function Kt(s) {
  let i = O.get(s);
  return i || (i = /* @__PURE__ */ new Map(), O.set(s, i)), i;
}
function Qt(s, i) {
  var t;
  return (t = O.get(s)) == null ? void 0 : t.get(i);
}
function Zt(s, i, t) {
  Kt(s).set(i, t);
}
function Jt(s) {
  const i = O.get(s);
  if (!i || i.size === 0) return "";
  let t = "";
  for (const { fn: e, value: n, unit: r } of i.values())
    t += `${e}(${n}${r}) `;
  return t.trim();
}
function te(s, i, t) {
  const e = s.style[i];
  s.style[i] = t;
  const n = parseFloat(window.getComputedStyle(s)[i]) || 0;
  return s.style[i] = e, n;
}
const ee = /^random\((.+)\)$/i;
function ie(s) {
  return /^-?[\d.]+$/.test(s.trim());
}
function se(s) {
  const i = s.match(ee);
  if (!i) return s;
  const t = i[1].split(",").map((e) => e.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${s}"`), s;
  if (t.length === 2 && t.every(ie)) {
    const e = parseFloat(t[0]), n = parseFloat(t[1]);
    return e + Math.random() * (n - e);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function B(s, i, t) {
  let e = s;
  return typeof e == "function" && (e = e(i, t)), typeof e == "string" && (e = se(e)), e;
}
let G = {};
function ne(s) {
  G = { ...G, ...s };
}
function re() {
  return G;
}
class oe {
  constructor(i, t, e = "to", n) {
    a(this, "duration");
    a(this, "targets");
    a(this, "easeFn");
    a(this, "propStates", []);
    a(this, "hasTransform", []);
    typeof i == "string" ? this.targets = Array.from(document.querySelectorAll(i)) : this.targets = Array.isArray(i) ? i : [i], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${i}"`);
    const r = re();
    this.duration = t.duration ?? r.duration ?? 0.5, this.duration < 0 && (console.warn(`[six-js] Negative duration (${this.duration}), using 0 instead`), this.duration = 0);
    const o = t.ease ?? r.ease ?? "linear";
    D[o] || console.warn(`[six-js] Unknown ease "${o}", falling back to linear`), this.easeFn = D[o] || D.linear, this.setupProps(t, e, n);
  }
  setupProps(i, t, e) {
    const n = /* @__PURE__ */ new Set();
    for (const r in i) n.add(r);
    if (e) for (const r in e) n.add(r);
    n.delete("duration"), n.delete("ease"), this.targets.forEach((r, o) => {
      const d = [];
      let h = !1;
      for (const l of n) {
        let c, u;
        t === "to" ? u = B(i[l], o, r) : t === "from" ? c = B(i[l], o, r) : (l in i && (u = B(i[l], o, r)), e && l in e && (c = B(e[l], o, r)));
        const p = Yt(l, u ?? c);
        if (p.type === "discrete") {
          p.apply(r, String(u ?? c));
          continue;
        }
        if (p.type === "color") {
          const b = c !== void 0 ? et(String(c)) : p.getCurrent(r), S = u !== void 0 ? et(String(u)) : p.getCurrent(r);
          d.push({ key: l, state: { kind: "color", start: b, end: S, apply: p.apply } });
          continue;
        }
        if (p.type === "complex") {
          const b = c !== void 0 ? String(c) : p.getCurrent(r), S = u !== void 0 ? String(u) : p.getCurrent(r);
          jt(b, S, l), d.push({ key: l, state: { kind: "complex", start: b, end: S, apply: p.apply } });
          continue;
        }
        const f = c !== void 0 ? z(c, p.defaultUnit) : p.getCurrent(r, l);
        let g = u !== void 0 ? Ht(u, f.num, f.unit, p.defaultUnit) : p.getCurrent(r, l), m;
        if (!p.isTransform && g.unit && f.unit && g.unit !== f.unit) {
          const b = te(r, l, `${g.num}${g.unit}`);
          m = `${g.num}${g.unit}`, g = { num: b, unit: f.unit };
        }
        p.isTransform && (h = !0), d.push({
          key: l,
          state: {
            kind: "numeric",
            start: f.num,
            end: g.num,
            unit: g.unit || f.unit,
            isTransform: p.isTransform,
            transformFn: p.transformFn,
            transformStoreKey: p.transformStoreKey,
            apply: p.apply,
            snapEnd: m
          }
        });
      }
      this.propStates[o] = d, this.hasTransform[o] = h;
    });
  }
  render(i) {
    const t = this.duration === 0 ? 1 : Math.min(i / this.duration, 1), e = this.easeFn(t);
    this.targets.forEach((n, r) => {
      const o = this.propStates[r];
      let d = !1;
      for (let h = 0; h < o.length; h++) {
        const { key: l, state: c } = o[h];
        if (c.kind === "color") {
          c.apply(n, Wt(c.start, c.end, e));
          continue;
        }
        if (c.kind === "complex") {
          c.apply(n, Ut(c.start, c.end, e));
          continue;
        }
        const u = c.start + (c.end - c.start) * e;
        c.isTransform && c.transformFn ? (Zt(n, c.transformStoreKey ?? c.transformFn, {
          value: u,
          unit: c.unit,
          fn: c.transformFn
        }), d = !0) : t === 1 && c.snapEnd !== void 0 ? n.style[l] = c.snapEnd : c.apply(n, { num: u, unit: c.unit });
      }
      d && (n.style.transform = Jt(n));
    });
  }
  onStart() {
    this.targets.forEach((i, t) => {
      this.hasTransform[t] && (i.style.willChange = "transform");
    });
  }
  onComplete() {
    this.targets.forEach((i, t) => {
      this.hasTransform[t] && (i.style.willChange = "");
    });
  }
  /** Danh sách (target, property keys) mà tween này đang điều khiển — dùng cho overwrite */
  getTouchedProperties() {
    return this.targets.map((i, t) => ({
      target: i,
      keys: this.propStates[t].map((e) => e.key)
    }));
  }
}
class ae {
  constructor(i, t = !0, e = {}) {
    a(this, "animatable");
    a(this, "options");
    a(this, "elapsed", 0);
    // giây, luôn trong [0, duration]
    a(this, "rate", 1);
    // 1 = xuôi, -1 = ngược
    a(this, "running", !1);
    a(this, "listeners", {});
    a(this, "delayRemaining");
    a(this, "repeatsLeft");
    a(this, "repeatDelayRemaining", 0);
    a(this, "hasStartedOnce", !1);
    a(this, "timeScale");
    a(this, "tick", (i, t) => {
      const e = t / 1e3 * this.timeScale;
      if (this.delayRemaining > 0) {
        if (this.delayRemaining -= e, this.delayRemaining > 0) return;
        this.elapsed += -this.delayRemaining * this.rate, this.delayRemaining = 0;
      }
      if (this.repeatDelayRemaining > 0) {
        if (this.repeatDelayRemaining -= e, this.repeatDelayRemaining > 0) return;
        this.repeatDelayRemaining = 0;
      }
      this.elapsed += e * this.rate;
      const n = this.animatable.duration;
      if (this.elapsed >= n) {
        this.elapsed = n, this.animatable.render(this.elapsed), this.emit("update"), this.handleBoundReached(!0);
        return;
      }
      if (this.elapsed <= 0 && this.rate < 0) {
        this.elapsed = 0, this.animatable.render(0), this.emit("update"), this.handleBoundReached(!1);
        return;
      }
      this.animatable.render(this.elapsed), this.emit("update");
    });
    this.animatable = i, this.options = e, this.delayRemaining = Math.max(0, e.delay ?? 0), this.repeatsLeft = e.repeat === -1 ? 1 / 0 : Math.max(0, e.repeat ?? 0), this.timeScale = e.speed ?? 1, t ? this.play() : this.animatable.render(0);
  }
  /** forward=true: vừa chạm mốc duration. forward=false: vừa chạm mốc 0 khi đang chạy ngược. */
  handleBoundReached(i) {
    if (this.repeatsLeft > 0) {
      this.repeatsLeft !== 1 / 0 && this.repeatsLeft--, this.emit("repeat"), this.options.repeatDelay && (this.repeatDelayRemaining = this.options.repeatDelay), this.options.yoyo ? this.rate = i ? -1 : 1 : (this.elapsed = 0, this.rate = 1);
      return;
    }
    this.stop(), this.emit(i ? "complete" : "reverseComplete");
  }
  play() {
    var i, t;
    return this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, (t = (i = this.animatable).onStart) == null || t.call(i), C.add(this.tick), this.hasStartedOnce || (this.hasStartedOnce = !0, this.emit("start")), this);
  }
  reverse() {
    var i, t;
    return this.rate = -1, this.running || (this.running = !0, (t = (i = this.animatable).onStart) == null || t.call(i), C.add(this.tick)), this;
  }
  pause() {
    return this.running ? (this.running = !1, C.remove(this.tick), this) : this;
  }
  stop() {
    var i, t;
    this.running = !1, C.remove(this.tick), (t = (i = this.animatable).onComplete) == null || t.call(i);
  }
  /** Tua tới thời điểm bất kỳ (giây), không phụ thuộc trạng thái đang chạy hay không */
  seek(i) {
    return this.elapsed = Math.max(0, Math.min(i, this.animatable.duration)), this.animatable.render(this.elapsed), this.emit("update"), this;
  }
  restart() {
    return this.elapsed = 0, this.rate = 1, this.delayRemaining = Math.max(0, this.options.delay ?? 0), this.repeatsLeft = this.options.repeat === -1 ? 1 / 0 : Math.max(0, this.options.repeat ?? 0), this.repeatDelayRemaining = 0, this.hasStartedOnce = !1, this.animatable.render(0), this.play(), this;
  }
  /** Dừng hẳn, gỡ khỏi ticker, không bắn onComplete (dùng cho overwrite/kill) */
  kill() {
    this.running = !1, C.remove(this.tick);
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
  get speed() {
    return this.timeScale;
  }
  setSpeed(i) {
    return i <= 0 ? (console.warn(`[six-js] speed must be > 0, got ${i}, ignoring`), this) : (this.timeScale = i, this);
  }
}
function pt() {
  var s;
  return ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight;
}
function $(s, i) {
  return s.ratio * i + s.offsetPx;
}
function st(s) {
  const i = s.trim(), t = i.match(/^(-?[\d.]+)(px)?$/);
  if (t)
    return { ratio: 0, offsetPx: parseFloat(t[1]) };
  const e = i.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);
  if (!e || !e[1] && !e[2])
    return console.warn(`[six-js] onScroll: unknown position "${s}", using "top"`), { ratio: 0, offsetPx: 0 };
  const [, n, r, o, d] = e;
  let h = 0;
  n === "center" ? h = 0.5 : n === "bottom" ? h = 1 : n != null && n.endsWith("%") && (h = parseFloat(n) / 100);
  let l = 0;
  if (r && o) {
    const c = parseFloat(o), u = r === "+=" ? c : -c;
    d === "%" ? h += u / 100 : l += u;
  }
  return { ratio: h, offsetPx: l };
}
function nt(s, i, t) {
  const e = s.match(/^([+-]=)(\d+(\.\d+)?)$/);
  if (e) {
    if (t === void 0)
      return console.warn(`[six-js] onScroll: "${s}" has nothing to be relative to`), { scrollY: 0, viewportSpec: { ratio: 0, offsetPx: 0 }, viewportLabel: s, documentY: 0, triggerLabel: s };
    const p = e[1] === "+=" ? 1 : -1, f = t + p * parseFloat(e[2]);
    return {
      scrollY: f,
      viewportSpec: { ratio: 0, offsetPx: 0 },
      viewportLabel: s,
      documentY: f,
      triggerLabel: s
    };
  }
  const [n = "top", r = "top"] = s.trim().split(/\s+/), o = st(n), d = st(r), h = i.getBoundingClientRect(), c = window.scrollY + h.top + $(o, h.height), u = $(d, pt());
  return {
    scrollY: c - u,
    viewportSpec: d,
    viewportLabel: r,
    documentY: c,
    triggerLabel: n
  };
}
const _ = 20, rt = 24, le = 20;
class he {
  constructor(i, t, e) {
    a(this, "triggerEl");
    a(this, "playable");
    a(this, "options");
    a(this, "startY", 0);
    a(this, "endY", 0);
    // Phía VIEWPORT của start/end (marker position: fixed)
    a(this, "startViewportSpec", { ratio: 0, offsetPx: 0 });
    a(this, "endViewportSpec", { ratio: 1, offsetPx: 0 });
    a(this, "startViewportLabel", "");
    a(this, "endViewportLabel", "");
    // Phía TRIGGER của start/end (marker position: absolute) — đúng theo token truyền
    // vào (top/center/bottom/%), KHÔNG mặc định neo cứng vào top/bottom của trigger.
    a(this, "startTriggerY", 0);
    a(this, "endTriggerY", 0);
    a(this, "startTriggerLabel", "");
    a(this, "endTriggerLabel", "");
    /** true nếu 2 marker trigger-side (start/end) trùng vị trí document -> phải xếp
     *  label thành 2 hàng. Chỉ đổi khi layout đổi (recalc()), không phụ thuộc scroll. */
    a(this, "triggerLabelsCollide", !1);
    a(this, "smoothedProgress", 0);
    a(this, "wasInside", !1);
    a(this, "lastScrollY", window.scrollY);
    a(this, "rafPending", !1);
    a(this, "pinSpacer", null);
    a(this, "pinned", !1);
    a(this, "pinOriginalStyles", null);
    a(this, "startMarker", null);
    // viewport-side của "start"
    a(this, "endMarker", null);
    // viewport-side của "end"
    a(this, "startTriggerMarker", null);
    // trigger-side của "start"
    a(this, "endTriggerMarker", null);
    // trigger-side của "end"
    a(this, "resizeObserver", null);
    a(this, "recalcRafPending", !1);
    a(this, "onScrollBound", () => this.requestUpdate());
    a(this, "onResizeBound", () => this.recalc());
    a(this, "tickerBound", (i, t) => this.tickSmooth(t));
    var n;
    this.triggerEl = i, this.playable = t, this.options = e, e.debug && this.setupDebugMarkers(), this.recalc(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), (n = window.visualViewport) == null || n.addEventListener("resize", this.onResizeBound), this.setupResizeObserver(), typeof e.sync == "number" && C.add(this.tickerBound), this.update();
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
    const i = this.options.start ?? "top bottom", t = this.options.end ?? "bottom top", e = nt(i, this.triggerEl);
    this.startY = e.scrollY, this.startViewportSpec = e.viewportSpec, this.startViewportLabel = e.viewportLabel, this.startTriggerY = e.documentY, this.startTriggerLabel = e.triggerLabel;
    const n = nt(t, this.triggerEl, this.startY);
    this.endY = n.scrollY, this.endViewportSpec = n.viewportSpec, this.endViewportLabel = n.viewportLabel, this.endTriggerY = n.documentY, this.endTriggerLabel = n.triggerLabel, this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < rt, this.updateDebugMarkers();
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
    var h, l, c, u, p, f, g, m;
    const i = window.scrollY, t = this.computeProgress(), e = i >= this.startY && i <= this.endY, n = i >= this.lastScrollY, r = e && !this.wasInside, o = !e && this.wasInside;
    r ? n ? (l = (h = this.options).onEnter) == null || l.call(h) : (u = (c = this.options).onEnterBack) == null || u.call(c) : o && (n ? (f = (p = this.options).onLeave) == null || f.call(p) : (m = (g = this.options).onLeaveBack) == null || m.call(g)), this.wasInside = e, this.lastScrollY = i, this.options.pin && this.updatePin(e), this.updateTriggerMarkerLabelFlip(i);
    const d = this.options.sync ?? !1;
    d === !1 ? r && n && this.playable.restart() : d === !0 && this.playable.seek(t * this.playable.duration);
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
    const n = e * le;
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
    i.line.style.top = `${t}px`, this.applyLabelSide(i.label, e < _ ? "below" : "above", n);
  }
  /** Chỉ tính lại xem label của marker trigger-side (start/end) nên hiện trên hay dưới
   *  đường kẻ (dựa vào khoảng cách hiện tại tới mép trên viewport = docY - scrollY).
   *  KHÔNG đụng tới vị trí đường kẻ (vẫn đứng yên theo document, tính 1 lần ở recalc()). */
  updateTriggerMarkerLabelFlip(i) {
    if (this.startTriggerMarker) {
      const t = this.startTriggerY - i;
      this.applyLabelSide(this.startTriggerMarker.label, t < _ ? "below" : "above", 0);
    }
    if (this.endTriggerMarker) {
      const t = this.endTriggerY - i, e = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, t < _ ? "below" : "above", e);
    }
  }
  updateDebugMarkers() {
    const i = pt(), t = window.scrollY, e = $(this.startViewportSpec, i), n = $(this.endViewportSpec, i), r = Math.abs(e - n) < rt;
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
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), (i = window.visualViewport) == null || i.removeEventListener("resize", this.onResizeBound), (t = this.resizeObserver) == null || t.disconnect(), this.resizeObserver = null, C.remove(this.tickerBound), this.unpinElement(), this.removeDebugMarkers();
  }
}
const U = {
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
}, F = 180 / Math.PI;
function ce(s) {
  const i = window.getComputedStyle(s).transform;
  return !i || i === "none" ? { ...U } : i.startsWith("matrix3d") ? ue(i) : de(i);
}
function de(s) {
  const i = s.match(/matrix\(([^)]+)\)/);
  if (!i) return { ...U };
  const t = i[1].split(",").map((p) => parseFloat(p.trim())), [e, n, r, o, d, h] = t, l = Math.sqrt(e * e + n * n), c = Math.sqrt(r * r + o * o), u = Math.atan2(n, e) * F;
  return {
    x: d,
    y: h,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: l,
    scaleX: l,
    scaleY: c,
    skewX: 0,
    skewY: 0
  };
}
function ue(s) {
  const i = s.match(/matrix3d\(([^)]+)\)/);
  if (!i) return { ...U };
  const t = i[1].split(",").map((x) => parseFloat(x.trim())), e = t[0], n = t[1], r = t[2], o = t[4], d = t[5], h = t[6];
  t[8], t[9];
  const l = t[10], c = t[12], u = t[13], p = t[14], f = Math.sqrt(e * e + n * n + r * r), g = Math.sqrt(o * o + d * d + h * h), m = Math.atan2(n, e) * F, b = Math.atan2(-r, Math.sqrt(h * h + l * l)) * F, S = Math.atan2(h, l) * F;
  return {
    x: c,
    y: u,
    z: p,
    rotate: m,
    rotateX: S,
    rotateY: b,
    rotateZ: m,
    scale: f,
    scaleX: f,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
function k(s, i, t, e = s) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: s,
    transformStoreKey: e,
    defaultUnit: i,
    getCurrent(n) {
      const r = Qt(n, e);
      return r ? { num: r.value, unit: r.unit } : { num: ce(n)[t], unit: i };
    },
    apply() {
    }
  };
}
y("x", k("translateX", "px", "x"));
y("y", k("translateY", "px", "y"));
y("z", k("translateZ", "px", "z"));
y("translateX", k("translateX", "px", "x", "translateX-2"));
y("translateY", k("translateY", "px", "y", "translateY-2"));
y("rotate", k("rotate", "deg", "rotate"));
y("rotateX", k("rotateX", "deg", "rotateX"));
y("rotateY", k("rotateY", "deg", "rotateY"));
y("rotateZ", k("rotateZ", "deg", "rotateZ"));
y("scale", k("scale", "", "scale"));
y("scaleX", k("scaleX", "", "scaleX"));
y("scaleY", k("scaleY", "", "scaleY"));
y("skewX", k("skewX", "deg", "skewX"));
y("skewY", k("skewY", "deg", "skewY"));
function E(s, i) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: i,
    getCurrent(t) {
      const e = window.getComputedStyle(t)[s];
      return z(e, i);
    },
    apply(t, e) {
      t.style[s] = `${e.num}${e.unit}`;
    }
  };
}
y("width", E("width", "px"));
y("height", E("height", "px"));
y("top", E("top", "px"));
y("left", E("left", "px"));
y("right", E("right", "px"));
y("bottom", E("bottom", "px"));
y("borderRadius", E("borderRadius", "px"));
y("borderWidth", E("borderWidth", "px"));
y("opacity", E("opacity", ""));
y("fontSize", E("fontSize", "px"));
y("letterSpacing", E("letterSpacing", "px"));
function q(s) {
  return {
    type: "color",
    cssKey: s,
    getCurrent(i) {
      const t = window.getComputedStyle(i)[s];
      return ut(t);
    },
    apply(i, t) {
      i.style[s] = Gt(t);
    }
  };
}
y("backgroundColor", q("backgroundColor"));
y("color", q("color"));
y("borderColor", q("borderColor"));
y("background", q("backgroundColor"));
function pe(s) {
  return {
    type: "discrete",
    cssKey: s,
    apply(i, t) {
      i.style[s] = t;
    }
  };
}
const fe = [
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
fe.forEach((s) => y(s, pe(s)));
function ft(s) {
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
y("boxShadow", ft("boxShadow"));
y("filter", ft("filter"));
xt();
let ot = !1;
function ge() {
  ot || (qt(), ot = !0);
}
function me(s) {
  return typeof s == "string" ? document.querySelector(s) : Array.isArray(s) ? s[0] ?? null : s;
}
const at = /* @__PURE__ */ new WeakMap();
function be(s, i) {
  for (const { target: t, keys: e } of s.getTouchedProperties()) {
    let n = at.get(t);
    n || (n = /* @__PURE__ */ new Map(), at.set(t, n));
    for (const r of e) {
      const o = n.get(r);
      o && o !== i && o.kill(), n.set(r, i);
    }
  }
}
function K(s, i, t, e) {
  const {
    onScroll: n,
    delay: r,
    repeat: o,
    repeatDelay: d,
    reverse: h,
    overwrite: l,
    pause: c,
    speed: u,
    onStart: p,
    onUpdate: f,
    onComplete: g,
    onRepeat: m,
    onReverseComplete: b,
    ...S
  } = i, x = new oe(s, S, t, e), w = { delay: r, repeat: o, repeatDelay: d, yoyo: h, speed: u }, v = new ae(x, !1, w);
  if (p && v.on("start", p), f && v.on("update", f), g && v.on("complete", g), m && v.on("repeat", m), b && v.on("reverseComplete", b), l !== !1 && be(x, v), n) {
    const Q = me(n.target ?? s);
    Q ? new he(Q, v, n) : console.warn("[six-js] onScroll: trigger element not found");
  } else c || v.play();
  return v;
}
function xe(s, i) {
  return K(s, i, "to");
}
function ye(s, i) {
  return K(s, i, "from");
}
function Se(s, i, t) {
  return K(s, t, "fromTo", i);
}
const Ce = {
  initElement: ge,
  to: xe,
  from: ye,
  fromTo: Se,
  setDefaults: ne
};
export {
  bt as VERSION,
  Ce as six
};
