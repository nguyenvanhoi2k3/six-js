var W = Object.defineProperty;
var R = (s, e, t) => e in s ? W(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var c = (s, e, t) => R(s, typeof e != "symbol" ? e + "" : e, t);
const v = [];
function H(s) {
  v.push(s);
}
function K() {
  v.pop();
}
function x() {
  return v[v.length - 1];
}
const N = /* @__PURE__ */ new Set([
  "SCRIPT",
  "STYLE",
  "BR",
  "IMG",
  "SVG",
  "VIDEO",
  "AUDIO",
  "CANVAS",
  "IFRAME",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OBJECT",
  "EMBED"
]);
let w;
function z() {
  if (w !== void 0) return w;
  try {
    w = new RegExp(
      "\\p{Regional_Indicator}{2}|\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F\\u20E3?)?(\\u200D\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F\\u20E3?)?)*|.",
      "gu"
    );
  } catch {
    w = null;
  }
  return w;
}
function A(s) {
  const e = Intl == null ? void 0 : Intl.Segmenter;
  if (e)
    return Array.from(new e(void 0, { granularity: "grapheme" }).segment(s), (r) => r.segment);
  const t = z();
  return t ? s.match(t) ?? [] : Array.from(s);
}
function C(s, e, t) {
  if (e)
    if (e.includes("++")) {
      const r = e.replace("++", "").trim();
      r && s.classList.add(r, `${r}${t}`);
    } else
      s.classList.add(e);
}
function b(s, e) {
  const t = document.createElement(s);
  return s.toLowerCase() !== "span" && (t.style.position = "relative", t.style.display = e), e === "inline-block" && (t.style.verticalAlign = "baseline"), t;
}
function B(s, e) {
  const t = [], r = [];
  let h = 0, d = 0;
  function u(i) {
    const o = b(e.tag, "inline-block");
    return o.textContent = i, C(o, e.charsClass, d++), r.push(o), o;
  }
  function p(i, o) {
    if (e.needsWordWrapper) {
      const l = b(e.tag, "inline-block");
      if (C(l, e.wordsClass, h++), e.wantsChars) {
        l.style.whiteSpace = "nowrap", l.style.overflowWrap = "normal", l.style.wordBreak = "normal";
        for (const f of A(i))
          l.appendChild(u(f));
      } else
        l.textContent = i;
      t.push(l), o(l);
    } else
      for (const l of A(i))
        o(u(l));
  }
  function n(i) {
    const o = i.data.replace(/\s+/g, " ");
    if (o === "") return;
    const l = o.split(/(\s+)/).filter((m) => m.length > 0), f = document.createDocumentFragment();
    for (const m of l)
      /^\s+$/.test(m) ? f.appendChild(document.createTextNode(m)) : p(m, (g) => f.appendChild(g));
    i.replaceWith(f);
  }
  function a(i) {
    if (i.nodeType === Node.TEXT_NODE) {
      n(i);
      return;
    }
    if (i.nodeType !== Node.ELEMENT_NODE) return;
    const o = i;
    if (!N.has(o.tagName))
      for (const l of Array.from(o.childNodes))
        a(l);
  }
  for (const i of Array.from(s.childNodes))
    a(i);
  return { wordEls: t, charEls: r };
}
function I(s, e) {
  for (const t of e)
    t.replaceWith(...Array.from(t.childNodes));
  s.normalize();
}
function O(s, e, t) {
  if (e.length === 0) return [];
  const r = [[e[0]]];
  let h = e[0].getBoundingClientRect();
  for (let n = 1; n < e.length; n++) {
    const a = e[n].getBoundingClientRect();
    a.top > h.top && a.left < h.left + h.width - 1 ? r.push([e[n]]) : r[r.length - 1].push(e[n]), h = a;
  }
  const d = document.createRange(), u = [];
  for (let n = 0; n < r.length; n++)
    n === 0 ? d.setStart(s, 0) : d.setStartBefore(r[n][0]), n === r.length - 1 ? d.setEnd(s, s.childNodes.length) : d.setEndBefore(r[n + 1][0]), u.push(d.extractContents());
  const p = [];
  for (let n = 0; n < u.length; n++) {
    const a = b(t.tag, "block");
    C(a, t.linesClass, n), a.appendChild(u[n]), s.appendChild(a), p.push(a);
  }
  return s.normalize(), p;
}
const L = "0.25em";
function y(s) {
  for (const e of s) {
    const t = e.cloneNode(!1);
    t.style.overflow = "clip", t.style.paddingBottom = L, t.style.marginBottom = `-${L}`, t.className = e.className ? e.className.trim().split(/\s+/).map((r) => `${r}-mask`).join(" ") : "", e.replaceWith(t), t.appendChild(e);
  }
}
const T = typeof document < "u", F = 200;
function _(s) {
  return typeof s == "string" ? Array.from(document.querySelectorAll(s)) : Array.isArray(s) ? s.filter((e) => e != null) : s ? [s] : [];
}
function k(s) {
  const e = s.split(",").map((t) => t.trim().toLowerCase());
  return {
    wantsChars: e.includes("chars"),
    wantsWords: e.includes("words"),
    wantsLines: e.includes("lines")
  };
}
const E = /* @__PURE__ */ new WeakMap();
class D {
  constructor(e, t = {}) {
    c(this, "chars", []);
    c(this, "words", []);
    c(this, "lines", []);
    c(this, "targets", []);
    c(this, "vars");
    c(this, "originalHTML", /* @__PURE__ */ new WeakMap());
    c(this, "ownedAriaLabel", /* @__PURE__ */ new WeakSet());
    c(this, "widthByRoot", /* @__PURE__ */ new WeakMap());
    c(this, "lastKillables", []);
    c(this, "resizeObserver", null);
    c(this, "resizeTimer", null);
    c(this, "reverted", !1);
    c(this, "onFontsLoaded", () => {
      this.reverted || this.performSplit();
    });
    var r;
    (r = x()) == null || r._capture(this), this.vars = t, T && (this.targets = _(e), this.targets.length === 0 && console.warn("[six-js] splitText: no elements matched"), this.performSplit(), t.autoSplit && k(t.type ?? "chars,words,lines").wantsLines && this.setupAutoSplit());
  }
  split(e) {
    return T ? (e && (this.vars = { ...this.vars, ...e }), this.performSplit(), this) : this;
  }
  performSplit() {
    var n, a;
    this.reverted = !1;
    const e = this.vars.type ?? "chars,words,lines", { wantsChars: t, wantsWords: r, wantsLines: h } = k(e), d = this.vars.tag ?? "div", u = this.vars.aria ?? "auto";
    this.chars = [], this.words = [], this.lines = [];
    for (const i of this.targets) {
      const o = E.get(i);
      o && o !== this && o.revert(), E.set(i, this);
      const l = this.originalHTML.get(i);
      l === void 0 ? this.originalHTML.set(i, i.innerHTML) : i.innerHTML = l, u === "auto" && !i.hasAttribute("aria-label") && (i.setAttribute("aria-label", i.textContent ?? ""), this.ownedAriaLabel.add(i));
      const { wordEls: f, charEls: m } = B(i, {
        tag: d,
        wantsChars: t,
        needsWordWrapper: r || h,
        wordsClass: this.vars.wordsClass ?? "",
        charsClass: this.vars.charsClass ?? ""
      }), g = h ? O(i, f, { tag: d, linesClass: this.vars.linesClass ?? "" }) : [];
      h && !r && I(i, f), h && this.vars.autoSplit && this.widthByRoot.set(i, i.offsetWidth);
      const S = this.vars.mask;
      if (S && this.applyMaskFor(S, { charEls: m, wordEls: f, lineEls: g, wantsChars: t, wantsWords: r, wantsLines: h }), u === "auto")
        for (const M of [...m, ...r ? f : [], ...g])
          M.setAttribute("aria-hidden", "true");
      t && this.chars.push(...m), r && this.words.push(...f), h && this.lines.push(...g);
    }
    for (const i of this.lastKillables) i.kill();
    this.lastKillables = [];
    const p = (a = (n = this.vars).onSplit) == null ? void 0 : a.call(n, this);
    p && (this.lastKillables = Array.isArray(p) ? p : [p]);
  }
  applyMaskFor(e, t) {
    e === "chars" && t.wantsChars ? y(t.charEls) : e === "words" && t.wantsWords ? y(t.wordEls) : e === "lines" && t.wantsLines ? y(t.lineEls) : console.warn(`[six-js] splitText: mask "${e}" requires type to include "${e}"`);
  }
  setupAutoSplit() {
    if (typeof ResizeObserver < "u") {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeTimer !== null && clearTimeout(this.resizeTimer), this.resizeTimer = setTimeout(() => {
          this.resizeTimer = null, this.checkWidths();
        }, F);
      });
      for (const e of this.targets)
        this.resizeObserver.observe(e);
    }
    typeof document.fonts < "u" && document.fonts.addEventListener("loadingdone", this.onFontsLoaded);
  }
  checkWidths() {
    if (!this.reverted) {
      for (const e of this.targets)
        if (e.offsetWidth !== this.widthByRoot.get(e)) {
          this.performSplit();
          return;
        }
    }
  }
  revert() {
    var e;
    if (!this.reverted) {
      this.reverted = !0, (e = this.resizeObserver) == null || e.disconnect(), this.resizeObserver = null, this.resizeTimer !== null && (clearTimeout(this.resizeTimer), this.resizeTimer = null), T && typeof document.fonts < "u" && document.fonts.removeEventListener("loadingdone", this.onFontsLoaded);
      for (const t of this.lastKillables) t.kill();
      this.lastKillables = [];
      for (const t of this.targets) {
        E.get(t) === this && E.delete(t);
        const r = this.originalHTML.get(t);
        r !== void 0 && (t.innerHTML = r), this.ownedAriaLabel.has(t) && (t.removeAttribute("aria-label"), this.ownedAriaLabel.delete(t));
      }
      this.chars = [], this.words = [], this.lines = [];
    }
  }
  kill() {
    this.revert();
  }
}
function $(s, e) {
  return new D(s, e);
}
export {
  K as a,
  x as g,
  H as p,
  $ as s
};
