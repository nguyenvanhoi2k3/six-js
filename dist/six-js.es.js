var xt = Object.defineProperty;
var bt = (t, e, i) => e in t ? xt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var l = (t, e, i) => bt(t, typeof e != "symbol" ? e + "" : e, i);
const Je = "0.0.33";
function pt(t, e, i) {
  return e < 0 ? 1 / 0 : t * (e + 1) + i * e;
}
function tt(t, e, i, n, r) {
  if (e <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (i === 0)
    return { iteration: 0, time: t < 0 ? 0 : t > e ? e : t, reversed: !1 };
  const s = e + n, o = pt(e, i, n);
  let a = t;
  a < 0 ? a = 0 : i >= 0 && a > o && (a = o);
  let u = Math.floor(a / s), c = a - u * s;
  n === 0 && u > 0 && c === 0 && (u -= 1, c = e), i >= 0 && u > i && (u = i, c = a - u * s), c > e && (c = e);
  const h = r && u % 2 === 1;
  return h && (c = e - c), { iteration: u, time: c, reversed: h };
}
let L = null;
function St() {
  return L;
}
class vt {
  constructor(e) {
    l(this, "captured", /* @__PURE__ */ new Set());
    l(this, "dead", !1);
    e && this.run(e);
  }
  run(e) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const i = L;
    L = this;
    try {
      return e(this);
    } finally {
      L = i;
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
function Tt(t) {
  return new vt(t);
}
let Mt = 0;
class gt {
  constructor(e = {}) {
    l(this, "id", ++Mt);
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
    var i;
    (i = St()) == null || i._capture(this), this._delay = Math.max(0, e.delay ?? 0), this._repeat = e.repeat ?? 0, this._repeatDelay = Math.max(0, e.repeatDelay ?? 0), this._yoyo = e.yoyo ?? !1, e.onStart && this.on("start", e.onStart), e.onUpdate && this.on("update", e.onUpdate), e.onComplete && this.on("complete", e.onComplete), e.onRepeat && this.on("repeat", e.onRepeat), e.onReverseComplete && this.on("reverseComplete", e.onReverseComplete), e.paused && (this._ts = 0);
  }
  // ---- rendering ----
  /**
   * Renders this animation at `totalTime` (on ITS OWN axis, delay included at the front).
   * `suppressEvents` skips start/update/repeat/complete callbacks (used by seek()). `force`
   * re-renders even if `totalTime` hasn't changed since the last render.
   */
  render(e, i = !1, n = !1) {
    const r = this._tTime, s = this.totalDuration();
    let o = e;
    o < 0 ? o = 0 : this._repeat >= 0 && o > s && (o = s);
    const a = !this._initted;
    a && (this._initted = !0, this._onInit());
    const u = tt(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), c = a ? u : tt(r - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo), h = u.iteration !== c.iteration;
    this._tTime = o, this._time = u.time, this._renderIteration(u.time, u.reversed, u.iteration, i, n || h);
    const d = this._rawPrev;
    if (this._rawPrev = e, i) return;
    const f = s === 0, g = f ? e < 0 : o <= 0, y = f ? e >= 0 : this._repeat >= 0 && o >= s, _ = f ? d < 0 : r <= 0, k = f ? d >= 0 : this._repeat >= 0 && r >= s, S = f ? e > d : o > r, P = f ? e < d : o < r;
    !this._hasStarted && !g && (this._hasStarted = !0, this.emit("start")), S && h && this.emit("repeat"), this.emit("update"), S && !k && y ? this.emit("complete") : P && !_ && g && this.emit("reverseComplete");
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
    this._tDur = this._delay + pt(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
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
    const n = this._tTime - this._delay - this._time;
    return this.totalTime(this._delay + n + Math.max(0, Math.min(e, this._dur)), i);
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
    var n;
    return ((n = this.listeners)[e] ?? (n[e] = /* @__PURE__ */ new Set())).add(i), this;
  }
  off(e, i) {
    var n;
    return (n = this.listeners[e]) == null || n.delete(i), this;
  }
  emit(e) {
    var i;
    (i = this.listeners[e]) == null || i.forEach((n) => n());
  }
}
let V = { duration: 0.5, ease: "power1.out" };
function kt(t) {
  V = { ...V, ...t };
}
function Pt() {
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
  const n = t - 2.625 / 2.75;
  return 7.5625 * n * n + 0.984375;
}
const v = 1.70158, R = v * 1.525, et = 2 * Math.PI / 3, it = 2 * Math.PI / 4.5, N = {
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
  "back.in": (t) => (v + 1) * t * t * t - v * t * t,
  "back.out": (t) => {
    const e = t - 1;
    return 1 + (v + 1) * e * e * e + v * e * e;
  },
  "back.inOut": (t) => {
    if (t < 0.5) {
      const i = 2 * t;
      return i * i * ((R + 1) * i - R) / 2;
    }
    const e = 2 * t - 2;
    return (e * e * ((R + 1) * e + R) + 2) / 2;
  },
  "bounce.in": (t) => 1 - C(1 - t),
  "bounce.out": C,
  "bounce.inOut": (t) => t < 0.5 ? (1 - C(1 - 2 * t)) / 2 : (1 + C(2 * t - 1)) / 2,
  "elastic.in": (t) => t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * et),
  "elastic.out": (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * et) + 1,
  "elastic.inOut": (t) => t === 0 || t === 1 ? t : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * it)) / 2 : Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * it) / 2 + 1
};
function Ct(t) {
  return typeof t == "function" ? t : t && N[t] ? N[t] : N["power1.out"];
}
const Rt = /^#([0-9a-f]{3,8})$/i, $t = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, Dt = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, At = {
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
  return At[t.toLowerCase()] ?? null;
}
function p(t, e, i) {
  const n = i === 1 ? t[e] + t[e] : t.slice(e, e + 2);
  return parseInt(n, 16);
}
function Y(t) {
  const e = t.trim(), i = e.match(Rt);
  if (i) {
    const r = i[1];
    if (r.length === 3 || r.length === 4) {
      const s = r.length === 4 ? p(r, 3, 1) / 255 : 1;
      return { r: p(r, 0, 1), g: p(r, 1, 1), b: p(r, 2, 1), a: s };
    }
    if (r.length === 6 || r.length === 8) {
      const s = r.length === 8 ? p(r, 6, 2) / 255 : 1;
      return { r: p(r, 0, 2), g: p(r, 2, 2), b: p(r, 4, 2), a: s };
    }
  }
  const n = e.match($t) ?? e.match(Dt);
  if (n) {
    const [, r, s, o, a] = n;
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
function yt(t, e, i) {
  return {
    r: Math.round(t.r + (e.r - t.r) * i),
    g: Math.round(t.g + (e.g - t.g) * i),
    b: Math.round(t.b + (e.b - t.b) * i),
    a: Math.round((t.a + (e.a - t.a) * i) * 1e3) / 1e3
  };
}
function W(t) {
  return `rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`;
}
const Yt = {
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
}, nt = /* @__PURE__ */ new WeakMap(), It = /^matrix\(([^)]+)\)$/, Ot = /^matrix3d\(([^)]+)\)$/, rt = 180 / Math.PI;
function Et(t) {
  if (!t || t === "none") return {};
  const e = t.match(It);
  if (e) {
    const [n, r, s, o, a, u] = e[1].split(",").map(Number), c = Math.sqrt(n * n + r * r), h = Math.sqrt(s * s + o * o), d = Math.atan2(r, n) * rt, f = (Math.atan2(s, o) * rt + d) * -1;
    return { x: a, y: u, rotation: d, scaleX: c, scaleY: h, skewX: Ft(f) };
  }
  const i = t.match(Ot);
  if (i) {
    const n = i[1].split(",").map(Number);
    return { x: n[12], y: n[13], z: n[14] };
  }
  return {};
}
function zt(t) {
  return typeof getComputedStyle > "u" ? {} : Et(getComputedStyle(t).transform);
}
function Ft(t) {
  let e = t % 360;
  return e > 180 && (e -= 360), e < -180 && (e += 360), e;
}
function I(t) {
  let e = nt.get(t);
  return e || (e = { ...Yt, ...zt(t) }, nt.set(t, e)), e;
}
function m(t) {
  return Math.round(t * 1e4) / 1e4;
}
function Ht(t, e) {
  const i = [];
  return (t.xPercent || t.yPercent) && i.push(`translate(${m(t.xPercent)}%, ${m(t.yPercent)}%)`), (t.x || t.y || t.z) && i.push(e ? `translate3d(${m(t.x)}px, ${m(t.y)}px, ${m(t.z)}px)` : `translate(${m(t.x)}px, ${m(t.y)}px)`), t.rotation && i.push(`rotate(${m(t.rotation)}deg)`), t.rotationX && i.push(`rotateX(${m(t.rotationX)}deg)`), t.rotationY && i.push(`rotateY(${m(t.rotationY)}deg)`), t.skewX && i.push(`skewX(${m(t.skewX)}deg)`), t.skewY && i.push(`skewY(${m(t.skewY)}deg)`), (t.scaleX !== 1 || t.scaleY !== 1) && i.push(`scale(${m(t.scaleX)}, ${m(t.scaleY)})`), i.length ? i.join(" ") : "none";
}
function Xt(t, e, i) {
  t.style.transform = Ht(e, i);
}
const Nt = {
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
}, Ut = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), qt = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), Vt = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), Wt = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), Bt = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
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
function O(t, e) {
  var n;
  const i = (n = t.style) == null ? void 0 : n[e];
  return i || (typeof getComputedStyle > "u" ? "" : getComputedStyle(t)[e] || "");
}
function Kt(t) {
  const e = Ut.has(t) ? "deg" : qt.has(t) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: t,
    defaultUnit: e,
    get(i) {
      return { value: I(i)[t], unit: e };
    },
    set(i, n) {
      I(i)[t] = n.value;
    }
  };
}
function jt(t) {
  return {
    kind: "color",
    get(e) {
      return Y(O(e, t) || "rgba(0,0,0,0)");
    },
    set(e, i) {
      e.style[t] = W(i);
    }
  };
}
function Gt(t) {
  return {
    kind: "complex",
    get(e) {
      return O(e, t);
    },
    set(e, i) {
      e.style[t] = i;
    }
  };
}
function Jt(t, e) {
  const i = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(t).trim() : "";
  return b(e) || b(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(n) {
      return T(getComputedStyle(n).getPropertyValue(t).trim());
    },
    set(n, r) {
      n.style.setProperty(t, `${r.value}${r.unit}`);
    }
  } : {
    kind: "discrete",
    get(n) {
      return getComputedStyle(n).getPropertyValue(t).trim();
    },
    set(n, r) {
      n.style.setProperty(t, r);
    }
  };
}
function Zt(t, e) {
  const i = Bt.has(t) ? "" : "px";
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: i,
    get(n) {
      const r = O(n, t);
      return b(r) ? T(r, i) : { value: 0, unit: i };
    },
    set(n, r) {
      n.style[t] = i === "" ? `${r.value}` : `${r.value}${r.unit}`;
    }
  } : {
    kind: "discrete",
    get(n) {
      return O(n, t);
    },
    set(n, r) {
      n.style[t] = r;
    }
  };
}
function Qt(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(n) {
      return T(n.getAttribute(t) ?? "0");
    },
    set(n, r) {
      n.setAttribute(t, String(r.value));
    }
  } : {
    kind: "discrete",
    get(n) {
      return n.getAttribute(t) ?? "";
    },
    set(n, r) {
      n.setAttribute(t, r);
    }
  };
}
function st(t, e) {
  return b(e) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(i) {
      return { value: Number(i[t]) || 0, unit: "" };
    },
    set(i, n) {
      i[t] = n.value;
    }
  } : {
    kind: "discrete",
    get(i) {
      return String(i[t] ?? "");
    },
    set(i, n) {
      i[t] = n;
    }
  };
}
function te(t, e, i) {
  const n = Nt[e];
  if (n) return Kt(n);
  if (Vt.has(e)) return jt(e);
  if (Wt.has(e)) return Gt(e);
  if (e.startsWith("--")) return Jt(e, i);
  const r = t.style;
  return r && e in r ? Zt(e, i) : e in t && typeof t[e] == "number" ? st(e, i ?? t[e]) : typeof t.setAttribute == "function" ? Qt(e, i) : st(e, i);
}
const ee = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function ie(t) {
  if (t[0] === "#" || /^(rgba?|hsla?)\(/i.test(t))
    return { type: "color", value: Y(t) };
  const e = t.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(e[1]), unit: e[2] };
}
function E(t) {
  const e = [], i = [];
  let n = 0;
  for (const r of t.matchAll(ee))
    i.push(t.slice(n, r.index)), e.push(ie(r[0])), n = r.index + r[0].length;
  return i.push(t.slice(n)), { literals: i, tokens: e };
}
function ne(t, e) {
  const i = E(t).tokens, n = E(e).tokens;
  return i.length === n.length && i.every((r, s) => r.type === n[s].type);
}
function re(t, e, i) {
  if (!t || t.type !== e.type) {
    const o = i >= 1 ? e : t ?? e;
    return o.type === "color" ? W(o.value) : `${o.value}${o.unit}`;
  }
  if (e.type === "color")
    return W(yt(t.value, e.value, i));
  const n = t.value, r = n + (e.value - n) * i, s = e.unit || t.unit;
  return `${Math.round(r * 1e4) / 1e4}${s}`;
}
function se(t, e, i) {
  const n = E(t), r = E(e);
  let s = "";
  for (let o = 0; o < r.literals.length; o++)
    s += r.literals[o], o < r.tokens.length && (s += re(n.tokens[o], r.tokens[o], i));
  return s;
}
const oe = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function ae(t) {
  return oe.test(t);
}
function ot(t, e, i, n) {
  if (!n || n === "px" || n === "deg" || n === "rad" || n === "turn") return i;
  if (n === "rem") {
    const r = typeof document < "u" && parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return i * r;
  }
  if (n === "em") {
    const r = typeof getComputedStyle < "u" && parseFloat(getComputedStyle(t).fontSize) || 16;
    return i * r;
  }
  if (n === "vh") return typeof window < "u" ? i / 100 * window.innerHeight : i;
  if (n === "vw") return typeof window < "u" ? i / 100 * window.innerWidth : i;
  if (n === "%") {
    const r = t.parentElement;
    if (!r) return i;
    const s = ae(e) ? r.clientWidth : r.clientHeight;
    return i / 100 * s;
  }
  return i;
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
  const i = e.match(B);
  if (!i) return null;
  const n = parseFloat(i[2]);
  switch (i[1]) {
    case "+":
      return t + n;
    case "-":
      return t - n;
    case "*":
      return t * n;
    case "/":
      return t / n;
    default:
      return t;
  }
}
function le(t, e) {
  const i = /* @__PURE__ */ new Set();
  for (const n in t) at.has(n) || i.add(n);
  if (e)
    for (const n in e) at.has(n) || i.add(n);
  return [...i];
}
function ue(t, e, i, n, r) {
  const s = i.get(t);
  let o, a;
  if (n === void 0)
    o = s.value, a = s.unit || i.defaultUnit;
  else if (typeof n == "string" && B.test(n))
    o = lt(s.value, n), a = s.unit || i.defaultUnit;
  else {
    const h = T(n, i.defaultUnit);
    o = h.value, a = h.unit;
  }
  let u, c;
  if (r === void 0)
    u = s.value, c = s.unit || i.defaultUnit;
  else if (typeof r == "string" && B.test(r))
    u = lt(o, r), c = a;
  else {
    const h = T(r, i.defaultUnit);
    u = h.value, c = h.unit;
  }
  return !i.isTransform && c !== a && (o = ot(t, e, o, a), u = ot(t, e, u, c), a = "px", c = "px"), { kind: "numeric", target: t, prop: e, isTransform: i.isTransform, handler: i, start: o, change: u - o, unit: c };
}
function ce(t, e, i, n) {
  const r = i !== void 0 ? Y(String(i)) : e.get(t), s = n !== void 0 ? Y(String(n)) : e.get(t);
  return { kind: "color", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function he(t, e, i, n) {
  const r = i !== void 0 ? String(i) : e.get(t), s = n !== void 0 ? String(n) : e.get(t);
  return ne(r, s) ? { kind: "complex", target: t, isTransform: !1, handler: e, start: r, end: s } : { kind: "discrete", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function de(t, e, i, n) {
  const r = i !== void 0 ? String(i) : e.get(t), s = n !== void 0 ? String(n) : e.get(t);
  return { kind: "discrete", target: t, isTransform: !1, handler: e, start: r, end: s };
}
function fe(t, e, i, n, r) {
  return i.kind === "numeric" ? ue(t, e, i, n, r) : i.kind === "color" ? ce(t, i, n, r) : i.kind === "complex" ? he(t, i, n, r) : de(t, i, n, r);
}
function me(t, e, i, n) {
  const r = le(e, n), s = [];
  for (const o of t)
    for (const a of r) {
      let u, c;
      i === "to" ? c = e[a] : i === "from" ? u = e[a] : (c = a in e ? e[a] : void 0, u = n && a in n ? n[a] : void 0);
      const h = te(o, a, c ?? u);
      s.push(fe(o, a, h, u, c));
    }
  return s;
}
function pe(t) {
  return Math.round(t * 1e4) / 1e4;
}
function ge(t, e) {
  switch (t.kind) {
    case "numeric": {
      const i = pe(t.start + t.change * e);
      t.isTransform ? I(t.target)[t.handler.transformKey] = i : t.handler.set(t.target, { value: i, unit: t.unit });
      return;
    }
    case "color":
      t.handler.set(t.target, yt(t.start, t.end, e));
      return;
    case "complex":
      t.handler.set(t.target, se(t.start, t.end, e));
      return;
    case "discrete":
      t.handler.set(t.target, e >= 1 ? t.end : t.start);
      return;
  }
}
function ye(t, e, i) {
  const n = i(e);
  let r = t.last();
  for (; r && i(r) > n; )
    r = r._prev;
  r ? (e._prev = r, e._next = r._next, r._next ? r._next._prev = e : t.setLast(e), r._next = e) : (e._prev = null, e._next = t.first(), e._next ? e._next._prev = e : t.setLast(e), t.setFirst(e));
}
function _e(t, e) {
  e._prev ? e._prev._next = e._next : t.first() === e && t.setFirst(e._next), e._next ? e._next._prev = e._prev : t.last() === e && t.setLast(e._prev), e._next = null, e._prev = null;
}
function* $(t) {
  let e = t.first();
  for (; e; ) {
    const i = e._next;
    yield e, e = i;
  }
}
function D(t, e) {
  if (!t || e === void 0) return 0;
  const i = parseFloat(e);
  return t === "-" ? -i : i;
}
const we = /^<(?:([+-])=([\d.]+))?$/, xe = /^>(?:([+-])=([\d.]+))?$/, be = /^([+-])=([\d.]+)$/, Se = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function ve(t, e) {
  if (t === void 0) return e.end;
  if (typeof t == "number") return Math.max(0, t);
  const i = t.trim();
  let n = i.match(we);
  if (n) return Math.max(0, e.prevStart + D(n[1], n[2]));
  if (n = i.match(xe), n) return Math.max(0, e.prevEnd + D(n[1], n[2]));
  if (n = i.match(be), n) return Math.max(0, e.end + D(n[1], n[2]));
  if (n = i.match(Se), n) {
    const [, r, s, o] = n, a = e.getLabel(r);
    return a === void 0 ? (console.warn(`[six] timeline: unknown label "${r}", appending at the current end`), e.end) : Math.max(0, a + D(s, o));
  }
  return console.warn(`[six] timeline: invalid position "${t}", appending at the current end`), e.end;
}
function _t(t, e, i) {
  if (typeof i == "number") return t * i;
  const { each: n, from: r = "start" } = i;
  let s;
  return r === "start" ? s = t : r === "end" ? s = e - 1 - t : r === "center" ? s = Math.abs(t - (e - 1) / 2) : s = Math.abs(t - r), s * n;
}
function Te(t, e) {
  const i = e.timeScale(), n = e.totalDuration();
  return (t - e.startTime()) * i + (i >= 0 ? 0 : n);
}
class F extends gt {
  constructor(i = {}) {
    super(i);
    l(this, "_firstChild", null);
    l(this, "_lastChild", null);
    l(this, "_cursor", 0);
    l(this, "_lastAdded", null);
    l(this, "_lastRenderedLocal", 0);
    l(this, "_labels", /* @__PURE__ */ new Map());
    l(this, "_defaultPositionMode");
    l(this, "_unbounded");
    l(this, "_childDefaults");
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
    return ve(i, this.positionContext());
  }
  add(i, n) {
    var s;
    (s = i.parent) == null || s._removeChild(i);
    const r = this.resolvePosition(n);
    return i.parent = this, i.startTime(r), ye(this, i, (o) => o.startTime()), this._cursor = Math.max(this._cursor, r + i.totalDuration()), this._lastAdded = i, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, r), this._uncache(), this;
  }
  remove(i) {
    return i.parent === this && (_e(this, i), i.parent = null, this._uncache()), this;
  }
  _removeChild(i) {
    this.remove(i);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const i of $(this))
      i.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...$(this)];
  }
  // ---- labels ----
  addLabel(i, n) {
    return this._labels.set(i, this.resolvePosition(n)), this;
  }
  getLabelTime(i) {
    return this._labels.get(i);
  }
  // ---- tween sugar ----
  addTweens(i, n, r, s, o) {
    const { stagger: a, ...u } = n, c = { ...this._childDefaults, ...u };
    if (a === void 0)
      return this.add(new x(i, c, r, s), o), this;
    const h = H(i), d = this.resolvePosition(o), f = c.delay ?? 0;
    return h.forEach((g, y) => {
      const _ = _t(y, h.length, a);
      this.add(new x(g, { ...c, delay: f + _ }, r, s), d);
    }), this;
  }
  to(i, n, r) {
    return this.addTweens(i, n, "to", void 0, r);
  }
  from(i, n, r) {
    return this.addTweens(i, n, "from", void 0, r);
  }
  fromTo(i, n, r, s) {
    return this.addTweens(i, r, "fromTo", n, s);
  }
  set(i, n, r) {
    return this.addTweens(i, { ...n, duration: 0 }, "to", void 0, r);
  }
  call(i, n) {
    return this.add(new x(null, { duration: 0, onStart: i }), n), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let i = 0;
    for (const n of $(this)) {
      const r = n.endTime();
      r > i && (i = r);
    }
    this._dur = i, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(i, n, r, s, o) {
    const a = Math.min(this._lastRenderedLocal, i), u = Math.max(this._lastRenderedLocal, i);
    this._lastRenderedLocal = i;
    for (const c of $(this)) {
      if (c.paused()) continue;
      const h = c.startTime();
      c.endTime() < a || h > u || c.render(Te(i, c), s, o);
    }
  }
}
function Me(t) {
  return !Array.isArray(t);
}
function ke(t, e, i) {
  const n = t.filter((o) => o.duration === void 0).length, r = t.reduce((o, a) => o + (a.duration ?? 0), 0), s = e !== void 0 ? n > 0 ? Math.max(0, e - r) / n : 0 : i;
  return t.map((o) => {
    const { duration: a, ease: u, ...c } = o;
    return { duration: a ?? s, ease: u, props: c };
  });
}
function Pe(t, e, i) {
  const n = Object.entries(t).map(([s, o]) => {
    const a = s.trim().match(/^(-?[\d.]+)%$/);
    return a ? { pos: parseFloat(a[1]) / 100, props: o } : (console.warn(`[six] keyframes: invalid position "${s}", expected e.g. "50%"`), null);
  }).filter((s) => s !== null).sort((s, o) => s.pos - o.pos), r = [];
  for (let s = 0; s < n.length; s++) {
    const o = s === 0 ? 0 : n[s - 1].pos, { ease: a, ...u } = n[s].props;
    r.push({ duration: Math.max(0, (n[s].pos - o) * e), ease: a ?? i, props: u });
  }
  return r;
}
function Ce(t, e) {
  const i = e.keyframes, n = Me(i) ? Pe(i, e.duration ?? 0.5, e.ease) : ke(i, e.duration, e.duration ?? 0.5), r = new F(), s = {};
  for (const o of n) {
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
class x extends gt {
  constructor(i, n, r = "to", s) {
    super(n);
    l(this, "targets");
    l(this, "mode");
    l(this, "rawVars");
    l(this, "rawFromVars");
    l(this, "ease");
    l(this, "tracks", []);
    l(this, "keyframeTimeline", null);
    const o = Pt();
    this.targets = H(i), this.mode = r, this.rawVars = n, this.rawFromVars = s, this.ease = Ct(n.ease ?? o.ease), n.keyframes ? (this.keyframeTimeline = Ce(this.targets, n), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(n.duration ?? o.duration), this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = me(this.targets, this.rawVars, this.mode, this.rawFromVars));
  }
  _renderIteration(i) {
    if (this.keyframeTimeline) {
      this.keyframeTimeline.render(i, !0, !0);
      return;
    }
    const n = this.duration(), r = n ? i / n : 1, s = this.ease(r), o = r > 0 && r < 1, a = /* @__PURE__ */ new Set();
    for (const u of this.tracks)
      ge(u, s), u.isTransform && a.add(u.target);
    for (const u of a)
      Xt(u, I(u), o);
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
    const i = this.lastUpdate - this.startTime, n = i - this.nextTime;
    n < 0 || (this.frame++, this.deltaMs = i - this.timeMs * 1e3, this.timeMs = i / 1e3, this.nextTime += n >= this.gap ? n + 4 : this.gap, this.dispatch());
  }
  dispatch() {
    const e = this.timeMs, i = this.deltaMs, n = this.frame;
    for (this.i = 0; this.i < this.listeners.length; this.i++)
      this.listeners[this.i](e, i, n);
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
const K = new Re(), M = new F({ unbounded: !0, defaultPosition: "now" });
K.add((t) => M.render(t));
let j = 0;
function wt() {
  j++;
}
const $e = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function De(t, e) {
  if (t === window) return e === "y" ? window.scrollY : window.scrollX;
  const i = t;
  return e === "y" ? i.scrollTop : i.scrollLeft;
}
function U(t, e = "y") {
  const i = $e[e], n = i.get(t);
  if (n && n.gen === j) return n.value;
  const r = De(t, e);
  return i.set(t, { gen: j, value: r }), r;
}
function Ae(t, e = "y") {
  var n, r;
  if (t === window)
    return e === "y" ? ((n = window.visualViewport) == null ? void 0 : n.height) ?? window.innerHeight : ((r = window.visualViewport) == null ? void 0 : r.width) ?? window.innerWidth;
  const i = t;
  return e === "y" ? i.clientHeight : i.clientWidth;
}
const z = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Map();
function Le(t, e) {
  let i = z.get(t);
  if (!i) {
    i = /* @__PURE__ */ new Set(), z.set(t, i);
    const n = () => {
      wt(), i.forEach((r) => r());
    };
    G.set(t, n), t.addEventListener("scroll", n, { passive: !0 });
  }
  i.add(e);
}
function Ye(t, e) {
  const i = z.get(t);
  if (i && (i.delete(e), i.size === 0)) {
    const n = G.get(t);
    n && t.removeEventListener("scroll", n), G.delete(t), z.delete(t);
  }
}
const J = /* @__PURE__ */ new Set();
let ut = !1;
function ct() {
  wt(), J.forEach((t) => t());
}
function Ie(t) {
  J.add(t), !ut && typeof window < "u" && (ut = !0, window.addEventListener("resize", ct), typeof document < "u" && document.readyState !== "complete" && window.addEventListener("load", ct, { once: !0 }));
}
function Oe(t) {
  J.delete(t);
}
function Ee(t) {
  const e = (i) => {
    t.totalProgress(i);
  };
  return { update: e, snapTo: e, kill() {
  } };
}
function ze(t, e) {
  let i = t.totalProgress(), n = i, r = !1;
  const s = (o, a) => {
    r = !0;
    const u = a / 1e3, c = 1 - Math.exp(-3 * u / Math.max(0.05, e));
    n += (i - n) * c, Math.abs(i - n) < 5e-4 && (n = i), t.totalProgress(n);
  };
  return K.add(s), {
    update(o) {
      i = o, r || (n = i, t.totalProgress(n));
    },
    snapTo(o) {
      i = o, n = o, t.totalProgress(n);
    },
    kill() {
      K.remove(s);
    }
  };
}
const q = /* @__PURE__ */ new WeakMap();
function Fe(t) {
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
  const i = e;
  let n = 0;
  const r = () => {
    t.style.position = i.originalStyles.position, t.style.top = i.originalStyles.top, t.style.left = i.originalStyles.left, t.style.width = i.originalStyles.width, t.style.margin = i.originalStyles.margin;
  }, s = () => {
    t.style.position = "fixed", t.style.top = `${n}px`, t.style.left = `${i.rect.left}px`, t.style.width = `${i.rect.width}px`, t.style.margin = "0";
  }, o = () => {
    t.style.position = "absolute", t.style.top = `${i.distance}px`, t.style.left = "0px", t.style.width = `${i.rect.width}px`, t.style.margin = "0";
  };
  return {
    get naturalDocTop() {
      return i.docTop;
    },
    setDistance(a) {
      i.distance = Math.max(0, a), i.spacer.style.height = `${i.rect.height + i.distance}px`;
    },
    setPinnedTop(a) {
      n = a;
    },
    setPhase(a) {
      a === "before" ? r() : a === "during" ? s() : o();
    },
    revert() {
      var a;
      i.refCount--, !(i.refCount > 0) && (t.style.position = i.originalStyles.position, t.style.top = i.originalStyles.top, t.style.left = i.originalStyles.left, t.style.width = i.originalStyles.width, t.style.margin = i.originalStyles.margin, t.style.transform = i.originalStyles.transform, (a = i.spacer.parentNode) == null || a.insertBefore(t, i.spacer), i.spacer.remove(), q.delete(t));
    }
  };
}
function He(t) {
  const e = document.createElement("div"), i = document.createElement("div"), n = (r, s) => {
    r.style.cssText = `position:absolute;left:0;width:100%;border-top:2px dashed ${s};z-index:999999;pointer-events:none;`;
  };
  return n(e, "#4ade80"), n(i, "#f87171"), e.setAttribute("data-six-marker", `${t}-start`), i.setAttribute("data-six-marker", `${t}-end`), document.body.appendChild(e), document.body.appendChild(i), {
    update(r, s) {
      e.style.top = `${r}px`, i.style.top = `${s}px`;
    },
    remove() {
      e.remove(), i.remove();
    }
  };
}
const ht = { top: 0, center: 0.5, bottom: 1 };
function dt(t) {
  const e = t.trim();
  if (e in ht) return { ratio: ht[e], offsetPx: 0 };
  if (e.endsWith("%")) return { ratio: parseFloat(e) / 100, offsetPx: 0 };
  const i = parseFloat(e);
  return { ratio: 0, offsetPx: isNaN(i) ? 0 : i };
}
function Xe(t, e, i, n) {
  const [r = "top", s = "top"] = t.trim().split(/\s+/), o = dt(r), a = dt(s), u = i + e.top + o.ratio * e.height + o.offsetPx, c = a.ratio * n + a.offsetPx;
  return u - c;
}
function Ne(t) {
  if (t === void 0) return window;
  if (typeof t == "string") {
    const e = document.querySelector(t);
    return e || (console.warn(`[six] ScrollTrigger: scroller "${t}" not found, falling back to window`), window);
  }
  return t;
}
function ft(t) {
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
    this.vars = e, this.triggerEl = ft(e.trigger), this.scroller = Ne(e.scroller), e.animation && (e.animation.pause(), e.scrub && (this.scrubController = typeof e.scrub == "number" ? ze(e.animation, e.scrub) : Ee(e.animation))), e.markers && (this.markerHandle = He(String(w.length))), w.push(this), this.refresh(), Le(this.scroller, this.boundOnScroll), Ie(this.boundOnResize);
  }
  resolvePositionValue(e, i, n) {
    let r = e ?? i;
    if (typeof r == "function" && (r = r()), typeof r == "number") return r;
    const s = r.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (s && n !== void 0) {
      const c = parseFloat(s[2]);
      return n + (s[1] === "-" ? -c : c);
    }
    const o = this.triggerEl.getBoundingClientRect(), a = U(this.scroller, "y"), u = Ae(this.scroller, "y");
    return Xe(r, o, a, u);
  }
  refresh() {
    var e, i, n, r;
    if (!this.killed) {
      if ((e = this.pinHandle) == null || e.setPhase("before"), this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1), this.vars.pin) {
        const s = this.vars.pin === !0 ? this.triggerEl : typeof this.vars.pin == "string" ? ft(this.vars.pin) : this.vars.pin;
        s instanceof Element ? (this.pinHandle ?? (this.pinHandle = Fe(s)), this.pinHandle.setPinnedTop(this.pinHandle.naturalDocTop - this.startY), this.pinHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] ScrollTrigger: pin must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.pin)}, ignoring`);
      }
      (i = this.markerHandle) == null || i.update(this.startY, this.endY), this.update(!0), (r = (n = this.vars).onRefresh) == null || r.call(n, this);
    }
  }
  computeProgress(e) {
    return Math.max(0, Math.min((e - this.startY) / (this.endY - this.startY), 1));
  }
  update(e = !1) {
    var a, u, c, h, d, f, g, y, _, k, S, P, Q;
    if (this.killed) return;
    const i = U(this.scroller, "y"), n = this.computeProgress(i), r = i >= this.startY && i <= this.endY, s = i >= this.lastScroll, o = this.wasInside;
    this.pinHandle && this.pinHandle.setPhase(i < this.startY ? "before" : i > this.endY ? "after" : "during"), r && !o ? s ? ((u = (a = this.vars).onEnter) == null || u.call(a, this), this.scrubController || (c = this.vars.animation) == null || c.play()) : (d = (h = this.vars).onEnterBack) == null || d.call(h, this) : !r && o && (s ? (g = (f = this.vars).onLeave) == null || g.call(f, this) : (_ = (y = this.vars).onLeaveBack) == null || _.call(y, this)), this.wasInside = r, this.lastScroll = i, e ? (k = this.scrubController) == null || k.snapTo(n) : (S = this.scrubController) == null || S.update(n), (r || r !== o) && ((Q = (P = this.vars).onUpdate) == null || Q.call(P, this));
  }
  progress() {
    return this.computeProgress(U(this.scroller, "y"));
  }
  isActive() {
    return this.wasInside;
  }
  kill() {
    var i, n, r;
    if (this.killed) return;
    this.killed = !0, Ye(this.scroller, this.boundOnScroll), Oe(this.boundOnResize), (i = this.pinHandle) == null || i.revert(), (n = this.scrubController) == null || n.kill(), (r = this.markerHandle) == null || r.remove();
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
function Ue(t, e) {
  return e || (typeof t == "string" || t instanceof Element ? t : H(t)[0]);
}
function mt(t, e, i) {
  if (!e) return;
  const n = Ue(t, e.trigger);
  X.create({ ...e, trigger: n, animation: i });
}
function Z(t, e, i, n) {
  const { stagger: r, scrollTrigger: s, ...o } = e;
  if (r === void 0) {
    const h = new x(t, o, i, n);
    return M.add(h), mt(t, s, h), h;
  }
  const a = H(t), u = o.delay ?? 0, c = new F();
  return a.forEach((h, d) => {
    const f = u + _t(d, a.length, r);
    c.add(new x(h, { ...o, delay: f }, i, n), 0);
  }), M.add(c), mt(t, s, c), c;
}
function qe(t, e) {
  return Z(t, e, "to");
}
function Ve(t, e) {
  return Z(t, e, "from");
}
function We(t, e, i) {
  return Z(t, i, "fromTo", e);
}
function Be(t, e) {
  const i = new x(t, { ...e, duration: 0 });
  return M.add(i), i;
}
function Ke(t) {
  const { scrollTrigger: e, ...i } = t ?? {}, n = new F(i);
  return M.add(n), e && (e.trigger ? X.create({ ...e, trigger: e.trigger, animation: n }) : console.warn("[six] timeline({ scrollTrigger }) requires an explicit trigger - a Timeline has no target to default to")), n;
}
function je(t) {
  kt(t);
}
const Ze = {
  to: qe,
  from: Ve,
  fromTo: We,
  set: Be,
  timeline: Ke,
  config: je,
  context: Tt
};
export {
  X as ScrollTrigger,
  Je as VERSION,
  Ze as six
};
