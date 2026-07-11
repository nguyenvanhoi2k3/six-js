var Yt = Object.defineProperty;
var _t = (s, e, t) => e in s ? Yt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var c = (s, e, t) => _t(s, typeof e != "symbol" ? e + "" : e, t);
const qt = "0.0.31";
let pt = !1;
function Nt() {
  pt || (pt = !0, console.log(
    ` SixJS v${qt}`
  ));
}
function N(s) {
  return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? (s -= 1.5 / 2.75, 7.5625 * s * s + 0.75) : s < 2.5 / 2.75 ? (s -= 2.25 / 2.75, 7.5625 * s * s + 0.9375) : (s -= 2.625 / 2.75, 7.5625 * s * s + 0.984375);
}
const O = 1.70158, W = O * 1.525, $ = {
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
  backIn: (s) => (O + 1) * s * s * s - O * s * s,
  backOut: (s) => (s--, 1 + (O + 1) * s * s * s + O * s * s),
  backInOut: (s) => {
    if (s < 0.5) {
      const t = 2 * s;
      return t * t * ((W + 1) * t - W) / 2;
    }
    const e = 2 * s - 2;
    return (e * e * ((W + 1) * e + W) + 2) / 2;
  },
  bounceIn: (s) => 1 - N(1 - s),
  bounceOut: N,
  bounceInOut: (s) => s < 0.5 ? (1 - N(1 - 2 * s)) / 2 : (1 + N(2 * s - 1)) / 2
}, nt = /* @__PURE__ */ new WeakMap();
let K = [], Z = null;
function ft(s, e) {
  K.push({ instance: s, type: e }), Z === null && (Z = requestAnimationFrame(Wt));
}
function Wt() {
  const s = K.slice();
  K.length = 0, Z = null;
  for (let e = 0; e < s.length; e++) {
    const { instance: t, type: i } = s[e];
    i === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let j = null;
function Rt() {
  return typeof window > "u" ? null : (j || (j = new IntersectionObserver(
    (s) => {
      for (let e = 0; e < s.length; e++) {
        const t = s[e], i = nt.get(t.target);
        i && (t.isIntersecting ? ft(i, "enter") : ft(i, "leave"));
      }
    },
    { threshold: 0.05 }
  )), j);
}
function It(s, e) {
  var t;
  nt.set(s, e), (t = Rt()) == null || t.observe(s);
}
function Q(s) {
  var e;
  nt.delete(s), (e = Rt()) == null || e.unobserve(s);
}
function Y(s, e) {
  if (s == null) return e;
  const t = s.trim();
  if (!t) return e;
  const i = Number(t);
  return Number.isFinite(i) ? i * 1e3 : e;
}
const E = class E extends HTMLElement {
  constructor() {
    super(...arguments);
    c(this, "animation");
    c(this, "options");
    c(this, "order", E.counter++);
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
    if (this.options = this.getOptions(), E.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), It(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), Q(this), E.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || Q(this), this.isGroup ? (E.groupQueue.add(this), E.scheduleGroup()) : this.play();
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
    }, r = this.getAttribute("type") ?? "fade-up", n = this.getAttribute("easing"), [o, l] = i[r] ?? i["fade-up"];
    return {
      x: o,
      y: l,
      easing: n && n in $ ? n : "strongInOut",
      duration: Y(this.getAttribute("duration"), 400),
      delay: Y(this.getAttribute("delay"), 0)
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
    const { x: i, y: r, easing: n, duration: o, delay: l } = this.options;
    (a = this.animation) == null || a.cancel(), this.animation = this.animate(
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
        delay: l + t,
        easing: n,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var h;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (h = this.animation) == null || h.cancel(), this.animation = void 0;
    };
  }
};
c(E, "counter", 0), c(E, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), c(E, "groupQueue", /* @__PURE__ */ new Set()), c(E, "isProcessingGroup", !1);
let J = E;
function Ht() {
  customElements.get("sx-animate") || customElements.define("sx-animate", J);
}
class Vt {
  constructor() {
    c(this, "_listeners", /* @__PURE__ */ new Set());
    c(this, "_time", 0);
    c(this, "_delta", 0);
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
const k = new Vt();
class Xt extends HTMLElement {
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
    c(this, "updateAnimation", (t, i) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const r = i / 1e3, n = this.speed * r, o = this.direction, a = this.isVertical ? this.offsetHeight : this.offsetWidth;
      o === "left" || o === "up" ? (this.offset -= n, this.clone ? this.offset <= -this.cachedResetBounds && (this.offset += this.cachedResetBounds) : this.offset <= -this.cachedResetBounds && (this.offset = a)) : (this.offset += n, this.clone ? this.offset >= 0 && (this.offset -= this.cachedResetBounds) : this.offset >= a && (this.offset = -this.cachedResetBounds)), this.applyTransform(this.offset);
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
    }), this.resizeObserver.observe(this), It(this, {
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
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), Q(this), k.remove(this.updateAnimation);
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
          const l = o < n ? Math.ceil(n * 2 / o) : 2, a = document.createDocumentFragment();
          for (let h = 1; h < l; h++)
            for (const d of i) {
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
    let i = 0;
    const r = this.isVertical;
    for (let o = 0; o < t.length; o++)
      i += r ? t[o].offsetHeight : t[o].offsetWidth;
    const n = parseFloat(getComputedStyle(this.inner).gap) || 0;
    i += n * t.length, this.cachedResetBounds = i;
  }
  applyTransform(t) {
    this.inner && (this.isVertical ? this.inner.style.transform = `translate3d(0,${t}px,0)` : this.inner.style.transform = `translate3d(${t}px,0,0)`);
  }
}
class Gt extends HTMLElement {
}
class jt extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function Ut() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Xt), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", Gt), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", jt);
}
class Kt extends HTMLElement {
  constructor() {
    super();
  }
}
class Zt {
  constructor() {
    c(this, "sliders", /* @__PURE__ */ new Map());
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
const D = new Zt();
class Qt extends HTMLElement {
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
    const i = t.target;
    if (i.classList.contains("sx-slider-pagination-bullet")) {
      const r = Number(i.getAttribute("data-index"));
      this.goToSlide(r);
    }
  }
  goToSlide(t) {
    const i = this.getAttribute("name");
    let r = null;
    i ? r = D.get(i) : r = this.closest("sx-slider"), r && typeof r.goTo == "function" && r.goTo(t);
  }
  renderBullets(t) {
    const i = this.getAttribute("effect"), r = i === "dynamic", n = i === "snake", o = i === "fraction", l = t.join(",") + `_effect:${i}`;
    if (this.renderedSignature === l) return;
    if (this.renderedSignature = l, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const h = document.createElement("span");
      h.className = "sx-slider-pagination-current", h.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(h), p.appendChild(d), p.appendChild(u), this.appendChild(p);
      return;
    }
    const a = document.createDocumentFragment();
    if (n) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((h, d) => {
        const u = this.createBulletDOM(h, d, !1);
        this.cachedBullets.push(u), a.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", a.appendChild(this.snakeBar), this.appendChild(a);
      return;
    }
    if (r) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", a.appendChild(this.innerContainer), t.forEach((h, d) => {
        const u = this.createBulletDOM(h, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(a);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((h, d) => {
      const u = this.createBulletDOM(h, d, i === "number");
      this.cachedBullets.push(u), a.appendChild(u);
    }), this.appendChild(a);
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
    const r = i === "dynamic", n = i === "snake", o = this.cachedBullets, l = o.length;
    if (l === 0) return;
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
    if (!r || l <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let a = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    a = Math.min(a, l - this.maxVisibleBullets);
    const h = a + this.maxVisibleBullets - 1;
    o.forEach((u, p) => {
      p >= a && p <= h ? p === a ? u.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === a + 1 ? u.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === h ? u.classList.add(
        p === l - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === h - 1 ? u.classList.add(
        p === l - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -a * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${d}px)`;
  }
}
class Jt extends HTMLElement {
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
      const t = D.get(e);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class te extends HTMLElement {
  constructor() {
    super();
    c(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, i, r) {
    const n = Math.max(0, Math.min(1, t));
    this.bar.style.transition = r || "none", i === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${n})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${n})`);
  }
}
class ee extends HTMLElement {
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
      const t = D.get(e);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class ie {
  constructor(e, t, i = 0.92) {
    c(this, "velocity", 0);
    c(this, "friction");
    c(this, "onUpdate");
    c(this, "onComplete");
    c(this, "isRunning", !1);
    c(this, "tickerCallback");
    this.onUpdate = e, this.onComplete = t, this.friction = i, this.tickerCallback = (r, n, o) => this.loop(n);
  }
  setFriction(e) {
    this.friction = e;
  }
  addVelocity(e) {
    this.velocity += e, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, k.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, k.add(this.tickerCallback));
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
class se extends HTMLElement {
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
        const { max: i, min: r } = this.sliderCha.getBoundaries(), n = Math.max(
          r,
          Math.min(i, this.currentTranslate)
        );
        n !== this.currentTranslate && this.startMomentumScroll(n, 400);
      }
      this.sliderCha.startAutoplay();
    });
    c(this, "wheelInertia", new ie(
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
      const { max: l, min: a } = this.sliderCha.getBoundaries(), h = this.sliderCha.options.edgeResistance;
      o > l ? o = h <= 0 ? l : l + Math.min(h, (o - l) * 0.3) : o < a && (o = h <= 0 ? a : a - Math.min(h, (a - o) * 0.3)), this.currentTranslate = o;
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
        const l = this.sliderCha.getCurrentIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(l) : l * this.sliderCha.getSlideSizeWithGap();
        const h = this.children[l];
        let d = t.autoSize ? (h ? h.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          n = o + u / 2 - (a + d / 2);
        } else
          n = o - a;
        if (!t.loop) {
          const { max: u, min: p } = this.sliderCha.getBoundaries();
          n = Math.max(p, Math.min(u, n));
        }
      }
      if (t.loop)
        this.startMomentumScroll(n);
      else {
        const { max: o, min: l } = this.sliderCha.getBoundaries(), a = Math.max(
          l,
          Math.min(o, n)
        );
        this.startMomentumScroll(a);
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
    var l;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = n;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = i ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (l = this.sliderCha) != null && l.options.loop && this.checkLoopBoundsInstant(), r && r();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, k.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const i = performance.now() - this.scrollStartTime, r = Math.min(i / this.scrollDuration, 1), n = 1 - Math.pow(1 - r, 4), l = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * n - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += l, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: h } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < h) {
        if (this.currentTranslate > a) {
          if (d <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + d) {
            this.currentTranslate = a + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < h) {
          if (d <= 0) {
            this.currentTranslate = h, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < h - d) {
            this.currentTranslate = h - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(h, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(l) < 1) {
          const p = this.currentTranslate > a ? a : h;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    r >= 1 && Math.abs(l) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, k.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, k.remove(this.scrollTickerCallback);
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
    let l = 0;
    if (this.sliderCha.options.centered) {
      const m = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let y = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), b = this.children[i];
        y = b ? b.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        y = this.sliderCha.getSlideSizeWithGap();
      l = m / 2 - y / 2;
    }
    const a = -o + r + l, h = a - n;
    let d = !1, u = this.currentTranslate, p = 0, f = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + g ? (u = this.currentTranslate - n, p = -n, f = t, d = !0) : this.currentTranslate <= h - g && (u = this.currentTranslate + n, p = n, f = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
      this.sliderCha.getCurrentIndex() + f
    ), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (this.style.transform = `${this.sliderCha.transformFn}(${t}px)`, this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const i = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${i.speed}ms ease-out, height ${i.speed}ms ease-out`;
    const r = parseFloat(this.sliderCha.startPadding) || 0, n = this.sliderCha.getCurrentIndex();
    let o = r, l = 0, a = 0;
    if (i.autoSize) {
      l = this.sliderCha.getOffsetForIndex(n);
      const h = Array.from(this.children), d = this.sliderCha.convertToPx(i.gap);
      a = h[n] ? h[n].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const h = this.sliderCha.getSlideSizeWithGap();
      l = n * h, a = h;
    }
    if (i.centered) {
      const h = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += h / 2 - (l + a / 2);
    } else
      o -= l;
    if (!i.loop) {
      const { max: h, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(h, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, i.loop) {
      const h = this.sliderCha.originalSlidesCount, d = i.autoSize ? h : i.perView;
      (n >= d + h || n < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, i.speed);
    }
  }
}
class gt {
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
    const n = Object.keys(i).map(Number).sort((o, l) => o - l);
    for (const o of n)
      if (e >= o) {
        const l = this.kebabToCamel(i[o]);
        r = { ...r, ...l };
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
class ne extends HTMLElement {
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
  updateProgress(t, i) {
    let r = 0, n = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const h = this.originalSlidesCount;
      if (h > 0 && this.track) {
        const d = this.options.autoSize ? h : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let p = 0, f = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(d), f = this.getOffsetForIndex(d + h) - p;
        else {
          const g = this.getSlideSizeWithGap();
          p = d * g, f = h * g;
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
      const { max: h, min: d } = this.getBoundaries(), u = h - d;
      u > 0 ? (r = (h - t) / u, n = o / (u + o)) : (r = 1, n = 1);
    }
    n = Math.max(0, Math.min(1, n));
    const l = n + r * (1 - n);
    let a = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const h = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      a = [.../* @__PURE__ */ new Set([...a, ...h])];
    }
    a.forEach((h) => {
      typeof h.update == "function" && h.update(l, this.options.direction, i);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && D.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
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
        const l = r.target.closest("sx-slider-slide");
        if (!l) return;
        const a = l.getAttribute("data-real-index");
        if (a !== null) {
          const h = parseInt(a, 10);
          this.goTo(h, !0);
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
    ), this.options.name && D.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (f) => f ? isNaN(Number(f)) ? f : `${f}px` : "0px", i = this.getAttribute("edge-resistance"), r = i !== null ? Number(i) : 100, n = this.getAttribute("interval"), o = Y(n, 4e3), l = this.getAttribute("start-index"), a = l !== null ? Number(l) : 0, h = this.getAttribute("per-move");
    let d = "auto";
    if (h !== null && h !== "auto") {
      const f = Number(h);
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
      speed: Y(this.getAttribute("speed"), 300),
      rightPadding: t(this.getAttribute("right-padding")),
      leftPadding: t(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(r) ? 0 : r,
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
      effect: p,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = gt.parse(
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
      const l = i[i.length - 1 - n].cloneNode(!0);
      l.setAttribute("data-clone", "prev"), this.track.insertBefore(l, this.track.firstChild);
    }
    for (let n = 0; n < r; n++) {
      const l = i[n].cloneNode(!0);
      l.setAttribute("data-clone", "next"), this.track.appendChild(l);
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
      this.options = gt.getMatch(
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
    const o = this.getAttribute("left-padding"), l = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === n && o && parseFloat(o) > 0 && l && parseFloat(l) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(l));
    const a = this.convertToPx(this.options.gap), h = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      i.forEach((f) => {
        f.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, i.forEach((f) => {
        const g = f.firstElementChild;
        g ? f.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : f.style[this.sizeDim] = "max-content", f.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - h - d - a * (this.options.perView - 1)) / this.options.perView;
      i.forEach((y) => {
        y.style[this.sizeDim] = `${m}px`, y.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const p = i.filter((f) => !f.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let f = 0;
      p.forEach((g) => {
        f += this.getRectSize(g) + a;
      }), f -= a, u = f < t;
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
    for (let l = 0; l < o.length && (i += this.getRectSize(o[l]) + n, !(i - n > t)); l++)
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
    let o = 0, l = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let a = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + r : this.getSlideSizeWithGap();
      o = i + t / 2 - a / 2;
      let h = n - 1, d = this.options.autoSize ? this.getOffsetForIndex(h) : h * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[h] ? this.getRectSize(this.track.children[h]) : 0) + r : this.getSlideSizeWithGap();
      l = i + t / 2 - (d + u / 2);
    }
    return { max: o, min: Math.min(o, l) };
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
    }, l = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = o(this.currentIndex);
    this.lastFiredIndex !== a && (this.lastFiredIndex = a, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: a }
      })
    ));
    const h = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + l), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let f = null;
    p && (f = document.createElement("style"), f.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(f), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((b, v) => {
      b.removeAttribute("sx-slide-active"), b.removeAttribute("sx-slide-prev"), b.removeAttribute("sx-slide-next"), b.removeAttribute("sx-slide-center");
      let C = o(v);
      b.setAttribute("aria-label", `${C + 1}/${r}`), C === a && b.setAttribute("sx-slide-active", ""), C === h && b.setAttribute("sx-slide-prev", ""), C === d && b.setAttribute("sx-slide-next", ""), C === u && b.setAttribute("sx-slide-center", "");
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
    let S = y.indexOf(a);
    if (S === -1) {
      for (let b = y.length - 1; b >= 0; b--)
        if (a >= y[b]) {
          S = b;
          break;
        }
    }
    this.updatePagination(y, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((v) => v.trim()).forEach((v) => {
      const C = D.get(v);
      C && C.syncFromController(a);
    }), p && f && requestAnimationFrame(() => {
      f == null || f.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const i = this.options.loop, r = Array.from(this.track.children), n = this.track.querySelectorAll("[data-clone]").length, o = i ? this.originalSlidesCount : r.length - n;
    if (((a) => {
      if (!i) return a;
      const h = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (a - h) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (i) {
        const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView, h = t + a, d = this.originalSlidesCount, u = r.length;
        let p = h, f = Math.abs(h - this.currentIndex);
        [h - d, h, h + d].forEach((m) => {
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
    for (let a = 0; a < i; a++) {
      let h = n + a;
      this.options.loop && (h < 0 ? h = t.length + h : h >= t.length && (h = h % t.length));
      const d = t[h];
      if (d) {
        const u = d.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const p = u.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let l = 0;
    o.forEach((a) => {
      const h = a.firstElementChild, d = h ? h.getBoundingClientRect().height : a.getBoundingClientRect().height;
      d > l && (l = d);
    }), o.forEach((a) => {
      var h;
      (h = this.track) == null || h.removeChild(a);
    }), l > 0 && (this.track.style.height = `${l}px`);
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
      let n = this.options.autoSize ? this.getOffsetForIndex(r) : r * this.getSlideSizeWithGap(), o = this.options.autoSize ? this.getRectSize(this.track.children[r]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), l = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const a = this.getBoundingClientRect()[this.sizeDim];
        l += a / 2 - (n + o / 2);
      } else
        l -= n;
      if (l <= i + 1)
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
        const r = this.options.autoSize ? this.originalSlidesCount : this.options.perView, n = t + r, o = this.originalSlidesCount, l = this.track.children.length;
        let a = n, h = Math.abs(n - this.currentIndex);
        [n - o, n, n + o].forEach((u) => {
          if (u >= 0 && u < l) {
            const p = Math.abs(u - this.currentIndex);
            p < h && (h = p, a = u);
          }
        }), this.currentIndex = a;
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
    let l = 0, a = 1 / 0;
    const h = this.currentIndex;
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
      g < a - 0.5 ? (a = g, l = d) : Math.abs(g - a) <= 0.5 && Math.abs(d - h) < Math.abs(l - h) && (l = d, a = g);
    }
    if (this.currentIndex = l, !this.options.loop) {
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
function re() {
  customElements.get("sx-slider") || customElements.define("sx-slider", ne), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", se), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", Kt), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", te), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", ee), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Qt), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", Jt);
}
const z = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class oe extends HTMLElement {
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
    return Y(t, z.duration);
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
    let i = this.parentElement;
    for (; i && (Array.from(i.children).forEach((r) => {
      r !== this && !r.contains(this) && (t ? (r.setAttribute("inert", ""), r.setAttribute("aria-hidden", "true")) : (r.removeAttribute("inert"), r.removeAttribute("aria-hidden")));
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
  render() {
    this.style.setProperty("--sx-duration", `${this.duration}ms`);
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
    `, this.backdropEl = this.querySelector(".sx-dialog-backdrop"), this.dialogCoreEl = this.querySelector(".sx-dialog-core"), this.backdropEl && this.backdropEl.addEventListener("click", this.handleBackdropClick);
  }
}
class ae extends HTMLElement {
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
function le() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", oe), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", ae);
}
function he() {
  Ut(), Ht(), re(), le();
}
const Pt = /* @__PURE__ */ new Map();
function x(s, e) {
  Pt.set(s, e);
}
function H(s, e) {
  const t = Pt.get(s);
  return t ? typeof t == "function" ? t(e) : t : s.startsWith("--") ? ce(s, e) : de(s, e);
}
function ce(s, e) {
  return typeof e == "string" && !zt(e) ? {
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
      return i || console.warn(`[six-js] CSS variable "${s}" not set, defaulting to 0`), F(i);
    },
    apply(t, i) {
      t.style.setProperty(s, `${i.num}${i.unit}`);
    }
  };
}
function zt(s) {
  return /^-?[\d.]+[a-z%]*$/i.test(s.trim());
}
function de(s, e) {
  return typeof e == "string" && !zt(e) ? {
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
      return i === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${s}"`), { num: 0, unit: "" }) : F(i);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
function F(s, e = "") {
  if (typeof s == "number")
    return { num: s, unit: e };
  if (typeof s != "string" || s.length === 0)
    return { num: 0, unit: e };
  const t = s.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || e } : { num: parseFloat(s) || 0, unit: e };
}
const ue = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function pe(s, e, t, i) {
  if (typeof s != "string")
    return F(s, i);
  const r = s.match(ue);
  if (!r)
    return F(s, i);
  const [, n, o, l] = r, a = parseFloat(o), h = l || t || i;
  if (isNaN(a))
    return console.warn(`[six-js] Invalid relative value: "${s}"`), { num: e, unit: h };
  if (n === "/" && a === 0)
    return console.warn(`[six-js] Division by zero: "${s}"`), { num: e, unit: h };
  let d;
  switch (n) {
    case "+":
      d = e + a;
      break;
    case "-":
      d = e - a;
      break;
    case "*":
      d = e * a;
      break;
    case "/":
      d = e / a;
      break;
    default:
      d = e;
  }
  return { num: d, unit: h };
}
const fe = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function mt(s) {
  const e = document.createElement("span");
  e.style.color = s, e.style.display = "none", document.body.appendChild(e);
  const t = window.getComputedStyle(e).color;
  return document.body.removeChild(e), Lt(t);
}
function Lt(s) {
  const e = s.match(fe);
  return e ? {
    r: parseFloat(e[1]),
    g: parseFloat(e[2]),
    b: parseFloat(e[3]),
    a: e[4] !== void 0 ? parseFloat(e[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function ge(s, e, t) {
  return {
    r: s.r + (e.r - s.r) * t,
    g: s.g + (e.g - s.g) * t,
    b: s.b + (e.b - s.b) * t,
    a: s.a + (e.a - s.a) * t
  };
}
function me(s) {
  return `rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a})`;
}
const tt = /-?[\d.]+/g;
function bt(s) {
  return (s.match(tt) || []).length;
}
function be(s, e, t) {
  const i = bt(s), r = bt(e), n = i === r && r > 0;
  return n || console.warn(`[six-js] "${t}": shape mismatch (${i} vs ${r} numbers), will snap instead of interpolate`), n;
}
function ye(s, e, t) {
  const i = (s.match(tt) || []).map(Number);
  let r = 0;
  return e.replace(tt, (n) => {
    const o = parseFloat(n), l = i[r] ?? o;
    r++;
    const a = l + (o - l) * t;
    return String(Math.round(a * 1e3) / 1e3);
  });
}
const rt = {
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
}, V = 180 / Math.PI;
function xe(s) {
  const e = window.getComputedStyle(s).transform;
  return !e || e === "none" ? { ...rt } : e.startsWith("matrix3d") ? ve(e) : Se(e);
}
function Se(s) {
  const e = s.match(/matrix\(([^)]+)\)/);
  if (!e) return { ...rt };
  const t = e[1].split(",").map((p) => parseFloat(p.trim())), [i, r, n, o, l, a] = t, h = Math.sqrt(i * i + r * r), d = Math.sqrt(n * n + o * o), u = Math.atan2(r, i) * V;
  return {
    x: l,
    y: a,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: h,
    scaleX: h,
    scaleY: d,
    skewX: 0,
    skewY: 0
  };
}
function ve(s) {
  const e = s.match(/matrix3d\(([^)]+)\)/);
  if (!e) return { ...rt };
  const t = e[1].split(",").map((b) => parseFloat(b.trim())), i = t[0], r = t[1], n = t[2], o = t[4], l = t[5], a = t[6];
  t[8], t[9];
  const h = t[10], d = t[12], u = t[13], p = t[14], f = Math.sqrt(i * i + r * r + n * n), g = Math.sqrt(o * o + l * l + a * a), m = Math.atan2(r, i) * V, y = Math.atan2(-n, Math.sqrt(a * a + h * h)) * V, S = Math.atan2(a, h) * V;
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
const Ce = {
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
}, yt = /* @__PURE__ */ new WeakMap();
function we(s) {
  const e = xe(s);
  return {
    ...Ce,
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
function ot(s) {
  let e = yt.get(s);
  return e || (e = we(s), yt.set(s, e)), e;
}
function ke(s, e) {
  return ot(s)[e];
}
function Bt(s, e, t) {
  ot(s)[e] = t;
}
function Te(s) {
  const e = ot(s);
  return `translate(${e.xPercent}%, ${e.yPercent}%) translate3d(${e.x}px, ${e.y}px, ${e.z}px) rotate(${e.rotate}deg) rotateX(${e.rotateX}deg) rotateY(${e.rotateY}deg) rotateZ(${e.rotateZ}deg) scale(${e.scale}) scaleX(${e.scaleX}) scaleY(${e.scaleY}) skewX(${e.skewX}deg) skewY(${e.skewY}deg)`;
}
function Dt(s, e, t) {
  const i = s.style[e];
  s.style[e] = t;
  const r = parseFloat(window.getComputedStyle(s)[e]) || 0;
  return s.style[e] = i, r;
}
const Ee = /^random\((.+)\)$/i;
function Ae(s) {
  return /^-?[\d.]+$/.test(s.trim());
}
function Me(s) {
  const e = s.match(Ee);
  if (!e) return s;
  const t = e[1].split(",").map((i) => i.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${s}"`), s;
  if (t.length === 2 && t.every(Ae)) {
    const i = parseFloat(t[0]), r = parseFloat(t[1]);
    return i + Math.random() * (r - i);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function L(s, e, t) {
  let i = s;
  return typeof i == "function" && (i = i(e, t)), typeof i == "string" && (i = Me(i)), i;
}
let et = {};
function Re(s) {
  et = { ...et, ...s };
}
function xt() {
  return et;
}
function St(s, e, t) {
  return !e || !t.unit || t.unit === "px" ? t : { num: Dt(s, e === "x" ? "left" : "top", `${t.num}${t.unit}`), unit: "px" };
}
class at {
  constructor(e, t, i = "to", r) {
    c(this, "duration");
    c(this, "targets");
    c(this, "targetTracks", []);
    c(this, "pointWindows", []);
    c(this, "activeWindows", /* @__PURE__ */ new Set());
    c(this, "implicitRefreshers", []);
    if (typeof e == "string" ? this.targets = Array.from(document.querySelectorAll(e)) : Array.isArray(e) ? this.targets = e.filter((n) => n != null) : this.targets = e ? [e] : [], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${e}"`), t.keyframes) {
      const n = Object.keys(t).filter((l) => l !== "duration" && l !== "ease" && l !== "keyframes");
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
    return e && !$[e] && console.warn(`[six-js] Unknown ease "${e}", falling back to linear`), e && $[e] || $.linear;
  }
  resolveDuration(e, t) {
    let i = e ?? t.duration ?? 0.5;
    return i < 0 && (console.warn(`[six-js] Negative duration (${i}), using 0 instead`), i = 0), i;
  }
  resolveProp(e, t, i, r) {
    const n = H(t, r ?? i);
    if (n.type === "discrete") {
      const h = String(r ?? i);
      return {
        key: t,
        isTransform: !1,
        state: { kind: "discrete", value: h, apply: n.apply }
      };
    }
    if (n.type === "color") {
      const h = i !== void 0 ? mt(String(i)) : n.getCurrent(e), d = r !== void 0 ? mt(String(r)) : n.getCurrent(e);
      return { key: t, isTransform: !1, state: { kind: "color", start: h, end: d, apply: n.apply } };
    }
    if (n.type === "complex") {
      const h = i !== void 0 ? String(i) : n.getCurrent(e), d = r !== void 0 ? String(r) : n.getCurrent(e);
      return be(h, d, t), { key: t, isTransform: !1, state: { kind: "complex", start: h, end: d, apply: n.apply } };
    }
    let o = i !== void 0 ? F(i, n.defaultUnit) : n.getCurrent(e, t), l = r !== void 0 ? pe(r, o.num, o.unit, n.defaultUnit) : n.getCurrent(e, t), a;
    if (n.pxAxis && (o = St(e, n.pxAxis, o), l = St(e, n.pxAxis, l)), !n.isTransform && l.unit && o.unit && l.unit !== o.unit) {
      const h = Dt(e, t, `${l.num}${l.unit}`);
      a = `${l.num}${l.unit}`, l = { num: h, unit: o.unit };
    }
    return {
      key: t,
      isTransform: n.isTransform,
      state: {
        kind: "numeric",
        start: o.num,
        end: l.num,
        unit: l.unit || o.unit,
        isTransform: n.isTransform,
        transformFn: n.transformFn,
        apply: n.apply,
        snapEnd: a
      }
    };
  }
  registerImplicitRefresh(e, t, i, r, n) {
    if (n.kind === "discrete") return;
    const o = H(t, r ?? i);
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
    const r = xt(), n = this.resolveDuration(e.duration, r), o = this.resolveEase(e.ease ?? r.ease), l = /* @__PURE__ */ new Set();
    for (const h in e) l.add(h);
    if (i) for (const h in i) l.add(h);
    l.delete("duration"), l.delete("ease"), l.delete("keyframes");
    const a = this.targets.map(() => []);
    return this.targets.forEach((h, d) => {
      for (const u of l) {
        let p, f;
        t === "to" ? f = L(e[u], d, h) : t === "from" ? p = L(e[u], d, h) : (u in e && (f = L(e[u], d, h)), i && u in i && (p = L(i[u], d, h)));
        const g = H(u, f ?? p);
        if (g.type === "discrete") {
          const y = { kind: "discrete", value: String(f ?? p), apply: g.apply };
          a[d].push({ key: u, isTransform: !1, entries: [{ startTime: 0, endTime: n, easeFn: o, state: y }] });
          continue;
        }
        const m = this.resolveProp(h, u, p, f);
        m && (a[d].push({
          key: m.key,
          isTransform: m.isTransform,
          entries: [{ startTime: 0, endTime: n, easeFn: o, state: m.state }]
        }), this.registerImplicitRefresh(h, u, p, f, m.state));
      }
    }), { tracks: a, duration: n };
  }
  buildKeyframeTracks(e, t) {
    const i = xt(), r = t.duration, n = t.ease ?? i.ease, o = Array.isArray(e) ? this.normalizeArrayKeyframes(e, r, n, i) : this.normalizePercentKeyframes(e, r, n, i);
    o.length < 2 && console.warn(`[six-js] keyframes needs at least 2 points, got ${o.length}`);
    const l = this.targets.map(() => ({})), a = this.targets.map(() => []), h = this.targets.map(() => ({})), d = [];
    let u = 0, p = 0;
    for (let f = 0; f < o.length - 1; f++) {
      const g = o[f], m = o[f + 1], y = u + m.delay, S = y + m.duration;
      u = S, p = Math.max(p, S);
      const b = /* @__PURE__ */ new Set();
      for (const v in m.props) b.add(v);
      this.targets.forEach((v, C) => {
        for (const w of b) {
          const R = L(m.props[w], C, v), _ = w in g.props ? L(g.props[w], C, v) : w in l[C] ? l[C][w] : void 0, q = H(w, R);
          let I, A = !1;
          if (q.type === "discrete")
            I = { kind: "discrete", value: String(R), apply: q.apply };
          else {
            const G = this.resolveProp(v, w, _, R);
            if (!G) continue;
            I = G.state, A = G.isTransform;
          }
          l[C][w] = R, f === 0 && this.registerImplicitRefresh(v, w, _, R, I);
          const P = { startTime: y, endTime: S, easeFn: m.easeFn, state: I }, ut = h[C][w];
          ut !== void 0 ? a[C][ut].entries.push(P) : (h[C][w] = a[C].length, a[C].push({ key: w, isTransform: A, entries: [P] }));
        }
      }), d.push({
        startTime: y,
        endTime: S,
        onStart: m.onSegmentStart,
        onUpdate: m.onSegmentUpdate,
        onComplete: m.onSegmentComplete
      });
    }
    return { tracks: a, pointWindows: d, duration: p };
  }
  normalizeArrayKeyframes(e, t, i, r) {
    const n = [{ duration: 0, delay: 0, easeFn: $.linear, props: {} }], o = e.filter((h) => h.duration === void 0).length, l = e.reduce((h, d) => h + (d.duration ?? 0), 0), a = t !== void 0 ? o > 0 ? Math.max(0, t - l) / o : 0 : r.duration ?? 0.5;
    for (const h of e) {
      const { duration: d, ease: u, delay: p, onStart: f, onUpdate: g, onComplete: m, ...y } = h, S = this.resolveDuration(d ?? a, r), b = this.resolveEase(u ?? i);
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
    const n = this.resolveDuration(t, r), o = Object.entries(e).map(([a, h]) => {
      const d = a.trim().match(/^(-?[\d.]+)%$/);
      return d ? { pos: parseFloat(d[1]) / 100, props: h } : (console.warn(`[six-js] keyframes: invalid position "${a}", expected e.g. "50%"`), null);
    }).filter((a) => a !== null).sort((a, h) => a.pos - h.pos);
    o.length > 0 && o[0].pos !== 0 && console.warn(`[six-js] keyframes: first position should be "0%", got "${o[0].pos * 100}%"`);
    const l = [];
    for (let a = 0; a < o.length; a++) {
      const { ease: h, delay: d, onStart: u, onUpdate: p, onComplete: f, ...g } = o[a].props, m = a === 0 ? o[0].pos : o[a - 1].pos, y = a === 0 ? 0 : (o[a].pos - m) * n;
      l.push({
        duration: Math.max(0, y),
        delay: d ?? 0,
        easeFn: this.resolveEase(h ?? i),
        props: g,
        onSegmentStart: u,
        onSegmentUpdate: p,
        onSegmentComplete: f
      });
    }
    return l;
  }
  render(e) {
    this.targets.forEach((t, i) => {
      const r = this.targetTracks[i];
      let n = !1;
      for (const o of r) {
        const l = o.entries;
        let a = l[0];
        for (const g of l)
          if (g.startTime <= e) a = g;
          else break;
        const h = a.endTime - a.startTime, d = h <= 0 ? e >= a.startTime ? 1 : 0 : Math.min(Math.max((e - a.startTime) / h, 0), 1), u = a.easeFn(d), p = a.state;
        if (p.kind === "discrete") {
          e >= a.startTime && p.apply(t, p.value);
          continue;
        }
        if (p.kind === "color") {
          p.apply(t, ge(p.start, p.end, u));
          continue;
        }
        if (p.kind === "complex") {
          p.apply(t, ye(p.start, p.end, u));
          continue;
        }
        const f = p.start + (p.end - p.start) * u;
        p.isTransform && p.transformFn ? (Bt(t, p.transformFn, f), n = !0) : d === 1 && e >= a.endTime && p.snapEnd !== void 0 ? t.style[o.key] = p.snapEnd : p.apply(t, { num: f, unit: p.unit });
      }
      n && (t.style.transform = Te(t));
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
class it {
  constructor(e, t = {}) {
    c(this, "animatable");
    c(this, "elapsed", 0);
    c(this, "rate", 1);
    c(this, "running", !1);
    c(this, "dead", !1);
    c(this, "listeners", {});
    c(this, "delay");
    c(this, "repeat");
    c(this, "repeatDelay");
    c(this, "boomerang");
    c(this, "repeatsDone", 0);
    c(this, "waitRemaining");
    c(this, "hasFiredStart", !1);
    c(this, "isBoomerangReverse", !1);
    c(this, "tick", (e, t) => {
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
    return this.dead || this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, k.add(this.tick), this.waitRemaining <= 0 && ((t = (e = this.animatable).onStart) == null || t.call(e)), this);
  }
  reverse() {
    var e, t;
    return this.dead ? this : (this.rate = -1, this.isBoomerangReverse = !1, this.running || (this.running = !0, (t = (e = this.animatable).onStart) == null || t.call(e), k.add(this.tick)), this);
  }
  pause() {
    return this.dead || !this.running ? this : (this.running = !1, k.remove(this.tick), this);
  }
  stop() {
    var e, t;
    this.running = !1, k.remove(this.tick), (t = (e = this.animatable).onComplete) == null || t.call(e);
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
function st() {
  var s;
  return ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight;
}
function B(s, e) {
  return s.ratio * e + s.offsetPx;
}
function vt(s) {
  const e = s.trim(), t = e.match(/^(-?[\d.]+)(px)?$/);
  if (t)
    return { ratio: 0, offsetPx: parseFloat(t[1]) };
  const i = e.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);
  if (!i || !i[1] && !i[2])
    return console.warn(`[six-js] onScroll: unknown position "${s}", using "top"`), { ratio: 0, offsetPx: 0 };
  const [, r, n, o, l] = i;
  let a = 0;
  r === "center" ? a = 0.5 : r === "bottom" ? a = 1 : r != null && r.endsWith("%") && (a = parseFloat(r) / 100);
  let h = 0;
  if (n && o) {
    const d = parseFloat(o), u = n === "+=" ? d : -d;
    l === "%" ? a += u / 100 : h += u;
  }
  return { ratio: a, offsetPx: h };
}
function Ct(s, e, t) {
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
  const [r = "top", n = "top"] = s.trim().split(/\s+/), o = vt(r), l = vt(n), h = window.scrollY + e.top + B(o, e.height), d = B(l, st());
  return {
    scrollY: h - d,
    viewportSpec: l,
    viewportLabel: n,
    documentY: h,
    triggerLabel: r,
    triggerSpec: o
  };
}
const Ie = "sixjs:scrollY:";
function Ft() {
  return Ie + location.pathname + location.search;
}
function Pe() {
  try {
    const s = sessionStorage.getItem(Ft());
    if (s === null) return null;
    const e = parseFloat(s);
    return Number.isFinite(e) ? e : null;
  } catch {
    return null;
  }
}
function ze() {
  try {
    sessionStorage.setItem(Ft(), String(window.scrollY));
  } catch {
  }
}
function Le() {
  var t;
  const [s] = ((t = performance.getEntriesByType) == null ? void 0 : t.call(performance, "navigation")) ?? [];
  if (s && "type" in s) {
    const i = s.type;
    return i === "reload" || i === "back_forward";
  }
  const e = performance.navigation;
  return (e == null ? void 0 : e.type) === 1 || (e == null ? void 0 : e.type) === 2;
}
let wt = !1;
function Be() {
  if (wt) return;
  wt = !0;
  try {
    "scrollRestoration" in history && (history.scrollRestoration = "manual");
  } catch {
  }
  const s = Le() ? Pe() : null;
  s !== null && (window.scrollTo(0, s), window.addEventListener("load", () => window.scrollTo(0, s), { once: !0 }));
  let e = !1;
  window.addEventListener(
    "scroll",
    () => {
      e || (e = !0, requestAnimationFrame(() => {
        e = !1, ze();
      }));
    },
    { passive: !0 }
  );
}
const U = 20, kt = 24, De = 20;
class lt {
  constructor(e, t, i) {
    c(this, "triggerEl");
    c(this, "playable");
    c(this, "options");
    c(this, "startY", 0);
    c(this, "endY", 0);
    c(this, "startViewportSpec", { ratio: 0, offsetPx: 0 });
    c(this, "endViewportSpec", { ratio: 1, offsetPx: 0 });
    c(this, "startViewportLabel", "");
    c(this, "endViewportLabel", "");
    c(this, "startTriggerY", 0);
    c(this, "endTriggerY", 0);
    c(this, "startTriggerLabel", "");
    c(this, "endTriggerLabel", "");
    c(this, "startTriggerSpec", { ratio: 0, offsetPx: 0 });
    c(this, "triggerLabelsCollide", !1);
    c(this, "smoothedProgress", 0);
    c(this, "smoothInitialized", !1);
    c(this, "wasInside", !1);
    c(this, "lastScrollY", window.scrollY);
    c(this, "rafPending", !1);
    c(this, "pinSpacer", null);
    c(this, "pinState", "before");
    c(this, "pinOriginalStyles", null);
    c(this, "pinRectWidth", 0);
    c(this, "pinRectHeight", 0);
    c(this, "startMarker", null);
    c(this, "endMarker", null);
    c(this, "startTriggerMarker", null);
    c(this, "endTriggerMarker", null);
    c(this, "resizeObserver", null);
    c(this, "recalcRafPending", !1);
    c(this, "onScrollBound", () => this.requestUpdate());
    c(this, "onResizeBound", () => this.recalc());
    c(this, "onLoadBound", () => this.recalc());
    c(this, "tickerBound", (e, t) => this.tickSmooth(t));
    var r;
    Be(), this.triggerEl = e, this.playable = t, this.options = i, i.debug && this.setupDebugMarkers(), this.recalc(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), (r = window.visualViewport) == null || r.addEventListener("resize", this.onResizeBound), document.readyState === "complete" ? this.recalc() : window.addEventListener("load", this.onLoadBound, { once: !0 }), this.setupResizeObserver(), typeof i.sync == "number" && k.add(this.tickerBound);
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
    const i = this.getMeasureRect(), r = Ct(e, i);
    this.startY = r.scrollY, this.startViewportSpec = r.viewportSpec, this.startViewportLabel = r.viewportLabel, this.startTriggerY = r.documentY, this.startTriggerLabel = r.triggerLabel, this.startTriggerSpec = r.triggerSpec;
    const n = Ct(t, i, this.startY);
    this.endY = n.scrollY, this.endViewportSpec = n.viewportSpec, this.endViewportLabel = n.viewportLabel, this.endTriggerY = n.documentY, this.endTriggerLabel = n.triggerLabel, this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < kt, this.options.sticky && this.updatePinSpacer(), this.updateDebugMarkers(), this.update(), this.options.sticky && this.applyPinForState(this.pinState);
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
    var a, h, d, u, p, f, g, m, y, S, b, v;
    const e = window.scrollY, t = this.computeProgress(), i = e >= this.startY && e <= this.endY, r = e >= this.lastScrollY, n = i && !this.wasInside, o = !i && this.wasInside;
    n ? r ? (h = (a = this.options).onEnter) == null || h.call(a) : (u = (d = this.options).onEnterBack) == null || u.call(d) : o && (r ? (f = (p = this.options).onLeave) == null || f.call(p) : (m = (g = this.options).onLeaveBack) == null || m.call(g)), this.wasInside = i, this.lastScrollY = e, this.options.sticky && this.updatePinState(e), this.updateTriggerMarkerLabelFlip(e);
    const l = this.options.sync ?? !1;
    l === !1 ? n && r && ((S = (y = this.playable).play) == null || S.call(y)) : l === !0 && this.playable.seek(t * this.playable.duration), (v = (b = this.options).onUpdate) == null || v.call(b);
  }
  tickSmooth(e) {
    var o, l, a, h;
    if (typeof this.options.sync != "number") return;
    const t = this.computeProgress();
    if (!this.smoothInitialized) {
      this.smoothInitialized = !0, this.smoothedProgress = t, this.playable.seek(this.smoothedProgress * this.playable.duration), (l = (o = this.options).onUpdate) == null || l.call(o);
      return;
    }
    const i = Math.max(0.05, this.options.sync), r = e / 1e3, n = 1 - Math.exp(-3 * r / i);
    this.smoothedProgress += (t - this.smoothedProgress) * n, Math.abs(t - this.smoothedProgress) < 5e-4 && (this.smoothedProgress = t), this.playable.seek(this.smoothedProgress * this.playable.duration), (h = (a = this.options).onUpdate) == null || h.call(a);
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
    const e = this.pinSpacer.getBoundingClientRect(), t = B(this.startViewportSpec, st()), i = B(this.startTriggerSpec, this.pinRectHeight), r = t - i;
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
    e.line.style.top = `${t}px`, this.applyLabelSide(e.label, i < U ? "below" : "above", r);
  }
  updateTriggerMarkerLabelFlip(e) {
    if (this.startTriggerMarker) {
      const t = this.startTriggerY - e;
      this.applyLabelSide(this.startTriggerMarker.label, t < U ? "below" : "above", 0);
    }
    if (this.endTriggerMarker) {
      const t = this.endTriggerY - e, i = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, t < U ? "below" : "above", i);
    }
  }
  updateDebugMarkers() {
    const e = st(), t = window.scrollY, i = B(this.startViewportSpec, e), r = B(this.endViewportSpec, e), n = Math.abs(i - r) < kt;
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
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), (e = window.visualViewport) == null || e.removeEventListener("resize", this.onResizeBound), window.removeEventListener("load", this.onLoadBound), (t = this.resizeObserver) == null || t.disconnect(), this.resizeObserver = null, k.remove(this.tickerBound), this.teardownPin(), this.removeDebugMarkers();
  }
}
const Tt = /* @__PURE__ */ new WeakMap();
let Et = !1;
function Fe(s, e, t) {
  if (t) {
    t === "auto" && !Et && (Et = !0, console.warn(
      '[six-js] overwrite: "auto" (chỉ huỷ property trùng) chưa được hỗ trợ đầy đủ, tạm thời xử lý như overwrite: true (huỷ toàn bộ tween cũ trên cùng target).'
    ));
    for (const i of s) {
      let r = Tt.get(i);
      r || (r = /* @__PURE__ */ new Set(), Tt.set(i, r));
      for (const o of r)
        o !== e && o.kill();
      r.clear(), r.add(e);
      const n = () => r.delete(e);
      e.on("complete", n), e.on("reverseComplete", n);
    }
  }
}
function Oe(s, e, t) {
  if (typeof t == "number")
    return s * t;
  const { each: i, from: r = "start" } = t;
  if (typeof i != "number" || isNaN(i))
    return console.warn(`[six-js] stagger.each phải là số, nhận được ${i} — dùng 0 thay thế`), 0;
  let n;
  return r === "start" ? n = s : r === "end" ? n = e - 1 - s : r === "center" ? n = Math.abs(s - (e - 1) / 2) : n = Math.abs(s - r), n * i;
}
class $e {
  constructor(e, t = []) {
    c(this, "delays");
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
const Ye = /^<\s*(?:([+-]=)\s*([\d.]+))?$/, _e = /^>\s*(?:([+-]=)\s*([\d.]+))?$/, qe = /^([+-]=)\s*([\d.]+)$/, Ne = /^([^\s+-]+)\s*(?:([+-]=)\s*([\d.]+))?$/;
class We {
  constructor() {
    c(this, "children", []);
    c(this, "labels", /* @__PURE__ */ new Map());
    c(this, "cursor", 0);
    c(this, "activeChildren", /* @__PURE__ */ new Set());
    c(this, "lastLocalTime", 0);
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
    let r = t.match(Ye);
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
    if (r = t.match(qe), r) {
      const n = parseFloat(r[2]);
      return Math.max(0, this.cursor + (r[1] === "-=" ? -n : n));
    }
    if (r = t.match(Ne), r) {
      const [, n, o, l] = r, a = this.labels.get(n);
      if (a === void 0)
        return console.warn(`[six-js] timeline: unknown label "${n}", appending to end`), this.cursor;
      if (o && l) {
        const h = parseFloat(l);
        return Math.max(0, a + (o === "-=" ? -h : h));
      }
      return a;
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
    this.children.forEach((o, l) => {
      o.end >= i && o.start <= r && n.add(l);
    }), this.activeChildren.forEach((o) => {
      var l, a;
      n.has(o) || (a = (l = this.children[o].animatable).onComplete) == null || a.call(l);
    }), n.forEach((o) => {
      var l, a;
      this.activeChildren.has(o) || (a = (l = this.children[o].animatable).onStart) == null || a.call(l);
    }), this.children.forEach((o) => {
      const l = e - o.start;
      (t || l >= 0) && o.animatable.render(l, t);
    }), this.activeChildren = n, this.lastLocalTime = e;
  }
  onStart() {
  }
  onComplete() {
  }
}
class ht {
  constructor(e = {}) {
    c(this, "engine", new We());
    c(this, "playable");
    c(this, "defaults");
    if (this.defaults = e.defaults ?? {}, this.playable = new it(this.engine, {
      autoplay: e.onScroll ? !1 : !e.paused,
      delay: e.delay,
      repeat: e.repeat,
      repeatDelay: e.repeatDelay,
      boomerang: e.boomerang
    }), e.onStart && this.playable.on("start", e.onStart), e.onUpdate && this.playable.on("update", e.onUpdate), e.onComplete && this.playable.on("complete", e.onComplete), e.onRepeat && this.playable.on("repeat", e.onRepeat), e.onReverseComplete && this.playable.on("reverseComplete", e.onReverseComplete), e.onScroll) {
      const t = e.onScroll.target, i = typeof t == "string" ? document.querySelector(t) : t;
      i ? new lt(i, this.playable, e.onScroll) : console.warn("[six-js] timeline onScroll: trigger element not found, cần chỉ định onScroll.target");
    }
  }
  buildChildTween(e, t, i, r, n) {
    const o = { ...this.defaults, ...t }, l = new at(e, o, i, r);
    return this.engine.add(l, n), this;
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
    return e instanceof ht ? (e.playable.pause(), i = e.engine) : e instanceof it ? (e.pause(), i = e.getAnimatable()) : i = e, this.engine.add(i, t), this;
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
function T(s, e, t) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: s,
    pxAxis: t,
    defaultUnit: e,
    getCurrent(i) {
      return { num: ke(i, s), unit: e };
    },
    apply(i, r) {
      Bt(i, s, r.num);
    }
  };
}
function Ot(s, e, t) {
  const i = T(s, "px", t), r = T(e, "%");
  return (n) => typeof n == "string" && n.trim().endsWith("%") ? r : i;
}
x("x", Ot("x", "xPercent", "x"));
x("y", Ot("y", "yPercent", "y"));
x("z", T("z", "px"));
x("rotate", T("rotate", "deg"));
x("rotateX", T("rotateX", "deg"));
x("rotateY", T("rotateY", "deg"));
x("rotateZ", T("rotateZ", "deg"));
x("scale", T("scale", ""));
x("scaleX", T("scaleX", ""));
x("scaleY", T("scaleY", ""));
x("skewX", T("skewX", "deg"));
x("skewY", T("skewY", "deg"));
function M(s, e) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: e,
    getCurrent(t) {
      const i = window.getComputedStyle(t)[s];
      return F(i, e);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
x("width", M("width", "px"));
x("height", M("height", "px"));
x("top", M("top", "px"));
x("left", M("left", "px"));
x("right", M("right", "px"));
x("bottom", M("bottom", "px"));
x("borderWidth", M("borderWidth", "px"));
x("opacity", M("opacity", ""));
x("fontSize", M("fontSize", "px"));
x("letterSpacing", M("letterSpacing", "px"));
function X(s) {
  return {
    type: "color",
    cssKey: s,
    getCurrent(e) {
      const t = window.getComputedStyle(e)[s];
      return Lt(t);
    },
    apply(e, t) {
      e.style[s] = me(t);
    }
  };
}
x("backgroundColor", X("backgroundColor"));
x("color", X("color"));
x("borderColor", X("borderColor"));
x("background", X("backgroundColor"));
function He(s) {
  return {
    type: "discrete",
    cssKey: s,
    apply(e, t) {
      e.style[s] = t;
    }
  };
}
const Ve = [
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
Ve.forEach((s) => x(s, He(s)));
function ct(s) {
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
x("boxShadow", ct("boxShadow"));
x("filter", ct("filter"));
x("borderRadius", ct("borderRadius"));
Nt();
let At = !1;
function Xe() {
  At || (he(), At = !0);
}
function Ge(s) {
  return Array.from(document.querySelectorAll(s));
}
function je(s) {
  const e = s.startsWith("#") ? s.slice(1) : s;
  return document.getElementById(e);
}
function Ue(s, e) {
  const t = new at(s, { ...e, duration: 0 }, "to");
  t.render(0), t.onComplete();
}
function $t(s) {
  return typeof s == "string" ? document.querySelector(s) : Array.isArray(s) ? s.find((e) => e != null) ?? null : s ?? null;
}
function Ke(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : Array.isArray(s) ? s.filter((e) => e != null) : s ? [s] : [];
}
function Mt(s, e, t, i, r, n) {
  const o = new at(s, e, t, i), l = new it(o, {
    autoplay: n.onScroll ? !1 : !n.paused,
    delay: (n.delay ?? 0) + r,
    repeat: n.repeat,
    repeatDelay: n.repeatDelay,
    boomerang: n.boomerang
  });
  if (n.onStart && l.on("start", n.onStart), n.onUpdate && l.on("update", n.onUpdate), n.onComplete && l.on("complete", n.onComplete), n.onRepeat && l.on("repeat", n.onRepeat), n.onReverseComplete && l.on("reverseComplete", n.onReverseComplete), Fe(o.targetElements, l, n.overwrite), n.onScroll) {
    const a = $t(n.onScroll.target ?? s);
    a ? new lt(a, l, n.onScroll) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return l;
}
function dt(s, e, t, i) {
  const {
    onScroll: r,
    stagger: n,
    delay: o,
    paused: l,
    repeat: a,
    repeatDelay: h,
    boomerang: d,
    overwrite: u,
    onStart: p,
    onUpdate: f,
    onComplete: g,
    onRepeat: m,
    onReverseComplete: y,
    ...S
  } = e, b = { onScroll: r, delay: o, paused: l, repeat: a, repeatDelay: h, boomerang: d, overwrite: u, onStart: p, onUpdate: f, onComplete: g, onRepeat: m, onReverseComplete: y };
  if (n === void 0)
    return Mt(s, S, t, i, 0, b);
  const v = Ke(s);
  v.length === 0 && console.warn("[six-js] stagger: no elements matched"), Object.values(S).some((A) => typeof A == "function") && console.warn(
    "[six-js] stagger: function value (index, el) => ... luôn nhận index=0 vì mỗi phần tử stagger giờ là 1 tween độc lập, không phải index gốc trong danh sách. Nếu cần giá trị theo index gốc, hãy tự tính mảng giá trị trước thay vì dùng callback."
  );
  const w = v.map((A, P) => Oe(P, v.length, n)), R = r ? { ...b, onScroll: void 0, paused: !0 } : b, _ = !!r && (r.sync === !0 || typeof r.sync == "number"), q = v.map(
    (A, P) => Mt(A, S, t, i, _ ? 0 : w[P], R)
  ), I = new $e(q, w);
  if (r) {
    const A = $t(r.target ?? s);
    A ? new lt(A, I, r) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return I;
}
function Ze(s, e) {
  return dt(s, e, "to");
}
function Qe(s, e) {
  return dt(s, e, "from");
}
function Je(s, e, t) {
  return dt(s, t, "fromTo", e);
}
function ti(s) {
  return new ht(s);
}
const ii = {
  initElement: Xe,
  getClass: Ge,
  getId: je,
  set: Ue,
  to: Ze,
  from: Qe,
  fromTo: Je,
  timeline: ti,
  setDefaults: Re
};
export {
  qt as VERSION,
  ii as six
};
