import { Animation, AnimationVars } from "../../core/animation";
import { EaseFn, resolveEase } from "../../easing/easing";
import { getDefaults } from "../../core/defaults";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";
import { resolveTargets, TweenTarget } from "../../tween/tween";
import { computeStaggerDelay, StaggerInput } from "../../timeline/stagger";
import { resolveCharSet, ScrambleTextCharSet } from "./char-sets";
import { splitUnits, randomChar, randomString } from "./text-units";
import { delayedProgress } from "./reveal";
import { OdometerAnimation, OdometerVars } from "./odometer";

export type ScrambleTextMode = "scramble" | "odometer";

export interface ScrambleTextVars extends AnimationVars {
  /** "scramble" (default) - GSAP-style in-place character shuffle, see `ScrambleTextAnimation`. "odometer" - each character spins on its own vertical reel and stops on the correct letter (a six-js addition, not part of GSAP - see `OdometerAnimation`). */
  mode?: ScrambleTextMode;
  /** New text to reveal. Omitted (or `"{original}"`, matching GSAP's own sentinel) reuses the target's current text/value - useful for a pure reveal-in effect on text that's already correct. */
  text?: string;
  duration?: number;
  ease?: string | EaseFn;
  /** Character pool for the scrambled/spinning portion. Default `"upperCase"` - see `char-sets.ts`. */
  chars?: ScrambleTextCharSet;
  /** Extra delay per element (seconds) when `target` resolves to more than one element - see `computeStaggerDelay`. */
  stagger?: StaggerInput;
  /** Reveals right-to-left instead of the default left-to-right (`mode: "scramble"`), or reverses the odometer's per-character landing wave (`mode: "odometer"`). Default false. */
  rightToLeft?: boolean;

  // ---- mode: "scramble" ----
  /** Scramble refresh-rate multiplier. Default 1. */
  speed?: number;
  /** Seconds of pure scrambling (no reveal) before the reveal begins. Default 0. */
  revealDelay?: number;
  /** Interpolates the displayed length between the old and new text instead of snapping straight to the new length. Default true. */
  tweenLength?: boolean;
  /** Wraps the not-yet-revealed (scrambled) portion in `<span class="...">`. Ignored on `<input>`/`<textarea>` targets (a form value can't contain markup). */
  oldClass?: string;
  /** Wraps the already-revealed portion in `<span class="...">`. Ignored on `<input>`/`<textarea>` targets. */
  newClass?: string;
  /** Reveal-unit boundary. `""` (default) reveals character-by-character; `" "` reveals word-by-word (GSAP-documented). */
  delimiter?: string;

  // ---- mode: "odometer" ----
  /** How many random characters spin past before landing on the correct one. Default 10. */
  reelSize?: number;
  /** Extra delay per character position (seconds), producing a left-to-right (or right-to-left with `rightToLeft`) landing wave instead of every reel stopping in lockstep. Default 0.03. */
  charStagger?: number;
}

const SCRAMBLE_INTERVAL = 1 / 15; // seconds between filler re-randomizations at speed: 1 - not a GSAP-verified number (ScrambleTextPlugin's exact internal refresh cadence isn't documented anywhere public), just a flicker rate that reads clearly as "scrambling" without being an illegible blur.
const WORD_FILLER_MIN = 3;
const WORD_FILLER_RANGE = 4; // filler word length is randomChar-driven pseudo-word: WORD_FILLER_MIN..WORD_FILLER_MIN+WORD_FILLER_RANGE

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapSpan(text: string, className: string | undefined): string {
  const escaped = escapeHtml(text);
  return className ? `<span class="${className}">${escaped}</span>` : escaped;
}

