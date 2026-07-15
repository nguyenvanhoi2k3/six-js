var bt = Object.defineProperty;
var St = (t, e, n) => e in t ? bt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var l = (t, e, n) => St(t, typeof e != "symbol" ? e + "" : e, n);
const Ze = "0.0.33";
function gt(t, e, n) {
  return e < 0 ? 1 / 0 : t * (e + 1) + n * e;
}
function tt(t, e, n, i, r) {
  if (e <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (n === 0)
    return { iteration: 0, time: t < 0 ? 0 : t > e ? e : t, reversed: !1 };
  const s = e + i, o = gt(e, n, i);
  let a = t;
  a < 0 ? a = 0 : n >= 0 && a > o && (a = o);
  let u = Math.floor(a / s), c = a - u * s;
  i === 0 && u > 0 && c === 0 && (u -= 1, c = e), n >= 0 && u > n && (u = n, c = a - u * s), c > e && (c = e);
  const d = r && u % 2 === 1;
  return d && (c = e - c), { iteration: u, time: c, reversed: d };
}
let Y = null;
function Tt() {
  return Y;
}
class vt {
  constructor(e) {
    l(this, "captured", /* @__PURE__ */ new Set());
    l(this, "dead", !1);
    e && this.run(e);
  }
  run(e) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const n = Y;
    Y = this;
    try {
      return e(this);
    } finally {
      Y = n;
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
function Mt(t) {
  return new vt(t);
}
let kt = 0;
class yt {
  constructor(e = {}) {
    l(this, "id", ++kt);
    l(this, "parent", null);
    /** Kept after removal from `parent` (GSAP calls this the "detached parent") so time queries made after removal still resolve. */
    l(this, "_dp", null);
    l(this, "_next", null);
    l(this, "_prev", null);
    l(this, "_start", 0);
    l(this, "_dur", 0);
    l(this, "_tDur", 0);
    l(this, "_time", 0);
    l(this, "_tTime", 0);
    /** Functional timeScale - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
    l(this, "_ts", 1);
    /** Recorded/user timeScale - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
    l(this, "_rts", 1);
    l(this, "_delay");
    l(this, "_repeat");
    l(this, "_repeatDelay");
    l(this, "_yoyo");
    l(this, "_initted", !1);
    l(this, "_dirty", !0);
    l(this, "_hasStarted", !1);
    /** Raw (pre-clamp) totalTime from the previous render() call - see the zero-duration handling in render(). */
    l(this, "_rawPrev", -1);
    l(this, "listeners", {});
    var n;
    (n = Tt()) == null || n._capture(this), this._delay = Math.max(0, e.delay ?? 0), this._repeat = e.repeat ?? 0, this._repeatDelay = Math.max(0, e.repeatDelay ?? 0), this._yoyo = e.yoyo ?? !1, e.onStart && this.on("start", e.onStart), e.onUpdate && this.on("update", e.onUpdate), e.onComplete && this.on("complete", e.onComplete), e.onRepeat && this.on("repeat", e.onRepeat), e.onReverseComplete && this.on("reverseComplete", e.onReverseComplete), e.paused && (this._ts = 0);
  }
  // ---- rendering ----
  /**
   * Renders this animation at `totalTime` (on ITS OWN axis, delay included at the front).
   * `suppressEvents` skips start/update/repeat/complete callbacks (used by seek()). `force`
   * re-renders even if `totalTime` hasn't changed since the last render.
   */
  render(e, n = !1, i = !1) {
    const r = this._tTime, s = this.totalDuration();
    let o = e;
    o < 0 ? o = 0 : this._repeat >= 0 && o > s && (o = s);
    const a = !this._initted;
    a && (this._initted = !0, this._onInit());
    const u = tt(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), c = a ? u : tt(r - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), d = u.iteration !== c.iteration;
    this._tTime = o, this._time = u.time, this._renderIteration(u.time, u.reversed, u.iteration, n, i || d);
    const h = this._rawPrev;
    if (this._rawPrev = e, n) return;
    const f = s === 0, g = f ? e < 0 : o <= 0, y = f ? e >= 0 : this._repeat >= 0 && o >= s, _ = f ? h < 0 : r <= 0, k = f ? h >= 0 : this._repeat >= 0 && r >= s, S = f ? e > h : o > r, P = f ? e < h : o < r;
    !this._hasStarted && !g && (this._hasStarted = !0, this.emit("start")), S && d && this.emit("repeat"), this.emit("update"), S && !k && y ? this.emit("complete") : P && !_ && g && this.emit("reverseComplete");
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
    const n = this.totalDuration();
    return n > 0 && e > 0 && this.timeScale(this.timeScale() * (n / e)), this;
  }
  _recomputeTotalDuration() {
    this._tDur = this._delay + gt(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
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
    var n;
    return e === void 0 ? this._start : (this._start = e, (n = this.parent) == null || n._uncache(), this);
  }
  endTime() {
    return this._start + this.totalDuration() / Math.abs(this._rts || 1);
  }
  // ---- time scale / direction ----
  timeScale(e) {
    if (e === void 0) return this._rts;
    e === 0 && (e = this._rts < 0 ? -1e-8 : 1e-8);
    const n = this._ts === 0;
    return this._rts = e, this._ts = n ? 0 : e, this;
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
  totalTime(e, n = !1) {
    return e === void 0 ? this._tTime : (this.render(e, n, !1), this);
  }
  time(e, n = !1) {
    if (e === void 0) return this._time;
    const i = this._tTime - this._delay - this._time;
    return this.totalTime(this._delay + i + Math.max(0, Math.min(e, this._dur)), n);
  }
  progress(e) {
    return e === void 0 ? this._dur ? this._time / this._dur : 1 : this.time(e * this._dur);
  }
  totalProgress(e) {
    const n = this.totalDuration();
    return e === void 0 ? n ? this._tTime / n : 1 : this.totalTime(e * n);
  }
  seek(e, n = !0) {
    return this.totalTime(e, n), this;
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
  on(e, n) {
    var i;
    return ((i = this.listeners)[e] ?? (i[e] = /* @__PURE__ */ new Set())).add(n), this;
  }
  off(e, n) {
    var i;
    return (i = this.listeners[e]) == null || i.delete(n), this;
  }
  emit(e) {
    var n;
    (n = this.listeners[e]) == null || n.forEach((i) => i());
  }
}
let V = { duration: 0.5, ease: "power1.out" };
function Pt(t) {
  V = { ...V, ...t };
}
function Ct() {
  return V;
}
function C(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) {
    const r = t - 0.5454545454545454;
    return 7.5625 * r * r + 0.75;
  }
  if (t < 2.5 / 2.75) {
    const r = t - 0.8181818181818182;
    return 7.5625 * r * r + 0.9375;
  }
  const i = t - 2.625 / 2.75;
  return 7.5625 * i * i + 0.984375;
}
const T = 1.70158, $ = T * 1.525, et = 2 * Math.PI / 3, nt = 2 * Math.PI / 4.5, N = {
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
  "back.in": (t) => (T + 1) * t * t * t - T * t * t,
  "back.out": (t) => {
    const e = t - 1;
    return 1 + (T + 1) * e * e * e + T * e * e;
  },
  "back.inOut": (t) => {
    if (t < 0.5) {
      const n = 2 * t;
      return n * n * (($ + 1) * n - $) / 2;
    }
    const e = 2 * t - 2;
    return (e * e * (($ + 1) * e + $) + 2) / 2;
  },
  "bounce.in": (t) => 1 - C(1 - t),
  "bounce.out": C,
  "bounce.inOut": (t) => t < 0.5 ? (1 - C(1 - 2 * t)) / 2 : (1 + C(2 * t - 1)) / 2,
  "elastic.in": (t) => t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * et),
  "elastic.out": (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * et) + 1,
  "elastic.inOut": (t) => t === 0 || t === 1 ? t : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * nt)) / 2 : Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * nt) / 2 + 1
};
function $t(t) {
  return typeof t == "function" ? t : t && N[t] ? N[t] : N["power1.out"];
}
const Rt = /^#([0-9a-f]{3,8})$/i, Dt = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, At = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, Yt = {
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
function Lt(t) {
  return Yt[t.toLowerCase()] ?? null;
}
function p(t, e, n) {
  const i = n === 1 ? t[e] + t[e] : t.slice(e, e + 2);
  return parseInt(i, 16);
}
function L(t) {
  const e = t.trim(), n = e.match(Rt);
  if (n) {
    const r = n[1];
    if (r.length === 3 || r.length === 4) {
      const s = r.length === 4 ? p(r, 3, 1) / 255 : 1;
      return { r: p(r, 0, 1), g: p(r, 1, 1), b: p(r, 2, 1), a: s };
    }
    if (r.length === 6 || r.length === 8) {
      const s = r.length === 8 ? p(r, 6, 2) / 255 : 1;
      return { r: p(r, 0, 2), g: p(r, 2, 2), b: p(r, 4, 2), a: s };
    }
  }
  const i = e.match(Dt) ?? e.match(At);
  if (i) {
    const [, r, s, o, a] = i;
    return {
      r: parseFloat(r),
      g: parseFloat(s),
      b: parseFloat(o),
      a: a === void 0 ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)
    };
  }
  if (/^[a-z]+$/i.test(e)) {
    const r = Lt(e);
    if (r) return { r: r[0], g: r[1], b: r[2], a: e.toLowerCase() === "transparent" ? 0 : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function _t(t, e, n) {
  return {
    r: Math.round(t.r + (e.r - t.r) * n),
    g: Math.round(t.g + (e.g - t.g) * n),
    b: Math.round(t.b + (e.b - t.b) * n),
    a: Math.round((t.a + (e.a - t.a) * n) * 1e3) / 1e3
  };
}
function W(t) {
  return `rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`;
}
const It = {
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
}, it = /* @__PURE__ */ new WeakMap(), Ot = /^matrix\(([^)]+)\)$/, Et = /^matrix3d\(([^)]+)\)$/, rt = 180 / Math.PI;
function zt(t) {
  if (!t || t === "none") return {};
  const e = t.match(Ot);
  if (e) {
    const [i, r, s, o, a, u] = e[1].split(",").map(Number), c = Math.sqrt(i * i + r * r), d = Math.sqrt(s * s + o * o), h = Math.atan2(r, i) * rt, f = (Math.atan2(s, o) * rt + h) * -1;
    return { x: a, y: u, rotation: h, scaleX: c, scaleY: d, skewX: Ht(f) };
  }
  const n = t.match(Et);
  if (n) {
    const i = n[1].split(",").map(Number);
    return { x: i[12], y: i[13], z: i[14] };
  }
  return {};
}
function Ft(t) {
  return typeof getComputedStyle > "u" ? {} : zt(getComputedStyle(t).transform);
}
function Ht(t) {
  let e = t % 360;
  return e > 180 && (e -= 360), e < -180 && (e += 360), e;
}
function I(t) {
  let e = it.get(t);
  return e || (e = { ...It, ...Ft(t) }, it.set(t, e)), e;
}
function m(t) {
  return Math.round(t * 1e4) / 1e4;
}
function Xt(t, e) {
  const n = [];
  return (t.xPercent || t.yPercent) && n.push(`translate(${m(t.xPercent)}%, ${m(t.yPercent)}%)`), (t.x || t.y || t.z) && n.push(e ? `translate3d(${m(t.x)}px, ${m(t.y)}px, ${m(t.z)}px)` : `translate(${m(t.x)}px, ${m(t.y)}px)`), t.rotation && n.push(`rotate(${m(t.rotation)}deg)`), t.rotationX && n.push(`rotateX(${m(t.rotationX)}deg)`), t.rotationY && n.push(`rotateY(${m(t.rotationY)}deg)`), t.skewX && n.push(`skewX(${m(t.skewX)}deg)`), t.skewY && n.push(`skewY(${m(t.skewY)}deg)`), (t.scaleX !== 1 || t.scaleY !== 1) && n.push(`scale(${m(t.scaleX)}, ${m(t.scaleY)})`), n.length ? n.join(" ") : "none";
}
function Nt(t, e, n) {
  t.style.transform = Xt(e, n);
}
const Ut = {
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
}, qt = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), Vt = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), Wt = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), Bt = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), Kt = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
function b(t) {
  if (typeof t == "number") return !0;
  if (typeof t != "string") return !1;
  const e = t.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(e) || /^[+-]=/.test(e);
}
function v(t, e = "") {
  if (typeof t == "number") return { value: t, unit: e };
  const n = String(t).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  return n ? { value: parseFloat(n[1]), unit: n[2] || e } : { value: 0, unit: e };
}
function O(t, e) {
  var i;
  const n = (i = t.style) == null ? void 0 : i[e];
  return n || (typeof getComputedStyle > "u" ? "" : getComputedStyle(t)[e] || "");
}
function jt(t) {
  const e = qt.has(t) ? "deg" : Vt.has(t) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: t,
    defaultUnit: e,
    get(n) {
      return { value: I(n)[t], unit: e };
    },
    set(n, i) {
      I(n)[t] = i.value;
    }
  };
}
function Gt(t) {
  return {
    kind: "color",
    get(e) {
      return L(O(e, t) || "rgba(0,0,0,0)");
    },
    set(e, n) {
      e.style[t] = W(n);
    }
  };
}
function Jt(t) {
  return {
    kind: "complex",
    get(e) {
      return O(e, t);
    },
    set(e, n) {
      e.style[t] = n;
    }
  };
}
function Zt(t, e) {
  const n = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(t).trim() : "";
  return b(e) || b(n) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(i) {
      return v(getComputedStyle(i).getPropertyValue(t).trim());
    },
    set(i, r) {
      i.style.setProperty(t, `${r.value}${r.unit}`);
    }
  } : {
    kind: "discrete",
    get(i) {
      return getComputedStyle(i).getPropertyValue(t).trim();
    },
    set(i, r) {
      i.style.setProperty(t, r);
    }
  };
}
function Qt(t, e) {
  const n = Kt.has(t) ? "" : "px";
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: n,
    get(i) {
      const r = O(i, t);
      return b(r) ? v(r, n) : { value: 0, unit: n };
    },
    set(i, r) {
      i.style[t] = n === "" ? `${r.value}` : `${r.value}${r.unit}`;
    }
  } : {
    kind: "discrete",
    get(i) {
      return O(i, t);
    },
    set(i, r) {
      i.style[t] = r;
    }
  };
}
function te(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(i) {
      return v(i.getAttribute(t) ?? "0");
    },
    set(i, r) {
      i.setAttribute(t, String(r.value));
    }
  } : {
    kind: "discrete",
    get(i) {
      return i.getAttribute(t) ?? "";
    },
    set(i, r) {
      i.setAttribute(t, r);
    }
  };
}
function st(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(n) {
      return { value: Number(n[t]) || 0, unit: "" };
    },
    set(n, i) {
      n[t] = i.value;
    }
  } : {
    kind: "discrete",
    get(n) {
      return String(n[t] ?? "");
    },
    set(n, i) {
      n[t] = i;
    }
  };
}
function ee(t, e, n) {
  const i = Ut[e];
  if (i) return jt(i);
  if (Wt.has(e)) return Gt(e);
  if (Bt.has(e)) return Jt(e);
  if (e.startsWith("--")) return Zt(e, n);
  const r = t.style;
  return r && e in r ? Qt(e, n) : e in t && typeof t[e] == "number" ? st(e, n ?? t[e]) : typeof t.setAttribute == "function" ? te(e, n) : st(e, n);
}
const ne = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function ie(t) {
  if (t[0] === "#" || /^(rgba?|hsla?)\(/i.test(t))
    return { type: "color", value: L(t) };
  const e = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(e[1]), unit: e[2] };
}
function E(t) {
  const e = [], n = [];
  let i = 0;
  for (const r of t.matchAll(ne))
    n.push(t.slice(i, r.index)), e.push(ie(r[0])), i = r.index + r[0].length;
  return n.push(t.slice(i)), { literals: n, tokens: e };
}
function re(t, e) {
  const n = E(t).tokens, i = E(e).tokens;
  return n.length === i.length && n.every((r, s) => r.type === i[s].type);
}
function se(t, e, n) {
  if (!t || t.type !== e.type) {
    const o = n >= 1 ? e : t ?? e;
    return o.type === "color" ? W(o.value) : `${o.value}${o.unit}`;
  }
  if (e.type === "color")
    return W(_t(t.value, e.value, n));
  const i = t.value, r = i + (e.value - i) * n, s = e.unit || t.unit;
  return `${Math.round(r * 1e4) / 1e4}${s}`;
}
function oe(t, e, n) {
  const i = E(t), r = E(e);
  let s = "";
  for (let o = 0; o < r.literals.length; o++)
    s += r.literals[o], o < r.tokens.length && (s += se(i.tokens[o], r.tokens[o], n));
  return s;
}
const ae = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function le(t) {
  return ae.test(t);
}
function ot(t, e, n, i) {
  if (!i || i === "px" || i === "deg" || i === "rad" || i === "turn") return n;
  if (i === "rem") {
    const r = typeof document < "u" && parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return n * r;
  }
  if (i === "em") {
    const r = typeof getComputedStyle < "u" && parseFloat(getComputedStyle(t).fontSize) || 16;
    return n * r;
  }
  if (i === "vh") return typeof window < "u" ? n / 100 * window.innerHeight : n;
  if (i === "vw") return typeof window < "u" ? n / 100 * window.innerWidth : n;
  if (i === "%") {
    const r = t.parentElement;
    if (!r) return n;
    const s = le(e) ? r.clientWidth : r.clientHeight;
    return n / 100 * s;
  }
  return n;
}
const at = /* @__PURE__ */ new Set([
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
function lt(t, e) {
  const n = e.match(B);
  if (!n) return null;
  const i = parseFloat(n[2]);
  switch (n[1]) {
    case "+":
      return t + i;
    case "-":
      return t - i;
    case "*":
      return t * i;
    case "/":
      return t / i;
    default:
      return t;
  }
}
function ue(t, e) {
  const n = /* @__PURE__ */ new Set();
  for (const i in t) at.has(i) || n.add(i);
  if (e)
    for (const i in e) at.has(i) || n.add(i);
  return [...n];
}
function ce(t, e, n, i, r) {
  const s = n.get(t);
  let o, a;
  if (i === void 0)
    o = s.value, a = s.unit || n.defaultUnit;
  else if (typeof i == "string" && B.test(i))
    o = lt(s.value, i), a = s.unit || n.defaultUnit;
  else {
    const d = v(i, n.defaultUnit);
    o = d.value, a = d.unit;
  }
  let u, c;
  if (r === void 0)
    u = s.value, c = s.unit || n.defaultUnit;
  else if (typeof r == "string" && B.test(r))
    u = lt(o, r), c = a;
  else {
    const d = v(r, n.defaultUnit);
    u = d.value, c = d.unit;
  }
  return !n.isTransform && c !== a && (o = ot(t, e, o, a), u = ot(t, e, u, c), a = "px", c = "px"), { kind: "numeric", target: t, prop: e, isTransform: n.isTransform, handler: n, start: o, change: u - o, unit: c };
}
function de(t, e, n, i) {
  const r = n !== void 0 ? L(String(n)) : e.get(t), s = i !== void 0 ? L(String(i)) : e.get(t);
  return { kind: "color", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function he(t, e, n, i) {
  const r = n !== void 0 ? String(n) : e.get(t), s = i !== void 0 ? String(i) : e.get(t);
  return re(r, s) ? { kind: "complex", target: t, isTransform: !1, handler: e, start: r, end: s } : { kind: "discrete", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function fe(t, e, n, i) {
  const r = n !== void 0 ? String(n) : e.get(t), s = i !== void 0 ? String(i) : e.get(t);
  return { kind: "discrete", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function me(t, e, n, i, r) {
  return n.kind === "numeric" ? ce(t, e, n, i, r) : n.kind === "color" ? de(t, n, i, r) : n.kind === "complex" ? he(t, n, i, r) : fe(t, n, i, r);
}
function pe(t, e, n, i) {
  const r = ue(e, i), s = [];
  for (const o of t)
    for (const a of r) {
      let u, c;
      n === "to" ? c = e[a] : n === "from" ? u = e[a] : (c = a in e ? e[a] : void 0, u = i && a in i ? i[a] : void 0);
      const d = ee(o, a, c ?? u);
      s.push(me(o, a, d, u, c));
    }
  return s;
}
function ge(t) {
  return Math.round(t * 1e4) / 1e4;
}
function ye(t, e) {
  switch (t.kind) {
    case "numeric": {
      const n = ge(t.start + t.change * e);
      t.isTransform ? I(t.target)[t.handler.transformKey] = n : t.handler.set(t.target, { value: n, unit: t.unit });
      return;
    }
    case "color":
      t.handler.set(t.target, _t(t.start, t.end, e));
      return;
    case "complex":
      t.handler.set(t.target, oe(t.start, t.end, e));
      return;
    case "discrete":
      t.handler.set(t.target, e >= 1 ? t.end : t.start);
      return;
  }
}
function _e(t, e, n) {
  const i = n(e);
  let r = t.last();
  for (; r && n(r) > i; )
    r = r._prev;
  r ? (e._prev = r, e._next = r._next, r._next ? r._next._prev = e : t.setLast(e), r._next = e) : (e._prev = null, e._next = t.first(), e._next ? e._next._prev = e : t.setLast(e), t.setFirst(e));
}
function we(t, e) {
  e._prev ? e._prev._next = e._next : t.first() === e && t.setFirst(e._next), e._next ? e._next._prev = e._prev : t.last() === e && t.setLast(e._prev), e._next = null, e._prev = null;
}
function* R(t) {
  let e = t.first();
  for (; e; ) {
    const n = e._next;
    yield e, e = n;
  }
}
function D(t, e) {
  if (!t || e === void 0) return 0;
  const n = parseFloat(e);
  return t === "-" ? -n : n;
}
const xe = /^<(?:([+-])=([\d.]+))?$/, be = /^>(?:([+-])=([\d.]+))?$/, Se = /^([+-])=([\d.]+)$/, Te = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function ve(t, e) {
  if (t === void 0) return e.end;
  if (typeof t == "number") return Math.max(0, t);
  const n = t.trim();
  let i = n.match(xe);
  if (i) return Math.max(0, e.prevStart + D(i[1], i[2]));
  if (i = n.match(be), i) return Math.max(0, e.prevEnd + D(i[1], i[2]));
  if (i = n.match(Se), i) return Math.max(0, e.end + D(i[1], i[2]));
  if (i = n.match(Te), i) {
    const [, r, s, o] = i, a = e.getLabel(r);
    return a === void 0 ? (console.warn(`[six] timeline: unknown label "${r}", appending at the current end`), e.end) : Math.max(0, a + D(s, o));
  }
  return console.warn(`[six] timeline: invalid position "${t}", appending at the current end`), e.end;
}
function wt(t, e, n) {
  if (typeof n == "number") return t * n;
  const { each: i, from: r = "start" } = n;
  let s;
  return r === "start" ? s = t : r === "end" ? s = e - 1 - t : r === "center" ? s = Math.abs(t - (e - 1) / 2) : s = Math.abs(t - r), s * i;
}
function Me(t, e) {
  const n = e.timeScale(), i = e.totalDuration();
  return (t - e.startTime()) * n + (n >= 0 ? 0 : i);
}
class F extends yt {
  constructor(n = {}) {
    super(n);
    l(this, "_firstChild", null);
    l(this, "_lastChild", null);
    l(this, "_cursor", 0);
    l(this, "_lastAdded", null);
    l(this, "_lastRenderedLocal", 0);
    l(this, "_labels", /* @__PURE__ */ new Map());
    l(this, "_defaultPositionMode");
    l(this, "_unbounded");
    l(this, "_childDefaults");
    this._defaultPositionMode = n.defaultPosition ?? "sequence", this._unbounded = n.unbounded ?? !1, this._childDefaults = n.defaults ?? {}, this._unbounded && (this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1);
  }
  // ---- ListHandle<Animation> (backs the generic linked-list helpers) ----
  first() {
    return this._firstChild;
  }
  setFirst(n) {
    this._firstChild = n;
  }
  last() {
    return this._lastChild;
  }
  setLast(n) {
    this._lastChild = n;
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
      getLabel: (n) => this._labels.get(n)
    };
  }
  resolvePosition(n) {
    return ve(n, this.positionContext());
  }
  add(n, i) {
    var s;
    (s = n.parent) == null || s._removeChild(n);
    const r = this.resolvePosition(i);
    return n.parent = this, n.startTime(r), _e(this, n, (o) => o.startTime()), this._cursor = Math.max(this._cursor, r + n.totalDuration()), this._lastAdded = n, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, r), this._uncache(), this;
  }
  remove(n) {
    return n.parent === this && (we(this, n), n.parent = null, this._uncache()), this;
  }
  _removeChild(n) {
    this.remove(n);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const n of R(this))
      n.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...R(this)];
  }
  // ---- labels ----
  addLabel(n, i) {
    return this._labels.set(n, this.resolvePosition(i)), this;
  }
  getLabelTime(n) {
    return this._labels.get(n);
  }
  // ---- tween sugar ----
  addTweens(n, i, r, s, o) {
    const { stagger: a, ...u } = i, c = { ...this._childDefaults, ...u };
    if (a === void 0)
      return this.add(new x(n, c, r, s), o), this;
    const d = H(n), h = this.resolvePosition(o), f = c.delay ?? 0;
    return d.forEach((g, y) => {
      const _ = wt(y, d.length, a);
      this.add(new x(g, { ...c, delay: f + _ }, r, s), h);
    }), this;
  }
  to(n, i, r) {
    return this.addTweens(n, i, "to", void 0, r);
  }
  from(n, i, r) {
    return this.addTweens(n, i, "from", void 0, r);
  }
  fromTo(n, i, r, s) {
    return this.addTweens(n, r, "fromTo", i, s);
  }
  set(n, i, r) {
    return this.addTweens(n, { ...i, duration: 0 }, "to", void 0, r);
  }
  call(n, i) {
    return this.add(new x(null, { duration: 0, onStart: n }), i), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let n = 0;
    for (const i of R(this)) {
      const r = i.endTime();
      r > n && (n = r);
    }
    this._dur = n, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(n, i, r, s, o) {
    const a = Math.min(this._lastRenderedLocal, n), u = Math.max(this._lastRenderedLocal, n);
    this._lastRenderedLocal = n;
    for (const c of R(this)) {
      if (c.paused()) continue;
      const d = c.startTime();
      c.endTime() < a || d > u || c.render(Me(n, c), s, o);
    }
  }
}
function ke(t) {
  return !Array.isArray(t);
}
function Pe(t, e, n) {
  const i = t.filter((o) => o.duration === void 0).length, r = t.reduce((o, a) => o + (a.duration ?? 0), 0), s = e !== void 0 ? i > 0 ? Math.max(0, e - r) / i : 0 : n;
  return t.map((o) => {
    const { duration: a, ease: u, ...c } = o;
    return { duration: a ?? s, ease: u, props: c };
  });
}
function Ce(t, e, n) {
  const i = Object.entries(t).map(([s, o]) => {
    const a = s.trim().match(/^(-?[\d.]+)%$/);
    return a ? { pos: parseFloat(a[1]) / 100, props: o } : (console.warn(`[six] keyframes: invalid position "${s}", expected e.g. "50%"`), null);
  }).filter((s) => s !== null).sort((s, o) => s.pos - o.pos), r = [];
  for (let s = 0; s < i.length; s++) {
    const o = s === 0 ? 0 : i[s - 1].pos, { ease: a, ...u } = i[s].props;
    r.push({ duration: Math.max(0, (i[s].pos - o) * e), ease: a ?? n, props: u });
  }
  return r;
}
function $e(t, e) {
  const n = e.keyframes, i = ke(n) ? Ce(n, e.duration ?? 0.5, e.ease) : Pe(n, e.duration, e.duration ?? 0.5), r = new F(), s = {};
  for (const o of i) {
    const a = {};
    for (const u in o.props)
      u in s && (a[u] = s[u]);
    r.fromTo(t, a, { ...o.props, duration: o.duration, ease: o.ease ?? e.ease }), Object.assign(s, o.props);
  }
  return r;
}
function H(t) {
  if (t == null) return [];
  if (typeof t == "string") {
    const e = Array.from(document.querySelectorAll(t));
    return e.length === 0 && console.warn(`[six] no elements matched selector "${t}"`), e;
  }
  return t instanceof Element ? [t] : Array.from(t).filter((e) => e instanceof Element);
}
class x extends yt {
  constructor(n, i, r = "to", s) {
    super(i);
    l(this, "targets");
    l(this, "mode");
    l(this, "rawVars");
    l(this, "rawFromVars");
    l(this, "ease");
    l(this, "tracks", []);
    l(this, "keyframeTimeline", null);
    const o = Ct();
    this.targets = H(n), this.mode = r, this.rawVars = i, this.rawFromVars = s, this.ease = $t(i.ease ?? o.ease), i.keyframes ? (this.keyframeTimeline = $e(this.targets, i), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(i.duration ?? o.duration), this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = pe(this.targets, this.rawVars, this.mode, this.rawFromVars));
  }
  _renderIteration(n) {
    if (this.keyframeTimeline) {
      this.keyframeTimeline.render(n, !0, !0);
      return;
    }
    const i = this.duration(), r = i ? n / i : 1, s = this.ease(r), o = r > 0 && r < 1, a = /* @__PURE__ */ new Set();
    for (const u of this.tracks)
      ye(u, s), u.isTransform && a.add(u.target);
    for (const u of a)
      Nt(u, I(u), o);
  }
}
const A = () => typeof performance < "u" ? performance.now() : Date.now();
class Re {
  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(e = {}) {
    l(this, "listeners", []);
    l(this, "i", 0);
    // live cursor into `listeners` during dispatch, adjusted by remove()
    l(this, "frame", 0);
    l(this, "timeMs", 0);
    l(this, "deltaMs", 0);
    l(this, "startTime", A());
    l(this, "lastUpdate", this.startTime);
    l(this, "lagThreshold", 500);
    l(this, "adjustedLag", 33);
    l(this, "gap", 1e3 / 240);
    l(this, "nextTime", this.gap);
    l(this, "rafId", null);
    l(this, "manual");
    l(this, "loop", () => {
      this.manual || (this.advance(A() - this.lastUpdate), this.rafId !== null && (this.rafId = this.request(this.loop)));
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
    const n = this.lastUpdate - this.startTime, i = n - this.nextTime;
    i < 0 || (this.frame++, this.deltaMs = n - this.timeMs * 1e3, this.timeMs = n / 1e3, this.nextTime += i >= this.gap ? i + 4 : this.gap, this.dispatch());
  }
  dispatch() {
    const e = this.timeMs, n = this.deltaMs, i = this.frame;
    for (this.i = 0; this.i < this.listeners.length; this.i++)
      this.listeners[this.i](e, n, i);
  }
  add(e) {
    return this.listeners.includes(e) || (this.listeners.push(e), this.wake()), e;
  }
  remove(e) {
    const n = this.listeners.indexOf(e);
    n !== -1 && (this.listeners.splice(n, 1), n <= this.i && this.i--);
  }
  /** Restarts the internal clock (used on wake so a long sleep doesn't register as lag) and starts the rAF loop. */
  wake() {
    if (this.manual || this.rafId !== null) return;
    const e = A();
    this.startTime = e - this.timeMs * 1e3, this.lastUpdate = e, this.rafId = this.request(this.loop);
  }
  sleep() {
    this.rafId !== null && (this.cancel(this.rafId), this.rafId = null);
  }
  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(e = 1e3 / 60) {
    this.frame++, this.deltaMs = e, this.timeMs += e / 1e3, this.lastUpdate = A(), this.startTime = this.lastUpdate - this.timeMs * 1e3, this.nextTime = this.timeMs * 1e3 + this.gap, this.dispatch();
  }
  fps(e) {
    const n = Math.max(1, e);
    this.gap = 1e3 / n, this.nextTime = this.timeMs * 1e3 + this.gap;
  }
  lagSmoothing(e = 500, n = 33) {
    this.lagThreshold = e || 1 / 0, this.adjustedLag = Math.min(n, this.lagThreshold);
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
const K = new Re(), M = new F({ unbounded: !0, defaultPosition: "now" });
K.add((t) => M.render(t));
let j = 0;
function xt() {
  j++;
}
const De = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function Ae(t, e) {
  if (t === window) return e === "y" ? window.scrollY : window.scrollX;
  const n = t;
  return e === "y" ? n.scrollTop : n.scrollLeft;
}
function U(t, e = "y") {
  const n = De[e], i = n.get(t);
  if (i && i.gen === j) return i.value;
  const r = Ae(t, e);
  return n.set(t, { gen: j, value: r }), r;
}
function Ye(t, e = "y") {
  var i, r;
  if (t === window)
    return e === "y" ? ((i = window.visualViewport) == null ? void 0 : i.height) ?? window.innerHeight : ((r = window.visualViewport) == null ? void 0 : r.width) ?? window.innerWidth;
  const n = t;
  return e === "y" ? n.clientHeight : n.clientWidth;
}
const z = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
function Le(t, e) {
  let n = z.get(t);
  if (!n) {
    n = /* @__PURE__ */ new Set(), z.set(t, n);
    const i = () => {
      xt(), n.forEach((r) => r());
    };
    G.set(t, i), t.addEventListener("scroll", i, { passive: !0 });
  }
  n.add(e);
}
function Ie(t, e) {
  const n = z.get(t);
  if (n && (n.delete(e), n.size === 0)) {
    const i = G.get(t);
    i && t.removeEventListener("scroll", i), G.delete(t), z.delete(t);
  }
}
const J = /* @__PURE__ */ new Set();
let ut = !1;
function ct() {
  xt(), J.forEach((t) => t());
}
function Oe(t) {
  J.add(t), !ut && typeof window < "u" && (ut = !0, window.addEventListener("resize", ct), typeof document < "u" && document.readyState !== "complete" && window.addEventListener("load", ct, { once: !0 }));
}
function Ee(t) {
  J.delete(t);
}
function ze(t) {
  const e = (n) => {
    t.totalProgress(n);
  };
  return { update: e, snapTo: e, kill() {
  } };
}
function Fe(t, e) {
  let n = t.totalProgress(), i = n, r = !1;
  const s = (o, a) => {
    r = !0;
    const u = a / 1e3, c = 1 - Math.exp(-3 * u / Math.max(0.05, e));
    i += (n - i) * c, Math.abs(n - i) < 5e-4 && (i = n), t.totalProgress(i);
  };
  return K.add(s), {
    update(o) {
      n = o, r || (i = n, t.totalProgress(i));
    },
    snapTo(o) {
      n = o, i = o, t.totalProgress(i);
    },
    kill() {
      K.remove(s);
    }
  };
}
const q = /* @__PURE__ */ new WeakMap();
function He(t) {
  let e = q.get(t);
  if (!e) {
    const a = t.getBoundingClientRect(), u = getComputedStyle(t), c = document.createElement("div");
    c.style.position = "relative", c.style.width = `${a.width}px`, c.style.height = `${a.height}px`, t.parentNode.insertBefore(c, t), c.appendChild(t), e = {
      spacer: c,
      refCount: 0,
      rect: a,
      docTop: a.top + window.scrollY,
      distance: 0,
      originalStyles: {
        position: t.style.position,
        top: t.style.top,
        left: t.style.left,
        width: t.style.width,
        margin: u.margin,
        transform: t.style.transform
      }
    }, q.set(t, e);
  }
  e.refCount++;
  const n = e;
  let i = 0;
  const r = () => {
    t.style.position = n.originalStyles.position, t.style.top = n.originalStyles.top, t.style.left = n.originalStyles.left, t.style.width = n.originalStyles.width, t.style.margin = n.originalStyles.margin;
  }, s = () => {
    t.style.position = "fixed", t.style.top = `${i}px`, t.style.left = `${n.rect.left}px`, t.style.width = `${n.rect.width}px`, t.style.margin = "0";
  }, o = () => {
    t.style.position = "absolute", t.style.top = `${n.distance}px`, t.style.left = "0px", t.style.width = `${n.rect.width}px`, t.style.margin = "0";
  };
  return {
    get naturalDocTop() {
      return n.docTop;
    },
    setDistance(a) {
      n.distance = Math.max(0, a), n.spacer.style.height = `${n.rect.height + n.distance}px`;
    },
    setPinnedTop(a) {
      i = a;
    },
    setPhase(a) {
      a === "before" ? r() : a === "during" ? s() : o();
    },
    revert() {
      var a;
      n.refCount--, !(n.refCount > 0) && (t.style.position = n.originalStyles.position, t.style.top = n.originalStyles.top, t.style.left = n.originalStyles.left, t.style.width = n.originalStyles.width, t.style.margin = n.originalStyles.margin, t.style.transform = n.originalStyles.transform, (a = n.spacer.parentNode) == null || a.insertBefore(t, n.spacer), n.spacer.remove(), q.delete(t));
    }
  };
}
function dt(t, e, n) {
  const i = document.createElement("div");
  i.style.cssText = `position:absolute;left:0;width:100%;border-top:2px dashed ${t};z-index:999999;pointer-events:none;`;
  const r = document.createElement("span");
  return r.textContent = e, r.style.cssText = `position:absolute;${n}:0;top:2px;background:${t};color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`, i.appendChild(r), { line: i, label: r };
}
function Xe(t) {
  const e = dt("#4ade80", `${t ? `${t} ` : ""}start`, "left"), n = dt("#f87171", `${t ? `${t} ` : ""}end`, "right");
  return e.line.setAttribute("data-six-marker", `${t}-start`), n.line.setAttribute("data-six-marker", `${t}-end`), document.body.appendChild(e.line), document.body.appendChild(n.line), {
    update(i, r) {
      e.line.style.top = `${i}px`, n.line.style.top = `${r}px`;
    },
    remove() {
      e.line.remove(), n.line.remove();
    }
  };
}
const ht = { top: 0, center: 0.5, bottom: 1 };
function ft(t) {
  const e = t.trim();
  if (e in ht) return { ratio: ht[e], offsetPx: 0 };
  if (e.endsWith("%")) return { ratio: parseFloat(e) / 100, offsetPx: 0 };
  const n = parseFloat(e);
  return { ratio: 0, offsetPx: isNaN(n) ? 0 : n };
}
function Ne(t, e, n, i) {
  const [r = "top", s = "top"] = t.trim().split(/\s+/), o = ft(r), a = ft(s), u = n + e.top + o.ratio * e.height + o.offsetPx, c = a.ratio * i + a.offsetPx;
  return u - c;
}
function Ue(t) {
  if (t === void 0) return window;
  if (typeof t == "string") {
    const e = document.querySelector(t);
    return e || (console.warn(`[six] ScrollTrigger: scroller "${t}" not found, falling back to window`), window);
  }
  return t;
}
function mt(t) {
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
    l(this, "vars");
    l(this, "triggerEl");
    l(this, "scroller");
    l(this, "startY", 0);
    l(this, "endY", 0);
    l(this, "wasInside", !1);
    l(this, "lastScroll", 0);
    l(this, "killed", !1);
    l(this, "pinHandle", null);
    l(this, "scrubController", null);
    l(this, "markerHandle", null);
    l(this, "boundOnScroll", () => this.update());
    l(this, "boundOnResize", () => this.refresh());
    this.vars = e, this.triggerEl = mt(e.trigger), this.scroller = Ue(e.scroller), e.animation && (e.animation.pause(), e.scrub && (this.scrubController = typeof e.scrub == "number" ? Fe(e.animation, e.scrub) : ze(e.animation))), e.markers && (this.markerHandle = Xe(e.id ?? String(w.length))), w.push(this), this.refresh(), Le(this.scroller, this.boundOnScroll), Oe(this.boundOnResize);
  }
  resolvePositionValue(e, n, i) {
    let r = e ?? n;
    if (typeof r == "function" && (r = r()), typeof r == "number") return r;
    const s = r.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (s && i !== void 0) {
      const c = parseFloat(s[2]);
      return i + (s[1] === "-" ? -c : c);
    }
    const o = this.triggerEl.getBoundingClientRect(), a = U(this.scroller, "y"), u = Ye(this.scroller, "y");
    return Ne(r, o, a, u);
  }
  refresh() {
    var e, n, i, r;
    if (!this.killed) {
      if ((e = this.pinHandle) == null || e.setPhase("before"), this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1), this.vars.pin) {
        const s = this.vars.pin === !0 ? this.triggerEl : typeof this.vars.pin == "string" ? mt(this.vars.pin) : this.vars.pin;
        s instanceof Element ? (this.pinHandle ?? (this.pinHandle = He(s)), this.pinHandle.setPinnedTop(this.pinHandle.naturalDocTop - this.startY), this.pinHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] ScrollTrigger: pin must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.pin)}, ignoring`);
      }
      (n = this.markerHandle) == null || n.update(this.startY, this.endY), this.update(!0), (r = (i = this.vars).onRefresh) == null || r.call(i, this);
    }
  }
  computeProgress(e) {
    return Math.max(0, Math.min((e - this.startY) / (this.endY - this.startY), 1));
  }
  update(e = !1) {
    var a, u, c, d, h, f, g, y, _, k, S, P, Q;
    if (this.killed) return;
    const n = U(this.scroller, "y"), i = this.computeProgress(n), r = n >= this.startY && n <= this.endY, s = n >= this.lastScroll, o = this.wasInside;
    this.pinHandle && this.pinHandle.setPhase(n < this.startY ? "before" : n > this.endY ? "after" : "during"), r && !o ? s ? ((u = (a = this.vars).onEnter) == null || u.call(a, this), this.scrubController || (c = this.vars.animation) == null || c.play()) : (h = (d = this.vars).onEnterBack) == null || h.call(d, this) : !r && o && (s ? (g = (f = this.vars).onLeave) == null || g.call(f, this) : (_ = (y = this.vars).onLeaveBack) == null || _.call(y, this)), this.wasInside = r, this.lastScroll = n, e ? (k = this.scrubController) == null || k.snapTo(i) : (S = this.scrubController) == null || S.update(i), (r || r !== o) && ((Q = (P = this.vars).onUpdate) == null || Q.call(P, this));
  }
  progress() {
    return this.computeProgress(U(this.scroller, "y"));
  }
  isActive() {
    return this.wasInside;
  }
  kill() {
    var n, i, r;
    if (this.killed) return;
    this.killed = !0, Ie(this.scroller, this.boundOnScroll), Ee(this.boundOnResize), (n = this.pinHandle) == null || n.revert(), (i = this.scrubController) == null || i.kill(), (r = this.markerHandle) == null || r.remove();
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
function qe(t, e) {
  return e || (typeof t == "string" || t instanceof Element ? t : H(t)[0]);
}
function pt(t, e, n) {
  if (!e) return;
  const i = qe(t, e.trigger);
  X.create({ ...e, trigger: i, animation: n });
}
function Z(t, e, n, i) {
  const { stagger: r, scrollTrigger: s, ...o } = e;
  if (r === void 0) {
    const d = new x(t, o, n, i);
    return M.add(d), pt(t, s, d), d;
  }
  const a = H(t), u = o.delay ?? 0, c = new F();
  return a.forEach((d, h) => {
    const f = u + wt(h, a.length, r);
    c.add(new x(d, { ...o, delay: f }, n, i), 0);
  }), M.add(c), pt(t, s, c), c;
}
function Ve(t, e) {
  return Z(t, e, "to");
}
function We(t, e) {
  return Z(t, e, "from");
}
function Be(t, e, n) {
  return Z(t, n, "fromTo", e);
}
function Ke(t, e) {
  const n = new x(t, { ...e, duration: 0 });
  return M.add(n), n;
}
function je(t) {
  const { scrollTrigger: e, ...n } = t ?? {}, i = new F(n);
  return M.add(i), e && (e.trigger ? X.create({ ...e, trigger: e.trigger, animation: i }) : console.warn("[six] timeline({ scrollTrigger }) requires an explicit trigger - a Timeline has no target to default to")), i;
}
function Ge(t) {
  Pt(t);
}
const Qe = {
  to: Ve,
  from: We,
  fromTo: Be,
  set: Ke,
  timeline: je,
  config: Ge,
  context: Mt
};
export {
  X as ScrollTrigger,
  Ze as VERSION,
  Qe as six
};
