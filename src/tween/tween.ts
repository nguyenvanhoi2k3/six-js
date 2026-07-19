import { Animation, AnimationVars } from "../core/animation";
import { getDefaults } from "../core/defaults";
import { EaseFn, resolveEase } from "../easing/easing";
import { applyTrack, buildTracks, collectPropertyKeys, PropertyTrack, TweenMode } from "./property-track";
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
    if (found.length === 0) console.warn(`[six-js] no elements matched selector "${input}"`);
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

  /**
   * `renderInitial` (engine-internal - Timeline is the only caller that ever passes `false`):
   * whether to self-render at t=0 synchronously here in the constructor. Correct/desired for a
   * genuinely-standalone tween (or one about to be added to the root timeline at "now") so e.g.
   * a `.from()` tween's starting values are visible right away rather than waiting for the next
   * tick - but WRONG for a tween scheduled at a later position within a sequenced timeline
   * (ordinary chained `.to()`s, or a keyframe segment): rendering it now, before its own turn,
   * writes its progress-0 state into shared per-element mutable state that a currently-active
   * sibling targeting the same property may already be mid-animation on - this second, premature
   * write silently clobbers the active sibling's just-computed value the instant this tween is
   * constructed, and - since a not-yet-reached child is deliberately never re-rendered until its
   * scheduled position is actually reached (Timeline._renderIteration's skip-range check) -
   * nothing ever corrects it back. Timeline.addTweens() passes `false` whenever the resolved
   * position isn't actually "now" for that timeline, deferring this tween's first real render
   * (and lazily-triggered _onInit()/track-building) to whenever the timeline's own cascade
   * naturally reaches it.
   *
   * That said, a `.from()` genuinely does need its start value visible well before its own turn
   * (GSAP's default `immediateRender: true`) - a `.from()` buried a few steps into a sequence
   * otherwise sits at its natural/CSS end state for however long it takes the real playhead to
   * reach it, then visibly snaps down to its "from" value before animating back up. That's
   * handled separately, NOT by this constructor flag: `Timeline._renderIteration`'s first-ever-
   * render pass gives every still-future `Tween` child one early progress-0 preview, gated by
   * `hasEagerRenderConflict` (the exact same (target, prop)-overlap check this comment describes)
   * - deferred to the timeline's actual first render rather than done here at construction, so a
   * same-script DOM mutation made between construction and that first render is still picked up
   * correctly (see the dedicated test in timeline.test.ts).
   */
  constructor(target: TweenTarget, vars: TweenVars, mode: TweenMode = "to", fromVars?: Record<string, unknown>, renderInitial = true) {
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

    if (renderInitial) this.render(0, true, true);
  }

  targetElements(): readonly Element[] {
    return this.targets;
  }

  /** Cheap prop-name summary used by Timeline's eager-render conflict check (see
   * Timeline.addTweens) - "unknown" for a keyframe tween, since its real per-segment prop names
   * live inside vars.keyframes, not at the top level `collectPropertyKeys` reads. */
  propertyKeys(): string[] | "unknown" {
    if (this.rawVars.keyframes) return "unknown";
    return collectPropertyKeys(this.rawVars, this.rawFromVars);
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
