var ce = Object.defineProperty;
var de = (e, i, t) => i in e ? ce(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var l = (e, i, t) => de(e, typeof i != "symbol" ? i + "" : i, t);
const ue = "0.0.33";
function jt(e, i, t) {
  return i < 0 ? 1 / 0 : e * (i + 1) + t * i;
}
function Tt(e, i, t, s, n) {
  if (i <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (t === 0)
    return { iteration: 0, time: e < 0 ? 0 : e > i ? i : e, reversed: !1 };
  const r = i + s, o = jt(i, t, s);
  let h = e;
  h < 0 ? h = 0 : t >= 0 && h > o && (h = o);
  let a = Math.floor(h / r), c = h - a * r;
  s === 0 && a > 0 && c === 0 && (a -= 1, c = i), t >= 0 && a > t && (a = t, c = h - a * r), c > i && (c = i);
  const u = n && a % 2 === 1;
  return u && (c = i - c), { iteration: a, time: c, reversed: u };
}
let Q = null;
function Qt() {
  return Q;
}
class Zt {
  constructor(i) {
    l(this, "captured", /* @__PURE__ */ new Set());
    l(this, "dead", !1);
    i && this.run(i);
  }
  run(i) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const t = Q;
    Q = this;
    try {
      return i(this);
    } finally {
      Q = t;
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
function fe(e) {
  return new Zt(e);
}
let pe = 0;
class Jt {
  constructor(i = {}) {
    l(this, "id", ++pe);
    l(this, "parent", null);
    /** Kept after removal from `parent` (the "detached parent") so time queries made after removal still resolve. */
    l(this, "_dp", null);
    l(this, "_next", null);
    l(this, "_prev", null);
    l(this, "_start", 0);
    l(this, "_dur", 0);
    l(this, "_tDur", 0);
    l(this, "_time", 0);
    l(this, "_tTime", 0);
    /** Functional speed - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
    l(this, "_ts", 1);
    /** Recorded/user speed - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
    l(this, "_rts", 1);
    l(this, "_delay");
    l(this, "_repeat");
    l(this, "_repeatDelay");
    l(this, "_boomerang");
    l(this, "_initted", !1);
    l(this, "_dirty", !0);
    l(this, "_hasStarted", !1);
    /** Raw (pre-clamp) totalTime from the previous render() call - see the zero-duration handling in render(). */
    l(this, "_rawPrev", -1);
    l(this, "listeners", {});
    var t;
    (t = Qt()) == null || t._capture(this), this._delay = Math.max(0, i.delay ?? 0), this._repeat = i.repeat ?? 0, this._repeatDelay = Math.max(0, i.repeatDelay ?? 0), this._boomerang = i.boomerang ?? !1, i.onStart && this.on("start", i.onStart), i.onUpdate && this.on("update", i.onUpdate), i.onComplete && this.on("complete", i.onComplete), i.onRepeat && this.on("repeat", i.onRepeat), i.onReverseComplete && this.on("reverseComplete", i.onReverseComplete), i.paused && (this._ts = 0);
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
    const h = !this._initted;
    h && (this._initted = !0, this._onInit());
    const a = Tt(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), c = h ? a : Tt(n - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), u = a.iteration !== c.iteration;
    this._tTime = o, this._time = a.time, this._renderIteration(a.time, a.reversed, a.iteration, t, s || u);
    const d = this._rawPrev;
    if (this._rawPrev = i, t) return;
    const f = r === 0, p = f ? i < 0 : o <= 0, g = f ? i >= 0 : this._repeat >= 0 && o >= r, m = f ? d < 0 : n <= 0, y = f ? d >= 0 : this._repeat >= 0 && n >= r, x = f ? i > d : o > n, b = f ? i < d : o < n;
    !this._hasStarted && !p && (this._hasStarted = !0, this.emit("start")), x && u && this.emit("repeat"), this.emit("update"), x && !y && g ? this.emit("complete") : b && !m && p && this.emit("reverseComplete");
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
    this._tDur = this._delay + jt(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
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
let dt = { duration: 0.8, ease: "none" };
function ge(e) {
  dt = { ...dt, ...e };
}
function me() {
  return dt;
}
function X(e) {
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
const L = 1.70158, H = L * 1.525, Mt = 2 * Math.PI / 3, It = 2 * Math.PI / 4.5, Z = {
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
  backIn: (e) => (L + 1) * e * e * e - L * e * e,
  backOut: (e) => {
    const i = e - 1;
    return 1 + (L + 1) * i * i * i + L * i * i;
  },
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((H + 1) * t - H) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((H + 1) * i + H) + 2) / 2;
  },
  bounceIn: (e) => 1 - X(1 - e),
  bounceOut: X,
  bounceInOut: (e) => e < 0.5 ? (1 - X(1 - 2 * e)) / 2 : (1 + X(2 * e - 1)) / 2,
  elasticIn: (e) => e === 0 || e === 1 ? e : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * Mt),
  elasticOut: (e) => e === 0 || e === 1 ? e : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * Mt) + 1,
  elasticInOut: (e) => e === 0 || e === 1 ? e : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * It)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * It) / 2 + 1,
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
function be(e) {
  return typeof e == "function" ? e : e && Z[e] ? Z[e] : Z.quadOut;
}
const ye = /^#([0-9a-f]{3,8})$/i, xe = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, ve = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, Ce = {
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
function Se(e) {
  return Ce[e.toLowerCase()] ?? null;
}
function T(e, i, t) {
  const s = t === 1 ? e[i] + e[i] : e.slice(i, i + 2);
  return parseInt(s, 16);
}
function tt(e) {
  const i = e.trim(), t = i.match(ye);
  if (t) {
    const n = t[1];
    if (n.length === 3 || n.length === 4) {
      const r = n.length === 4 ? T(n, 3, 1) / 255 : 1;
      return { r: T(n, 0, 1), g: T(n, 1, 1), b: T(n, 2, 1), a: r };
    }
    if (n.length === 6 || n.length === 8) {
      const r = n.length === 8 ? T(n, 6, 2) / 255 : 1;
      return { r: T(n, 0, 2), g: T(n, 2, 2), b: T(n, 4, 2), a: r };
    }
  }
  const s = i.match(xe) ?? i.match(ve);
  if (s) {
    const [, n, r, o, h] = s;
    return {
      r: parseFloat(n),
      g: parseFloat(r),
      b: parseFloat(o),
      a: h === void 0 ? 1 : h.endsWith("%") ? parseFloat(h) / 100 : parseFloat(h)
    };
  }
  if (/^[a-z]+$/i.test(i)) {
    const n = Se(i);
    if (n) return { r: n[0], g: n[1], b: n[2], a: i.toLowerCase() === "transparent" ? 0 : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function te(e, i, t) {
  return {
    r: Math.round(e.r + (i.r - e.r) * t),
    g: Math.round(e.g + (i.g - e.g) * t),
    b: Math.round(e.b + (i.b - e.b) * t),
    a: Math.round((e.a + (i.a - e.a) * t) * 1e3) / 1e3
  };
}
function ut(e) {
  return `rgba(${e.r}, ${e.g}, ${e.b}, ${e.a})`;
}
const ke = {
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
}, _t = /* @__PURE__ */ new WeakMap(), we = /^matrix\(([^)]+)\)$/, Ae = /^matrix3d\(([^)]+)\)$/, Pt = 180 / Math.PI;
function Ee(e) {
  if (!e || e === "none") return {};
  const i = e.match(we);
  if (i) {
    const [s, n, r, o, h, a] = i[1].split(",").map(Number), c = Math.sqrt(s * s + n * n), u = Math.sqrt(r * r + o * o), d = Math.atan2(n, s) * Pt, f = (Math.atan2(r, o) * Pt + d) * -1;
    return { x: h, y: a, rotation: d, scaleX: c, scaleY: u, skewX: Me(f) };
  }
  const t = e.match(Ae);
  if (t) {
    const s = t[1].split(",").map(Number);
    return { x: s[12], y: s[13], z: s[14] };
  }
  return {};
}
function Te(e) {
  return typeof getComputedStyle > "u" ? {} : Ee(getComputedStyle(e).transform);
}
function Me(e) {
  let i = e % 360;
  return i > 180 && (i -= 360), i < -180 && (i += 360), i;
}
function et(e) {
  let i = _t.get(e);
  return i || (i = { ...ke, ...Te(e) }, _t.set(e, i)), i;
}
function S(e) {
  return Math.round(e * 1e4) / 1e4;
}
function Ie(e, i) {
  const t = [];
  return (e.xPercent || e.yPercent) && t.push(`translate(${S(e.xPercent)}%, ${S(e.yPercent)}%)`), (e.x || e.y || e.z) && t.push(
    i || e.z ? `translate3d(${S(e.x)}px, ${S(e.y)}px, ${S(e.z)}px)` : `translate(${S(e.x)}px, ${S(e.y)}px)`
  ), e.rotation && t.push(`rotate(${S(e.rotation)}deg)`), e.rotationX && t.push(`rotateX(${S(e.rotationX)}deg)`), e.rotationY && t.push(`rotateY(${S(e.rotationY)}deg)`), e.skewX && t.push(`skewX(${S(e.skewX)}deg)`), e.skewY && t.push(`skewY(${S(e.skewY)}deg)`), (e.scaleX !== 1 || e.scaleY !== 1) && t.push(`scale(${S(e.scaleX)}, ${S(e.scaleY)})`), t.length ? t.join(" ") : "none";
}
function _e(e, i, t) {
  e.style.transform = Ie(i, t);
}
const Pe = {
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
}, Ot = { x: "xPercent", y: "yPercent" };
function Oe(e) {
  return typeof e == "string" && /%\s*$/.test(e.trim());
}
function ze(e, i) {
  return Oe(i) && e in Ot ? Ot[e] : Pe[e];
}
const Re = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), Le = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), De = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), Be = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), $e = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
function O(e) {
  if (typeof e == "number") return !0;
  if (typeof e != "string") return !1;
  const i = e.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(i) || /^[+-]=/.test(i);
}
function B(e, i = "") {
  if (typeof e == "number") return { value: e, unit: i };
  const t = String(e).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  return t ? { value: parseFloat(t[1]), unit: t[2] || i } : { value: 0, unit: i };
}
function it(e, i) {
  var s;
  const t = (s = e.style) == null ? void 0 : s[i];
  return t || (typeof getComputedStyle > "u" ? "" : getComputedStyle(e)[i] || "");
}
function Fe(e) {
  const i = Re.has(e) ? "deg" : Le.has(e) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: e,
    defaultUnit: i,
    get(t) {
      return { value: et(t)[e], unit: i };
    },
    set(t, s) {
      et(t)[e] = s.value;
    }
  };
}
function qe(e) {
  return {
    kind: "color",
    get(i) {
      return tt(it(i, e) || "rgba(0,0,0,0)");
    },
    set(i, t) {
      i.style[e] = ut(t);
    }
  };
}
function Ye(e) {
  return {
    kind: "complex",
    get(i) {
      return it(i, e);
    },
    set(i, t) {
      i.style[e] = t;
    }
  };
}
function Ne(e, i) {
  const t = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(e).trim() : "";
  return O(i) || O(t) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return B(getComputedStyle(s).getPropertyValue(e).trim());
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
function Xe(e, i) {
  const t = $e.has(e) ? "" : "px";
  return O(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: t,
    get(s) {
      const n = it(s, e);
      return O(n) ? B(n, t) : { value: 0, unit: t };
    },
    set(s, n) {
      s.style[e] = t === "" ? `${n.value}` : `${n.value}${n.unit}`;
    }
  } : {
    kind: "discrete",
    get(s) {
      return it(s, e);
    },
    set(s, n) {
      s.style[e] = n;
    }
  };
}
function He(e, i) {
  return O(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return B(s.getAttribute(e) ?? "0");
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
function zt(e, i) {
  return O(i) ? {
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
function Ve(e, i, t) {
  const s = ze(i, t);
  if (s) return Fe(s);
  if (De.has(i)) return qe(i);
  if (Be.has(i)) return Ye(i);
  if (i.startsWith("--")) return Ne(i, t);
  const n = e.style;
  return n && i in n ? Xe(i, t) : i in e && typeof e[i] == "number" ? zt(i, t ?? e[i]) : typeof e.setAttribute == "function" ? He(i, t) : zt(i, t);
}
const We = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function Ue(e) {
  if (e[0] === "#" || /^(rgba?|hsla?)\(/i.test(e))
    return { type: "color", value: tt(e) };
  const i = e.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(i[1]), unit: i[2] };
}
function st(e) {
  const i = [], t = [];
  let s = 0;
  for (const n of e.matchAll(We))
    t.push(e.slice(s, n.index)), i.push(Ue(n[0])), s = n.index + n[0].length;
  return t.push(e.slice(s)), { literals: t, tokens: i };
}
function Ge(e, i) {
  const t = st(e).tokens, s = st(i).tokens;
  return t.length === s.length && t.every((n, r) => n.type === s[r].type);
}
function Ke(e, i, t) {
  if (!e || e.type !== i.type) {
    const o = t >= 1 ? i : e ?? i;
    return o.type === "color" ? ut(o.value) : `${o.value}${o.unit}`;
  }
  if (i.type === "color")
    return ut(te(e.value, i.value, t));
  const s = e.value, n = s + (i.value - s) * t, r = i.unit || e.unit;
  return `${Math.round(n * 1e4) / 1e4}${r}`;
}
function je(e, i, t) {
  const s = st(e), n = st(i);
  let r = "";
  for (let o = 0; o < n.literals.length; o++)
    r += n.literals[o], o < n.tokens.length && (r += Ke(s.tokens[o], n.tokens[o], t));
  return r;
}
const Qe = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function Ze(e) {
  return Qe.test(e);
}
function Rt(e, i, t, s) {
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
    const r = Ze(i) ? n.clientWidth : n.clientHeight;
    return t / 100 * r;
  }
  return t;
}
const Lt = /* @__PURE__ */ new Set([
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
]), ft = /^([+\-*/])=(-?[\d.]+)$/;
function Dt(e, i) {
  const t = i.match(ft);
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
function Je(e, i) {
  const t = /* @__PURE__ */ new Set();
  for (const s in e) Lt.has(s) || t.add(s);
  if (i)
    for (const s in i) Lt.has(s) || t.add(s);
  return [...t];
}
function ti(e, i, t, s, n) {
  const r = t.get(e);
  let o, h;
  if (s === void 0)
    o = r.value, h = r.unit || t.defaultUnit;
  else if (typeof s == "string" && ft.test(s))
    o = Dt(r.value, s), h = r.unit || t.defaultUnit;
  else {
    const u = B(s, t.defaultUnit);
    o = u.value, h = u.unit;
  }
  let a, c;
  if (n === void 0)
    a = r.value, c = r.unit || t.defaultUnit;
  else if (typeof n == "string" && ft.test(n))
    a = Dt(o, n), c = h;
  else {
    const u = B(n, t.defaultUnit);
    a = u.value, c = u.unit;
  }
  return !t.isTransform && c !== h && (o = Rt(e, i, o, h), a = Rt(e, i, a, c), h = "px", c = "px"), { kind: "numeric", target: e, prop: i, isTransform: t.isTransform, handler: t, start: o, change: a - o, unit: c };
}
function ei(e, i, t, s, n) {
  const r = s !== void 0 ? tt(String(s)) : t.get(e), o = n !== void 0 ? tt(String(n)) : t.get(e);
  return { kind: "color", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function ii(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return Ge(r, o) ? { kind: "complex", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o } : { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function si(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function ni(e, i, t, s, n) {
  return t.kind === "numeric" ? ti(e, i, t, s, n) : t.kind === "color" ? ei(e, i, t, s, n) : t.kind === "complex" ? ii(e, i, t, s, n) : si(e, i, t, s, n);
}
const ri = { scale: ["scaleX", "scaleY"] };
function oi(e, i, t, s) {
  const n = Je(i, s), r = [];
  for (const o of e)
    for (const h of n) {
      let a, c;
      t === "to" ? c = i[h] : t === "from" ? a = i[h] : (c = h in i ? i[h] : void 0, a = s && h in s ? s[h] : void 0);
      for (const u of ri[h] ?? [h]) {
        const d = Ve(o, u, c ?? a);
        r.push(ni(o, u, d, a, c));
      }
    }
  return r;
}
function ai(e) {
  return Math.round(e * 1e4) / 1e4;
}
function li(e, i) {
  switch (e.kind) {
    case "numeric": {
      const t = ai(e.start + e.change * i);
      e.isTransform ? et(e.target)[e.handler.transformKey] = t : e.handler.set(e.target, { value: t, unit: e.unit });
      return;
    }
    case "color":
      e.handler.set(e.target, te(e.start, e.end, i));
      return;
    case "complex":
      e.handler.set(e.target, je(e.start, e.end, i));
      return;
    case "discrete":
      e.handler.set(e.target, i >= 1 ? e.end : e.start);
      return;
  }
}
function hi(e, i, t) {
  const s = t(i);
  let n = e.last();
  for (; n && t(n) > s; )
    n = n._prev;
  n ? (i._prev = n, i._next = n._next, n._next ? n._next._prev = i : e.setLast(i), n._next = i) : (i._prev = null, i._next = e.first(), i._next ? i._next._prev = i : e.setLast(i), e.setFirst(i));
}
function ci(e, i) {
  i._prev ? i._prev._next = i._next : e.first() === i && e.setFirst(i._next), i._next ? i._next._prev = i._prev : e.last() === i && e.setLast(i._prev), i._next = null, i._prev = null;
}
function* V(e) {
  let i = e.first();
  for (; i; ) {
    const t = i._next;
    yield i, i = t;
  }
}
function W(e, i) {
  if (!e || i === void 0) return 0;
  const t = parseFloat(i);
  return e === "-" ? -t : t;
}
const di = /^<(?:([+-])=([\d.]+))?$/, ui = /^>(?:([+-])=([\d.]+))?$/, fi = /^([+-])=([\d.]+)$/, pi = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function gi(e, i) {
  if (e === void 0) return i.end;
  if (typeof e == "number") return Math.max(0, e);
  const t = e.trim();
  let s = t.match(di);
  if (s) return Math.max(0, i.prevStart + W(s[1], s[2]));
  if (s = t.match(ui), s) return Math.max(0, i.prevEnd + W(s[1], s[2]));
  if (s = t.match(fi), s) return Math.max(0, i.end + W(s[1], s[2]));
  if (s = t.match(pi), s) {
    const [, n, r, o] = s, h = i.getLabel(n);
    return h === void 0 ? (console.warn(`[six] timeline: unknown label "${n}", appending at the current end`), i.end) : Math.max(0, h + W(r, o));
  }
  return console.warn(`[six] timeline: invalid position "${e}", appending at the current end`), i.end;
}
function ee(e, i, t) {
  if (typeof t == "number") return e * t;
  const { each: s, from: n = "start" } = t;
  let r;
  return n === "start" ? r = e : n === "end" ? r = i - 1 - e : n === "center" ? r = Math.abs(e - (i - 1) / 2) : r = Math.abs(e - n), r * s;
}
function ie(e, i) {
  const t = i.speed(), s = i.totalDuration();
  return (e - i.startTime()) * t + (t >= 0 ? 0 : s);
}
function se(e) {
  const i = e.parent;
  return i instanceof Y ? ie(se(i), e) : e.totalTime();
}
class Y extends Jt {
  constructor(t = {}) {
    super(t);
    l(this, "_firstChild", null);
    l(this, "_lastChild", null);
    l(this, "_cursor", 0);
    l(this, "_lastAdded", null);
    l(this, "_lastRenderedLocal", 0);
    l(this, "_labels", /* @__PURE__ */ new Map());
    l(this, "_defaultPositionMode");
    l(this, "_unbounded");
    l(this, "_childDefaults");
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
    return gi(t, this.positionContext());
  }
  add(t, s) {
    var r;
    (r = t.parent) == null || r._removeChild(t);
    const n = this.resolvePosition(s);
    return t.parent = this, t.startTime(n), hi(this, t, (o) => o.startTime()), this._cursor = Math.max(this._cursor, n + t.totalDuration()), this._lastAdded = t, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, n), this._uncache(), this;
  }
  remove(t) {
    return t.parent === this && (ci(this, t), t.parent = null, this._uncache()), this;
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
    const s = se(this);
    if (s < t.startTime()) return;
    const n = t.totalTime(), r = t.speed(), o = t.totalDuration(), h = r >= 0 ? 0 : o;
    t.startTime(s - (n - h) / r);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const t of V(this))
      t.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...V(this)];
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
    const { stagger: h, ...a } = s, c = { ...this._childDefaults, ...a };
    if (h === void 0)
      return this.add(new _(t, c, n, r), o), this;
    const u = N(t), d = this.resolvePosition(o), f = c.delay ?? 0;
    return u.forEach((p, g) => {
      const m = ee(g, u.length, h);
      this.add(new _(p, { ...c, delay: f + m }, n, r), d);
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
    return this.add(new _(null, { duration: 0, onStart: t }), s), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let t = 0;
    for (const s of V(this)) {
      const n = s.endTime();
      n > t && (t = n);
    }
    this._dur = t, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(t, s, n, r, o) {
    const h = Math.min(this._lastRenderedLocal, t), a = Math.max(this._lastRenderedLocal, t);
    this._lastRenderedLocal = t;
    for (const c of V(this)) {
      if (c.paused()) continue;
      const u = c.startTime();
      c.endTime() < h || u > a || c.totalDuration() === 0 && u <= h || c.render(ie(t, c), r, o);
    }
  }
}
function mi(e) {
  return !Array.isArray(e);
}
function bi(e, i, t) {
  const s = e.filter((o) => o.duration === void 0).length, n = e.reduce((o, h) => o + (h.duration ?? 0), 0), r = i !== void 0 ? s > 0 ? Math.max(0, i - n) / s : 0 : t;
  return e.map((o) => {
    const { duration: h, ease: a, ...c } = o;
    return { duration: h ?? r, ease: a, props: c };
  });
}
function yi(e, i, t) {
  const s = Object.entries(e).map(([r, o]) => {
    const h = r.trim().match(/^(-?[\d.]+)%$/);
    return h ? { pos: parseFloat(h[1]) / 100, props: o } : (console.warn(`[six] keyframes: invalid position "${r}", expected e.g. "50%"`), null);
  }).filter((r) => r !== null).sort((r, o) => r.pos - o.pos), n = [];
  for (let r = 0; r < s.length; r++) {
    const o = r === 0 ? 0 : s[r - 1].pos, { ease: h, ...a } = s[r].props;
    n.push({ duration: Math.max(0, (s[r].pos - o) * i), ease: h ?? t, props: a });
  }
  return n;
}
function xi(e, i) {
  const t = i.keyframes, s = mi(t) ? yi(t, i.duration ?? 0.5, i.ease) : bi(t, i.duration, i.duration ?? 0.5), n = new Y(), r = {};
  for (const o of s) {
    const h = {};
    for (const a in o.props)
      a in r && (h[a] = r[a]);
    n.fromTo(e, h, { ...o.props, duration: o.duration, ease: o.ease ?? i.ease }), Object.assign(r, o.props);
  }
  return n;
}
const Bt = /* @__PURE__ */ new WeakMap();
function vi(e) {
  let i = Bt.get(e);
  return i || (i = /* @__PURE__ */ new Map(), Bt.set(e, i)), i;
}
function Ci(e, i, t) {
  const s = /* @__PURE__ */ new Set();
  for (const n of t) {
    const r = vi(n.target), o = r.get(n.prop);
    i && o && o !== e && (i === !0 ? s.add(o) : o._dropTrack(n.target, n.prop)), r.set(n.prop, e);
  }
  for (const n of s) n.kill();
}
function N(e, i) {
  if (e == null) return [];
  if (typeof e == "string") {
    const t = Array.from((i ?? document).querySelectorAll(e));
    return t.length === 0 && console.warn(`[six] no elements matched selector "${e}"`), t;
  }
  return e instanceof Element ? [e] : Array.from(e).filter((t) => t instanceof Element);
}
class _ extends Jt {
  constructor(t, s, n = "to", r) {
    super(s);
    l(this, "targets");
    l(this, "mode");
    l(this, "rawVars");
    l(this, "rawFromVars");
    l(this, "ease");
    l(this, "tracks", []);
    l(this, "keyframeTimeline", null);
    const o = me();
    this.targets = N(t), this.mode = n, this.rawVars = s, this.rawFromVars = r, this.ease = be(s.ease ?? o.ease), s.keyframes ? (this.keyframeTimeline = xi(this.targets, s), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(s.duration ?? o.duration), this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = oi(this.targets, this.rawVars, this.mode, this.rawFromVars), Ci(this, this.rawVars.overwrite, this.tracks));
  }
  _dropTrack(t, s) {
    this.tracks = this.tracks.filter((n) => n.target !== t || n.prop !== s), this.tracks.length === 0 && this.kill();
  }
  _renderIteration(t) {
    if (this.keyframeTimeline) {
      this.keyframeTimeline.render(t, !0, !0);
      return;
    }
    const s = this.duration(), n = s ? t / s : 1, r = this.ease(n), o = n > 0 && n < 1, h = /* @__PURE__ */ new Set();
    for (const a of this.tracks)
      li(a, r), a.isTransform && h.add(a.target);
    for (const a of h)
      _e(a, et(a), o);
  }
}
const U = () => typeof performance < "u" ? performance.now() : Date.now();
class Si {
  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(i = {}) {
    l(this, "listeners", []);
    l(this, "i", 0);
    // live cursor into `listeners` during dispatch, adjusted by remove()
    l(this, "frame", 0);
    l(this, "timeMs", 0);
    l(this, "deltaMs", 0);
    l(this, "startTime", U());
    l(this, "lastUpdate", this.startTime);
    l(this, "lagThreshold", 500);
    l(this, "adjustedLag", 33);
    l(this, "gap", 1e3 / 240);
    l(this, "nextTime", this.gap);
    l(this, "rafId", null);
    l(this, "manual");
    l(this, "loop", () => {
      this.manual || (this.advance(U() - this.lastUpdate), this.rafId !== null && (this.rafId = this.request(this.loop)));
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
    const i = U();
    this.startTime = i - this.timeMs * 1e3, this.lastUpdate = i, this.rafId = this.request(this.loop);
  }
  sleep() {
    this.rafId !== null && (this.cancel(this.rafId), this.rafId = null);
  }
  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(i = 1e3 / 60) {
    this.frame++, this.deltaMs = i, this.timeMs += i / 1e3, this.lastUpdate = U(), this.startTime = this.lastUpdate - this.timeMs * 1e3, this.nextTime = this.timeMs * 1e3 + this.gap, this.dispatch();
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
const A = new Si(), $ = new Y({ unbounded: !0, defaultPosition: "now" });
A.add((e) => $.render(e));
class ki extends Zt {
  constructor() {
    super(...arguments);
    l(this, "matches", {});
  }
}
class wi {
  constructor() {
    l(this, "entries", []);
    l(this, "dead", !1);
    var i;
    (i = Qt()) == null || i._capture(this);
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
    const s = typeof i == "string", n = s ? { matches: i } : i, r = new ki(), o = {};
    let h = !1;
    const a = () => {
      let d = !1, f = !1;
      for (const p in n) {
        const g = window.matchMedia(n[p]).matches;
        g && (d = !0), o[p] !== g && (o[p] = g, f = !0);
      }
      f && (r.revert(), d && (r.matches = s ? {} : { ...o }, this._run(r, t)));
    }, c = () => {
      h || (h = !0, queueMicrotask(() => {
        h = !1, a();
      }));
    }, u = Object.keys(n).map((d) => window.matchMedia(n[d]));
    return u.forEach((d) => d.addEventListener("change", c)), this.entries.push({
      ctx: r,
      detach: () => u.forEach((d) => d.removeEventListener("change", c)),
      reset: () => {
        for (const d in o) delete o[d];
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
function Ai(e, i) {
  const t = new wi();
  return e !== void 0 && i !== void 0 && t.add(e, i), t;
}
let pt = 0;
function ne() {
  pt++;
}
const Ei = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function Ti(e, i) {
  if (e === window) return i === "y" ? window.scrollY : window.scrollX;
  const t = e;
  return i === "y" ? t.scrollTop : t.scrollLeft;
}
function at(e, i = "y") {
  const t = Ei[i], s = t.get(e);
  if (s && s.gen === pt) return s.value;
  const n = Ti(e, i);
  return t.set(e, { gen: pt, value: n }), n;
}
function lt(e, i = "y") {
  var s, n;
  if (e === window)
    return i === "y" ? ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight : ((n = window.visualViewport) == null ? void 0 : n.width) ?? window.innerWidth;
  const t = e;
  return i === "y" ? t.clientHeight : t.clientWidth;
}
const nt = /* @__PURE__ */ new Map(), gt = /* @__PURE__ */ new Map();
function Mi(e, i) {
  let t = nt.get(e);
  if (!t) {
    t = /* @__PURE__ */ new Set(), nt.set(e, t);
    const s = () => {
      ne(), t.forEach((n) => n());
    };
    gt.set(e, s), e.addEventListener("scroll", s, { passive: !0 });
  }
  t.add(i);
}
function Ii(e, i) {
  const t = nt.get(e);
  if (t && (t.delete(i), t.size === 0)) {
    const s = gt.get(e);
    s && e.removeEventListener("scroll", s), gt.delete(e), nt.delete(e);
  }
}
const Ct = /* @__PURE__ */ new Set();
let $t = !1;
function Ft() {
  ne(), Ct.forEach((e) => e());
}
function _i(e) {
  Ct.add(e), !$t && typeof window < "u" && ($t = !0, window.addEventListener("resize", Ft), typeof document < "u" && document.readyState !== "complete" && window.addEventListener("load", Ft, { once: !0 }));
}
function Pi(e) {
  Ct.delete(e);
}
function Oi(e) {
  const i = (t) => {
    e.totalProgress(t);
  };
  return { update: i, snapTo: i, kill() {
  } };
}
function zi(e, i) {
  const t = Math.max(0.05, i), s = Z.expoOut;
  let n = e.totalProgress(), r = n, o = t, h = !1;
  const a = (c, u) => {
    h = !0, !(o >= t) && (o = Math.min(t, o + u / 1e3), e.totalProgress(n + (r - n) * s(o / t)));
  };
  return A.add(a), {
    update(c) {
      if (!h) {
        n = c, r = c, o = t, e.totalProgress(c);
        return;
      }
      n = e.totalProgress(), r = c, o = 0;
    },
    snapTo(c) {
      n = c, r = c, o = t, e.totalProgress(c);
    },
    kill() {
      A.remove(a);
    }
  };
}
const ht = /* @__PURE__ */ new WeakMap();
function Ri(e) {
  let i = ht.get(e);
  if (!i) {
    const a = e.getBoundingClientRect(), c = getComputedStyle(e), u = document.createElement("div");
    u.style.position = "relative", u.style.width = `${a.width}px`, u.style.height = `${a.height}px`, e.parentNode.insertBefore(u, e), u.appendChild(e), i = {
      spacer: u,
      refCount: 0,
      rect: a,
      docTop: a.top + window.scrollY,
      distance: 0,
      originalStyles: {
        position: e.style.position,
        top: e.style.top,
        left: e.style.left,
        width: e.style.width,
        margin: c.margin,
        transform: e.style.transform
      }
    }, ht.set(e, i);
  }
  i.refCount++;
  const t = i;
  let s = 0, n = null;
  const r = () => {
    e.style.position = t.originalStyles.position, e.style.top = t.originalStyles.top, e.style.left = t.originalStyles.left, e.style.width = t.originalStyles.width, e.style.margin = t.originalStyles.margin;
  }, o = () => {
    e.style.position = "fixed", e.style.top = `${s}px`, e.style.left = `${t.rect.left}px`, e.style.width = `${t.rect.width}px`, e.style.margin = "0";
  }, h = () => {
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
      a !== n && (n = a, a === "before" ? r() : a === "during" ? o() : h());
    },
    revert() {
      var a;
      t.refCount--, !(t.refCount > 0) && (e.style.position = t.originalStyles.position, e.style.top = t.originalStyles.top, e.style.left = t.originalStyles.left, e.style.width = t.originalStyles.width, e.style.margin = t.originalStyles.margin, e.style.transform = t.originalStyles.transform, (a = t.spacer.parentNode) == null || a.insertBefore(e, t.spacer), t.spacer.remove(), ht.delete(e));
    }
  };
}
const Li = 24, qt = 24, Di = 4;
function Bi(e, i) {
  return `rgba(${e},${i})`;
}
const Yt = "74,222,128", Nt = "248,113,113";
function G(e, i, t, s) {
  const n = document.createElement("div");
  n.style.cssText = `position:${s ? "fixed" : "absolute"};left:0;width:100%;border-top:1.4px solid ${Bi(e, 0.8)};z-index:999999;pointer-events:none;mix-blend-mode:screen;`;
  const r = document.createElement("span");
  return r.textContent = i, r.style.cssText = `position:absolute;${t}:0;top:2px;background:rgb(${e});color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`, n.appendChild(r), { line: n, label: r };
}
function Xt(e, i) {
  const t = i > window.innerHeight - Li;
  e.style.top = t ? "" : "2px", e.style.bottom = t ? "2px" : "";
}
function Ht(e, i, t, s) {
  i.style[t] = s ? `${e.offsetWidth + Di}px` : "0px";
}
function $i(e) {
  const i = e ? `${e} ` : "", t = G(Yt, `${i}start`, "left", !1), s = G(Nt, `${i}end`, "left", !1), n = G(Yt, `${i}start`, "right", !0), r = G(Nt, `${i}end`, "right", !0);
  return t.line.setAttribute("data-six-marker", `${e}-start`), s.line.setAttribute("data-six-marker", `${e}-end`), n.line.setAttribute("data-six-marker", `${e}-start-viewport`), r.line.setAttribute("data-six-marker", `${e}-end-viewport`), document.body.appendChild(t.line), document.body.appendChild(s.line), document.body.appendChild(n.line), document.body.appendChild(r.line), {
    update(o, h, a, c) {
      t.line.style.top = `${o}px`, s.line.style.top = `${h}px`, n.line.style.top = `${a}px`, r.line.style.top = `${c}px`, Ht(t.label, s.label, "left", Math.abs(h - o) < qt), Xt(n.label, a), Xt(r.label, c), Ht(n.label, r.label, "right", Math.abs(c - a) < qt);
    },
    remove() {
      t.line.remove(), s.line.remove(), n.line.remove(), r.line.remove();
    }
  };
}
const Vt = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 }, Fi = /^(.*?)([+-]=[\d.]+)$/;
function z(e) {
  const i = e.trim(), t = i.match(Fi), s = t ? t[1] : i, n = t ? (t[2][0] === "-" ? -1 : 1) * parseFloat(t[2].slice(2)) : 0;
  if (s in Vt) return { ratio: Vt[s], offsetPx: n };
  if (s.endsWith("%")) return { ratio: parseFloat(s) / 100, offsetPx: n };
  const r = parseFloat(s);
  return { ratio: 0, offsetPx: (isNaN(r) ? 0 : r) + n };
}
function qi(e, i, t, s) {
  const [n = "top", r = "top"] = e.trim().split(/\s+/), o = z(n), h = z(r), a = t + i.top + o.ratio * i.height + o.offsetPx, c = h.ratio * s + h.offsetPx;
  return a - c;
}
function Yi(e, i) {
  const [, t = "top"] = e.trim().split(/\s+/), s = z(t);
  return s.ratio * i + s.offsetPx;
}
function Ni(e, i, t) {
  const [s = "top"] = e.trim().split(/\s+/), n = z(s);
  return t + i.top + n.ratio * i.height + n.offsetPx;
}
function Xi(e) {
  if (e === void 0) return window;
  if (typeof e == "string") {
    const i = document.querySelector(e);
    return i || (console.warn(`[six] OnScroll: scroller "${e}" not found, falling back to window`), window);
  }
  return e;
}
function Wt(e) {
  if (typeof e == "string") {
    const i = document.querySelector(e);
    if (!i) throw new Error(`[six] OnScroll: trigger "${e}" not found`);
    return i;
  }
  return e;
}
const R = [];
class ot {
  constructor(i) {
    l(this, "vars");
    l(this, "triggerEl");
    l(this, "scroller");
    l(this, "startY", 0);
    l(this, "endY", 0);
    l(this, "wasInside", !1);
    l(this, "lastScroll", 0);
    l(this, "killed", !1);
    l(this, "hasHeardSyncSource", !1);
    l(this, "syncSourceRect0", { top: 0, height: 0 });
    l(this, "syncSourceRect1", { top: 0, height: 0 });
    l(this, "stickyHandle", null);
    l(this, "syncController", null);
    l(this, "markerHandle", null);
    l(this, "boundOnScroll", () => this.update());
    l(this, "boundOnResize", () => this.refresh());
    // The sync source's own progress can still be catching up from a stale pre-restoration reading
    // (see the reload-race comment on createSmoothSync in sync.ts) when this child's own
    // construction-time refresh() ran, so its own first-ever observation of the sync source may
    // already be wrong. Treat the first "update" ever heard FROM the sync source as a recalculation
    // too (instant), not a live crossing - see the `instant` branch in update() below.
    l(this, "boundOnSyncSourceUpdate", () => {
      const i = !this.hasHeardSyncSource;
      this.hasHeardSyncSource = !0, this.update(i);
    });
    this.vars = i, this.triggerEl = Wt(i.trigger), this.scroller = Xi(i.scroller), i.animation && (i.animation.pause(), i.sync && (this.syncController = typeof i.sync == "number" ? zi(i.animation, i.sync) : Oi(i.animation))), i.debug && !i.syncTo && (this.markerHandle = $i(i.id ?? "")), R.push(this), this.refresh(), i.syncTo ? i.syncTo.on("update", this.boundOnSyncSourceUpdate) : Mi(this.scroller, this.boundOnScroll), _i(this.boundOnResize);
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
      const m = parseFloat(r[2]) * (r[1] === "-" ? -1 : 1), y = Math.abs(this.syncSourceRect1.top - this.syncSourceRect0.top);
      return s + (y !== 0 ? m / y : 0);
    }
    const [o = "top", h = "top"] = n.trim().split(/\s+/), a = z(o), c = z(h), u = this.syncSourceRect0.top + a.ratio * this.syncSourceRect0.height + a.offsetPx, f = this.syncSourceRect1.top + a.ratio * this.syncSourceRect1.height + a.offsetPx - u, p = lt(this.scroller, this.resolvedAxis()), g = c.ratio * p + c.offsetPx;
    return f !== 0 ? (g - u) / f : 0;
  }
  resolvePositionValue(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n == "number") return n;
    const r = n.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (r && s !== void 0) {
      const c = parseFloat(r[2]);
      return s + (r[1] === "-" ? -c : c);
    }
    const o = this.triggerEl.getBoundingClientRect(), h = at(this.scroller, this.resolvedAxis()), a = lt(this.scroller, this.resolvedAxis());
    return qi(n, this.axisRect(o), h, a);
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
    return typeof s == "function" && (s = s()), typeof s != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(s.trim()) ? 0 : Yi(s, lt(this.scroller, this.resolvedAxis()));
  }
  /** Absolute document-Y that a debug marker's "trigger" line (left-aligned, follows the page)
   * should sit at - always the "<triggerEdge>" component of a position string, resolved against
   * the trigger element's own current position. Falls back to `computedY` (the already-resolved
   * scrollY-threshold, i.e. `this.startY`/`this.endY`) for a plain number/function or a
   * whole-string relative "+=N", which carry no independent trigger-edge token to resolve. */
  resolveMarkerTriggerY(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(n.trim())) return s;
    const r = this.triggerEl.getBoundingClientRect(), o = at(this.scroller, this.resolvedAxis());
    return Ni(n, this.axisRect(r), o);
  }
  refresh() {
    var i, t, s, n;
    if (!this.killed) {
      if ((i = this.stickyHandle) == null || i.setPhase("before"), this.vars.syncTo ? (this.measureSyncSourceEdges(), this.startY = this.resolveSyncSourcePosition(this.vars.start, "top bottom"), this.endY = this.resolveSyncSourcePosition(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1e-4)) : (this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1)), this.vars.sticky) {
        const r = this.vars.sticky === !0 ? this.triggerEl : typeof this.vars.sticky == "string" ? Wt(this.vars.sticky) : this.vars.sticky;
        r instanceof Element ? (this.stickyHandle ?? (this.stickyHandle = Ri(r)), this.stickyHandle.setStickyTop(this.stickyHandle.naturalDocTop - this.startY), this.stickyHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] OnScroll: sticky must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.sticky)}, ignoring`);
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
    return this.vars.syncTo ? this.vars.syncTo.totalProgress() : at(this.scroller, this.resolvedAxis());
  }
  update(i = !1) {
    var h, a, c, u, d, f, p, g, m, y, x, b, C, w, At, Et;
    if (this.killed) return;
    const t = this.currentPosition(), s = this.computeProgress(t), n = t >= this.startY && t <= this.endY, r = t >= this.lastScroll, o = this.wasInside;
    this.stickyHandle && this.stickyHandle.setPhase(t < this.startY ? "before" : t > this.endY ? "after" : "during"), i && !this.syncController && !o && t >= this.startY ? ((a = (h = this.vars).onEnter) == null || a.call(h, this), (c = this.vars.animation) == null || c.totalProgress(1)) : n && !o ? r ? ((d = (u = this.vars).onEnter) == null || d.call(u, this), this.syncController || (f = this.vars.animation) == null || f.play()) : (g = (p = this.vars).onEnterBack) == null || g.call(p, this) : !n && o && (r ? (y = (m = this.vars).onLeave) == null || y.call(m, this) : (b = (x = this.vars).onLeaveBack) == null || b.call(x, this)), this.wasInside = n, this.lastScroll = t, i ? (C = this.syncController) == null || C.snapTo(s) : (w = this.syncController) == null || w.update(s), (n || n !== o) && ((Et = (At = this.vars).onUpdate) == null || Et.call(At, this));
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
    this.killed = !0, this.vars.syncTo ? this.vars.syncTo.off("update", this.boundOnSyncSourceUpdate) : Ii(this.scroller, this.boundOnScroll), Pi(this.boundOnResize), (t = this.stickyHandle) == null || t.revert(), (s = this.syncController) == null || s.kill(), (n = this.markerHandle) == null || n.remove();
    const i = R.indexOf(this);
    i !== -1 && R.splice(i, 1);
  }
  static create(i) {
    return new ot(i);
  }
  static refresh() {
    for (const i of [...R]) i.refresh();
  }
  static getAll() {
    return R;
  }
}
function K(e) {
  return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? (e -= 1.5 / 2.75, 7.5625 * e * e + 0.75) : e < 2.5 / 2.75 ? (e -= 2.25 / 2.75, 7.5625 * e * e + 0.9375) : (e -= 2.625 / 2.75, 7.5625 * e * e + 0.984375);
}
const D = 1.70158, j = D * 1.525, re = {
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
  backIn: (e) => (D + 1) * e * e * e - D * e * e,
  backOut: (e) => (e--, 1 + (D + 1) * e * e * e + D * e * e),
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((j + 1) * t - j) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((j + 1) * i + j) + 2) / 2;
  },
  bounceIn: (e) => 1 - K(1 - e),
  bounceOut: K,
  bounceInOut: (e) => e < 0.5 ? (1 - K(1 - 2 * e)) / 2 : (1 + K(2 * e - 1)) / 2
}, Hi = {
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
function Vi(e) {
  return Hi[e] ?? "ease-out";
}
const St = /* @__PURE__ */ new WeakMap();
let mt = [], bt = null;
function Ut(e, i) {
  mt.push({ instance: e, type: i }), bt === null && (bt = requestAnimationFrame(Wi));
}
function Wi() {
  const e = mt.slice();
  mt.length = 0, bt = null;
  for (let i = 0; i < e.length; i++) {
    const { instance: t, type: s } = e[i];
    s === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let ct = null;
function oe() {
  return typeof window > "u" ? null : (ct || (ct = new IntersectionObserver(
    (e) => {
      for (let i = 0; i < e.length; i++) {
        const t = e[i], s = St.get(t.target);
        s && (t.isIntersecting ? Ut(s, "enter") : Ut(s, "leave"));
      }
    },
    { threshold: 0.05 }
  )), ct);
}
function ae(e, i) {
  var t;
  St.set(e, i), (t = oe()) == null || t.observe(e);
}
function yt(e) {
  var i;
  St.delete(e), (i = oe()) == null || i.unobserve(e);
}
function F(e, i) {
  if (e == null) return i;
  const t = e.trim();
  if (!t) return i;
  const s = Number(t);
  return Number.isFinite(s) ? s * 1e3 : i;
}
const v = typeof HTMLElement < "u" ? HTMLElement : class {
}, E = class E extends v {
  constructor() {
    super(...arguments);
    l(this, "animation");
    l(this, "options");
    l(this, "order", E.counter++);
    l(this, "cascadeSet");
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
    if (this.options = this.getOptions(), E.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), ae(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t, s;
    (t = this.animation) == null || t.cancel(), yt(this), (s = this.cascadeSet) == null || s.delete(this), this.cascadeSet = void 0;
  }
  handleEnter() {
    this.hasAttribute("replay") || yt(this), this.isCascade ? E.enqueueCascade(this) : this.play();
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
    }, n = this.getAttribute("type") ?? "fade-up", r = this.getAttribute("easing"), [o, h] = s[n] ?? s["fade-up"];
    return {
      x: o,
      y: h,
      easing: r && r in re ? r : "none",
      duration: F(this.getAttribute("duration"), 500),
      delay: F(this.getAttribute("delay"), 50)
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
    const { x: s, y: n, easing: r, duration: o, delay: h } = this.options;
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
        delay: h + t,
        easing: Vi(r),
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var c;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (c = this.animation) == null || c.cancel(), this.animation = void 0;
    };
  }
};
l(E, "counter", 0), l(E, "_mediaQuery", null), l(E, "cascadeQueue", /* @__PURE__ */ new Map()), l(E, "isProcessingCascade", !1);
let xt = E;
function Ui() {
  customElements.get("sx-animate") || customElements.define("sx-animate", xt);
}
const kt = {
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
}, J = 180 / Math.PI;
function Gi(e) {
  const i = window.getComputedStyle(e).transform;
  return !i || i === "none" ? { ...kt } : i.startsWith("matrix3d") ? ji(i) : Ki(i);
}
function Ki(e) {
  const i = e.match(/matrix\(([^)]+)\)/);
  if (!i) return { ...kt };
  const t = i[1].split(",").map((f) => parseFloat(f.trim())), [s, n, r, o, h, a] = t, c = Math.sqrt(s * s + n * n), u = Math.sqrt(r * r + o * o), d = Math.atan2(n, s) * J;
  return {
    x: h,
    y: a,
    z: 0,
    rotate: d,
    rotateX: 0,
    rotateY: 0,
    rotateZ: d,
    scale: c,
    scaleX: c,
    scaleY: u,
    skewX: 0,
    skewY: 0
  };
}
function ji(e) {
  const i = e.match(/matrix3d\(([^)]+)\)/);
  if (!i) return { ...kt };
  const t = i[1].split(",").map((b) => parseFloat(b.trim())), s = t[0], n = t[1], r = t[2], o = t[4], h = t[5], a = t[6];
  t[8], t[9];
  const c = t[10], u = t[12], d = t[13], f = t[14], p = Math.sqrt(s * s + n * n + r * r), g = Math.sqrt(o * o + h * h + a * a), m = Math.atan2(n, s) * J, y = Math.atan2(-r, Math.sqrt(a * a + c * c)) * J, x = Math.atan2(a, c) * J;
  return {
    x: u,
    y: d,
    z: f,
    rotate: m,
    rotateX: x,
    rotateY: y,
    rotateZ: m,
    scale: p,
    scaleX: p,
    scaleY: g,
    skewX: 0,
    skewY: 0
  };
}
const Qi = {
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
}, Gt = /* @__PURE__ */ new WeakMap();
function Zi(e) {
  const i = Gi(e);
  return {
    ...Qi,
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
function le(e) {
  let i = Gt.get(e);
  return i || (i = Zi(e), Gt.set(e, i)), i;
}
function I(e, i, t) {
  le(e)[i] = t;
}
function q(e) {
  const i = le(e);
  return `translate(${i.xPercent}%, ${i.yPercent}%) translate3d(${i.x}px, ${i.y}px, ${i.z}px) rotate(${i.rotate}deg) rotateX(${i.rotateX}deg) rotateY(${i.rotateY}deg) rotateZ(${i.rotateZ}deg) scale(${i.scale}) scaleX(${i.scaleX}) scaleY(${i.scaleY}) skewX(${i.skewX}deg) skewY(${i.skewY}deg)`;
}
class Ji extends v {
  constructor() {
    super();
    l(this, "inner", null);
    l(this, "resizeObserver", null);
    l(this, "setupRafId", null);
    l(this, "offset", 0);
    l(this, "isHovered", !1);
    l(this, "cachedResetBounds", 0);
    l(this, "isSettingUp", !1);
    l(this, "isVisible", !1);
    l(this, "onMouseEnter", () => {
      this.pauseOnHover && (this.isHovered = !0);
    });
    l(this, "onMouseLeave", () => {
      this.isHovered && (this.isHovered = !1);
    });
    l(this, "updateAnimation", (t, s) => {
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
    }), this.resizeObserver.observe(this), ae(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, A.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, A.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), yt(this), A.remove(this.updateAnimation);
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
          const h = o < r ? Math.ceil(r * 2 / o) : 2, a = document.createDocumentFragment();
          for (let c = 1; c < h; c++)
            for (const u of s) {
              const d = u.cloneNode(!0);
              d.setAttribute("data-clone", "true"), a.appendChild(d);
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
    this.inner && (I(this.inner, this.isVertical ? "y" : "x", t), this.inner.style.transform = q(this.inner));
  }
}
class ts extends v {
}
class es extends v {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function is() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", Ji), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", ts), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", es);
}
class ss extends v {
  constructor() {
    super();
  }
}
class ns {
  constructor() {
    l(this, "sliders", /* @__PURE__ */ new Map());
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
const P = new ns();
class rs extends v {
  constructor() {
    super();
    l(this, "renderedSignature", "");
    l(this, "innerContainer", null);
    l(this, "snakeBar", null);
    l(this, "maxVisibleBullets", 5);
    l(this, "bulletWidthWithGap", 16);
    l(this, "lastActiveIndex", 0);
    l(this, "cachedBullets", []);
    l(this, "snakeTimeout", null);
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
    s ? n = P.get(s) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const s = this.getAttribute("effect"), n = s === "dynamic", r = s === "snake", o = s === "fraction", h = t.join(",") + `_effect:${s}`;
    if (this.renderedSignature === h) return;
    if (this.renderedSignature = h, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const c = document.createElement("span");
      c.className = "sx-slider-pagination-current", c.textContent = "1";
      const u = document.createTextNode(" / "), d = document.createElement("span");
      d.className = "sx-slider-pagination-total", d.textContent = t.length.toString();
      const f = document.createDocumentFragment();
      f.appendChild(c), f.appendChild(u), f.appendChild(d), this.appendChild(f);
      return;
    }
    const a = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((c, u) => {
        const d = this.createBulletDOM(c, u, !1);
        this.cachedBullets.push(d), a.appendChild(d);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", a.appendChild(this.snakeBar), this.appendChild(a);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", a.appendChild(this.innerContainer), t.forEach((c, u) => {
        const d = this.createBulletDOM(c, u, !1);
        this.cachedBullets.push(d), this.innerContainer.appendChild(d);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(a);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((c, u) => {
      const d = this.createBulletDOM(c, u, s === "number");
      this.cachedBullets.push(d), a.appendChild(d);
    }), this.appendChild(a);
  }
  createBulletDOM(t, s, n) {
    const r = document.createElement("span");
    return r.className = "sx-slider-pagination-bullet", r.setAttribute("data-index", t.toString()), r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"), r.setAttribute("aria-label", `Go to slide ${s + 1}`), n && (r.textContent = (s + 1).toString()), r;
  }
  updateActive(t) {
    const s = this.getAttribute("effect");
    if (s === "fraction") {
      const d = this.querySelector(".sx-slider-pagination-current");
      d && (d.textContent = (t + 1).toString());
      return;
    }
    const n = s === "dynamic", r = s === "snake", o = this.cachedBullets, h = o.length;
    if (h === 0) return;
    if (o.forEach((d, f) => {
      n && (d.className = "sx-slider-pagination-bullet"), f === t ? (d.setAttribute("sx-bullet-active", ""), d.setAttribute("aria-current", "true")) : (d.removeAttribute("sx-bullet-active"), d.removeAttribute("aria-current"));
    }), r && this.snakeBar) {
      if (this.snakeTimeout !== null && (clearTimeout(this.snakeTimeout), this.snakeTimeout = null), o[t]) {
        const m = t * 20, y = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const x = m - y + 10;
          this.snakeBar.style.left = `${y}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const x = y - m + 10;
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${m}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || h <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (I(this.innerContainer, "x", 0), this.innerContainer.style.transform = q(this.innerContainer));
      return;
    }
    let a = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    a = Math.min(a, h - this.maxVisibleBullets);
    const c = a + this.maxVisibleBullets - 1;
    o.forEach((d, f) => {
      f >= a && f <= c ? f === a ? d.classList.add(f === 0 ? "sx-bullet-main" : "sx-bullet-small") : f === a + 1 ? d.classList.add(f === 1 ? "sx-bullet-main" : "sx-bullet-medium") : f === c ? d.classList.add(
        f === h - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : f === c - 1 ? d.classList.add(
        f === h - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : d.classList.add("sx-bullet-main") : d.classList.add("sx-bullet-small");
    });
    const u = -a * this.bulletWidthWithGap;
    I(this.innerContainer, "x", u), this.innerContainer.style.transform = q(this.innerContainer);
  }
}
class os extends v {
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
      const t = P.get(i);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class as extends v {
  constructor() {
    super();
    l(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, s, n) {
    const r = Math.max(0, Math.min(1, t));
    this.bar.style.transition = n || "none", s === "vertical" ? (this.bar.style.transformOrigin = "top center", I(this.bar, "scaleY", r), I(this.bar, "scaleX", 1)) : (this.bar.style.transformOrigin = "left center", I(this.bar, "scaleX", r), I(this.bar, "scaleY", 1)), this.bar.style.transform = q(this.bar);
  }
}
class ls extends v {
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
      const t = P.get(i);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class hs {
  constructor(i, t, s = 0.92) {
    l(this, "velocity", 0);
    l(this, "friction");
    l(this, "onUpdate");
    l(this, "onComplete");
    l(this, "isRunning", !1);
    l(this, "tickerCallback");
    this.onUpdate = i, this.onComplete = t, this.friction = s, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(i) {
    this.friction = i;
  }
  addVelocity(i) {
    this.velocity += i, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, A.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, A.add(this.tickerCallback));
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
class cs extends v {
  constructor() {
    super();
    l(this, "sliderCha", null);
    l(this, "isDragging", !1);
    l(this, "startX", 0);
    l(this, "currentTranslate", 0);
    l(this, "prevTranslate", 0);
    l(this, "isResetting", !1);
    l(this, "dragXs", []);
    l(this, "dragTimes", []);
    l(this, "velocity", 0);
    l(this, "scrollDuration", 0);
    l(this, "scrollStartTime", 0);
    l(this, "scrollFrom", 0);
    l(this, "scrollToTarget", 0);
    l(this, "scrollFriction", 1);
    l(this, "isScrollAnimating", !1);
    l(this, "noConstrain", !1);
    l(this, "lastClientAxis", 0);
    l(this, "lastWheelTime", 0);
    l(this, "boundWheel", this.onWheel.bind(this));
    l(this, "boundDragStart", this.dragStart.bind(this));
    l(this, "boundDragMove", this.dragMove.bind(this));
    l(this, "boundDragEnd", this.dragEnd.bind(this));
    l(this, "handleScrollEnd", () => {
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
    l(this, "wheelInertia", new hs(
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
    l(this, "scrollTickerCallback", () => this.runScrollLoop());
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
      const { max: h, min: a } = this.sliderCha.getBoundaries(), c = this.sliderCha.options.edgeResistance;
      o > h ? o = c <= 0 ? h : h + Math.min(c, (o - h) * 0.3) : o < a && (o = c <= 0 ? a : a - Math.min(c, (a - o) * 0.3)), this.currentTranslate = o;
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
        const h = this.sliderCha.getRawIndex();
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(h) : h * this.sliderCha.getSlideSizeWithGap(), c = t.autoSize ? this.sliderCha.getOffsetForIndex(h + 1) - a : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const u = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + u / 2 - (a + c / 2);
        } else
          r = o - a;
        if (!t.loop) {
          const { max: u, min: d } = this.sliderCha.getBoundaries();
          r = Math.max(d, Math.min(u, r));
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
  startMomentumScroll(t, s, n, r = !1) {
    var h;
    this.cancelMomentumScroll(), this.scrollFrom = this.currentTranslate, this.scrollToTarget = t, this.scrollFriction = 1, this.noConstrain = r;
    const o = Math.abs(t - this.scrollFrom);
    if (this.scrollDuration = s ?? Math.max(o / 1.5, 800), o < 1) {
      this.currentTranslate = t, this.setTransform(this.currentTranslate), this.prevTranslate = this.currentTranslate, (h = this.sliderCha) == null || h.alignIndexToFreeTranslation(this.currentTranslate), n && n();
      return;
    }
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, A.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const s = performance.now() - this.scrollStartTime, n = Math.min(s / this.scrollDuration, 1), r = re.quartOut(n), h = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += h, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: c } = this.sliderCha.getBoundaries(), u = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < c) {
        if (this.currentTranslate > a) {
          if (u <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + u) {
            this.currentTranslate = a + u, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < c) {
          if (u <= 0) {
            this.currentTranslate = c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < c - u) {
            this.currentTranslate = c - u, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(c, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(h) < 1) {
          const f = this.currentTranslate > a ? a : c;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(h) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, A.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, A.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, s = this.sliderCha.getCloneCount(), n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(s), r = this.sliderCha.getOffsetForIndex(s + t) - o;
    else {
      const m = this.sliderCha.getSlideSizeWithGap();
      o = s * m, r = t * m;
    }
    let h = 0;
    if (this.sliderCha.options.centered) {
      const m = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let y = 0;
      this.sliderCha.options.autoSize ? y = this.sliderCha.getOffsetForIndex(s + 1) - this.sliderCha.getOffsetForIndex(s) : y = this.sliderCha.getSlideSizeWithGap(), h = m / 2 - y / 2;
    }
    const a = -o + n + h, c = a - r;
    let u = !1, d = this.currentTranslate, f = 0, p = 0;
    const g = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + g ? (d = this.currentTranslate - r, f = -r, p = t, u = !0) : this.currentTranslate <= c - g && (d = this.currentTranslate + r, f = r, p = -t, u = !0), u && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = d, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.shiftCurrentIndex(p), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (I(this, this.sliderCha.transformFn === "translateY" ? "y" : "x", t), this.style.transform = q(this), this.sliderCha.updateProgress(t, this.style.transition));
  }
  updatePosition(t = !1) {
    if (!this.sliderCha || this.isResetting) return;
    this.cancelMomentumScroll();
    const s = this.sliderCha.options;
    t ? this.style.transition = "none" : this.style.transition = `transform ${s.speed}ms ease-out, height ${s.speed}ms ease-out`;
    const n = parseFloat(this.sliderCha.startPadding) || 0, r = this.sliderCha.getRawIndex();
    let o = n, h = 0, a = 0;
    if (s.autoSize)
      h = this.sliderCha.getOffsetForIndex(r), a = this.sliderCha.getOffsetForIndex(r + 1) - h;
    else {
      const c = this.sliderCha.getSlideSizeWithGap();
      h = r * c, a = c;
    }
    if (s.centered) {
      const c = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += c / 2 - (h + a / 2);
    } else
      o -= h;
    if (!s.loop) {
      const { max: c, min: u } = this.sliderCha.getBoundaries();
      o = Math.max(u, Math.min(c, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, s.loop) {
      const c = this.sliderCha.originalSlidesCount, u = this.sliderCha.getCloneCount();
      (r >= u + c || r < u) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, s.speed);
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
  static getMatch(i, t, s) {
    if (!s) return { ...t };
    let n = { ...t };
    const r = Object.keys(s).map(Number).sort((o, h) => o - h);
    for (const o of r)
      if (i >= o) {
        const h = this.kebabToCamel(s[o]);
        n = { ...n, ...h };
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
class ds extends v {
  constructor() {
    super();
    l(this, "options");
    l(this, "originalOptions");
    l(this, "breakpointsConfig", null);
    l(this, "currentIndex", 0);
    l(this, "lastFiredIndex", -1);
    l(this, "track", null);
    l(this, "resizeObserver");
    l(this, "originalSlidesCount", 0);
    l(this, "autoplayTimer", null);
    l(this, "isFirstInit", !0);
    l(this, "lastContainerSize", 0);
    l(this, "isFirstHeightMeasure", !0);
    l(this, "isClickRouting", !1);
    l(this, "slideOffsetsCache", null);
    l(this, "handleVisibilityChange", () => {
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
      const c = this.originalSlidesCount;
      if (c > 0 && this.track) {
        const u = this.getCloneCount(), d = parseFloat(this.startPadding) || 0;
        let f = 0, p = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(u), p = this.getOffsetForIndex(u + c) - f;
        else {
          const g = this.getSlideSizeWithGap();
          f = u * g, p = c * g;
        }
        if (p > 0) {
          r = o / p;
          let g = 0;
          if (this.options.centered) {
            let x = this.options.autoSize ? this.getOffsetForIndex(u + 1) - this.getOffsetForIndex(u) : this.getSlideSizeWithGap();
            g = o / 2 - x / 2;
          }
          n = (-f + d + g - t) / p, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: c, min: u } = this.getBoundaries(), d = c - u;
      d > 0 ? (n = (c - t) / d, r = o / (d + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const h = r + n * (1 - r);
    let a = Array.from(
      this.querySelectorAll("sx-slider-progress")
    );
    if (this.options.name) {
      const c = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`
        )
      );
      a = [.../* @__PURE__ */ new Set([...a, ...c])];
    }
    a.forEach((c) => {
      typeof c.update == "function" && c.update(h, this.options.direction, s);
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
        const h = n.target.closest("sx-slider-slide");
        if (!h) return;
        const a = h.getAttribute("data-real-index");
        if (a !== null) {
          const c = parseInt(a, 10);
          this.goTo(c, !0);
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
    const t = (p) => p ? isNaN(Number(p)) ? p : `${p}px` : "0px", s = this.getAttribute("edge-resistance"), n = s !== null ? Number(s) : 100, r = this.getAttribute("interval"), o = F(r, 4e3), h = this.getAttribute("start-index"), a = h !== null ? Number(h) : 0, c = this.getAttribute("per-move");
    let u = "auto";
    if (c !== null && c !== "auto") {
      const p = Number(c);
      u = isNaN(p) ? "auto" : p;
    }
    let d = this.getAttribute("direction");
    d !== "horizontal" && d !== "vertical" && (d = "horizontal");
    let f = this.getAttribute("effect");
    f !== "fade" && (f = "slide"), this.options = {
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
      startIndex: isNaN(a) ? 0 : a,
      autoSize: this.hasAttribute("auto-size"),
      perMove: u,
      autoHeight: this.hasAttribute("auto-height"),
      centered: this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: d,
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
    const s = Array.from(this.track.children);
    if (this.originalSlidesCount = s.length, this.originalSlidesCount === 0) return;
    s.forEach((r, o) => {
      r.setAttribute("data-real-index", o.toString());
    });
    const n = this.getCloneCount();
    for (let r = 0; r < n; r++) {
      const h = s[s.length - 1 - r].cloneNode(!0);
      h.setAttribute("data-clone", "prev"), this.track.insertBefore(h, this.track.firstChild);
    }
    for (let r = 0; r < n; r++) {
      const h = s[r].cloneNode(!0);
      h.setAttribute("data-clone", "next"), this.track.appendChild(h);
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
      this.options = rt.getMatch(
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
    const o = this.getAttribute("left-padding"), h = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === r && o && parseFloat(o) > 0 && h && parseFloat(h) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(o), this.options.rightPadding = this.formatUnit(h));
    const a = this.convertToPx(this.options.gap), c = this.convertToPx(this.options.leftPadding), u = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      s.forEach((p) => {
        p.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, s.forEach((p) => {
        const g = p.firstElementChild;
        g ? p.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : p.style[this.sizeDim] = "max-content", p.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const m = ((t || window.innerWidth) - c - u - a * (this.options.perView - 1)) / this.options.perView;
      s.forEach((y) => {
        y.style[this.sizeDim] = `${m}px`, y.style[this.marginProp] = this.options.gap;
      });
    }
    let d = !1;
    const f = s.filter((p) => !p.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let p = 0;
      f.forEach((g) => {
        p += this.getRectSize(g) + a;
      }), p -= a, d = p < t;
    } else
      d = r < this.options.perView;
    this.options.centerIfShort && d ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((g) => g.remove())) : this.track.style.justifyContent = "", this.invalidateOffsetsCache(), this.track.updatePosition(!0), this.updateSlideAttributes();
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
    for (let h = 0; h < o.length && (s += this.getRectSize(o[h]) + r, !(s - r > t)); h++)
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
      let h = this.options.autoSize ? this.getOffsetForIndex(1) - this.getOffsetForIndex(0) : this.getSlideSizeWithGap();
      r = s + t / 2 - h / 2;
      let a = n - 1, c = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), u = this.options.autoSize ? this.getOffsetForIndex(a + 1) - c : this.getSlideSizeWithGap();
      o = s + t / 2 - (c + u / 2);
    }
    return { max: r, min: Math.min(r, o) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const s = this.options.loop, n = s ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = s ? this.getCloneCount() : 0, o = (b) => {
      if (!s) return b;
      let C = (b - r) % n;
      return C < 0 && (C += n), C;
    }, h = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = o(this.currentIndex);
    this.lastFiredIndex !== a && (this.lastFiredIndex = a, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: a }
      })
    ));
    const c = o(this.currentIndex - 1), u = o(this.currentIndex + 1), d = o(this.currentIndex + h), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let p = null;
    f && (p = document.createElement("style"), p.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(p), this.offsetHeight), t.forEach((b, C) => {
      const w = o(C);
      b.setAttribute("aria-label", `${w + 1}/${n}`);
    }), this.options.lockActive && !this.isClickRouting && !f || t.forEach((b, C) => {
      b.removeAttribute("sx-slide-active"), b.removeAttribute("sx-slide-prev"), b.removeAttribute("sx-slide-next"), b.removeAttribute("sx-slide-center");
      const w = o(C);
      w === a && b.setAttribute("sx-slide-active", ""), w === c && b.setAttribute("sx-slide-prev", ""), w === u && b.setAttribute("sx-slide-next", ""), w === d && b.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight();
    const g = s ? n - 1 : this.getRealMaxIndex();
    this.updateNavigation(s ? void 0 : g);
    const m = this.getResolvedPerMove();
    let y = [];
    if (m > 1 && !this.options.autoSize) {
      let b = 0;
      for (; b < g; )
        y.push(b), b += m;
      b !== g && y.push(g);
    } else
      for (let b = 0; b <= g; b++)
        y.push(b);
    let x = y.indexOf(a);
    if (x === -1) {
      for (let b = y.length - 1; b >= 0; b--)
        if (a >= y[b]) {
          x = b;
          break;
        }
    }
    this.updatePagination(y, x), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((C) => C.trim()).forEach((C) => {
      const w = P.get(C);
      w && w.syncFromController(a);
    }), f && p && requestAnimationFrame(() => {
      p == null || p.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const s = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = s ? this.originalSlidesCount : n.length - r;
    if (((a) => {
      if (!s) return a;
      const c = this.getCloneCount();
      let u = (a - c) % o;
      return u < 0 && (u += o), u;
    })(this.currentIndex) !== t) {
      if (s) {
        const a = this.getCloneCount(), c = t + a, u = this.originalSlidesCount, d = n.length;
        let f = c, p = Math.abs(c - this.currentIndex);
        [c - u, c, c + u].forEach((m) => {
          if (m >= 0 && m < d) {
            const y = Math.abs(m - this.currentIndex);
            y < p && (p = y, f = m);
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
    for (let h = 0; h < s; h++) {
      let a = r + h;
      this.options.loop && (a < 0 ? a = t.length + a : a >= t.length && (a = a % t.length));
      const c = t[a];
      if (!c) continue;
      const u = c.firstElementChild, d = u ? u.getBoundingClientRect().height : c.getBoundingClientRect().height;
      d > o && (o = d);
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
      let h = this.options.autoSize ? this.getOffsetForIndex(o) : o * n, a = this.options.autoSize ? this.getOffsetForIndex(o + 1) - h : n, c = parseFloat(this.startPadding) || 0;
      if (this.options.centered ? c += r / 2 - (h + a / 2) : c -= h, c <= s + 1)
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
        const n = this.getCloneCount(), r = t + n, o = this.originalSlidesCount, h = this.track.children.length;
        let a = r, c = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((d) => {
          if (d >= 0 && d < h) {
            const f = Math.abs(d - this.currentIndex);
            f < c && (c = f, a = d);
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
    const s = parseFloat(this.startPadding) || 0, n = this.getBoundingClientRect()[this.sizeDim], r = Array.from(this.track.children), o = this.options.autoSize ? 0 : this.getSlideSizeWithGap(), h = this.options.loop ? null : this.getBoundaries();
    let a = 0, c = 1 / 0;
    const u = this.currentIndex;
    for (let d = 0; d < r.length; d++) {
      let f = 0, p = 0;
      this.options.autoSize ? (f = this.getOffsetForIndex(d), p = this.getOffsetForIndex(d + 1) - f) : (f = d * o, p = o);
      let g = s;
      if (this.options.centered ? g += n / 2 - (f + p / 2) : g -= f, h) {
        const { max: y, min: x } = h;
        this.options.centered && this.options.autoCentered ? g = Math.max(
          x,
          Math.min(y, g)
        ) : this.options.centered || (d === 0 && (g = 0), g < x && (g = x), g > 0 && (g = 0));
      }
      const m = Math.abs(t - g);
      m < c - 0.5 ? (c = m, a = d) : Math.abs(m - c) <= 0.5 && Math.abs(d - u) < Math.abs(a - u) && (a = d, c = m);
    }
    if (this.currentIndex = a, !this.options.loop) {
      const d = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, d);
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
      ), h = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`
        )
      );
      s = [.../* @__PURE__ */ new Set([...s, ...o])], n = [.../* @__PURE__ */ new Set([...n, ...h])];
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
function us() {
  customElements.get("sx-slider") || customElements.define("sx-slider", ds), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", cs), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", ss), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", as), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", ls), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", rs), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", os);
}
const M = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);",
  effect: "zoom",
  position: "center"
}, k = class k extends v {
  constructor() {
    super();
    l(this, "isOpen", !1);
    l(this, "previousActiveElement", null);
    l(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    l(this, "backdropEl", null);
    l(this, "dialogCoreEl", null);
    l(this, "closeCursorEl", null);
    l(this, "movingCloseCursor", !1);
    l(this, "originalContentHTML", "");
    l(this, "breakpointsConfig", null);
    l(this, "originalOptions", null);
    l(this, "resizeRaf", null);
    l(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    l(this, "handleResize", () => {
      this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.resizeRaf = requestAnimationFrame(() => this.applyBreakpoints());
    });
    l(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape") {
          t.stopPropagation(), this.closeOnEscKey && (t.preventDefault(), this.close());
          return;
        }
        t.key === "Tab" && (t.stopPropagation(), this.trapFocus(t));
      }
    });
    l(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
    l(this, "handleBackdropPointerMove", (t) => {
      !this.closeCursorEl || !this.closeOnOutsideClick || (this.closeCursorEl.style.transform = `translate3d(${t.clientX}px, ${t.clientY}px, 0) translate(-50%, -50%)`, this.closeCursorEl.classList.contains("is-visible") || (this.closeCursorEl.classList.add("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "none")));
    });
    l(this, "handleBackdropPointerLeave", () => {
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
    return F(t, M.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : M.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : M.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t !== null ? t !== "false" : M.scrollable;
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : M.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || M.overlayStyle;
  }
  get effect() {
    return this.getAttribute("effect") || M.effect;
  }
  get position() {
    return this.getAttribute("position") || M.position;
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
    }, this.breakpointsConfig = rt.parse(this.getAttribute("breakpoints")), this.render(), this.applyBreakpoints(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), window.addEventListener("resize", this.handleResize), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    var s;
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), window.removeEventListener("resize", this.handleResize), this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.removeEventListener("keydown", this.handleKeyDown), this.setInertOnSiblings(!1), (s = this.closeCursorEl) == null || s.remove(), this.closeCursorEl = null;
    const t = k.openStack.indexOf(this);
    t !== -1 && k.openStack.splice(t, 1);
  }
  applyBreakpoints() {
    if (!this.breakpointsConfig || !this.originalOptions) return;
    const t = rt.getMatch(
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
    return this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-open", !0) ? !1 : (this.isOpen = !0, this.clearDragStyles(), this.dialogCoreEl && (this.dialogCoreEl.scrollTop = 0), k.openStack.push(this), this.style.zIndex = String(k.baseZIndex + k.openStack.length), this.setAttribute("sx-open", ""), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "false"), this.previousActiveElement = document.activeElement, this.lockScroll(), this.setInertOnSiblings(!0), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }), !0);
  }
  close() {
    var s;
    if (!this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-close", !0)) return !1;
    this.isOpen = !1, this.handleBackdropPointerLeave();
    const t = k.openStack.indexOf(this);
    return t !== -1 && k.openStack.splice(t, 1), this.style.zIndex = "", this.removeAttribute("sx-open"), (s = this.dialogCoreEl) == null || s.setAttribute("aria-hidden", "true"), this.unlockScroll(), this.setInertOnSiblings(!1), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration), !0;
  }
  get coreElement() {
    return this.dialogCoreEl;
  }
  get dragAxis() {
    return k.DRAG_MAP[this.position].axis;
  }
  get dragSign() {
    return k.DRAG_MAP[this.position].sign;
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
l(k, "DRAG_MAP", {
  center: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
  right: { axis: "x", sign: 1 },
  "top-left": { axis: "y", sign: -1 },
  "top-right": { axis: "y", sign: -1 },
  "bottom-left": { axis: "y", sign: 1 },
  "bottom-right": { axis: "y", sign: 1 }
}), l(k, "baseZIndex", 9999), l(k, "openStack", []);
let vt = k;
class fs extends v {
  constructor() {
    super(...arguments);
    l(this, "dialogEl", null);
    l(this, "observer", null);
    l(this, "syncActiveState", () => {
      var t;
      (t = this.dialogEl) != null && t.hasAttribute("sx-open") ? this.setAttribute("sx-active", "") : this.removeAttribute("sx-active");
    });
    l(this, "handleKeyDown", (t) => {
      (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this.toggleDialog());
    });
    l(this, "toggleDialog", () => {
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
class ps extends v {
  constructor() {
    super(...arguments);
    l(this, "dialogEl", null);
    l(this, "pointerId", null);
    l(this, "startPos", 0);
    l(this, "startTime", 0);
    l(this, "currentOffset", 0);
    l(this, "dragging", !1);
    l(this, "handlePointerDown", (t) => {
      var s;
      this.dialogEl = this.closest("sx-dialog"), (s = this.dialogEl) != null && s.coreElement && (this.pointerId = t.pointerId, this.dragging = !0, this.startTime = performance.now(), this.currentOffset = 0, this.startPos = this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX, this.dialogEl.beginDrag(), this.setPointerCapture(t.pointerId), this.addEventListener("pointermove", this.handlePointerMove), this.addEventListener("pointerup", this.handlePointerEnd), this.addEventListener("pointercancel", this.handlePointerEnd));
    });
    l(this, "handlePointerMove", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      const n = (this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX) - this.startPos, r = this.dialogEl.dragSign;
      this.currentOffset = n * r > 0 ? n : 0, this.dialogEl.updateDrag(this.currentOffset);
    });
    l(this, "handlePointerEnd", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      this.dragging = !1, this.removeEventListener("pointermove", this.handlePointerMove), this.removeEventListener("pointerup", this.handlePointerEnd), this.removeEventListener("pointercancel", this.handlePointerEnd), this.pointerId !== null && this.releasePointerCapture(this.pointerId);
      const s = performance.now() - this.startTime, n = s > 0 ? Math.abs(this.currentOffset) / s : 0, r = this.dialogEl.coreElement.getBoundingClientRect(), o = this.dialogEl.dragAxis === "y" ? r.height : r.width, h = Math.abs(this.currentOffset) > o * this.threshold || n > 0.5;
      this.dialogEl.endDrag(h);
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
class gs extends v {
  constructor() {
    super(...arguments);
    l(this, "dialogEl", null);
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
function ms() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", vt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", fs), customElements.get("sx-dialog-pull") || customElements.define("sx-dialog-pull", ps), customElements.get("sx-close-cursor") || customElements.define("sx-close-cursor", gs);
}
function bs() {
  is(), Ui(), us(), ms();
}
function ys(e, i) {
  return N(e, i);
}
function xs(e) {
  return document.getElementById(e);
}
function vs(e, i) {
  return Array.from((i ?? document).getElementsByClassName(e));
}
function he(e, i, t) {
  return t === void 0 ? (s) => he(e, i, s) : t < e ? e : t > i ? i : t;
}
function Cs(e, i, t, s) {
  if (Array.isArray(e))
    return e[Math.floor(Math.random() * e.length)];
  const n = e, r = () => {
    const o = n + Math.random() * (i - n);
    return t ? Math.round(o / t) * t : o;
  };
  return s ? r : r();
}
const Ss = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayOf: ys,
  clamp: he,
  getByClass: vs,
  getById: xs,
  random: Cs
}, Symbol.toStringTag, { value: "Module" }));
console.log(`sixjs v${ue}`);
function ks(e, i) {
  return i || (typeof e == "string" || e instanceof Element ? e : N(e)[0]);
}
function Kt(e, i, t) {
  if (!i) return;
  const s = ks(e, i.trigger);
  ot.create({ ...i, trigger: s, animation: t });
}
function wt(e, i, t, s) {
  const { stagger: n, onScroll: r, ...o } = i;
  if (n === void 0) {
    const u = new _(e, o, t, s);
    return $.add(u), Kt(e, r, u), u;
  }
  const h = N(e), a = o.delay ?? 0, c = new Y();
  return h.forEach((u, d) => {
    const f = a + ee(d, h.length, n);
    c.add(new _(u, { ...o, delay: f }, t, s), 0);
  }), $.add(c), Kt(e, r, c), c;
}
function ws(e, i) {
  return wt(e, i, "to");
}
function As(e, i) {
  return wt(e, i, "from");
}
function Es(e, i, t) {
  return wt(e, t, "fromTo", i);
}
function Ts(e, i) {
  const t = new _(e, { ...i, duration: 0 });
  return $.add(t), t;
}
function Ms(e) {
  const { onScroll: i, ...t } = e ?? {}, s = new Y(t);
  return $.add(s), i && (i.trigger ? ot.create({ ...i, trigger: i.trigger, animation: s }) : console.warn("[six] timeline({ onScroll }) requires an explicit trigger - a Timeline has no target to default to")), s;
}
function Is(e) {
  ge(e);
}
const Ps = {
  to: ws,
  from: As,
  fromTo: Es,
  set: Ts,
  timeline: Ms,
  config: Is,
  context: fe,
  breakpoint: Ai,
  utils: Ss
};
function Os() {
  bs();
}
export {
  ot as OnScroll,
  ue as VERSION,
  Os as enableElements,
  Ps as six
};