function isFormTarget(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

/**
 * GSAP's ScrambleTextPlugin, reimplemented from its public documented behavior (it's a paid Club
 * GreenSock bonus plugin - no source is publicly readable, unlike the free plugins this codebase
 * has been able to verify byte-for-byte against elsewhere - see CLAUDE.md's audit notes). A plain
 * `Animation` subclass rather than a Tween property, for the same reason every other svgMotion/
 * scrambleText-shaped effect in this codebase is: the visible state per frame (which characters
 * are already-correct vs still-scrambled, and how many total characters are even displayed) isn't
 * a single interpolated number/color/string that the `PropertyTrack` system already models.
 *
 * Reveal math: `displayLen - revealCount` (how many scrambled filler characters remain) reduces
 * algebraically to `oldLen * (1 - eased)` regardless of `newLen` - see the derivation in
 * `_renderIteration`. That's what makes `tweenLength` (old text's visible length shrinking to 0
 * while the new text's revealed portion grows) fall out of the same two formulas GSAP documents
 * (`revealCount` grows toward `newLen`, `displayLen` interpolates old->new length) rather than
 * needing a third, separate "shrink the old tail" rule.
 */
export class ScrambleTextAnimation extends Animation {
  private el: Element;
  private ease: EaseFn;
  private pool: string;
  private rawNewText?: string;
  private delimiterVal: string;
  private revealDelayVal: number;
  private tweenLengthVal: boolean;
  private rightToLeftVal: boolean;
  private speedVal: number;
  private newClassVal?: string;
  private oldClassVal?: string;
  private formTarget: boolean;

  private oldUnits: string[] = [];
  private newUnits: string[] = [];
  private fillerUnits: string[] = [];
  private fillerBucket = -1;

  constructor(target: Element, vars: ScrambleTextVars = {}) {
    super(vars);
    const defaults = getDefaults();
    this.el = target;
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.pool = resolveCharSet(vars.chars);
    this.rawNewText = vars.text;
    this.delimiterVal = vars.delimiter ?? "";
    this.revealDelayVal = Math.max(0, vars.revealDelay ?? 0);
    this.tweenLengthVal = vars.tweenLength ?? true;
    this.rightToLeftVal = vars.rightToLeft ?? false;
    this.speedVal = Math.max(0.0001, vars.speed ?? 1);
    this.newClassVal = vars.newClass;
    this.oldClassVal = vars.oldClass;
    this.formTarget = isFormTarget(target);
    this.duration(vars.duration ?? defaults.duration);
    this.render(0, true, true);
  }

  private readText(): string {
    return this.formTarget ? (this.el as HTMLInputElement | HTMLTextAreaElement).value : this.el.textContent ?? "";
  }

  protected _onInit(): void {
    const oldText = this.readText();
    const newText = this.rawNewText === undefined || this.rawNewText === "{original}" ? oldText : this.rawNewText;
    this.oldUnits = splitUnits(oldText, this.delimiterVal);
    this.newUnits = splitUnits(newText, this.delimiterVal);
    this.fillerUnits = [];
    this.fillerBucket = -1;
  }

  private fillerUnit(): string {
    return this.delimiterVal === ""
      ? randomChar(this.pool)
      : randomString(WORD_FILLER_MIN + Math.floor(Math.random() * WORD_FILLER_RANGE), this.pool);
  }

  private writeText(revealedUnits: string[], fillerUnits: string[]): void {
    const delim = this.delimiterVal;

    if (this.formTarget) {
      const ordered = this.rightToLeftVal ? [...fillerUnits, ...revealedUnits] : [...revealedUnits, ...fillerUnits];
      (this.el as HTMLInputElement | HTMLTextAreaElement).value = ordered.join(delim);
      return;
    }

    if (!this.newClassVal && !this.oldClassVal) {
      const ordered = this.rightToLeftVal ? [...fillerUnits, ...revealedUnits] : [...revealedUnits, ...fillerUnits];
      this.el.textContent = ordered.join(delim);
      return;
    }

    const revealedHtml = revealedUnits.length ? wrapSpan(revealedUnits.join(delim), this.newClassVal) : "";
    const fillerHtml = fillerUnits.length ? wrapSpan(fillerUnits.join(delim), this.oldClassVal) : "";
    // The delimiter belongs between EVERY pair of adjacent units, including the one sitting right
    // at the revealed/filler boundary - otherwise word-delimiter mode would visibly fuse the last
    // revealed word to the first filler word with no space between them.
    const boundary = revealedUnits.length && fillerUnits.length ? delim : "";
    this.el.innerHTML = this.rightToLeftVal ? fillerHtml + boundary + revealedHtml : revealedHtml + boundary + fillerHtml;
  }

  protected _renderIteration(localTime: number): void {
    const dur = this.duration() as number;
    const revealRatio = delayedProgress(localTime, dur, this.revealDelayVal);
    const eased = clampProgress(this.ease(revealRatio));

    const oldLen = this.oldUnits.length;
    const newLen = this.newUnits.length;
    const displayLen = this.tweenLengthVal ? Math.max(0, Math.round(oldLen + (newLen - oldLen) * eased)) : newLen;
    const revealCount = Math.max(0, Math.min(Math.round(newLen * eased), displayLen));
    const fillerCount = Math.max(0, displayLen - revealCount);

    const bucket = Math.floor(Math.max(0, localTime) * this.speedVal / SCRAMBLE_INTERVAL);
    if (bucket !== this.fillerBucket || this.fillerUnits.length < fillerCount) {
      this.fillerBucket = bucket;
      const size = Math.max(fillerCount, this.fillerUnits.length);
      this.fillerUnits = Array.from({ length: size }, () => this.fillerUnit());
    }

    const revealedUnits = this.rightToLeftVal ? this.newUnits.slice(newLen - revealCount) : this.newUnits.slice(0, revealCount);
    const fillerUnits = this.fillerUnits.slice(0, fillerCount);

    this.writeText(revealedUnits, fillerUnits);
  }
}

// A back/elastic/bounce ease can send `eased` outside [0, 1] mid-flight (e.g. `backOut` briefly
// overshoots past 1). Left unclamped, `revealCount`/`displayLen` could exceed the actual text
// length or (worse) go negative - clamped here rather than letting `Math.round`/array `.slice`
// silently absorb it, since a negative `fillerCount` would otherwise flip `writeText`'s
// `.slice(0, fillerCount)` into `.slice(0, -N)`, quietly truncating the REVEALED text instead.
function clampProgress(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * `six.scrambleText(target, vars)` - `target` resolves like any other six-js target (selector,
 * Element, list); resolving to more than one element builds one animation per element and groups
 * them in a Timeline (same "reuse Timeline, don't invent a group type" principle every other
 * multi-target six-js effect uses), so the whole group can still be paused/reversed/killed as one
 * unit.
 */
export function scrambleText(target: TweenTarget, vars: ScrambleTextVars = {}): ScrambleTextAnimation | OdometerAnimation | Timeline {
  const { stagger, mode, ...rest } = vars;
  const elements = resolveTargets(target);

  if (elements.length === 0) {
    console.warn("[six-js] scrambleText() requires a resolvable target");
    const empty = new Timeline();
    rootTimeline.add(empty);
    return empty;
  }

  const baseDelay = rest.delay ?? 0;
  const create = (el: Element, extraDelay: number): ScrambleTextAnimation | OdometerAnimation => {
    const v = { ...rest, delay: baseDelay + extraDelay };
    return mode === "odometer" ? new OdometerAnimation(el, v as OdometerVars) : new ScrambleTextAnimation(el, v);
  };

  if (elements.length === 1 && stagger === undefined) {
    const anim = create(elements[0], 0);
    rootTimeline.add(anim);
    return anim;
  }

  const group = new Timeline();
  elements.forEach((el, index) => {
    const extraDelay = stagger !== undefined ? computeStaggerDelay(index, elements.length, stagger) : 0;
    group.add(create(el, extraDelay), 0);
  });
  rootTimeline.add(group);
  return group;
}

export { OdometerAnimation };
export type { OdometerVars };
