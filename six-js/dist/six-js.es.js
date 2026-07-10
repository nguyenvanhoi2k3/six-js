var It = Object.defineProperty;
var Rt = (s, e, t) => e in s ? It(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var h = (s, e, t) => Rt(s, typeof e != "symbol" ? e + "" : e, t);
const zt = "0.0.31";
let ot = !1;
function Pt() {
  ot || (ot = !0, console.log(
    ` SixJS v${zt}`
  ));
}
function Y(s) {
  return s < 1 / 2.75 ? 7.5625 * s * s : s < 2 / 2.75 ? (s -= 1.5 / 2.75, 7.5625 * s * s + 0.75) : s < 2.5 / 2.75 ? (s -= 2.25 / 2.75, 7.5625 * s * s + 0.9375) : (s -= 2.625 / 2.75, 7.5625 * s * s + 0.984375);
}
const L = 1.70158, _ = L * 1.525, D = {
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
  backIn: (s) => (L + 1) * s * s * s - L * s * s,
  backOut: (s) => (s--, 1 + (L + 1) * s * s * s + L * s * s),
  backInOut: (s) => {
    if (s < 0.5) {
      const t = 2 * s;
      return t * t * ((_ + 1) * t - _) / 2;
    }
    const e = 2 * s - 2;
    return (e * e * ((_ + 1) * e + _) + 2) / 2;
  },
  bounceIn: (s) => 1 - Y(1 - s),
  bounceOut: Y,
  bounceInOut: (s) => s < 0.5 ? (1 - Y(1 - 2 * s)) / 2 : (1 + Y(2 * s - 1)) / 2
}, et = /* @__PURE__ */ new WeakMap();
let j = [], U = null;
function at(s, e) {
  j.push({ instance: s, type: e }), U === null && (U = requestAnimationFrame(Bt));
}
function Bt() {
  const s = j.slice();
  j.length = 0, U = null;
  for (let e = 0; e < s.length; e++) {
    const { instance: t, type: i } = s[e];
    i === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let W = null;
function St() {
  return typeof window > "u" ? null : (W || (W = new IntersectionObserver(
    (s) => {
      for (let e = 0; e < s.length; e++) {
        const t = s[e], i = et.get(t.target);
        i && (t.isIntersecting ? at(i, "enter") : at(i, "leave"));
      }
    },
    { threshold: 0.05 }
  )), W);
}
function vt(s, e) {
  var t;
  et.set(s, e), (t = St()) == null || t.observe(s);
}
function K(s) {
  var e;
  et.delete(s), (e = St()) == null || e.unobserve(s);
}
function F(s, e) {
  if (s == null) return e;
  const t = s.trim();
  if (!t) return e;
  const i = Number(t);
  return Number.isFinite(i) ? i * 1e3 : e;
}
const T = class T extends HTMLElement {
  constructor() {
    super(...arguments);
    h(this, "animation");
    h(this, "options");
    h(this, "order", T.counter++);
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
    t.sort((i, n) => i.order - n.order), t.forEach((i, n) => {
      i.play(n * 120);
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
    this.setInitialState(), vt(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t;
    (t = this.animation) == null || t.cancel(), K(this), T.groupQueue.delete(this);
  }
  handleEnter() {
    this.hasAttribute("replay") || K(this), this.isGroup ? (T.groupQueue.add(this), T.scheduleGroup()) : this.play();
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
    }, n = this.getAttribute("type") ?? "fade-up", r = this.getAttribute("easing"), [o, c] = i[n] ?? i["fade-up"];
    return {
      x: o,
      y: c,
      easing: r && r in D ? r : "strongInOut",
      duration: F(this.getAttribute("duration"), 400),
      delay: F(this.getAttribute("delay"), 0)
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
    const { x: i, y: n, easing: r, duration: o, delay: c } = this.options;
    (l = this.animation) == null || l.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${i}px, ${n}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: o,
        delay: c + t,
        easing: r,
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var a;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (a = this.animation) == null || a.cancel(), this.animation = void 0;
    };
  }
};
h(T, "counter", 0), h(T, "mediaQuery", window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)), h(T, "groupQueue", /* @__PURE__ */ new Set()), h(T, "isProcessingGroup", !1);
let Q = T;
function Lt() {
  customElements.get("sx-animate") || customElements.define("sx-animate", Q);
}
class Dt {
  constructor() {
    h(this, "_listeners", /* @__PURE__ */ new Set());
    h(this, "_time", 0);
    h(this, "_delta", 0);
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
      const i = this._last - this._start, n = i - this._nextTime;
      if (n > 0) {
        this._frame++, this._delta = i - this._time * 1e3, this._time = i / 1e3, this._nextTime += n >= this._gap ? n + 4 : this._gap;
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
    const t = (i, n, r) => {
      this.remove(t), e(i, n, r);
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
const w = new Dt();
class Ft extends HTMLElement {
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
    h(this, "updateAnimation", (t, i) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const n = i / 1e3, r = this.speed * n, o = this.direction, l = this.isVertical ? this.offsetHeight : this.offsetWidth;
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
    }), this.resizeObserver.observe(this), vt(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, w.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, w.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), K(this), w.remove(this.updateAnimation);
  }
  attributeChangedCallback(t, i, n) {
    i !== n && (t === "gap" ? (this.updateGapVar(), setTimeout(() => this.scheduleSetup(), 50)) : (t === "direction" || t === "speed" || t === "clone") && this.scheduleSetup());
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
        const n = this.isVertical, r = n ? this.offsetHeight : this.offsetWidth, o = n ? this.inner.offsetHeight : this.inner.offsetWidth;
        if (this.clone && o > 0 && r > 0) {
          const c = o < r ? Math.ceil(r * 2 / o) : 2, l = document.createDocumentFragment();
          for (let a = 1; a < c; a++)
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
    const n = this.isVertical;
    for (let o = 0; o < t.length; o++)
      i += n ? t[o].offsetHeight : t[o].offsetWidth;
    const r = parseFloat(getComputedStyle(this.inner).gap) || 0;
    i += r * t.length, this.cachedResetBounds = i;
  }
  applyTransform(t) {
    this.inner && (this.isVertical ? this.inner.style.transform = `translate3d(0,${t}px,0)` : this.inner.style.transform = `translate3d(${t}px,0,0)`);
  }
}
class Ot extends HTMLElement {
}
class $t extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function Yt() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Ft), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", Ot), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", $t);
}
class _t extends HTMLElement {
  constructor() {
    super();
  }
}
class qt {
  constructor() {
    h(this, "sliders", /* @__PURE__ */ new Map());
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
const P = new qt();
class Nt extends HTMLElement {
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
    const i = t.target;
    if (i.classList.contains("sx-slider-pagination-bullet")) {
      const n = Number(i.getAttribute("data-index"));
      this.goToSlide(n);
    }
  }
  goToSlide(t) {
    const i = this.getAttribute("name");
    let n = null;
    i ? n = P.get(i) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const i = this.getAttribute("effect"), n = i === "dynamic", r = i === "snake", o = i === "fraction", c = t.join(",") + `_effect:${i}`;
    if (this.renderedSignature === c) return;
    if (this.renderedSignature = c, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const a = document.createElement("span");
      a.className = "sx-slider-pagination-current", a.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const p = document.createDocumentFragment();
      p.appendChild(a), p.appendChild(d), p.appendChild(u), this.appendChild(p);
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
      const u = this.createBulletDOM(a, d, i === "number");
      this.cachedBullets.push(u), l.appendChild(u);
    }), this.appendChild(l);
  }
  createBulletDOM(t, i, n) {
    const r = document.createElement("span");
    return r.className = "sx-slider-pagination-bullet", r.setAttribute("data-index", t.toString()), r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"), r.setAttribute("aria-label", `Go to slide ${i + 1}`), n && (r.textContent = (i + 1).toString()), r;
  }
  updateActive(t) {
    const i = this.getAttribute("effect");
    if (i === "fraction") {
      const u = this.querySelector(".sx-slider-pagination-current");
      u && (u.textContent = (t + 1).toString());
      return;
    }
    const n = i === "dynamic", r = i === "snake", o = this.cachedBullets, c = o.length;
    if (c === 0) return;
    if (o.forEach((u, p) => {
      n && (u.className = "sx-slider-pagination-bullet"), p === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const y = t * 20, b = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const S = y - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const S = b - y + 10;
          this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = `${S}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || c <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (this.innerContainer.style.transform = "translateX(0px)");
      return;
    }
    let l = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    l = Math.min(l, c - this.maxVisibleBullets);
    const a = l + this.maxVisibleBullets - 1;
    o.forEach((u, p) => {
      p >= l && p <= a ? p === l ? u.classList.add(p === 0 ? "sx-bullet-main" : "sx-bullet-small") : p === l + 1 ? u.classList.add(p === 1 ? "sx-bullet-main" : "sx-bullet-medium") : p === a ? u.classList.add(
        p === c - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : p === a - 1 ? u.classList.add(
        p === c - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -l * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${d}px)`;
  }
}
class Ht extends HTMLElement {
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
      const t = P.get(e);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class Vt extends HTMLElement {
  constructor() {
    super();
    h(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, i, n) {
    const r = Math.max(0, Math.min(1, t));
    this.bar.style.transition = n || "none", i === "vertical" ? (this.bar.style.transformOrigin = "top center", this.bar.style.transform = `scaleY(${r})`) : (this.bar.style.transformOrigin = "left center", this.bar.style.transform = `scaleX(${r})`);
  }
}
class Wt extends HTMLElement {
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
      const t = P.get(e);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class Xt {
  constructor(e, t, i = 0.92) {
    h(this, "velocity", 0);
    h(this, "friction");
    h(this, "onUpdate");
    h(this, "onComplete");
    h(this, "isRunning", !1);
    h(this, "tickerCallback");
    this.onUpdate = e, this.onComplete = t, this.friction = i, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(e) {
    this.friction = e;
  }
  addVelocity(e) {
    this.velocity += e, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, w.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, w.add(this.tickerCallback));
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
class Gt extends HTMLElement {
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
        const { max: i, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(i, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    h(this, "wheelInertia", new Xt(
      (t) => {
        if (this.sliderCha) {
          if (this.currentTranslate += t, this.sliderCha.options.loop)
            this.checkLoopBoundsInstant();
          else {
            const { max: i, min: n } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
            this.currentTranslate > i ? r <= 0 ? (this.currentTranslate = i, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate > i + r ? (this.currentTranslate = i + r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.currentTranslate < n ? r <= 0 ? (this.currentTranslate = n, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate < n - r ? (this.currentTranslate = n - r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.wheelInertia.setFriction(0.92);
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
        let i = -t.deltaY * 0.15;
        if (!this.sliderCha.options.loop) {
          const { max: n, min: r } = this.sliderCha.getBoundaries();
          (this.currentTranslate > n && i > 0 || this.currentTranslate < r && i < 0) && (i *= 0.2);
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
    const n = performance.now();
    for (this.dragXs.push(i), this.dragTimes.push(n); this.dragTimes.length > 0 && n - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const r = i - this.startX;
    let o = this.prevTranslate + r;
    if (this.sliderCha.options.loop)
      this.currentTranslate = o, this.checkLoopBoundsInstant();
    else {
      const { max: c, min: l } = this.sliderCha.getBoundaries(), a = this.sliderCha.options.edgeResistance;
      o > c ? o = a <= 0 ? c : c + Math.min(a, (o - c) * 0.3) : o < l && (o = a <= 0 ? l : l - Math.min(a, (l - o) * 0.3)), this.currentTranslate = o;
    }
    this.setTransform(this.currentTranslate);
  }
  dragEnd() {
    if (!this.isDragging || !this.sliderCha) return;
    this.isDragging = !1;
    const t = this.sliderCha.options, i = performance.now();
    if (this.dragTimes.length > 0) {
      const n = this.dragTimes[this.dragTimes.length - 1];
      if (i - n > 10)
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
        const c = this.sliderCha.getCurrentIndex();
        let l = t.autoSize ? this.sliderCha.getOffsetForIndex(c) : c * this.sliderCha.getSlideSizeWithGap();
        const a = this.children[c];
        let d = t.autoSize ? (a ? a.getBoundingClientRect()[this.sliderCha.sizeDim] : 0) + this.sliderCha.convertToPx(t.gap) : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (l + d / 2);
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
        const { max: o, min: c } = this.sliderCha.getBoundaries(), l = Math.max(
          c,
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
  startMomentumScroll(t, i, n, r = !1) {
    var c;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = i ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (c = this.sliderCha) != null && c.options.loop && this.checkLoopBoundsInstant(), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, w.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const i = performance.now() - this.scrollStartTime, n = Math.min(i / this.scrollDuration, 1), r = 1 - Math.pow(1 - n, 4), c = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += c, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
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
        if (this.scrollFriction *= 0.6, Math.abs(c) < 1) {
          const p = this.currentTranslate > l ? l : a;
          this.startMomentumScroll(p, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(c) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, w.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, w.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, i = this.sliderCha.options.autoSize ? t : this.sliderCha.options.perView, n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(i), r = this.sliderCha.getOffsetForIndex(i + t) - o;
    else {
      const y = this.sliderCha.getSlideSizeWithGap();
      o = i * y, r = t * y;
    }
    let c = 0;
    if (this.sliderCha.options.centered) {
      const y = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let b = 0;
      if (this.sliderCha.options.autoSize) {
        const S = this.sliderCha.convertToPx(this.sliderCha.options.gap), g = this.children[i];
        b = g ? g.getBoundingClientRect()[this.sliderCha.sizeDim] + S : 0;
      } else
        b = this.sliderCha.getSlideSizeWithGap();
      c = y / 2 - b / 2;
    }
    const l = -o + n + c, a = l - r;
    let d = !1, u = this.currentTranslate, p = 0, f = 0;
    const m = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > l + m ? (u = this.currentTranslate - r, p = -r, f = t, d = !0) : this.currentTranslate <= a - m && (u = this.currentTranslate + r, p = r, f = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += p, this.scrollToTarget += p), this.setTransform(this.currentTranslate), this.sliderCha.setCurrentIndex(
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
    const n = parseFloat(this.sliderCha.startPadding) || 0, r = this.sliderCha.getCurrentIndex();
    let o = n, c = 0, l = 0;
    if (i.autoSize) {
      c = this.sliderCha.getOffsetForIndex(r);
      const a = Array.from(this.children), d = this.sliderCha.convertToPx(i.gap);
      l = a[r] ? a[r].getBoundingClientRect()[this.sliderCha.sizeDim] + d : 0;
    } else {
      const a = this.sliderCha.getSlideSizeWithGap();
      c = r * a, l = a;
    }
    if (i.centered) {
      const a = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += a / 2 - (c + l / 2);
    } else
      o -= c;
    if (!i.loop) {
      const { max: a, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(a, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, i.loop) {
      const a = this.sliderCha.originalSlidesCount, d = i.autoSize ? a : i.perView;
      (r >= d + a || r < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, i.speed);
    }
  }
}
class lt {
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
    let n = { ...t };
    const r = Object.keys(i).map(Number).sort((o, c) => o - c);
    for (const o of r)
      if (e >= o) {
        const c = this.kebabToCamel(i[o]);
        n = { ...n, ...c };
      }
    return n;
  }
  static kebabToCamel(e) {
    if (typeof e != "object" || e === null) return e;
    const t = {};
    for (const i in e) {
      const n = i.replace(/-([a-z])/g, (r) => r[1].toUpperCase());
      t[n] = e[i];
    }
    return t;
  }
}
class jt extends HTMLElement {
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
  updateProgress(t, i) {
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const a = this.originalSlidesCount;
      if (a > 0 && this.track) {
        const d = this.options.autoSize ? a : this.options.perView, u = parseFloat(this.startPadding) || 0;
        let p = 0, f = 0;
        if (this.options.autoSize)
          p = this.getOffsetForIndex(d), f = this.getOffsetForIndex(d + a) - p;
        else {
          const m = this.getSlideSizeWithGap();
          p = d * m, f = a * m;
        }
        if (f > 0) {
          r = o / f;
          let m = 0;
          if (this.options.centered) {
            let S = this.options.autoSize ? this.getRectSize(
              this.track.children[d]
            ) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap();
            m = o / 2 - S / 2;
          }
          n = (-p + u + m - t) / f, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: a, min: d } = this.getBoundaries(), u = a - d;
      u > 0 ? (n = (a - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const c = r + n * (1 - r);
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
      typeof a.update == "function" && a.update(c, this.options.direction, i);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && P.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;
        const t = this.getBoundingClientRect()[this.sizeDim];
        t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
      });
    }), this.resizeObserver.observe(this), this.track) {
      let t = 0, i = 0;
      this.track.addEventListener("mousedown", (n) => {
        t = n.clientX, i = n.clientY;
      }), this.track.addEventListener(
        "touchstart",
        (n) => {
          n.touches.length > 0 && (t = n.touches[0].clientX, i = n.touches[0].clientY);
        },
        { passive: !0 }
      ), this.track.addEventListener("click", (n) => {
        const r = Math.abs(n.clientX - t), o = Math.abs(n.clientY - i);
        if (r > 6 || o > 6) return;
        const c = n.target.closest("sx-slider-slide");
        if (!c) return;
        const l = c.getAttribute("data-real-index");
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
    ), this.options.name && P.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (f) => f ? isNaN(Number(f)) ? f : `${f}px` : "0px", i = this.getAttribute("edge-resistance"), n = i !== null ? Number(i) : 100, r = this.getAttribute("interval"), o = F(r, 4e3), c = this.getAttribute("start-index"), l = c !== null ? Number(c) : 0, a = this.getAttribute("per-move");
    let d = "auto";
    if (a !== null && a !== "auto") {
      const f = Number(a);
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
      speed: F(this.getAttribute("speed"), 300),
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
      effect: p,
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active")
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = lt.parse(
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
    const i = Array.from(this.track.children);
    if (this.originalSlidesCount = i.length, this.originalSlidesCount === 0) return;
    i.forEach((r, o) => {
      r.setAttribute("data-real-index", o.toString());
    });
    const n = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
    for (let r = 0; r < n; r++) {
      const c = i[i.length - 1 - r].cloneNode(!0);
      c.setAttribute("data-clone", "prev"), this.track.insertBefore(c, this.track.firstChild);
    }
    for (let r = 0; r < n; r++) {
      const c = i[r].cloneNode(!0);
      c.setAttribute("data-clone", "next"), this.track.appendChild(c);
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
    if (this.options.loop || i.forEach((f, m) => {
      f.setAttribute("data-real-index", m.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = lt.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const f = (m) => m == null || m === "" ? "0px" : isNaN(Number(m)) ? String(m) : `${m}px`;
      this.options.gap = f(this.options.gap), this.options.leftPadding = f(this.options.leftPadding), this.options.rightPadding = f(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), i = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), i = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, i.length - 1)
    ));
    const n = this.track.querySelectorAll("[data-clone]").length, r = i.length - n;
    if (this.isFirstInit && r > 0) {
      const f = Math.max(
        0,
        Math.min(this.options.startIndex, r - 1)
      );
      if (this.options.loop) {
        const m = this.options.autoSize ? r : this.options.perView;
        this.currentIndex = m + f;
      } else
        this.currentIndex = f;
      this.isFirstInit = !1;
    }
    const o = this.getAttribute("left-padding"), c = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && c && parseFloat(c) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(c));
    const l = this.convertToPx(this.options.gap), a = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      i.forEach((f) => {
        f.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, i.forEach((f) => {
        const m = f.firstElementChild;
        m ? f.style[this.sizeDim] = `${m.getBoundingClientRect()[this.sizeDim]}px` : f.style[this.sizeDim] = "max-content", f.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const y = ((t || window.innerWidth) - a - d - l * (this.options.perView - 1)) / this.options.perView;
      i.forEach((b) => {
        b.style[this.sizeDim] = `${y}px`, b.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const p = i.filter((f) => !f.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let f = 0;
      p.forEach((m) => {
        f += this.getRectSize(m) + l;
      }), f -= l, u = f < t;
    } else
      u = r < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((m) => m.remove())) : this.track.style.justifyContent = "", this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    if (!t || t === "0px" || t === "0") return 0;
    if (t.endsWith("px"))
      return parseFloat(t);
    const i = document.createElement("div");
    i.style.display = "none", i.style.width = t, document.body.appendChild(i);
    const n = parseFloat(getComputedStyle(i).width);
    return document.body.removeChild(i), n || 0;
  }
  getSlideSizeWithGap() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children[0];
    return this.getRectSize(t) + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let i = 0, n = 0;
    const r = this.convertToPx(this.options.gap), o = Array.from(this.track.children);
    for (let c = 0; c < o.length && (i += this.getRectSize(o[c]) + r, !(i - r > t)); c++)
      n++;
    return Math.max(1, n);
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    const i = Array.from(this.track.children), n = this.convertToPx(this.options.gap);
    let r = 0;
    for (let o = 0; o < t; o++)
      i[o] && (r += this.getRectSize(i[o]) + n);
    return r;
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let i = 0;
    if (this.options.autoSize)
      i = this.getOffsetForIndex(this.track.children.length), i -= this.convertToPx(this.options.gap);
    else {
      const n = this.track.children.length;
      i = this.getSlideSizeWithGap() * n - this.convertToPx(this.options.gap);
    }
    return Math.max(0, i - t);
  }
  getBoundaries() {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], i = parseFloat(this.startPadding) || 0, n = this.convertToPx(this.options.gap), r = this.track.children.length;
    let o = 0, c = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let l = this.options.autoSize ? (this.track.children[0] ? this.getRectSize(this.track.children[0]) : 0) + n : this.getSlideSizeWithGap();
      o = i + t / 2 - l / 2;
      let a = r - 1, d = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), u = this.options.autoSize ? (this.track.children[a] ? this.getRectSize(this.track.children[a]) : 0) + n : this.getSlideSizeWithGap();
      c = i + t / 2 - (d + u / 2);
    }
    return { max: o, min: Math.min(o, c) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const i = this.options.loop, n = i ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = i ? this.options.autoSize ? this.originalSlidesCount : this.options.perView : 0, o = (g) => {
      if (!i) return g;
      let v = (g - r) % n;
      return v < 0 && (v += n), v;
    }, c = this.options.centered ? 0 : Math.floor(this.options.perView / 2), l = o(this.currentIndex);
    this.lastFiredIndex !== l && (this.lastFiredIndex = l, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: l }
      })
    ));
    const a = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + c), p = this.isFirstHeightMeasure;
    p && (this.isFirstHeightMeasure = !1);
    let f = null;
    p && (f = document.createElement("style"), f.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(f), this.offsetHeight), this.options.lockActive && !this.isClickRouting && !p || t.forEach((g, v) => {
      g.removeAttribute("sx-slide-active"), g.removeAttribute("sx-slide-prev"), g.removeAttribute("sx-slide-next"), g.removeAttribute("sx-slide-center");
      let C = o(v);
      g.setAttribute("aria-label", `${C + 1}/${n}`), C === l && g.setAttribute("sx-slide-active", ""), C === a && g.setAttribute("sx-slide-prev", ""), C === d && g.setAttribute("sx-slide-next", ""), C === u && g.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight(), this.updateNavigation();
    const m = i ? n - 1 : this.getRealMaxIndex(), y = this.getResolvedPerMove();
    let b = [];
    if (y > 1 && !this.options.autoSize) {
      let g = 0;
      for (; g < m; )
        b.push(g), g += y;
      g !== m && b.push(m);
    } else
      for (let g = 0; g <= m; g++)
        b.push(g);
    let S = b.indexOf(l);
    if (S === -1) {
      for (let g = b.length - 1; g >= 0; g--)
        if (l >= b[g]) {
          S = g;
          break;
        }
    }
    this.updatePagination(b, S), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((v) => v.trim()).forEach((v) => {
      const C = P.get(v);
      C && C.syncFromController(l);
    }), p && f && requestAnimationFrame(() => {
      f == null || f.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const i = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = i ? this.originalSlidesCount : n.length - r;
    if (((l) => {
      if (!i) return l;
      const a = this.options.autoSize ? this.originalSlidesCount : this.options.perView;
      let d = (l - a) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (i) {
        const l = this.options.autoSize ? this.originalSlidesCount : this.options.perView, a = t + l, d = this.originalSlidesCount, u = n.length;
        let p = a, f = Math.abs(a - this.currentIndex);
        [a - d, a, a + d].forEach((y) => {
          if (y >= 0 && y < u) {
            const b = Math.abs(y - this.currentIndex);
            b < f && (f = b, p = y);
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
    const i = this.options.perView, n = this.options.centered ? Math.floor(i / 2) : 0;
    let r = this.currentIndex - n;
    this.options.loop || (r = Math.max(0, r));
    const o = [];
    for (let l = 0; l < i; l++) {
      let a = r + l;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const d = t[a];
      if (d) {
        const u = d.cloneNode(!0);
        u.style.position = "absolute", u.style.visibility = "hidden", u.style.pointerEvents = "none", u.style.transition = "none", u.style[this.sizeDim] = `${d.getBoundingClientRect()[this.sizeDim]}px`;
        const p = u.firstElementChild;
        p && (p.style.transition = "none"), this.track.appendChild(u), o.push(u);
      }
    }
    let c = 0;
    o.forEach((l) => {
      const a = l.firstElementChild, d = a ? a.getBoundingClientRect().height : l.getBoundingClientRect().height;
      d > c && (c = d);
    }), o.forEach((l) => {
      var a;
      (a = this.track) == null || a.removeChild(l);
    }), c > 0 && (this.track.style.height = `${c}px`);
  }
  getCurrentIndex() {
    if (!this.track) return 0;
    const t = this.options.loop, i = Array.from(this.track.children), n = t ? this.originalSlidesCount : i.length;
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
    const t = this.track.children.length, { min: i } = this.getBoundaries();
    for (let n = 0; n < t; n++) {
      let r = this.options.autoSize ? this.getOffsetForIndex(n) : n * this.getSlideSizeWithGap(), o = this.options.autoSize ? this.getRectSize(this.track.children[n]) + this.convertToPx(this.options.gap) : this.getSlideSizeWithGap(), c = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const l = this.getBoundingClientRect()[this.sizeDim];
        c += l / 2 - (r + o / 2);
      } else
        c -= r;
      if (c <= i + 1)
        return n;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), i = (this.currentIndex % t + t) % t, n = i !== 0 ? t - i : t;
    if (this.options.loop)
      this.currentIndex += n, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const r = this.getRealMaxIndex();
      this.currentIndex < r ? this.currentIndex = Math.min(r, this.currentIndex + n) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), i = (this.currentIndex % t + t) % t, n = i !== 0 ? i : t;
    this.options.loop ? (this.currentIndex -= n, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - n) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  goTo(t, i = !1) {
    if (this.track) {
      if (i && (this.isClickRouting = !0), this.options.loop) {
        const n = this.options.autoSize ? this.originalSlidesCount : this.options.perView, r = t + n, o = this.originalSlidesCount, c = this.track.children.length;
        let l = r, a = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < c) {
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
    const i = parseFloat(this.startPadding) || 0, n = this.getBoundingClientRect()[this.sizeDim], r = Array.from(this.track.children), o = this.convertToPx(this.options.gap);
    let c = 0, l = 1 / 0;
    const a = this.currentIndex;
    for (let d = 0; d < r.length; d++) {
      let u = 0, p = 0;
      if (this.options.autoSize)
        u = this.getOffsetForIndex(d), p = this.getRectSize(r[d]) + o;
      else {
        const y = this.getSlideSizeWithGap();
        u = d * y, p = y;
      }
      let f = i;
      if (this.options.centered ? f += n / 2 - (u + p / 2) : f -= u, !this.options.loop) {
        const { max: y, min: b } = this.getBoundaries();
        this.options.centered && this.options.autoCentered ? f = Math.max(
          b,
          Math.min(y, f)
        ) : this.options.centered || (d === 0 && (f = 0), f < b && (f = b), f > 0 && (f = 0));
      }
      const m = Math.abs(t - f);
      m < l - 0.5 ? (l = m, c = d) : Math.abs(m - l) <= 0.5 && Math.abs(d - a) < Math.abs(c - a) && (c = d, l = m);
    }
    if (this.currentIndex = c, !this.options.loop) {
      const d = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, d);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
  updateNavigation() {
    let t = Array.from(this.querySelectorAll("sx-slider-prev")), i = Array.from(this.querySelectorAll("sx-slider-next"));
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
      t = [.../* @__PURE__ */ new Set([...t, ...r])], i = [.../* @__PURE__ */ new Set([...i, ...o])];
    }
    if (this.options.loop || this.options.rewind) {
      t.forEach((r) => r.removeAttribute("sx-disabled")), i.forEach((r) => r.removeAttribute("sx-disabled"));
      return;
    }
    this.currentIndex <= 0 ? t.forEach((r) => r.setAttribute("sx-disabled", "")) : t.forEach((r) => r.removeAttribute("sx-disabled"));
    const n = this.getRealMaxIndex();
    this.currentIndex >= n ? i.forEach((r) => r.setAttribute("sx-disabled", "")) : i.forEach((r) => r.removeAttribute("sx-disabled"));
  }
  updatePagination(t, i) {
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
      typeof r.renderBullets == "function" && r.renderBullets(t), typeof r.updateActive == "function" && r.updateActive(i);
    });
  }
}
function Ut() {
  customElements.get("sx-slider") || customElements.define("sx-slider", jt), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", Gt), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", _t), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", Vt), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", Wt), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Nt), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", Ht);
}
const I = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);"
};
class Kt extends HTMLElement {
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
    return F(t, I.duration);
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
    let i = this.parentElement;
    for (; i && (Array.from(i.children).forEach((n) => {
      n !== this && !n.contains(this) && (t ? (n.setAttribute("inert", ""), n.setAttribute("aria-hidden", "true")) : (n.removeAttribute("inert"), n.removeAttribute("aria-hidden")));
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
    const n = i[0], r = i[i.length - 1];
    t.shiftKey ? document.activeElement === n && (t.preventDefault(), r.focus()) : document.activeElement === r && (t.preventDefault(), n.focus());
  }
  render() {
    this.style.setProperty("--sx-duration", `${this.duration}ms`);
    const t = this.querySelector('[id*="title"], [class*="title"]'), i = this.querySelector('[id*="desc"], [class*="desc"]'), n = t ? `aria-labelledby="${t.id || "sx-dialog-title"}"` : "", r = i ? `aria-describedby="${i.id || "sx-dialog-desc"}"` : "";
    t && !t.id && (t.id = "sx-dialog-title"), i && !i.id && (i.id = "sx-dialog-desc"), this.innerHTML = `
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
class Qt extends HTMLElement {
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
function Zt() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", Kt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Qt);
}
function Jt() {
  Yt(), Lt(), Ut(), Zt();
}
const Ct = /* @__PURE__ */ new Map();
function x(s, e) {
  Ct.set(s, e);
}
function X(s, e) {
  const t = Ct.get(s);
  return t || (s.startsWith("--") ? te(s, e) : ee(s, e));
}
function te(s, e) {
  return typeof e == "string" && !wt(e) ? {
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
      return i || console.warn(`[six-js] CSS variable "${s}" not set, defaulting to 0`), B(i);
    },
    apply(t, i) {
      t.style.setProperty(s, `${i.num}${i.unit}`);
    }
  };
}
function wt(s) {
  return /^-?[\d.]+[a-z%]*$/i.test(s.trim());
}
function ee(s, e) {
  return typeof e == "string" && !wt(e) ? {
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
      return i === void 0 ? (console.warn(`[six-js] Invalid CSS property: "${s}"`), { num: 0, unit: "" }) : B(i);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
function B(s, e = "") {
  if (typeof s == "number")
    return { num: s, unit: e };
  if (typeof s != "string" || s.length === 0)
    return { num: 0, unit: e };
  const t = s.match(/^(-?[\d.]+)([a-z%]*)$/i);
  return t ? { num: parseFloat(t[1]) || 0, unit: t[2] || e } : { num: parseFloat(s) || 0, unit: e };
}
const ie = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;
function se(s, e, t, i) {
  if (typeof s != "string")
    return B(s, i);
  const n = s.match(ie);
  if (!n)
    return B(s, i);
  const [, r, o, c] = n, l = parseFloat(o), a = c || t || i;
  if (isNaN(l))
    return console.warn(`[six-js] Invalid relative value: "${s}"`), { num: e, unit: a };
  if (r === "/" && l === 0)
    return console.warn(`[six-js] Division by zero: "${s}"`), { num: e, unit: a };
  let d;
  switch (r) {
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
  return { num: d, unit: a };
}
const ne = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i;
function ht(s) {
  const e = document.createElement("span");
  e.style.color = s, e.style.display = "none", document.body.appendChild(e);
  const t = window.getComputedStyle(e).color;
  return document.body.removeChild(e), kt(t);
}
function kt(s) {
  const e = s.match(ne);
  return e ? {
    r: parseFloat(e[1]),
    g: parseFloat(e[2]),
    b: parseFloat(e[3]),
    a: e[4] !== void 0 ? parseFloat(e[4]) : 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}
function re(s, e, t) {
  return {
    r: s.r + (e.r - s.r) * t,
    g: s.g + (e.g - s.g) * t,
    b: s.b + (e.b - s.b) * t,
    a: s.a + (e.a - s.a) * t
  };
}
function oe(s) {
  return `rgba(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)}, ${s.a})`;
}
const Z = /-?[\d.]+/g;
function ct(s) {
  return (s.match(Z) || []).length;
}
function ae(s, e, t) {
  const i = ct(s), n = ct(e), r = i === n && n > 0;
  return r || console.warn(`[six-js] "${t}": shape mismatch (${i} vs ${n} numbers), will snap instead of interpolate`), r;
}
function le(s, e, t) {
  const i = (s.match(Z) || []).map(Number);
  let n = 0;
  return e.replace(Z, (r) => {
    const o = parseFloat(r), c = i[n] ?? o;
    n++;
    const l = c + (o - c) * t;
    return String(Math.round(l * 1e3) / 1e3);
  });
}
const N = /* @__PURE__ */ new WeakMap();
function he(s) {
  let e = N.get(s);
  return e || (e = /* @__PURE__ */ new Map(), N.set(s, e)), e;
}
function ce(s, e) {
  var t;
  return (t = N.get(s)) == null ? void 0 : t.get(e);
}
function de(s, e, t) {
  he(s).set(e, t);
}
function ue(s) {
  const e = N.get(s);
  if (!e || e.size === 0) return "";
  let t = "";
  for (const { fn: i, value: n, unit: r } of e.values())
    t += `${i}(${n}${r}) `;
  return t.trim();
}
function pe(s, e, t) {
  const i = s.style[e];
  s.style[e] = t;
  const n = parseFloat(window.getComputedStyle(s)[e]) || 0;
  return s.style[e] = i, n;
}
const fe = /^random\((.+)\)$/i;
function ge(s) {
  return /^-?[\d.]+$/.test(s.trim());
}
function me(s) {
  const e = s.match(fe);
  if (!e) return s;
  const t = e[1].split(",").map((i) => i.trim());
  if (t.length === 0 || t.length === 1 && t[0] === "")
    return console.warn(`[six-js] Invalid random() syntax: "${s}"`), s;
  if (t.length === 2 && t.every(ge)) {
    const i = parseFloat(t[0]), n = parseFloat(t[1]);
    return i + Math.random() * (n - i);
  }
  return t[Math.floor(Math.random() * t.length)];
}
function R(s, e, t) {
  let i = s;
  return typeof i == "function" && (i = i(e, t)), typeof i == "string" && (i = me(i)), i;
}
let J = {};
function be(s) {
  J = { ...J, ...s };
}
function dt() {
  return J;
}
class ye {
  constructor(e, t, i = "to", n) {
    h(this, "duration");
    h(this, "targets");
    h(this, "segments", []);
    h(this, "lastSegIndex", -1);
    if (typeof e == "string" ? this.targets = Array.from(document.querySelectorAll(e)) : this.targets = Array.isArray(e) ? e : [e], this.targets.length === 0 && console.warn(`[six-js] No elements matched: "${e}"`), t.keyframes) {
      const r = Object.keys(t).filter((o) => o !== "duration" && o !== "ease" && o !== "keyframes");
      r.length > 0 && console.warn(
        `[six-js] keyframes: property [${r.join(", ")}] ngoài keyframes sẽ bị BỎ QUA hoàn toàn, không cộng dồn với các mốc bên trong keyframes. Đưa chúng vào 1 mốc trong keyframes nếu muốn animate.`
      ), this.segments = this.buildKeyframeSegments(t.keyframes, t);
    } else
      this.segments = [this.buildSingleSegment(t, i, n)];
    this.duration = this.segments.reduce((r, o) => r + o.duration, 0), this.applyWillChange();
  }
  get targetElements() {
    return this.targets;
  }
  resolveEase(e) {
    return e && !D[e] && console.warn(`[six-js] Unknown ease "${e}", falling back to linear`), e && D[e] || D.linear;
  }
  resolveDuration(e, t) {
    let i = e ?? t.duration ?? 0.5;
    return i < 0 && (console.warn(`[six-js] Negative duration (${i}), using 0 instead`), i = 0), i;
  }
  resolveProp(e, t, i, n) {
    const r = X(t, n ?? i);
    if (r.type === "discrete") {
      const a = String(n ?? i);
      return {
        key: t,
        isTransform: !1,
        state: { kind: "discrete", value: a, apply: r.apply }
      };
    }
    if (r.type === "color") {
      const a = i !== void 0 ? ht(String(i)) : r.getCurrent(e), d = n !== void 0 ? ht(String(n)) : r.getCurrent(e);
      return { key: t, isTransform: !1, state: { kind: "color", start: a, end: d, apply: r.apply } };
    }
    if (r.type === "complex") {
      const a = i !== void 0 ? String(i) : r.getCurrent(e), d = n !== void 0 ? String(n) : r.getCurrent(e);
      return ae(a, d, t), { key: t, isTransform: !1, state: { kind: "complex", start: a, end: d, apply: r.apply } };
    }
    const o = i !== void 0 ? B(i, r.defaultUnit) : r.getCurrent(e, t);
    let c = n !== void 0 ? se(n, o.num, o.unit, r.defaultUnit) : r.getCurrent(e, t), l;
    if (!r.isTransform && c.unit && o.unit && c.unit !== o.unit) {
      const a = pe(e, t, `${c.num}${c.unit}`);
      l = `${c.num}${c.unit}`, c = { num: a, unit: o.unit };
    }
    return {
      key: t,
      isTransform: r.isTransform,
      state: {
        kind: "numeric",
        start: o.num,
        end: c.num,
        unit: c.unit || o.unit,
        isTransform: r.isTransform,
        transformFn: r.transformFn,
        transformStoreKey: r.transformStoreKey,
        apply: r.apply,
        snapEnd: l
      }
    };
  }
  buildSingleSegment(e, t, i) {
    const n = dt(), r = this.resolveDuration(e.duration, n), o = this.resolveEase(e.ease ?? n.ease), c = /* @__PURE__ */ new Set();
    for (const d in e) c.add(d);
    if (i) for (const d in i) c.add(d);
    c.delete("duration"), c.delete("ease"), c.delete("keyframes");
    const l = [], a = [];
    return this.targets.forEach((d, u) => {
      const p = [];
      let f = !1;
      for (const m of c) {
        let y, b;
        t === "to" ? b = R(e[m], u, d) : t === "from" ? y = R(e[m], u, d) : (m in e && (b = R(e[m], u, d)), i && m in i && (y = R(i[m], u, d)));
        const S = X(m, b ?? y);
        if (S.type === "discrete") {
          S.apply(d, String(b ?? y));
          continue;
        }
        const g = this.resolveProp(d, m, y, b);
        g && (g.isTransform && (f = !0), p.push({ key: g.key, state: g.state }));
      }
      l[u] = p, a[u] = f;
    }), { duration: r, easeFn: o, propStates: l, hasTransform: a };
  }
  buildKeyframeSegments(e, t) {
    const i = dt(), n = t.duration, r = t.ease ?? i.ease, o = Array.isArray(e) ? this.normalizeArrayKeyframes(e, n, r, i) : this.normalizePercentKeyframes(e, n, r, i);
    o.length < 2 && console.warn(`[six-js] keyframes needs at least 2 points, got ${o.length}`);
    const c = this.targets.map(() => ({})), l = [];
    for (let a = 0; a < o.length - 1; a++) {
      const d = o[a], u = o[a + 1], p = [], f = [], m = /* @__PURE__ */ new Set();
      for (const y in u.props) m.add(y);
      this.targets.forEach((y, b) => {
        const S = [];
        let g = !1;
        for (const v of m) {
          const C = R(u.props[v], b, y), O = v in d.props ? R(d.props[v], b, y) : v in c[b] ? c[b][v] : void 0, $ = X(v, C);
          if ($.type === "discrete") {
            S.push({
              key: v,
              state: { kind: "discrete", value: String(C), apply: $.apply }
            }), c[b][v] = C;
            continue;
          }
          const M = this.resolveProp(y, v, O, C);
          M && (M.isTransform && (g = !0), S.push({ key: M.key, state: M.state }), c[b][v] = C);
        }
        p[b] = S, f[b] = g;
      }), l.push({
        duration: u.duration,
        easeFn: u.easeFn,
        propStates: p,
        hasTransform: f,
        onSegmentStart: u.onSegmentStart,
        onSegmentUpdate: u.onSegmentUpdate,
        onSegmentComplete: u.onSegmentComplete
      });
    }
    return l;
  }
  normalizeArrayKeyframes(e, t, i, n) {
    const r = [{ duration: 0, easeFn: D.linear, props: {} }], o = e.filter((a) => a.duration === void 0).length, c = e.reduce((a, d) => a + (d.duration ?? 0), 0), l = t !== void 0 ? o > 0 ? Math.max(0, t - c) / o : 0 : n.duration ?? 0.5;
    for (const a of e) {
      const { duration: d, ease: u, onStart: p, onUpdate: f, onComplete: m, ...y } = a, b = this.resolveDuration(d ?? l, n), S = this.resolveEase(u ?? i);
      r.push({
        duration: b,
        easeFn: S,
        props: y,
        onSegmentStart: p,
        onSegmentUpdate: f,
        onSegmentComplete: m
      });
    }
    return r;
  }
  normalizePercentKeyframes(e, t, i, n) {
    const r = this.resolveDuration(t, n), o = Object.entries(e).map(([l, a]) => {
      const d = l.trim().match(/^(-?[\d.]+)%$/);
      return d ? { pos: parseFloat(d[1]) / 100, props: a } : (console.warn(`[six-js] keyframes: invalid position "${l}", expected e.g. "50%"`), null);
    }).filter((l) => l !== null).sort((l, a) => l.pos - a.pos);
    o.length > 0 && o[0].pos !== 0 && console.warn(`[six-js] keyframes: first position should be "0%", got "${o[0].pos * 100}%"`);
    const c = [];
    for (let l = 0; l < o.length; l++) {
      const { ease: a, onStart: d, onUpdate: u, onComplete: p, ...f } = o[l].props, m = l === 0 ? o[0].pos : o[l - 1].pos, y = l === 0 ? 0 : (o[l].pos - m) * r;
      c.push({
        duration: Math.max(0, y),
        easeFn: this.resolveEase(a ?? i),
        props: f,
        onSegmentStart: d,
        onSegmentUpdate: u,
        onSegmentComplete: p
      });
    }
    return c;
  }
  render(e) {
    var c, l, a, d, u;
    let t = e, i = 0;
    for (; i < this.segments.length - 1 && t > this.segments[i].duration; )
      t -= this.segments[i].duration, i++;
    const n = this.segments[i];
    if (!n) return;
    const r = n.duration === 0 ? 1 : Math.min(Math.max(t / n.duration, 0), 1), o = n.easeFn(r);
    i !== this.lastSegIndex && (this.lastSegIndex !== -1 && i > this.lastSegIndex && ((l = (c = this.segments[this.lastSegIndex]).onSegmentComplete) == null || l.call(c)), (a = n.onSegmentStart) == null || a.call(n), this.lastSegIndex = i), this.targets.forEach((p, f) => {
      const m = n.propStates[f];
      let y = !1;
      for (let b = 0; b < m.length; b++) {
        const { key: S, state: g } = m[b];
        if (g.kind === "discrete") {
          g.apply(p, g.value);
          continue;
        }
        if (g.kind === "color") {
          g.apply(p, re(g.start, g.end, o));
          continue;
        }
        if (g.kind === "complex") {
          g.apply(p, le(g.start, g.end, o));
          continue;
        }
        const v = g.start + (g.end - g.start) * o;
        g.isTransform && g.transformFn ? (de(p, g.transformStoreKey ?? g.transformFn, {
          value: v,
          unit: g.unit,
          fn: g.transformFn
        }), y = !0) : r === 1 && g.snapEnd !== void 0 ? p.style[S] = g.snapEnd : g.apply(p, { num: v, unit: g.unit });
      }
      y && (p.style.transform = ue(p));
    }), (d = n.onSegmentUpdate) == null || d.call(n), i === this.segments.length - 1 && r === 1 && ((u = n.onSegmentComplete) == null || u.call(n));
  }
  onStart() {
    this.applyWillChange();
  }
  applyWillChange() {
    this.targets.forEach((e, t) => {
      this.segments.some((i) => i.hasTransform[t]) && (this.targets[t].style.willChange = "transform");
    });
  }
  onComplete() {
    this.targets.forEach((e, t) => {
      this.segments.some((i) => i.hasTransform[t]) && (this.targets[t].style.willChange = "");
    });
  }
  getTouchedProperties() {
    return this.targets.map((e, t) => {
      const i = /* @__PURE__ */ new Set();
      for (const n of this.segments)
        for (const { key: r } of n.propStates[t]) i.add(r);
      return { target: e, keys: Array.from(i) };
    });
  }
}
class xe {
  constructor(e, t = {}) {
    h(this, "animatable");
    h(this, "elapsed", 0);
    h(this, "rate", 1);
    h(this, "running", !1);
    h(this, "dead", !1);
    h(this, "listeners", {});
    h(this, "delay");
    h(this, "repeat");
    h(this, "repeatDelay");
    h(this, "boomerang");
    h(this, "repeatsDone", 0);
    h(this, "waitRemaining");
    h(this, "hasFiredStart", !1);
    h(this, "isBoomerangReverse", !1);
    h(this, "tick", (e, t) => {
      const i = t / 1e3;
      if (this.waitRemaining > 0) {
        if (this.waitRemaining -= i, this.waitRemaining > 0) return;
        const r = -this.waitRemaining;
        this.waitRemaining = 0, this.fireStartIfNeeded(), this.elapsed += r * this.rate;
      } else
        this.fireStartIfNeeded(), this.elapsed += i * this.rate;
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
    this.repeatsDone++, this.emit("repeat"), this.boomerang ? (this.rate = -1, this.isBoomerangReverse = !0) : (this.elapsed = 0, this.rate = 1), this.repeatDelay > 0 && (this.waitRemaining = this.repeatDelay);
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
    return this.dead || this.running ? this : (this.running = !0, this.rate = this.rate < 0 ? this.rate : 1, w.add(this.tick), this.waitRemaining <= 0 && ((t = (e = this.animatable).onStart) == null || t.call(e)), this);
  }
  reverse() {
    var e, t;
    return this.dead ? this : (this.rate = -1, this.isBoomerangReverse = !1, this.running || (this.running = !0, (t = (e = this.animatable).onStart) == null || t.call(e), w.add(this.tick)), this);
  }
  pause() {
    return this.dead || !this.running ? this : (this.running = !1, w.remove(this.tick), this);
  }
  stop() {
    var e, t;
    this.running = !1, w.remove(this.tick), (t = (e = this.animatable).onComplete) == null || t.call(e);
  }
  seek(e) {
    return this.dead ? this : (this.elapsed = Math.max(0, Math.min(e, this.animatable.duration)), this.animatable.render(this.elapsed), this.emit("update"), this);
  }
  restart() {
    return this.dead ? this : (this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0), this.play(), this);
  }
  reset() {
    return this.dead ? this : (this.pause(), this.elapsed = 0, this.rate = 1, this.repeatsDone = 0, this.hasFiredStart = !1, this.isBoomerangReverse = !1, this.waitRemaining = this.delay, this.animatable.render(0), this.emit("update"), this);
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
}
function tt() {
  var s;
  return ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight;
}
function z(s, e) {
  return s.ratio * e + s.offsetPx;
}
function ut(s) {
  const e = s.trim(), t = e.match(/^(-?[\d.]+)(px)?$/);
  if (t)
    return { ratio: 0, offsetPx: parseFloat(t[1]) };
  const i = e.match(/^(top|center|bottom|[\d.]+%)?\s*(?:([+-]=)([\d.]+)(px|%)?)?$/);
  if (!i || !i[1] && !i[2])
    return console.warn(`[six-js] onScroll: unknown position "${s}", using "top"`), { ratio: 0, offsetPx: 0 };
  const [, n, r, o, c] = i;
  let l = 0;
  n === "center" ? l = 0.5 : n === "bottom" ? l = 1 : n != null && n.endsWith("%") && (l = parseFloat(n) / 100);
  let a = 0;
  if (r && o) {
    const d = parseFloat(o), u = r === "+=" ? d : -d;
    c === "%" ? l += u / 100 : a += u;
  }
  return { ratio: l, offsetPx: a };
}
function pt(s, e, t) {
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
  const [n = "top", r = "top"] = s.trim().split(/\s+/), o = ut(n), c = ut(r), a = window.scrollY + e.top + z(o, e.height), d = z(c, tt());
  return {
    scrollY: a - d,
    viewportSpec: c,
    viewportLabel: r,
    documentY: a,
    triggerLabel: n,
    triggerSpec: o
  };
}
const Se = "sixjs:scrollY:";
function Tt() {
  return Se + location.pathname + location.search;
}
function ve() {
  try {
    const s = sessionStorage.getItem(Tt());
    if (s === null) return null;
    const e = parseFloat(s);
    return Number.isFinite(e) ? e : null;
  } catch {
    return null;
  }
}
function Ce() {
  try {
    sessionStorage.setItem(Tt(), String(window.scrollY));
  } catch {
  }
}
function we() {
  var t;
  const [s] = ((t = performance.getEntriesByType) == null ? void 0 : t.call(performance, "navigation")) ?? [];
  if (s && "type" in s) {
    const i = s.type;
    return i === "reload" || i === "back_forward";
  }
  const e = performance.navigation;
  return (e == null ? void 0 : e.type) === 1 || (e == null ? void 0 : e.type) === 2;
}
let ft = !1;
function ke() {
  if (ft) return;
  ft = !0;
  try {
    "scrollRestoration" in history && (history.scrollRestoration = "manual");
  } catch {
  }
  const s = we() ? ve() : null;
  s !== null && (window.scrollTo(0, s), window.addEventListener("load", () => window.scrollTo(0, s), { once: !0 }));
  let e = !1;
  window.addEventListener(
    "scroll",
    () => {
      e || (e = !0, requestAnimationFrame(() => {
        e = !1, Ce();
      }));
    },
    { passive: !0 }
  );
}
const G = 20, gt = 24, Te = 20;
class Et {
  constructor(e, t, i) {
    h(this, "triggerEl");
    h(this, "playable");
    h(this, "options");
    h(this, "startY", 0);
    h(this, "endY", 0);
    h(this, "startViewportSpec", { ratio: 0, offsetPx: 0 });
    h(this, "endViewportSpec", { ratio: 1, offsetPx: 0 });
    h(this, "startViewportLabel", "");
    h(this, "endViewportLabel", "");
    h(this, "startTriggerY", 0);
    h(this, "endTriggerY", 0);
    h(this, "startTriggerLabel", "");
    h(this, "endTriggerLabel", "");
    h(this, "startTriggerSpec", { ratio: 0, offsetPx: 0 });
    h(this, "triggerLabelsCollide", !1);
    h(this, "smoothedProgress", 0);
    h(this, "smoothInitialized", !1);
    h(this, "wasInside", !1);
    h(this, "lastScrollY", window.scrollY);
    h(this, "rafPending", !1);
    h(this, "pinSpacer", null);
    h(this, "pinState", "before");
    h(this, "pinOriginalStyles", null);
    h(this, "pinRectWidth", 0);
    h(this, "pinRectHeight", 0);
    h(this, "startMarker", null);
    h(this, "endMarker", null);
    h(this, "startTriggerMarker", null);
    h(this, "endTriggerMarker", null);
    h(this, "resizeObserver", null);
    h(this, "recalcRafPending", !1);
    h(this, "onScrollBound", () => this.requestUpdate());
    h(this, "onResizeBound", () => this.recalc());
    h(this, "onLoadBound", () => this.recalc());
    h(this, "tickerBound", (e, t) => this.tickSmooth(t));
    var n;
    ke(), this.triggerEl = e, this.playable = t, this.options = i, i.debug && this.setupDebugMarkers(), this.recalc(), window.addEventListener("scroll", this.onScrollBound, { passive: !0 }), window.addEventListener("resize", this.onResizeBound), (n = window.visualViewport) == null || n.addEventListener("resize", this.onResizeBound), document.readyState === "complete" ? this.recalc() : window.addEventListener("load", this.onLoadBound, { once: !0 }), this.setupResizeObserver(), typeof i.sync == "number" && w.add(this.tickerBound);
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
    const i = this.getMeasureRect(), n = pt(e, i);
    this.startY = n.scrollY, this.startViewportSpec = n.viewportSpec, this.startViewportLabel = n.viewportLabel, this.startTriggerY = n.documentY, this.startTriggerLabel = n.triggerLabel, this.startTriggerSpec = n.triggerSpec;
    const r = pt(t, i, this.startY);
    this.endY = r.scrollY, this.endViewportSpec = r.viewportSpec, this.endViewportLabel = r.viewportLabel, this.endTriggerY = r.documentY, this.endTriggerLabel = r.triggerLabel, this.endY <= this.startY && (console.warn('[six-js] onScroll: "end" resolves before "start", clamping'), this.endY = this.startY + 1), this.triggerLabelsCollide = Math.abs(this.startTriggerY - this.endTriggerY) < gt, this.options.sticky && this.updatePinSpacer(), this.updateDebugMarkers(), this.update(), this.options.sticky && this.applyPinForState(this.pinState);
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
    var l, a, d, u, p, f, m, y, b, S;
    const e = window.scrollY, t = this.computeProgress(), i = e >= this.startY && e <= this.endY, n = e >= this.lastScrollY, r = i && !this.wasInside, o = !i && this.wasInside;
    r ? n ? (a = (l = this.options).onEnter) == null || a.call(l) : (u = (d = this.options).onEnterBack) == null || u.call(d) : o && (n ? (f = (p = this.options).onLeave) == null || f.call(p) : (y = (m = this.options).onLeaveBack) == null || y.call(m)), this.wasInside = i, this.lastScrollY = e, this.options.sticky && this.updatePinState(e), this.updateTriggerMarkerLabelFlip(e);
    const c = this.options.sync ?? !1;
    c === !1 ? r && n && ((S = (b = this.playable).play) == null || S.call(b)) : c === !0 && this.playable.seek(t * this.playable.duration);
  }
  tickSmooth(e) {
    if (typeof this.options.sync != "number") return;
    const t = this.computeProgress();
    if (!this.smoothInitialized) {
      this.smoothInitialized = !0, this.smoothedProgress = t, this.playable.seek(this.smoothedProgress * this.playable.duration);
      return;
    }
    const i = Math.max(0.05, this.options.sync), n = e / 1e3, r = 1 - Math.exp(-3 * n / i);
    this.smoothedProgress += (t - this.smoothedProgress) * r, Math.abs(t - this.smoothedProgress) < 5e-4 && (this.smoothedProgress = t), this.playable.seek(this.smoothedProgress * this.playable.duration);
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
    const e = this.pinSpacer.getBoundingClientRect(), t = z(this.startViewportSpec, tt()), i = z(this.startTriggerSpec, this.pinRectHeight), n = t - i;
    this.triggerEl.style.position = "fixed", this.triggerEl.style.top = `${n}px`, this.triggerEl.style.left = `${e.left}px`, this.triggerEl.style.width = `${this.pinRectWidth}px`, this.triggerEl.style.zIndex = "10";
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
    const { color: t, align: i, position: n } = e, r = document.createElement("div");
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
      ${i}: 0;
      background: ${t};
      color: #000;
      font: 11px monospace;
      padding: 2px 6px;
      white-space: nowrap;
    `, this.applyLabelSide(o, "above"), r.appendChild(o), document.body.appendChild(r), { line: r, label: o };
  }
  applyLabelSide(e, t, i = 0) {
    const n = i * Te;
    t === "above" ? (e.style.top = `${-1 - n}px`, e.style.transform = "translateY(-100%)") : (e.style.top = `${1 + n}px`, e.style.transform = "translateY(0)");
  }
  setMarkerPosition(e, t, i, n = 0) {
    e.line.style.top = `${t}px`, this.applyLabelSide(e.label, i < G ? "below" : "above", n);
  }
  updateTriggerMarkerLabelFlip(e) {
    if (this.startTriggerMarker) {
      const t = this.startTriggerY - e;
      this.applyLabelSide(this.startTriggerMarker.label, t < G ? "below" : "above", 0);
    }
    if (this.endTriggerMarker) {
      const t = this.endTriggerY - e, i = this.triggerLabelsCollide ? 1 : 0;
      this.applyLabelSide(this.endTriggerMarker.label, t < G ? "below" : "above", i);
    }
  }
  updateDebugMarkers() {
    const e = tt(), t = window.scrollY, i = z(this.startViewportSpec, e), n = z(this.endViewportSpec, e), r = Math.abs(i - n) < gt;
    if (this.startMarker && (this.setMarkerPosition(this.startMarker, i, i, 0), this.startMarker.label.textContent = `start: "${this.startViewportLabel}"`), this.endMarker && (this.setMarkerPosition(this.endMarker, n, n, r ? 1 : 0), this.endMarker.label.textContent = `end: "${this.endViewportLabel}"`), this.startTriggerMarker && (this.setMarkerPosition(this.startTriggerMarker, this.startTriggerY, this.startTriggerY - t, 0), this.startTriggerMarker.label.textContent = `start: "${this.startTriggerLabel}"`), this.endTriggerMarker) {
      const o = this.triggerLabelsCollide ? 1 : 0;
      this.setMarkerPosition(this.endTriggerMarker, this.endTriggerY, this.endTriggerY - t, o), this.endTriggerMarker.label.textContent = `end: "${this.endTriggerLabel}"`;
    }
  }
  removeDebugMarkers() {
    var e, t, i, n;
    (e = this.startMarker) == null || e.line.remove(), (t = this.endMarker) == null || t.line.remove(), (i = this.startTriggerMarker) == null || i.line.remove(), (n = this.endTriggerMarker) == null || n.line.remove(), this.startMarker = null, this.endMarker = null, this.startTriggerMarker = null, this.endTriggerMarker = null;
  }
  destroy() {
    var e, t;
    window.removeEventListener("scroll", this.onScrollBound), window.removeEventListener("resize", this.onResizeBound), (e = window.visualViewport) == null || e.removeEventListener("resize", this.onResizeBound), window.removeEventListener("load", this.onLoadBound), (t = this.resizeObserver) == null || t.disconnect(), this.resizeObserver = null, w.remove(this.tickerBound), this.teardownPin(), this.removeDebugMarkers();
  }
}
const mt = /* @__PURE__ */ new WeakMap();
let bt = !1;
function Ee(s, e, t) {
  if (t) {
    t === "auto" && !bt && (bt = !0, console.warn(
      '[six-js] overwrite: "auto" (chỉ huỷ property trùng) chưa được hỗ trợ đầy đủ, tạm thời xử lý như overwrite: true (huỷ toàn bộ tween cũ trên cùng target).'
    ));
    for (const i of s) {
      let n = mt.get(i);
      n || (n = /* @__PURE__ */ new Set(), mt.set(i, n));
      for (const o of n)
        o !== e && o.kill();
      n.clear(), n.add(e);
      const r = () => n.delete(e);
      e.on("complete", r), e.on("reverseComplete", r);
    }
  }
}
function Ae(s, e, t) {
  if (typeof t == "number")
    return s * t;
  const { each: i, from: n = "start" } = t;
  if (typeof i != "number" || isNaN(i))
    return console.warn(`[six-js] stagger.each phải là số, nhận được ${i} — dùng 0 thay thế`), 0;
  let r;
  return n === "start" ? r = s : n === "end" ? r = e - 1 - s : n === "center" ? r = Math.abs(s - (e - 1) / 2) : r = Math.abs(s - n), r * i;
}
class Me {
  constructor(e, t = []) {
    h(this, "delays");
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
      const n = t.duration + (this.delays[i] ?? 0);
      n > e && (e = n);
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
const it = {
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
}, q = 180 / Math.PI;
function Ie(s) {
  const e = window.getComputedStyle(s).transform;
  return !e || e === "none" ? { ...it } : e.startsWith("matrix3d") ? ze(e) : Re(e);
}
function Re(s) {
  const e = s.match(/matrix\(([^)]+)\)/);
  if (!e) return { ...it };
  const t = e[1].split(",").map((p) => parseFloat(p.trim())), [i, n, r, o, c, l] = t, a = Math.sqrt(i * i + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, i) * q;
  return {
    x: c,
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
function ze(s) {
  const e = s.match(/matrix3d\(([^)]+)\)/);
  if (!e) return { ...it };
  const t = e[1].split(",").map((g) => parseFloat(g.trim())), i = t[0], n = t[1], r = t[2], o = t[4], c = t[5], l = t[6];
  t[8], t[9];
  const a = t[10], d = t[12], u = t[13], p = t[14], f = Math.sqrt(i * i + n * n + r * r), m = Math.sqrt(o * o + c * c + l * l), y = Math.atan2(n, i) * q, b = Math.atan2(-r, Math.sqrt(l * l + a * a)) * q, S = Math.atan2(l, a) * q;
  return {
    x: d,
    y: u,
    z: p,
    rotate: y,
    rotateX: S,
    rotateY: b,
    rotateZ: y,
    scale: f,
    scaleX: f,
    scaleY: m,
    skewX: 0,
    skewY: 0
  };
}
function k(s, e, t, i = s) {
  return {
    type: "numeric",
    isTransform: !0,
    transformFn: s,
    transformStoreKey: i,
    defaultUnit: e,
    getCurrent(n) {
      const r = ce(n, i);
      return r ? { num: r.value, unit: r.unit } : { num: Ie(n)[t], unit: e };
    },
    apply() {
    }
  };
}
x("x", k("translateX", "px", "x"));
x("y", k("translateY", "px", "y"));
x("z", k("translateZ", "px", "z"));
x("translateX", k("translateX", "px", "x", "translateX-2"));
x("translateY", k("translateY", "px", "y", "translateY-2"));
x("rotate", k("rotate", "deg", "rotate"));
x("rotateX", k("rotateX", "deg", "rotateX"));
x("rotateY", k("rotateY", "deg", "rotateY"));
x("rotateZ", k("rotateZ", "deg", "rotateZ"));
x("scale", k("scale", "", "scale"));
x("scaleX", k("scaleX", "", "scaleX"));
x("scaleY", k("scaleY", "", "scaleY"));
x("skewX", k("skewX", "deg", "skewX"));
x("skewY", k("skewY", "deg", "skewY"));
function E(s, e) {
  return {
    type: "numeric",
    isTransform: !1,
    defaultUnit: e,
    getCurrent(t) {
      const i = window.getComputedStyle(t)[s];
      return B(i, e);
    },
    apply(t, i) {
      t.style[s] = `${i.num}${i.unit}`;
    }
  };
}
x("width", E("width", "px"));
x("height", E("height", "px"));
x("top", E("top", "px"));
x("left", E("left", "px"));
x("right", E("right", "px"));
x("bottom", E("bottom", "px"));
x("borderWidth", E("borderWidth", "px"));
x("opacity", E("opacity", ""));
x("fontSize", E("fontSize", "px"));
x("letterSpacing", E("letterSpacing", "px"));
function H(s) {
  return {
    type: "color",
    cssKey: s,
    getCurrent(e) {
      const t = window.getComputedStyle(e)[s];
      return kt(t);
    },
    apply(e, t) {
      e.style[s] = oe(t);
    }
  };
}
x("backgroundColor", H("backgroundColor"));
x("color", H("color"));
x("borderColor", H("borderColor"));
x("background", H("backgroundColor"));
function Pe(s) {
  return {
    type: "discrete",
    cssKey: s,
    apply(e, t) {
      e.style[s] = t;
    }
  };
}
const Be = [
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
Be.forEach((s) => x(s, Pe(s)));
function st(s) {
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
x("boxShadow", st("boxShadow"));
x("filter", st("filter"));
x("borderRadius", st("borderRadius"));
Pt();
let yt = !1;
function Le() {
  yt || (Jt(), yt = !0);
}
function At(s) {
  return typeof s == "string" ? document.querySelector(s) : Array.isArray(s) ? s[0] ?? null : s;
}
function De(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : Array.isArray(s) ? s : [s];
}
function xt(s, e, t, i, n, r) {
  const o = new ye(s, e, t, i), c = new xe(o, {
    autoplay: r.onScroll ? !1 : !r.paused,
    delay: (r.delay ?? 0) + n,
    repeat: r.repeat,
    repeatDelay: r.repeatDelay,
    boomerang: r.boomerang
  });
  if (r.onStart && c.on("start", r.onStart), r.onUpdate && c.on("update", r.onUpdate), r.onComplete && c.on("complete", r.onComplete), r.onRepeat && c.on("repeat", r.onRepeat), r.onReverseComplete && c.on("reverseComplete", r.onReverseComplete), Ee(o.targetElements, c, r.overwrite), r.onScroll) {
    const l = At(r.onScroll.target ?? s);
    l ? new Et(l, c, r.onScroll) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return c;
}
function nt(s, e, t, i) {
  const {
    onScroll: n,
    stagger: r,
    delay: o,
    paused: c,
    repeat: l,
    repeatDelay: a,
    boomerang: d,
    overwrite: u,
    onStart: p,
    onUpdate: f,
    onComplete: m,
    onRepeat: y,
    onReverseComplete: b,
    ...S
  } = e, g = { onScroll: n, delay: o, paused: c, repeat: l, repeatDelay: a, boomerang: d, overwrite: u, onStart: p, onUpdate: f, onComplete: m, onRepeat: y, onReverseComplete: b };
  if (r === void 0)
    return xt(s, S, t, i, 0, g);
  const v = De(s);
  v.length === 0 && console.warn("[six-js] stagger: no elements matched"), Object.values(S).some((A) => typeof A == "function") && console.warn(
    "[six-js] stagger: function value (index, el) => ... luôn nhận index=0 vì mỗi phần tử stagger giờ là 1 tween độc lập, không phải index gốc trong danh sách. Nếu cần giá trị theo index gốc, hãy tự tính mảng giá trị trước thay vì dùng callback."
  );
  const O = v.map((A, V) => Ae(V, v.length, r)), $ = n ? { ...g, onScroll: void 0, paused: !0 } : g, M = !!n && (n.sync === !0 || typeof n.sync == "number"), Mt = v.map(
    (A, V) => xt(A, S, t, i, M ? 0 : O[V], $)
  ), rt = new Me(Mt, O);
  if (n) {
    const A = At(n.target ?? s);
    A ? new Et(A, rt, n) : console.warn("[six-js] onScroll: trigger element not found");
  }
  return rt;
}
function Fe(s, e) {
  return nt(s, e, "to");
}
function Oe(s, e) {
  return nt(s, e, "from");
}
function $e(s, e, t) {
  return nt(s, t, "fromTo", e);
}
const _e = {
  initElement: Le,
  to: Fe,
  from: Oe,
  fromTo: $e,
  setDefaults: be
};
export {
  zt as VERSION,
  _e as six
};
