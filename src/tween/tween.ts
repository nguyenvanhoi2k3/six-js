import { Animation, AnimationVars } from "../core/animation";
import { getDefaults } from "../core/defaults";
import { EaseFn, resolveEase } from "../easing/easing";
import { applyTrack, buildTracks, PropertyTrack, TweenMode } from "./property-track";
import { getTransformCache, renderTransform } from "../animate/transform-cache";

export type { TweenMode } from "./property-track";

export type TweenTarget = Element | Element[] | ArrayLike<Element> | string | null | undefined;

export interface TweenVars extends AnimationVars {
  duration?: number;
  ease?: string | EaseFn;
  overwrite?: boolean | "auto";
  [prop: string]: unknown;
}

function resolveTargets(input: TweenTarget): Element[] {
  if (input == null) return [];
  if (typeof input === "string") {
    const found = Array.from(document.querySelectorAll(input));
    if (found.length === 0) console.warn(`[six] no elements matched selector "${input}"`);
    return found;
  }
  if (input instanceof Element) return [input];
  return Array.from(input).filter((el): el is Element => el instanceof Element);
}

/** The leaf animation unit: interpolates PropertyTracks (built via animate/registry) across its own eased ratio. */
export class Tween extends Animation {
  private targets: Element[];
  private mode: TweenMode;
  private rawVars: TweenVars;
  private rawFromVars?: Record<string, unknown>;
  private ease: EaseFn;
  private tracks: PropertyTrack[] = [];

  constructor(target: TweenTarget, vars: TweenVars, mode: TweenMode = "to", fromVars?: Record<string, unknown>) {
    super(vars);

    const defaults = getDefaults();

    this.targets = resolveTargets(target);
    this.mode = mode;
    this.rawVars = vars;
    this.rawFromVars = fromVars;
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.duration(vars.duration ?? defaults.duration);

    // Render the initial (t=0) visual state immediately and silently, so e.g. a `.from()`
    // tween's starting values are visible right away rather than waiting for the next tick.
    this.render(0, true, true);
  }

  targetElements(): readonly Element[] {
    return this.targets;
  }

  protected _onInit(): void {
    this.tracks = buildTracks(this.targets, this.rawVars, this.mode, this.rawFromVars);
  }

  protected _renderIteration(localTime: number): void {
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
