var Be = Object.defineProperty;
var De = (e, i, t) => i in e ? Be(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var c = (e, i, t) => De(e, typeof i != "symbol" ? i + "" : i, t);
const $e = "0.0.33";
function xe(e, i, t) {
  return i < 0 ? 1 / 0 : e * (i + 1) + t * i;
}
function Vt(e, i, t, s, n) {
  if (i <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (t === 0)
    return { iteration: 0, time: e < 0 ? 0 : e > i ? i : e, reversed: !1 };
  const r = i + s, o = xe(i, t, s);
  let l = e;
  l < 0 ? l = 0 : t >= 0 && l > o && (l = o);
  let a = Math.floor(l / r), h = l - a * r;
  s === 0 && a > 0 && h === 0 && (a -= 1, h = i), t >= 0 && a > t && (a = t, h = l - a * r), h > i && (h = i);
  const d = n && a % 2 === 1;
  return d && (h = i - h), { iteration: a, time: h, reversed: d };
}
let ct = null;
function qt() {
  return ct;
}
class ve {
  constructor(i) {
    c(this, "captured", /* @__PURE__ */ new Set());
    c(this, "dead", !1);
    i && this.run(i);
  }
  run(i) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const t = ct;
    ct = this;
    try {
      return i(this);
    } finally {
      ct = t;
    }
  }
  add(i) {
    this.dead || this.captured.add(i);
  }
  /**
   * Wraps `fn` so that whenever the RETURNED function is eventually called - from an event
   * listener, a timeout, a promise, anything outside this context's own synchronous `run()` call
   * - anything Killable it creates still gets captured into this context, exactly as if it had
   * run synchronously inside `run()`. Needed because auto-capture only works while this context is
   * the active scope, which by definition isn't true anymore once the callback that created it has
   * already returned - e.g. a click handler registered inside a `six.breakpoint()`/`six.context()`
   * callback runs later, on its own, with no context active unless it's wrapped like this first.
   */
  scope(i) {
    return (...t) => this.run(() => i(...t));
  }
  _capture(i) {
    this.add(i);
  }
  revert() {
    this.captured.forEach((i) => i.kill()), this.captured.clear();
  }
  kill() {
    this.dead || (this.dead = !0, this.revert());
  }
  get isDead() {
    return this.dead;
  }
}
function Fe(e) {
  return new ve(e);
}
let Ne = 0;
class Ce {
  constructor(i = {}) {
    c(this, "id", ++Ne);
    c(this, "parent", null);
    /** Kept after removal from `parent` (the "detached parent") so time queries made after removal still resolve. */
    c(this, "_dp", null);
    c(this, "_next", null);
    c(this, "_prev", null);
    c(this, "_start", 0);
    c(this, "_dur", 0);
    c(this, "_tDur", 0);
    c(this, "_time", 0);
    c(this, "_tTime", 0);
    /** Functional speed - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
    c(this, "_ts", 1);
    /** Recorded/user speed - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
    c(this, "_rts", 1);
    c(this, "_delay");
    c(this, "_repeat");
    c(this, "_repeatDelay");
    c(this, "_boomerang");
    c(this, "_initted", !1);
    c(this, "_dirty", !0);
    c(this, "_hasStarted", !1);
    /** Raw (pre-clamp) totalTime from the previous render() call - see the zero-duration handling in render(). */
    c(this, "_rawPrev", -1);
    c(this, "listeners", {});
    var t;
    (t = qt()) == null || t._capture(this), this._delay = Math.max(0, i.delay ?? 0), this._repeat = i.repeat ?? 0, this._repeatDelay = Math.max(0, i.repeatDelay ?? 0), this._boomerang = i.boomerang ?? !1, i.onStart && this.on("start", i.onStart), i.onUpdate && this.on("update", i.onUpdate), i.onComplete && this.on("complete", i.onComplete), i.onRepeat && this.on("repeat", i.onRepeat), i.onReverseComplete && this.on("reverseComplete", i.onReverseComplete), i.paused && (this._ts = 0);
  }
  // ---- rendering ----
  /**
   * Renders this animation at `totalTime` (on ITS OWN axis, delay included at the front).
   * `suppressEvents` skips start/update/repeat/complete callbacks (used by seek()). `force`
   * re-renders even if `totalTime` hasn't changed since the last render.
   */
  render(i, t = !1, s = !1) {
    const n = this._tTime, r = this.totalDuration();
    let o = i;
    o < 0 ? o = 0 : this._repeat >= 0 && o > r && (o = r);
    const l = !this._initted;
    l && (this._initted = !0, this._onInit());
    const a = Vt(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), h = l ? a : Vt(n - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), d = a.iteration !== h.iteration;
    this._tTime = o, this._time = a.time, this._renderIteration(a.time, a.reversed, a.iteration, t, s || d);
    const u = this._rawPrev;
    if (this._rawPrev = i, t) return;
    const f = r === 0, p = f ? i < 0 : o <= 0, g = f ? i >= 0 : this._repeat >= 0 && o >= r, b = f ? u < 0 : n <= 0, y = f ? u >= 0 : this._repeat >= 0 && n >= r, x = f ? i > u : o > n, m = f ? i < u : o < n;
    !this._hasStarted && !p && (this._hasStarted = !0, this.emit("start")), x && d && this.emit("repeat"), this.emit("update"), x && !y && g ? this.emit("complete") : m && !b && p && this.emit("reverseComplete");
  }
  /** Hook for subclasses that need to do one-time setup on first render (e.g. Tween building its PropertyTracks). */
  _onInit() {
  }
  // ---- duration ----
  duration(i) {
    return i === void 0 ? this._dur : (this._dur = Math.max(0, i), this.invalidate(), this._uncache(), this);
  }
  totalDuration(i) {
    if (i === void 0)
      return this._dirty && this._recomputeTotalDuration(), this._tDur;
    const t = this.totalDuration();
    return t > 0 && i > 0 && this.speed(this.speed() * (t / i)), this;
  }
  _recomputeTotalDuration() {
    this._tDur = this._delay + xe(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
  }
  _uncache() {
    var i;
    this._dirty = !0, (i = this.parent) == null || i._uncache();
  }
  // ---- repeat / boomerang / delay ----
  repeat(i) {
    return i === void 0 ? this._repeat : (this._repeat = i, this._uncache(), this);
  }
  repeatDelay(i) {
    return i === void 0 ? this._repeatDelay : (this._repeatDelay = Math.max(0, i), this._uncache(), this);
  }
  boomerang(i) {
    return i === void 0 ? this._boomerang : (this._boomerang = i, this);
  }
  delay(i) {
    return i === void 0 ? this._delay : (this._delay = Math.max(0, i), this._uncache(), this);
  }
  startTime(i) {
    var t;
    return i === void 0 ? this._start : (this._start = i, (t = this.parent) == null || t._uncache(), this);
  }
  endTime() {
    return this._start + this.totalDuration() / Math.abs(this._rts || 1);
  }
  // ---- speed / direction ----
  speed(i) {
    var s, n;
    if (i === void 0) return this._rts;
    i === 0 && (i = this._rts < 0 ? -1e-8 : 1e-8);
    const t = this._ts === 0;
    return this._rts = i, this._ts = t ? 0 : i, (n = (s = this.parent) == null ? void 0 : s._childResumed) == null || n.call(s, this), this;
  }
  reversed(i) {
    return i === void 0 ? this._rts < 0 : (this.speed(i ? -Math.abs(this._rts) : Math.abs(this._rts)), this);
  }
  // ---- paused / play state ----
  paused(i) {
    var s, n;
    if (i === void 0) return this._ts === 0;
    const t = i === !1 && this._ts === 0;
    return this._ts = i ? 0 : this._rts, t && ((n = (s = this.parent) == null ? void 0 : s._childResumed) == null || n.call(s, this)), this;
  }
  play() {
    return this.reversed(!1), this.paused(!1), this;
  }
  pause() {
    return this.paused(!0), this;
  }
  resume() {
    return this.paused(!1), this;
  }
  reverse() {
    return this.reversed(!0), this.paused(!1), this;
  }
  restart(i = !1) {
    return this._hasStarted = !1, this.totalTime(i ? 0 : this._delay, !0), this.play();
  }
  // ---- time / totalTime / progress ----
  totalTime(i, t = !1) {
    return i === void 0 ? this._tTime : (this.render(i, t, !1), this);
  }
  time(i, t = !1) {
    if (i === void 0) return this._time;
    const s = this._tTime - this._delay - this._time;
    return this.totalTime(this._delay + s + Math.max(0, Math.min(i, this._dur)), t);
  }
  progress(i) {
    return i === void 0 ? this._dur ? this._time / this._dur : 1 : this.time(i * this._dur);
  }
  totalProgress(i) {
    const t = this.totalDuration();
    return i === void 0 ? t ? this._tTime / t : 1 : this.totalTime(i * t);
  }
  seek(i, t = !0) {
    return this.totalTime(i, t), this;
  }
  // ---- lifecycle ----
  invalidate() {
    return this._initted = !1, this;
  }
  kill() {
    return this.parent && (this._dp = this.parent, this.parent._removeChild(this), this.parent = null), this;
  }
  isActive() {
    const i = this.totalDuration();
    return !this.paused() && !!this.parent && this._tTime > 0 && (i === 1 / 0 || this._tTime < i);
  }
  // ---- events ----
  on(i, t) {
    var s;
    return ((s = this.listeners)[i] ?? (s[i] = /* @__PURE__ */ new Set())).add(t), this;
  }
  off(i, t) {
    var s;
    return (s = this.listeners[i]) == null || s.delete(t), this;
  }
  emit(i) {
    var t;
    (t = this.listeners[i]) == null || t.forEach((s) => s());
  }
}
let _t = { duration: 0.8, ease: "none" };
function qe(e) {
  _t = { ..._t, ...e };
}
function Ye() {
  return _t;
}
function et(e) {
  if (e < 1 / 2.75) return 7.5625 * e * e;
  if (e < 2 / 2.75) {
    const n = e - 0.5454545454545454;
    return 7.5625 * n * n + 0.75;
  }
  if (e < 2.5 / 2.75) {
    const n = e - 0.8181818181818182;
    return 7.5625 * n * n + 0.9375;
  }
  const s = e - 2.625 / 2.75;
  return 7.5625 * s * s + 0.984375;
}
const V = 1.70158, it = V * 1.525, Gt = 2 * Math.PI / 3, Ut = 2 * Math.PI / 4.5, dt = {
  none: (e) => e,
  linear: (e) => e,
  quadIn: (e) => e * e,
  quadOut: (e) => 1 - (1 - e) * (1 - e),
  quadInOut: (e) => e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2,
  cubicIn: (e) => e * e * e,
  cubicOut: (e) => 1 - Math.pow(1 - e, 3),
  cubicInOut: (e) => e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2,
  quartIn: (e) => e ** 4,
  quartOut: (e) => 1 - (1 - e) ** 4,
  quartInOut: (e) => e < 0.5 ? 8 * e ** 4 : 1 - (-2 * e + 2) ** 4 / 2,
  quintIn: (e) => e ** 5,
  quintOut: (e) => 1 - (1 - e) ** 5,
  quintInOut: (e) => e < 0.5 ? 16 * e ** 5 : 1 - (-2 * e + 2) ** 5 / 2,
  sineIn: (e) => 1 - Math.cos(e * Math.PI / 2),
  sineOut: (e) => Math.sin(e * Math.PI / 2),
  sineInOut: (e) => -(Math.cos(Math.PI * e) - 1) / 2,
  expoIn: (e) => e === 0 ? 0 : Math.pow(2, 10 * (e - 1)),
  expoOut: (e) => e === 1 ? 1 : 1 - Math.pow(2, -10 * e),
  expoInOut: (e) => e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2,
  circIn: (e) => 1 - Math.sqrt(1 - e * e),
  circOut: (e) => Math.sqrt(1 - (e - 1) * (e - 1)),
  circInOut: (e) => e < 0.5 ? (1 - Math.sqrt(1 - 4 * e * e)) / 2 : (Math.sqrt(1 - (-2 * e + 2) ** 2) + 1) / 2,
  backIn: (e) => (V + 1) * e * e * e - V * e * e,
  backOut: (e) => {
    const i = e - 1;
    return 1 + (V + 1) * i * i * i + V * i * i;
  },
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((it + 1) * t - it) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((it + 1) * i + it) + 2) / 2;
  },
  bounceIn: (e) => 1 - et(1 - e),
  bounceOut: et,
  bounceInOut: (e) => e < 0.5 ? (1 - et(1 - 2 * e)) / 2 : (1 + et(2 * e - 1)) / 2,
  elasticIn: (e) => e === 0 || e === 1 ? e : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * Gt),
  elasticOut: (e) => e === 0 || e === 1 ? e : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * Gt) + 1,
  elasticInOut: (e) => e === 0 || e === 1 ? e : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * Ut)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * Ut) / 2 + 1,
  // six-js signature eases - not part of any other library's naming.
  // Zero velocity AND zero acceleration at both ends (quintic smootherstep) - reads as
  // noticeably silkier than sineInOut, with no lingering "coast" at the edges.
  smooth: (e) => e * e * e * (e * (e * 6 - 15) + 10),
  // Crisp damped-spring settle (~1.75 oscillations) - overshoots and undershoots 1 before
  // settling, but via a continuous decaying cosine rather than elastic's segmented formula.
  spring: (e) => 1 - Math.cos(e * 3.5 * Math.PI) * Math.pow(2, -6 * e),
  // Looser, slower-decaying wobble (~1.25 oscillations) than `spring` - a softer, jelly-like settle.
  jelly: (e) => 1 - Math.cos(e * 2.5 * Math.PI) * Math.pow(2, -5 * e)
};
function We(e) {
  return typeof e == "function" ? e : e && dt[e] ? dt[e] : dt.quadOut;
}
const Xe = /^#([0-9a-f]{3,8})$/i, He = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, Ve = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, Ge = {
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
function Ue(e) {
  return Ge[e.toLowerCase()] ?? null;
}
function z(e, i, t) {
  const s = t === 1 ? e[i] + e[i] : e.slice(i, i + 2);
  return parseInt(s, 16);
}
function ft(e) {
  const i = e.trim(), t = i.match(Xe);
  if (t) {
    const n = t[1];
    if (n.length === 3 || n.length === 4) {
      const r = n.length === 4 ? z(n, 3, 1) / 255 : 1;
      return { r: z(n, 0, 1), g: z(n, 1, 1), b: z(n, 2, 1), a: r };
    }
    if (n.length === 6 || n.length === 8) {
      const r = n.length === 8 ? z(n, 6, 2) / 255 : 1;
      return { r: z(n, 0, 2), g: z(n, 2, 2), b: z(n, 4, 2), a: r };
    }
  }
  const s = i.match(He) ?? i.match(Ve);
  if (s) {
    const [, n, r, o, l] = s;
    return {
      r: parseFloat(n),
      g: parseFloat(r),
      b: parseFloat(o),
      a: l === void 0 ? 1 : l.endsWith("%") ? parseFloat(l) / 100 : parseFloat(l)
    };
  }
  if (/^[a-z]+$/i.test(i)) {
    const n = Ue(i);
    if (n) return { r: n[0], g: n[1], b: n[2], a: i.toLowerCase() === "transparent" ? 0 : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function Se(e, i, t) {
  return {
    r: Math.round(e.r + (i.r - e.r) * t),
    g: Math.round(e.g + (i.g - e.g) * t),
    b: Math.round(e.b + (i.b - e.b) * t),
    a: Math.round((e.a + (i.a - e.a) * t) * 1e3) / 1e3
  };
}
function Ot(e) {
  return `rgba(${e.r}, ${e.g}, ${e.b}, ${e.a})`;
}
const Ke = {
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
}, Kt = /* @__PURE__ */ new WeakMap(), je = /^matrix\(([^)]+)\)$/, Qe = /^matrix3d\(([^)]+)\)$/, jt = 180 / Math.PI;
function Ze(e) {
  if (!e || e === "none") return {};
  const i = e.match(je);
  if (i) {
    const [s, n, r, o, l, a] = i[1].split(",").map(Number), h = Math.sqrt(s * s + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, s) * jt, f = (Math.atan2(r, o) * jt + u) * -1;
    return { x: l, y: a, rotation: u, scaleX: h, scaleY: d, skewX: ti(f) };
  }
  const t = e.match(Qe);
  if (t) {
    const s = t[1].split(",").map(Number);
    return { x: s[12], y: s[13], z: s[14] };
  }
  return {};
}
function Je(e) {
  return typeof getComputedStyle > "u" ? {} : Ze(getComputedStyle(e).transform);
}
function ti(e) {
  let i = e % 360;
  return i > 180 && (i -= 360), i < -180 && (i += 360), i;
}
function pt(e) {
  let i = Kt.get(e);
  return i || (i = { ...Ke, ...Je(e) }, Kt.set(e, i)), i;
}
function E(e) {
  return Math.round(e * 1e4) / 1e4;
}
function ei(e, i) {
  const t = [];
  return (e.xPercent || e.yPercent) && t.push(`translate(${E(e.xPercent)}%, ${E(e.yPercent)}%)`), (e.x || e.y || e.z) && t.push(
    i || e.z ? `translate3d(${E(e.x)}px, ${E(e.y)}px, ${E(e.z)}px)` : `translate(${E(e.x)}px, ${E(e.y)}px)`
  ), e.rotation && t.push(`rotate(${E(e.rotation)}deg)`), e.rotationX && t.push(`rotateX(${E(e.rotationX)}deg)`), e.rotationY && t.push(`rotateY(${E(e.rotationY)}deg)`), e.skewX && t.push(`skewX(${E(e.skewX)}deg)`), e.skewY && t.push(`skewY(${E(e.skewY)}deg)`), (e.scaleX !== 1 || e.scaleY !== 1) && t.push(`scale(${E(e.scaleX)}, ${E(e.scaleY)})`), t.length ? t.join(" ") : "none";
}
function ii(e, i, t) {
  e.style.transform = ei(i, t);
}
const si = {
  x: "x",
  y: "y",
  z: "z",
  rotate: "rotation",
  rotateX: "rotationX",
  rotateY: "rotationY",
  scaleX: "scaleX",
  scaleY: "scaleY",
  skewX: "skewX",
  skewY: "skewY"
}, Qt = { x: "xPercent", y: "yPercent" };
function ni(e) {
  return typeof e == "string" && /%\s*$/.test(e.trim());
}
function ri(e, i) {
  return ni(i) && e in Qt ? Qt[e] : si[e];
}
const oi = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), ai = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), li = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), hi = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), ci = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
function Y(e) {
  if (typeof e == "number") return !0;
  if (typeof e != "string") return !1;
  const i = e.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(i) || /^[+-]=/.test(i);
}
function U(e, i = "") {
  if (typeof e == "number") return { value: e, unit: i };
  const t = String(e).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  return t ? { value: parseFloat(t[1]), unit: t[2] || i } : { value: 0, unit: i };
}
function gt(e, i) {
  var s;
  const t = (s = e.style) == null ? void 0 : s[i];
  return t || (typeof getComputedStyle > "u" ? "" : getComputedStyle(e)[i] || "");
}
function di(e) {
  const i = oi.has(e) ? "deg" : ai.has(e) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: e,
    defaultUnit: i,
    get(t) {
      return { value: pt(t)[e], unit: i };
    },
    set(t, s) {
      pt(t)[e] = s.value;
    }
  };
}
function ui(e) {
  return {
    kind: "color",
    get(i) {
      return ft(gt(i, e) || "rgba(0,0,0,0)");
    },
    set(i, t) {
      i.style[e] = Ot(t);
    }
  };
}
function fi(e) {
  return {
    kind: "complex",
    get(i) {
      return gt(i, e);
    },
    set(i, t) {
      i.style[e] = t;
    }
  };
}
function pi(e, i) {
  const t = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(e).trim() : "";
  return Y(i) || Y(t) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return U(getComputedStyle(s).getPropertyValue(e).trim());
    },
    set(s, n) {
      s.style.setProperty(e, `${n.value}${n.unit}`);
    }
  } : {
    kind: "discrete",
    get(s) {
      return getComputedStyle(s).getPropertyValue(e).trim();
    },
    set(s, n) {
      s.style.setProperty(e, n);
    }
  };
}
function gi(e, i) {
  const t = ci.has(e) ? "" : "px";
  return Y(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: t,
    get(s) {
      const n = gt(s, e);
      return Y(n) ? U(n, t) : { value: 0, unit: t };
    },
    set(s, n) {
      s.style[e] = t === "" ? `${n.value}` : `${n.value}${n.unit}`;
    }
  } : {
    kind: "discrete",
    get(s) {
      return gt(s, e);
    },
    set(s, n) {
      s.style[e] = n;
    }
  };
}
function mi(e, i) {
  return Y(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return U(s.getAttribute(e) ?? "0");
    },
    set(s, n) {
      s.setAttribute(e, String(n.value));
    }
  } : {
    kind: "discrete",
    get(s) {
      return s.getAttribute(e) ?? "";
    },
    set(s, n) {
      s.setAttribute(e, n);
    }
  };
}
function Zt(e, i) {
  return Y(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(t) {
      return { value: Number(t[e]) || 0, unit: "" };
    },
    set(t, s) {
      t[e] = s.value;
    }
  } : {
    kind: "discrete",
    get(t) {
      return String(t[e] ?? "");
    },
    set(t, s) {
      t[e] = s;
    }
  };
}
function bi(e, i, t) {
  const s = ri(i, t);
  if (s) return di(s);
  if (li.has(i)) return ui(i);
  if (hi.has(i)) return fi(i);
  if (i.startsWith("--")) return pi(i, t);
  const n = e.style;
  return n && i in n ? gi(i, t) : i in e && typeof e[i] == "number" ? Zt(i, t ?? e[i]) : typeof e.setAttribute == "function" ? mi(i, t) : Zt(i, t);
}
const yi = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function xi(e) {
  if (e[0] === "#" || /^(rgba?|hsla?)\(/i.test(e))
    return { type: "color", value: ft(e) };
  const i = e.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(i[1]), unit: i[2] };
}
function mt(e) {
  const i = [], t = [];
  let s = 0;
  for (const n of e.matchAll(yi))
    t.push(e.slice(s, n.index)), i.push(xi(n[0])), s = n.index + n[0].length;
  return t.push(e.slice(s)), { literals: t, tokens: i };
}
function vi(e, i) {
  const t = mt(e).tokens, s = mt(i).tokens;
  return t.length === s.length && t.every((n, r) => n.type === s[r].type);
}
function Ci(e, i, t) {
  if (!e || e.type !== i.type) {
    const o = t >= 1 ? i : e ?? i;
    return o.type === "color" ? Ot(o.value) : `${o.value}${o.unit}`;
  }
  if (i.type === "color")
    return Ot(Se(e.value, i.value, t));
  const s = e.value, n = s + (i.value - s) * t, r = i.unit || e.unit;
  return `${Math.round(n * 1e4) / 1e4}${r}`;
}
function Si(e, i, t) {
  const s = mt(e), n = mt(i);
  let r = "";
  for (let o = 0; o < n.literals.length; o++)
    r += n.literals[o], o < n.tokens.length && (r += Ci(s.tokens[o], n.tokens[o], t));
  return r;
}
const ki = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function wi(e) {
  return ki.test(e);
}
function Jt(e, i, t, s) {
  if (!s || s === "px" || s === "deg" || s === "rad" || s === "turn") return t;
  if (s === "rem") {
    const n = typeof document < "u" && parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return t * n;
  }
  if (s === "em") {
    const n = typeof getComputedStyle < "u" && parseFloat(getComputedStyle(e).fontSize) || 16;
    return t * n;
  }
  if (s === "vh") return typeof window < "u" ? t / 100 * window.innerHeight : t;
  if (s === "vw") return typeof window < "u" ? t / 100 * window.innerWidth : t;
  if (s === "%") {
    const n = e.parentElement;
    if (!n) return t;
    const r = wi(i) ? n.clientWidth : n.clientHeight;
    return t / 100 * r;
  }
  return t;
}
const te = /* @__PURE__ */ new Set([
  "duration",
  "ease",
  "delay",
  "repeat",
  "repeatDelay",
  "boomerang",
  "paused",
  "overwrite",
  "onStart",
  "onUpdate",
  "onComplete",
  "onRepeat",
  "onReverseComplete"
]), Pt = /^([+\-*/])=(-?[\d.]+)$/;
function ee(e, i) {
  const t = i.match(Pt);
  if (!t) return null;
  const s = parseFloat(t[2]);
  switch (t[1]) {
    case "+":
      return e + s;
    case "-":
      return e - s;
    case "*":
      return e * s;
    case "/":
      return e / s;
    default:
      return e;
  }
}
function Ei(e, i) {
  const t = /* @__PURE__ */ new Set();
  for (const s in e) te.has(s) || t.add(s);
  if (i)
    for (const s in i) te.has(s) || t.add(s);
  return [...t];
}
function Ai(e, i, t, s, n) {
  const r = t.get(e);
  let o, l;
  if (s === void 0)
    o = r.value, l = r.unit || t.defaultUnit;
  else if (typeof s == "string" && Pt.test(s))
    o = ee(r.value, s), l = r.unit || t.defaultUnit;
  else {
    const d = U(s, t.defaultUnit);
    o = d.value, l = d.unit;
  }
  let a, h;
  if (n === void 0)
    a = r.value, h = r.unit || t.defaultUnit;
  else if (typeof n == "string" && Pt.test(n))
    a = ee(o, n), h = l;
  else {
    const d = U(n, t.defaultUnit);
    a = d.value, h = d.unit;
  }
  return !t.isTransform && h !== l && (o = Jt(e, i, o, l), a = Jt(e, i, a, h), l = "px", h = "px"), { kind: "numeric", target: e, prop: i, isTransform: t.isTransform, handler: t, start: o, change: a - o, unit: h };
}
function Ti(e, i, t, s, n) {
  const r = s !== void 0 ? ft(String(s)) : t.get(e), o = n !== void 0 ? ft(String(n)) : t.get(e);
  return { kind: "color", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function Mi(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return vi(r, o) ? { kind: "complex", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o } : { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function Ii(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function _i(e, i, t, s, n) {
  return t.kind === "numeric" ? Ai(e, i, t, s, n) : t.kind === "color" ? Ti(e, i, t, s, n) : t.kind === "complex" ? Mi(e, i, t, s, n) : Ii(e, i, t, s, n);
}
const Oi = { scale: ["scaleX", "scaleY"] };
function Pi(e, i, t, s) {
  const n = Ei(i, s), r = [];
  for (const o of e)
    for (const l of n) {
      let a, h;
      t === "to" ? h = i[l] : t === "from" ? a = i[l] : (h = l in i ? i[l] : void 0, a = s && l in s ? s[l] : void 0);
      for (const d of Oi[l] ?? [l]) {
        const u = bi(o, d, h ?? a);
        r.push(_i(o, d, u, a, h));
      }
    }
  return r;
}
function Ri(e) {
  return Math.round(e * 1e4) / 1e4;
}
function zi(e, i) {
  switch (e.kind) {
    case "numeric": {
      const t = Ri(e.start + e.change * i);
      e.isTransform ? pt(e.target)[e.handler.transformKey] = t : e.handler.set(e.target, { value: t, unit: e.unit });
      return;
    }
    case "color":
      e.handler.set(e.target, Se(e.start, e.end, i));
      return;
    case "complex":
      e.handler.set(e.target, Si(e.start, e.end, i));
      return;
    case "discrete":
      e.handler.set(e.target, i >= 1 ? e.end : e.start);
      return;
  }
}
function Li(e, i, t) {
  const s = t(i);
  let n = e.last();
  for (; n && t(n) > s; )
    n = n._prev;
  n ? (i._prev = n, i._next = n._next, n._next ? n._next._prev = i : e.setLast(i), n._next = i) : (i._prev = null, i._next = e.first(), i._next ? i._next._prev = i : e.setLast(i), e.setFirst(i));
}
function Bi(e, i) {
  i._prev ? i._prev._next = i._next : e.first() === i && e.setFirst(i._next), i._next ? i._next._prev = i._prev : e.last() === i && e.setLast(i._prev), i._next = null, i._prev = null;
}
function* st(e) {
  let i = e.first();
  for (; i; ) {
    const t = i._next;
    yield i, i = t;
  }
}
function nt(e, i) {
  if (!e || i === void 0) return 0;
  const t = parseFloat(i);
  return e === "-" ? -t : t;
}
const Di = /^<(?:([+-])=([\d.]+))?$/, $i = /^>(?:([+-])=([\d.]+))?$/, Fi = /^([+-])=([\d.]+)$/, Ni = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function qi(e, i) {
  if (e === void 0) return i.end;
  if (typeof e == "number") return Math.max(0, e);
  const t = e.trim();
  let s = t.match(Di);
  if (s) return Math.max(0, i.prevStart + nt(s[1], s[2]));
  if (s = t.match($i), s) return Math.max(0, i.prevEnd + nt(s[1], s[2]));
  if (s = t.match(Fi), s) return Math.max(0, i.end + nt(s[1], s[2]));
  if (s = t.match(Ni), s) {
    const [, n, r, o] = s, l = i.getLabel(n);
    return l === void 0 ? (console.warn(`[six] timeline: unknown label "${n}", appending at the current end`), i.end) : Math.max(0, l + nt(r, o));
  }
  return console.warn(`[six] timeline: invalid position "${e}", appending at the current end`), i.end;
}
function ke(e, i, t) {
  if (typeof t == "number") return e * t;
  const { each: s, from: n = "start" } = t;
  let r;
  return n === "start" ? r = e : n === "end" ? r = i - 1 - e : n === "center" ? r = Math.abs(e - (i - 1) / 2) : r = Math.abs(e - n), r * s;
}
function we(e, i) {
  const t = i.speed(), s = i.totalDuration();
  return (e - i.startTime()) * t + (t >= 0 ? 0 : s);
}
function Ee(e) {
  const i = e.parent;
  return i instanceof Z ? we(Ee(i), e) : e.totalTime();
}
class Z extends Ce {
  constructor(t = {}) {
    super(t);
    c(this, "_firstChild", null);
    c(this, "_lastChild", null);
    c(this, "_cursor", 0);
    c(this, "_lastAdded", null);
    c(this, "_lastRenderedLocal", 0);
    c(this, "_labels", /* @__PURE__ */ new Map());
    c(this, "_defaultPositionMode");
    c(this, "_unbounded");
    c(this, "_childDefaults");
    this._defaultPositionMode = t.defaultPosition ?? "sequence", this._unbounded = t.unbounded ?? !1, this._childDefaults = t.defaults ?? {}, this._unbounded && (this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1);
  }
  // ---- ListHandle<Animation> (backs the generic linked-list helpers) ----
  first() {
    return this._firstChild;
  }
  setFirst(t) {
    this._firstChild = t;
  }
  last() {
    return this._lastChild;
  }
  setLast(t) {
    this._lastChild = t;
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
      getLabel: (t) => this._labels.get(t)
    };
  }
  resolvePosition(t) {
    return qi(t, this.positionContext());
  }
  add(t, s) {
    var r;
    (r = t.parent) == null || r._removeChild(t);
    const n = this.resolvePosition(s);
    return t.parent = this, t.startTime(n), Li(this, t, (o) => o.startTime()), this._cursor = Math.max(this._cursor, n + t.totalDuration()), this._lastAdded = t, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, n), this._uncache(), this;
  }
  remove(t) {
    return t.parent === this && (Bi(this, t), t.parent = null, this._uncache()), this;
  }
  _removeChild(t) {
    this.remove(t);
  }
  /**
   * Re-anchors `child.startTime()` so that THIS timeline's current local time maps back to
   * exactly the totalTime the child was frozen at - see the long comment on
   * `AnimationParent._childResumed` for why this is needed at all.
   *
   * Skipped only if the timeline's playhead hasn't even reached the child's ORIGINALLY
   * scheduled start yet - that's a child still waiting its turn in a sequenced timeline (e.g.
   * paused immediately after `.add(child, 5)`, before the timeline has played anywhere near
   * position 5), which should keep waiting for that scheduled slot rather than being pulled
   * forward. Checking `child.totalTime() > 0` instead (whether it had "already progressed")
   * would get the single most common real-world case backwards: a `paused: true` tween
   * attached to the always-on root timeline (e.g. every OnScroll-driven animation, which
   * is created paused and `.play()`d later) has `_start` fixed at its creation moment and a
   * frozen totalTime of exactly 0 - by the time it's resumed, the root's playhead is already
   * long past that `_start`, so it unambiguously HAS "reached" it and must be repositioned to
   * begin now, even though it never progressed even slightly beforehand.
   */
  _childResumed(t) {
    const s = Ee(this);
    if (s < t.startTime()) return;
    const n = t.totalTime(), r = t.speed(), o = t.totalDuration(), l = r >= 0 ? 0 : o;
    t.startTime(s - (n - l) / r);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const t of st(this))
      t.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...st(this)];
  }
  // ---- labels ----
  addLabel(t, s) {
    return this._labels.set(t, this.resolvePosition(s)), this;
  }
  getLabelTime(t) {
    return this._labels.get(t);
  }
  // ---- tween sugar ----
  addTweens(t, s, n, r, o) {
    const { stagger: l, ...a } = s, h = { ...this._childDefaults, ...a };
    if (l === void 0)
      return this.add(new N(t, h, n, r), o), this;
    const d = J(t), u = this.resolvePosition(o), f = h.delay ?? 0;
    return d.forEach((p, g) => {
      const b = ke(g, d.length, l);
      this.add(new N(p, { ...h, delay: f + b }, n, r), u);
    }), this;
  }
  to(t, s, n) {
    return this.addTweens(t, s, "to", void 0, n);
  }
  from(t, s, n) {
    return this.addTweens(t, s, "from", void 0, n);
  }
  fromTo(t, s, n, r) {
    return this.addTweens(t, n, "fromTo", s, r);
  }
  set(t, s, n) {
    return this.addTweens(t, { ...s, duration: 0 }, "to", void 0, n);
  }
  call(t, s) {
    return this.add(new N(null, { duration: 0, onStart: t }), s), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let t = 0;
    for (const s of st(this)) {
      const n = s.endTime();
      n > t && (t = n);
    }
    this._dur = t, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(t, s, n, r, o) {
    const l = Math.min(this._lastRenderedLocal, t), a = Math.max(this._lastRenderedLocal, t);
    this._lastRenderedLocal = t;
    for (const h of st(this)) {
      if (h.paused()) continue;
      const d = h.startTime();
      h.endTime() < l || d > a || h.totalDuration() === 0 && d <= l || h.render(we(t, h), r, o);
    }
  }
}
function Yi(e) {
  return !Array.isArray(e);
}
function Wi(e, i, t) {
  const s = e.filter((o) => o.duration === void 0).length, n = e.reduce((o, l) => o + (l.duration ?? 0), 0), r = i !== void 0 ? s > 0 ? Math.max(0, i - n) / s : 0 : t;
  return e.map((o) => {
    const { duration: l, ease: a, ...h } = o;
    return { duration: l ?? r, ease: a, props: h };
  });
}
function Xi(e, i, t) {
  const s = Object.entries(e).map(([r, o]) => {
    const l = r.trim().match(/^(-?[\d.]+)%$/);
    return l ? { pos: parseFloat(l[1]) / 100, props: o } : (console.warn(`[six] keyframes: invalid position "${r}", expected e.g. "50%"`), null);
  }).filter((r) => r !== null).sort((r, o) => r.pos - o.pos), n = [];
  for (let r = 0; r < s.length; r++) {
    const o = r === 0 ? 0 : s[r - 1].pos, { ease: l, ...a } = s[r].props;
    n.push({ duration: Math.max(0, (s[r].pos - o) * i), ease: l ?? t, props: a });
  }
  return n;
}
function Hi(e, i) {
  const t = i.keyframes, s = Yi(t) ? Xi(t, i.duration ?? 0.5, i.ease) : Wi(t, i.duration, i.duration ?? 0.5), n = new Z(), r = {};
  for (const o of s) {
    const l = {};
    for (const a in o.props)
      a in r && (l[a] = r[a]);
    n.fromTo(e, l, { ...o.props, duration: o.duration, ease: o.ease ?? i.ease }), Object.assign(r, o.props);
  }
  return n;
}
const ie = /* @__PURE__ */ new WeakMap();
function Vi(e) {
  let i = ie.get(e);
  return i || (i = /* @__PURE__ */ new Map(), ie.set(e, i)), i;
}
function Gi(e, i, t) {
  const s = /* @__PURE__ */ new Set();
  for (const n of t) {
    const r = Vi(n.target), o = r.get(n.prop);
    i && o && o !== e && (i === !0 ? s.add(o) : o._dropTrack(n.target, n.prop)), r.set(n.prop, e);
  }
  for (const n of s) n.kill();
}
function J(e, i) {
  if (e == null) return [];
  if (typeof e == "string") {
    const t = Array.from((i ?? document).querySelectorAll(e));
    return t.length === 0 && console.warn(`[six] no elements matched selector "${e}"`), t;
  }
  return e instanceof Element ? [e] : Array.from(e).filter((t) => t instanceof Element);
}
class N extends Ce {
  constructor(t, s, n = "to", r) {
    super(s);
    c(this, "targets");
    c(this, "mode");
    c(this, "rawVars");
    c(this, "rawFromVars");
    c(this, "ease");
    c(this, "tracks", []);
    c(this, "keyframeTimeline", null);
    const o = Ye();
    this.targets = J(t), this.mode = n, this.rawVars = s, this.rawFromVars = r, this.ease = We(s.ease ?? o.ease), s.keyframes ? (this.keyframeTimeline = Hi(this.targets, s), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(s.duration ?? o.duration), this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = Pi(this.targets, this.rawVars, this.mode, this.rawFromVars), Gi(this, this.rawVars.overwrite, this.tracks));
  }
  _dropTrack(t, s) {
    this.tracks = this.tracks.filter((n) => n.target !== t || n.prop !== s), this.tracks.length === 0 && this.kill();
  }
  _renderIteration(t) {
    if (this.keyframeTimeline) {
      this.keyframeTimeline.render(t, !0, !0);
      return;
    }
    const s = this.duration(), n = s ? t / s : 1, r = this.ease(n), o = n > 0 && n < 1, l = /* @__PURE__ */ new Set();
    for (const a of this.tracks)
      zi(a, r), a.isTransform && l.add(a.target);
    for (const a of l)
      ii(a, pt(a), o);
  }
}
const rt = () => typeof performance < "u" ? performance.now() : Date.now();
class Ui {
  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(i = {}) {
    c(this, "listeners", []);
    c(this, "i", 0);
    // live cursor into `listeners` during dispatch, adjusted by remove()
    c(this, "frame", 0);
    c(this, "timeMs", 0);
    c(this, "deltaMs", 0);
    c(this, "startTime", rt());
    c(this, "lastUpdate", this.startTime);
    c(this, "lagThreshold", 500);
    c(this, "adjustedLag", 33);
    c(this, "gap", 1e3 / 240);
    c(this, "nextTime", this.gap);
    c(this, "rafId", null);
    c(this, "manual");
    c(this, "loop", () => {
      this.manual || (this.advance(rt() - this.lastUpdate), this.rafId !== null && (this.rafId = this.request(this.loop)));
    });
    this.manual = !!i.manual;
  }
  request(i) {
    return typeof requestAnimationFrame == "function" ? requestAnimationFrame(i) : setTimeout(i, 16);
  }
  cancel(i) {
    typeof cancelAnimationFrame == "function" ? cancelAnimationFrame(i) : clearTimeout(i);
  }
  advance(i) {
    (i > this.lagThreshold || i < 0) && (this.startTime += i - this.adjustedLag), this.lastUpdate += i;
    const t = this.lastUpdate - this.startTime, s = t - this.nextTime;
    s < 0 || (this.frame++, this.deltaMs = t - this.timeMs * 1e3, this.timeMs = t / 1e3, this.nextTime += s >= this.gap ? s + 4 : this.gap, this.dispatch());
  }
  dispatch() {
    const i = this.timeMs, t = this.deltaMs, s = this.frame;
    for (this.i = 0; this.i < this.listeners.length; this.i++)
      this.listeners[this.i](i, t, s);
  }
  add(i) {
    return this.listeners.includes(i) || (this.listeners.push(i), this.wake()), i;
  }
  remove(i) {
    const t = this.listeners.indexOf(i);
    t !== -1 && (this.listeners.splice(t, 1), t <= this.i && this.i--);
  }
  /** Restarts the internal clock (used on wake so a long sleep doesn't register as lag) and starts the rAF loop. */
  wake() {
    if (this.manual || this.rafId !== null) return;
    const i = rt();
    this.startTime = i - this.timeMs * 1e3, this.lastUpdate = i, this.rafId = this.request(this.loop);
  }
  sleep() {
    this.rafId !== null && (this.cancel(this.rafId), this.rafId = null);
  }
  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(i = 1e3 / 60) {
    this.frame++, this.deltaMs = i, this.timeMs += i / 1e3, this.lastUpdate = rt(), this.startTime = this.lastUpdate - this.timeMs * 1e3, this.nextTime = this.timeMs * 1e3 + this.gap, this.dispatch();
  }
  fps(i) {
    const t = Math.max(1, i);
    this.gap = 1e3 / t, this.nextTime = this.timeMs * 1e3 + this.gap;
  }
  lagSmoothing(i = 500, t = 33) {
    this.lagThreshold = i || 1 / 0, this.adjustedLag = Math.min(t, this.lagThreshold);
  }
  deltaRatio(i = 60) {
    return this.deltaMs / (1e3 / i);
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
const O = new Ui(), K = new Z({ unbounded: !0, defaultPosition: "now" });
O.add((e) => K.render(e));
class Ki extends ve {
  constructor() {
    super(...arguments);
    c(this, "matches", {});
  }
}
class ji {
  constructor() {
    c(this, "entries", []);
    c(this, "dead", !1);
    var i;
    (i = qt()) == null || i._capture(this);
  }
  /**
   * One query string: `callback` runs while it matches, and its BreakpointContext is reverted
   * the instant it stops - the common "do this above N px, undo it below" case.
   *
   * A named map of queries: the SAME `callback` re-runs whenever any of them toggle, as long as
   * AT LEAST ONE still matches (`ctx.matches` tells it which) - GSAP's "mutually exclusive
   * breakpoints in one if/else ladder" pattern. If ALL of them stop matching, the previous run is
   * torn down and `callback` is simply not invoked again (matches GSAP - there's no "else"
   * invocation to represent "nothing matches").
   *
   * Either way, a `callback` that returns a function has that treated as its own cleanup and
   * called automatically on the next revert - reuses the same mechanism a captured Tween/Timeline
   * uses (`ctx.add({ kill: cleanup })`) rather than inventing a second one.
   */
  add(i, t) {
    if (this.dead) throw new Error("[six] cannot add() to a killed breakpoint()");
    if (typeof window > "u" || typeof window.matchMedia != "function") return this;
    const s = typeof i == "string", n = s ? { matches: i } : i, r = new Ki(), o = {};
    let l = !1;
    const a = () => {
      let u = !1, f = !1;
      for (const p in n) {
        const g = window.matchMedia(n[p]).matches;
        g && (u = !0), o[p] !== g && (o[p] = g, f = !0);
      }
      f && (r.revert(), u && (r.matches = s ? {} : { ...o }, this._run(r, t)));
    }, h = () => {
      l || (l = !0, queueMicrotask(() => {
        l = !1, a();
      }));
    }, d = Object.keys(n).map((u) => window.matchMedia(n[u]));
    return d.forEach((u) => u.addEventListener("change", h)), this.entries.push({
      ctx: r,
      detach: () => d.forEach((u) => u.removeEventListener("change", h)),
      reset: () => {
        for (const u in o) delete o[u];
      }
    }), a(), this;
  }
  _run(i, t) {
    const s = i.run(() => t(i));
    typeof s == "function" && i.add({ kill: s });
  }
  /** Tears down whatever's currently active (kills captured animations, runs returned cleanups) but keeps listening - a later matching change runs everything again. */
  revert() {
    this.entries.forEach((i) => {
      i.ctx.revert(), i.reset();
    });
  }
  /** Permanent: reverts everything AND stops listening. A killed breakpoint() can't add() again. */
  kill() {
    this.dead || (this.dead = !0, this.entries.forEach((i) => {
      i.ctx.kill(), i.detach();
    }), this.entries.length = 0);
  }
}
function Qi(e, i) {
  const t = new ji();
  return e !== void 0 && i !== void 0 && t.add(e, i), t;
}
let Rt = 0;
function Ae() {
  Rt++;
}
const Zi = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function Ji(e, i) {
  if (e === window) return i === "y" ? window.scrollY : window.scrollX;
  const t = e;
  return i === "y" ? t.scrollTop : t.scrollLeft;
}
function Et(e, i = "y") {
  const t = Zi[i], s = t.get(e);
  if (s && s.gen === Rt) return s.value;
  const n = Ji(e, i);
  return t.set(e, { gen: Rt, value: n }), n;
}
function At(e, i = "y") {
  var s, n;
  if (e === window)
    return i === "y" ? ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight : ((n = window.visualViewport) == null ? void 0 : n.width) ?? window.innerWidth;
  const t = e;
  return i === "y" ? t.clientHeight : t.clientWidth;
}
const bt = /* @__PURE__ */ new Map(), zt = /* @__PURE__ */ new Map();
function ts(e, i) {
  let t = bt.get(e);
  if (!t) {
    t = /* @__PURE__ */ new Set(), bt.set(e, t);
    const s = () => {
      Ae(), t.forEach((n) => n());
    };
    zt.set(e, s), e.addEventListener("scroll", s, { passive: !0 });
  }
  t.add(i);
}
function es(e, i) {
  const t = bt.get(e);
  if (t && (t.delete(i), t.size === 0)) {
    const s = zt.get(e);
    s && e.removeEventListener("scroll", s), zt.delete(e), bt.delete(e);
  }
}
const Yt = /* @__PURE__ */ new Set();
let se = !1;
function ne() {
  Ae(), Yt.forEach((e) => e());
}
function is(e) {
  Yt.add(e), !se && typeof window < "u" && (se = !0, window.addEventListener("resize", ne), typeof document < "u" && document.readyState !== "complete" && window.addEventListener("load", ne, { once: !0 }));
}
function ss(e) {
  Yt.delete(e);
}
function ns(e) {
  const i = (t) => {
    e.totalProgress(t);
  };
  return { update: i, snapTo: i, kill() {
  } };
}
function rs(e, i) {
  const t = Math.max(0.05, i), s = dt.expoOut;
  let n = e.totalProgress(), r = n, o = t, l = !1;
  const a = (h, d) => {
    l = !0, !(o >= t) && (o = Math.min(t, o + d / 1e3), e.totalProgress(n + (r - n) * s(o / t)));
  };
  return O.add(a), {
    update(h) {
      if (!l) {
        n = h, r = h, o = t, e.totalProgress(h);
        return;
      }
      n = e.totalProgress(), r = h, o = 0;
    },
    snapTo(h) {
      n = h, r = h, o = t, e.totalProgress(h);
    },
    kill() {
      O.remove(a);
    }
  };
}
const Tt = /* @__PURE__ */ new WeakMap();
function os(e) {
  let i = Tt.get(e);
  if (!i) {
    const a = e.getBoundingClientRect(), h = getComputedStyle(e), d = document.createElement("div");
    d.style.position = "relative", d.style.width = `${a.width}px`, d.style.height = `${a.height}px`, e.parentNode.insertBefore(d, e), d.appendChild(e), i = {
      spacer: d,
      refCount: 0,
      rect: a,
      docTop: a.top + window.scrollY,
      distance: 0,
      originalStyles: {
        position: e.style.position,
        top: e.style.top,
        left: e.style.left,
        width: e.style.width,
        margin: h.margin,
        transform: e.style.transform
      }
    }, Tt.set(e, i);
  }
  i.refCount++;
  const t = i;
  let s = 0, n = null;
  const r = () => {
    e.style.position = t.originalStyles.position, e.style.top = t.originalStyles.top, e.style.left = t.originalStyles.left, e.style.width = t.originalStyles.width, e.style.margin = t.originalStyles.margin;
  }, o = () => {
    e.style.position = "fixed", e.style.top = `${s}px`, e.style.left = `${t.rect.left}px`, e.style.width = `${t.rect.width}px`, e.style.margin = "0";
  }, l = () => {
    e.style.position = "absolute", e.style.top = `${t.distance}px`, e.style.left = "0px", e.style.width = `${t.rect.width}px`, e.style.margin = "0";
  };
  return {
    get naturalDocTop() {
      return t.docTop;
    },
    setDistance(a) {
      t.distance = Math.max(0, a), t.spacer.style.height = `${t.rect.height + t.distance}px`, n = null;
    },
    setStickyTop(a) {
      s = a, n = null;
    },
    setPhase(a) {
      a !== n && (n = a, a === "before" ? r() : a === "during" ? o() : l());
    },
    revert() {
      var a;
      t.refCount--, !(t.refCount > 0) && (e.style.position = t.originalStyles.position, e.style.top = t.originalStyles.top, e.style.left = t.originalStyles.left, e.style.width = t.originalStyles.width, e.style.margin = t.originalStyles.margin, e.style.transform = t.originalStyles.transform, (a = t.spacer.parentNode) == null || a.insertBefore(e, t.spacer), t.spacer.remove(), Tt.delete(e));
    }
  };
}
const as = 24, re = 24, ls = 4;
function hs(e, i) {
  return `rgba(${e},${i})`;
}
const oe = "74,222,128", ae = "248,113,113";
function ot(e, i, t, s) {
  const n = document.createElement("div");
  n.style.cssText = `position:${s ? "fixed" : "absolute"};left:0;width:100%;border-top:1.4px solid ${hs(e, 0.8)};z-index:999999;pointer-events:none;mix-blend-mode:screen;`;
  const r = document.createElement("span");
  return r.textContent = i, r.style.cssText = `position:absolute;${t}:0;top:2px;background:rgb(${e});color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`, n.appendChild(r), { line: n, label: r };
}
function le(e, i) {
  const t = i > window.innerHeight - as;
  e.style.top = t ? "" : "2px", e.style.bottom = t ? "2px" : "";
}
function he(e, i, t, s) {
  i.style[t] = s ? `${e.offsetWidth + ls}px` : "0px";
}
function cs(e) {
  const i = e ? `${e} ` : "", t = ot(oe, `${i}start`, "left", !1), s = ot(ae, `${i}end`, "left", !1), n = ot(oe, `${i}start`, "right", !0), r = ot(ae, `${i}end`, "right", !0);
  return t.line.setAttribute("data-six-marker", `${e}-start`), s.line.setAttribute("data-six-marker", `${e}-end`), n.line.setAttribute("data-six-marker", `${e}-start-viewport`), r.line.setAttribute("data-six-marker", `${e}-end-viewport`), document.body.appendChild(t.line), document.body.appendChild(s.line), document.body.appendChild(n.line), document.body.appendChild(r.line), {
    update(o, l, a, h) {
      t.line.style.top = `${o}px`, s.line.style.top = `${l}px`, n.line.style.top = `${a}px`, r.line.style.top = `${h}px`, he(t.label, s.label, "left", Math.abs(l - o) < re), le(n.label, a), le(r.label, h), he(n.label, r.label, "right", Math.abs(h - a) < re);
    },
    remove() {
      t.line.remove(), s.line.remove(), n.line.remove(), r.line.remove();
    }
  };
}
const ce = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 }, ds = /^(.*?)([+-]=[\d.]+)$/;
function W(e) {
  const i = e.trim(), t = i.match(ds), s = t ? t[1] : i, n = t ? (t[2][0] === "-" ? -1 : 1) * parseFloat(t[2].slice(2)) : 0;
  if (s in ce) return { ratio: ce[s], offsetPx: n };
  if (s.endsWith("%")) return { ratio: parseFloat(s) / 100, offsetPx: n };
  const r = parseFloat(s);
  return { ratio: 0, offsetPx: (isNaN(r) ? 0 : r) + n };
}
function us(e, i, t, s) {
  const [n = "top", r = "top"] = e.trim().split(/\s+/), o = W(n), l = W(r), a = t + i.top + o.ratio * i.height + o.offsetPx, h = l.ratio * s + l.offsetPx;
  return a - h;
}
function fs(e, i) {
  const [, t = "top"] = e.trim().split(/\s+/), s = W(t);
  return s.ratio * i + s.offsetPx;
}
function ps(e, i, t) {
  const [s = "top"] = e.trim().split(/\s+/), n = W(s);
  return t + i.top + n.ratio * i.height + n.offsetPx;
}
function gs(e) {
  if (e === void 0) return window;
  if (typeof e == "string") {
    const i = document.querySelector(e);
    return i || (console.warn(`[six] OnScroll: scroller "${e}" not found, falling back to window`), window);
  }
  return e;
}
function de(e) {
  if (typeof e == "string") {
    const i = document.querySelector(e);
    if (!i) throw new Error(`[six] OnScroll: trigger "${e}" not found`);
    return i;
  }
  return e;
}
const H = [];
class vt {
  constructor(i) {
    c(this, "vars");
    c(this, "triggerEl");
    c(this, "scroller");
    c(this, "startY", 0);
    c(this, "endY", 0);
    c(this, "wasInside", !1);
    c(this, "lastScroll", 0);
    c(this, "killed", !1);
    c(this, "hasHeardSyncSource", !1);
    c(this, "syncSourceRect0", { top: 0, height: 0 });
    c(this, "syncSourceRect1", { top: 0, height: 0 });
    c(this, "stickyHandle", null);
    c(this, "syncController", null);
    c(this, "markerHandle", null);
    c(this, "boundOnScroll", () => this.update());
    c(this, "boundOnResize", () => this.refresh());
    // The sync source's own progress can still be catching up from a stale pre-restoration reading
    // (see the reload-race comment on createSmoothSync in sync.ts) when this child's own
    // construction-time refresh() ran, so its own first-ever observation of the sync source may
    // already be wrong. Treat the first "update" ever heard FROM the sync source as a recalculation
    // too (instant), not a live crossing - see the `instant` branch in update() below.
    c(this, "boundOnSyncSourceUpdate", () => {
      const i = !this.hasHeardSyncSource;
      this.hasHeardSyncSource = !0, this.update(i);
    });
    this.vars = i, this.triggerEl = de(i.trigger), this.scroller = gs(i.scroller), i.animation && (i.animation.pause(), i.sync && (this.syncController = typeof i.sync == "number" ? rs(i.animation, i.sync) : ns(i.animation))), i.debug && !i.syncTo && (this.markerHandle = cs(i.id ?? "")), H.push(this), this.refresh(), i.syncTo ? i.syncTo.on("update", this.boundOnSyncSourceUpdate) : ts(this.scroller, this.boundOnScroll), is(this.boundOnResize);
  }
  resolvedAxis() {
    return this.vars.axis ?? "y";
  }
  axisRect(i) {
    return this.resolvedAxis() === "x" ? { top: i.left, height: i.width } : { top: i.top, height: i.height };
  }
  measureSyncSourceEdges() {
    const i = this.vars.syncTo, t = i.totalTime(), s = i.totalDuration();
    i.seek(0), this.syncSourceRect0 = this.axisRect(this.triggerEl.getBoundingClientRect()), i.seek(s), this.syncSourceRect1 = this.axisRect(this.triggerEl.getBoundingClientRect()), i.seek(t);
  }
  resolveSyncSourcePosition(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n == "number") return n;
    const r = n.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (r && s !== void 0) {
      const b = parseFloat(r[2]) * (r[1] === "-" ? -1 : 1), y = Math.abs(this.syncSourceRect1.top - this.syncSourceRect0.top);
      return s + (y !== 0 ? b / y : 0);
    }
    const [o = "top", l = "top"] = n.trim().split(/\s+/), a = W(o), h = W(l), d = this.syncSourceRect0.top + a.ratio * this.syncSourceRect0.height + a.offsetPx, f = this.syncSourceRect1.top + a.ratio * this.syncSourceRect1.height + a.offsetPx - d, p = At(this.scroller, this.resolvedAxis()), g = h.ratio * p + h.offsetPx;
    return f !== 0 ? (g - d) / f : 0;
  }
  resolvePositionValue(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n == "number") return n;
    const r = n.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (r && s !== void 0) {
      const h = parseFloat(r[2]);
      return s + (r[1] === "-" ? -h : h);
    }
    const o = this.triggerEl.getBoundingClientRect(), l = Et(this.scroller, this.resolvedAxis()), a = At(this.scroller, this.resolvedAxis());
    return us(n, this.axisRect(o), l, a);
  }
  /** Viewport-relative pixel offset (from the top of the viewport) that a debug marker line for
   * this start/end value should sit at - always the "<viewportEdge>" component of a position
   * string. A plain number/function-returning-number, or a *whole-string* relative "+=N" (no
   * second token at all, e.g. `end: "+=500"`), carries no edge info, so it defaults to the top of
   * the viewport (ratio 0). A compound token like `"+=100 bottom"` still has a real viewport edge
   * ("bottom") as its second token, so it must NOT hit this early return - only a prefix check
   * (no `$` anchor) would wrongly swallow that second token too. */
  resolveMarkerViewportY(i, t) {
    let s = i ?? t;
    return typeof s == "function" && (s = s()), typeof s != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(s.trim()) ? 0 : fs(s, At(this.scroller, this.resolvedAxis()));
  }
  /** Absolute document-Y that a debug marker's "trigger" line (left-aligned, follows the page)
   * should sit at - always the "<triggerEdge>" component of a position string, resolved against
   * the trigger element's own current position. Falls back to `computedY` (the already-resolved
   * scrollY-threshold, i.e. `this.startY`/`this.endY`) for a plain number/function or a
   * whole-string relative "+=N", which carry no independent trigger-edge token to resolve. */
  resolveMarkerTriggerY(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(n.trim())) return s;
    const r = this.triggerEl.getBoundingClientRect(), o = Et(this.scroller, this.resolvedAxis());
    return ps(n, this.axisRect(r), o);
  }
  refresh() {
    var i, t, s, n;
    if (!this.killed) {
      if ((i = this.stickyHandle) == null || i.setPhase("before"), this.vars.syncTo ? (this.measureSyncSourceEdges(), this.startY = this.resolveSyncSourcePosition(this.vars.start, "top bottom"), this.endY = this.resolveSyncSourcePosition(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1e-4)) : (this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1)), this.vars.sticky) {
        const r = this.vars.sticky === !0 ? this.triggerEl : typeof this.vars.sticky == "string" ? de(this.vars.sticky) : this.vars.sticky;
        r instanceof Element ? (this.stickyHandle ?? (this.stickyHandle = os(r)), this.stickyHandle.setStickyTop(this.stickyHandle.naturalDocTop - this.startY), this.stickyHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] OnScroll: sticky must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.sticky)}, ignoring`);
      }
      this.vars.syncTo || (t = this.markerHandle) == null || t.update(
        this.resolveMarkerTriggerY(this.vars.start, "top bottom", this.startY),
        this.resolveMarkerTriggerY(this.vars.end, "bottom top", this.endY),
        this.resolveMarkerViewportY(this.vars.start, "top bottom"),
        this.resolveMarkerViewportY(this.vars.end, "bottom top")
      ), this.update(!0), (n = (s = this.vars).onRefresh) == null || n.call(s, this);
    }
  }
  computeProgress(i) {
    return Math.max(0, Math.min((i - this.startY) / (this.endY - this.startY), 1));
  }
  currentPosition() {
    return this.vars.syncTo ? this.vars.syncTo.totalProgress() : Et(this.scroller, this.resolvedAxis());
  }
  update(i = !1) {
    var l, a, h, d, u, f, p, g, b, y, x, m, C, v, T, D;
    if (this.killed) return;
    const t = this.currentPosition(), s = this.computeProgress(t), n = t >= this.startY && t <= this.endY, r = t >= this.lastScroll, o = this.wasInside;
    this.stickyHandle && this.stickyHandle.setPhase(t < this.startY ? "before" : t > this.endY ? "after" : "during"), i && !this.syncController && !o && t >= this.startY ? ((a = (l = this.vars).onEnter) == null || a.call(l, this), (h = this.vars.animation) == null || h.totalProgress(1)) : n && !o ? r ? ((u = (d = this.vars).onEnter) == null || u.call(d, this), this.syncController || (f = this.vars.animation) == null || f.play()) : (g = (p = this.vars).onEnterBack) == null || g.call(p, this) : !n && o && (r ? (y = (b = this.vars).onLeave) == null || y.call(b, this) : (m = (x = this.vars).onLeaveBack) == null || m.call(x, this)), this.wasInside = n, this.lastScroll = t, i ? (C = this.syncController) == null || C.snapTo(s) : (v = this.syncController) == null || v.update(s), (n || n !== o) && ((D = (T = this.vars).onUpdate) == null || D.call(T, this));
  }
  progress() {
    return this.computeProgress(this.currentPosition());
  }
  isActive() {
    return this.wasInside;
  }
  kill() {
    var t, s, n;
    if (this.killed) return;
    this.killed = !0, this.vars.syncTo ? this.vars.syncTo.off("update", this.boundOnSyncSourceUpdate) : es(this.scroller, this.boundOnScroll), ss(this.boundOnResize), (t = this.stickyHandle) == null || t.revert(), (s = this.syncController) == null || s.kill(), (n = this.markerHandle) == null || n.remove();
    const i = H.indexOf(this);
    i !== -1 && H.splice(i, 1);
  }
  static create(i) {
    return new vt(i);
  }
  static refresh() {
    for (const i of [...H]) i.refresh();
  }
  static getAll() {
    return H;
  }
}
function at(e) {
  return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? (e -= 1.5 / 2.75, 7.5625 * e * e + 0.75) : e < 2.5 / 2.75 ? (e -= 2.25 / 2.75, 7.5625 * e * e + 0.9375) : (e -= 2.625 / 2.75, 7.5625 * e * e + 0.984375);
}
const G = 1.70158, lt = G * 1.525, Te = {
  linear: (e) => e,
  quadIn: (e) => e * e,
  quadOut: (e) => 1 - (1 - e) * (1 - e),
  quadInOut: (e) => e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2,
  cubicIn: (e) => e * e * e,
  cubicOut: (e) => 1 - Math.pow(1 - e, 3),
  cubicInOut: (e) => e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2,
  quartIn: (e) => e ** 4,
  quartOut: (e) => 1 - (1 - e) ** 4,
  quartInOut: (e) => e < 0.5 ? 8 * e ** 4 : 1 - (-2 * e + 2) ** 4 / 2,
  quintIn: (e) => e ** 5,
  quintOut: (e) => 1 - (1 - e) ** 5,
  quintInOut: (e) => e < 0.5 ? 16 * e ** 5 : 1 - (-2 * e + 2) ** 5 / 2,
  strongIn: (e) => e ** 5,
  strongOut: (e) => 1 - (1 - e) ** 5,
  strongInOut: (e) => e < 0.5 ? 16 * e ** 5 : 1 - (-2 * e + 2) ** 5 / 2,
  sineIn: (e) => 1 - Math.cos(e * Math.PI / 2),
  sineOut: (e) => Math.sin(e * Math.PI / 2),
  sineInOut: (e) => -(Math.cos(Math.PI * e) - 1) / 2,
  expoIn: (e) => e === 0 ? 0 : Math.pow(2, 10 * (e - 1)) * e + Math.pow(e, 6) * (1 - e),
  expoOut: (e) => e === 1 ? 1 : 1 - Math.pow(2, -10 * e),
  expoInOut: (e) => e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2,
  circIn: (e) => 1 - Math.sqrt(1 - e * e),
  circOut: (e) => Math.sqrt(1 - (e - 1) * (e - 1)),
  circInOut: (e) => e < 0.5 ? (1 - Math.sqrt(1 - (2 * e) ** 2)) / 2 : (Math.sqrt(1 - (-2 * e + 2) ** 2) + 1) / 2,
  backIn: (e) => (G + 1) * e * e * e - G * e * e,
  backOut: (e) => (e--, 1 + (G + 1) * e * e * e + G * e * e),
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((lt + 1) * t - lt) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((lt + 1) * i + lt) + 2) / 2;
  },
  bounceIn: (e) => 1 - at(1 - e),
  bounceOut: at,
  bounceInOut: (e) => e < 0.5 ? (1 - at(1 - 2 * e)) / 2 : (1 + at(2 * e - 1)) / 2
}, ms = {
  linear: "linear",
  quadIn: "cubic-bezier(0.11, 0, 0.5, 0)",
  quadOut: "cubic-bezier(0.5, 1, 0.89, 1)",
  quadInOut: "cubic-bezier(0.45, 0, 0.55, 1)",
  cubicIn: "cubic-bezier(0.32, 0, 0.67, 0)",
  cubicOut: "cubic-bezier(0.33, 1, 0.68, 1)",
  cubicInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  quartIn: "cubic-bezier(0.5, 0, 0.75, 0)",
  quartOut: "cubic-bezier(0.25, 1, 0.5, 1)",
  quartInOut: "cubic-bezier(0.76, 0, 0.24, 1)",
  quintIn: "cubic-bezier(0.64, 0, 0.78, 0)",
  quintOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  quintInOut: "cubic-bezier(0.83, 0, 0.17, 1)",
  strongIn: "cubic-bezier(0.64, 0, 0.78, 0)",
  strongOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  strongInOut: "cubic-bezier(0.83, 0, 0.17, 1)",
  sineIn: "cubic-bezier(0.12, 0, 0.39, 0)",
  sineOut: "cubic-bezier(0.61, 1, 0.88, 1)",
  sineInOut: "cubic-bezier(0.37, 0, 0.63, 1)",
  expoIn: "cubic-bezier(0.7, 0, 0.84, 0)",
  expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  expoInOut: "cubic-bezier(0.87, 0, 0.13, 1)",
  circIn: "cubic-bezier(0.55, 0, 1, 0.45)",
  circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
  circInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
  backIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
  backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  backInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
  bounceIn: "ease-in",
  bounceOut: "ease-out",
  bounceInOut: "ease-in-out"
};
function bs(e) {
  return ms[e] ?? "ease-out";
}
const Wt = /* @__PURE__ */ new WeakMap();
let Lt = [], Bt = null;
function ue(e, i) {
  Lt.push({ instance: e, type: i }), Bt === null && (Bt = requestAnimationFrame(ys));
}
function ys() {
  const e = Lt.slice();
  Lt.length = 0, Bt = null;
  for (let i = 0; i < e.length; i++) {
    const { instance: t, type: s } = e[i];
    s === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let Mt = null;
function Me() {
  return typeof window > "u" ? null : (Mt || (Mt = new IntersectionObserver(
    (e) => {
      for (let i = 0; i < e.length; i++) {
        const t = e[i], s = Wt.get(t.target);
        s && (t.isIntersecting ? ue(s, "enter") : ue(s, "leave"));
      }
    },
    { threshold: 0.05 }
  )), Mt);
}
function Ie(e, i) {
  var t;
  Wt.set(e, i), (t = Me()) == null || t.observe(e);
}
function Dt(e) {
  var i;
  Wt.delete(e), (i = Me()) == null || i.unobserve(e);
}
function j(e, i) {
  if (e == null) return i;
  const t = e.trim();
  if (!t) return i;
  const s = Number(t);
  return Number.isFinite(s) ? s * 1e3 : i;
}
const w = typeof HTMLElement < "u" ? HTMLElement : class {
}, P = class P extends w {
  constructor() {
    super(...arguments);
    c(this, "animation");
    c(this, "options");
    c(this, "order", P.counter++);
    c(this, "cascadeSet");
  }
  static get mediaQuery() {
    return this._mediaQuery || (this._mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")), this._mediaQuery;
  }
  static get reduceMotion() {
    return this.mediaQuery.matches;
  }
  static enqueueCascade(t) {
    const s = t.parentElement;
    let n = this.cascadeQueue.get(s);
    n || (n = /* @__PURE__ */ new Set(), this.cascadeQueue.set(s, n)), n.add(t), t.cascadeSet = n, this.scheduleCascade();
  }
  static scheduleCascade() {
    this.isProcessingCascade || !this.cascadeQueue.size || (this.isProcessingCascade = !0, queueMicrotask(() => {
      for (const t of this.cascadeQueue.values())
        this.handleCascade([...t]);
      this.cascadeQueue.clear(), this.isProcessingCascade = !1;
    }));
  }
  static handleCascade(t) {
    t.sort((s, n) => s.order - n.order), t.forEach((s, n) => {
      s.play(n * 120);
    });
  }
  get isCascade() {
    return this.hasAttribute("cascade");
  }
  connectedCallback() {
    if (this.options = this.getOptions(), P.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), Ie(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t, s;
    (t = this.animation) == null || t.cancel(), Dt(this), (s = this.cascadeSet) == null || s.delete(this), this.cascadeSet = void 0;
  }
  handleEnter() {
    this.hasAttribute("replay") || Dt(this), this.isCascade ? P.enqueueCascade(this) : this.play();
  }
  handleLeave() {
    this.hasAttribute("replay") && this.reset();
  }
  getOptions() {
    const t = Number(this.getAttribute("strength")) || 30, s = {
      fade: [0, 0],
      "fade-up": [0, t],
      "fade-down": [0, -t],
      "fade-left": [t, 0],
      "fade-right": [-t, 0]
    }, n = this.getAttribute("type") ?? "fade-up", r = this.getAttribute("easing"), [o, l] = s[n] ?? s["fade-up"];
    return {
      x: o,
      y: l,
      easing: r && r in Te ? r : "none",
      duration: j(this.getAttribute("duration"), 500),
      delay: j(this.getAttribute("delay"), 50)
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
    const { x: s, y: n, easing: r, duration: o, delay: l } = this.options;
    (a = this.animation) == null || a.cancel(), this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${s}px, ${n}px, 0)`
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)"
        }
      ],
      {
        duration: o,
        delay: l + t,
        easing: bs(r),
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var h;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (h = this.animation) == null || h.cancel(), this.animation = void 0;
    };
  }
};
c(P, "counter", 0), c(P, "_mediaQuery", null), c(P, "cascadeQueue", /* @__PURE__ */ new Map()), c(P, "isProcessingCascade", !1);
let $t = P;
function xs() {
  customElements.get("sx-animate") || customElements.define("sx-animate", $t);
}
const Xt = {
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
}, ut = 180 / Math.PI;
function vs(e) {
  const i = window.getComputedStyle(e).transform;
  return !i || i === "none" ? { ...Xt } : i.startsWith("matrix3d") ? Ss(i) : Cs(i);
}
function Cs(e) {
  const i = e.match(/matrix\(([^)]+)\)/);
  if (!i) return { ...Xt };
  const t = i[1].split(",").map((f) => parseFloat(f.trim())), [s, n, r, o, l, a] = t, h = Math.sqrt(s * s + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, s) * ut;
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
function Ss(e) {
  const i = e.match(/matrix3d\(([^)]+)\)/);
  if (!i) return { ...Xt };
  const t = i[1].split(",").map((m) => parseFloat(m.trim())), s = t[0], n = t[1], r = t[2], o = t[4], l = t[5], a = t[6];
  t[8], t[9];
  const h = t[10], d = t[12], u = t[13], f = t[14], p = Math.sqrt(s * s + n * n + r * r), g = Math.sqrt(o * o + l * l + a * a), b = Math.atan2(n, s) * ut, y = Math.atan2(-r, Math.sqrt(a * a + h * h)) * ut, x = Math.atan2(a, h) * ut;
  return {
    x: d,
    y: u,
    z: f,
    rotate: b,
    rotateX: x,
    rotateY: y,
    rotateZ: b,
    scale: p,
    scaleX: p,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
const ks = {
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
}, fe = /* @__PURE__ */ new WeakMap();
function ws(e) {
  const i = vs(e);
  return {
    ...ks,
    x: i.x,
    y: i.y,
    z: i.z,
    rotate: i.rotate,
    rotateX: i.rotateX,
    rotateY: i.rotateY,
    rotateZ: i.rotateZ,
    scale: i.scale,
    scaleX: i.scaleX,
    scaleY: i.scaleY,
    skewX: i.skewX,
    skewY: i.skewY
  };
}
function _e(e) {
  let i = fe.get(e);
  return i || (i = ws(e), fe.set(e, i)), i;
}
function B(e, i, t) {
  _e(e)[i] = t;
}
function Q(e) {
  const i = _e(e);
  return `translate(${i.xPercent}%, ${i.yPercent}%) translate3d(${i.x}px, ${i.y}px, ${i.z}px) rotate(${i.rotate}deg) rotateX(${i.rotateX}deg) rotateY(${i.rotateY}deg) rotateZ(${i.rotateZ}deg) scale(${i.scale}) scaleX(${i.scaleX}) scaleY(${i.scaleY}) skewX(${i.skewX}deg) skewY(${i.skewY}deg)`;
}
class Es extends w {
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
    c(this, "updateAnimation", (t, s) => {
      if (this.isHovered || this.cachedResetBounds <= 0) return;
      const n = s / 1e3, r = this.speed * n, o = this.direction, a = this.isVertical ? this.offsetHeight : this.offsetWidth;
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
    }), this.resizeObserver.observe(this), Ie(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, O.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, O.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), Dt(this), O.remove(this.updateAnimation);
  }
  attributeChangedCallback(t, s, n) {
    s !== n && (t === "gap" ? (this.updateGapVar(), setTimeout(() => this.scheduleSetup(), 50)) : (t === "direction" || t === "speed" || t === "clone") && this.scheduleSetup());
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
        const s = Array.from(
          this.inner.querySelectorAll(
            "sx-marquee-item:not([data-clone])"
          )
        );
        this.inner.replaceChildren(...s);
        const n = this.isVertical, r = n ? this.offsetHeight : this.offsetWidth, o = n ? this.inner.offsetHeight : this.inner.offsetWidth;
        if (this.clone && o > 0 && r > 0) {
          const l = o < r ? Math.ceil(r * 2 / o) : 2, a = document.createDocumentFragment();
          for (let h = 1; h < l; h++)
            for (const d of s) {
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
    let s = 0;
    const n = this.isVertical;
    for (let o = 0; o < t.length; o++)
      s += n ? t[o].offsetHeight : t[o].offsetWidth;
    const r = parseFloat(getComputedStyle(this.inner).gap) || 0;
    s += r * t.length, this.cachedResetBounds = s;
  }
  applyTransform(t) {
    this.inner && (B(this.inner, this.isVertical ? "y" : "x", t), this.inner.style.transform = Q(this.inner));
  }
}
class As extends w {
}
class Ts extends w {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function Ms() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Es), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", As), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", Ts);
}
class Is extends w {
  constructor() {
    super();
  }
}
class _s {
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
const q = new _s();
class Os extends w {
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
    const s = t.target;
    if (s.classList.contains("sx-slider-pagination-bullet")) {
      const n = Number(s.getAttribute("data-index"));
      this.goToSlide(n);
    }
  }
  goToSlide(t) {
    const s = this.getAttribute("name");
    let n = null;
    s ? n = q.get(s) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const s = this.getAttribute("effect"), n = s === "dynamic", r = s === "snake", o = s === "fraction", l = t.join(",") + `_effect:${s}`;
    if (this.renderedSignature === l) return;
    if (this.renderedSignature = l, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const h = document.createElement("span");
      h.className = "sx-slider-pagination-current", h.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const f = document.createDocumentFragment();
      f.appendChild(h), f.appendChild(d), f.appendChild(u), this.appendChild(f);
      return;
    }
    const a = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((h, d) => {
        const u = this.createBulletDOM(h, d, !1);
        this.cachedBullets.push(u), a.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", a.appendChild(this.snakeBar), this.appendChild(a);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", a.appendChild(this.innerContainer), t.forEach((h, d) => {
        const u = this.createBulletDOM(h, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(a);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((h, d) => {
      const u = this.createBulletDOM(h, d, s === "number");
      this.cachedBullets.push(u), a.appendChild(u);
    }), this.appendChild(a);
  }
  createBulletDOM(t, s, n) {
    const r = document.createElement("span");
    return r.className = "sx-slider-pagination-bullet", r.setAttribute("data-index", t.toString()), r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"), r.setAttribute("aria-label", `Go to slide ${s + 1}`), n && (r.textContent = (s + 1).toString()), r;
  }
  updateActive(t) {
    const s = this.getAttribute("effect");
    if (s === "fraction") {
      const u = this.querySelector(".sx-slider-pagination-current");
      u && (u.textContent = (t + 1).toString());
      return;
    }
    const n = s === "dynamic", r = s === "snake", o = this.cachedBullets, l = o.length;
    if (l === 0) return;
    if (o.forEach((u, f) => {
      n && (u.className = "sx-slider-pagination-bullet"), f === t ? (u.setAttribute("sx-bullet-active", ""), u.setAttribute("aria-current", "true")) : (u.removeAttribute("sx-bullet-active"), u.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const b = t * 20, y = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const x = b - y + 10;
          this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const x = y - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || l <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (B(this.innerContainer, "x", 0), this.innerContainer.style.transform = Q(this.innerContainer));
      return;
    }
    let a = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    a = Math.min(a, l - this.maxVisibleBullets);
    const h = a + this.maxVisibleBullets - 1;
    o.forEach((u, f) => {
      f >= a && f <= h ? f === a ? u.classList.add(f === 0 ? "sx-bullet-main" : "sx-bullet-small") : f === a + 1 ? u.classList.add(f === 1 ? "sx-bullet-main" : "sx-bullet-medium") : f === h ? u.classList.add(
        f === l - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : f === h - 1 ? u.classList.add(
        f === l - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -a * this.bulletWidthWithGap;
    B(this.innerContainer, "x", d), this.innerContainer.style.transform = Q(this.innerContainer);
  }
}
class Ps extends w {
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
      const t = q.get(i);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class Rs extends w {
  constructor() {
    super();
    c(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, s, n) {
    const r = Math.max(0, Math.min(1, t));
    this.bar.style.transition = n || "none", s === "vertical" ? (this.bar.style.transformOrigin = "top center", B(this.bar, "scaleY", r), B(this.bar, "scaleX", 1)) : (this.bar.style.transformOrigin = "left center", B(this.bar, "scaleX", r), B(this.bar, "scaleY", 1)), this.bar.style.transform = Q(this.bar);
  }
}
class zs extends w {
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
      const t = q.get(i);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class Ls {
  constructor(i, t, s = 0.92) {
    c(this, "velocity", 0);
    c(this, "friction");
    c(this, "onUpdate");
    c(this, "onComplete");
    c(this, "isRunning", !1);
    c(this, "tickerCallback");
    this.onUpdate = i, this.onComplete = t, this.friction = s, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(i) {
    this.friction = i;
  }
  addVelocity(i) {
    this.velocity += i, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, O.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, O.add(this.tickerCallback));
  }
  loop(i) {
    if (!this.isRunning) return;
    const t = i / 16.67, s = Math.pow(this.friction, t);
    if (Math.abs(this.velocity) < 0.1) {
      this.stop(), this.onComplete();
      return;
    }
    this.onUpdate(this.velocity * t), this.velocity *= s;
  }
}
class Bs extends w {
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
        const { max: s, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(s, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    c(this, "wheelInertia", new Ls(
      (t) => {
        if (this.sliderCha) {
          if (this.currentTranslate += t, this.sliderCha.options.loop)
            this.checkLoopBoundsInstant();
          else {
            const { max: s, min: n } = this.sliderCha.getBoundaries(), r = this.sliderCha.options.edgeResistance;
            this.currentTranslate > s ? r <= 0 ? (this.currentTranslate = s, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate > s + r ? (this.currentTranslate = s + r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.currentTranslate < n ? r <= 0 ? (this.currentTranslate = n, this.wheelInertia.stop(), this.handleScrollEnd()) : this.currentTranslate < n - r ? (this.currentTranslate = n - r, this.wheelInertia.setFriction(0.2)) : this.wheelInertia.setFriction(0.6) : this.wheelInertia.setFriction(0.92);
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
    this.sliderCha && (this.sliderCha.removeEventListener("mousedown", this.boundDragStart), this.sliderCha.removeEventListener("touchstart", this.boundDragStart), this.sliderCha.removeEventListener("wheel", this.boundWheel)), this.detachWindowDragListeners(), this.wheelInertia.stop(), this.cancelMomentumScroll();
  }
  initDragEvents() {
    this.sliderCha && (this.sliderCha.addEventListener("mousedown", this.boundDragStart), this.sliderCha.addEventListener("touchstart", this.boundDragStart, {
      passive: !0
    }), this.sliderCha.addEventListener("wheel", this.boundWheel, {
      passive: !1
    }));
  }
  attachWindowDragListeners() {
    window.addEventListener("mousemove", this.boundDragMove), window.addEventListener("mouseup", this.boundDragEnd), window.addEventListener("touchmove", this.boundDragMove, {
      passive: !1
    }), window.addEventListener("touchend", this.boundDragEnd);
  }
  detachWindowDragListeners() {
    window.removeEventListener("mousemove", this.boundDragMove), window.removeEventListener("mouseup", this.boundDragEnd), window.removeEventListener("touchmove", this.boundDragMove), window.removeEventListener("touchend", this.boundDragEnd);
  }
  onWheel(t) {
    if (!(!this.sliderCha || this.sliderCha.options.direction !== "vertical" || !this.sliderCha.options.verticalScroll))
      if (t.preventDefault(), this.sliderCha.stopAutoplay(), this.sliderCha.options.drag === "free") {
        this.cancelMomentumScroll(), this.style.transition = "none", this.wheelInertia.setFriction(0.92);
        let s = -t.deltaY * 0.15;
        if (!this.sliderCha.options.loop) {
          const { max: n, min: r } = this.sliderCha.getBoundaries();
          (this.currentTranslate > n && s > 0 || this.currentTranslate < r && s < 0) && (s *= 0.2);
        }
        this.wheelInertia.addVelocity(s);
      } else {
        const s = performance.now();
        s - this.lastWheelTime > 400 && (t.deltaY > 0 ? this.sliderCha.next() : t.deltaY < 0 && this.sliderCha.prev(), this.lastWheelTime = s), this.sliderCha.startAutoplay();
      }
  }
  getPositionAxis(t) {
    if (!this.sliderCha) return 0;
    const s = this.sliderCha.options.direction === "vertical";
    return t instanceof MouseEvent ? s ? t.clientY : t.clientX : s ? t.touches[0].clientY : t.touches[0].clientX;
  }
  dragStart(t) {
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.isResetting || (this.attachWindowDragListeners(), this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.wheelInertia.stop(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionAxis(t), this.lastClientAxis = this.startX, this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant());
  }
  dragMove(t) {
    if (!this.isDragging || !this.sliderCha) return;
    t.cancelable && t.preventDefault();
    const s = this.getPositionAxis(t);
    this.lastClientAxis = s;
    const n = performance.now();
    for (this.dragXs.push(s), this.dragTimes.push(n); this.dragTimes.length > 0 && n - this.dragTimes[0] > 200; )
      this.dragXs.shift(), this.dragTimes.shift();
    const r = s - this.startX;
    let o = this.prevTranslate + r;
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
    this.isDragging = !1, this.detachWindowDragListeners();
    const t = this.sliderCha.options, s = performance.now();
    if (this.dragTimes.length > 0) {
      const n = this.dragTimes[this.dragTimes.length - 1];
      if (s - n > 10)
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
        const l = this.sliderCha.getRawIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(l) : l * this.sliderCha.getSlideSizeWithGap(), h = t.autoSize ? this.sliderCha.getOffsetForIndex(l + 1) - a : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const d = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + d / 2 - (a + h / 2);
        } else
          r = o - a;
        if (!t.loop) {
          const { max: d, min: u } = this.sliderCha.getBoundaries();
          r = Math.max(u, Math.min(d, r));
        }
      }
      if (t.loop)
        this.startMomentumScroll(r);
      else {
        const { max: o, min: l } = this.sliderCha.getBoundaries(), a = Math.max(
          l,
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
  startMomentumScroll(t, s, n, r = !1) {
    var l;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = s ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (l = this.sliderCha) == null || l.alignIndexToFreeTranslation(this.currentTranslate), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, O.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const s = performance.now() - this.scrollStartTime, n = Math.min(s / this.scrollDuration, 1), r = Te.quartOut(n), l = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
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
          const f = this.currentTranslate > a ? a : h;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(l) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, O.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, O.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, s = this.sliderCha.getCloneCount(), n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(s), r = this.sliderCha.getOffsetForIndex(s + t) - o;
    else {
      const b = this.sliderCha.getSlideSizeWithGap();
      o = s * b, r = t * b;
    }
    let l = 0;
    if (this.sliderCha.options.centered) {
      const b = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let y = 0;
      this.sliderCha.options.autoSize ? y = this.sliderCha.getOffsetForIndex(s + 1) - this.sliderCha.getOffsetForIndex(s) : y = this.sliderCha.getSlideSizeWithGap(), l = b / 2 - y / 2;
    }
    const a = -o + n + l, h = a - r;
    let d = !1, u = this.currentTranslate, f = 0, p = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + g ? (u = this.currentTranslate - r, f = -r, p = t, d = !0) : this.currentTranslate <= h - g && (u = this.currentTranslate + r, f = r, p = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.shiftCurrentIndex(p), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (B(this, this.sliderCha.transformFn === "translateY" ? "y" : "x", t), this.style.transform = Q(this), this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const s = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${s.speed}ms ease-out, height ${s.speed}ms ease-out`;
    const n = parseFloat(this.sliderCha.startPadding) || 0, r = this.sliderCha.getRawIndex();
    let o = n, l = 0, a = 0;
    if (s.autoSize)
      l = this.sliderCha.getOffsetForIndex(r), a = this.sliderCha.getOffsetForIndex(r + 1) - l;
    else {
      const h = this.sliderCha.getSlideSizeWithGap();
      l = r * h, a = h;
    }
    if (s.centered) {
      const h = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += h / 2 - (l + a / 2);
    } else
      o -= l;
    if (!s.loop) {
      const { max: h, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(h, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, s.loop) {
      const h = this.sliderCha.originalSlidesCount, d = this.sliderCha.getCloneCount();
      (r >= d + h || r < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, s.speed);
    }
  }
}
class yt {
  static parse(i) {
    if (!i) return null;
    try {
      let t = i.replace(/'/g, '"');
      return t = t.replace(/([{,]\s*)([a-zA-Z0-9_.-]+)\s*:/g, '$1"$2":'), t = t.replace(/,\s*([}\]])/g, "$1"), JSON.parse(t);
    } catch (t) {
      return console.warn("SixJS: Lỗi cú pháp JSON ở thuộc tính breakpoints", t), null;
    }
  }
  static getMatch(i, t, s) {
    if (!s) return { ...t };
    let n = { ...t };
    const r = Object.keys(s).map(Number).sort((o, l) => o - l);
    for (const o of r)
      if (i >= o) {
        const l = this.kebabToCamel(s[o]);
        n = { ...n, ...l };
      }
    return n;
  }
  static kebabToCamel(i) {
    if (typeof i != "object" || i === null) return i;
    const t = {};
    for (const s in i) {
      const n = s.replace(/-([a-z])/g, (r) => r[1].toUpperCase());
      t[n] = i[s];
    }
    return t;
  }
}
class Ds extends w {
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
    c(this, "slideOffsetsCache", null);
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
  getCloneCount() {
    return this.options.autoSize ? this.originalSlidesCount : this.options.perView;
  }
  updateProgress(t, s) {
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const h = this.originalSlidesCount;
      if (h > 0 && this.track) {
        const d = this.getCloneCount(), u = parseFloat(this.startPadding) || 0;
        let f = 0, p = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(d), p = this.getOffsetForIndex(d + h) - f;
        else {
          const g = this.getSlideSizeWithGap();
          f = d * g, p = h * g;
        }
        if (p > 0) {
          r = o / p;
          let g = 0;
          if (this.options.centered) {
            let x = this.options.autoSize ? this.getOffsetForIndex(d + 1) - this.getOffsetForIndex(d) : this.getSlideSizeWithGap();
            g = o / 2 - x / 2;
          }
          n = (-f + u + g - t) / p, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: h, min: d } = this.getBoundaries(), u = h - d;
      u > 0 ? (n = (h - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const l = r + n * (1 - r);
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
      typeof h.update == "function" && h.update(l, this.options.direction, s);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && q.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;
        const t = this.getBoundingClientRect()[this.sizeDim];
        t !== this.lastContainerSize && (this.lastContainerSize = t, this.updateLayout());
      });
    }), this.resizeObserver.observe(this), this.track) {
      let t = 0, s = 0;
      this.track.addEventListener("mousedown", (n) => {
        t = n.clientX, s = n.clientY;
      }), this.track.addEventListener(
        "touchstart",
        (n) => {
          n.touches.length > 0 && (t = n.touches[0].clientX, s = n.touches[0].clientY);
        },
        { passive: !0 }
      ), this.track.addEventListener("click", (n) => {
        const r = Math.abs(n.clientX - t), o = Math.abs(n.clientY - s);
        if (r > 6 || o > 6) return;
        const l = n.target.closest("sx-slider-slide");
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
    ), this.options.name && q.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", s = this.getAttribute("edge-resistance"), n = s !== null ? Number(s) : 100, r = this.getAttribute("interval"), o = j(r, 4e3), l = this.getAttribute("start-index"), a = l !== null ? Number(l) : 0, h = this.getAttribute("per-move");
    let d = "auto";
    if (h !== null && h !== "auto") {
      const p = Number(h);
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
      speed: j(this.getAttribute("speed"), 300),
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
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = yt.parse(
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
    const s = Array.from(this.track.children);
    if (this.originalSlidesCount = s.length, this.originalSlidesCount === 0) return;
    s.forEach((r, o) => {
      r.setAttribute("data-real-index", o.toString());
    });
    const n = this.getCloneCount();
    for (let r = 0; r < n; r++) {
      const l = s[s.length - 1 - r].cloneNode(!0);
      l.setAttribute("data-clone", "prev"), this.track.insertBefore(l, this.track.firstChild);
    }
    for (let r = 0; r < n; r++) {
      const l = s[r].cloneNode(!0);
      l.setAttribute("data-clone", "next"), this.track.appendChild(l);
    }
    this.invalidateOffsetsCache();
  }
  destroyLoopClones() {
    if (!this.track) return;
    this.track.querySelectorAll("[data-clone]").forEach((s) => s.remove()), this.originalSlidesCount = 0, this.invalidateOffsetsCache();
  }
  formatUnit(t) {
    return t == null || t === "" ? "0px" : isNaN(Number(t)) ? String(t) : `${t}px`;
  }
  updateLayout() {
    if (!this.track) return;
    this.style.setProperty("--sx-speed", `${this.options.speed}ms`);
    const t = this.getBoundingClientRect()[this.sizeDim];
    let s = Array.from(this.track.children);
    if (s.length === 0) return;
    if (this.options.loop || s.forEach((p, g) => {
      p.setAttribute("data-real-index", g.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = yt.getMatch(
        t,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig
      );
      const p = (g) => g == null || g === "" ? "0px" : isNaN(Number(g)) ? String(g) : `${g}px`;
      this.options.gap = p(this.options.gap), this.options.leftPadding = p(this.options.leftPadding), this.options.rightPadding = p(this.options.rightPadding);
    }
    this.options.effect === "fade" ? this.setAttribute("data-active-effect", "fade") : this.removeAttribute("data-active-effect"), this.options.grabCursor && this.options.drag !== "false" ? this.track.setAttribute("grab-cursor", "") : this.track.removeAttribute("grab-cursor"), this.options.loop && this.originalSlidesCount === 0 ? (this.initLoopClones(), s = Array.from(this.track.children)) : !this.options.loop && this.originalSlidesCount > 0 && (this.destroyLoopClones(), s = Array.from(this.track.children), this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex, s.length - 1)
    ));
    const n = this.track.querySelectorAll("[data-clone]").length, r = s.length - n;
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
    const o = this.getAttribute("left-padding"), l = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && l && parseFloat(l) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(l));
    const a = this.convertToPx(this.options.gap), h = this.convertToPx(this.options.leftPadding), d = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      s.forEach((p) => {
        p.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, s.forEach((p) => {
        const g = p.firstElementChild;
        g ? p.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : p.style[this.sizeDim] = "max-content", p.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - h - d - a * (this.options.perView - 1)) / this.options.perView;
      s.forEach((y) => {
        y.style[this.sizeDim] = `${b}px`, y.style[this.marginProp] = this.options.gap;
      });
    }
    let u = !1;
    const f = s.filter((p) => !p.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let p = 0;
      f.forEach((g) => {
        p += this.getRectSize(g) + a;
      }), p -= a, u = p < t;
    } else
      u = r < this.options.perView;
    this.options.centerIfShort && u ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((g) => g.remove())) : this.track.style.justifyContent = "", this.invalidateOffsetsCache(), this.track.updatePosition(!0), this.updateSlideAttributes();
  }
  convertToPx(t) {
    if (!t || t === "0px" || t === "0") return 0;
    if (t.endsWith("px"))
      return parseFloat(t);
    const s = document.createElement("div");
    s.style.display = "none", s.style.width = t, document.body.appendChild(s);
    const n = parseFloat(getComputedStyle(s).width);
    return document.body.removeChild(s), n || 0;
  }
  getSlideSizeWithGap() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children[0];
    return this.getRectSize(t) + this.convertToPx(this.options.gap);
  }
  getVisibleSlidesCount() {
    if (!this.track || this.track.children.length === 0) return 1;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let s = 0, n = 0;
    const r = this.convertToPx(this.options.gap), o = Array.from(this.track.children);
    for (let l = 0; l < o.length && (s += this.getRectSize(o[l]) + r, !(s - r > t)); l++)
      n++;
    return Math.max(1, n);
  }
  invalidateOffsetsCache() {
    this.slideOffsetsCache = null;
  }
  buildOffsetsCache() {
    const t = this.track ? Array.from(this.track.children) : [], s = this.convertToPx(this.options.gap), n = [0];
    for (let r = 0; r < t.length; r++)
      n.push(n[r] + this.getRectSize(t[r]) + s);
    return n;
  }
  getOffsetForIndex(t) {
    if (!this.track) return 0;
    this.slideOffsetsCache || (this.slideOffsetsCache = this.buildOffsetsCache());
    const s = this.slideOffsetsCache, n = Math.max(0, Math.min(t, s.length - 1));
    return s[n];
  }
  getMaxTranslate() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.getBoundingClientRect()[this.sizeDim];
    let s = 0;
    if (this.options.autoSize)
      s = this.getOffsetForIndex(this.track.children.length), s -= this.convertToPx(this.options.gap);
    else {
      const n = this.track.children.length;
      s = this.getSlideSizeWithGap() * n - this.convertToPx(this.options.gap);
    }
    return Math.max(0, s - t);
  }
  getBoundaries() {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const t = this.getBoundingClientRect()[this.sizeDim], s = parseFloat(this.startPadding) || 0;
    this.convertToPx(this.options.gap);
    const n = this.track.children.length;
    let r = 0, o = -this.getMaxTranslate();
    if (this.options.centered && !this.options.autoCentered) {
      let l = this.options.autoSize ? this.getOffsetForIndex(1) - this.getOffsetForIndex(0) : this.getSlideSizeWithGap();
      r = s + t / 2 - l / 2;
      let a = n - 1, h = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), d = this.options.autoSize ? this.getOffsetForIndex(a + 1) - h : this.getSlideSizeWithGap();
      o = s + t / 2 - (h + d / 2);
    }
    return { max: r, min: Math.min(r, o) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const s = this.options.loop, n = s ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = s ? this.getCloneCount() : 0, o = (m) => {
      if (!s) return m;
      let C = (m - r) % n;
      return C < 0 && (C += n), C;
    }, l = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = o(this.currentIndex);
    this.lastFiredIndex !== a && (this.lastFiredIndex = a, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: a }
      })
    ));
    const h = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + l), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let p = null;
    f && (p = document.createElement("style"), p.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(p), this.offsetHeight), t.forEach((m, C) => {
      const v = o(C);
      m.setAttribute("aria-label", `${v + 1}/${n}`);
    }), this.options.lockActive && !this.isClickRouting && !f || t.forEach((m, C) => {
      m.removeAttribute("sx-slide-active"), m.removeAttribute("sx-slide-prev"), m.removeAttribute("sx-slide-next"), m.removeAttribute("sx-slide-center");
      const v = o(C);
      v === a && m.setAttribute("sx-slide-active", ""), v === h && m.setAttribute("sx-slide-prev", ""), v === d && m.setAttribute("sx-slide-next", ""), v === u && m.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight();
    const g = s ? n - 1 : this.getRealMaxIndex();
    this.updateNavigation(s ? void 0 : g);
    const b = this.getResolvedPerMove();
    let y = [];
    if (b > 1 && !this.options.autoSize) {
      let m = 0;
      for (; m < g; )
        y.push(m), m += b;
      m !== g && y.push(g);
    } else
      for (let m = 0; m <= g; m++)
        y.push(m);
    let x = y.indexOf(a);
    if (x === -1) {
      for (let m = y.length - 1; m >= 0; m--)
        if (a >= y[m]) {
          x = m;
          break;
        }
    }
    this.updatePagination(y, x), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((C) => C.trim()).forEach((C) => {
      const v = q.get(C);
      v && v.syncFromController(a);
    }), f && p && requestAnimationFrame(() => {
      p == null || p.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const s = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = s ? this.originalSlidesCount : n.length - r;
    if (((a) => {
      if (!s) return a;
      const h = this.getCloneCount();
      let d = (a - h) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (s) {
        const a = this.getCloneCount(), h = t + a, d = this.originalSlidesCount, u = n.length;
        let f = h, p = Math.abs(h - this.currentIndex);
        [h - d, h, h + d].forEach((b) => {
          if (b >= 0 && b < u) {
            const y = Math.abs(b - this.currentIndex);
            y < p && (p = y, f = b);
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
    const s = this.options.perView, n = this.options.centered ? Math.floor(s / 2) : 0;
    let r = this.currentIndex - n;
    this.options.loop || (r = Math.max(0, r));
    let o = 0;
    for (let l = 0; l < s; l++) {
      let a = r + l;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const h = t[a];
      if (!h) continue;
      const d = h.firstElementChild, u = d ? d.getBoundingClientRect().height : h.getBoundingClientRect().height;
      u > o && (o = u);
    }
    o > 0 && (this.track.style.height = `${o}px`);
  }
  getCurrentIndex() {
    if (!this.track) return 0;
    const t = this.options.loop, s = Array.from(this.track.children), n = t ? this.originalSlidesCount : s.length;
    if (n === 0) return 0;
    const r = t ? this.getCloneCount() : 0;
    let o = t ? (this.currentIndex - r) % n : this.currentIndex;
    return o < 0 && (o += n), o;
  }
  getRawIndex() {
    return this.currentIndex;
  }
  setCurrentIndex(t) {
    this.currentIndex = t, this.updateSlideAttributes();
  }
  shiftCurrentIndex(t) {
    this.currentIndex += t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: s } = this.getBoundaries(), n = this.options.autoSize ? 0 : this.getSlideSizeWithGap(), r = this.options.centered ? this.getBoundingClientRect()[this.sizeDim] : 0;
    for (let o = 0; o < t; o++) {
      let l = this.options.autoSize ? this.getOffsetForIndex(o) : o * n, a = this.options.autoSize ? this.getOffsetForIndex(o + 1) - l : n, h = parseFloat(this.startPadding) || 0;
      if (this.options.centered ? h += r / 2 - (l + a / 2) : h -= l, h <= s + 1)
        return o;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), s = this.options.loop ? this.getCloneCount() : 0, n = ((this.currentIndex - s) % t + t) % t, r = n !== 0 ? t - n : t;
    if (this.options.loop)
      this.currentIndex += r, this.updateSlideAttributes(), this.track.updatePosition();
    else {
      const o = this.getRealMaxIndex();
      this.currentIndex < o ? this.currentIndex = Math.min(o, this.currentIndex + r) : this.options.rewind && (this.currentIndex = 0), this.updateSlideAttributes(), this.track.updatePosition();
    }
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove(), s = this.options.loop ? this.getCloneCount() : 0, n = ((this.currentIndex - s) % t + t) % t, r = n !== 0 ? n : t;
    this.options.loop ? (this.currentIndex -= r, this.updateSlideAttributes(), this.track.updatePosition()) : (this.currentIndex > 0 ? this.currentIndex = Math.max(0, this.currentIndex - r) : this.options.rewind && (this.currentIndex = this.getRealMaxIndex()), this.updateSlideAttributes(), this.track.updatePosition());
  }
  goTo(t, s = !1) {
    if (this.track) {
      if (s && (this.isClickRouting = !0), this.options.loop) {
        const n = this.getCloneCount(), r = t + n, o = this.originalSlidesCount, l = this.track.children.length;
        let a = r, h = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < l) {
            const f = Math.abs(u - this.currentIndex);
            f < h && (h = f, a = u);
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
    const s = parseFloat(this.startPadding) || 0, n = this.getBoundingClientRect()[this.sizeDim], r = Array.from(this.track.children), o = this.options.autoSize ? 0 : this.getSlideSizeWithGap(), l = this.options.loop ? null : this.getBoundaries();
    let a = 0, h = 1 / 0;
    const d = this.currentIndex;
    for (let u = 0; u < r.length; u++) {
      let f = 0, p = 0;
      this.options.autoSize ? (f = this.getOffsetForIndex(u), p = this.getOffsetForIndex(u + 1) - f) : (f = u * o, p = o);
      let g = s;
      if (this.options.centered ? g += n / 2 - (f + p / 2) : g -= f, l) {
        const { max: y, min: x } = l;
        this.options.centered && this.options.autoCentered ? g = Math.max(
          x,
          Math.min(y, g)
        ) : this.options.centered || (u === 0 && (g = 0), g < x && (g = x), g > 0 && (g = 0));
      }
      const b = Math.abs(t - g);
      b < h - 0.5 ? (h = b, a = u) : Math.abs(b - h) <= 0.5 && Math.abs(u - d) < Math.abs(a - d) && (a = u, h = b);
    }
    if (this.currentIndex = a, !this.options.loop) {
      const u = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, u);
    }
    this.updateSlideAttributes(), this.options.loop && this.track && this.track.checkLoopBoundsInstant();
  }
  updateNavigation(t) {
    let s = Array.from(this.querySelectorAll("sx-slider-prev")), n = Array.from(this.querySelectorAll("sx-slider-next"));
    if (this.options.name) {
      const o = Array.from(
        document.querySelectorAll(
          `sx-slider-prev[name="${this.options.name}"]`
        )
      ), l = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`
        )
      );
      s = [.../* @__PURE__ */ new Set([...s, ...o])], n = [.../* @__PURE__ */ new Set([...n, ...l])];
    }
    if (this.options.loop || this.options.rewind) {
      s.forEach((o) => o.removeAttribute("sx-disabled")), n.forEach((o) => o.removeAttribute("sx-disabled"));
      return;
    }
    this.currentIndex <= 0 ? s.forEach((o) => o.setAttribute("sx-disabled", "")) : s.forEach((o) => o.removeAttribute("sx-disabled"));
    const r = t ?? this.getRealMaxIndex();
    this.currentIndex >= r ? n.forEach((o) => o.setAttribute("sx-disabled", "")) : n.forEach((o) => o.removeAttribute("sx-disabled"));
  }
  updatePagination(t, s) {
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
      typeof r.renderBullets == "function" && r.renderBullets(t), typeof r.updateActive == "function" && r.updateActive(s);
    });
  }
}
function $s() {
  customElements.get("sx-slider") || customElements.define("sx-slider", Ds), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", Bs), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", Is), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", Rs), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", zs), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", Os), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", Ps);
}
const L = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);",
  effect: "zoom",
  position: "center"
}, A = class A extends w {
  constructor() {
    super();
    c(this, "isOpen", !1);
    c(this, "previousActiveElement", null);
    c(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    c(this, "backdropEl", null);
    c(this, "dialogCoreEl", null);
    c(this, "closeCursorEl", null);
    c(this, "movingCloseCursor", !1);
    c(this, "originalContentHTML", "");
    c(this, "breakpointsConfig", null);
    c(this, "originalOptions", null);
    c(this, "resizeRaf", null);
    c(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    c(this, "handleResize", () => {
      this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.resizeRaf = requestAnimationFrame(() => this.applyBreakpoints());
    });
    c(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape") {
          t.stopPropagation(), this.closeOnEscKey && (t.preventDefault(), this.close());
          return;
        }
        t.key === "Tab" && (t.stopPropagation(), this.trapFocus(t));
      }
    });
    c(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
    c(this, "handleBackdropPointerMove", (t) => {
      !this.closeCursorEl || !this.closeOnOutsideClick || (this.closeCursorEl.style.transform = `translate3d(${t.clientX}px, ${t.clientY}px, 0) translate(-50%, -50%)`, this.closeCursorEl.classList.contains("is-visible") || (this.closeCursorEl.classList.add("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "none")));
    });
    c(this, "handleBackdropPointerLeave", () => {
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
    return j(t, L.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : L.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : L.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : L.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : L.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || L.overlayStyle;
  }
  get effect() {
    return this.getAttribute("effect") || L.effect;
  }
  get position() {
    return this.getAttribute("position") || L.position;
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
    }, this.breakpointsConfig = yt.parse(this.getAttribute("breakpoints")), this.render(), this.applyBreakpoints(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), window.addEventListener("resize", this.handleResize), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    var s;
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), window.removeEventListener("resize", this.handleResize), this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.removeEventListener("keydown", this.handleKeyDown), this.setInertOnSiblings(!1), (s = this.closeCursorEl) == null || s.remove(), this.closeCursorEl = null;
    const t = A.openStack.indexOf(this);
    t !== -1 && A.openStack.splice(t, 1);
  }
  applyBreakpoints() {
    if (!this.breakpointsConfig || !this.originalOptions) return;
    const t = yt.getMatch(
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
      const s = this.closeCursorEl;
      this.closeCursorEl = null, s.remove();
    }
    this.name ? t.setAttribute("name", this.name) : t.removeAttribute("name"), this.movingCloseCursor = !0, document.body.appendChild(t), this.movingCloseCursor = !1, this.closeCursorEl = t;
  }
  unregisterCloseCursor(t) {
    this.movingCloseCursor || this.closeCursorEl === t && (this.closeCursorEl = null);
  }
  dispatchLifecycleEvent(t, s = !1) {
    const n = new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      cancelable: s,
      detail: { name: this.name }
    });
    return this.dispatchEvent(n), !n.defaultPrevented;
  }
  open() {
    var t;
    return this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-open", !0) ? !1 : (this.isOpen = !0, this.clearDragStyles(), this.dialogCoreEl && (this.dialogCoreEl.scrollTop = 0), A.openStack.push(this), this.style.zIndex = String(A.baseZIndex + A.openStack.length), this.setAttribute("sx-open", ""), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "false"), this.previousActiveElement = document.activeElement, this.lockScroll(), this.setInertOnSiblings(!0), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }), !0);
  }
  close() {
    var s;
    if (!this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-close", !0)) return !1;
    this.isOpen = !1, this.handleBackdropPointerLeave();
    const t = A.openStack.indexOf(this);
    return t !== -1 && A.openStack.splice(t, 1), this.style.zIndex = "", this.removeAttribute("sx-open"), (s = this.dialogCoreEl) == null || s.setAttribute("aria-hidden", "true"), this.unlockScroll(), this.setInertOnSiblings(!1), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration), !0;
  }
  get coreElement() {
    return this.dialogCoreEl;
  }
  get dragAxis() {
    return A.DRAG_MAP[this.position].axis;
  }
  get dragSign() {
    return A.DRAG_MAP[this.position].sign;
  }
  beginDrag() {
    this.dialogCoreEl && (this.dialogCoreEl.style.transition = "none");
  }
  updateDrag(t) {
    if (!this.dialogCoreEl) return;
    const s = this.dragAxis === "y" ? "translateY" : "translateX";
    this.dialogCoreEl.style.transform = `${s}(${t}px)`;
  }
  endDrag(t) {
    if (!this.dialogCoreEl) return;
    const s = `${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    if (t) {
      const n = this.dragAxis === "y" ? "translateY" : "translateX", r = (this.dragAxis === "y" ? window.innerHeight : window.innerWidth) * this.dragSign;
      this.dialogCoreEl.style.transition = `transform ${s}, opacity ${s}`, this.dialogCoreEl.style.transform = `${n}(${r}px)`, this.dialogCoreEl.style.opacity = "0", this.close() || (this.dialogCoreEl.style.transform = "", this.dialogCoreEl.style.opacity = "");
    } else
      this.dialogCoreEl.style.transition = `transform ${s}`, this.dialogCoreEl.style.transform = "";
  }
  clearDragStyles() {
    this.dialogCoreEl && (this.dialogCoreEl.style.transition = "", this.dialogCoreEl.style.transform = "", this.dialogCoreEl.style.opacity = "");
  }
  // ✅ Inert background helper
  setInertOnSiblings(t) {
    let s = this.parentElement;
    for (; s && (Array.from(s.children).forEach((n) => {
      n !== this && n !== this.closeCursorEl && !n.contains(this) && (t ? (n.setAttribute("inert", ""), n.setAttribute("aria-hidden", "true")) : (n.removeAttribute("inert"), n.removeAttribute("aria-hidden")));
    }), s.tagName !== "BODY"); )
      s = s.parentElement;
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
    const s = this.getFocusableElements();
    s.length ? s[0].focus() : this.dialogCoreEl && this.dialogCoreEl.focus();
  }
  // ✅ Focus Trap logic (Chặn vòng lặp Tab / Shift+Tab)
  trapFocus(t) {
    const s = this.getFocusableElements();
    if (s.length === 0) {
      t.preventDefault();
      return;
    }
    const n = s[0], r = s[s.length - 1];
    t.shiftKey ? document.activeElement === n && (t.preventDefault(), r.focus()) : document.activeElement === r && (t.preventDefault(), n.focus());
  }
  attachBackdropListeners(t) {
    t.addEventListener("click", this.handleBackdropClick), t.addEventListener("pointermove", this.handleBackdropPointerMove), t.addEventListener("pointerleave", this.handleBackdropPointerLeave);
  }
  detachBackdropListeners(t) {
    t.removeEventListener("click", this.handleBackdropClick), t.removeEventListener("pointermove", this.handleBackdropPointerMove), t.removeEventListener("pointerleave", this.handleBackdropPointerLeave);
  }
  render() {
    this.style.setProperty("--sx-duration", `${this.duration}ms`), this.setAttribute("effect", this.effect), this.setAttribute("position", this.position);
    const t = this.querySelector('[id*="title"], [class*="title"]'), s = this.querySelector('[id*="desc"], [class*="desc"]'), n = t ? `aria-labelledby="${t.id || "sx-dialog-title"}"` : "", r = s ? `aria-describedby="${s.id || "sx-dialog-desc"}"` : "";
    t && !t.id && (t.id = "sx-dialog-title"), s && !s.id && (s.id = "sx-dialog-desc"), this.innerHTML = `
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
    `, this.backdropEl = this.querySelector(".sx-dialog-backdrop"), this.dialogCoreEl = this.querySelector(".sx-dialog-core"), this.backdropEl && this.attachBackdropListeners(this.backdropEl);
  }
};
c(A, "DRAG_MAP", {
  center: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
  right: { axis: "x", sign: 1 },
  "top-left": { axis: "y", sign: -1 },
  "top-right": { axis: "y", sign: -1 },
  "bottom-left": { axis: "y", sign: 1 },
  "bottom-right": { axis: "y", sign: 1 }
}), c(A, "baseZIndex", 9999), c(A, "openStack", []);
let Ft = A;
class Fs extends w {
  constructor() {
    super(...arguments);
    c(this, "dialogEl", null);
    c(this, "observer", null);
    c(this, "syncActiveState", () => {
      var t;
      (t = this.dialogEl) != null && t.hasAttribute("sx-open") ? this.setAttribute("sx-active", "") : this.removeAttribute("sx-active");
    });
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
    this.hasAttribute("role") || this.setAttribute("role", "button"), this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0"), this.addEventListener("click", this.toggleDialog), this.addEventListener("keydown", this.handleKeyDown), this.observeDialog();
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("click", this.toggleDialog), this.removeEventListener("keydown", this.handleKeyDown), (t = this.observer) == null || t.disconnect(), this.observer = null, this.dialogEl = null;
  }
  observeDialog() {
    const t = this.getAttribute("name");
    t && (this.dialogEl = Array.from(document.querySelectorAll("sx-dialog")).find(
      (s) => s.getAttribute("name") === t
    ) ?? null, this.dialogEl && (this.syncActiveState(), this.observer = new MutationObserver(this.syncActiveState), this.observer.observe(this.dialogEl, { attributes: !0, attributeFilter: ["sx-open"] })));
  }
}
class Ns extends w {
  constructor() {
    super(...arguments);
    c(this, "dialogEl", null);
    c(this, "pointerId", null);
    c(this, "startPos", 0);
    c(this, "startTime", 0);
    c(this, "currentOffset", 0);
    c(this, "dragging", !1);
    c(this, "handlePointerDown", (t) => {
      var s;
      this.dialogEl = this.closest("sx-dialog"), (s = this.dialogEl) != null && s.coreElement && (this.pointerId = t.pointerId, this.dragging = !0, this.startTime = performance.now(), this.currentOffset = 0, this.startPos = this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX, this.dialogEl.beginDrag(), this.setPointerCapture(t.pointerId), this.addEventListener("pointermove", this.handlePointerMove), this.addEventListener("pointerup", this.handlePointerEnd), this.addEventListener("pointercancel", this.handlePointerEnd));
    });
    c(this, "handlePointerMove", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      const n = (this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX) - this.startPos, r = this.dialogEl.dragSign;
      this.currentOffset = n * r > 0 ? n : 0, this.dialogEl.updateDrag(this.currentOffset);
    });
    c(this, "handlePointerEnd", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      this.dragging = !1, this.removeEventListener("pointermove", this.handlePointerMove), this.removeEventListener("pointerup", this.handlePointerEnd), this.removeEventListener("pointercancel", this.handlePointerEnd), this.pointerId !== null && this.releasePointerCapture(this.pointerId);
      const s = performance.now() - this.startTime, n = s > 0 ? Math.abs(this.currentOffset) / s : 0, r = this.dialogEl.coreElement.getBoundingClientRect(), o = this.dialogEl.dragAxis === "y" ? r.height : r.width, l = Math.abs(this.currentOffset) > o * this.threshold || n > 0.5;
      this.dialogEl.endDrag(l);
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
class qs extends w {
  constructor() {
    super(...arguments);
    c(this, "dialogEl", null);
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
function Ys() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", Ft), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", Fs), customElements.get("sx-dialog-pull") || customElements.define("sx-dialog-pull", Ns), customElements.get("sx-close-cursor") || customElements.define("sx-close-cursor", qs);
}
function Ws() {
  Ms(), xs(), $s(), Ys();
}
function Xs(e, i) {
  return J(e, i);
}
function Hs(e) {
  return document.getElementById(e);
}
function Vs(e, i) {
  return Array.from((i ?? document).getElementsByClassName(e));
}
function Oe(e, i, t) {
  return t === void 0 ? (s) => Oe(e, i, s) : t < e ? e : t > i ? i : t;
}
function Gs(e, i, t, s) {
  if (Array.isArray(e))
    return e[Math.floor(Math.random() * e.length)];
  const n = e, r = () => {
    const o = n + Math.random() * (i - n);
    return t ? Math.round(o / t) * t : o;
  };
  return s ? r : r();
}
const Us = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayOf: Xs,
  clamp: Oe,
  getByClass: Vs,
  getById: Hs,
  random: Gs
}, Symbol.toStringTag, { value: "Module" }));
console.log(`sixjs v${$e}`);
function Ks(e, i) {
  return i || (typeof e == "string" || e instanceof Element ? e : J(e)[0]);
}
function pe(e, i, t) {
  if (!i) return;
  const s = Ks(e, i.trigger);
  vt.create({ ...i, trigger: s, animation: t });
}
function Ht(e, i, t, s) {
  const { stagger: n, onScroll: r, ...o } = i;
  if (n === void 0) {
    const d = new N(e, o, t, s);
    return K.add(d), pe(e, r, d), d;
  }
  const l = J(e), a = o.delay ?? 0, h = new Z();
  return l.forEach((d, u) => {
    const f = a + ke(u, l.length, n);
    h.add(new N(d, { ...o, delay: f }, t, s), 0);
  }), K.add(h), pe(e, r, h), h;
}
function js(e, i) {
  return Ht(e, i, "to");
}
function Qs(e, i) {
  return Ht(e, i, "from");
}
function Zs(e, i, t) {
  return Ht(e, t, "fromTo", i);
}
function Js(e, i) {
  const t = new N(e, { ...i, duration: 0 });
  return K.add(t), t;
}
function tn(e) {
  const { onScroll: i, ...t } = e ?? {}, s = new Z(t);
  return K.add(s), i && (i.trigger ? vt.create({ ...i, trigger: i.trigger, animation: s }) : console.warn("[six] timeline({ onScroll }) requires an explicit trigger - a Timeline has no target to default to")), s;
}
function en(e) {
  qe(e);
}
const vn = {
  to: js,
  from: Qs,
  fromTo: Zs,
  set: Js,
  timeline: tn,
  config: en,
  context: Fe,
  breakpoint: Qi,
  utils: Us
};
function Cn() {
  Ws();
}
const ge = new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?(\\u{200D}\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)*|.", "gsu");
let It;
function sn() {
  return It === void 0 && (It = typeof Intl < "u" && "Segmenter" in Intl ? new Intl.Segmenter() : null), It;
}
function Pe(e, i) {
  if (!i) return e;
  const t = new Set(e.join("").match(i) ?? []);
  if (!t.size) return e;
  let s = e.length;
  for (; --s > -1; ) {
    const n = e[s];
    for (const r of t)
      if (r.startsWith(n) && r.length > n.length) {
        let o = 0, l = n;
        for (; r.startsWith(l += e[s + ++o]) && l.length < r.length; ) ;
        if (o && l.length === r.length) {
          e[s] = r, e.splice(s + 1, o);
          break;
        }
      }
  }
  return e;
}
function me(e, i) {
  const t = sn();
  if (t) {
    const n = Array.from(t.segment(e), (r) => r.segment);
    return Pe(n, i);
  }
  const s = i ? new RegExp(`${i.source}|${ge.source}`, "gu") : ge;
  return e.match(s) ?? [];
}
function nn(e) {
  if (e)
    return Array.isArray(e) ? new RegExp(`(?:${e.join("|")})`, "gu") : e;
}
const rn = {
  word: "wordsClass",
  char: "charsClass",
  line: "linesClass"
};
function Nt(e, i, t) {
  const s = i[rn[e]], n = i.tag || "div", r = i.aria ?? "auto", o = !!i.propIndex, l = e === "line" ? "block" : "inline-block", a = (h) => {
    const d = document.createElement(n), u = t.length + 1;
    return s && (d.className = `${s} ${s}${u}`), o && d.style.setProperty(`--${e}`, String(u)), r !== "none" && d.setAttribute("aria-hidden", "true"), n !== "span" && (d.style.position = "relative", d.style.display = l), d.textContent = h, t.push(d), d;
  };
  return a.collection = t, a;
}
function be(e) {
  window.getComputedStyle(e).display === "inline" && (e.style.display = "inline-block");
}
function on(e) {
  if (e && typeof e == "object" && !(e instanceof RegExp)) {
    const t = e.replaceWith ?? "";
    return { splitter: e.delimiter, replacement: t, isSpace: t === " " };
  }
  if (e instanceof RegExp)
    return { splitter: e, replacement: "", isSpace: !1 };
  const i = e === "" ? "" : e ?? " ";
  return { splitter: i, replacement: i, isSpace: i === " " };
}
function F(e, i, t) {
  e.insertBefore(typeof i == "string" ? document.createTextNode(i) : i, t);
}
function Re(e, i, t, s, n = !1) {
  var D, tt;
  const { delimiter: r, reduceWhiteSpace: o, prepareText: l, skip: a, onlyChars: h, deepSlice: d, specialCharsRegex: u } = i, { splitter: f, replacement: p, isSpace: g } = r, b = Array.from(e.childNodes), y = e.getBoundingClientRect(), x = !o && window.getComputedStyle(e).whiteSpace.slice(0, 3) === "pre", m = t.collection, C = d && n;
  let v = y, T = null;
  for (let Ct = 0; Ct < b.length; Ct++) {
    const k = b[Ct];
    if (k.nodeType === Node.TEXT_NODE) {
      let S = k.textContent || "";
      o ? S = S.replace(/\s+/g, " ") : x && (S = S.replace(/\n/g, `${p}
`)), l && (S = l(S, e)), k.textContent = S;
      const I = f ? S.split(f) : me(S, u), St = I[I.length - 1] ?? "", ze = g ? !St : St.slice(-1) === " ";
      St || I.pop(), v = y;
      const kt = g ? !I[0] : (I[0] ?? "").charAt(0) === " ";
      kt && F(e, " ", k), I[0] || I.shift(), Pe(I, u), C || (k.textContent = "");
      for (let $ = 1; $ <= I.length; $++) {
        let _ = I[$ - 1];
        if (!o && x && _.charAt(0) === `
`) {
          const M = k.previousSibling;
          M && ((D = M.parentNode) == null || D.removeChild(M)), F(e, document.createElement("br"), k), _ = _.slice(1);
        }
        if (!o && _ === "")
          F(e, p, k);
        else if (_ === " ")
          e.insertBefore(document.createTextNode(" "), k);
        else {
          !g && _.charAt(0) === " " && F(e, " ", k);
          let M;
          if (!!T && $ === 1 && !kt && m.indexOf(T.parentNode) > -1 ? (M = m[m.length - 1], M.appendChild(document.createTextNode(s ? "" : _))) : (M = t(s ? "" : _), F(e, M, k), T && $ === 1 && !kt && M.insertBefore(T, M.firstChild)), s)
            for (const R of me(_, u))
              M.appendChild(R === " " ? document.createTextNode(" ") : s(R));
          if (C) {
            S = S.substring(_.length + 1), k.textContent = S;
            const R = M.getBoundingClientRect();
            if (R.top > v.top && R.left <= v.left) {
              const wt = e.cloneNode(!1);
              let X = e.childNodes[0];
              for (; X && X !== M; ) {
                const Le = X;
                X = X.nextSibling, wt.appendChild(Le);
              }
              (tt = e.parentNode) == null || tt.insertBefore(wt, e), h && be(wt);
            }
            v = R;
          }
          if ($ < I.length || ze) {
            const R = $ >= I.length ? " " : !g && _.slice(-1) === " " ? ` ${p}` : p;
            F(e, R, k);
          }
        }
      }
      e.removeChild(k), T = null;
    } else if (k.nodeType === Node.ELEMENT_NODE) {
      const S = k;
      a.indexOf(S) > -1 ? (m.indexOf(S.previousSibling) > -1 && m[m.length - 1].appendChild(S), T = S) : (Re(S, i, t, s, !0), T = null), h && be(S);
    }
  }
}
const xt = { left: 0, top: 0, width: 0, height: 0 };
function an(e, i) {
  let t = i;
  for (; ++t < e.length && e[t] === xt; ) ;
  return e[t] ?? xt;
}
function ln(e, i, t, s) {
  const n = Nt("line", t, s), r = window.getComputedStyle(e).textAlign || "left";
  return (o, l) => {
    const a = n("");
    a.style.textAlign = r, e.insertBefore(a, i[o]);
    for (let h = o; h < l; h++) a.appendChild(i[h]);
    a.normalize();
  };
}
function hn(e, i, t) {
  const s = Array.from(e.childNodes), n = ln(e, s, i, t), r = [], o = s.map((d) => d.nodeType === Node.ELEMENT_NODE ? d.getBoundingClientRect() : xt);
  let l = 0, a = xt, h = 0;
  for (; h < s.length; h++) {
    const d = s[h];
    if (d.nodeType === Node.ELEMENT_NODE)
      if (d.nodeName === "BR")
        (!h || s[h - 1].nodeName !== "BR") && (r.push(d), n(l, h + 1)), l = h + 1, a = an(o, h);
      else {
        const u = o[h];
        h && u.top > a.top && u.left < a.left + a.width - 1 && (n(l, h), l = h), a = u;
      }
  }
  l < h && n(l, h), r.forEach((d) => {
    var u;
    return (u = d.parentNode) == null ? void 0 : u.removeChild(d);
  });
}
function cn(e) {
  return e.map((i) => {
    const t = i.cloneNode(!1);
    return i.replaceWith(t), t.appendChild(i), i.className && (t.className = i.className.trim().split(/\s+/).map((s) => `${s}-mask`).join(" ")), t.style.overflow = "clip", t;
  });
}
function dn(e, i) {
  const t = /* @__PURE__ */ new Map();
  let s;
  const n = () => {
    for (const a of e) {
      const h = a.offsetWidth;
      if (t.get(a) !== h) {
        t.set(a, h), i();
        return;
      }
    }
  }, r = typeof ResizeObserver < "u" ? new ResizeObserver(() => {
    clearTimeout(s), s = setTimeout(n, 200);
  }) : void 0;
  e.forEach((a) => {
    t.set(a, a.offsetWidth), r == null || r.observe(a);
  });
  const o = () => i(), l = typeof document < "u" ? document.fonts : void 0;
  return l == null || l.addEventListener("loadingdone", o), {
    disconnect() {
      clearTimeout(s), r == null || r.disconnect(), l == null || l.removeEventListener("loadingdone", o);
    }
  };
}
const ht = /* @__PURE__ */ new WeakMap();
function ye(e) {
  return e ? typeof e == "string" ? Array.from(document.querySelectorAll(e)) : e instanceof Element ? [e] : Array.from(e).filter((i) => i instanceof HTMLElement) : [];
}
function un(e) {
  return Array.isArray(e) ? e.join(",") : e;
}
function fn(e) {
  const i = un(e);
  return {
    chars: i.includes("chars"),
    words: i.includes("words"),
    lines: i.includes("lines")
  };
}
function pn(e, i, t, s) {
  const n = i === !0 ? t ? "lines" : s ? "words" : "chars" : i;
  return n === "lines" ? e.lines : n === "words" ? e.words : e.chars;
}
function gn(e, i, t) {
  for (const s of e) {
    const n = s.nextSibling;
    if (t || !n || n.nodeType !== Node.TEXT_NODE)
      if (i) {
        const r = document.createElement("span");
        for (r.style.whiteSpace = "nowrap"; s.firstChild; ) r.appendChild(s.firstChild);
        s.replaceWith(r);
      } else
        s.replaceWith(...s.childNodes);
    else
      n.textContent = (s.textContent || "") + (n.textContent || ""), s.remove();
  }
}
function mn(e) {
  e.element.innerHTML = e.html, e.ariaLabel !== null ? e.element.setAttribute("aria-label", e.ariaLabel) : e.element.removeAttribute("aria-label"), e.ariaHidden !== null ? e.element.setAttribute("aria-hidden", e.ariaHidden) : e.element.removeAttribute("aria-hidden");
}
class bn {
  constructor(i, t = {}) {
    c(this, "elements");
    c(this, "chars", []);
    c(this, "words", []);
    c(this, "lines", []);
    c(this, "masks", []);
    c(this, "isSplit", !1);
    c(this, "vars");
    c(this, "originals", []);
    c(this, "resplitHandle", null);
    c(this, "dead", !1);
    var s;
    this.elements = ye(i), this.vars = t, this.elements.forEach((n) => {
      var r;
      (r = ht.get(n)) == null || r.kill(), ht.set(n, this);
    }), (s = qt()) == null || s._capture(this), this.split(t);
  }
  split(i = this.vars) {
    if (this.dead) throw new Error("[six] cannot split() a killed splitText()");
    this.isSplit && this.revert(), this.vars = i;
    const { type: t = "chars,words,lines", aria: s = "auto", overflow: n, skip: r, wordDelimiter: o, reduceWhiteSpace: l = !0, specialChars: a, onSplit: h } = i, { chars: d, words: u, lines: f } = fn(t);
    if (!d && !u && !f) return this;
    const p = d && !u && !f, g = nn(a), b = ye(r), y = on(o), x = {
      tag: i.tag,
      aria: s,
      propIndex: i.propIndex,
      wordsClass: i.wordsClass,
      charsClass: i.charsClass,
      linesClass: i.linesClass
    };
    return this.elements.forEach((m) => {
      this.originals.push({
        element: m,
        html: m.innerHTML,
        ariaLabel: m.getAttribute("aria-label"),
        ariaHidden: m.getAttribute("aria-hidden")
      }), s === "auto" ? m.setAttribute("aria-label", (m.textContent || "").trim()) : s === "hidden" && m.setAttribute("aria-hidden", "true");
      const C = [], v = [], T = [], D = d ? Nt("char", x, C) : null, tt = Nt("word", x, v);
      Re(
        m,
        {
          delimiter: y,
          reduceWhiteSpace: l,
          prepareText: i.prepareText,
          skip: b,
          onlyChars: p,
          deepSlice: f || p,
          specialCharsRegex: g
        },
        tt,
        D
      ), f && hn(m, x, T), u || (gn(v, !!i.smartWrap && !f, d), v.length = 0, m.normalize()), this.lines.push(...T), this.words.push(...v), this.chars.push(...C);
    }), n && this.masks.push(...cn(pn(this, n, f, u))), this.isSplit = !0, f && (this.resplitHandle = dn(this.elements, () => {
      this.isSplit && this.split(this.vars);
    })), h == null || h(this), this;
  }
  revert() {
    var i, t, s;
    return this.isSplit ? ((i = this.resplitHandle) == null || i.disconnect(), this.resplitHandle = null, this.originals.forEach(mn), this.elements.forEach((n) => {
      ht.get(n) === this && ht.delete(n);
    }), this.chars.length = 0, this.words.length = 0, this.lines.length = 0, this.masks.length = 0, this.originals.length = 0, this.isSplit = !1, (s = (t = this.vars).onRevert) == null || s.call(t, this), this) : this;
  }
  kill() {
    this.dead || (this.dead = !0, this.revert());
  }
}
function Sn(e, i) {
  return new bn(e, i);
}
export {
  vt as OnScroll,
  bn as SplitText,
  $e as VERSION,
  Cn as enableElements,
  vn as six,
  Sn as splitText
};
