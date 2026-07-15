var _t = Object.defineProperty;
var wt = (t, e, i) => e in t ? _t(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var u = (t, e, i) => wt(t, typeof e != "symbol" ? e + "" : e, i);
const Ge = "0.0.33";
function dt(t, e, i) {
  return e < 0 ? 1 / 0 : t * (e + 1) + i * e;
}
function Z(t, e, i, r, n) {
  if (e <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (i === 0)
    return { iteration: 0, time: t < 0 ? 0 : t > e ? e : t, reversed: !1 };
  const s = e + r, o = dt(e, i, r);
  let a = t;
  a < 0 ? a = 0 : i >= 0 && a > o && (a = o);
  let l = Math.floor(a / s), h = a - l * s;
  r === 0 && l > 0 && h === 0 && (l -= 1, h = e), i >= 0 && l > i && (l = i, h = a - l * s), h > e && (h = e);
  const c = n && l % 2 === 1;
  return c && (h = e - h), { iteration: l, time: h, reversed: c };
}
let A = null;
function xt() {
  return A;
}
class bt {
  constructor(e) {
    u(this, "captured", /* @__PURE__ */ new Set());
    u(this, "dead", !1);
    e && this.run(e);
  }
  run(e) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const i = A;
    A = this;
    try {
      return e(this);
    } finally {
      A = i;
    }
  }
  add(e) {
    this.dead || this.captured.add(e);
  }
  _capture(e) {
    this.add(e);
  }
  revert() {
    this.captured.forEach((e) => e.kill()), this.captured.clear();
  }
  kill() {
    this.dead || (this.dead = !0, this.revert());
  }
  get isDead() {
    return this.dead;
  }
}
function vt(t) {
  return new bt(t);
}
let St = 0;
class ft {
  constructor(e = {}) {
    u(this, "id", ++St);
    u(this, "parent", null);
    /** Kept after removal from `parent` (GSAP calls this the "detached parent") so time queries made after removal still resolve. */
    u(this, "_dp", null);
    u(this, "_next", null);
    u(this, "_prev", null);
    u(this, "_start", 0);
    u(this, "_dur", 0);
    u(this, "_tDur", 0);
    u(this, "_time", 0);
    u(this, "_tTime", 0);
    /** Functional timeScale - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
    u(this, "_ts", 1);
    /** Recorded/user timeScale - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
    u(this, "_rts", 1);
    u(this, "_delay");
    u(this, "_repeat");
    u(this, "_repeatDelay");
    u(this, "_yoyo");
    u(this, "_initted", !1);
    u(this, "_dirty", !0);
    u(this, "_hasStarted", !1);
    /** Raw (pre-clamp) totalTime from the previous render() call - see the zero-duration handling in render(). */
    u(this, "_rawPrev", -1);
    u(this, "listeners", {});
    var i;
    (i = xt()) == null || i._capture(this), this._delay = Math.max(0, e.delay ?? 0), this._repeat = e.repeat ?? 0, this._repeatDelay = Math.max(0, e.repeatDelay ?? 0), this._yoyo = e.yoyo ?? !1, e.onStart && this.on("start", e.onStart), e.onUpdate && this.on("update", e.onUpdate), e.onComplete && this.on("complete", e.onComplete), e.onRepeat && this.on("repeat", e.onRepeat), e.onReverseComplete && this.on("reverseComplete", e.onReverseComplete), e.paused && (this._ts = 0);
  }
  // ---- rendering ----
  /**
   * Renders this animation at `totalTime` (on ITS OWN axis, delay included at the front).
   * `suppressEvents` skips start/update/repeat/complete callbacks (used by seek()). `force`
   * re-renders even if `totalTime` hasn't changed since the last render.
   */
  render(e, i = !1, r = !1) {
    const n = this._tTime, s = this.totalDuration();
    let o = e;
    o < 0 ? o = 0 : this._repeat >= 0 && o > s && (o = s);
    const a = !this._initted;
    a && (this._initted = !0, this._onInit());
    const l = Z(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), h = a ? l : Z(n - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), c = l.iteration !== h.iteration;
    this._tTime = o, this._time = l.time, this._renderIteration(l.time, l.reversed, l.iteration, i, r || c);
    const d = this._rawPrev;
    if (this._rawPrev = e, i) return;
    const f = s === 0, g = f ? e < 0 : o <= 0, y = f ? e >= 0 : this._repeat >= 0 && o >= s, _ = f ? d < 0 : n <= 0, k = f ? d >= 0 : this._repeat >= 0 && n >= s, v = f ? e > d : o > n, yt = f ? e < d : o < n;
    !this._hasStarted && !g && (this._hasStarted = !0, this.emit("start")), v && c && this.emit("repeat"), this.emit("update"), v && !k && y ? this.emit("complete") : yt && !_ && g && this.emit("reverseComplete");
  }
  /** Hook for subclasses that need to do one-time setup on first render (e.g. Tween building its PropertyTracks). */
  _onInit() {
  }
  // ---- duration ----
  duration(e) {
    return e === void 0 ? this._dur : (this._dur = Math.max(0, e), this.invalidate(), this._uncache(), this);
  }
  totalDuration(e) {
    if (e === void 0)
      return this._dirty && this._recomputeTotalDuration(), this._tDur;
    const i = this.totalDuration();
    return i > 0 && e > 0 && this.timeScale(this.timeScale() * (i / e)), this;
  }
  _recomputeTotalDuration() {
    this._tDur = this._delay + dt(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
  }
  _uncache() {
    var e;
    this._dirty = !0, (e = this.parent) == null || e._uncache();
  }
  // ---- repeat / yoyo / delay ----
  repeat(e) {
    return e === void 0 ? this._repeat : (this._repeat = e, this._uncache(), this);
  }
  repeatDelay(e) {
    return e === void 0 ? this._repeatDelay : (this._repeatDelay = Math.max(0, e), this._uncache(), this);
  }
  yoyo(e) {
    return e === void 0 ? this._yoyo : (this._yoyo = e, this);
  }
  delay(e) {
    return e === void 0 ? this._delay : (this._delay = Math.max(0, e), this._uncache(), this);
  }
  startTime(e) {
    var i;
    return e === void 0 ? this._start : (this._start = e, (i = this.parent) == null || i._uncache(), this);
  }
  endTime() {
    return this._start + this.totalDuration() / Math.abs(this._rts || 1);
  }
  // ---- time scale / direction ----
  timeScale(e) {
    if (e === void 0) return this._rts;
    e === 0 && (e = this._rts < 0 ? -1e-8 : 1e-8);
    const i = this._ts === 0;
    return this._rts = e, this._ts = i ? 0 : e, this;
  }
  reversed(e) {
    return e === void 0 ? this._rts < 0 : (this.timeScale(e ? -Math.abs(this._rts) : Math.abs(this._rts)), this);
  }
  // ---- paused / play state ----
  paused(e) {
    return e === void 0 ? this._ts === 0 : (this._ts = e ? 0 : this._rts, this);
  }
  play() {
    return this.paused(!1), this;
  }
  pause() {
    return this.paused(!0), this;
  }
  resume() {
    return this.play();
  }
  reverse() {
    return this.reversed(!0), this.play();
  }
  restart(e = !1) {
    return this._hasStarted = !1, this.totalTime(e ? -this._delay : 0, !0), this.play();
  }
  // ---- time / totalTime / progress ----
  totalTime(e, i = !1) {
    return e === void 0 ? this._tTime : (this.render(e, i, !1), this);
  }
  time(e, i = !1) {
    if (e === void 0) return this._time;
    const r = this._tTime - this._delay - this._time;
    return this.totalTime(this._delay + r + Math.max(0, Math.min(e, this._dur)), i);
  }
  progress(e) {
    return e === void 0 ? this._dur ? this._time / this._dur : 1 : this.time(e * this._dur);
  }
  totalProgress(e) {
    const i = this.totalDuration();
    return e === void 0 ? i ? this._tTime / i : 1 : this.totalTime(e * i);
  }
  seek(e, i = !0) {
    return this.totalTime(e, i), this;
  }
  // ---- lifecycle ----
  invalidate() {
    return this._initted = !1, this;
  }
  kill() {
    return this.parent && (this._dp = this.parent, this.parent._removeChild(this), this.parent = null), this;
  }
  isActive() {
    const e = this.totalDuration();
    return !this.paused() && !!this.parent && this._tTime > 0 && (e === 1 / 0 || this._tTime < e);
  }
  // ---- events ----
  on(e, i) {
    var r;
    return ((r = this.listeners)[e] ?? (r[e] = /* @__PURE__ */ new Set())).add(i), this;
  }
  off(e, i) {
    var r;
    return (r = this.listeners[e]) == null || r.delete(i), this;
  }
  emit(e) {
    var i;
    (i = this.listeners[e]) == null || i.forEach((r) => r());
  }
}
let q = { duration: 0.5, ease: "power1.out" };
function Tt(t) {
  q = { ...q, ...t };
}
function Mt() {
  return q;
}
function P(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) {
    const n = t - 0.5454545454545454;
    return 7.5625 * n * n + 0.75;
  }
  if (t < 2.5 / 2.75) {
    const n = t - 0.8181818181818182;
    return 7.5625 * n * n + 0.9375;
  }
  const r = t - 2.625 / 2.75;
  return 7.5625 * r * r + 0.984375;
}
const S = 1.70158, C = S * 1.525, Q = 2 * Math.PI / 3, tt = 2 * Math.PI / 4.5, H = {
  none: (t) => t,
  linear: (t) => t,
  "power1.in": (t) => t * t,
  "power1.out": (t) => 1 - (1 - t) * (1 - t),
  "power1.inOut": (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  "power2.in": (t) => t * t * t,
  "power2.out": (t) => 1 - Math.pow(1 - t, 3),
  "power2.inOut": (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  "power3.in": (t) => t ** 4,
  "power3.out": (t) => 1 - (1 - t) ** 4,
  "power3.inOut": (t) => t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2,
  "power4.in": (t) => t ** 5,
  "power4.out": (t) => 1 - (1 - t) ** 5,
  "power4.inOut": (t) => t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2,
  "sine.in": (t) => 1 - Math.cos(t * Math.PI / 2),
  "sine.out": (t) => Math.sin(t * Math.PI / 2),
  "sine.inOut": (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  "expo.in": (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  "expo.out": (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  "expo.inOut": (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  "circ.in": (t) => 1 - Math.sqrt(1 - t * t),
  "circ.out": (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
  "circ.inOut": (t) => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
  "back.in": (t) => (S + 1) * t * t * t - S * t * t,
  "back.out": (t) => {
    const e = t - 1;
    return 1 + (S + 1) * e * e * e + S * e * e;
  },
  "back.inOut": (t) => {
    if (t < 0.5) {
      const i = 2 * t;
      return i * i * ((C + 1) * i - C) / 2;
    }
    const e = 2 * t - 2;
    return (e * e * ((C + 1) * e + C) + 2) / 2;
  },
  "bounce.in": (t) => 1 - P(1 - t),
  "bounce.out": P,
  "bounce.inOut": (t) => t < 0.5 ? (1 - P(1 - 2 * t)) / 2 : (1 + P(2 * t - 1)) / 2,
  "elastic.in": (t) => t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * Q),
  "elastic.out": (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * Q) + 1,
  "elastic.inOut": (t) => t === 0 || t === 1 ? t : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * tt)) / 2 : Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * tt) / 2 + 1
};
function kt(t) {
  return typeof t == "function" ? t : t && H[t] ? H[t] : H["power1.out"];
}
const Pt = /^#([0-9a-f]{3,8})$/i, Ct = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, Rt = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, $t = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  aqua: [0, 255, 255],
  magenta: [255, 0, 255],
  fuchsia: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  lime: [0, 255, 0],
  navy: [0, 0, 128],
  teal: [0, 128, 128],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
  gold: [255, 215, 0],
  indigo: [75, 0, 130],
  violet: [238, 130, 238],
  coral: [255, 127, 80],
  salmon: [250, 128, 114],
  khaki: [240, 230, 140],
  crimson: [220, 20, 60],
  chocolate: [210, 105, 30],
  tomato: [255, 99, 71],
  orchid: [218, 112, 214],
  plum: [221, 160, 221],
  turquoise: [64, 224, 208],
  tan: [210, 180, 140],
  beige: [245, 245, 220],
  ivory: [255, 255, 240],
  lavender: [230, 230, 250],
  skyblue: [135, 206, 235],
  steelblue: [70, 130, 180],
  slateblue: [106, 90, 205],
  royalblue: [65, 105, 225],
  dodgerblue: [30, 144, 255],
  deepskyblue: [0, 191, 255],
  cornflowerblue: [100, 149, 237],
  forestgreen: [34, 139, 34],
  seagreen: [46, 139, 87],
  springgreen: [0, 255, 127],
  yellowgreen: [154, 205, 50],
  darkred: [139, 0, 0],
  darkblue: [0, 0, 139],
  darkgreen: [0, 100, 0],
  darkorange: [255, 140, 0],
  darkviolet: [148, 0, 211],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  lightblue: [173, 216, 230],
  lightgreen: [144, 238, 144],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightyellow: [255, 255, 224],
  hotpink: [255, 105, 180],
  deeppink: [255, 20, 147],
  chartreuse: [127, 255, 0],
  aquamarine: [127, 255, 212],
  firebrick: [178, 34, 34],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  peachpuff: [255, 218, 185],
  sienna: [160, 82, 45],
  transparent: [0, 0, 0]
};
function Dt(t) {
  return $t[t.toLowerCase()] ?? null;
}
function p(t, e, i) {
  const r = i === 1 ? t[e] + t[e] : t.slice(e, e + 2);
  return parseInt(r, 16);
}
function L(t) {
  const e = t.trim(), i = e.match(Pt);
  if (i) {
    const n = i[1];
    if (n.length === 3 || n.length === 4) {
      const s = n.length === 4 ? p(n, 3, 1) / 255 : 1;
      return { r: p(n, 0, 1), g: p(n, 1, 1), b: p(n, 2, 1), a: s };
    }
    if (n.length === 6 || n.length === 8) {
      const s = n.length === 8 ? p(n, 6, 2) / 255 : 1;
      return { r: p(n, 0, 2), g: p(n, 2, 2), b: p(n, 4, 2), a: s };
    }
  }
  const r = e.match(Ct) ?? e.match(Rt);
  if (r) {
    const [, n, s, o, a] = r;
    return {
      r: parseFloat(n),
      g: parseFloat(s),
      b: parseFloat(o),
      a: a === void 0 ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)
    };
  }
  if (/^[a-z]+$/i.test(e)) {
    const n = Dt(e);
    if (n) return { r: n[0], g: n[1], b: n[2], a: e.toLowerCase() === "transparent" ? 0 : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function mt(t, e, i) {
  return {
    r: Math.round(t.r + (e.r - t.r) * i),
    g: Math.round(t.g + (e.g - t.g) * i),
    b: Math.round(t.b + (e.b - t.b) * i),
    a: Math.round((t.a + (e.a - t.a) * i) * 1e3) / 1e3
  };
}
function V(t) {
  return `rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`;
}
const At = {
  x: 0,
  y: 0,
  z: 0,
  xPercent: 0,
  yPercent: 0,
  rotation: 0,
  rotationX: 0,
  rotationY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0
}, et = /* @__PURE__ */ new WeakMap(), Lt = /^matrix\(([^)]+)\)$/, It = /^matrix3d\(([^)]+)\)$/, it = 180 / Math.PI;
function Yt(t) {
  if (!t || t === "none") return {};
  const e = t.match(Lt);
  if (e) {
    const [r, n, s, o, a, l] = e[1].split(",").map(Number), h = Math.sqrt(r * r + n * n), c = Math.sqrt(s * s + o * o), d = Math.atan2(n, r) * it, f = (Math.atan2(s, o) * it + d) * -1;
    return { x: a, y: l, rotation: d, scaleX: h, scaleY: c, skewX: Et(f) };
  }
  const i = t.match(It);
  if (i) {
    const r = i[1].split(",").map(Number);
    return { x: r[12], y: r[13], z: r[14] };
  }
  return {};
}
function Ot(t) {
  return typeof getComputedStyle > "u" ? {} : Yt(getComputedStyle(t).transform);
}
function Et(t) {
  let e = t % 360;
  return e > 180 && (e -= 360), e < -180 && (e += 360), e;
}
function I(t) {
  let e = et.get(t);
  return e || (e = { ...At, ...Ot(t) }, et.set(t, e)), e;
}
function m(t) {
  return Math.round(t * 1e4) / 1e4;
}
function zt(t, e) {
  const i = [];
  return (t.xPercent || t.yPercent) && i.push(`translate(${m(t.xPercent)}%, ${m(t.yPercent)}%)`), (t.x || t.y || t.z) && i.push(e ? `translate3d(${m(t.x)}px, ${m(t.y)}px, ${m(t.z)}px)` : `translate(${m(t.x)}px, ${m(t.y)}px)`), t.rotation && i.push(`rotate(${m(t.rotation)}deg)`), t.rotationX && i.push(`rotateX(${m(t.rotationX)}deg)`), t.rotationY && i.push(`rotateY(${m(t.rotationY)}deg)`), t.skewX && i.push(`skewX(${m(t.skewX)}deg)`), t.skewY && i.push(`skewY(${m(t.skewY)}deg)`), (t.scaleX !== 1 || t.scaleY !== 1) && i.push(`scale(${m(t.scaleX)}, ${m(t.scaleY)})`), i.length ? i.join(" ") : "none";
}
function Ft(t, e, i) {
  t.style.transform = zt(e, i);
}
const Xt = {
  x: "x",
  y: "y",
  z: "z",
  xPercent: "xPercent",
  yPercent: "yPercent",
  rotation: "rotation",
  rotate: "rotation",
  rotationX: "rotationX",
  rotateX: "rotationX",
  rotationY: "rotationY",
  rotateY: "rotationY",
  scaleX: "scaleX",
  scaleY: "scaleY",
  skewX: "skewX",
  skewY: "skewY"
}, Ht = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), Nt = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), Ut = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), qt = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), Vt = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
function b(t) {
  if (typeof t == "number") return !0;
  if (typeof t != "string") return !1;
  const e = t.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(e) || /^[+-]=/.test(e);
}
function T(t, e = "") {
  if (typeof t == "number") return { value: t, unit: e };
  const i = String(t).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  return i ? { value: parseFloat(i[1]), unit: i[2] || e } : { value: 0, unit: e };
}
function Y(t, e) {
  var r;
  const i = (r = t.style) == null ? void 0 : r[e];
  return i || (typeof getComputedStyle > "u" ? "" : getComputedStyle(t)[e] || "");
}
function Bt(t) {
  const e = Ht.has(t) ? "deg" : Nt.has(t) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: t,
    defaultUnit: e,
    get(i) {
      return { value: I(i)[t], unit: e };
    },
    set(i, r) {
      I(i)[t] = r.value;
    }
  };
}
function Wt(t) {
  return {
    kind: "color",
    get(e) {
      return L(Y(e, t) || "rgba(0,0,0,0)");
    },
    set(e, i) {
      e.style[t] = V(i);
    }
  };
}
function Kt(t) {
  return {
    kind: "complex",
    get(e) {
      return Y(e, t);
    },
    set(e, i) {
      e.style[t] = i;
    }
  };
}
function jt(t, e) {
  const i = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(t).trim() : "";
  return b(e) || b(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(r) {
      return T(getComputedStyle(r).getPropertyValue(t).trim());
    },
    set(r, n) {
      r.style.setProperty(t, `${n.value}${n.unit}`);
    }
  } : {
    kind: "discrete",
    get(r) {
      return getComputedStyle(r).getPropertyValue(t).trim();
    },
    set(r, n) {
      r.style.setProperty(t, n);
    }
  };
}
function Gt(t, e) {
  const i = Vt.has(t) ? "" : "px";
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: i,
    get(r) {
      const n = Y(r, t);
      return b(n) ? T(n, i) : { value: 0, unit: i };
    },
    set(r, n) {
      r.style[t] = i === "" ? `${n.value}` : `${n.value}${n.unit}`;
    }
  } : {
    kind: "discrete",
    get(r) {
      return Y(r, t);
    },
    set(r, n) {
      r.style[t] = n;
    }
  };
}
function Jt(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(r) {
      return T(r.getAttribute(t) ?? "0");
    },
    set(r, n) {
      r.setAttribute(t, String(n.value));
    }
  } : {
    kind: "discrete",
    get(r) {
      return r.getAttribute(t) ?? "";
    },
    set(r, n) {
      r.setAttribute(t, n);
    }
  };
}
function rt(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(i) {
      return { value: Number(i[t]) || 0, unit: "" };
    },
    set(i, r) {
      i[t] = r.value;
    }
  } : {
    kind: "discrete",
    get(i) {
      return String(i[t] ?? "");
    },
    set(i, r) {
      i[t] = r;
    }
  };
}
function Zt(t, e, i) {
  const r = Xt[e];
  if (r) return Bt(r);
  if (Ut.has(e)) return Wt(e);
  if (qt.has(e)) return Kt(e);
  if (e.startsWith("--")) return jt(e, i);
  const n = t.style;
  return n && e in n ? Gt(e, i) : e in t && typeof t[e] == "number" ? rt(e, i ?? t[e]) : typeof t.setAttribute == "function" ? Jt(e, i) : rt(e, i);
}
const Qt = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function te(t) {
  if (t[0] === "#" || /^(rgba?|hsla?)\(/i.test(t))
    return { type: "color", value: L(t) };
  const e = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(e[1]), unit: e[2] };
}
function O(t) {
  const e = [], i = [];
  let r = 0;
  for (const n of t.matchAll(Qt))
    i.push(t.slice(r, n.index)), e.push(te(n[0])), r = n.index + n[0].length;
  return i.push(t.slice(r)), { literals: i, tokens: e };
}
function ee(t, e) {
  const i = O(t).tokens, r = O(e).tokens;
  return i.length === r.length && i.every((n, s) => n.type === r[s].type);
}
function ie(t, e, i) {
  if (!t || t.type !== e.type) {
    const o = i >= 1 ? e : t ?? e;
    return o.type === "color" ? V(o.value) : `${o.value}${o.unit}`;
  }
  if (e.type === "color")
    return V(mt(t.value, e.value, i));
  const r = t.value, n = r + (e.value - r) * i, s = e.unit || t.unit;
  return `${Math.round(n * 1e4) / 1e4}${s}`;
}
function re(t, e, i) {
  const r = O(t), n = O(e);
  let s = "";
  for (let o = 0; o < n.literals.length; o++)
    s += n.literals[o], o < n.tokens.length && (s += ie(r.tokens[o], n.tokens[o], i));
  return s;
}
const ne = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function se(t) {
  return ne.test(t);
}
function nt(t, e, i, r) {
  if (!r || r === "px" || r === "deg" || r === "rad" || r === "turn") return i;
  if (r === "rem") {
    const n = typeof document < "u" && parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return i * n;
  }
  if (r === "em") {
    const n = typeof getComputedStyle < "u" && parseFloat(getComputedStyle(t).fontSize) || 16;
    return i * n;
  }
  if (r === "vh") return typeof window < "u" ? i / 100 * window.innerHeight : i;
  if (r === "vw") return typeof window < "u" ? i / 100 * window.innerWidth : i;
  if (r === "%") {
    const n = t.parentElement;
    if (!n) return i;
    const s = se(e) ? n.clientWidth : n.clientHeight;
    return i / 100 * s;
  }
  return i;
}
const st = /* @__PURE__ */ new Set([
  "duration",
  "ease",
  "delay",
  "repeat",
  "repeatDelay",
  "yoyo",
  "paused",
  "overwrite",
  "onStart",
  "onUpdate",
  "onComplete",
  "onRepeat",
  "onReverseComplete"
]), B = /^([+\-*/])=(-?[\d.]+)$/;
function ot(t, e) {
  const i = e.match(B);
  if (!i) return null;
  const r = parseFloat(i[2]);
  switch (i[1]) {
    case "+":
      return t + r;
    case "-":
      return t - r;
    case "*":
      return t * r;
    case "/":
      return t / r;
    default:
      return t;
  }
}
function oe(t, e) {
  const i = /* @__PURE__ */ new Set();
  for (const r in t) st.has(r) || i.add(r);
  if (e)
    for (const r in e) st.has(r) || i.add(r);
  return [...i];
}
function ae(t, e, i, r, n) {
  const s = i.get(t);
  let o, a;
  if (r === void 0)
    o = s.value, a = s.unit || i.defaultUnit;
  else if (typeof r == "string" && B.test(r))
    o = ot(s.value, r), a = s.unit || i.defaultUnit;
  else {
    const c = T(r, i.defaultUnit);
    o = c.value, a = c.unit;
  }
  let l, h;
  if (n === void 0)
    l = s.value, h = s.unit || i.defaultUnit;
  else if (typeof n == "string" && B.test(n))
    l = ot(o, n), h = a;
  else {
    const c = T(n, i.defaultUnit);
    l = c.value, h = c.unit;
  }
  return !i.isTransform && h !== a && (o = nt(t, e, o, a), l = nt(t, e, l, h), a = "px", h = "px"), { kind: "numeric", target: t, prop: e, isTransform: i.isTransform, handler: i, start: o, change: l - o, unit: h };
}
function ue(t, e, i, r) {
  const n = i !== void 0 ? L(String(i)) : e.get(t), s = r !== void 0 ? L(String(r)) : e.get(t);
  return { kind: "color", target: t, isTransform: !1, handler: e, start: n, end: s };
}
function le(t, e, i, r) {
  const n = i !== void 0 ? String(i) : e.get(t), s = r !== void 0 ? String(r) : e.get(t);
  return ee(n, s) ? { kind: "complex", target: t, isTransform: !1, handler: e, start: n, end: s } : { kind: "discrete", target: t, isTransform: !1, handler: e, start: n, end: s };
}
function he(t, e, i, r) {
  const n = i !== void 0 ? String(i) : e.get(t), s = r !== void 0 ? String(r) : e.get(t);
  return { kind: "discrete", target: t, isTransform: !1, handler: e, start: n, end: s };
}
function ce(t, e, i, r, n) {
  return i.kind === "numeric" ? ae(t, e, i, r, n) : i.kind === "color" ? ue(t, i, r, n) : i.kind === "complex" ? le(t, i, r, n) : he(t, i, r, n);
}
function de(t, e, i, r) {
  const n = oe(e, r), s = [];
  for (const o of t)
    for (const a of n) {
      let l, h;
      i === "to" ? h = e[a] : i === "from" ? l = e[a] : (h = a in e ? e[a] : void 0, l = r && a in r ? r[a] : void 0);
      const c = Zt(o, a, h ?? l);
      s.push(ce(o, a, c, l, h));
    }
  return s;
}
function fe(t) {
  return Math.round(t * 1e4) / 1e4;
}
function me(t, e) {
  switch (t.kind) {
    case "numeric": {
      const i = fe(t.start + t.change * e);
      t.isTransform ? I(t.target)[t.handler.transformKey] = i : t.handler.set(t.target, { value: i, unit: t.unit });
      return;
    }
    case "color":
      t.handler.set(t.target, mt(t.start, t.end, e));
      return;
    case "complex":
      t.handler.set(t.target, re(t.start, t.end, e));
      return;
    case "discrete":
      t.handler.set(t.target, e >= 1 ? t.end : t.start);
      return;
  }
}
function pe(t, e, i) {
  const r = i(e);
  let n = t.last();
  for (; n && i(n) > r; )
    n = n._prev;
  n ? (e._prev = n, e._next = n._next, n._next ? n._next._prev = e : t.setLast(e), n._next = e) : (e._prev = null, e._next = t.first(), e._next ? e._next._prev = e : t.setLast(e), t.setFirst(e));
}
function ge(t, e) {
  e._prev ? e._prev._next = e._next : t.first() === e && t.setFirst(e._next), e._next ? e._next._prev = e._prev : t.last() === e && t.setLast(e._prev), e._next = null, e._prev = null;
}
function* R(t) {
  let e = t.first();
  for (; e; ) {
    const i = e._next;
    yield e, e = i;
  }
}
function $(t, e) {
  if (!t || e === void 0) return 0;
  const i = parseFloat(e);
  return t === "-" ? -i : i;
}
const ye = /^<(?:([+-])=([\d.]+))?$/, _e = /^>(?:([+-])=([\d.]+))?$/, we = /^([+-])=([\d.]+)$/, xe = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function be(t, e) {
  if (t === void 0) return e.end;
  if (typeof t == "number") return Math.max(0, t);
  const i = t.trim();
  let r = i.match(ye);
  if (r) return Math.max(0, e.prevStart + $(r[1], r[2]));
  if (r = i.match(_e), r) return Math.max(0, e.prevEnd + $(r[1], r[2]));
  if (r = i.match(we), r) return Math.max(0, e.end + $(r[1], r[2]));
  if (r = i.match(xe), r) {
    const [, n, s, o] = r, a = e.getLabel(n);
    return a === void 0 ? (console.warn(`[six] timeline: unknown label "${n}", appending at the current end`), e.end) : Math.max(0, a + $(s, o));
  }
  return console.warn(`[six] timeline: invalid position "${t}", appending at the current end`), e.end;
}
function pt(t, e, i) {
  if (typeof i == "number") return t * i;
  const { each: r, from: n = "start" } = i;
  let s;
  return n === "start" ? s = t : n === "end" ? s = e - 1 - t : n === "center" ? s = Math.abs(t - (e - 1) / 2) : s = Math.abs(t - n), s * r;
}
function ve(t, e) {
  const i = e.timeScale(), r = e.totalDuration();
  return (t - e.startTime()) * i + (i >= 0 ? 0 : r);
}
class z extends ft {
  constructor(i = {}) {
    super(i);
    u(this, "_firstChild", null);
    u(this, "_lastChild", null);
    u(this, "_cursor", 0);
    u(this, "_lastAdded", null);
    u(this, "_lastRenderedLocal", 0);
    u(this, "_labels", /* @__PURE__ */ new Map());
    u(this, "_defaultPositionMode");
    u(this, "_unbounded");
    u(this, "_childDefaults");
    this._defaultPositionMode = i.defaultPosition ?? "sequence", this._unbounded = i.unbounded ?? !1, this._childDefaults = i.defaults ?? {}, this._unbounded && (this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1);
  }
  // ---- ListHandle<Animation> (backs the generic linked-list helpers) ----
  first() {
    return this._firstChild;
  }
  setFirst(i) {
    this._firstChild = i;
  }
  last() {
    return this._lastChild;
  }
  setLast(i) {
    this._lastChild = i;
  }
  // ---- children ----
  defaultPosition() {
    return this._defaultPositionMode === "now" ? this._tTime : this._cursor;
  }
  positionContext() {
    return {
      end: this.defaultPosition(),
      prevStart: this._lastAdded ? this._lastAdded.startTime() : 0,
      prevEnd: this._lastAdded ? this._lastAdded.endTime() : 0,
      getLabel: (i) => this._labels.get(i)
    };
  }
  resolvePosition(i) {
    return be(i, this.positionContext());
  }
  add(i, r) {
    var s;
    (s = i.parent) == null || s._removeChild(i);
    const n = this.resolvePosition(r);
    return i.parent = this, i.startTime(n), pe(this, i, (o) => o.startTime()), this._cursor = Math.max(this._cursor, n + i.totalDuration()), this._lastAdded = i, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, n), this._uncache(), this;
  }
  remove(i) {
    return i.parent === this && (ge(this, i), i.parent = null, this._uncache()), this;
  }
  _removeChild(i) {
    this.remove(i);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const i of R(this))
      i.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...R(this)];
  }
  // ---- labels ----
  addLabel(i, r) {
    return this._labels.set(i, this.resolvePosition(r)), this;
  }
  getLabelTime(i) {
    return this._labels.get(i);
  }
  // ---- tween sugar ----
  addTweens(i, r, n, s, o) {
    const { stagger: a, ...l } = r, h = { ...this._childDefaults, ...l };
    if (a === void 0)
      return this.add(new x(i, h, n, s), o), this;
    const c = F(i), d = this.resolvePosition(o), f = h.delay ?? 0;
    return c.forEach((g, y) => {
      const _ = pt(y, c.length, a);
      this.add(new x(g, { ...h, delay: f + _ }, n, s), d);
    }), this;
  }
  to(i, r, n) {
    return this.addTweens(i, r, "to", void 0, n);
  }
  from(i, r, n) {
    return this.addTweens(i, r, "from", void 0, n);
  }
  fromTo(i, r, n, s) {
    return this.addTweens(i, n, "fromTo", r, s);
  }
  set(i, r, n) {
    return this.addTweens(i, { ...r, duration: 0 }, "to", void 0, n);
  }
  call(i, r) {
    return this.add(new x(null, { duration: 0, onStart: i }), r), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let i = 0;
    for (const r of R(this)) {
      const n = r.endTime();
      n > i && (i = n);
    }
    this._dur = i, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(i, r, n, s, o) {
    const a = Math.min(this._lastRenderedLocal, i), l = Math.max(this._lastRenderedLocal, i);
    this._lastRenderedLocal = i;
    for (const h of R(this)) {
      if (h.paused()) continue;
      const c = h.startTime();
      h.endTime() < a || c > l || h.render(ve(i, h), s, o);
    }
  }
}
function Se(t) {
  return !Array.isArray(t);
}
function Te(t, e, i) {
  const r = t.filter((o) => o.duration === void 0).length, n = t.reduce((o, a) => o + (a.duration ?? 0), 0), s = e !== void 0 ? r > 0 ? Math.max(0, e - n) / r : 0 : i;
  return t.map((o) => {
    const { duration: a, ease: l, ...h } = o;
    return { duration: a ?? s, ease: l, props: h };
  });
}
function Me(t, e, i) {
  const r = Object.entries(t).map(([s, o]) => {
    const a = s.trim().match(/^(-?[\d.]+)%$/);
    return a ? { pos: parseFloat(a[1]) / 100, props: o } : (console.warn(`[six] keyframes: invalid position "${s}", expected e.g. "50%"`), null);
  }).filter((s) => s !== null).sort((s, o) => s.pos - o.pos), n = [];
  for (let s = 0; s < r.length; s++) {
    const o = s === 0 ? 0 : r[s - 1].pos, { ease: a, ...l } = r[s].props;
    n.push({ duration: Math.max(0, (r[s].pos - o) * e), ease: a ?? i, props: l });
  }
  return n;
}
function ke(t, e) {
  const i = e.keyframes, r = Se(i) ? Me(i, e.duration ?? 0.5, e.ease) : Te(i, e.duration, e.duration ?? 0.5), n = new z(), s = {};
  for (const o of r) {
    const a = {};
    for (const l in o.props)
      l in s && (a[l] = s[l]);
    n.fromTo(t, a, { ...o.props, duration: o.duration, ease: o.ease ?? e.ease }), Object.assign(s, o.props);
  }
  return n;
}
function F(t) {
  if (t == null) return [];
  if (typeof t == "string") {
    const e = Array.from(document.querySelectorAll(t));
    return e.length === 0 && console.warn(`[six] no elements matched selector "${t}"`), e;
  }
  return t instanceof Element ? [t] : Array.from(t).filter((e) => e instanceof Element);
}
class x extends ft {
  constructor(i, r, n = "to", s) {
    super(r);
    u(this, "targets");
    u(this, "mode");
    u(this, "rawVars");
    u(this, "rawFromVars");
    u(this, "ease");
    u(this, "tracks", []);
    u(this, "keyframeTimeline", null);
    const o = Mt();
    this.targets = F(i), this.mode = n, this.rawVars = r, this.rawFromVars = s, this.ease = kt(r.ease ?? o.ease), r.keyframes ? (this.keyframeTimeline = ke(this.targets, r), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(r.duration ?? o.duration), this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = de(this.targets, this.rawVars, this.mode, this.rawFromVars));
  }
  _renderIteration(i) {
    if (this.keyframeTimeline) {
      this.keyframeTimeline.render(i, !0, !0);
      return;
    }
    const r = this.duration(), n = r ? i / r : 1, s = this.ease(n), o = n > 0 && n < 1, a = /* @__PURE__ */ new Set();
    for (const l of this.tracks)
      me(l, s), l.isTransform && a.add(l.target);
    for (const l of a)
      Ft(l, I(l), o);
  }
}
const D = () => typeof performance < "u" ? performance.now() : Date.now();
class Pe {
  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(e = {}) {
    u(this, "listeners", []);
    u(this, "i", 0);
    // live cursor into `listeners` during dispatch, adjusted by remove()
    u(this, "frame", 0);
    u(this, "timeMs", 0);
    u(this, "deltaMs", 0);
    u(this, "startTime", D());
    u(this, "lastUpdate", this.startTime);
    u(this, "lagThreshold", 500);
    u(this, "adjustedLag", 33);
    u(this, "gap", 1e3 / 240);
    u(this, "nextTime", this.gap);
    u(this, "rafId", null);
    u(this, "manual");
    u(this, "loop", () => {
      this.manual || (this.advance(D() - this.lastUpdate), this.rafId !== null && (this.rafId = this.request(this.loop)));
    });
    this.manual = !!e.manual;
  }
  request(e) {
    return typeof requestAnimationFrame == "function" ? requestAnimationFrame(e) : setTimeout(e, 16);
  }
  cancel(e) {
    typeof cancelAnimationFrame == "function" ? cancelAnimationFrame(e) : clearTimeout(e);
  }
  advance(e) {
    (e > this.lagThreshold || e < 0) && (this.startTime += e - this.adjustedLag), this.lastUpdate += e;
    const i = this.lastUpdate - this.startTime, r = i - this.nextTime;
    r < 0 || (this.frame++, this.deltaMs = i - this.timeMs * 1e3, this.timeMs = i / 1e3, this.nextTime += r >= this.gap ? r + 4 : this.gap, this.dispatch());
  }
  dispatch() {
    const e = this.timeMs, i = this.deltaMs, r = this.frame;
    for (this.i = 0; this.i < this.listeners.length; this.i++)
      this.listeners[this.i](e, i, r);
  }
  add(e) {
    return this.listeners.includes(e) || (this.listeners.push(e), this.wake()), e;
  }
  remove(e) {
    const i = this.listeners.indexOf(e);
    i !== -1 && (this.listeners.splice(i, 1), i <= this.i && this.i--);
  }
  /** Restarts the internal clock (used on wake so a long sleep doesn't register as lag) and starts the rAF loop. */
  wake() {
    if (this.manual || this.rafId !== null) return;
    const e = D();
    this.startTime = e - this.timeMs * 1e3, this.lastUpdate = e, this.rafId = this.request(this.loop);
  }
  sleep() {
    this.rafId !== null && (this.cancel(this.rafId), this.rafId = null);
  }
  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(e = 1e3 / 60) {
    this.frame++, this.deltaMs = e, this.timeMs += e / 1e3, this.lastUpdate = D(), this.startTime = this.lastUpdate - this.timeMs * 1e3, this.nextTime = this.timeMs * 1e3 + this.gap, this.dispatch();
  }
  fps(e) {
    const i = Math.max(1, e);
    this.gap = 1e3 / i, this.nextTime = this.timeMs * 1e3 + this.gap;
  }
  lagSmoothing(e = 500, i = 33) {
    this.lagThreshold = e || 1 / 0, this.adjustedLag = Math.min(i, this.lagThreshold);
  }
  deltaRatio(e = 60) {
    return this.deltaMs / (1e3 / e);
  }
  get time() {
    return this.timeMs;
  }
  get delta() {
    return this.deltaMs;
  }
  get currentFrame() {
    return this.frame;
  }
  get isAwake() {
    return this.rafId !== null;
  }
  get listenerCount() {
    return this.listeners.length;
  }
}
const W = new Pe(), M = new z({ unbounded: !0, defaultPosition: "now" });
W.add((t) => M.render(t));
let K = 0;
function gt() {
  K++;
}
const Ce = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function Re(t, e) {
  if (t === window) return e === "y" ? window.scrollY : window.scrollX;
  const i = t;
  return e === "y" ? i.scrollTop : i.scrollLeft;
}
function N(t, e = "y") {
  const i = Ce[e], r = i.get(t);
  if (r && r.gen === K) return r.value;
  const n = Re(t, e);
  return i.set(t, { gen: K, value: n }), n;
}
function $e(t, e = "y") {
  var r, n;
  if (t === window)
    return e === "y" ? ((r = window.visualViewport) == null ? void 0 : r.height) ?? window.innerHeight : ((n = window.visualViewport) == null ? void 0 : n.width) ?? window.innerWidth;
  const i = t;
  return e === "y" ? i.clientHeight : i.clientWidth;
}
const E = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Map();
function De(t, e) {
  let i = E.get(t);
  if (!i) {
    i = /* @__PURE__ */ new Set(), E.set(t, i);
    const r = () => {
      gt(), i.forEach((n) => n());
    };
    j.set(t, r), t.addEventListener("scroll", r, { passive: !0 });
  }
  i.add(e);
}
function Ae(t, e) {
  const i = E.get(t);
  if (i && (i.delete(e), i.size === 0)) {
    const r = j.get(t);
    r && t.removeEventListener("scroll", r), j.delete(t), E.delete(t);
  }
}
const G = /* @__PURE__ */ new Set();
let at = !1;
function Le() {
  gt(), G.forEach((t) => t());
}
function Ie(t) {
  G.add(t), !at && typeof window < "u" && (at = !0, window.addEventListener("resize", Le));
}
function Ye(t) {
  G.delete(t);
}
function Oe(t) {
  return {
    update(e) {
      t.totalProgress(e);
    },
    kill() {
    }
  };
}
function Ee(t, e) {
  let i = t.totalProgress(), r = i, n = !1;
  const s = (o, a) => {
    const l = a / 1e3, h = 1 - Math.exp(-3 * l / Math.max(0.05, e));
    r += (i - r) * h, Math.abs(i - r) < 5e-4 && (r = i), t.totalProgress(r);
  };
  return W.add(s), {
    update(o) {
      i = o, n || (n = !0, r = i, t.totalProgress(r));
    },
    kill() {
      W.remove(s);
    }
  };
}
const U = /* @__PURE__ */ new WeakMap();
function ze(t) {
  let e = U.get(t);
  if (!e) {
    const o = t.getBoundingClientRect(), a = getComputedStyle(t), l = document.createElement("div");
    l.style.position = "relative", l.style.width = `${o.width}px`, l.style.height = `${o.height}px`, t.parentNode.insertBefore(l, t), l.appendChild(t), e = {
      spacer: l,
      refCount: 0,
      rect: o,
      distance: 0,
      originalStyles: {
        position: t.style.position,
        top: t.style.top,
        left: t.style.left,
        width: t.style.width,
        margin: a.margin,
        transform: t.style.transform
      }
    }, U.set(t, e);
  }
  e.refCount++;
  const i = e, r = () => {
    t.style.position = i.originalStyles.position, t.style.top = i.originalStyles.top, t.style.left = i.originalStyles.left, t.style.width = i.originalStyles.width, t.style.margin = i.originalStyles.margin;
  }, n = () => {
    t.style.position = "fixed", t.style.top = "0px", t.style.left = `${i.rect.left}px`, t.style.width = `${i.rect.width}px`, t.style.margin = "0";
  }, s = () => {
    t.style.position = "absolute", t.style.top = `${i.distance}px`, t.style.left = "0px", t.style.width = `${i.rect.width}px`, t.style.margin = "0";
  };
  return {
    setDistance(o) {
      i.distance = Math.max(0, o), i.spacer.style.height = `${i.rect.height + i.distance}px`;
    },
    setPhase(o) {
      o === "before" ? r() : o === "during" ? n() : s();
    },
    revert() {
      var o;
      i.refCount--, !(i.refCount > 0) && (t.style.position = i.originalStyles.position, t.style.top = i.originalStyles.top, t.style.left = i.originalStyles.left, t.style.width = i.originalStyles.width, t.style.margin = i.originalStyles.margin, t.style.transform = i.originalStyles.transform, (o = i.spacer.parentNode) == null || o.insertBefore(t, i.spacer), i.spacer.remove(), U.delete(t));
    }
  };
}
function Fe(t) {
  const e = document.createElement("div"), i = document.createElement("div"), r = (n, s) => {
    n.style.cssText = `position:absolute;left:0;width:100%;border-top:2px dashed ${s};z-index:999999;pointer-events:none;`;
  };
  return r(e, "#4ade80"), r(i, "#f87171"), e.setAttribute("data-six-marker", `${t}-start`), i.setAttribute("data-six-marker", `${t}-end`), document.body.appendChild(e), document.body.appendChild(i), {
    update(n, s) {
      e.style.top = `${n}px`, i.style.top = `${s}px`;
    },
    remove() {
      e.remove(), i.remove();
    }
  };
}
const ut = { top: 0, center: 0.5, bottom: 1 };
function lt(t) {
  const e = t.trim();
  if (e in ut) return { ratio: ut[e], offsetPx: 0 };
  if (e.endsWith("%")) return { ratio: parseFloat(e) / 100, offsetPx: 0 };
  const i = parseFloat(e);
  return { ratio: 0, offsetPx: isNaN(i) ? 0 : i };
}
function Xe(t, e, i, r) {
  const [n = "top", s = "top"] = t.trim().split(/\s+/), o = lt(n), a = lt(s), l = i + e.top + o.ratio * e.height + o.offsetPx, h = a.ratio * r + a.offsetPx;
  return l - h;
}
function He(t) {
  if (t === void 0) return window;
  if (typeof t == "string") {
    const e = document.querySelector(t);
    return e || (console.warn(`[six] ScrollTrigger: scroller "${t}" not found, falling back to window`), window);
  }
  return t;
}
function ht(t) {
  if (typeof t == "string") {
    const e = document.querySelector(t);
    if (!e) throw new Error(`[six] ScrollTrigger: trigger "${t}" not found`);
    return e;
  }
  return t;
}
const w = [];
class X {
  constructor(e) {
    u(this, "vars");
    u(this, "triggerEl");
    u(this, "scroller");
    u(this, "startY", 0);
    u(this, "endY", 0);
    u(this, "wasInside", !1);
    u(this, "lastScroll", 0);
    u(this, "killed", !1);
    u(this, "pinHandle", null);
    u(this, "scrubController", null);
    u(this, "markerHandle", null);
    u(this, "boundOnScroll", () => this.update());
    u(this, "boundOnResize", () => this.refresh());
    this.vars = e, this.triggerEl = ht(e.trigger), this.scroller = He(e.scroller), e.animation && (e.animation.pause(), e.scrub && (this.scrubController = typeof e.scrub == "number" ? Ee(e.animation, e.scrub) : Oe(e.animation))), e.markers && (this.markerHandle = Fe(String(w.length))), w.push(this), this.refresh(), De(this.scroller, this.boundOnScroll), Ie(this.boundOnResize);
  }
  resolvePositionValue(e, i) {
    let r = e ?? i;
    if (typeof r == "function" && (r = r()), typeof r == "number") return r;
    const n = this.triggerEl.getBoundingClientRect(), s = N(this.scroller, "y"), o = $e(this.scroller, "y");
    return Xe(r, n, s, o);
  }
  refresh() {
    var e, i, r, n;
    if (!this.killed) {
      if ((e = this.pinHandle) == null || e.setPhase("before"), this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top"), this.endY <= this.startY && (this.endY = this.startY + 1), this.vars.pin) {
        const s = this.vars.pin === !0 ? this.triggerEl : typeof this.vars.pin == "string" ? ht(this.vars.pin) : this.vars.pin;
        s instanceof Element ? (this.pinHandle ?? (this.pinHandle = ze(s)), this.pinHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] ScrollTrigger: pin must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.pin)}, ignoring`);
      }
      (i = this.markerHandle) == null || i.update(this.startY, this.endY), this.update(), (n = (r = this.vars).onRefresh) == null || n.call(r, this);
    }
  }
  computeProgress(e) {
    return Math.max(0, Math.min((e - this.startY) / (this.endY - this.startY), 1));
  }
  update() {
    var s, o, a, l, h, c, d, f, g, y, _, k, v;
    if (this.killed) return;
    const e = N(this.scroller, "y"), i = this.computeProgress(e), r = e >= this.startY && e <= this.endY, n = e >= this.lastScroll;
    this.pinHandle && this.pinHandle.setPhase(e < this.startY ? "before" : e > this.endY ? "after" : "during"), r && !this.wasInside ? (n ? (o = (s = this.vars).onEnter) == null || o.call(s, this) : (l = (a = this.vars).onEnterBack) == null || l.call(a, this), this.scrubController || (h = this.vars.animation) == null || h.play()) : !r && this.wasInside && (n ? (d = (c = this.vars).onLeave) == null || d.call(c, this) : ((g = (f = this.vars).onLeaveBack) == null || g.call(f, this), this.scrubController || (y = this.vars.animation) == null || y.reverse())), this.wasInside = r, this.lastScroll = e, (_ = this.scrubController) == null || _.update(i), (v = (k = this.vars).onUpdate) == null || v.call(k, this);
  }
  progress() {
    return this.computeProgress(N(this.scroller, "y"));
  }
  isActive() {
    return this.wasInside;
  }
  kill() {
    var i, r, n;
    if (this.killed) return;
    this.killed = !0, Ae(this.scroller, this.boundOnScroll), Ye(this.boundOnResize), (i = this.pinHandle) == null || i.revert(), (r = this.scrubController) == null || r.kill(), (n = this.markerHandle) == null || n.remove();
    const e = w.indexOf(this);
    e !== -1 && w.splice(e, 1);
  }
  static create(e) {
    return new X(e);
  }
  static refresh() {
    for (const e of [...w]) e.refresh();
  }
  static getAll() {
    return w;
  }
}
function Ne(t, e) {
  return e || (typeof t == "string" || t instanceof Element ? t : F(t)[0]);
}
function ct(t, e, i) {
  if (!e) return;
  const r = Ne(t, e.trigger);
  X.create({ ...e, trigger: r, animation: i });
}
function J(t, e, i, r) {
  const { stagger: n, scrollTrigger: s, ...o } = e;
  if (n === void 0) {
    const c = new x(t, o, i, r);
    return M.add(c), ct(t, s, c), c;
  }
  const a = F(t), l = o.delay ?? 0, h = new z();
  return a.forEach((c, d) => {
    const f = l + pt(d, a.length, n);
    h.add(new x(c, { ...o, delay: f }, i, r), 0);
  }), M.add(h), ct(t, s, h), h;
}
function Ue(t, e) {
  return J(t, e, "to");
}
function qe(t, e) {
  return J(t, e, "from");
}
function Ve(t, e, i) {
  return J(t, i, "fromTo", e);
}
function Be(t, e) {
  const i = new x(t, { ...e, duration: 0 });
  return M.add(i), i;
}
function We(t) {
  const { scrollTrigger: e, ...i } = t ?? {}, r = new z(i);
  return M.add(r), e && (e.trigger ? X.create({ ...e, trigger: e.trigger, animation: r }) : console.warn("[six] timeline({ scrollTrigger }) requires an explicit trigger - a Timeline has no target to default to")), r;
}
function Ke(t) {
  Tt(t);
}
const Je = {
  to: Ue,
  from: qe,
  fromTo: Ve,
  set: Be,
  timeline: We,
  config: Ke,
  context: vt
};
export {
  X as ScrollTrigger,
  Ge as VERSION,
  Je as six
};
