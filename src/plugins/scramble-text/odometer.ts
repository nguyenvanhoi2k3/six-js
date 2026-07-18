import { Animation, AnimationVars } from "../../core/animation";
import { EaseFn, resolveEase } from "../../easing/easing";
import { getDefaults } from "../../core/defaults";
import { resolveCharSet, ScrambleTextCharSet } from "./char-sets";
import { splitUnits, randomChar } from "./text-units";
import { delayedProgress } from "./reveal";

export interface OdometerVars extends AnimationVars {
  text?: string;
  duration?: number;
  ease?: string | EaseFn;
  chars?: ScrambleTextCharSet;
  reelSize?: number;
  charStagger?: number;
  rightToLeft?: boolean;
}

interface Reel {
  strip: HTMLElement;
  delay: number;
  maxOffset: number;
}

const DEFAULT_REEL_SIZE = 10;
const DEFAULT_CHAR_STAGGER = 0.03;

/**
 * Real layout (`getComputedStyle().lineHeight`/`fontSize`) is only meaningful in a real browser -
 * jsdom returns empty/`"normal"` strings (see CLAUDE.md's Testing section on `unit-convert.ts`'s
 * % path for the same caveat), so this falls back to a fixed pixel guess. That fallback only
 * affects visual sizing, never the reel MATH (which character lands, when) - tests cover the math
 * directly by reading each reel's resolved `translateY`, independent of what `charHeight` turned
 * out to be.
 */
function measureCharHeight(el: Element): number {
  const style = getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight);
  if (!Number.isNaN(lineHeight) && lineHeight > 0) return lineHeight;
  const fontSize = parseFloat(style.fontSize);
  return (!Number.isNaN(fontSize) && fontSize > 0 ? fontSize : 16) * 1.2;
}

/**
 * "Digital clock"/slot-machine style reveal - a six-js addition, not part of GSAP's
 * ScrambleTextPlugin (the user asked for both the standard GSAP-style in-place scramble and this
 * vertical-reel effect alongside it - see scramble-text.ts). Each non-whitespace character gets
 * its own masked (`overflow: hidden`) vertical strip containing `reelSize` random characters
 * followed by the correct final character, and the strip translates upward over the animation's
 * duration until the final character lines up in the mask - exactly like an odometer digit or an
 * airport split-flap display settling on its final value. Whitespace positions are rendered as a
 * plain space with no reel - a spinning blank reads as broken, and GSAP's own scramble doesn't
 * scramble whitespace either.
 *
 * The reel's non-final characters are generated ONCE at init, not re-randomized every frame like
 * `ScrambleTextAnimation`'s filler - this is a physical strip being scrolled past a window, not a
 * flickering swap, so continuity of its content between frames is what sells the "spinning" look.
 */
export class OdometerAnimation extends Animation {
  private el: Element;
  private ease: EaseFn;
  private pool: string;
  private text: string;
  private reelSizeVal: number;
  private charStaggerVal: number;
  private rightToLeftVal: boolean;
  private reels: (Reel | null)[] = [];

  constructor(target: Element, vars: OdometerVars = {}) {
    super(vars);
    const defaults = getDefaults();
    this.el = target;
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.pool = resolveCharSet(vars.chars);
    this.text = vars.text ?? this.el.textContent ?? "";
    this.reelSizeVal = Math.max(0, Math.round(vars.reelSize ?? DEFAULT_REEL_SIZE));
    this.charStaggerVal = Math.max(0, vars.charStagger ?? DEFAULT_CHAR_STAGGER);
    this.rightToLeftVal = vars.rightToLeft ?? false;
    this.duration(vars.duration ?? defaults.duration);
    this.render(0, true, true);
  }

  protected _onInit(): void {
    const units = splitUnits(this.text, "");
    const charHeight = measureCharHeight(this.el);

    this.el.textContent = "";
    this.reels = units.map((ch, i) => {
      if (/\s/.test(ch)) {
        const span = document.createElement("span");
        span.textContent = ch;
        this.el.appendChild(span);
        return null;
      }

      const wrapper = document.createElement("span");
      wrapper.className = "six-odometer-char";
      wrapper.style.display = "inline-block";
      wrapper.style.overflow = "hidden";
      wrapper.style.height = `${charHeight}px`;
      wrapper.style.lineHeight = `${charHeight}px`;
      wrapper.style.verticalAlign = "top";

      const strip = document.createElement("span");
      strip.className = "six-odometer-reel";
      strip.style.display = "block";
      strip.style.willChange = "transform";

      for (let r = 0; r < this.reelSizeVal; r++) {
        strip.appendChild(this.reelLine(randomChar(this.pool), charHeight));
      }
      strip.appendChild(this.reelLine(ch, charHeight));

      wrapper.appendChild(strip);
      this.el.appendChild(wrapper);

      const order = this.rightToLeftVal ? units.length - 1 - i : i;
      return { strip, delay: order * this.charStaggerVal, maxOffset: this.reelSizeVal * charHeight };
    });
  }

  private reelLine(ch: string, charHeight: number): HTMLElement {
    const line = document.createElement("span");
    line.style.display = "block";
    line.style.height = `${charHeight}px`;
    line.textContent = ch;
    return line;
  }

  protected _renderIteration(localTime: number): void {
    const dur = this.duration() as number;
    this.reels.forEach((reel) => {
      if (!reel) return;
      const progress = delayedProgress(localTime, dur, reel.delay);
      const eased = this.ease(progress);
      reel.strip.style.transform = `translateY(${-reel.maxOffset * eased}px)`;
    });
  }
}
