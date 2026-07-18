var Ke = Object.defineProperty;
var je = (e, i, t) => i in e ? Ke(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var h = (e, i, t) => je(e, typeof i != "symbol" ? i + "" : i, t);
const Qe = "0.0.33";
function Re(e, i, t) {
  return i < 0 ? 1 / 0 : e * (i + 1) + t * i;
}
function ee(e, i, t, s, n) {
  if (i <= 0)
    return { iteration: 0, time: 0, reversed: !1 };
  if (t === 0)
    return { iteration: 0, time: e < 0 ? 0 : e > i ? i : e, reversed: !1 };
  const r = i + s, o = Re(i, t, s);
  let l = e;
  l < 0 ? l = 0 : t >= 0 && l > o && (l = o);
  let a = Math.floor(l / r), c = l - a * r;
  s === 0 && a > 0 && c === 0 && (a -= 1, c = i), t >= 0 && a > t && (a = t, c = l - a * r), c > i && (c = i);
  const d = n && a % 2 === 1;
  return d && (c = i - c), { iteration: a, time: c, reversed: d };
}
let vt = null;
function Ot() {
  return vt;
}
class Pe {
  constructor(i) {
    h(this, "captured", /* @__PURE__ */ new Set());
    h(this, "dead", !1);
    i && this.run(i);
  }
  run(i) {
    if (this.dead) throw new Error("[six] cannot run a reverted context");
    const t = vt;
    vt = this;
    try {
      return i(this);
    } finally {
      vt = t;
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
function Ze(e) {
  return new Pe(e);
}
let Je = 0;
class Le {
  constructor(i = {}) {
    h(this, "id", ++Je);
    h(this, "parent", null);
    /** Kept after removal from `parent` (the "detached parent") so time queries made after removal still resolve. */
    h(this, "_dp", null);
    h(this, "_next", null);
    h(this, "_prev", null);
    h(this, "_start", 0);
    h(this, "_dur", 0);
    h(this, "_tDur", 0);
    h(this, "_time", 0);
    h(this, "_tTime", 0);
    /** Functional speed - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
    h(this, "_ts", 1);
    /** Recorded/user speed - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
    h(this, "_rts", 1);
    h(this, "_delay");
    h(this, "_repeat");
    h(this, "_repeatDelay");
    h(this, "_boomerang");
    h(this, "_initted", !1);
    h(this, "_dirty", !0);
    h(this, "_hasStarted", !1);
    /** Raw (pre-clamp) totalTime from the previous render() call - see the zero-duration handling in render(). */
    h(this, "_rawPrev", -1);
    h(this, "listeners", {});
    var t;
    (t = Ot()) == null || t._capture(this), this._delay = Math.max(0, i.delay ?? 0), this._repeat = i.repeat ?? 0, this._repeatDelay = Math.max(0, i.repeatDelay ?? 0), this._boomerang = i.boomerang ?? !1, i.onStart && this.on("start", i.onStart), i.onUpdate && this.on("update", i.onUpdate), i.onComplete && this.on("complete", i.onComplete), i.onRepeat && this.on("repeat", i.onRepeat), i.onReverseComplete && this.on("reverseComplete", i.onReverseComplete), i.paused && (this._ts = 0);
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
    const a = ee(o - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), c = l ? a : ee(n - this._delay, this._dur, this._repeat, this._repeatDelay, this._boomerang), d = a.iteration !== c.iteration;
    this._tTime = o, this._time = a.time, this._renderIteration(a.time, a.reversed, a.iteration, t, s || d);
    const u = this._rawPrev;
    if (this._rawPrev = i, t) return;
    const f = r === 0, m = f ? i < 0 : o <= 0, p = f ? i >= 0 : this._repeat >= 0 && o >= r, g = f ? u < 0 : n <= 0, b = f ? u >= 0 : this._repeat >= 0 && n >= r, x = f ? i > u : o > n, v = f ? i < u : o < n;
    !this._hasStarted && !m && (this._hasStarted = !0, this.emit("start")), x && d && this.emit("repeat"), this.emit("update"), x && !b && p ? this.emit("complete") : v && !g && m && this.emit("reverseComplete");
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
    this._tDur = this._delay + Re(this._dur, this._repeat, this._repeatDelay), this._dirty = !1;
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
let Nt = { duration: 0.8, ease: "none" };
function ti(e) {
  Nt = { ...Nt, ...e };
}
function ei() {
  return Nt;
}
function dt(e) {
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
const it = 1.70158, ut = it * 1.525, ie = 2 * Math.PI / 3, se = 2 * Math.PI / 4.5, St = {
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
  backIn: (e) => (it + 1) * e * e * e - it * e * e,
  backOut: (e) => {
    const i = e - 1;
    return 1 + (it + 1) * i * i * i + it * i * i;
  },
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((ut + 1) * t - ut) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((ut + 1) * i + ut) + 2) / 2;
  },
  bounceIn: (e) => 1 - dt(1 - e),
  bounceOut: dt,
  bounceInOut: (e) => e < 0.5 ? (1 - dt(1 - 2 * e)) / 2 : (1 + dt(2 * e - 1)) / 2,
  elasticIn: (e) => e === 0 || e === 1 ? e : -Math.pow(2, 10 * e - 10) * Math.sin((e * 10 - 10.75) * ie),
  elasticOut: (e) => e === 0 || e === 1 ? e : Math.pow(2, -10 * e) * Math.sin((e * 10 - 0.75) * ie) + 1,
  elasticInOut: (e) => e === 0 || e === 1 ? e : e < 0.5 ? -(Math.pow(2, 20 * e - 10) * Math.sin((20 * e - 11.125) * se)) / 2 : Math.pow(2, -20 * e + 10) * Math.sin((20 * e - 11.125) * se) / 2 + 1,
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
function ze(e) {
  return typeof e == "function" ? e : e && St[e] ? St[e] : St.quadOut;
}
const ii = /^#([0-9a-f]{3,8})$/i, si = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i, ni = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i, ri = {
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
function oi(e) {
  return ri[e.toLowerCase()] ?? null;
}
function Y(e, i, t) {
  const s = t === 1 ? e[i] + e[i] : e.slice(i, i + 2);
  return parseInt(s, 16);
}
function wt(e) {
  const i = e.trim(), t = i.match(ii);
  if (t) {
    const n = t[1];
    if (n.length === 3 || n.length === 4) {
      const r = n.length === 4 ? Y(n, 3, 1) / 255 : 1;
      return { r: Y(n, 0, 1), g: Y(n, 1, 1), b: Y(n, 2, 1), a: r };
    }
    if (n.length === 6 || n.length === 8) {
      const r = n.length === 8 ? Y(n, 6, 2) / 255 : 1;
      return { r: Y(n, 0, 2), g: Y(n, 2, 2), b: Y(n, 4, 2), a: r };
    }
  }
  const s = i.match(si) ?? i.match(ni);
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
    const n = oi(i);
    if (n) return { r: n[0], g: n[1], b: n[2], a: i.toLowerCase() === "transparent" ? 0 : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function Be(e, i, t) {
  return {
    r: Math.round(e.r + (i.r - e.r) * t),
    g: Math.round(e.g + (i.g - e.g) * t),
    b: Math.round(e.b + (i.b - e.b) * t),
    a: Math.round((e.a + (i.a - e.a) * t) * 1e3) / 1e3
  };
}
function Ft(e) {
  return `rgba(${e.r}, ${e.g}, ${e.b}, ${e.a})`;
}
const ai = {
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
}, ne = /* @__PURE__ */ new WeakMap(), li = /^matrix\(([^)]+)\)$/, hi = /^matrix3d\(([^)]+)\)$/, re = 180 / Math.PI;
function ci(e) {
  if (!e || e === "none") return {};
  const i = e.match(li);
  if (i) {
    const [s, n, r, o, l, a] = i[1].split(",").map(Number), c = Math.sqrt(s * s + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, s) * re, f = (Math.atan2(r, o) * re + u) * -1;
    return { x: l, y: a, rotation: u, scaleX: c, scaleY: d, skewX: ui(f) };
  }
  const t = e.match(hi);
  if (t) {
    const s = t[1].split(",").map(Number);
    return { x: s[12], y: s[13], z: s[14] };
  }
  return {};
}
function di(e) {
  return typeof getComputedStyle > "u" ? {} : ci(getComputedStyle(e).transform);
}
function ui(e) {
  let i = e % 360;
  return i > 180 && (i -= 360), i < -180 && (i += 360), i;
}
function kt(e) {
  let i = ne.get(e);
  return i || (i = { ...ai, ...di(e) }, ne.set(e, i)), i;
}
function P(e) {
  return Math.round(e * 1e4) / 1e4;
}
function fi(e, i) {
  const t = [];
  return (e.xPercent || e.yPercent) && t.push(`translate(${P(e.xPercent)}%, ${P(e.yPercent)}%)`), (e.x || e.y || e.z) && t.push(
    i || e.z ? `translate3d(${P(e.x)}px, ${P(e.y)}px, ${P(e.z)}px)` : `translate(${P(e.x)}px, ${P(e.y)}px)`
  ), e.rotation && t.push(`rotate(${P(e.rotation)}deg)`), e.rotationX && t.push(`rotateX(${P(e.rotationX)}deg)`), e.rotationY && t.push(`rotateY(${P(e.rotationY)}deg)`), e.skewX && t.push(`skewX(${P(e.skewX)}deg)`), e.skewY && t.push(`skewY(${P(e.skewY)}deg)`), (e.scaleX !== 1 || e.scaleY !== 1) && t.push(`scale(${P(e.scaleX)}, ${P(e.scaleY)})`), t.length ? t.join(" ") : "none";
}
function pi(e, i, t) {
  e.style.transform = fi(i, t);
}
const gi = {
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
}, oe = { x: "xPercent", y: "yPercent" };
function mi(e) {
  return typeof e == "string" && /%\s*$/.test(e.trim());
}
function xi(e, i) {
  return mi(i) && e in oe ? oe[e] : gi[e];
}
const yi = /* @__PURE__ */ new Set(["rotation", "rotationX", "rotationY", "skewX", "skewY"]), bi = /* @__PURE__ */ new Set(["xPercent", "yPercent"]), vi = /* @__PURE__ */ new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]), Si = /* @__PURE__ */ new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]), Ci = /* @__PURE__ */ new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);
function Z(e) {
  if (typeof e == "number") return !0;
  if (typeof e != "string") return !1;
  const i = e.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(i) || /^[+-]=/.test(i);
}
function rt(e, i = "") {
  if (typeof e == "number") return { value: e, unit: i };
  const t = String(e).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  return t ? { value: parseFloat(t[1]), unit: t[2] || i } : { value: 0, unit: i };
}
function Et(e, i) {
  var s;
  const t = (s = e.style) == null ? void 0 : s[i];
  return t || (typeof getComputedStyle > "u" ? "" : getComputedStyle(e)[i] || "");
}
function wi(e) {
  const i = yi.has(e) ? "deg" : bi.has(e) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: !0,
    transformKey: e,
    defaultUnit: i,
    get(t) {
      return { value: kt(t)[e], unit: i };
    },
    set(t, s) {
      kt(t)[e] = s.value;
    }
  };
}
function ki(e) {
  return {
    kind: "color",
    get(i) {
      return wt(Et(i, e) || "rgba(0,0,0,0)");
    },
    set(i, t) {
      i.style[e] = Ft(t);
    }
  };
}
function Ei(e) {
  return {
    kind: "complex",
    get(i) {
      return Et(i, e);
    },
    set(i, t) {
      i.style[e] = t;
    }
  };
}
function Ai(e, i) {
  const t = typeof getComputedStyle < "u" ? getComputedStyle(document.documentElement).getPropertyValue(e).trim() : "";
  return Z(i) || Z(t) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return rt(getComputedStyle(s).getPropertyValue(e).trim());
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
function Ti(e, i) {
  const t = Ci.has(e) ? "" : "px";
  return Z(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: t,
    get(s) {
      const n = Et(s, e);
      return Z(n) ? rt(n, t) : { value: 0, unit: t };
    },
    set(s, n) {
      s.style[e] = t === "" ? `${n.value}` : `${n.value}${n.unit}`;
    }
  } : {
    kind: "discrete",
    get(s) {
      return Et(s, e);
    },
    set(s, n) {
      s.style[e] = n;
    }
  };
}
function Mi(e, i) {
  return Z(i) ? {
    kind: "numeric",
    isTransform: !1,
    defaultUnit: "",
    get(s) {
      return rt(s.getAttribute(e) ?? "0");
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
function ae(e, i) {
  return Z(i) ? {
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
function Ii(e, i, t) {
  const s = xi(i, t);
  if (s) return wi(s);
  if (vi.has(i)) return ki(i);
  if (Si.has(i)) return Ei(i);
  if (i.startsWith("--")) return Ai(i, t);
  const n = e.style;
  return n && i in n ? Ti(i, t) : i in e && typeof e[i] == "number" ? ae(i, t ?? e[i]) : typeof e.setAttribute == "function" ? Mi(i, t) : ae(i, t);
}
const Oi = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;
function _i(e) {
  if (e[0] === "#" || /^(rgba?|hsla?)\(/i.test(e))
    return { type: "color", value: wt(e) };
  const i = e.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  return { type: "number", value: parseFloat(i[1]), unit: i[2] };
}
function At(e) {
  const i = [], t = [];
  let s = 0;
  for (const n of e.matchAll(Oi))
    t.push(e.slice(s, n.index)), i.push(_i(n[0])), s = n.index + n[0].length;
  return t.push(e.slice(s)), { literals: t, tokens: i };
}
function Ri(e, i) {
  const t = At(e).tokens, s = At(i).tokens;
  return t.length === s.length && t.every((n, r) => n.type === s[r].type);
}
function Pi(e, i, t) {
  if (!e || e.type !== i.type) {
    const o = t >= 1 ? i : e ?? i;
    return o.type === "color" ? Ft(o.value) : `${o.value}${o.unit}`;
  }
  if (i.type === "color")
    return Ft(Be(e.value, i.value, t));
  const s = e.value, n = s + (i.value - s) * t, r = i.unit || e.unit;
  return `${Math.round(n * 1e4) / 1e4}${r}`;
}
function Li(e, i, t) {
  const s = At(e), n = At(i);
  let r = "";
  for (let o = 0; o < n.literals.length; o++)
    r += n.literals[o], o < n.tokens.length && (r += Pi(s.tokens[o], n.tokens[o], t));
  return r;
}
const zi = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;
function Bi(e) {
  return zi.test(e);
}
function le(e, i, t, s) {
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
    const r = Bi(i) ? n.clientWidth : n.clientHeight;
    return t / 100 * r;
  }
  return t;
}
const he = /* @__PURE__ */ new Set([
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
]), qt = /^([+\-*/])=(-?[\d.]+)$/;
function ce(e, i) {
  const t = i.match(qt);
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
function $i(e, i) {
  const t = /* @__PURE__ */ new Set();
  for (const s in e) he.has(s) || t.add(s);
  if (i)
    for (const s in i) he.has(s) || t.add(s);
  return [...t];
}
function Di(e, i, t, s, n) {
  const r = t.get(e);
  let o, l;
  if (s === void 0)
    o = r.value, l = r.unit || t.defaultUnit;
  else if (typeof s == "string" && qt.test(s))
    o = ce(r.value, s), l = r.unit || t.defaultUnit;
  else {
    const d = rt(s, t.defaultUnit);
    o = d.value, l = d.unit;
  }
  let a, c;
  if (n === void 0)
    a = r.value, c = r.unit || t.defaultUnit;
  else if (typeof n == "string" && qt.test(n))
    a = ce(o, n), c = l;
  else {
    const d = rt(n, t.defaultUnit);
    a = d.value, c = d.unit;
  }
  return !t.isTransform && c !== l && (o = le(e, i, o, l), a = le(e, i, a, c), l = "px", c = "px"), { kind: "numeric", target: e, prop: i, isTransform: t.isTransform, handler: t, start: o, change: a - o, unit: c };
}
function Ni(e, i, t, s, n) {
  const r = s !== void 0 ? wt(String(s)) : t.get(e), o = n !== void 0 ? wt(String(n)) : t.get(e);
  return { kind: "color", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function Fi(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return Ri(r, o) ? { kind: "complex", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o } : { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function qi(e, i, t, s, n) {
  const r = s !== void 0 ? String(s) : t.get(e), o = n !== void 0 ? String(n) : t.get(e);
  return { kind: "discrete", target: e, prop: i, isTransform: !1, handler: t, start: r, end: o };
}
function Yi(e, i, t, s, n) {
  return t.kind === "numeric" ? Di(e, i, t, s, n) : t.kind === "color" ? Ni(e, i, t, s, n) : t.kind === "complex" ? Fi(e, i, t, s, n) : qi(e, i, t, s, n);
}
const Wi = { scale: ["scaleX", "scaleY"] };
function Xi(e, i, t, s) {
  const n = $i(i, s), r = [];
  for (const o of e)
    for (const l of n) {
      let a, c;
      t === "to" ? c = i[l] : t === "from" ? a = i[l] : (c = l in i ? i[l] : void 0, a = s && l in s ? s[l] : void 0);
      for (const d of Wi[l] ?? [l]) {
        const u = Ii(o, d, c ?? a);
        r.push(Yi(o, d, u, a, c));
      }
    }
  return r;
}
function Vi(e) {
  return Math.round(e * 1e4) / 1e4;
}
function Hi(e, i) {
  switch (e.kind) {
    case "numeric": {
      const t = Vi(e.start + e.change * i);
      e.isTransform ? kt(e.target)[e.handler.transformKey] = t : e.handler.set(e.target, { value: t, unit: e.unit });
      return;
    }
    case "color":
      e.handler.set(e.target, Be(e.start, e.end, i));
      return;
    case "complex":
      e.handler.set(e.target, Li(e.start, e.end, i));
      return;
    case "discrete":
      e.handler.set(e.target, i >= 1 ? e.end : e.start);
      return;
  }
}
function Ui(e, i, t) {
  const s = t(i);
  let n = e.last();
  for (; n && t(n) > s; )
    n = n._prev;
  n ? (i._prev = n, i._next = n._next, n._next ? n._next._prev = i : e.setLast(i), n._next = i) : (i._prev = null, i._next = e.first(), i._next ? i._next._prev = i : e.setLast(i), e.setFirst(i));
}
function Gi(e, i) {
  i._prev ? i._prev._next = i._next : e.first() === i && e.setFirst(i._next), i._next ? i._next._prev = i._prev : e.last() === i && e.setLast(i._prev), i._next = null, i._prev = null;
}
function* ft(e) {
  let i = e.first();
  for (; i; ) {
    const t = i._next;
    yield i, i = t;
  }
}
function pt(e, i) {
  if (!e || i === void 0) return 0;
  const t = parseFloat(i);
  return e === "-" ? -t : t;
}
const Ki = /^<(?:([+-])=([\d.]+))?$/, ji = /^>(?:([+-])=([\d.]+))?$/, Qi = /^([+-])=([\d.]+)$/, Zi = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;
function Ji(e, i) {
  if (e === void 0) return i.end;
  if (typeof e == "number") return Math.max(0, e);
  const t = e.trim();
  let s = t.match(Ki);
  if (s) return Math.max(0, i.prevStart + pt(s[1], s[2]));
  if (s = t.match(ji), s) return Math.max(0, i.prevEnd + pt(s[1], s[2]));
  if (s = t.match(Qi), s) return Math.max(0, i.end + pt(s[1], s[2]));
  if (s = t.match(Zi), s) {
    const [, n, r, o] = s, l = i.getLabel(n);
    return l === void 0 ? (console.warn(`[six] timeline: unknown label "${n}", appending at the current end`), i.end) : Math.max(0, l + pt(r, o));
  }
  return console.warn(`[six] timeline: invalid position "${e}", appending at the current end`), i.end;
}
function $e(e, i, t) {
  if (typeof t == "number") return e * t;
  const { each: s, from: n = "start" } = t;
  let r;
  return n === "start" ? r = e : n === "end" ? r = i - 1 - e : n === "center" ? r = Math.abs(e - (i - 1) / 2) : r = Math.abs(e - n), r * s;
}
function De(e, i) {
  const t = i.speed(), s = i.totalDuration();
  return (e - i.startTime()) * t + (t >= 0 ? 0 : s);
}
function Yt(e) {
  const i = e.parent;
  return i instanceof ht ? De(Yt(i), e) : e.totalTime();
}
class ht extends Le {
  constructor(t = {}) {
    super(t);
    h(this, "_firstChild", null);
    h(this, "_lastChild", null);
    h(this, "_cursor", 0);
    h(this, "_lastAdded", null);
    h(this, "_lastRenderedLocal", 0);
    h(this, "_labels", /* @__PURE__ */ new Map());
    h(this, "_defaultPositionMode");
    h(this, "_unbounded");
    h(this, "_childDefaults");
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
    return Ji(t, this.positionContext());
  }
  add(t, s) {
    var r;
    (r = t.parent) == null || r._removeChild(t);
    const n = this.resolvePosition(s);
    return t.parent = this, t.startTime(n), Ui(this, t, (o) => o.startTime()), this._cursor = Math.max(this._cursor, n + t.totalDuration()), this._lastAdded = t, this._lastRenderedLocal = Math.min(this._lastRenderedLocal, n), this._uncache(), this;
  }
  remove(t) {
    return t.parent === this && (Gi(this, t), t.parent = null, this._uncache()), this;
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
    const s = Yt(this);
    if (s < t.startTime()) return;
    const n = t.totalTime(), r = t.speed(), o = t.totalDuration(), l = r >= 0 ? 0 : o;
    t.startTime(s - (n - l) / r);
  }
  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill() {
    for (const t of ft(this))
      t.kill();
    return super.kill(), this;
  }
  getChildren() {
    return [...ft(this)];
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
    const { stagger: l, ...a } = s, c = { ...this._childDefaults, ...a }, d = this.resolvePosition(o), u = Math.abs(d - Yt(this)) < 1e-9;
    if (l === void 0)
      return this.add(new K(t, c, n, r, u), d), this;
    const f = tt(t), m = c.delay ?? 0;
    return f.forEach((p, g) => {
      const b = $e(g, f.length, l);
      this.add(new K(p, { ...c, delay: m + b }, n, r, u), d);
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
    return this.add(new K(null, { duration: 0, onStart: t }), s), this;
  }
  // ---- duration ----
  _recomputeTotalDuration() {
    if (this._unbounded) {
      this._dur = 1 / 0, this._tDur = 1 / 0, this._dirty = !1;
      return;
    }
    let t = 0;
    for (const s of ft(this)) {
      const n = s.endTime();
      n > t && (t = n);
    }
    this._dur = t, super._recomputeTotalDuration();
  }
  // ---- rendering ----
  _renderIteration(t, s, n, r, o) {
    const l = Math.min(this._lastRenderedLocal, t), a = Math.max(this._lastRenderedLocal, t);
    this._lastRenderedLocal = t;
    for (const c of ft(this)) {
      if (c.paused()) continue;
      const d = c.startTime();
      c.endTime() < l || d > a || c.totalDuration() === 0 && d <= l || c.render(De(t, c), r, o);
    }
  }
}
function ts(e) {
  return !Array.isArray(e);
}
function es(e, i, t) {
  const s = e.filter((o) => o.duration === void 0).length, n = e.reduce((o, l) => o + (l.duration ?? 0), 0), r = i !== void 0 ? s > 0 ? Math.max(0, i - n) / s : 0 : t;
  return e.map((o) => {
    const { duration: l, ease: a, ...c } = o;
    return { duration: l ?? r, ease: a, props: c };
  });
}
function is(e, i, t) {
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
function ss(e, i) {
  const t = i.keyframes, s = ts(t) ? is(t, i.duration ?? 0.5, i.ease) : es(t, i.duration, i.duration ?? 0.5), n = new ht(), r = {};
  for (const o of s) {
    const l = {};
    for (const a in o.props)
      a in r && (l[a] = r[a]);
    n.fromTo(e, l, { ...o.props, duration: o.duration, ease: o.ease ?? i.ease }), Object.assign(r, o.props);
  }
  return n;
}
const de = /* @__PURE__ */ new WeakMap();
function ns(e) {
  let i = de.get(e);
  return i || (i = /* @__PURE__ */ new Map(), de.set(e, i)), i;
}
function rs(e, i, t) {
  const s = /* @__PURE__ */ new Set();
  for (const n of t) {
    const r = ns(n.target), o = r.get(n.prop);
    i && o && o !== e && (i === !0 ? s.add(o) : o._dropTrack(n.target, n.prop)), r.set(n.prop, e);
  }
  for (const n of s) n.kill();
}
function tt(e, i) {
  if (e == null) return [];
  if (typeof e == "string") {
    const t = Array.from((i ?? document).querySelectorAll(e));
    return t.length === 0 && console.warn(`[six] no elements matched selector "${e}"`), t;
  }
  return e instanceof Element ? [e] : Array.from(e).filter((t) => t instanceof Element);
}
class K extends Le {
  /**
   * `renderInitial` (engine-internal - Timeline is the only caller that ever passes `false`):
   * whether to self-render at t=0 synchronously here in the constructor. Correct/desired for a
   * genuinely-standalone tween (or one about to be added to the root timeline at "now") so e.g.
   * a `.from()` tween's starting values are visible right away rather than waiting for the next
   * tick - but WRONG for a tween scheduled at a later position within a sequenced timeline
   * (ordinary chained `.to()`s, or a keyframe segment): rendering it now, before its own turn,
   * writes its progress-0 state into shared per-element mutable state (the transform cache) that
   * a currently-active sibling targeting the same property may already be mid-animation on -
   * this second, premature write silently clobbers the active sibling's just-computed value the
   * instant this tween is constructed, and - since a not-yet-reached child is deliberately never
   * re-rendered until its scheduled position is actually reached (Timeline._renderIteration's
   * skip-range check) - nothing ever corrects it back, leaving a visible glitch/jump for the
   * entire span before this tween's real turn arrives. Timeline.addTweens() passes `false`
   * whenever the resolved position isn't actually "now" for that timeline, and defers this
   * tween's first real render (and lazily-triggered _onInit()/track-building) to whenever the
   * timeline's own cascade naturally reaches it instead.
   */
  constructor(t, s, n = "to", r, o = !0) {
    super(s);
    h(this, "targets");
    h(this, "mode");
    h(this, "rawVars");
    h(this, "rawFromVars");
    h(this, "ease");
    h(this, "tracks", []);
    h(this, "keyframeTimeline", null);
    const l = ei();
    this.targets = tt(t), this.mode = n, this.rawVars = s, this.rawFromVars = r, this.ease = ze(s.ease ?? l.ease), s.keyframes ? (this.keyframeTimeline = ss(this.targets, s), this.duration(this.keyframeTimeline.totalDuration())) : this.duration(s.duration ?? l.duration), o && this.render(0, !0, !0);
  }
  targetElements() {
    return this.targets;
  }
  _onInit() {
    this.keyframeTimeline || (this.tracks = Xi(this.targets, this.rawVars, this.mode, this.rawFromVars), rs(this, this.rawVars.overwrite, this.tracks));
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
      Hi(a, r), a.isTransform && l.add(a.target);
    for (const a of l)
      pi(a, kt(a), o);
  }
}
const gt = () => typeof performance < "u" ? performance.now() : Date.now();
class os {
  /** `{ manual: true }` disables real rAF scheduling entirely - useful for deterministic tests/SSR, driven only via `tick()`. */
  constructor(i = {}) {
    h(this, "listeners", []);
    h(this, "i", 0);
    // live cursor into `listeners` during dispatch, adjusted by remove()
    h(this, "frame", 0);
    h(this, "timeMs", 0);
    h(this, "deltaMs", 0);
    h(this, "startTime", gt());
    h(this, "lastUpdate", this.startTime);
    h(this, "lagThreshold", 500);
    h(this, "adjustedLag", 33);
    h(this, "gap", 1e3 / 240);
    h(this, "nextTime", this.gap);
    h(this, "rafId", null);
    h(this, "manual");
    h(this, "loop", () => {
      this.manual || (this.advance(gt() - this.lastUpdate), this.rafId !== null && (this.rafId = this.request(this.loop)));
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
    const i = gt();
    this.startTime = i - this.timeMs * 1e3, this.lastUpdate = i, this.rafId = this.request(this.loop);
  }
  sleep() {
    this.rafId !== null && (this.cancel(this.rafId), this.rafId = null);
  }
  /** Forces one synchronous step, bypassing rAF and the overlap-gap gate entirely. Intended for a `{ manual: true }` ticker. */
  tick(i = 1e3 / 60) {
    this.frame++, this.deltaMs = i, this.timeMs += i / 1e3, this.lastUpdate = gt(), this.startTime = this.lastUpdate - this.timeMs * 1e3, this.nextTime = this.timeMs * 1e3 + this.gap, this.dispatch();
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
const T = new os(), ot = new ht({ unbounded: !0, defaultPosition: "now" });
T.add((e) => ot.render(e));
class as extends Pe {
  constructor() {
    super(...arguments);
    h(this, "matches", {});
  }
}
class ls {
  constructor() {
    h(this, "entries", []);
    h(this, "dead", !1);
    var i;
    (i = Ot()) == null || i._capture(this);
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
    const s = typeof i == "string", n = s ? { matches: i } : i, r = new as(), o = {};
    let l = !1;
    const a = () => {
      let u = !1, f = !1;
      for (const m in n) {
        const p = window.matchMedia(n[m]).matches;
        p && (u = !0), o[m] !== p && (o[m] = p, f = !0);
      }
      f && (r.revert(), u && (r.matches = s ? {} : { ...o }, this._run(r, t)));
    }, c = () => {
      l || (l = !0, queueMicrotask(() => {
        l = !1, a();
      }));
    }, d = Object.keys(n).map((u) => window.matchMedia(n[u]));
    return d.forEach((u) => u.addEventListener("change", c)), this.entries.push({
      ctx: r,
      detach: () => d.forEach((u) => u.removeEventListener("change", c)),
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
function hs(e, i) {
  const t = new ls();
  return e !== void 0 && i !== void 0 && t.add(e, i), t;
}
function Ne(e) {
  if (e === void 0) return window;
  if (typeof e == "string") {
    const i = document.querySelector(e);
    return i || (console.warn(`[six] scroller "${e}" not found, falling back to window`), window);
  }
  return e;
}
let Wt = 0;
function _t() {
  Wt++;
}
const cs = { y: /* @__PURE__ */ new WeakMap(), x: /* @__PURE__ */ new WeakMap() };
function ds(e, i) {
  if (e === window) return i === "y" ? window.scrollY : window.scrollX;
  const t = e;
  return i === "y" ? t.scrollTop : t.scrollLeft;
}
function j(e, i = "y") {
  const t = cs[i], s = t.get(e);
  if (s && s.gen === Wt) return s.value;
  const n = ds(e, i);
  return t.set(e, { gen: Wt, value: n }), n;
}
function us(e, i, t) {
  if (e === window)
    i === "y" ? window.scrollTo(window.scrollX, t) : window.scrollTo(t, window.scrollY);
  else {
    const s = e;
    i === "y" ? s.scrollTop = t : s.scrollLeft = t;
  }
  _t();
}
function H(e, i = "y") {
  var s, n;
  if (e === window)
    return i === "y" ? ((s = window.visualViewport) == null ? void 0 : s.height) ?? window.innerHeight : ((n = window.visualViewport) == null ? void 0 : n.width) ?? window.innerWidth;
  const t = e;
  return i === "y" ? t.clientHeight : t.clientWidth;
}
function Lt(e, i = "y") {
  if (e === window) {
    const s = document.documentElement;
    return i === "y" ? s.scrollHeight - H(e, "y") : s.scrollWidth - H(e, "x");
  }
  const t = e;
  return i === "y" ? t.scrollHeight - t.clientHeight : t.scrollWidth - t.clientWidth;
}
const Tt = /* @__PURE__ */ new Map(), Xt = /* @__PURE__ */ new Map();
function fs(e, i) {
  let t = Tt.get(e);
  if (!t) {
    t = /* @__PURE__ */ new Set(), Tt.set(e, t);
    const s = () => {
      _t(), t.forEach((n) => n());
    };
    Xt.set(e, s), e.addEventListener("scroll", s, { passive: !0 });
  }
  t.add(i);
}
function ps(e, i) {
  const t = Tt.get(e);
  if (t && (t.delete(i), t.size === 0)) {
    const s = Xt.get(e);
    s && e.removeEventListener("scroll", s), Xt.delete(e), Tt.delete(e);
  }
}
const Qt = /* @__PURE__ */ new Set();
let ue = !1;
function fe() {
  _t(), Qt.forEach((e) => e());
}
function Fe(e) {
  Qt.add(e), !ue && typeof window < "u" && (ue = !0, window.addEventListener("resize", fe), typeof document < "u" && document.readyState !== "complete" && window.addEventListener("load", fe, { once: !0 }));
}
function qe(e) {
  Qt.delete(e);
}
function gs(e) {
  const i = (t) => {
    e.totalProgress(t);
  };
  return { update: i, snapTo: i, kill() {
  } };
}
function ms(e, i) {
  const t = Math.max(0.05, i), s = St.expoOut;
  let n = e.totalProgress(), r = n, o = t, l = !1;
  const a = (c, d) => {
    l = !0, !(o >= t) && (o = Math.min(t, o + d / 1e3), e.totalProgress(n + (r - n) * s(o / t)));
  };
  return T.add(a), {
    update(c) {
      if (!l) {
        n = c, r = c, o = t, e.totalProgress(c);
        return;
      }
      n = e.totalProgress(), r = c, o = 0;
    },
    snapTo(c) {
      n = c, r = c, o = t, e.totalProgress(c);
    },
    kill() {
      T.remove(a);
    }
  };
}
const zt = /* @__PURE__ */ new WeakMap();
function xs(e) {
  let i = zt.get(e);
  if (!i) {
    const a = e.getBoundingClientRect(), c = getComputedStyle(e), d = document.createElement("div");
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
        margin: c.margin,
        transform: e.style.transform
      }
    }, zt.set(e, i);
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
      t.refCount--, !(t.refCount > 0) && (e.style.position = t.originalStyles.position, e.style.top = t.originalStyles.top, e.style.left = t.originalStyles.left, e.style.width = t.originalStyles.width, e.style.margin = t.originalStyles.margin, e.style.transform = t.originalStyles.transform, (a = t.spacer.parentNode) == null || a.insertBefore(e, t.spacer), t.spacer.remove(), zt.delete(e));
    }
  };
}
const ys = 24, pe = 24, bs = 4;
function vs(e, i) {
  return `rgba(${e},${i})`;
}
const ge = "74,222,128", me = "248,113,113";
function mt(e, i, t, s) {
  const n = document.createElement("div");
  n.style.cssText = `position:${s ? "fixed" : "absolute"};left:0;width:100%;border-top:1.4px solid ${vs(e, 0.8)};z-index:999999;pointer-events:none;mix-blend-mode:screen;`;
  const r = document.createElement("span");
  return r.textContent = i, r.style.cssText = `position:absolute;${t}:0;top:2px;background:rgb(${e});color:#000;font:11px monospace;padding:2px 6px;white-space:nowrap;`, n.appendChild(r), { line: n, label: r };
}
function xe(e, i) {
  const t = i > window.innerHeight - ys;
  e.style.top = t ? "" : "2px", e.style.bottom = t ? "2px" : "";
}
function ye(e, i, t, s) {
  i.style[t] = s ? `${e.offsetWidth + bs}px` : "0px";
}
function Ss(e) {
  const i = e ? `${e} ` : "", t = mt(ge, `${i}start`, "left", !1), s = mt(me, `${i}end`, "left", !1), n = mt(ge, `${i}start`, "right", !0), r = mt(me, `${i}end`, "right", !0);
  return t.line.setAttribute("data-six-marker", `${e}-start`), s.line.setAttribute("data-six-marker", `${e}-end`), n.line.setAttribute("data-six-marker", `${e}-start-viewport`), r.line.setAttribute("data-six-marker", `${e}-end-viewport`), document.body.appendChild(t.line), document.body.appendChild(s.line), document.body.appendChild(n.line), document.body.appendChild(r.line), {
    update(o, l, a, c) {
      t.line.style.top = `${o}px`, s.line.style.top = `${l}px`, n.line.style.top = `${a}px`, r.line.style.top = `${c}px`, ye(t.label, s.label, "left", Math.abs(l - o) < pe), xe(n.label, a), xe(r.label, c), ye(n.label, r.label, "right", Math.abs(c - a) < pe);
    },
    remove() {
      t.line.remove(), s.line.remove(), n.line.remove(), r.line.remove();
    }
  };
}
const be = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 }, Cs = /^(.*?)([+-]=[\d.]+)$/;
function J(e) {
  const i = e.trim(), t = i.match(Cs), s = t ? t[1] : i, n = t ? (t[2][0] === "-" ? -1 : 1) * parseFloat(t[2].slice(2)) : 0;
  if (s in be) return { ratio: be[s], offsetPx: n };
  if (s.endsWith("%")) return { ratio: parseFloat(s) / 100, offsetPx: n };
  const r = parseFloat(s);
  return { ratio: 0, offsetPx: (isNaN(r) ? 0 : r) + n };
}
function ws(e, i, t, s) {
  const [n = "top", r = "top"] = e.trim().split(/\s+/), o = J(n), l = J(r), a = t + i.top + o.ratio * i.height + o.offsetPx, c = l.ratio * s + l.offsetPx;
  return a - c;
}
function ks(e, i) {
  const [, t = "top"] = e.trim().split(/\s+/), s = J(t);
  return s.ratio * i + s.offsetPx;
}
function Es(e, i, t) {
  const [s = "top"] = e.trim().split(/\s+/), n = J(s);
  return t + i.top + n.ratio * i.height + n.offsetPx;
}
function ve(e) {
  if (typeof e == "string") {
    const i = document.querySelector(e);
    if (!i) throw new Error(`[six] OnScroll: trigger "${e}" not found`);
    return i;
  }
  return e;
}
const et = [];
class Rt {
  constructor(i) {
    h(this, "vars");
    h(this, "triggerEl");
    h(this, "scroller");
    h(this, "startY", 0);
    h(this, "endY", 0);
    h(this, "wasInside", !1);
    h(this, "lastScroll", 0);
    h(this, "killed", !1);
    h(this, "hasHeardSyncSource", !1);
    h(this, "syncSourceRect0", { top: 0, height: 0 });
    h(this, "syncSourceRect1", { top: 0, height: 0 });
    h(this, "stickyHandle", null);
    h(this, "syncController", null);
    h(this, "markerHandle", null);
    h(this, "boundOnScroll", () => this.update());
    h(this, "boundOnResize", () => this.refresh());
    // The sync source's own progress can still be catching up from a stale pre-restoration reading
    // (see the reload-race comment on createSmoothSync in sync.ts) when this child's own
    // construction-time refresh() ran, so its own first-ever observation of the sync source may
    // already be wrong. Treat the first "update" ever heard FROM the sync source as a recalculation
    // too (instant), not a live crossing - see the `instant` branch in update() below.
    h(this, "boundOnSyncSourceUpdate", () => {
      const i = !this.hasHeardSyncSource;
      this.hasHeardSyncSource = !0, this.update(i);
    });
    this.vars = i, this.triggerEl = ve(i.trigger), this.scroller = Ne(i.scroller), i.animation && (i.animation.pause(), i.sync && (this.syncController = typeof i.sync == "number" ? ms(i.animation, i.sync) : gs(i.animation))), i.debug && !i.syncTo && (this.markerHandle = Ss(i.id ?? "")), et.push(this), this.refresh(), i.syncTo ? i.syncTo.on("update", this.boundOnSyncSourceUpdate) : fs(this.scroller, this.boundOnScroll), Fe(this.boundOnResize);
  }
  resolvedAxis() {
    return this.vars.axis ?? "y";
  }
  axisRect(i) {
    return this.resolvedAxis() === "x" ? { top: i.left, height: i.width } : { top: i.top, height: i.height };
  }
  /**
   * Viewport-relative offset of the scroller's own edge along the active axis - 0 for `window`,
   * otherwise a nested scroller Element's own on-screen position. `getScroll()` for an Element
   * scroller reads its local `scrollTop`/`scrollLeft` (a small range starting at 0, unrelated to
   * where the container sits on the page), while `triggerEl.getBoundingClientRect()` is always
   * viewport-relative (i.e. it bakes in the container's own page offset). Combining those two
   * directly - as `resolvePositionValue` needs to, the same way it safely does for `window` where
   * both quantities already share one coordinate space - would put the trigger's position on a
   * different numeric scale than the scroller's live scroll value, so thresholds like `startY`
   * could end up outside any value the scroller can ever reach. Subtracting this offset first
   * re-bases the trigger's rect onto the scroller's own client box, mirroring how `rect.top` is
   * already naturally viewport(=scroller)-relative in the `window` case.
   */
  scrollerEdgeOffset() {
    return this.scroller === window ? 0 : this.axisRect(this.scroller.getBoundingClientRect()).top;
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
      const g = parseFloat(r[2]) * (r[1] === "-" ? -1 : 1), b = Math.abs(this.syncSourceRect1.top - this.syncSourceRect0.top);
      return s + (b !== 0 ? g / b : 0);
    }
    const [o = "top", l = "top"] = n.trim().split(/\s+/), a = J(o), c = J(l), d = this.syncSourceRect0.top + a.ratio * this.syncSourceRect0.height + a.offsetPx, f = this.syncSourceRect1.top + a.ratio * this.syncSourceRect1.height + a.offsetPx - d, m = H(this.scroller, this.resolvedAxis()), p = c.ratio * m + c.offsetPx;
    return f !== 0 ? (p - d) / f : 0;
  }
  resolvePositionValue(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n == "number") return n;
    const r = n.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (r && s !== void 0) {
      const d = parseFloat(r[2]);
      return s + (r[1] === "-" ? -d : d);
    }
    const o = this.axisRect(this.triggerEl.getBoundingClientRect()), l = j(this.scroller, this.resolvedAxis()), a = H(this.scroller, this.resolvedAxis()), c = { top: o.top - this.scrollerEdgeOffset(), height: o.height };
    return ws(n, c, l, a);
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
    return typeof s == "function" && (s = s()), typeof s != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(s.trim()) ? 0 : ks(s, H(this.scroller, this.resolvedAxis()));
  }
  /** Absolute document-Y that a debug marker's "trigger" line (left-aligned, follows the page)
   * should sit at - always the "<triggerEdge>" component of a position string, resolved against
   * the trigger element's own current position. Falls back to `computedY` (the already-resolved
   * scrollY-threshold, i.e. `this.startY`/`this.endY`) for a plain number/function or a
   * whole-string relative "+=N", which carry no independent trigger-edge token to resolve. */
  resolveMarkerTriggerY(i, t, s) {
    let n = i ?? t;
    if (typeof n == "function" && (n = n()), typeof n != "string" || /^[+-]=\d+(?:\.\d+)?$/.test(n.trim())) return s;
    const r = this.triggerEl.getBoundingClientRect(), o = j(this.scroller, this.resolvedAxis());
    return Es(n, this.axisRect(r), o);
  }
  refresh() {
    var i, t, s, n;
    if (!this.killed) {
      if ((i = this.stickyHandle) == null || i.setPhase("before"), this.vars.syncTo ? (this.measureSyncSourceEdges(), this.startY = this.resolveSyncSourcePosition(this.vars.start, "top bottom"), this.endY = this.resolveSyncSourcePosition(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1e-4)) : (this.startY = this.resolvePositionValue(this.vars.start, "top bottom"), this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY), this.endY <= this.startY && (this.endY = this.startY + 1)), this.vars.sticky) {
        const r = this.vars.sticky === !0 ? this.triggerEl : typeof this.vars.sticky == "string" ? ve(this.vars.sticky) : this.vars.sticky;
        r instanceof Element ? (this.stickyHandle ?? (this.stickyHandle = xs(r)), this.stickyHandle.setStickyTop(this.stickyHandle.naturalDocTop - this.startY), this.stickyHandle.setDistance(this.endY - this.startY)) : console.warn(`[six] OnScroll: sticky must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.sticky)}, ignoring`);
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
    return this.vars.syncTo ? this.vars.syncTo.totalProgress() : j(this.scroller, this.resolvedAxis());
  }
  update(i = !1) {
    var l, a, c, d, u, f, m, p, g, b, x, v, E, M, I, $;
    if (this.killed) return;
    const t = this.currentPosition(), s = this.computeProgress(t), n = t >= this.startY && t <= this.endY, r = t >= this.lastScroll, o = this.wasInside;
    this.stickyHandle && this.stickyHandle.setPhase(t < this.startY ? "before" : t > this.endY ? "after" : "during"), i && !this.syncController && !o && t >= this.startY ? ((a = (l = this.vars).onEnter) == null || a.call(l, this), (c = this.vars.animation) == null || c.totalProgress(1)) : n && !o ? r ? ((u = (d = this.vars).onEnter) == null || u.call(d, this), this.syncController || (f = this.vars.animation) == null || f.play()) : (p = (m = this.vars).onEnterBack) == null || p.call(m, this) : !n && o && (r ? (b = (g = this.vars).onLeave) == null || b.call(g, this) : (v = (x = this.vars).onLeaveBack) == null || v.call(x, this)), this.wasInside = n, this.lastScroll = t, i ? (E = this.syncController) == null || E.snapTo(s) : (M = this.syncController) == null || M.update(s), (n || n !== o) && (($ = (I = this.vars).onUpdate) == null || $.call(I, this));
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
    this.killed = !0, this.vars.syncTo ? this.vars.syncTo.off("update", this.boundOnSyncSourceUpdate) : ps(this.scroller, this.boundOnScroll), qe(this.boundOnResize), (t = this.stickyHandle) == null || t.revert(), (s = this.syncController) == null || s.kill(), (n = this.markerHandle) == null || n.remove();
    const i = et.indexOf(this);
    i !== -1 && et.splice(i, 1);
  }
  static create(i) {
    return new Rt(i);
  }
  static refresh() {
    for (const i of [...et]) i.refresh();
  }
  static getAll() {
    return et;
  }
}
function As(e, i) {
  return tt(e, i);
}
function Ts(e) {
  return document.getElementById(e);
}
function Ms(e, i) {
  return Array.from((i ?? document).getElementsByClassName(e));
}
function nt(e, i, t) {
  return t === void 0 ? (s) => nt(e, i, s) : t < e ? e : t > i ? i : t;
}
function B(e, i, t, s) {
  if (Array.isArray(e))
    return e[Math.floor(Math.random() * e.length)];
  const n = e, r = () => {
    const o = n + Math.random() * (i - n);
    return t ? Math.round(o / t) * t : o;
  };
  return s ? r : r();
}
const Is = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayOf: As,
  clamp: nt,
  getByClass: Ms,
  getById: Ts,
  random: B
}, Symbol.toStringTag, { value: "Module" }));
function Os(e, i, t) {
  return e + (i - e) * t;
}
function _s(e, i, t, s) {
  return Os(e, i, 1 - Math.exp(-t * s));
}
class Rs {
  constructor(i) {
    h(this, "value");
    h(this, "to");
    h(this, "from");
    h(this, "elapsed", 0);
    h(this, "duration");
    h(this, "ease");
    h(this, "lerpAmount");
    this.value = this.to = this.from = i;
  }
  get target() {
    return this.to;
  }
  get isSettled() {
    return this.value === this.to;
  }
  /** Redirects the chase toward `target` using `vars` (always re-specified by the caller, matching Lenis's own call sites - see wheel.ts/scroll-to.ts callers, which always know their own mode). */
  retarget(i, t) {
    this.duration = t.duration, this.ease = t.duration !== void 0 ? t.ease : void 0, this.lerpAmount = t.duration === void 0 ? t.lerp : void 0, this.from = this.value, this.to = i, this.elapsed = 0;
  }
  /** Instantly moves both the current value and target to `v` - no animation, e.g. for resize reconciliation. */
  jump(i) {
    this.value = this.to = this.from = i, this.elapsed = 0;
  }
  /** Advances by `deltaSeconds`. Returns true on the exact call where `value` reaches `to` (fires once, not on every already-settled call after). */
  advance(i) {
    if (this.value === this.to) return !1;
    if (this.duration !== void 0 && this.ease) {
      this.elapsed += i;
      const t = this.duration > 0 ? Math.min(this.elapsed / this.duration, 1) : 1, s = t >= 1;
      return this.value = s ? this.to : this.from + (this.to - this.from) * this.ease(t), s;
    }
    return this.lerpAmount ? (this.value = _s(this.value, this.to, this.lerpAmount * 60, i), Math.round(this.value) === Math.round(this.to) && (this.value = this.to), this.value === this.to) : (this.value = this.to, !0);
  }
}
const Ps = 100 / 6;
function Se(e, i) {
  return e === 1 ? Ps : e === 2 ? i : 1;
}
function Ls(e, i, t, s = 1) {
  return {
    deltaX: e.deltaX * Se(e.deltaMode, i) * s,
    deltaY: e.deltaY * Se(e.deltaMode, t) * s
  };
}
function Ce(e, i) {
  return i === "y" ? e.top : e.left;
}
function zs(e, i, t) {
  const { axis: s, scroller: n, currentScroll: r, limit: o } = t;
  if (typeof e == "number") return e + i;
  if (typeof e == "string" && ["top", "left", "start", "#"].includes(e)) return i;
  if (typeof e == "string" && ["bottom", "right", "end"].includes(e)) return o + i;
  let l;
  if (typeof e == "string") {
    const g = e.startsWith("#") ? document.getElementById(e.slice(1)) : document.querySelector(e);
    if (!g)
      return console.warn(`[six] smoothScroll: scrollTo target "${e}" not found`), null;
    l = g;
  } else
    l = e;
  let a = i;
  if (n !== window) {
    const g = n.getBoundingClientRect();
    a -= Ce(g, s);
  }
  const c = l.getBoundingClientRect(), d = getComputedStyle(l), u = parseFloat(s === "y" ? d.scrollMarginTop : d.scrollMarginLeft), f = n === window ? document.documentElement : n, m = getComputedStyle(f), p = parseFloat(s === "y" ? m.scrollPaddingTop : m.scrollPaddingLeft);
  return Ce(c, s) + r - (Number.isNaN(u) ? 0 : u) - (Number.isNaN(p) ? 0 : p) + a;
}
const Bs = 0.1;
class $s {
  constructor(i = {}) {
    h(this, "vars");
    h(this, "scroller");
    h(this, "axis");
    h(this, "motion");
    h(this, "limit", 0);
    h(this, "animating", !1);
    h(this, "stopped", !1);
    h(this, "locked", !1);
    h(this, "killed", !1);
    h(this, "lastValue", 0);
    h(this, "lastMoveTime", 0);
    h(this, "_velocity", 0);
    h(this, "_direction", 0);
    h(this, "pendingOnComplete");
    h(this, "listeners", {});
    h(this, "resizeObserver", null);
    h(this, "boundWheel", (i) => this.onWheel(i));
    h(this, "boundTouchMove", (i) => this.onTouchMove(i));
    h(this, "boundNativeScroll", () => this.onNativeScroll());
    h(this, "boundWindowResize", () => this.onWindowResize());
    h(this, "boundTick", (i, t) => this.tick(t));
    var s;
    this.vars = i, this.scroller = Ne(i.scroller), this.axis = i.axis ?? "y";
    const t = j(this.scroller, this.axis);
    this.motion = new Rs(t), this.lastValue = t, this.lastMoveTime = this.now(), this.limit = Lt(this.scroller, this.axis), (s = Ot()) == null || s._capture(this), this.scroller.addEventListener("wheel", this.boundWheel, { passive: !1 }), this.scroller.addEventListener("touchmove", this.boundTouchMove, { passive: !1 }), this.scroller.addEventListener("scroll", this.boundNativeScroll, { passive: !0 }), Fe(this.boundWindowResize), this.observeContentResize(), this.updateClassName(), T.add(this.boundTick);
  }
  // ---- per-frame motion ----
  tick(i) {
    if (this.killed || !this.animating) return;
    const t = this.motion.value, s = this.motion.advance(i / 1e3);
    if (this.motion.value !== t && this.commitPosition(this.motion.value), s) {
      this.animating = !1, this.locked = !1, this.updateClassName();
      const n = this.pendingOnComplete;
      this.pendingOnComplete = void 0, n == null || n(this), this.emit("stop");
    }
  }
  onWheel(i) {
    if (this.killed || i.ctrlKey || i.defaultPrevented) return;
    const { deltaX: t, deltaY: s } = Ls(i, H(this.scroller, "x"), H(this.scroller, "y"), this.vars.wheelMultiplier ?? 1), n = this.axis === "x" ? Math.abs(s) > Math.abs(t) ? s : t : s;
    if (n === 0 || (i.cancelable && i.preventDefault(), this.stopped || this.locked)) return;
    this.pendingOnComplete = void 0;
    const r = nt(0, this.limit, this.motion.target + n);
    this.retarget(r, this.resolveMotionVars());
  }
  /** Touch is otherwise left fully native (see the class doc) - this exists ONLY to block it while stopped/locked, e.g. so a modal's stop() actually freezes the background on mobile too, not just wheel. */
  onTouchMove(i) {
    this.killed || !(this.stopped || this.locked) || i.cancelable && i.preventDefault();
  }
  /** Reconciles internal state after a scroll this instance didn't cause itself - scrollbar drag, keyboard (Home/End/PageDown/Space), native touch (untouched by default), or any other code's own programmatic scroll. Guarded on `animating` because this also receives this instance's OWN synthetic + trailing-native events from applyScroll(), which must be ignored - see the class doc. */
  onNativeScroll() {
    if (this.killed || this.animating) return;
    _t();
    const i = j(this.scroller, this.axis);
    i !== this.motion.value && (this.motion.jump(i), this.recordVelocity(i), this.emit("scroll"));
  }
  retarget(i, t) {
    this.motion.retarget(i, t), this.animating || (this.animating = !0, this.updateClassName());
  }
  commitPosition(i) {
    this.applyScroll(i), this.recordVelocity(i), this.emit("scroll");
  }
  applyScroll(i) {
    us(this.scroller, this.axis, i), this.scroller.dispatchEvent(new Event("scroll"));
  }
  now() {
    return typeof performance < "u" ? performance.now() : Date.now();
  }
  recordVelocity(i) {
    const t = this.now(), s = (t - this.lastMoveTime) / 1e3;
    this._velocity = s > 0 ? (i - this.lastValue) / s : 0, this._direction = this._velocity > 0 ? 1 : this._velocity < 0 ? -1 : 0, this.lastValue = i, this.lastMoveTime = t;
  }
  resolveMotionVars(i) {
    let t = (i == null ? void 0 : i.duration) ?? this.vars.duration, s = (i == null ? void 0 : i.ease) ?? this.vars.ease;
    return t !== void 0 && s === void 0 ? s = "expoOut" : t === void 0 && s !== void 0 && (t = 1), t !== void 0 ? { duration: t, ease: ze(s) } : { lerp: (i == null ? void 0 : i.lerp) ?? this.vars.lerp ?? Bs };
  }
  // ---- resize ----
  observeContentResize() {
    if (typeof ResizeObserver > "u") return;
    const i = this.scroller === window ? document.documentElement : this.scroller;
    this.resizeObserver = new ResizeObserver(() => {
      this.killed || (this.limit = Lt(this.scroller, this.axis));
    }), this.resizeObserver.observe(i);
  }
  onWindowResize() {
    if (this.killed) return;
    this.limit = Lt(this.scroller, this.axis);
    const i = j(this.scroller, this.axis);
    this.motion.jump(i), this.animating = !1, this.locked = !1, this.pendingOnComplete = void 0, this.recordVelocity(i), this.updateClassName();
  }
  // ---- public API ----
  scrollTo(i, t = {}) {
    var r, o, l, a;
    if (this.killed || (this.stopped || this.locked) && !t.force) return;
    const s = zs(i, t.offset ?? 0, {
      axis: this.axis,
      scroller: this.scroller,
      currentScroll: this.motion.value,
      limit: this.limit
    });
    if (s === null) return;
    const n = nt(0, this.limit, s);
    if (n === this.motion.target && !this.animating) {
      (r = t.onStart) == null || r.call(t, this), (o = t.onComplete) == null || o.call(t, this);
      return;
    }
    if ((l = t.onStart) == null || l.call(t, this), t.immediate) {
      this.motion.jump(n), this.animating = !1, this.locked = !1, this.pendingOnComplete = void 0, this.commitPosition(n), (a = t.onComplete) == null || a.call(t, this);
      return;
    }
    this.pendingOnComplete = t.onComplete, t.lock && (this.locked = !0), this.retarget(n, this.resolveMotionVars(t));
  }
  /** Freezes scrolling: wheel AND touch-drag input are swallowed (preventDefault, no movement) until start() - note this does NOT prevent dragging the native scrollbar thumb itself, which no JS API can intercept. Cancels any in-flight motion at its current position - matches how a modal opening should freeze the page exactly where it is, not finish animating first. */
  stop() {
    this.killed || this.stopped || (this.stopped = !0, this.locked = !1, this.animating = !1, this.pendingOnComplete = void 0, this.motion.jump(this.motion.value), this.updateClassName(), this.emit("stop"));
  }
  start() {
    this.killed || !this.stopped || (this.stopped = !1, this.updateClassName(), this.emit("start"));
  }
  on(i, t) {
    var s;
    return ((s = this.listeners)[i] ?? (s[i] = /* @__PURE__ */ new Set())).add(t), this;
  }
  off(i, t) {
    var s;
    return (s = this.listeners[i]) == null || s.delete(t), this;
  }
  emit(i) {
    var t, s, n, r, o, l, a;
    (t = this.listeners[i]) == null || t.forEach((c) => c(this)), i === "scroll" ? (n = (s = this.vars).onScroll) == null || n.call(s, this) : i === "start" ? (o = (r = this.vars).onStart) == null || o.call(r, this) : i === "stop" && ((a = (l = this.vars).onStop) == null || a.call(l, this));
  }
  updateClassName() {
    const i = this.scroller === window ? document.documentElement : this.scroller;
    i.classList.toggle("six-smooth", !this.killed), i.classList.toggle("six-smooth-scrolling", this.animating), i.classList.toggle("six-smooth-stopped", this.stopped);
  }
  kill() {
    var i;
    this.killed || (this.killed = !0, this.scroller.removeEventListener("wheel", this.boundWheel), this.scroller.removeEventListener("touchmove", this.boundTouchMove), this.scroller.removeEventListener("scroll", this.boundNativeScroll), qe(this.boundWindowResize), (i = this.resizeObserver) == null || i.disconnect(), this.resizeObserver = null, T.remove(this.boundTick), this.updateClassName(), this.listeners = {});
  }
  get scroll() {
    return this.motion.value;
  }
  get progress() {
    return this.limit === 0 ? 1 : nt(0, 1, this.scroll / this.limit);
  }
  get velocity() {
    return this._velocity;
  }
  get direction() {
    return this._direction;
  }
  get isScrolling() {
    return this.animating;
  }
  get isStopped() {
    return this.stopped;
  }
}
function Ds(e) {
  return new $s(e);
}
function we(e, i) {
  const t = e * Math.PI / 180;
  return {
    dx: i * Math.sin(t),
    dy: -i * Math.cos(t)
  };
}
function Ns(e, i, t, s) {
  return {
    x: e * s,
    y: i * s + 0.5 * t * s * s
  };
}
function Fs(e) {
  return typeof e == "string" ? Array.from(document.querySelectorAll(e)) : e instanceof Element ? [e] : Array.from(e).filter((i) => i instanceof Element);
}
function Bt(e) {
  return e instanceof HTMLElement || e instanceof SVGElement;
}
function qs(e, i, t, s) {
  e.style.position = s ? "fixed" : "absolute", e.style.left = `${i}px`, e.style.top = `${t}px`, e.style.margin = "0", e.style.pointerEvents = "none", e.style.willChange = "transform", e.style.display = "";
}
function Ys(e, i) {
  const t = e.getBoundingClientRect();
  if (i === document.body)
    return { cx: t.left + t.width / 2, cy: t.top + t.height / 2, fixed: !0 };
  getComputedStyle(i).position === "static" && (i.style.position = "relative");
  const s = i.getBoundingClientRect();
  return {
    cx: t.left - s.left + t.width / 2,
    cy: t.top - s.top + t.height / 2,
    fixed: !1
  };
}
const ke = 0.12, Ye = 0.4, Ws = 15;
function Xs(e, i, t) {
  e.exitedViewportAt === null && e.originY + i > window.innerHeight && (e.exitedViewportAt = t);
}
function Vs(e, i) {
  if (e.exitedViewportAt === null) return "1";
  const t = (i - e.exitedViewportAt) / Ye;
  return String(Math.max(0, 1 - t));
}
function Hs(e, i, t, s) {
  const n = e.el;
  if (!n) return;
  const { x: r, y: o } = Ns(e.vx, e.vy, i, t), l = e.rotation0 + e.rotationSpeed * t;
  if (Xs(e, o, t), e.direct)
    n.style.transform = `translate(${r}px, ${o}px) rotate(${l}deg)`;
  else {
    const a = t < ke ? t / ke : 1, c = e.scale * (1 - (1 - a) * (1 - a));
    n.style.transform = `translate(-50%, -50%) translate(${r}px, ${o}px) rotate(${l}deg) scale(${c})`;
  }
  s && (n.style.opacity = Vs(e, t));
}
function Us(e, i) {
  var ct, U;
  const t = i.clone === void 0, s = Fs(i.targets), n = tt(e)[0], r = i.container ?? document.body, o = t ? s.length : i.clone, [l, a] = i.spread ?? [0, 360], [c, d] = i.power ?? [160, 380], u = i.gravity ?? 650, [f, m] = i.scale ?? [0.5, 1.1], [p, g] = i.rotationSpeed ?? [-360, 360], b = i.fade ?? !0, x = i.stagger ?? 0, v = { kill() {
  } };
  if (s.length === 0)
    return console.warn("[six] burst() requires at least one resolvable target"), (ct = i.onComplete) == null || ct.call(i), v;
  if (!t && !n)
    return console.warn("[six] burst() requires a resolvable origin element when `clone` is set"), (U = i.onComplete) == null || U.call(i), v;
  let E = 0, M = 0, I = !0;
  t || ({ cx: E, cy: M, fixed: I } = Ys(n, r));
  const $ = I ? M : r.getBoundingClientRect().top + M, F = T.time, D = [];
  if (t) {
    const w = s.map((y) => Bt(y) ? y.getBoundingClientRect() : null);
    s.forEach((y, k) => {
      const z = w[k];
      if (!z || !Bt(y)) return;
      const R = B(l, a), L = B(c, d), { dx: V, dy: Pt } = we(R, L);
      y.style.position = "fixed", y.style.left = `${z.left}px`, y.style.top = `${z.top}px`, y.style.margin = "0", y.style.pointerEvents = "none", y.style.willChange = "transform", D.push({
        template: null,
        el: y,
        direct: !0,
        spawn: F + (x ? k * x : 0),
        vx: V,
        vy: Pt,
        rotation0: 0,
        rotationSpeed: B(p, g),
        scale: 1,
        originY: z.top,
        exitedViewportAt: null,
        done: !1
      });
    });
  } else
    for (let w = 0; w < o; w++) {
      const y = s.length === 1 ? s[0] : B(s), k = B(l, a), z = B(c, d), { dx: R, dy: L } = we(k, z);
      D.push({
        template: y,
        el: null,
        direct: !1,
        spawn: F + (x ? w * x : 0),
        vx: R,
        vy: L,
        rotation0: B(0, 360),
        rotationSpeed: B(p, g),
        scale: B(f, m),
        originY: $,
        exitedViewportAt: null,
        done: !1
      });
    }
  let A = D.length, C = !1;
  const _ = () => {
    var w;
    C || (C = !0, T.remove(q), (w = i.onComplete) == null || w.call(i));
  }, q = (w) => {
    for (const y of D) {
      if (y.done || w < y.spawn) continue;
      if (!y.el) {
        const L = y.template.cloneNode(!0);
        if (L.removeAttribute("id"), !Bt(L)) {
          y.done = !0, A--;
          continue;
        }
        qs(L, E, M, I), r.appendChild(L), y.el = L;
      }
      const k = w - y.spawn;
      Hs(y, u, k, b);
      const z = b && y.exitedViewportAt !== null && k >= y.exitedViewportAt + Ye, R = !b && y.exitedViewportAt !== null;
      (z || R || k >= Ws) && (y.el.style.willChange = "", z && (y.el.style.opacity = "0"), y.direct || y.el.remove(), y.done = !0, A--, A === 0 && _());
    }
  };
  return T.add(q), q(F, 0, T.currentFrame), {
    kill() {
      var w;
      if (!C) {
        C = !0, T.remove(q);
        for (const y of D)
          y.direct || (w = y.el) == null || w.remove(), y.done = !0;
      }
    }
  };
}
function xt(e) {
  return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? (e -= 1.5 / 2.75, 7.5625 * e * e + 0.75) : e < 2.5 / 2.75 ? (e -= 2.25 / 2.75, 7.5625 * e * e + 0.9375) : (e -= 2.625 / 2.75, 7.5625 * e * e + 0.984375);
}
const st = 1.70158, yt = st * 1.525, We = {
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
  backIn: (e) => (st + 1) * e * e * e - st * e * e,
  backOut: (e) => (e--, 1 + (st + 1) * e * e * e + st * e * e),
  backInOut: (e) => {
    if (e < 0.5) {
      const t = 2 * e;
      return t * t * ((yt + 1) * t - yt) / 2;
    }
    const i = 2 * e - 2;
    return (i * i * ((yt + 1) * i + yt) + 2) / 2;
  },
  bounceIn: (e) => 1 - xt(1 - e),
  bounceOut: xt,
  bounceInOut: (e) => e < 0.5 ? (1 - xt(1 - 2 * e)) / 2 : (1 + xt(2 * e - 1)) / 2
}, Gs = {
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
function Ks(e) {
  return Gs[e] ?? "ease-out";
}
const Zt = /* @__PURE__ */ new WeakMap();
let Vt = [], Ht = null;
function Ee(e, i) {
  Vt.push({ instance: e, type: i }), Ht === null && (Ht = requestAnimationFrame(js));
}
function js() {
  const e = Vt.slice();
  Vt.length = 0, Ht = null;
  for (let i = 0; i < e.length; i++) {
    const { instance: t, type: s } = e[i];
    s === "enter" ? t.enter() : t.leave && t.leave();
  }
}
let $t = null;
function Xe() {
  return typeof window > "u" ? null : ($t || ($t = new IntersectionObserver(
    (e) => {
      for (let i = 0; i < e.length; i++) {
        const t = e[i], s = Zt.get(t.target);
        s && (t.isIntersecting ? Ee(s, "enter") : Ee(s, "leave"));
      }
    },
    { threshold: 0.05 }
  )), $t);
}
function Ve(e, i) {
  var t;
  Zt.set(e, i), (t = Xe()) == null || t.observe(e);
}
function Ut(e) {
  var i;
  Zt.delete(e), (i = Xe()) == null || i.unobserve(e);
}
function at(e, i) {
  if (e == null) return i;
  const t = e.trim();
  if (!t) return i;
  const s = Number(t);
  return Number.isFinite(s) ? s * 1e3 : i;
}
const O = typeof HTMLElement < "u" ? HTMLElement : class {
}, N = class N extends O {
  constructor() {
    super(...arguments);
    h(this, "animation");
    h(this, "options");
    h(this, "order", N.counter++);
    h(this, "cascadeSet");
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
    if (this.options = this.getOptions(), N.reduceMotion) {
      this.style.opacity = "1", this.style.transform = "none";
      return;
    }
    this.setInitialState(), Ve(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave()
    });
  }
  disconnectedCallback() {
    var t, s;
    (t = this.animation) == null || t.cancel(), Ut(this), (s = this.cascadeSet) == null || s.delete(this), this.cascadeSet = void 0;
  }
  handleEnter() {
    this.hasAttribute("replay") || Ut(this), this.isCascade ? N.enqueueCascade(this) : this.play();
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
      easing: r && r in We ? r : "none",
      duration: at(this.getAttribute("duration"), 500),
      delay: at(this.getAttribute("delay"), 50)
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
        easing: Ks(r),
        fill: "both"
      }
    ), this.animation.onfinish = () => {
      var c;
      this.style.opacity = "1", this.style.transform = "translate3d(0,0,0)", (c = this.animation) == null || c.cancel(), this.animation = void 0;
    };
  }
};
h(N, "counter", 0), h(N, "_mediaQuery", null), h(N, "cascadeQueue", /* @__PURE__ */ new Map()), h(N, "isProcessingCascade", !1);
let Gt = N;
function Qs() {
  customElements.get("sx-animate") || customElements.define("sx-animate", Gt);
}
const Jt = {
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
}, Ct = 180 / Math.PI;
function Zs(e) {
  const i = window.getComputedStyle(e).transform;
  return !i || i === "none" ? { ...Jt } : i.startsWith("matrix3d") ? tn(i) : Js(i);
}
function Js(e) {
  const i = e.match(/matrix\(([^)]+)\)/);
  if (!i) return { ...Jt };
  const t = i[1].split(",").map((f) => parseFloat(f.trim())), [s, n, r, o, l, a] = t, c = Math.sqrt(s * s + n * n), d = Math.sqrt(r * r + o * o), u = Math.atan2(n, s) * Ct;
  return {
    x: l,
    y: a,
    z: 0,
    rotate: u,
    rotateX: 0,
    rotateY: 0,
    rotateZ: u,
    scale: c,
    scaleX: c,
    scaleY: d,
    skewX: 0,
    skewY: 0
  };
}
function tn(e) {
  const i = e.match(/matrix3d\(([^)]+)\)/);
  if (!i) return { ...Jt };
  const t = i[1].split(",").map((v) => parseFloat(v.trim())), s = t[0], n = t[1], r = t[2], o = t[4], l = t[5], a = t[6];
  t[8], t[9];
  const c = t[10], d = t[12], u = t[13], f = t[14], m = Math.sqrt(s * s + n * n + r * r), p = Math.sqrt(o * o + l * l + a * a), g = Math.atan2(n, s) * Ct, b = Math.atan2(-r, Math.sqrt(a * a + c * c)) * Ct, x = Math.atan2(a, c) * Ct;
  return {
    x: d,
    y: u,
    z: f,
    rotate: g,
    rotateX: x,
    rotateY: b,
    rotateZ: g,
    scale: m,
    scaleX: m,
    scaleY: p,
    skewX: 0,
    skewY: 0
  };
}
const en = {
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
}, Ae = /* @__PURE__ */ new WeakMap();
function sn(e) {
  const i = Zs(e);
  return {
    ...en,
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
function He(e) {
  let i = Ae.get(e);
  return i || (i = sn(e), Ae.set(e, i)), i;
}
function X(e, i, t) {
  He(e)[i] = t;
}
function lt(e) {
  const i = He(e);
  return `translate(${i.xPercent}%, ${i.yPercent}%) translate3d(${i.x}px, ${i.y}px, ${i.z}px) rotate(${i.rotate}deg) rotateX(${i.rotateX}deg) rotateY(${i.rotateY}deg) rotateZ(${i.rotateZ}deg) scale(${i.scale}) scaleX(${i.scaleX}) scaleY(${i.scaleY}) skewX(${i.skewX}deg) skewY(${i.skewY}deg)`;
}
class nn extends O {
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
    h(this, "updateAnimation", (t, s) => {
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
    }), this.resizeObserver.observe(this), Ve(this, {
      enter: () => {
        this.isVisible || (this.isVisible = !0, T.add(this.updateAnimation));
      },
      leave: () => {
        this.isVisible && (this.isVisible = !1, T.remove(this.updateAnimation));
      }
    });
  }
  disconnectedCallback() {
    var t;
    this.removeEventListener("mouseenter", this.onMouseEnter), this.removeEventListener("mouseleave", this.onMouseLeave), (t = this.resizeObserver) == null || t.disconnect(), this.setupRafId !== null && cancelAnimationFrame(this.setupRafId), Ut(this), T.remove(this.updateAnimation);
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
          for (let c = 1; c < l; c++)
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
    this.inner && (X(this.inner, this.isVertical ? "y" : "x", t), this.inner.style.transform = lt(this.inner));
  }
}
class rn extends O {
}
class on extends O {
  connectedCallback() {
    this.style.cssText = "display:inline-block;flex-shrink:0;";
  }
}
function an() {
  customElements.get("sx-marquee") || customElements.define("sx-marquee", nn), customElements.get("sx-marquee-inner") || customElements.define("sx-marquee-inner", rn), customElements.get("sx-marquee-item") || customElements.define("sx-marquee-item", on);
}
class ln extends O {
  constructor() {
    super();
  }
}
class hn {
  constructor() {
    h(this, "sliders", /* @__PURE__ */ new Map());
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
const Q = new hn();
class cn extends O {
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
    const s = t.target;
    if (s.classList.contains("sx-slider-pagination-bullet")) {
      const n = Number(s.getAttribute("data-index"));
      this.goToSlide(n);
    }
  }
  goToSlide(t) {
    const s = this.getAttribute("name");
    let n = null;
    s ? n = Q.get(s) : n = this.closest("sx-slider"), n && typeof n.goTo == "function" && n.goTo(t);
  }
  renderBullets(t) {
    const s = this.getAttribute("effect"), n = s === "dynamic", r = s === "snake", o = s === "fraction", l = t.join(",") + `_effect:${s}`;
    if (this.renderedSignature === l) return;
    if (this.renderedSignature = l, this.innerHTML = "", this.snakeBar = null, this.cachedBullets = [], o) {
      this.innerContainer = null, this.style.width = "";
      const c = document.createElement("span");
      c.className = "sx-slider-pagination-current", c.textContent = "1";
      const d = document.createTextNode(" / "), u = document.createElement("span");
      u.className = "sx-slider-pagination-total", u.textContent = t.length.toString();
      const f = document.createDocumentFragment();
      f.appendChild(c), f.appendChild(d), f.appendChild(u), this.appendChild(f);
      return;
    }
    const a = document.createDocumentFragment();
    if (r) {
      this.innerContainer = null, this.style.width = "", this.style.position = "relative", t.forEach((c, d) => {
        const u = this.createBulletDOM(c, d, !1);
        this.cachedBullets.push(u), a.appendChild(u);
      }), this.snakeBar = document.createElement("div"), this.snakeBar.className = "sx-slider-pagination-bar", this.snakeBar.style.position = "absolute", this.snakeBar.style.zIndex = "10", this.snakeBar.style.transition = "width 150ms ease-out, left 150ms ease-out", a.appendChild(this.snakeBar), this.appendChild(a);
      return;
    }
    if (n) {
      this.innerContainer = document.createElement("div"), this.innerContainer.className = "sx-slider-pagination-inner", a.appendChild(this.innerContainer), t.forEach((c, d) => {
        const u = this.createBulletDOM(c, d, !1);
        this.cachedBullets.push(u), this.innerContainer.appendChild(u);
      }), t.length > this.maxVisibleBullets ? this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px` : this.style.width = "auto", this.appendChild(a);
      return;
    }
    this.innerContainer = null, this.style.width = "", t.forEach((c, d) => {
      const u = this.createBulletDOM(c, d, s === "number");
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
        const g = t * 20, b = this.lastActiveIndex * 20;
        if (t > this.lastActiveIndex) {
          const x = g - b + 10;
          this.snakeBar.style.left = `${b}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.left = `${g}px`, this.snakeBar.style.width = "10px");
          }, 150);
        } else if (t < this.lastActiveIndex) {
          const x = b - g + 10;
          this.snakeBar.style.left = `${g}px`, this.snakeBar.style.width = `${x}px`, this.snakeTimeout = window.setTimeout(() => {
            this.getAttribute("effect") === "snake" && this.snakeBar && (this.snakeBar.style.width = "10px");
          }, 150);
        } else
          this.snakeBar.style.left = `${g}px`, this.snakeBar.style.width = "10px";
      }
      this.lastActiveIndex = t;
      return;
    }
    if (!n || l <= this.maxVisibleBullets || !this.innerContainer) {
      this.innerContainer && (X(this.innerContainer, "x", 0), this.innerContainer.style.transform = lt(this.innerContainer));
      return;
    }
    let a = Math.max(0, t - Math.floor(this.maxVisibleBullets / 2));
    a = Math.min(a, l - this.maxVisibleBullets);
    const c = a + this.maxVisibleBullets - 1;
    o.forEach((u, f) => {
      f >= a && f <= c ? f === a ? u.classList.add(f === 0 ? "sx-bullet-main" : "sx-bullet-small") : f === a + 1 ? u.classList.add(f === 1 ? "sx-bullet-main" : "sx-bullet-medium") : f === c ? u.classList.add(
        f === l - 1 ? "sx-bullet-main" : "sx-bullet-small"
      ) : f === c - 1 ? u.classList.add(
        f === l - 2 ? "sx-bullet-main" : "sx-bullet-medium"
      ) : u.classList.add("sx-bullet-main") : u.classList.add("sx-bullet-small");
    });
    const d = -a * this.bulletWidthWithGap;
    X(this.innerContainer, "x", d), this.innerContainer.style.transform = lt(this.innerContainer);
  }
}
class dn extends O {
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
      const t = Q.get(i);
      t && t.next();
    } else {
      const t = this.closest("sx-slider");
      t && t.next();
    }
  }
}
class un extends O {
  constructor() {
    super();
    h(this, "bar");
    this.bar = document.createElement("div"), this.bar.className = "sx-slider-progress-bar";
  }
  connectedCallback() {
    this.contains(this.bar) || this.appendChild(this.bar);
  }
  update(t, s, n) {
    const r = Math.max(0, Math.min(1, t));
    this.bar.style.transition = n || "none", s === "vertical" ? (this.bar.style.transformOrigin = "top center", X(this.bar, "scaleY", r), X(this.bar, "scaleX", 1)) : (this.bar.style.transformOrigin = "left center", X(this.bar, "scaleX", r), X(this.bar, "scaleY", 1)), this.bar.style.transform = lt(this.bar);
  }
}
class fn extends O {
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
      const t = Q.get(i);
      t && t.prev();
    } else {
      const t = this.closest("sx-slider");
      t && t.prev();
    }
  }
}
class pn {
  constructor(i, t, s = 0.92) {
    h(this, "velocity", 0);
    h(this, "friction");
    h(this, "onUpdate");
    h(this, "onComplete");
    h(this, "isRunning", !1);
    h(this, "tickerCallback");
    this.onUpdate = i, this.onComplete = t, this.friction = s, this.tickerCallback = (n, r, o) => this.loop(r);
  }
  setFriction(i) {
    this.friction = i;
  }
  addVelocity(i) {
    this.velocity += i, this.isRunning || this.start();
  }
  stop() {
    this.isRunning && (this.isRunning = !1, this.velocity = 0, T.remove(this.tickerCallback));
  }
  start() {
    this.isRunning || (this.isRunning = !0, T.add(this.tickerCallback));
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
class gn extends O {
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
        const { max: s, min: n } = this.sliderCha.getBoundaries(), r = Math.max(
          n,
          Math.min(s, this.currentTranslate)
        );
        r !== this.currentTranslate && this.startMomentumScroll(r, 400);
      }
      this.sliderCha.startAutoplay();
    });
    h(this, "wheelInertia", new pn(
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
    h(this, "scrollTickerCallback", () => this.runScrollLoop());
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
    !this.sliderCha || this.sliderCha.options.drag === "false" || this.sliderCha.canScroll && (this.isResetting || (this.attachWindowDragListeners(), this.sliderCha.stopAutoplay(), this.cancelMomentumScroll(), this.wheelInertia.stop(), this.prevTranslate = this.currentTranslate, this.isDragging = !0, this.startX = this.getPositionAxis(t), this.lastClientAxis = this.startX, this.velocity = 0, this.dragXs = [this.startX], this.dragTimes = [performance.now()], this.style.transition = "none", this.checkLoopBoundsInstant()));
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
      const { max: l, min: a } = this.sliderCha.getBoundaries(), c = this.sliderCha.options.edgeResistance;
      o > l ? o = c <= 0 ? l : l + Math.min(c, (o - l) * 0.3) : o < a && (o = c <= 0 ? a : a - Math.min(c, (a - o) * 0.3)), this.currentTranslate = o;
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
        let a = t.autoSize ? this.sliderCha.getOffsetForIndex(l) : l * this.sliderCha.getSlideSizeWithGap(), c = t.autoSize ? this.sliderCha.getOffsetForIndex(l + 1) - a : this.sliderCha.getSlideSizeWithGap();
        if (t.centered) {
          const d = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          r = o + d / 2 - (a + c / 2);
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
    this.scrollStartTime = performance.now(), this.isScrollAnimating = !0, T.add(this.scrollTickerCallback);
  }
  runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;
    const s = performance.now() - this.scrollStartTime, n = Math.min(s / this.scrollDuration, 1), r = We.quartOut(n), l = (this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * r - this.currentTranslate) * this.scrollFriction;
    if (this.currentTranslate += l, this.setTransform(this.currentTranslate), this.sliderCha.options.loop)
      this.checkLoopBoundsInstant();
    else if (!this.noConstrain) {
      const { max: a, min: c } = this.sliderCha.getBoundaries(), d = this.sliderCha.options.edgeResistance;
      if (this.currentTranslate > a || this.currentTranslate < c) {
        if (this.currentTranslate > a) {
          if (d <= 0) {
            this.currentTranslate = a, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > a + d) {
            this.currentTranslate = a + d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(a, 600, void 0, !0);
            return;
          }
        } else if (this.currentTranslate < c) {
          if (d <= 0) {
            this.currentTranslate = c, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < c - d) {
            this.currentTranslate = c - d, this.setTransform(this.currentTranslate), this.cancelMomentumScroll(), this.startMomentumScroll(c, 600, void 0, !0);
            return;
          }
        }
        if (this.scrollFriction *= 0.6, Math.abs(l) < 1) {
          const f = this.currentTranslate > a ? a : c;
          this.startMomentumScroll(f, 600, void 0, !0);
          return;
        }
      }
    }
    n >= 1 && Math.abs(l) < 0.5 && (this.isScrollAnimating = !1, this.prevTranslate = this.currentTranslate, T.remove(this.scrollTickerCallback), this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate), this.sliderCha.startAutoplay());
  }
  cancelMomentumScroll() {
    this.isScrollAnimating = !1, T.remove(this.scrollTickerCallback);
  }
  checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;
    const t = this.sliderCha.originalSlidesCount, s = this.sliderCha.getCloneCount(), n = parseFloat(this.sliderCha.startPadding) || 0;
    let r = 0, o = 0;
    if (this.sliderCha.options.autoSize)
      o = this.sliderCha.getOffsetForIndex(s), r = this.sliderCha.getOffsetForIndex(s + t) - o;
    else {
      const g = this.sliderCha.getSlideSizeWithGap();
      o = s * g, r = t * g;
    }
    let l = 0;
    if (this.sliderCha.options.centered) {
      const g = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let b = 0;
      this.sliderCha.options.autoSize ? b = this.sliderCha.getOffsetForIndex(s + 1) - this.sliderCha.getOffsetForIndex(s) : b = this.sliderCha.getSlideSizeWithGap(), l = g / 2 - b / 2;
    }
    const a = -o + n + l, c = a - r;
    let d = !1, u = this.currentTranslate, f = 0, m = 0;
    const p = this.sliderCha.options.centered ? 50 : 0;
    this.currentTranslate > a + p ? (u = this.currentTranslate - r, f = -r, m = t, d = !0) : this.currentTranslate <= c - p && (u = this.currentTranslate + r, f = r, m = -t, d = !0), d && (this.isResetting = !0, this.style.transition = "none", this.currentTranslate = u, this.prevTranslate = this.currentTranslate, this.isScrollAnimating && (this.scrollFrom += f, this.scrollToTarget += f), this.setTransform(this.currentTranslate), this.sliderCha.shiftCurrentIndex(m), this.isResetting = !1);
  }
  setTransform(t) {
    this.sliderCha && (X(this, this.sliderCha.transformFn === "translateY" ? "y" : "x", t), this.style.transform = lt(this), this.sliderCha.updateProgress(t, this.style.transition));
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
      const c = this.sliderCha.getSlideSizeWithGap();
      l = r * c, a = c;
    }
    if (s.centered) {
      const c = this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      o += c / 2 - (l + a / 2);
    } else
      o -= l;
    if (!s.loop) {
      const { max: c, min: d } = this.sliderCha.getBoundaries();
      o = Math.max(d, Math.min(c, o));
    }
    if (this.currentTranslate = o, this.prevTranslate = this.currentTranslate, this.setTransform(this.currentTranslate), t && this.offsetHeight, s.loop) {
      const c = this.sliderCha.originalSlidesCount, d = this.sliderCha.getCloneCount();
      (r >= d + c || r < d) && setTimeout(() => {
        this.checkLoopBoundsInstant();
      }, s.speed);
    }
  }
}
class Mt {
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
class mn extends O {
  constructor() {
    super();
    h(this, "options");
    h(this, "originalOptions");
    h(this, "breakpointsConfig", null);
    h(this, "currentIndex", 0);
    // Which pagination dot is active, for non-loop sliders. Tracked as a
    // step count (incremented/decremented by exactly 1 on next()/prev()),
    // deliberately NOT derived from currentIndex - a per-move step that lands
    // between two dots (e.g. prev() off a boundary-clamped last stop landing
    // on a slide index between stop[n-2] and stop[n-1]) has no exact dot
    // match, and a "nearest stop" lookup at that position would pick the
    // dot the click stepped AWAY from, not the one being moved toward. Any
    // direct jump (goTo/sync/drag-snap/initial index) instead recomputes this
    // via findStopIndex() since there's no "step" to preserve there.
    h(this, "currentStopIndex", 0);
    // Signature of the last stops array seen by updateSlideAttributes() -
    // when it changes (per-view/per-move changing via a breakpoint or
    // attribute edit, on a slider that's already initialized and staying
    // non-loop) currentStopIndex is recomputed fresh, since a step count
    // tracked against the old grid has no meaning against a new one. Left
    // null until the first render so that pass doesn't skip recomputing too.
    h(this, "lastStopsKey", null);
    h(this, "lastFiredIndex", -1);
    // Whether there are more real slides than fit in one view at once - set
    // in updateLayout() (from the same `isShort` measurement used for
    // centerIfShort) and read by both nav/pagination visibility here and by
    // SxSliderTrack's dragStart, so all three agree on when the slider has
    // nothing to slide to and should go fully static.
    h(this, "canScroll", !0);
    h(this, "track", null);
    h(this, "resizeObserver");
    h(this, "originalSlidesCount", 0);
    h(this, "autoplayTimer", null);
    h(this, "isFirstInit", !0);
    h(this, "lastContainerSize", 0);
    h(this, "isFirstHeightMeasure", !0);
    h(this, "isClickRouting", !1);
    h(this, "slideOffsetsCache", null);
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
  getCloneCount() {
    return this.options.autoSize ? this.originalSlidesCount : this.options.perView;
  }
  updateProgress(t, s) {
    let n = 0, r = 0;
    const o = this.getBoundingClientRect()[this.sizeDim];
    if (this.options.loop) {
      const c = this.originalSlidesCount;
      if (c > 0 && this.track) {
        const d = this.getCloneCount(), u = parseFloat(this.startPadding) || 0;
        let f = 0, m = 0;
        if (this.options.autoSize)
          f = this.getOffsetForIndex(d), m = this.getOffsetForIndex(d + c) - f;
        else {
          const p = this.getSlideSizeWithGap();
          f = d * p, m = c * p;
        }
        if (m > 0) {
          r = o / m;
          let p = 0;
          if (this.options.centered) {
            let x = this.options.autoSize ? this.getOffsetForIndex(d + 1) - this.getOffsetForIndex(d) : this.getSlideSizeWithGap();
            p = o / 2 - x / 2;
          }
          n = (-f + u + p - t) / m, n = (n % 1 + 1) % 1;
        } else
          n = 1, r = 1;
      }
    } else {
      const { max: c, min: d } = this.getBoundaries(), u = c - d;
      u > 0 ? (n = (c - t) / u, r = o / (u + o)) : (n = 1, r = 1);
    }
    r = Math.max(0, Math.min(1, r));
    const l = r + n * (1 - r);
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
      typeof c.update == "function" && c.update(l, this.options.direction, s);
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
    if (this.track = this.querySelector("sx-slider-track"), this.options.name && Q.register(this.options.name, this), this.resizeObserver = new ResizeObserver(() => {
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
    ), this.options.name && Q.unregister(this.options.name), this.resizeObserver.disconnect(), this.stopAutoplay(), document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
  attributeChangedCallback() {
    this.parseOptions(), this.updateLayout(), this.startAutoplay();
  }
  parseOptions() {
    const t = (m) => m ? isNaN(Number(m)) ? m : `${m}px` : "0px", s = this.getAttribute("edge-resistance"), n = s !== null ? Number(s) : 100, r = this.getAttribute("interval"), o = at(r, 4e3), l = this.getAttribute("start-index"), a = l !== null ? Number(l) : 0, c = this.getAttribute("per-move");
    let d = "auto";
    if (c !== null && c !== "auto") {
      const m = Number(c);
      d = isNaN(m) ? "auto" : m;
    }
    let u = this.getAttribute("direction");
    u !== "horizontal" && u !== "vertical" && (u = "horizontal");
    let f = this.getAttribute("effect");
    f !== "fade" && (f = "slide"), this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: t(this.getAttribute("gap")),
      drag: this.getAttribute("drag") || "true",
      speed: at(this.getAttribute("speed"), 300),
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
    }, this.originalOptions = { ...this.options }, this.breakpointsConfig = Mt.parse(
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
    let n = !1;
    if (this.options.loop || s.forEach((p, g) => {
      p.setAttribute("data-real-index", g.toString());
    }), this.breakpointsConfig && this.originalOptions) {
      this.options = Mt.getMatch(
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
    ), n = !0);
    const r = this.track.querySelectorAll("[data-clone]").length, o = s.length - r;
    if (this.isFirstInit && o > 0) {
      const p = Math.max(
        0,
        Math.min(this.options.startIndex, o - 1)
      );
      if (this.options.loop) {
        const g = this.options.autoSize ? o : this.options.perView;
        this.currentIndex = g + p;
      } else
        this.currentIndex = p, n = !0;
      this.isFirstInit = !1;
    }
    const l = this.getAttribute("left-padding"), a = this.getAttribute("right-padding");
    !this.options.autoSize && this.options.perView === o && l && parseFloat(l) > 0 && a && parseFloat(a) > 0 ? (this.options.leftPadding = "0px", this.options.rightPadding = "0px") : this.breakpointsConfig || (this.options.leftPadding = this.formatUnit(l), this.options.rightPadding = this.formatUnit(a));
    const c = this.convertToPx(this.options.gap), d = this.convertToPx(this.options.leftPadding), u = this.convertToPx(this.options.rightPadding);
    if (this.options.autoSize)
      s.forEach((p) => {
        p.style[this.sizeDim] = "max-content";
      }), this.track.offsetHeight, s.forEach((p) => {
        const g = p.firstElementChild;
        g ? p.style[this.sizeDim] = `${g.getBoundingClientRect()[this.sizeDim]}px` : p.style[this.sizeDim] = "max-content", p.style[this.marginProp] = this.options.gap;
      }), this.options.perView = this.getVisibleSlidesCount();
    else {
      const b = ((t || window.innerWidth) - d - u - c * (this.options.perView - 1)) / this.options.perView;
      s.forEach((x) => {
        x.style[this.sizeDim] = `${b}px`, x.style[this.marginProp] = this.options.gap;
      });
    }
    let f = !1;
    const m = s.filter((p) => !p.hasAttribute("data-clone"));
    if (this.options.autoSize) {
      let p = 0;
      m.forEach((g) => {
        p += this.getRectSize(g) + c;
      }), p -= c, f = p < t;
    } else
      f = o < this.options.perView;
    this.canScroll = !f, n && !this.options.loop && (this.currentStopIndex = this.findStopIndex(
      this.getStops(this.getRealMaxIndex()),
      this.currentIndex
    )), this.options.centerIfShort && f ? (this.track.style.justifyContent = "center", this.options.loop && this.track.querySelectorAll("[data-clone]").forEach((g) => g.remove())) : this.track.style.justifyContent = "", this.invalidateOffsetsCache(), this.track.updatePosition(!0), this.updateSlideAttributes();
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
      let a = n - 1, c = this.options.autoSize ? this.getOffsetForIndex(a) : a * this.getSlideSizeWithGap(), d = this.options.autoSize ? this.getOffsetForIndex(a + 1) - c : this.getSlideSizeWithGap();
      o = s + t / 2 - (c + d / 2);
    }
    return { max: r, min: Math.min(r, o) };
  }
  updateSlideAttributes() {
    if (!this.track) return;
    const t = Array.from(this.track.children);
    if (t.length === 0) return;
    const s = this.options.loop, n = s ? this.originalSlidesCount : t.length;
    if (n === 0) return;
    const r = s ? this.getCloneCount() : 0, o = (x) => {
      if (!s) return x;
      let v = (x - r) % n;
      return v < 0 && (v += n), v;
    }, l = this.options.centered ? 0 : Math.floor(this.options.perView / 2), a = o(this.currentIndex);
    this.lastFiredIndex !== a && (this.lastFiredIndex = a, this.dispatchEvent(
      new CustomEvent("sx-change", {
        detail: { activeIndex: a }
      })
    ));
    const c = o(this.currentIndex - 1), d = o(this.currentIndex + 1), u = o(this.currentIndex + l), f = this.isFirstHeightMeasure;
    f && (this.isFirstHeightMeasure = !1);
    let m = null;
    f && (m = document.createElement("style"), m.innerHTML = "sx-slider-slide, sx-slider-slide * { transition: none !important; }", this.appendChild(m), this.offsetHeight), t.forEach((x, v) => {
      const E = o(v);
      x.setAttribute("aria-label", `${E + 1}/${n}`);
    }), this.options.lockActive && !this.isClickRouting && !f || t.forEach((x, v) => {
      x.removeAttribute("sx-slide-active"), x.removeAttribute("sx-slide-prev"), x.removeAttribute("sx-slide-next"), x.removeAttribute("sx-slide-center");
      const E = o(v);
      E === a && x.setAttribute("sx-slide-active", ""), E === c && x.setAttribute("sx-slide-prev", ""), E === d && x.setAttribute("sx-slide-next", ""), E === u && x.setAttribute("sx-slide-center", "");
    }), this.updateAutoHeight();
    const p = s ? n - 1 : this.getRealMaxIndex();
    this.updateNavigation(s ? void 0 : p);
    const g = this.canScroll ? this.getStops(p) : [];
    let b;
    if (s)
      b = this.findStopIndex(g, a);
    else {
      const x = g.join(",");
      this.lastStopsKey !== x && (this.currentStopIndex = this.findStopIndex(
        g,
        a
      ), this.lastStopsKey = x), b = Math.max(
        0,
        Math.min(this.currentStopIndex, g.length - 1)
      );
    }
    this.updatePagination(g, b), this.options.sync && (this.isClickRouting || !this.options.lockActive) && this.options.sync.split(",").map((v) => v.trim()).forEach((v) => {
      const E = Q.get(v);
      E && E.syncFromController(a);
    }), f && m && requestAnimationFrame(() => {
      m == null || m.remove();
    });
  }
  syncFromController(t) {
    if (!this.track) return;
    const s = this.options.loop, n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = s ? this.originalSlidesCount : n.length - r;
    if (((a) => {
      if (!s) return a;
      const c = this.getCloneCount();
      let d = (a - c) % o;
      return d < 0 && (d += o), d;
    })(this.currentIndex) !== t) {
      if (s) {
        const a = this.getCloneCount(), c = t + a, d = this.originalSlidesCount, u = n.length;
        let f = c, m = Math.abs(c - this.currentIndex);
        [c - d, c, c + d].forEach((g) => {
          if (g >= 0 && g < u) {
            const b = Math.abs(g - this.currentIndex);
            b < m && (m = b, f = g);
          }
        }), this.currentIndex = f;
      } else
        this.currentIndex = Math.max(0, Math.min(t, o - 1)), this.currentStopIndex = this.findStopIndex(
          this.getStops(this.getRealMaxIndex()),
          this.currentIndex
        );
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
      const c = t[a];
      if (!c) continue;
      const d = c.firstElementChild, u = d ? d.getBoundingClientRect().height : c.getBoundingClientRect().height;
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
    this.currentIndex = t, this.options.loop || (this.currentStopIndex = this.findStopIndex(
      this.getStops(this.getRealMaxIndex()),
      this.currentIndex
    )), this.updateSlideAttributes();
  }
  shiftCurrentIndex(t) {
    this.currentIndex += t, this.updateSlideAttributes();
  }
  getRealMaxIndex() {
    if (!this.track || this.track.children.length === 0) return 0;
    const t = this.track.children.length, { min: s } = this.getBoundaries(), n = this.options.autoSize ? 0 : this.getSlideSizeWithGap(), r = this.options.centered ? this.getBoundingClientRect()[this.sizeDim] : 0;
    for (let o = 0; o < t; o++) {
      let l = this.options.autoSize ? this.getOffsetForIndex(o) : o * n, a = this.options.autoSize ? this.getOffsetForIndex(o + 1) - l : n, c = parseFloat(this.startPadding) || 0;
      if (this.options.centered ? c += r / 2 - (l + a / 2) : c -= l, c <= s + 1)
        return o;
    }
    return Math.max(0, t - 1);
  }
  getResolvedPerMove() {
    return this.options.perMove === "auto" ? 1 : Math.max(1, this.options.perMove);
  }
  // The pagination dots for a non-loop slider: every `per-move` slides,
  // with a final stop clamped to maxIdx when the count doesn't divide
  // evenly (e.g. [0, 3, 4] for 7 slides / perView 3 / perMove 3).
  getStops(t) {
    const s = this.getResolvedPerMove(), n = [];
    if (s > 1 && !this.options.autoSize) {
      for (let r = 0; r < t; r += s)
        n.push(r);
      n.push(t);
    } else
      for (let r = 0; r <= t; r++)
        n.push(r);
    return n;
  }
  // Which entry of `stops` a direct jump to `index` (goTo/sync/drag-snap/
  // initial index - anything that isn't next()/prev() itself) should mark
  // active: an exact match if `index` happens to land on one, else the
  // nearest stop at or before it.
  findStopIndex(t, s) {
    const n = t.indexOf(s);
    if (n !== -1) return n;
    for (let r = t.length - 1; r >= 0; r--)
      if (s >= t[r]) return r;
    return 0;
  }
  next() {
    if (!this.track) return;
    const t = this.getResolvedPerMove();
    if (this.options.loop) {
      const s = this.getCloneCount(), n = ((this.currentIndex - s) % t + t) % t, r = n !== 0 ? t - n : t;
      this.currentIndex += r;
    } else {
      const s = this.getRealMaxIndex(), n = this.getStops(s).length;
      if (this.currentIndex < s) {
        const r = Math.min(t, s - this.currentIndex);
        this.currentIndex += r, this.currentStopIndex = Math.min(this.currentStopIndex + 1, n - 1);
      } else this.options.rewind && (this.currentIndex = 0, this.currentStopIndex = 0);
    }
    this.updateSlideAttributes(), this.track.updatePosition();
  }
  prev() {
    if (!this.track) return;
    const t = this.getResolvedPerMove();
    if (this.options.loop) {
      const s = this.getCloneCount(), n = ((this.currentIndex - s) % t + t) % t, r = n !== 0 ? n : t;
      this.currentIndex -= r;
    } else if (this.currentIndex > 0) {
      const s = Math.min(t, this.currentIndex);
      this.currentIndex -= s, this.currentStopIndex = Math.max(this.currentStopIndex - 1, 0);
    } else if (this.options.rewind) {
      const s = this.getRealMaxIndex();
      this.currentIndex = s, this.currentStopIndex = this.getStops(s).length - 1;
    }
    this.updateSlideAttributes(), this.track.updatePosition();
  }
  goTo(t, s = !1) {
    if (this.track) {
      if (s && (this.isClickRouting = !0), this.options.loop) {
        const n = this.getCloneCount(), r = t + n, o = this.originalSlidesCount, l = this.track.children.length;
        let a = r, c = Math.abs(r - this.currentIndex);
        [r - o, r, r + o].forEach((u) => {
          if (u >= 0 && u < l) {
            const f = Math.abs(u - this.currentIndex);
            f < c && (c = f, a = u);
          }
        }), this.currentIndex = a;
      } else {
        const n = Array.from(this.track.children), r = this.track.querySelectorAll("[data-clone]").length, o = n.length - r;
        this.currentIndex = Math.max(0, Math.min(t, o - 1)), this.currentStopIndex = this.findStopIndex(
          this.getStops(this.getRealMaxIndex()),
          this.currentIndex
        );
      }
      this.updateSlideAttributes(), this.track.updatePosition(), this.isClickRouting = !1;
    }
  }
  alignIndexToFreeTranslation(t) {
    if (!this.track) return;
    const s = parseFloat(this.startPadding) || 0, n = this.getBoundingClientRect()[this.sizeDim], r = Array.from(this.track.children), o = this.options.autoSize ? 0 : this.getSlideSizeWithGap(), l = this.options.loop ? null : this.getBoundaries();
    let a = 0, c = 1 / 0;
    const d = this.currentIndex;
    for (let u = 0; u < r.length; u++) {
      let f = 0, m = 0;
      this.options.autoSize ? (f = this.getOffsetForIndex(u), m = this.getOffsetForIndex(u + 1) - f) : (f = u * o, m = o);
      let p = s;
      if (this.options.centered ? p += n / 2 - (f + m / 2) : p -= f, l) {
        const { max: b, min: x } = l;
        this.options.centered && this.options.autoCentered ? p = Math.max(
          x,
          Math.min(b, p)
        ) : this.options.centered || (u === 0 && (p = 0), p < x && (p = x), p > 0 && (p = 0));
      }
      const g = Math.abs(t - p);
      g < c - 0.5 ? (c = g, a = u) : Math.abs(g - c) <= 0.5 && Math.abs(u - d) < Math.abs(a - d) && (a = u, c = g);
    }
    if (this.currentIndex = a, !this.options.loop) {
      const u = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, u), this.currentStopIndex = this.findStopIndex(
        this.getStops(u),
        this.currentIndex
      );
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
    if (!this.canScroll) {
      s.forEach((o) => {
        o.setAttribute("hidden", ""), o.setAttribute("sx-disabled", "");
      }), n.forEach((o) => {
        o.setAttribute("hidden", ""), o.setAttribute("sx-disabled", "");
      });
      return;
    }
    if (s.forEach((o) => o.removeAttribute("hidden")), n.forEach((o) => o.removeAttribute("hidden")), this.options.loop || this.options.rewind) {
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
      if (!this.canScroll) {
        r.setAttribute("hidden", "");
        return;
      }
      r.removeAttribute("hidden"), typeof r.renderBullets == "function" && r.renderBullets(t), typeof r.updateActive == "function" && r.updateActive(s);
    });
  }
}
function xn() {
  customElements.get("sx-slider") || customElements.define("sx-slider", mn), customElements.get("sx-slider-track") || customElements.define("sx-slider-track", gn), customElements.get("sx-slider-slide") || customElements.define("sx-slider-slide", ln), customElements.get("sx-slider-progress") || customElements.define("sx-slider-progress", un), customElements.get("sx-slider-prev") || customElements.define("sx-slider-prev", fn), customElements.get("sx-slider-pagination") || customElements.define("sx-slider-pagination", cn), customElements.get("sx-slider-next") || customElements.define("sx-slider-next", dn);
}
const W = {
  duration: 300,
  closeOnOutsideClick: !0,
  closeOnEscKey: !0,
  scrollable: !1,
  overlay: !0,
  overlayStyle: "background-color: rgba(0, 0, 0, 0.5);",
  effect: "zoom",
  position: "center"
}, S = class S extends O {
  constructor() {
    super();
    h(this, "isOpen", !1);
    h(this, "previousActiveElement", null);
    h(this, "focusableElementsString", 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
    h(this, "backdropEl", null);
    h(this, "dialogCoreEl", null);
    h(this, "closeCursorEl", null);
    h(this, "movingCloseCursor", !1);
    h(this, "originalContentHTML", "");
    h(this, "breakpointsConfig", null);
    h(this, "originalOptions", null);
    h(this, "resizeRaf", null);
    h(this, "handleToggleEvent", (t) => {
      t.detail.name === this.name && (this.isOpen ? this.close() : this.open());
    });
    h(this, "handleResize", () => {
      this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.resizeRaf = requestAnimationFrame(() => this.applyBreakpoints());
    });
    h(this, "handleKeyDown", (t) => {
      if (this.isOpen) {
        if (t.key === "Escape") {
          t.stopPropagation(), this.closeOnEscKey && (t.preventDefault(), this.close());
          return;
        }
        t.key === "Tab" && (t.stopPropagation(), this.trapFocus(t));
      }
    });
    h(this, "handleBackdropClick", (t) => {
      this.closeOnOutsideClick && this.close();
    });
    h(this, "handleBackdropPointerMove", (t) => {
      !this.closeCursorEl || !this.closeOnOutsideClick || (this.closeCursorEl.style.transform = `translate3d(${t.clientX}px, ${t.clientY}px, 0) translate(-50%, -50%)`, this.closeCursorEl.classList.contains("is-visible") || (this.closeCursorEl.classList.add("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "none")));
    });
    h(this, "handleBackdropPointerLeave", () => {
      var t;
      (t = this.closeCursorEl) == null || t.classList.remove("is-visible"), this.backdropEl && (this.backdropEl.style.cursor = "");
    });
  }
  static needsWheelTouchLock() {
    return S.openStack.some((t) => t.scrollable !== !0);
  }
  static needsCssLock() {
    return S.openStack.some((t) => t.scrollable === !1);
  }
  static applyCssLockIfNeeded() {
    if (!S.needsCssLock() || document.documentElement.style.overflow === "hidden") return;
    const t = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--sx-scrollbar-width", `${t}px`), document.documentElement.style.paddingRight = "var(--sx-scrollbar-width)", document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
  }
  static removeCssLockIfNoLongerNeeded(t) {
    setTimeout(() => {
      S.needsCssLock() || (document.documentElement.style.paddingRight = "", document.documentElement.style.overflow = "", document.documentElement.style.removeProperty("--sx-scrollbar-width"), document.body.style.overflow = "");
    }, t);
  }
  static ensureScrollLockListeners() {
    S.scrollLockAttached || (S.scrollLockAttached = !0, window.addEventListener("wheel", S.preventScrollIfLocked, { passive: !1, capture: !0 }), window.addEventListener("touchmove", S.preventScrollIfLocked, { passive: !1, capture: !0 }));
  }
  static get observedAttributes() {
    return ["sx-open", "duration", "scrollable", "overlay", "overlay-style", "effect", "position", "breakpoints"];
  }
  get name() {
    return this.getAttribute("name");
  }
  get duration() {
    const t = this.getAttribute("duration");
    return at(t, W.duration);
  }
  get closeOnOutsideClick() {
    const t = this.getAttribute("close-on-outside-click");
    return t !== null ? t !== "false" : W.closeOnOutsideClick;
  }
  get closeOnEscKey() {
    const t = this.getAttribute("close-on-esc-key");
    return t !== null ? t !== "false" : W.closeOnEscKey;
  }
  get scrollable() {
    const t = this.getAttribute("scrollable");
    return t === null ? W.scrollable : t === "scrollbar" ? "scrollbar" : t !== "false";
  }
  get overlay() {
    const t = this.getAttribute("overlay");
    return t !== null ? t !== "false" : W.overlay;
  }
  get overlayStyle() {
    return this.getAttribute("overlay-style") || W.overlayStyle;
  }
  get effect() {
    return this.getAttribute("effect") || W.effect;
  }
  get position() {
    return this.getAttribute("position") || W.position;
  }
  connectedCallback() {
    S.ensureScrollLockListeners(), this.originalContentHTML = this.innerHTML, this.originalOptions = {
      duration: this.duration,
      closeOnOutsideClick: this.closeOnOutsideClick,
      closeOnEscKey: this.closeOnEscKey,
      scrollable: this.scrollable,
      overlay: this.overlay,
      overlayStyle: this.overlayStyle,
      effect: this.effect,
      position: this.position
    }, this.breakpointsConfig = Mt.parse(this.getAttribute("breakpoints")), this.render(), this.applyBreakpoints(), window.addEventListener("sx-dialog-toggle", this.handleToggleEvent), window.addEventListener("resize", this.handleResize), this.addEventListener("keydown", this.handleKeyDown);
  }
  disconnectedCallback() {
    var s;
    window.removeEventListener("sx-dialog-toggle", this.handleToggleEvent), window.removeEventListener("resize", this.handleResize), this.resizeRaf !== null && cancelAnimationFrame(this.resizeRaf), this.removeEventListener("keydown", this.handleKeyDown), this.setInertOnSiblings(!1), (s = this.closeCursorEl) == null || s.remove(), this.closeCursorEl = null;
    const t = S.openStack.indexOf(this);
    t !== -1 && S.openStack.splice(t, 1);
  }
  applyBreakpoints() {
    if (!this.breakpointsConfig || !this.originalOptions) return;
    const t = Mt.getMatch(
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
    return this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-open", !0) ? !1 : (this.isOpen = !0, this.clearDragStyles(), this.dialogCoreEl && (this.dialogCoreEl.scrollTop = 0), S.openStack.push(this), this.style.zIndex = String(S.baseZIndex + S.openStack.length), this.setAttribute("sx-open", ""), (t = this.dialogCoreEl) == null || t.setAttribute("aria-hidden", "false"), this.previousActiveElement = document.activeElement, S.applyCssLockIfNeeded(), this.setInertOnSiblings(!0), requestAnimationFrame(() => {
      this.focusFirstElement(), this.dispatchLifecycleEvent("sx-dialog-after-open");
    }), !0);
  }
  close() {
    var s;
    if (!this.isOpen || !this.dispatchLifecycleEvent("sx-dialog-before-close", !0)) return !1;
    this.isOpen = !1, this.handleBackdropPointerLeave();
    const t = S.openStack.indexOf(this);
    return t !== -1 && S.openStack.splice(t, 1), this.style.zIndex = "", this.removeAttribute("sx-open"), (s = this.dialogCoreEl) == null || s.setAttribute("aria-hidden", "true"), S.removeCssLockIfNoLongerNeeded(this.duration), this.setInertOnSiblings(!1), this.previousActiveElement && this.previousActiveElement.focus(), setTimeout(() => {
      this.dispatchLifecycleEvent("sx-dialog-after-close");
    }, this.duration), !0;
  }
  get coreElement() {
    return this.dialogCoreEl;
  }
  get dragAxis() {
    return S.DRAG_MAP[this.position].axis;
  }
  get dragSign() {
    return S.DRAG_MAP[this.position].sign;
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
h(S, "DRAG_MAP", {
  center: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
  right: { axis: "x", sign: 1 },
  "top-left": { axis: "y", sign: -1 },
  "top-right": { axis: "y", sign: -1 },
  "bottom-left": { axis: "y", sign: 1 },
  "bottom-right": { axis: "y", sign: 1 }
}), h(S, "baseZIndex", 9999), h(S, "openStack", []), // Background scroll lock - two independent levels, each open dialog's own `scrollable`
// (DialogScrollable: false | "scrollbar" | true - see types.ts) decides which it contributes:
// - false (absolute): CSS `overflow: hidden` (hides the native scrollbar - nothing left to
//   grab-drag either) PLUS wheel/touch preventDefault, kept BOTH active together deliberately -
//   overflow:hidden alone can't reliably stop a JS-driven scroller like six-js's SmoothScroll
//   plugin (it moves the page via an explicit scrollTo() call, not the browser's native
//   overflow-gated wheel behavior), so the preventDefault half is load-bearing even here.
// - "scrollbar" (partial): wheel/touch preventDefault only, no CSS change - native scrollbar
//   stays visible, no flicker - but its thumb can still be mouse-dragged, since no JS API can
//   intercept that. An intentionally accepted gap for this mode, not a bug.
// - true: doesn't contribute to either lock at all.
// Deliberately NOT using six-js's SmoothScroll plugin here - dialog.ts stays independent of the
// core engine/plugins (matches the rest of src/components/), so this reimplements just the
// "block wheel + touch while locked" slice standalone.
h(S, "scrollLockAttached", !1), h(S, "preventScrollIfLocked", (t) => {
  S.needsWheelTouchLock() && t.cancelable && t.preventDefault();
});
let Kt = S;
class yn extends O {
  constructor() {
    super(...arguments);
    h(this, "dialogEl", null);
    h(this, "observer", null);
    h(this, "syncActiveState", () => {
      var t;
      (t = this.dialogEl) != null && t.hasAttribute("sx-open") ? this.setAttribute("sx-active", "") : this.removeAttribute("sx-active");
    });
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
class bn extends O {
  constructor() {
    super(...arguments);
    h(this, "dialogEl", null);
    h(this, "pointerId", null);
    h(this, "startPos", 0);
    h(this, "startTime", 0);
    h(this, "currentOffset", 0);
    h(this, "dragging", !1);
    h(this, "handlePointerDown", (t) => {
      var s;
      this.dialogEl = this.closest("sx-dialog"), (s = this.dialogEl) != null && s.coreElement && (this.pointerId = t.pointerId, this.dragging = !0, this.startTime = performance.now(), this.currentOffset = 0, this.startPos = this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX, this.dialogEl.beginDrag(), this.setPointerCapture(t.pointerId), this.addEventListener("pointermove", this.handlePointerMove), this.addEventListener("pointerup", this.handlePointerEnd), this.addEventListener("pointercancel", this.handlePointerEnd));
    });
    h(this, "handlePointerMove", (t) => {
      if (!this.dragging || !this.dialogEl) return;
      const n = (this.dialogEl.dragAxis === "y" ? t.clientY : t.clientX) - this.startPos, r = this.dialogEl.dragSign;
      this.currentOffset = n * r > 0 ? n : 0, this.dialogEl.updateDrag(this.currentOffset);
    });
    h(this, "handlePointerEnd", (t) => {
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
class vn extends O {
  constructor() {
    super(...arguments);
    h(this, "dialogEl", null);
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
function Sn() {
  customElements.get("sx-dialog") || customElements.define("sx-dialog", Kt), customElements.get("sx-dialog-trigger") || customElements.define("sx-dialog-trigger", yn), customElements.get("sx-dialog-pull") || customElements.define("sx-dialog-pull", bn), customElements.get("sx-close-cursor") || customElements.define("sx-close-cursor", vn);
}
function Cn() {
  an(), Qs(), xn(), Sn();
}
console.log(`sixjs v${Qe}`);
function wn(e, i) {
  return i || (typeof e == "string" || e instanceof Element ? e : tt(e)[0]);
}
function Te(e, i, t) {
  if (!i) return;
  const s = wn(e, i.trigger);
  Rt.create({ ...i, trigger: s, animation: t });
}
function te(e, i, t, s) {
  const { stagger: n, onScroll: r, ...o } = i;
  if (n === void 0) {
    const d = new K(e, o, t, s);
    return ot.add(d), Te(e, r, d), d;
  }
  const l = tt(e), a = o.delay ?? 0, c = new ht();
  return l.forEach((d, u) => {
    const f = a + $e(u, l.length, n);
    c.add(new K(d, { ...o, delay: f }, t, s), 0);
  }), ot.add(c), Te(e, r, c), c;
}
function kn(e, i) {
  return te(e, i, "to");
}
function En(e, i) {
  return te(e, i, "from");
}
function An(e, i, t) {
  return te(e, t, "fromTo", i);
}
function Tn(e, i) {
  const t = new K(e, { ...i, duration: 0 });
  return ot.add(t), t;
}
function Mn(e) {
  const { onScroll: i, ...t } = e ?? {}, s = new ht(t);
  return ot.add(s), i && (i.trigger ? Rt.create({ ...i, trigger: i.trigger, animation: s }) : console.warn("[six] timeline({ onScroll }) requires an explicit trigger - a Timeline has no target to default to")), s;
}
function In(e) {
  ti(e);
}
const Hn = {
  to: kn,
  from: En,
  fromTo: An,
  set: Tn,
  timeline: Mn,
  config: In,
  context: Ze,
  breakpoint: hs,
  smoothScroll: Ds,
  burst: Us,
  utils: Is
};
function Un() {
  Cn();
}
const Me = new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?(\\u{200D}\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)*|.", "gsu");
let Dt;
function On() {
  return Dt === void 0 && (Dt = typeof Intl < "u" && "Segmenter" in Intl ? new Intl.Segmenter() : null), Dt;
}
function Ue(e, i) {
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
function Ie(e, i) {
  const t = On();
  if (t) {
    const n = Array.from(t.segment(e), (r) => r.segment);
    return Ue(n, i);
  }
  const s = i ? new RegExp(`${i.source}|${Me.source}`, "gu") : Me;
  return e.match(s) ?? [];
}
function _n(e) {
  if (e)
    return Array.isArray(e) ? new RegExp(`(?:${e.join("|")})`, "gu") : e;
}
const Rn = {
  word: "wordsClass",
  char: "charsClass",
  line: "linesClass"
};
function jt(e, i, t) {
  const s = i[Rn[e]], n = i.tag || "div", r = i.aria ?? "auto", o = !!i.propIndex, l = e === "line" ? "block" : "inline-block", a = (c) => {
    const d = document.createElement(n), u = t.length + 1;
    return s && (d.className = `${s} ${s}${u}`), o && d.style.setProperty(`--${e}`, String(u)), r !== "none" && d.setAttribute("aria-hidden", "true"), n !== "span" && (d.style.position = "relative", d.style.display = l), d.textContent = c, t.push(d), d;
  };
  return a.collection = t, a;
}
function Oe(e) {
  window.getComputedStyle(e).display === "inline" && (e.style.display = "inline-block");
}
function Pn(e) {
  if (e && typeof e == "object" && !(e instanceof RegExp)) {
    const t = e.replaceWith ?? "";
    return { splitter: e.delimiter, replacement: t, isSpace: t === " " };
  }
  if (e instanceof RegExp)
    return { splitter: e, replacement: "", isSpace: !1 };
  const i = e === "" ? "" : e ?? " ";
  return { splitter: i, replacement: i, isSpace: i === " " };
}
function G(e, i, t) {
  e.insertBefore(typeof i == "string" ? document.createTextNode(i) : i, t);
}
function Ge(e, i, t, s, n = !1) {
  var $, F;
  const { delimiter: r, reduceWhiteSpace: o, prepareText: l, skip: a, onlyChars: c, deepSlice: d, specialCharsRegex: u } = i, { splitter: f, replacement: m, isSpace: p } = r, g = Array.from(e.childNodes), b = e.getBoundingClientRect(), x = !o && window.getComputedStyle(e).whiteSpace.slice(0, 3) === "pre", v = t.collection, E = d && n;
  let M = b, I = null;
  for (let D = 0; D < g.length; D++) {
    const A = g[D];
    if (A.nodeType === Node.TEXT_NODE) {
      let C = A.textContent || "";
      o ? C = C.replace(/\s+/g, " ") : x && (C = C.replace(/\n/g, `${m}
`)), l && (C = l(C, e)), A.textContent = C;
      const _ = f ? C.split(f) : Ie(C, u), q = _[_.length - 1] ?? "", ct = p ? !q : q.slice(-1) === " ";
      q || _.pop(), M = b;
      const U = p ? !_[0] : (_[0] ?? "").charAt(0) === " ";
      U && G(e, " ", A), _[0] || _.shift(), Ue(_, u), E || (A.textContent = "");
      for (let w = 1; w <= _.length; w++) {
        let y = _[w - 1];
        if (!o && x && y.charAt(0) === `
`) {
          const k = A.previousSibling;
          k && (($ = k.parentNode) == null || $.removeChild(k)), G(e, document.createElement("br"), A), y = y.slice(1);
        }
        if (!o && y === "")
          G(e, m, A);
        else if (y === " ")
          e.insertBefore(document.createTextNode(" "), A);
        else {
          !p && y.charAt(0) === " " && G(e, " ", A);
          let k;
          if (!!I && w === 1 && !U && v.indexOf(I.parentNode) > -1 ? (k = v[v.length - 1], k.appendChild(document.createTextNode(s ? "" : y))) : (k = t(s ? "" : y), G(e, k, A), I && w === 1 && !U && k.insertBefore(I, k.firstChild)), s)
            for (const R of Ie(y, u))
              k.appendChild(R === " " ? document.createTextNode(" ") : s(R));
          if (E) {
            C = C.substring(y.length + 1), A.textContent = C;
            const R = k.getBoundingClientRect();
            if (R.top > M.top && R.left <= M.left) {
              const L = e.cloneNode(!1);
              let V = e.childNodes[0];
              for (; V && V !== k; ) {
                const Pt = V;
                V = V.nextSibling, L.appendChild(Pt);
              }
              (F = e.parentNode) == null || F.insertBefore(L, e), c && Oe(L);
            }
            M = R;
          }
          if (w < _.length || ct) {
            const R = w >= _.length ? " " : !p && y.slice(-1) === " " ? ` ${m}` : m;
            G(e, R, A);
          }
        }
      }
      e.removeChild(A), I = null;
    } else if (A.nodeType === Node.ELEMENT_NODE) {
      const C = A;
      a.indexOf(C) > -1 ? (v.indexOf(C.previousSibling) > -1 && v[v.length - 1].appendChild(C), I = C) : (Ge(C, i, t, s, !0), I = null), c && Oe(C);
    }
  }
}
const It = { left: 0, top: 0, width: 0, height: 0 };
function Ln(e, i) {
  let t = i;
  for (; ++t < e.length && e[t] === It; ) ;
  return e[t] ?? It;
}
function zn(e, i, t, s) {
  const n = jt("line", t, s), r = window.getComputedStyle(e).textAlign || "left";
  return (o, l) => {
    const a = n("");
    a.style.textAlign = r, e.insertBefore(a, i[o]);
    for (let c = o; c < l; c++) a.appendChild(i[c]);
    a.normalize();
  };
}
function Bn(e, i, t) {
  const s = Array.from(e.childNodes), n = zn(e, s, i, t), r = [], o = s.map((d) => d.nodeType === Node.ELEMENT_NODE ? d.getBoundingClientRect() : It);
  let l = 0, a = It, c = 0;
  for (; c < s.length; c++) {
    const d = s[c];
    if (d.nodeType === Node.ELEMENT_NODE)
      if (d.nodeName === "BR")
        (!c || s[c - 1].nodeName !== "BR") && (r.push(d), n(l, c + 1)), l = c + 1, a = Ln(o, c);
      else {
        const u = o[c];
        c && u.top > a.top && u.left < a.left + a.width - 1 && (n(l, c), l = c), a = u;
      }
  }
  l < c && n(l, c), r.forEach((d) => {
    var u;
    return (u = d.parentNode) == null ? void 0 : u.removeChild(d);
  });
}
function $n(e) {
  return e.map((i) => {
    const t = i.cloneNode(!1);
    return i.replaceWith(t), t.appendChild(i), i.className && (t.className = i.className.trim().split(/\s+/).map((s) => `${s}-mask`).join(" ")), t.style.overflow = "clip", t;
  });
}
function Dn(e, i) {
  const t = /* @__PURE__ */ new Map();
  let s;
  const n = () => {
    for (const a of e) {
      const c = a.offsetWidth;
      if (t.get(a) !== c) {
        t.set(a, c), i();
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
const bt = /* @__PURE__ */ new WeakMap();
function _e(e) {
  return e ? typeof e == "string" ? Array.from(document.querySelectorAll(e)) : e instanceof Element ? [e] : Array.from(e).filter((i) => i instanceof HTMLElement) : [];
}
function Nn(e) {
  return Array.isArray(e) ? e.join(",") : e;
}
function Fn(e) {
  const i = Nn(e);
  return {
    chars: i.includes("chars"),
    words: i.includes("words"),
    lines: i.includes("lines")
  };
}
function qn(e, i, t, s) {
  const n = i === !0 ? t ? "lines" : s ? "words" : "chars" : i;
  return n === "lines" ? e.lines : n === "words" ? e.words : e.chars;
}
function Yn(e, i, t) {
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
function Wn(e) {
  e.element.innerHTML = e.html, e.ariaLabel !== null ? e.element.setAttribute("aria-label", e.ariaLabel) : e.element.removeAttribute("aria-label"), e.ariaHidden !== null ? e.element.setAttribute("aria-hidden", e.ariaHidden) : e.element.removeAttribute("aria-hidden");
}
class Xn {
  constructor(i, t = {}) {
    h(this, "elements");
    h(this, "chars", []);
    h(this, "words", []);
    h(this, "lines", []);
    h(this, "masks", []);
    h(this, "isSplit", !1);
    h(this, "vars");
    h(this, "originals", []);
    h(this, "resplitHandle", null);
    h(this, "dead", !1);
    var s;
    this.elements = _e(i), this.vars = t, this.elements.forEach((n) => {
      var r;
      (r = bt.get(n)) == null || r.kill(), bt.set(n, this);
    }), (s = Ot()) == null || s._capture(this), this.split(t);
  }
  split(i = this.vars) {
    if (this.dead) throw new Error("[six] cannot split() a killed splitText()");
    this.isSplit && this.revert(), this.vars = i;
    const { type: t = "chars,words,lines", aria: s = "auto", overflow: n, skip: r, wordDelimiter: o, reduceWhiteSpace: l = !0, specialChars: a, onSplit: c } = i, { chars: d, words: u, lines: f } = Fn(t);
    if (!d && !u && !f) return this;
    const m = d && !u && !f, p = _n(a), g = _e(r), b = Pn(o), x = {
      tag: i.tag,
      aria: s,
      propIndex: i.propIndex,
      wordsClass: i.wordsClass,
      charsClass: i.charsClass,
      linesClass: i.linesClass
    };
    return this.elements.forEach((v) => {
      this.originals.push({
        element: v,
        html: v.innerHTML,
        ariaLabel: v.getAttribute("aria-label"),
        ariaHidden: v.getAttribute("aria-hidden")
      }), s === "auto" ? v.setAttribute("aria-label", (v.textContent || "").trim()) : s === "hidden" && v.setAttribute("aria-hidden", "true");
      const E = [], M = [], I = [], $ = d ? jt("char", x, E) : null, F = jt("word", x, M);
      Ge(
        v,
        {
          delimiter: b,
          reduceWhiteSpace: l,
          prepareText: i.prepareText,
          skip: g,
          onlyChars: m,
          deepSlice: f || m,
          specialCharsRegex: p
        },
        F,
        $
      ), f && Bn(v, x, I), u || (Yn(M, !!i.smartWrap && !f, d), M.length = 0, v.normalize()), this.lines.push(...I), this.words.push(...M), this.chars.push(...E);
    }), n && this.masks.push(...$n(qn(this, n, f, u))), this.isSplit = !0, f && (this.resplitHandle = Dn(this.elements, () => {
      this.isSplit && this.split(this.vars);
    })), c == null || c(this), this;
  }
  revert() {
    var i, t, s;
    return this.isSplit ? ((i = this.resplitHandle) == null || i.disconnect(), this.resplitHandle = null, this.originals.forEach(Wn), this.elements.forEach((n) => {
      bt.get(n) === this && bt.delete(n);
    }), this.chars.length = 0, this.words.length = 0, this.lines.length = 0, this.masks.length = 0, this.originals.length = 0, this.isSplit = !1, (s = (t = this.vars).onRevert) == null || s.call(t, this), this) : this;
  }
  kill() {
    this.dead || (this.dead = !0, this.revert());
  }
}
function Gn(e, i) {
  return new Xn(e, i);
}
export {
  Rt as OnScroll,
  $s as SmoothScroll,
  Xn as SplitText,
  Qe as VERSION,
  Un as enableElements,
  Hn as six,
  Gn as splitText
};
