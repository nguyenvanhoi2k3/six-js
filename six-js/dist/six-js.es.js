var it = Object.defineProperty;
var st = (i, s, t) => s in i ? it(i, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[s] = t;
var c = (i, s, t) => st(i, typeof s != "symbol" ? s + "" : s, t);
const nt = "0.0.30";
let W = !1;
function rt() {
  W || (W = !0, console.log(
    ` SixJS v${nt}`
  ));
}
function P(i) {
  return i < 1 / 2.75 ? 7.5625 * i * i : i < 2 / 2.75 ? (i -= 1.5 / 2.75, 7.5625 * i * i + 0.75) : i < 2.5 / 2.75 ? (i -= 2.25 / 2.75, 7.5625 * i * i + 0.9375) : (i -= 2.625 / 2.75, 7.5625 * i * i + 0.984375);
}
const I = 1.70158, R = I * 1.525, z = {
  // Linear
  linear: (i) => i,
  // Quad
  "quad-in": (i) => i * i,
  "quad-out": (i) => 1 - (1 - i) * (1 - i),
  "quad-in-out": (i) => i < 0.5 ? 2 * i * i : 1 - Math.pow(-2 * i + 2, 2) / 2,
  // Cubic
  "cubic-in": (i) => i * i * i,
  "cubic-out": (i) => 1 - Math.pow(1 - i, 3),
  "cubic-in-out": (i) => i < 0.5 ? 4 * i * i * i : 1 - Math.pow(-2 * i + 2, 3) / 2,
  // Quart
  "quart-in": (i) => i ** 4,
  "quart-out": (i) => 1 - (1 - i) ** 4,
  "quart-in-out": (i) => i < 0.5 ? 8 * i ** 4 : 1 - (-2 * i + 2) ** 4 / 2,
  // Quint
  "quint-in": (i) => i ** 5,
  "quint-out": (i) => 1 - (1 - i) ** 5,
  "quint-in-out": (i) => i < 0.5 ? 16 * i ** 5 : 1 - (-2 * i + 2) ** 5 / 2,
  // Strong (GSAP alias)
  "strong-in": (i) => i ** 5,
  "strong-out": (i) => 1 - (1 - i) ** 5,
  "strong-in-out": (i) => i < 0.5 ? 16 * i ** 5 : 1 - (-2 * i + 2) ** 5 / 2,
  // Sine
  "sine-in": (i) => 1 - Math.cos(i * Math.PI / 2),
  "sine-out": (i) => Math.sin(i * Math.PI / 2),
  "sine-in-out": (i) => -(Math.cos(Math.PI * i) - 1) / 2,
  // Expo
  "expo-in": (i) => i === 0 ? 0 : Math.pow(2, 10 * (i - 1)) * i + Math.pow(i, 6) * (1 - i),
  "expo-out": (i) => i === 1 ? 1 : 1 - Math.pow(2, -10 * i),
  "expo-in-out": (i) => i === 0 ? 0 : i === 1 ? 1 : i < 0.5 ? Math.pow(2, 20 * i - 10) / 2 : (2 - Math.pow(2, -20 * i + 10)) / 2,
  // Circ
  "circ-in": (i) => 1 - Math.sqrt(1 - i * i),
  "circ-out": (i) => Math.sqrt(1 - (i - 1) * (i - 1)),
  "circ-in-out": (i) => i < 0.5 ? (1 - Math.sqrt(1 - (2 * i) ** 2)) / 2 : (Math.sqrt(1 - (-2 * i + 2) ** 2) + 1) / 2,
  // Back
  "back-in": (i) => (I + 1) * i * i * i - I * i * i,
  "back-out": (i) => (i--, 1 + (I + 1) * i * i * i + I * i * i),
  "back-in-out": (i) => {
    if (i < 0.5) {
      const t = 2 * i;
      return t * t * ((R + 1) * t - R) / 2;
    }
    const s = 2 * i - 2;
    return (s * s * ((R + 1) * s + R) + 2) / 2;
  },
  // Bounce
  "bounce-in": (i) => 1 - P(1 - i),
  "bounce-out": P,
  "bounce-in-out": (i) => i < 0.5 ? (1 - P(1 - 2 * i)) / 2 : (1 + P(2 * i - 1)) / 2
}, V = /* @__PURE__ */ new WeakMap();
let O = [], q = null;
function G(i, s) {
  O.push({ instance: i, type: s }), q === null && (q = requestAnimationFrame(ot));
}
function ot() {
  const i = O.slice();
  O.length = 0, q = null;
  for (let s = 0; s < i.length; s++) {
    const { instance: t, type: e } = i[s];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let $ = null;
function U() {
  return typeof window > "u" ? null : ($ || ($ = new IntersectionObserver(
    (i) => {
      for (let s = 0; s < i.length; s++) {
        const t = i[s], e = V.get(t.target);
        e && (t.isIntersecting ? G(e, "enter") : G(e, "leave"));
      }
    },
    { threshold: 0.05 }
  )), $);
}
function Q(i, s) {
  var t;
  V.set(i, s), (t = U()) == null || t.observe(i);
}
function _(i) {
  var s;
  V.delete(i), (s = U()) == null || s.unobserve(i);
}
const k = class k extends HTMLElement {
  constructor() {
    super(...arguments);
    c(this, "animation");
    c(this, "options");
    c(this, "order", k.counter++);
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
    if (this.options = this.getOptions(), k.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), Q(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), _(this), k.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || _(this), this.isGroup ? (k.groupQueue.add(this), k.scheduleGroup()) : this.play();
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
      easing: r && r in z ? z[r] : z["ease-in-out"],
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
    var l;
    const { x: e, y: n, easing: r, duration: o, delay: h } = this.options;
    (l = this.animation) == null || l.cancel(), this.animation = this.animate(
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
      var a;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (a = this.animation) == null || a.cancel(), this.animation = void 0;
    };
  }
};
c(k, "counter", 0), c(k, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), c(k, "groupQueue", /* @__PURE__ */ new Set()), c(k, "isProcessingGroup", !1);
let N = k;
function at() {
  customElements.get("sx-animate") || customElements.define("sx-animate", N);
}
class lt {
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
  _request(s) {
    return typeof requestAnimationFrame < "u" ? requestAnimationFrame(s) : setTimeout(s, 16);
  }
  _cancel(s) {
    if (typeof cancelAnimationFrame < "u") {
      cancelAnimationFrame(s);
      return;
    }
    clearTimeout(s);
  }
  _wake() {
    if (this._id !== null) return;
    const s = this._now();
    this._start = s - this._time * 1e3, this._last = s, this._tick();
  }
  add(s) {
    return this._listeners.add(s), this._wake(), s;
  }
  addOnce(s) {
    const t = (e, n, r) => {
      this.remove(t), s(e, n, r);
    };
    return this.add(t), t;
  }
  remove(s) {
    this._listeners.delete(s), this._listeners.size === 0 && this.sleep();
  }
  clear() {
    this._listeners.clear(), this.sleep();
  }
  sleep() {
    this._id !== null && (this._cancel(this._id), this._id = null);
  }
  fps(s) {
    s = Math.max(1, s), this._gap = 1e3 / s, this._nextTime = this._time * 1e3 + this._gap;
  }
  lagSmoothing(s = 500, t = 33) {
    this._lagThreshold = s || 1 / 0, this._adjustedLag = Math.min(t, this._lagThreshold);
  }
  deltaRatio(s = 60) {
    return this._delta / (1e3 / s);
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
const C = new lt();
class ht extends HTMLElement {
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
      const n = e / 1e3, r = this.speed * n, o = this.direction, l = this.isVertical ? this.offsetHeight : this.offsetWidth;
      o === "left" || o === "up" ? (this.offset -= r, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = l)) : (this.offset += r, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= l && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), Q(this, {
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
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), _(this), C.remove(this.updateAnimation);
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
          const h = o < r ? Math.ceil(r * 2 / o) : 2, l = document.createDocumentFragment();
          for (let a = 1; a < h; a++)
            for (const d of e) {
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
class ct extends HTMLElement {
}
class dt extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function ut() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", ht), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", ct), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", dt);
}
class pt extends HTMLElement {
  constructor() {
    super();
  }
}
class ft {
  constructor() {
    c(this, "sliders", /* @__PURE__ */ new Map());
  }
  register(s, t) {
    this.sliders.set(s, t);
  }
  unregister(s) {
    this.sliders.delete(s);
  }
  get(s) {
    return this.sliders.get(s);
  }
}
const M = new ft();
class gt extends HTMLElement {
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
    e ? n = M.get(e) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const e = this.getAttribute("effect"), n = e === "dynamic", r = e === "snake", o = e === "fraction", h = t.join(",") + `_effect:${e}`;
    if (this.renderedSignature === h) return;
    if (this.renderedSignature = h, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const a = document.createElement("span");
      a.className = "sx-slider-pagination-current", a.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const f = document.createDocumentFragment();
      f.appendChild(a), f.appendChild(d), f.appendChild(u), this.appendChild(f);
      return;
    }
    const l = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((a, d) => {
        const u = this.createBulletDOM(a, d, !1);
        this.cachedBullets.push(u), l.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", l.appendChild(this.snakeBar), this.appendChild(l);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", l.appendChild(this.innerContainer), t.forEach((a, d) => {
        const u = this.createBulletDOM(a, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(l);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((a, d) => {
      const u = this.createBulletDOM(a, d, e === "number");
      this.cachedBullets.push(u), l.appendChild(u);
    }), this.appendChild(l);
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
        const b = t * 20, S = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const y = b - S + 10;
          this.snakeBar.style.left = `${S}px`, this.snakeBar.style.width = `${y}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const y = S - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${y}px`, this.snakeTimeout = window.setTimeout(() => {
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
    let l = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    l = Math.min(l, h - this.maxVisibleBullets);
    const a = l + this.maxVisibleBullets - 1;
    o.forEach((u, f) => {
      f >= l && f <= a ? f === l ? u.classList.add(f === 0 ? "sx-bullet-main" : "sx-bullet-small") : f === l + 1 ? u.classList.add(f === 1 ? "sx-bullet-main" : "sx-bullet-medium") : f === a ? u.classList.add(
        f === h - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : f === a - 1 ? u.classList.add(
        f === h - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -l * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${d}px)`;
  }
}
class mt extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (s) => {
      (s.key === "Enter" || s.key === " ") && (s.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Next slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const s = this.getAttribute("name");
    if (s) {
      const t = M.get(s);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class xt extends HTMLElement {
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
class bt extends HTMLElement {
  constructor() {
    super(), this.addEventListener("click", () => this.handleAction()), this.addEventListener("keydown", (s) => {
      (s.key === "Enter" || s.key === " ") && (s.preventDefault(), this.handleAction());
    });
  }
  connectedCallback() {
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.hasAttribute("aria-label") || this.setAttribute("aria-label", "Previous slide");
  }
  handleAction() {
    if (this.hasAttribute("sx-disabled")) return;
    const s = this.getAttribute("name");
    if (s) {
      const t = M.get(s);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class St {
  constructor(s, t, e = 0.92) {
    c(this, "velocity", 0);
    c(this, "friction");
    c(this, "onUpdate");
    c(this, "onComplete");
    c(this, "isRunning", !1);
    c(this, "tickerCallback");
    this.onUpdate = s, this.onComplete = t, this.friction = e, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(s) {
    this.friction = s;
  }
  addVelocity(s) {
    this.velocity += s, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, C.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, C.add(this.tickerCallback));
  }
  loop(s) {
    if (!this.isRunning) return;
    const t = s / 16.67, e = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= e;
  }
}
class yt extends HTMLElement {
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
    c(this, "wheelInertia", new St(
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
      const { max: h, min: l } = this.sliderCha.getBoundaries(), a = this.sliderCha.options.edgeResistance;
      o > h ? o = a <= 0 ? h : h + Math.min(a, (o - h) * 0.3) : o < l && (o = a <= 0 ? l : l - Math.min(a, (l - o) * 0.3)), this.currentTranslate = o;
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
        let l = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap();
        const a = this.children[h];
        let d = t.autoSize ? (a ? a.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (l + d / 2);
        } else
          r = o - l;
        if (!t.loop) {
          const { max: u, min: f } = this.sliderCha.getBoundaries();
          r = Math.max(f, Math.min(u, r));
        }
      }
      if (t.loop)
        this.startMomentumScroll(r);
      else {
        const { max: o, min: h } = this.sliderCha.getBoundaries(), l = Math.max(
          h,
          Math.min(o, r)
        );
        this.startMomentumScroll(l);
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
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, C.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, n = Math.min(e / this.scrollDuration, 1), r = 1 - Math.pow(1 - n, 4), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: l, min: a } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > l || this.currentTranslate < a) {
        if (this.currentTranslate > l) {
          if (d <= 0) {
            this.currentTranslate = l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > l + d) {
            this.currentTranslate = l + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(l, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < a) {
          if (d <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < a - d) {
            this.currentTranslate = a - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const f = this.currentTranslate > l ? l : a;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, C.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
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
      const b = this.sliderCha.getSlideSizeWithGap();
      o = e * b, r = t * b;
    }
    let h = 0;
    if (this.sliderCha.options.centered) {
      const b = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let S = 0;
      if (this.sliderCha.options.autoSize) {
        const y = this.sliderCha.convertToPx(this.sliderCha.options.gap), m = this.children[e];
        S = m ? m.getBoundingClientRect()[this.sliderCha.sizeDim] + y : 0;
      } else
        S = this.sliderCha.getSlideSizeWithGap();
      h = b / 2 - S / 2;
    }
    const l = -o + n + h, a = l - r;
    let d = !1, u = this.currentTranslate, f = 0, p = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > l + g ? (u = this.currentTranslate - r, f = -r, p = t, d = !0) : this.currentTranslate <= a - g && (u = this.currentTranslate + r, f = r, p = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
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
    let o = n, h = 0, l = 0;
    if (e.autoSize) {
      h = this.sliderCha.getOffsetForIndex(r);
      const a = Array.from(this.children), d = this.sliderCha.convertToPx(e.gap);
      l = a[r] ? a[r].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const a = this.sliderCha.getSlideSizeWithGap();
      h = r * a, l = a;
    }
    if (e.centered) {
      const a = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += a / 2 - (h + l / 2);
    } else
      o -= h;
    if (!e.loop) {
      const { max: a, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(a, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const a = this.sliderCha.originalSlidesCount, d = e.autoSize ? a : e.perView;
      (r >= d + a || r < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
class Y {
  static parse(s) {
    if (!s) return null;
    try {
      let t = s.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(s, t, e) {
    if (!e) return { ...t };
    let n = { ...t };
    const r = Object.keys(e).map(Number).sort((o, h) => o - h);
    for (const o of r)
      if (s >= o) {
        const h = this.kebabToCamel(e[o]);
        n = { ...n, ...h };
      }
    return n;
  }
  static kebabToCamel(s) {
    if (typeof s != "object" || s === null) return s;
    const t = {};
    for (const e in s) {
      const n = e.replace(/-([a-z])/g, (r) => r[1].toUpperCase());
      t[n] = s[e];
    }
    return t;
  }
}
class Ct extends HTMLElement {
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
      const a = this.originalSlidesCount;
      if (a > 0 && this.track) {
        const d = this.options.autoSize ? a : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let f = 0, p = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(d), p = this.getOffsetForIndex(d + a) - f;
        else {
          const g = this.getSlideSizeWithGap();
          f = d * g, p = a * g;
        }
        if (p > 0) {
          r = o / p;
          let g = 0;
          if (this.options.centered) {
            let y = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            g = o / 2 - y / 2;
          }
          n = (-f + u + g - t) / p, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: a, min: d } = this.getBoundaries(), u = a - d;
      u > 0 ? (n = (a - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const h = r + n * (1 - r);
    let l = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const a = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      l = [.../* @__PURE__ */ new Set([...l, ...a])];
    }
    l.forEach((a) => {
      typeof a.update == "function" && a.update(h, this.options.direction, e);
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
        const h = n.target.closest("sx-slider-slide");
        if (!h) return;
        const l = h.getAttribute("data-real-index");
        if (l !== null) {
          const a = parseInt(l, 10);
          this.goTo(a, !0);
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
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", e = this.getAttribute("edge-resistance"), n = e !== null ? Number(e) : 100, r = this.getAttribute("interval"), o = r !== null ? Number(r) : 4e3, h = this.getAttribute("start-index"), l = h !== null ? Number(h) : 0, a = this.getAttribute("per-move");
    let d = "auto";
    if (a !== null && a !== "auto") {
      const p = Number(a);
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
      speed: Number(this.getAttribute("speed")) || 300,
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(n) ? 0 : n,
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
      effect: f,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = Y.parse(
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
    if (this.options.loop || e.forEach((p, g) => {
      p.setAttribute("data-real-index", g.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = Y.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const p = (g) => g == null || g === "" ? "0px" : isNaN(Number(g)) ? String(g) : `${g}px`;
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
        const g = this.options.autoSize ? r : this.options.perView;
        this.currentIndex = g + p;
      } else
        this.currentIndex = p;
      this.isFirstInit = !1;
    }
    const o = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(h));
    const l = this.convertToPx(this.options.gap), a = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((p) => {
        p.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((p) => {
        const g = p.firstElementChild;
        g ? p.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : p.style[this.sizeDim] = "max-content", p.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - a - d - l * (this.options.perView - 1)) / this.options.perView;
      e.forEach((S) => {
        S.style[this.sizeDim] = `${b}px`, S.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const f = e.filter((p) => !p.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let p = 0;
      f.forEach((g) => {
        p += this.getRectSize(g) + l;
      }), p -= l, u = p < t;
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
      let l = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + n : this.getSlideSizeWithGap();
      o = e + t / 2 - l / 2;
      let a = r - 1, d = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[a] ? this.getRectSize(this.track.children[a]) : 0) + n : this.getSlideSizeWithGap();
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
    const r = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (m) => {
      if (!e) return m;
      let T = (m - r) % n;
      return T < 0 && (T += n), T;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), l = o(this.currentIndex);
    this.lastFiredIndex !== l && (this.lastFiredIndex = l, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: l }
      })
    ));
    const a = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + h), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let p = null;
    f && (p = document.createElement("style"), p.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(p), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !f || t.forEach((m, T) => {
      m.removeAttribute("sx-slide-active"), m.removeAttribute("sx-slide-prev"), m.removeAttribute("sx-slide-next"), m.removeAttribute("sx-slide-center");
      let w = o(T);
      m.setAttribute("aria-label", `${w + 1}/${n}`), w === l && m.setAttribute("sx-slide-active", ""), w === a && m.setAttribute("sx-slide-prev", ""), w === d && m.setAttribute("sx-slide-next", ""), w === u && m.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const g = e ? n - 1 : this.getRealMaxIndex(), b = this.getResolvedPerMove();
    let S = [];
    if (b > 1 && !this.options.autoSize) {
      let m = 0;
      for (; m < g; )
        S.push(m), m += b;
      m !== g && S.push(g);
    } else
      for (let m = 0; m <= g; m++)
        S.push(m);
    let y = S.indexOf(l);
    if (y === -1) {
      for (let m = S.length - 1; m >= 0; m--)
        if (l >= S[m]) {
          y = m;
          break;
        }
    }
    this.updatePagination(S, y), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((T) => T.trim()).forEach((T) => {
      const w = M.get(T);
      w && w.syncFromController(l);
    }), f && p && requestAnimationFrame(() => {
      p == null || p.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = e ? this.originalSlidesCount : n.length - r;
    if (((l) => {
      if (!e) return l;
      const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (l - a) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (e) {
        const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView, a = t + l, d = this.originalSlidesCount, u = n.length;
        let f = a, p = Math.abs(a - this.currentIndex);
        [a - d, a, a + d].forEach((b) => {
          if (b >= 0 && b < u) {
            const S = Math.abs(b - this.currentIndex);
            S < p && (p = S, f = b);
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
    for (let l = 0; l < e; l++) {
      let a = r + l;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const d = t[a];
      if (d) {
        const u = d.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const f = u.firstElementChild;
        f && (f.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let h = 0;
    o.forEach((l) => {
      const a = l.firstElementChild, d = a ? a.getBoundingClientRect().height : l.getBoundingClientRect().height;
      d > h && (h = d);
    }), o.forEach((l) => {
      var a;
      (a = this.track) == null || a.removeChild(l);
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
        const l = this.getBoundingClientRect()[this.sizeDim];
        h += l / 2 - (r + o / 2);
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
        let l = r, a = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < h) {
            const f = Math.abs(u - this.currentIndex);
            f < a && (a = f, l = u);
          }
        }), this.currentIndex = l;
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
    let h = 0, l = 1 / 0;
    const a = this.currentIndex;
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
        const { max: b, min: S } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? p = Math.max(
          S,
          Math.min(b, p)
        ) : this.options.centered || (d === 0 && (p = 0), p < S && (p = S), p > 0 && (p = 0));
      }
      const g = Math.abs(t - p);
      g < l - 0.5 ? (l = g, h = d) : Math.abs(g - l) <= 0.5 && Math.abs(d - a) < Math.abs(h - a) && (h = d, l = g);
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
function vt() {
  customElements.get("sx-slider") || customElements.define("sx-slider", Ct), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", yt), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", pt), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", xt), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", bt), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", gt), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", mt);
}
const E = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class kt extends HTMLElement {
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
    return t ? Number(t) : E.duration;
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : E.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : E.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : E.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : E.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || E.overlayStyle;
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
class At extends HTMLElement {
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
function Tt() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", kt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", At);
}
function wt() {
  ut(), at(), vt(), Tt();
}
const Z = /* @__PURE__ */ new Map();
function x(i, s) {
  Z.set(i, s);
}
function Et(i, s) {
  const t = Z.get(i);
  return t || (i.startsWith("--") ? Mt(i, s) : It(i, s));
}
function Mt(i, s) {
  return typeof s == "string" && !J(s) ? {
    type: "discrete",
    cssKey: i,
    apply(t, e) {
      t.style.setProperty(i, e);
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const e = window.getComputedStyle(t).getPropertyValue(i).trim();
      return e || console.warn(
        `[six-js] CSS variable "${i}" chưa có giá trị nào trên phần tử này (getPropertyValue trả về rỗng) — mặc định dùng 0. Kiểm tra lại đã khai báo "${i}" trong inline style hoặc CSS chưa.`
      ), B(e);
    },
    apply(t, e) {
      t.style.setProperty(i, `${e.num}${e.unit}`);
    }
  };
}
function J(i) {
  return /^-?[\d.]+[a-z%]*$/i.test(i.trim());
}
function It(i, s) {
  return typeof s == "string" && !J(s) ? {
    type: "discrete",
    cssKey: i,
    apply(t, e) {
      t.style[i] = e;
    }
  } : {
    type: "numeric",
    isTransform: !1,
    defaultUnit: "",
    getCurrent(t) {
      const e = window.getComputedStyle(t)[i];
      return e === void 0 ? (console.warn(
        `[six-js] Thuộc tính "${i}" không phải là CSS property hợp lệ (getComputedStyle trả về undefined). Kiểm tra lại tên — ví dụ đúng chuẩn CSS là "rotate" chứ không phải "rotation" (đó là tên riêng của GSAP), nếu six-js chưa hỗ trợ alias này hãy đăng ký thêm trong properties/.`
      ), { num: 0, unit: "" }) : B(e);
    },
    apply(t, e) {
      t.style[i] = `${e.num}${e.unit}`;
    }
  };
}
function B(i, s = "") {
  if (typeof i == "number")
    return { num: i, unit: s };
  if (typeof i != "string" || i.length === 0)
    return { num: 0, unit: s };
  const t = i.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || s } : { num: parseFloat(i) || 0, unit: s };
}
const zt = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function Bt(i, s, t, e) {
  if (typeof i != "string")
    return B(i, e);
  const n = i.match(zt);
  if (!n)
    return B(i, e);
  const [, r, o, h] = n, l = parseFloat(o), a = h || t || e;
  if (isNaN(l))
    return console.warn(
      `[six-js] Giá trị tương đối không hợp lệ: "${i}" — con số sau toán tử không parse được. Giữ nguyên giá trị hiện tại (${s}${a}).`
    ), { num: s, unit: a };
  if (r === "/" && l === 0)
    return console.warn(
      `[six-js] "${i}" — không thể chia cho 0. Giữ nguyên giá trị hiện tại (${s}${a}).`
    ), { num: s, unit: a };
  let d;
  switch (r) {
    case "+":
      d = s + l;
      break;
    case "-":
      d = s - l;
      break;
    case "*":
      d = s * l;
      break;
    case "/":
      d = s / l;
      break;
    default:
      d = s;
  }
  return { num: d, unit: a };
}
const Pt = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function Rt(i) {
  const s = document.createElement("span");
  s.style.color = i, s.style.display = "none", document.body.appendChild(s);
  const t = window.getComputedStyle(s).color;
  return document.body.removeChild(s), tt(t);
}
function tt(i) {
  const s = i.match(Pt);
  return s ? {
    r: parseFloat(s[1]),
    g: parseFloat(s[2]),
    b: parseFloat(s[3]),
    a: s[4] !== void 0 ? parseFloat(s[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function Lt(i, s, t) {
  return {
    r: i.r + (s.r - i.r) * t,
    g: i.g + (s.g - i.g) * t,
    b: i.b + (s.b - i.b) * t,
    a: i.a + (s.a - i.a) * t
  };
}
function Ft(i) {
  return `rgba(${Math.round(i.r)}, ${Math.round(i.g)}, ${Math.round(i.b)}, ${i.a})`;
}
const H = /-?[\d.]+/g;
function K(i) {
  return (i.match(H) || []).length;
}
function Dt(i, s, t) {
  const e = K(i), n = K(s), r = e === n && n > 0;
  return r || console.warn(
    `[six-js] "${t}": không thể animate mượt vì giá trị bắt đầu ("${i}") và kết thúc ("${s}") không cùng cấu trúc (số lượng con số khác nhau: ${e} vs ${n}). Animation sẽ nhảy thẳng tới giá trị cuối thay vì chạy mượt. Gợi ý: dùng fromTo() và chỉ định rõ chuỗi bắt đầu cùng cấu trúc với chuỗi kết thúc, ví dụ cùng dùng "blur(0px) brightness(1)" -> "blur(4px) brightness(1.6)".`
  ), r;
}
function $t(i, s, t) {
  const e = (i.match(H) || []).map(Number);
  let n = 0;
  return s.replace(H, (r) => {
    const o = parseFloat(r), h = e[n] ?? o;
    n++;
    const l = h + (o - h) * t;
    return String(Math.round(l * 1e3) / 1e3);
  });
}
const F = /* @__PURE__ */ new WeakMap();
function Ot(i) {
  let s = F.get(i);
  return s || (s = /* @__PURE__ */ new Map(), F.set(i, s)), s;
}
function qt(i, s) {
  var t;
  return (t = F.get(i)) == null ? void 0 : t.get(s);
}
function _t(i, s, t) {
  Ot(i).set(s, t);
}
function Nt(i) {
  const s = F.get(i);
  if (!s || s.size === 0) return "";
  let t = "";
  for (const { fn: e, value: n, unit: r } of s.values())
    t += `${e}(${n}${r}) `;
  return t.trim();
}
class Ht {
  constructor(s, t) {
    c(this, "duration");
    c(this, "targets");
    c(this, "easeFn");
    c(this, "propStates", []);
    c(this, "hasTransform", []);
    typeof s == "string" ? this.targets = Array.from(document.querySelectorAll(s)) : this.targets = Array.isArray(s) ? s : [s], this.duration = t.duration ?? 0.5;
    const e = t.ease ?? "linear";
    this.easeFn = z[e] || z.linear, this.setupProps(t);
  }
  setupProps(s) {
    this.targets.forEach((t, e) => {
      const n = [];
      let r = !1;
      for (const o in s) {
        if (o === "duration" || o === "ease") continue;
        const h = s[o], l = Et(o, h);
        if (l.type === "discrete") {
          l.apply(t, String(h));
          continue;
        }
        if (l.type === "color") {
          const u = l.getCurrent(t), f = Rt(String(h));
          n.push({ key: o, state: { kind: "color", start: u, end: f, apply: l.apply } });
          continue;
        }
        if (l.type === "complex") {
          const u = l.getCurrent(t), f = String(h);
          Dt(u, f, o), n.push({ key: o, state: { kind: "complex", start: u, end: f, apply: l.apply } });
          continue;
        }
        const a = l.getCurrent(t, o), d = Bt(
          h,
          a.num,
          a.unit,
          l.defaultUnit
        );
        l.isTransform && (r = !0), n.push({
          key: o,
          state: {
            kind: "numeric",
            start: a.num,
            end: d.num,
            unit: d.unit || a.unit,
            isTransform: l.isTransform,
            transformFn: l.transformFn,
            apply: l.apply
          }
        });
      }
      this.propStates[e] = n, this.hasTransform[e] = r;
    });
  }
  render(s) {
    const t = this.duration === 0 ? 1 : Math.min(s / this.duration, 1), e = this.easeFn(t);
    this.targets.forEach((n, r) => {
      const o = this.propStates[r];
      let h = !1;
      for (let l = 0; l < o.length; l++) {
        const { state: a } = o[l];
        if (a.kind === "color") {
          a.apply(n, Lt(a.start, a.end, e));
          continue;
        }
        if (a.kind === "complex") {
          a.apply(n, $t(a.start, a.end, e));
          continue;
        }
        const d = a.start + (a.end - a.start) * e;
        a.isTransform && a.transformFn ? (_t(n, a.transformFn, {
          value: d,
          unit: a.unit,
          fn: a.transformFn
        }), h = !0) : a.apply(n, { num: d, unit: a.unit });
      }
      h && (n.style.transform = Nt(n));
    });
  }
  onStart() {
    this.targets.forEach((s, t) => {
      this.hasTransform[t] && (s.style.willChange = "transform");
    });
  }
  onComplete() {
    this.targets.forEach((s, t) => {
      this.hasTransform[t] && (s.style.willChange = "");
    });
  }
}
class Vt {
  constructor(s, t = !0) {
    c(this, "animatable");
    c(this, "elapsed", 0);
    // giây, luôn trong [0, duration]
    c(this, "rate", 1);
    // 1 = xuôi, -1 = ngược
    c(this, "running", !1);
    c(this, "listeners", {});
    c(this, "tick", (s, t) => {
      if (this.elapsed += t / 1e3 * this.rate, this.elapsed >= this.animatable.duration) {
        this.elapsed = this.animatable.duration, this.animatable.render(this.elapsed), this.emit("update"), this.stop(), this.emit("complete");
        return;
      }
      if (this.elapsed <= 0) {
        this.elapsed = 0, this.animatable.render(this.elapsed), this.emit("update"), this.stop(), this.emit("complete");
        return;
      }
      this.animatable.render(this.elapsed), this.emit("update");
    });
    this.animatable = s, t ? this.play() : this.animatable.render(0);
  }
  play() {
    var s, t;
    return this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, (t = (s = this.animatable).onStart) == null || t.call(s), C.add(this.tick), this.emit("start"), this);
  }
  reverse() {
    var s, t;
    return this.rate = -1, this.running || (this.running = !0, (t = (s = this.animatable).onStart) == null || t.call(s), C.add(this.tick)), this;
  }
  pause() {
    return this.running ? (this.running = !1, C.remove(this.tick), this) : this;
  }
  stop() {
    var s, t;
    this.running = !1, C.remove(this.tick), (t = (s = this.animatable).onComplete) == null || t.call(s);
  }
  /** Tua tới thời điểm bất kỳ (giây), không phụ thuộc trạng thái đang chạy hay không */
  seek(s) {
    return this.elapsed = Math.max(0, Math.min(s, this.animatable.duration)), this.animatable.render(this.elapsed), this.emit("update"), this;
  }
  restart() {
    return this.elapsed = 0, this.rate = 1, this.animatable.render(0), this.play(), this;
  }
  on(s, t) {
    return this.listeners[s] || (this.listeners[s] = /* @__PURE__ */ new Set()), this.listeners[s].add(t), this;
  }
  off(s, t) {
    var e;
    return (e = this.listeners[s]) == null || e.delete(t), this;
  }
  emit(s) {
    var t;
    (t = this.listeners[s]) == null || t.forEach((e) => e());
  }
  get progress() {
    return this.animatable.duration === 0 ? 1 : this.elapsed / this.animatable.duration;
  }
  get isRunning() {
    return this.running;
  }
}
const X = {
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
}, L = 180 / Math.PI;
function Xt(i) {
  const s = window.getComputedStyle(i).transform;
  return !s || s === "none" ? { ...X } : s.startsWith("matrix3d") ? Gt(s) : Wt(s);
}
function Wt(i) {
  const s = i.match(/matrix\(([^)]+)\)/);
  if (!s) return { ...X };
  const t = s[1].split(",").map((f) => parseFloat(f.trim())), [e, n, r, o, h, l] = t, a = Math.sqrt(e * e + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, e) * L;
  return {
    x: h,
    y: l,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: a,
    scaleX: a,
    scaleY: d,
    skewX: 0,
    skewY: 0
  };
}
function Gt(i) {
  const s = i.match(/matrix3d\(([^)]+)\)/);
  if (!s) return { ...X };
  const t = s[1].split(",").map((m) => parseFloat(m.trim())), e = t[0], n = t[1], r = t[2], o = t[4], h = t[5], l = t[6];
  t[8], t[9];
  const a = t[10], d = t[12], u = t[13], f = t[14], p = Math.sqrt(e * e + n * n + r * r), g = Math.sqrt(o * o + h * h + l * l), b = Math.atan2(n, e) * L, S = Math.atan2(-r, Math.sqrt(l * l + a * a)) * L, y = Math.atan2(l, a) * L;
  return {
    x: d,
    y: u,
    z: f,
    rotate: b,
    rotateX: y,
    rotateY: S,
    rotateZ: b,
    scale: p,
    scaleX: p,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
function v(i, s, t) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: i,
    defaultUnit: s,
    getCurrent(e) {
      const n = qt(e, i);
      return n ? { num: n.value, unit: n.unit } : { num: Xt(e)[t], unit: s };
    },
    apply() {
    }
  };
}
x("x", v("translateX", "px", "x"));
x("y", v("translateY", "px", "y"));
x("z", v("translateZ", "px", "z"));
x("rotate", v("rotate", "deg", "rotate"));
x("rotateX", v("rotateX", "deg", "rotateX"));
x("rotateY", v("rotateY", "deg", "rotateY"));
x("rotateZ", v("rotateZ", "deg", "rotateZ"));
x("scale", v("scale", "", "scale"));
x("scaleX", v("scaleX", "", "scaleX"));
x("scaleY", v("scaleY", "", "scaleY"));
x("skewX", v("skewX", "deg", "skewX"));
x("skewY", v("skewY", "deg", "skewY"));
function A(i, s) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: s,
    getCurrent(t) {
      const e = window.getComputedStyle(t)[i];
      return B(e, s);
    },
    apply(t, e) {
      t.style[i] = `${e.num}${e.unit}`;
    }
  };
}
x("width", A("width", "px"));
x("height", A("height", "px"));
x("top", A("top", "px"));
x("left", A("left", "px"));
x("right", A("right", "px"));
x("bottom", A("bottom", "px"));
x("borderRadius", A("borderRadius", "px"));
x("borderWidth", A("borderWidth", "px"));
x("opacity", A("opacity", ""));
x("fontSize", A("fontSize", "px"));
x("letterSpacing", A("letterSpacing", "px"));
function D(i) {
  return {
    type: "color",
    cssKey: i,
    getCurrent(s) {
      const t = window.getComputedStyle(s)[i];
      return tt(t);
    },
    apply(s, t) {
      s.style[i] = Ft(t);
    }
  };
}
x("backgroundColor", D("backgroundColor"));
x("color", D("color"));
x("borderColor", D("borderColor"));
x("background", D("backgroundColor"));
function Yt(i) {
  return {
    type: "discrete",
    cssKey: i,
    apply(s, t) {
      s.style[i] = t;
    }
  };
}
const Kt = [
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
Kt.forEach((i) => x(i, Yt(i)));
function et(i) {
  return {
    type: "complex",
    cssKey: i,
    getCurrent(s) {
      const t = window.getComputedStyle(s)[i];
      return t && t !== "none" ? t : "";
    },
    apply(s, t) {
      s.style[i] = t;
    }
  };
}
x("boxShadow", et("boxShadow"));
x("filter", et("filter"));
rt();
let j = !1;
function jt() {
  j || (wt(), j = !0);
}
function Ut(i, s) {
  const t = new Ht(i, s);
  return new Vt(t, !0);
}
const Zt = {
  initElement: jt,
  to: Ut
};
export {
  nt as VERSION,
  Zt as six
};
