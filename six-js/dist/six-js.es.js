var ht = Object.defineProperty;
var ct = (i, s, t) => s in i ? ht(i, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[s] = t;
var h = (i, s, t) => ct(i, typeof s != "symbol" ? s + "" : s, t);
const dt = "0.0.31";
let U = !1;
function ut() {
  U || (U = !0, console.log(
    ` SixJS v${dt}`
  ));
}
function P(i) {
  return i < 1 / 2.75 ? 7.5625 * i * i : i < 2 / 2.75 ? (i -= 1.5 / 2.75, 7.5625 * i * i + 0.75) : i < 2.5 / 2.75 ? (i -= 2.25 / 2.75, 7.5625 * i * i + 0.9375) : (i -= 2.625 / 2.75, 7.5625 * i * i + 0.984375);
}
const z = 1.70158, R = z * 1.525, F = {
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
  "back-in": (i) => (z + 1) * i * i * i - z * i * i,
  "back-out": (i) => (i--, 1 + (z + 1) * i * i * i + z * i * i),
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
}, W = /* @__PURE__ */ new WeakMap();
let _ = [], N = null;
function K(i, s) {
  _.push({ instance: i, type: s }), N === null && (N = requestAnimationFrame(pt));
}
function pt() {
  const i = _.slice();
  _.length = 0, N = null;
  for (let s = 0; s < i.length; s++) {
    const { instance: t, type: e } = i[s];
    e === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let q = null;
function st() {
  return typeof window > "u" ? null : (q || (q = new IntersectionObserver(
    (i) => {
      for (let s = 0; s < i.length; s++) {
        const t = i[s], e = W.get(t.target);
        e && (t.isIntersecting ? K(e, "enter") : K(e, "leave"));
      }
    },
    { threshold: 0.05 }
  )), q);
}
function nt(i, s) {
  var t;
  W.set(i, s), (t = st()) == null || t.observe(i);
}
function Y(i) {
  var s;
  W.delete(i), (s = st()) == null || s.unobserve(i);
}
function B(i, s) {
  if (i == null) return s;
  const t = i.trim();
  if (!t) return s;
  const e = Number(t);
  return Number.isFinite(e) ? e * 1e3 : s;
}
const k = class k extends HTMLElement {
  constructor() {
    super(...arguments);
    h(this, "animation");
    h(this, "options");
    h(this, "order", k.counter++);
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
    this.setInitialState(), nt(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), Y(this), k.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || Y(this), this.isGroup ? (k.groupQueue.add(this), k.scheduleGroup()) : this.play();
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
      easing: r && r in F ? r : "ease-in-out",
      duration: B(this.getAttribute("duration"), 400),
      delay: B(this.getAttribute("delay"), 0)
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
    const { x: e, y: n, easing: r, duration: o, delay: d } = this.options;
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
        delay: d + t,
        easing: r,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var a;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (a = this.animation) == null || a.cancel(), this.animation = void 0;
    };
  }
};
h(k, "counter", 0), h(k, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), h(k, "groupQueue", /* @__PURE__ */ new Set()), h(k, "isProcessingGroup", !1);
let X = k;
function ft() {
  customElements.get("sx-animate") || customElements.define("sx-animate", X);
}
class gt {
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
const v = new gt();
class mt extends HTMLElement {
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
      this.isHovered && (this.isHovered = !1);
    });
    h(this, "updateAnimation", (t, e) => {
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
    }), this.resizeObserver.observe(this), nt(this, {
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
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), Y(this), v.remove(this.updateAnimation);
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
          const d = o < r ? Math.ceil(r * 2 / o) : 2, l = document.createDocumentFragment();
          for (let a = 1; a < d; a++)
            for (const c of e) {
              const u = c.cloneNode(!0);
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
class xt extends HTMLElement {
}
class bt extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function yt() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", mt), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", xt), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", bt);
}
class St extends HTMLElement {
  constructor() {
    super();
  }
}
class vt {
  constructor() {
    h(this, "sliders", /* @__PURE__ */ new Map());
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
const M = new vt();
class Ct extends HTMLElement {
  constructor() {
    super();
    h(this, "renderedSignature", "");
    h(this, "innerContainer", null);
    h(this, "snakeBar", null);
    h(this, "maxVisibleBullets", 5);
    h(this, "bulletWidthWithGap", 16);
    h(this, "lastActiveIndex", 0);
    h(this, "cachedBullets", []);
    h(this, "snakeTimeout", null);
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
      const a = document.createElement("span");
      a.className = "sx-slider-pagination-current", a.textContent = "1";
      const c = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(a), p.appendChild(c), p.appendChild(u), this.appendChild(p);
      return;
    }
    const l = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((a, c) => {
        const u = this.createBulletDOM(a, c, !1);
        this.cachedBullets.push(u), l.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", l.appendChild(this.snakeBar), this.appendChild(l);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", l.appendChild(this.innerContainer), t.forEach((a, c) => {
        const u = this.createBulletDOM(a, c, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(l);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((a, c) => {
      const u = this.createBulletDOM(a, c, e === "number");
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
    const n = e === "dynamic", r = e === "snake", o = this.cachedBullets, d = o.length;
    if (d === 0) return;
    if (o.forEach((u, p) => {
      n && (u.className = "sx-slider-pagination-bullet"), p === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const m = t * 20, x = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const S = m - x + 10;
          this.snakeBar.style.left = `${x}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const S = x - m + 10;
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
    let l = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    l = Math.min(l, d - this.maxVisibleBullets);
    const a = l + this.maxVisibleBullets - 1;
    o.forEach((u, p) => {
      p >= l && p <= a ? p === l ? u.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === l + 1 ? u.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === a ? u.classList.add(
        p === d - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === a - 1 ? u.classList.add(
        p === d - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const c = -l * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${c}px)`;
  }
}
class kt extends HTMLElement {
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
class wt extends HTMLElement {
  constructor() {
    super();
    h(this, "bar");
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
class At extends HTMLElement {
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
class Et {
  constructor(s, t, e = 0.92) {
    h(this, "velocity", 0);
    h(this, "friction");
    h(this, "onUpdate");
    h(this, "onComplete");
    h(this, "isRunning", !1);
    h(this, "tickerCallback");
    this.onUpdate = s, this.onComplete = t, this.friction = e, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(s) {
    this.friction = s;
  }
  addVelocity(s) {
    this.velocity += s, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, v.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, v.add(this.tickerCallback));
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
class Tt extends HTMLElement {
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
        const { max: e, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(e, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    h(this, "wheelInertia", new Et(
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
      const { max: d, min: l } = this.sliderCha.getBoundaries(), a = this.sliderCha.options.edgeResistance;
      o > d ? o = a <= 0 ? d : d + Math.min(a, (o - d) * 0.3) : o < l && (o = a <= 0 ? l : l - Math.min(a, (l - o) * 0.3)), this.currentTranslate = o;
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
        let l = t.autoSize ? this.sliderCha.getOffsetForIndex(d) : d * this.sliderCha.getSlideSizeWithGap();
        const a = this.children[d];
        let c = t.autoSize ? (a ? a.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (l + c / 2);
        } else
          r = o - l;
        if (!t.loop) {
          const { max: u, min: p } = this.sliderCha.getBoundaries();
          r = Math.max(p, Math.min(u, r));
        }
      }
      if (t.loop)
        this.startMomentumScroll(r);
      else {
        const { max: o, min: d } = this.sliderCha.getBoundaries(), l = Math.max(
          d,
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
    var d;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = e ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (d = this.sliderCha) != null && d.options.loop && this.checkLoopBoundsInstant(), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, v.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const e = performance.now() - this.scrollStartTime, n = Math.min(e / this.scrollDuration, 1), r = 1 - Math.pow(1 - n, 4), d = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += d, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: l, min: a } = this.sliderCha.getBoundaries(), c = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > l || this.currentTranslate < a) {
        if (this.currentTranslate > l) {
          if (c <= 0) {
            this.currentTranslate = l, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > l + c) {
            this.currentTranslate = l + c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(l, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < a) {
          if (c <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < a - c) {
            this.currentTranslate = a - c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(d) < 1) {
          const p = this.currentTranslate > l ? l : a;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(d) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, v.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, v.remove(this.scrollTickerCallback);
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
      let x = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), b = this.children[e];
        x = b ? b.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        x = this.sliderCha.getSlideSizeWithGap();
      d = m / 2 - x / 2;
    }
    const l = -o + n + d, a = l - r;
    let c = !1, u = this.currentTranslate, p = 0, f = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > l + g ? (u = this.currentTranslate - r, p = -r, f = t, c = !0) : this.currentTranslate <= a - g && (u = this.currentTranslate + r, p = r, f = -t, c = !0), c && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
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
    let o = n, d = 0, l = 0;
    if (e.autoSize) {
      d = this.sliderCha.getOffsetForIndex(r);
      const a = Array.from(this.children), c = this.sliderCha.convertToPx(e.gap);
      l = a[r] ? a[r].getBoundingClientRect()[this.sliderCha.sizeDim] + c : 0;
    } else {
      const a = this.sliderCha.getSlideSizeWithGap();
      d = r * a, l = a;
    }
    if (e.centered) {
      const a = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += a / 2 - (d + l / 2);
    } else
      o -= d;
    if (!e.loop) {
      const { max: a, min: c } = this.sliderCha.getBoundaries();
      o = Math.max(c, Math.min(a, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, e.loop) {
      const a = this.sliderCha.originalSlidesCount, c = e.autoSize ? a : e.perView;
      (r >= c + a || r < c) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, e.speed);
    }
  }
}
class Q {
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
    const r = Object.keys(e).map(Number).sort((o, d) => o - d);
    for (const o of r)
      if (s >= o) {
        const d = this.kebabToCamel(e[o]);
        n = { ...n, ...d };
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
class Mt extends HTMLElement {
  constructor() {
    super();
    h(this, "options");
    h(this, "originalOptions");
    h(this, "breakpointsConfig", null);
    h(this, "currentIndex", 0);
    h(this, "lastFiredIndex", -1);
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
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const a = this.originalSlidesCount;
      if (a > 0 && this.track) {
        const c = this.options.autoSize ? a : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let p = 0, f = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(c), f = this.getOffsetForIndex(c + a) - p;
        else {
          const g = this.getSlideSizeWithGap();
          p = c * g, f = a * g;
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
      const { max: a, min: c } = this.getBoundaries(), u = a - c;
      u > 0 ? (n = (a - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const d = r + n * (1 - r);
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
      typeof a.update == "function" && a.update(d, this.options.direction, e);
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
        const l = d.getAttribute("data-real-index");
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
    const t = (f) => f ? isNaN(Number(f)) ? f : `${f}px` : "0px", e = this.getAttribute("edge-resistance"), n = e !== null ? Number(e) : 100, r = this.getAttribute("interval"), o = B(r, 4e3), d = this.getAttribute("start-index"), l = d !== null ? Number(d) : 0, a = this.getAttribute("per-move");
    let c = "auto";
    if (a !== null && a !== "auto") {
      const f = Number(a);
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
      speed: B(this.getAttribute("speed"), 300),
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
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = Q.parse(
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
      this.options = Q.getMatch(
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
    const l = this.convertToPx(this.options.gap), a = this.convertToPx(this.options.leftPadding), c = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      e.forEach((f) => {
        f.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, e.forEach((f) => {
        const g = f.firstElementChild;
        g ? f.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : f.style[this.sizeDim] = "max-content", f.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - a - c - l * (this.options.perView - 1)) / this.options.perView;
      e.forEach((x) => {
        x.style[this.sizeDim] = `${m}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const p = e.filter((f) => !f.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let f = 0;
      p.forEach((g) => {
        f += this.getRectSize(g) + l;
      }), f -= l, u = f < t;
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
      let l = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + n : this.getSlideSizeWithGap();
      o = e + t / 2 - l / 2;
      let a = r - 1, c = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[a] ? this.getRectSize(this.track.children[a]) : 0) + n : this.getSlideSizeWithGap();
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
    const r = e ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (b) => {
      if (!e) return b;
      let A = (b - r) % n;
      return A < 0 && (A += n), A;
    }, d = this.options.centered ? 0 : Math.floor(this.options.perView / 2), l = o(this.currentIndex);
    this.lastFiredIndex !== l && (this.lastFiredIndex = l, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: l }
      })
    ));
    const a = o(this.currentIndex - 1), c = o(this.currentIndex + 1), u = o(this.currentIndex + d), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let f = null;
    p && (f = document.createElement("style"), f.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(f), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((b, A) => {
      b.removeAttribute("sx-slide-active"), b.removeAttribute("sx-slide-prev"), b.removeAttribute("sx-slide-next"), b.removeAttribute("sx-slide-center");
      let E = o(A);
      b.setAttribute("aria-label", `${E + 1}/${n}`), E === l && b.setAttribute("sx-slide-active", ""), E === a && b.setAttribute("sx-slide-prev", ""), E === c && b.setAttribute("sx-slide-next", ""), E === u && b.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const g = e ? n - 1 : this.getRealMaxIndex(), m = this.getResolvedPerMove();
    let x = [];
    if (m > 1 && !this.options.autoSize) {
      let b = 0;
      for (; b < g; )
        x.push(b), b += m;
      b !== g && x.push(g);
    } else
      for (let b = 0; b <= g; b++)
        x.push(b);
    let S = x.indexOf(l);
    if (S === -1) {
      for (let b = x.length - 1; b >= 0; b--)
        if (l >= x[b]) {
          S = b;
          break;
        }
    }
    this.updatePagination(x, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((A) => A.trim()).forEach((A) => {
      const E = M.get(A);
      E && E.syncFromController(l);
    }), p && f && requestAnimationFrame(() => {
      f == null || f.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const e = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = e ? this.originalSlidesCount : n.length - r;
    if (((l) => {
      if (!e) return l;
      const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let c = (l - a) % o;
      return c < 0 && (c += o), c;
    })(this.currentIndex) !== t) {
      if (e) {
        const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView, a = t + l, c = this.originalSlidesCount, u = n.length;
        let p = a, f = Math.abs(a - this.currentIndex);
        [a - c, a, a + c].forEach((m) => {
          if (m >= 0 && m < u) {
            const x = Math.abs(m - this.currentIndex);
            x < f && (f = x, p = m);
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
    for (let l = 0; l < e; l++) {
      let a = r + l;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const c = t[a];
      if (c) {
        const u = c.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${c.getBoundingClientRect()[this.sizeDim]}px`;
        const p = u.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let d = 0;
    o.forEach((l) => {
      const a = l.firstElementChild, c = a ? a.getBoundingClientRect().height : l.getBoundingClientRect().height;
      c > d && (d = c);
    }), o.forEach((l) => {
      var a;
      (a = this.track) == null || a.removeChild(l);
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
        const l = this.getBoundingClientRect()[this.sizeDim];
        d += l / 2 - (r + o / 2);
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
        let l = r, a = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < d) {
            const p = Math.abs(u - this.currentIndex);
            p < a && (a = p, l = u);
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
    let d = 0, l = 1 / 0;
    const a = this.currentIndex;
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
        const { max: m, min: x } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? f = Math.max(
          x,
          Math.min(m, f)
        ) : this.options.centered || (c === 0 && (f = 0), f < x && (f = x), f > 0 && (f = 0));
      }
      const g = Math.abs(t - f);
      g < l - 0.5 ? (l = g, d = c) : Math.abs(g - l) <= 0.5 && Math.abs(c - a) < Math.abs(d - a) && (d = c, l = g);
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
function It() {
  customElements.get("sx-slider") || customElements.define("sx-slider", Mt), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", Tt), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", St), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", wt), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", At), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Ct), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", kt);
}
const T = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class zt extends HTMLElement {
  constructor() {
    super();
    h(this, "isOpen", !1);
    h(this, "previousActiveElement", null);
    h(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    h(this, "backdropEl", null);
    h(this, "dialogCoreEl", null);
    h(this, "originalContentHTML", "");
    h(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    h(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape" && this.closeOnEscKey) {
          t.preventDefault(), this.close();
          return;
        }
        t.key === "Tab" && this.trapFocus(t);
      }
    });
    h(this, "handleBackdropClick", (t) => {
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
    return B(t, T.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : T.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : T.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : T.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : T.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || T.overlayStyle;
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
class Bt extends HTMLElement {
  constructor() {
    super(...arguments);
    h(this, "handleKeyDown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.toggleDialog());
    });
    h(this, "toggleDialog", () => {
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
function Pt() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", zt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Bt);
}
function Rt() {
  yt(), ft(), It(), Pt();
}
const rt = /* @__PURE__ */ new Map();
function y(i, s) {
  rt.set(i, s);
}
function Lt(i, s) {
  const t = rt.get(i);
  return t || (i.startsWith("--") ? Ft(i, s) : Dt(i, s));
}
function Ft(i, s) {
  return typeof s == "string" && !ot(s) ? {
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
      return e || console.warn(`[six-js] CSS variable "${i}" not set, defaulting to 0`), I(e);
    },
    apply(t, e) {
      t.style.setProperty(i, `${e.num}${e.unit}`);
    }
  };
}
function ot(i) {
  return /^-?[\d.]+[a-z%]*$/i.test(i.trim());
}
function Dt(i, s) {
  return typeof s == "string" && !ot(s) ? {
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
      return e === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${i}"`), { num: 0, unit: "" }) : I(e);
    },
    apply(t, e) {
      t.style[i] = `${e.num}${e.unit}`;
    }
  };
}
function I(i, s = "") {
  if (typeof i == "number")
    return { num: i, unit: s };
  if (typeof i != "string" || i.length === 0)
    return { num: 0, unit: s };
  const t = i.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || s } : { num: parseFloat(i) || 0, unit: s };
}
const $t = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function Ot(i, s, t, e) {
  if (typeof i != "string")
    return I(i, e);
  const n = i.match($t);
  if (!n)
    return I(i, e);
  const [, r, o, d] = n, l = parseFloat(o), a = d || t || e;
  if (isNaN(l))
    return console.warn(`[six-js] Invalid relative value: "${i}"`), { num: s, unit: a };
  if (r === "/" && l === 0)
    return console.warn(`[six-js] Division by zero: "${i}"`), { num: s, unit: a };
  let c;
  switch (r) {
    case "+":
      c = s + l;
      break;
    case "-":
      c = s - l;
      break;
    case "*":
      c = s * l;
      break;
    case "/":
      c = s / l;
      break;
    default:
      c = s;
  }
  return { num: c, unit: a };
}
const qt = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function Z(i) {
  const s = document.createElement("span");
  s.style.color = i, s.style.display = "none", document.body.appendChild(s);
  const t = window.getComputedStyle(s).color;
  return document.body.removeChild(s), at(t);
}
function at(i) {
  const s = i.match(qt);
  return s ? {
    r: parseFloat(s[1]),
    g: parseFloat(s[2]),
    b: parseFloat(s[3]),
    a: s[4] !== void 0 ? parseFloat(s[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function _t(i, s, t) {
  return {
    r: i.r + (s.r - i.r) * t,
    g: i.g + (s.g - i.g) * t,
    b: i.b + (s.b - i.b) * t,
    a: i.a + (s.a - i.a) * t
  };
}
function Nt(i) {
  return `rgba(${Math.round(i.r)}, ${Math.round(i.g)}, ${Math.round(i.b)}, ${i.a})`;
}
const H = /-?[\d.]+/g;
function J(i) {
  return (i.match(H) || []).length;
}
function Yt(i, s, t) {
  const e = J(i), n = J(s), r = e === n && n > 0;
  return r || console.warn(`[six-js] "${t}": shape mismatch (${e} vs ${n} numbers), will snap instead of interpolate`), r;
}
function Xt(i, s, t) {
  const e = (i.match(H) || []).map(Number);
  let n = 0;
  return s.replace(H, (r) => {
    const o = parseFloat(r), d = e[n] ?? o;
    n++;
    const l = d + (o - d) * t;
    return String(Math.round(l * 1e3) / 1e3);
  });
}
const $ = /* @__PURE__ */ new WeakMap();
function Ht(i) {
  let s = $.get(i);
  return s || (s = /* @__PURE__ */ new Map(), $.set(i, s)), s;
}
function Vt(i, s) {
  var t;
  return (t = $.get(i)) == null ? void 0 : t.get(s);
}
function Wt(i, s, t) {
  Ht(i).set(s, t);
}
function Gt(i) {
  const s = $.get(i);
  if (!s || s.size === 0) return "";
  let t = "";
  for (const { fn: e, value: n, unit: r } of s.values())
    t += `${e}(${n}${r}) `;
  return t.trim();
}
function jt(i, s, t) {
  const e = i.style[s];
  i.style[s] = t;
  const n = parseFloat(window.getComputedStyle(i)[s]) || 0;
  return i.style[s] = e, n;
}
const Ut = /^random\((.+)\)$/i;
function Kt(i) {
  return /^-?[\d.]+$/.test(i.trim());
}
function Qt(i) {
  const s = i.match(Ut);
  if (!s) return i;
  const t = s[1].split(",").map((e) => e.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${i}"`), i;
  if (t.length === 2 && t.every(Kt)) {
    const e = parseFloat(t[0]), n = parseFloat(t[1]);
    return e + Math.random() * (n - e);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function L(i, s, t) {
  let e = i;
  return typeof e == "function" && (e = e(s, t)), typeof e == "string" && (e = Qt(e)), e;
}
let V = {};
function Zt(i) {
  V = { ...V, ...i };
}
function Jt() {
  return V;
}
class te {
  constructor(s, t, e = "to", n) {
    h(this, "duration");
    h(this, "targets");
    h(this, "easeFn");
    h(this, "propStates", []);
    h(this, "hasTransform", []);
    typeof s == "string" ? this.targets = Array.from(document.querySelectorAll(s)) : this.targets = Array.isArray(s) ? s : [s], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${s}"`);
    const r = Jt();
    this.duration = t.duration ?? r.duration ?? 0.5, this.duration < 0 && (console.warn(`[six-js] Negative duration (${this.duration}), using 0 instead`), this.duration = 0);
    const o = t.ease ?? r.ease ?? "linear";
    F[o] || console.warn(`[six-js] Unknown ease "${o}", falling back to linear`), this.easeFn = F[o] || F.linear, this.setupProps(t, e, n);
  }
  setupProps(s, t, e) {
    const n = /* @__PURE__ */ new Set();
    for (const r in s) n.add(r);
    if (e) for (const r in e) n.add(r);
    n.delete("duration"), n.delete("ease"), this.targets.forEach((r, o) => {
      const d = [];
      let l = !1;
      for (const a of n) {
        let c, u;
        t === "to" ? u = L(s[a], o, r) : t === "from" ? c = L(s[a], o, r) : (a in s && (u = L(s[a], o, r)), e && a in e && (c = L(e[a], o, r)));
        const p = Lt(a, u ?? c);
        if (p.type === "discrete") {
          p.apply(r, String(u ?? c));
          continue;
        }
        if (p.type === "color") {
          const x = c !== void 0 ? Z(String(c)) : p.getCurrent(r), S = u !== void 0 ? Z(String(u)) : p.getCurrent(r);
          d.push({ key: a, state: { kind: "color", start: x, end: S, apply: p.apply } });
          continue;
        }
        if (p.type === "complex") {
          const x = c !== void 0 ? String(c) : p.getCurrent(r), S = u !== void 0 ? String(u) : p.getCurrent(r);
          Yt(x, S, a), d.push({ key: a, state: { kind: "complex", start: x, end: S, apply: p.apply } });
          continue;
        }
        const f = c !== void 0 ? I(c, p.defaultUnit) : p.getCurrent(r, a);
        let g = u !== void 0 ? Ot(u, f.num, f.unit, p.defaultUnit) : p.getCurrent(r, a), m;
        if (!p.isTransform && g.unit && f.unit && g.unit !== f.unit) {
          const x = jt(r, a, `${g.num}${g.unit}`);
          m = `${g.num}${g.unit}`, g = { num: x, unit: f.unit };
        }
        p.isTransform && (l = !0), d.push({
          key: a,
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
      this.propStates[o] = d, this.hasTransform[o] = l;
    });
  }
  render(s) {
    const t = this.duration === 0 ? 1 : Math.min(s / this.duration, 1), e = this.easeFn(t);
    this.targets.forEach((n, r) => {
      const o = this.propStates[r];
      let d = !1;
      for (let l = 0; l < o.length; l++) {
        const { key: a, state: c } = o[l];
        if (c.kind === "color") {
          c.apply(n, _t(c.start, c.end, e));
          continue;
        }
        if (c.kind === "complex") {
          c.apply(n, Xt(c.start, c.end, e));
          continue;
        }
        const u = c.start + (c.end - c.start) * e;
        c.isTransform && c.transformFn ? (Wt(n, c.transformStoreKey ?? c.transformFn, {
          value: u,
          unit: c.unit,
          fn: c.transformFn
        }), d = !0) : t === 1 && c.snapEnd !== void 0 ? n.style[a] = c.snapEnd : c.apply(n, { num: u, unit: c.unit });
      }
      d && (n.style.transform = Gt(n));
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
class ee {
  constructor(s, t = !0) {
    h(this, "animatable");
    h(this, "elapsed", 0);
    // giây, luôn trong [0, duration]
    h(this, "rate", 1);
    // 1 = xuôi, -1 = ngược
    h(this, "running", !1);
    h(this, "listeners", {});
    h(this, "tick", (s, t) => {
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
    return this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, (t = (s = this.animatable).onStart) == null || t.call(s), v.add(this.tick), this.emit("start"), this);
  }
  reverse() {
    var s, t;
    return this.rate = -1, this.running || (this.running = !0, (t = (s = this.animatable).onStart) == null || t.call(s), v.add(this.tick)), this;
  }
  pause() {
    return this.running ? (this.running = !1, v.remove(this.tick), this) : this;
  }
  stop() {
    var s, t;
    this.running = !1, v.remove(this.tick), (t = (s = this.animatable).onComplete) == null || t.call(s);
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
  get duration() {
    return this.animatable.duration;
  }
  get isRunning() {
    return this.running;
  }
}
function tt(i) {
  if (i === "top") return 0;
  if (i === "center") return 0.5;
  if (i === "bottom") return 1;
  const s = i.match(/^(-?[\d.]+)%$/);
  return s ? parseFloat(s[1]) / 100 : (console.warn(`[six-js] onScroll: unknown position "${i}", using "top"`), 0);
}
function et(i, s, t) {
  const e = i.match(/^([+-]=)(\d+(\.\d+)?)$/);
  if (e) {
    if (t === void 0)
      return console.warn(`[six-js] onScroll: "${i}" has nothing to be relative to`), 0;
    const c = e[1] === "+=" ? 1 : -1;
    return t + c * parseFloat(e[2]);
  }
  const [n = "top", r = "top"] = i.trim().split(/\s+/), o = s.getBoundingClientRect(), l = window.scrollY + o.top + o.height * tt(n), a = window.innerHeight * tt(r);
  return l - a;
}
class ie {
  constructor(s, t, e) {
    h(this, "triggerEl");
    h(this, "playable");
    h(this, "options");
    h(this, "startY", 0);
    h(this, "endY", 0);
    h(this, "smoothedProgress", 0);
    h(this, "wasInside", !1);
    h(this, "lastScrollY", window.scrollY);
    h(this, "rafPending", !1);
    h(this, "pinSpacer", null);
    h(this, "pinned", !1);
    h(this, "pinOriginalStyles", null);
    h(this, "startMarker", null);
    h(this, "endMarker", null);
    h(this, "onScrollBound", () => this.requestUpdate());
    h(this, "onResizeBound", () => this.recalc());
    h(this, "tickerBound", (s, t) => this.tickSmooth(t));
    this.triggerEl = s, this.playable = t, this.options = e, this.recalc(), e.debug && this.setupDebugMarkers(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), typeof e.sync == "number" && v.add(this.tickerBound), this.update();
  }
  recalc() {
    const s = this.options.start ?? "top bottom", t = this.options.end ?? "bottom top";
    this.startY = et(s, this.triggerEl), this.endY = et(t, this.triggerEl, this.startY), this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.updateDebugMarkers();
  }
  computeProgress() {
    const s = window.scrollY;
    return Math.max(0, Math.min((s - this.startY) / (this.endY - this.startY), 1));
  }
  requestUpdate() {
    this.rafPending || (this.rafPending = !0, requestAnimationFrame(() => {
      this.rafPending = !1, this.update();
    }));
  }
  update() {
    var l, a, c, u, p, f, g, m;
    const s = window.scrollY, t = this.computeProgress(), e = s >= this.startY && s <= this.endY, n = s >= this.lastScrollY, r = e && !this.wasInside, o = !e && this.wasInside;
    r ? n ? (a = (l = this.options).onEnter) == null || a.call(l) : (u = (c = this.options).onEnterBack) == null || u.call(c) : o && (n ? (f = (p = this.options).onLeave) == null || f.call(p) : (m = (g = this.options).onLeaveBack) == null || m.call(g)), this.wasInside = e, this.lastScrollY = s, this.options.pin && this.updatePin(e);
    const d = this.options.sync ?? !1;
    d === !1 ? r && n && this.playable.restart() : d === !0 && this.playable.seek(t * this.playable.duration);
  }
  /**
   * sync (number) = số giây thực để "đuổi kịp" ~95% vị trí scroll thật, khớp đúng
   * ngữ nghĩa scrub number của GSAP. Dùng hằng số thời gian tau = lagSeconds/3 vì
   * exp(-3) ≈ 0.05 (đã bắt kịp 95%) đúng lúc t = lagSeconds.
   */
  tickSmooth(s) {
    if (typeof this.options.sync != "number") return;
    const t = this.computeProgress(), e = Math.max(0.05, this.options.sync), n = s / 1e3, r = 1 - Math.exp(-3 * n / e);
    this.smoothedProgress += (t - this.smoothedProgress) * r, Math.abs(t - this.smoothedProgress) < 5e-4 && (this.smoothedProgress = t), this.playable.seek(this.smoothedProgress * this.playable.duration);
  }
  updatePin(s) {
    s && !this.pinned ? this.pinElement() : !s && this.pinned && this.unpinElement();
  }
  pinElement() {
    var e;
    const s = this.triggerEl.getBoundingClientRect(), t = document.createElement("div");
    t.style.height = `${s.height}px`, t.style.width = `${s.width}px`, (e = this.triggerEl.parentElement) == null || e.insertBefore(t, this.triggerEl), this.pinSpacer = t, this.pinOriginalStyles = {
      position: this.triggerEl.style.position,
      top: this.triggerEl.style.top,
      left: this.triggerEl.style.left,
      width: this.triggerEl.style.width,
      zIndex: this.triggerEl.style.zIndex
    }, this.triggerEl.style.position = "fixed", this.triggerEl.style.top = "0px", this.triggerEl.style.left = `${s.left}px`, this.triggerEl.style.width = `${s.width}px`, this.triggerEl.style.zIndex = "10", this.pinned = !0;
  }
  unpinElement() {
    var s;
    this.pinOriginalStyles && (Object.assign(this.triggerEl.style, this.pinOriginalStyles), (s = this.pinSpacer) == null || s.remove(), this.pinSpacer = null, this.pinned = !1);
  }
  setupDebugMarkers() {
    this.startMarker = this.createMarkerLine("start", "#4ade80"), this.endMarker = this.createMarkerLine("end", "#f87171");
  }
  createMarkerLine(s, t) {
    const e = document.createElement("div");
    e.style.cssText = `
      position: absolute;
      left: 0;
      width: 100%;
      border-top: 2px dashed ${t};
      z-index: 999999;
      pointer-events: none;
    `;
    const n = document.createElement("span");
    return n.textContent = `${s} (six-js onScroll)`, n.style.cssText = `
      position: absolute;
      left: 0;
      top: -1px;
      transform: translateY(-100%);
      background: ${t};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `, e.appendChild(n), document.body.appendChild(e), e;
  }
  updateDebugMarkers() {
    this.startMarker && (this.startMarker.style.top = `${this.startY}px`), this.endMarker && (this.endMarker.style.top = `${this.endY}px`);
  }
  removeDebugMarkers() {
    var s, t;
    (s = this.startMarker) == null || s.remove(), (t = this.endMarker) == null || t.remove(), this.startMarker = null, this.endMarker = null;
  }
  destroy() {
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), v.remove(this.tickerBound), this.unpinElement(), this.removeDebugMarkers();
  }
}
const G = {
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
}, D = 180 / Math.PI;
function se(i) {
  const s = window.getComputedStyle(i).transform;
  return !s || s === "none" ? { ...G } : s.startsWith("matrix3d") ? re(s) : ne(s);
}
function ne(i) {
  const s = i.match(/matrix\(([^)]+)\)/);
  if (!s) return { ...G };
  const t = s[1].split(",").map((p) => parseFloat(p.trim())), [e, n, r, o, d, l] = t, a = Math.sqrt(e * e + n * n), c = Math.sqrt(r * r + o * o), u = Math.atan2(n, e) * D;
  return {
    x: d,
    y: l,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: a,
    scaleX: a,
    scaleY: c,
    skewX: 0,
    skewY: 0
  };
}
function re(i) {
  const s = i.match(/matrix3d\(([^)]+)\)/);
  if (!s) return { ...G };
  const t = s[1].split(",").map((b) => parseFloat(b.trim())), e = t[0], n = t[1], r = t[2], o = t[4], d = t[5], l = t[6];
  t[8], t[9];
  const a = t[10], c = t[12], u = t[13], p = t[14], f = Math.sqrt(e * e + n * n + r * r), g = Math.sqrt(o * o + d * d + l * l), m = Math.atan2(n, e) * D, x = Math.atan2(-r, Math.sqrt(l * l + a * a)) * D, S = Math.atan2(l, a) * D;
  return {
    x: c,
    y: u,
    z: p,
    rotate: m,
    rotateX: S,
    rotateY: x,
    rotateZ: m,
    scale: f,
    scaleX: f,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
function C(i, s, t, e = i) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: i,
    transformStoreKey: e,
    defaultUnit: s,
    getCurrent(n) {
      const r = Vt(n, e);
      return r ? { num: r.value, unit: r.unit } : { num: se(n)[t], unit: s };
    },
    apply() {
    }
  };
}
y("x", C("translateX", "px", "x"));
y("y", C("translateY", "px", "y"));
y("z", C("translateZ", "px", "z"));
y("translateX", C("translateX", "px", "x", "translateX-2"));
y("translateY", C("translateY", "px", "y", "translateY-2"));
y("rotate", C("rotate", "deg", "rotate"));
y("rotateX", C("rotateX", "deg", "rotateX"));
y("rotateY", C("rotateY", "deg", "rotateY"));
y("rotateZ", C("rotateZ", "deg", "rotateZ"));
y("scale", C("scale", "", "scale"));
y("scaleX", C("scaleX", "", "scaleX"));
y("scaleY", C("scaleY", "", "scaleY"));
y("skewX", C("skewX", "deg", "skewX"));
y("skewY", C("skewY", "deg", "skewY"));
function w(i, s) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: s,
    getCurrent(t) {
      const e = window.getComputedStyle(t)[i];
      return I(e, s);
    },
    apply(t, e) {
      t.style[i] = `${e.num}${e.unit}`;
    }
  };
}
y("width", w("width", "px"));
y("height", w("height", "px"));
y("top", w("top", "px"));
y("left", w("left", "px"));
y("right", w("right", "px"));
y("bottom", w("bottom", "px"));
y("borderRadius", w("borderRadius", "px"));
y("borderWidth", w("borderWidth", "px"));
y("opacity", w("opacity", ""));
y("fontSize", w("fontSize", "px"));
y("letterSpacing", w("letterSpacing", "px"));
function O(i) {
  return {
    type: "color",
    cssKey: i,
    getCurrent(s) {
      const t = window.getComputedStyle(s)[i];
      return at(t);
    },
    apply(s, t) {
      s.style[i] = Nt(t);
    }
  };
}
y("backgroundColor", O("backgroundColor"));
y("color", O("color"));
y("borderColor", O("borderColor"));
y("background", O("backgroundColor"));
function oe(i) {
  return {
    type: "discrete",
    cssKey: i,
    apply(s, t) {
      s.style[i] = t;
    }
  };
}
const ae = [
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
ae.forEach((i) => y(i, oe(i)));
function lt(i) {
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
y("boxShadow", lt("boxShadow"));
y("filter", lt("filter"));
ut();
let it = !1;
function le() {
  it || (Rt(), it = !0);
}
function he(i) {
  return typeof i == "string" ? document.querySelector(i) : Array.isArray(i) ? i[0] ?? null : i;
}
function j(i, s, t, e) {
  const { onScroll: n, ...r } = s, o = new te(i, r, t, e), d = new ee(o, !n);
  if (n) {
    const l = he(n.target ?? i);
    l ? new ie(l, d, n) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return d;
}
function ce(i, s) {
  return j(i, s, "to");
}
function de(i, s) {
  return j(i, s, "from");
}
function ue(i, s, t) {
  return j(i, t, "fromTo", s);
}
const fe = {
  initElement: le,
  to: ce,
  from: de,
  fromTo: ue,
  setDefault: Zt
};
export {
  dt as VERSION,
  fe as six
};
