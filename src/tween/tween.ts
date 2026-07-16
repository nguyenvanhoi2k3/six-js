import { Animation, AnimationVars } from "../core/animation";
import { getDefaults } from "../core/defaults";
import { EaseFn, resolveEase } from "../easing/easing";
import { applyTrack, buildTracks, PropertyTrack, TweenMode } from "./property-track";
import { getTransformCache, renderTransform } from "../animate/transform-cache";
import { buildKeyframeTimeline, KeyframesInput } from "./keyframes";
import { Timeline } from "../timeline/timeline";
import { applyOverwrite } from "./overwrite";

export type { TweenMode } from "./property-track";

export type TweenTarget = Element | Element[] | ArrayLike<Element> | string | null | undefined;

export interface TweenVars extends AnimationVars {
  duration?: number;
  ease?: string | EaseFn;
  overwrite?: boolean | "auto";
  keyframes?: KeyframesInput;
  [prop: string]: unknown;
}

export function resolveTargets(input: TweenTarget, scope?: Element | Document): Element[] {
  if (input == null) return [];
  if (typeof input === "string") {
    const found = Array.from((scope ?? document).querySelectorAll(input));
    if (found.length === 0) console.warn(`[six] no elements matched selector "${input}"`);
    return found;
  }
  if (input instanceof Element) return [input];
  return Array.from(input).filter((el): el is Element => el instanceof Element);
}

/**
 * The leaf animation unit. Normally interpolates PropertyTracks (built via animate/registry)
 * across its own eased ratio; when `vars.keyframes` is given it instead composes (has-a, not
 * is-a) an internal Timeline of `.fromTo()` segments and simply drives that from render() -
 * see tween/keyframes.ts.
 */
export class Tween extends Animation {
  private targets: Element[];
  private mode: TweenMode;
  private rawVars: TweenVars;
  private rawFromVars?: Record<string, unknown>;
  private ease: EaseFn;
  private tracks: PropertyTrack[] = [];
  private keyframeTimeline: Timeline | null = null;

  constructor(target: TweenTarget, vars: TweenVars, mode: TweenMode = "to", fromVars?: Record<string, unknown>) {
    super(vars);

    const defaults = getDefaults();

    this.targets = resolveTargets(target);
    this.mode = mode;
    this.rawVars = vars;
    this.rawFromVars = fromVars;
    this.ease = resolveEase(vars.ease ?? defaults.ease);

    if (vars.keyframes) {
      this.keyframeTimeline = buildKeyframeTimeline(this.targets, vars);
      this.duration(this.keyframeTimeline.totalDuration() as number);
    } else {
      this.duration(vars.duration ?? defaults.duration);
    }

    // Render the initial (t=0) visual state immediately and silently, so e.g. a `.from()`
    // tween's starting values are visible right away rather than waiting for the next tick.
    this.render(0, true, true);
  }

  targetElements(): readonly Element[] {
    return this.targets;
  }

  protected _onInit(): void {
    if (!this.keyframeTimeline) {
      this.tracks = buildTracks(this.targets, this.rawVars, this.mode, this.rawFromVars);
      applyOverwrite(this, this.rawVars.overwrite, this.tracks);
    }
  }

  _dropTrack(target: Element, prop: string): void {
    this.tracks = this.tracks.filter((t) => t.target !== target || t.prop !== prop);
    if (this.tracks.length === 0) this.kill();
  }

  protected _renderIteration(localTime: number): void {
    if (this.keyframeTimeline) {
      // Per-segment lifecycle events (onStart/onComplete of individual keyframe stops) are not
      // exposed in Phase 1 - only the outer Tween's own events fire, handled by Animation.render().
      this.keyframeTimeline.render(localTime, true, true);
      return;
    }

    const dur = this.duration() as number;
    const progress = dur ? localTime / dur : 1;
    const eased = this.ease(progress);
    const use3D = progress > 0 && progress < 1;

    const transformTargets = new Set<Element>();

    for (const track of this.tracks) {
      applyTrack(track, eased);
      if (track.isTransform) transformTargets.add(track.target);
    }

    for (const target of transformTargets) {
      renderTransform(target, getTransformCache(target), use3D);
    }
  }
}
