import { Timeline } from "../timeline/timeline";
import { EaseFn } from "../easing/easing";
import { TweenVars } from "./tween";

export interface KeyframeArrayItem extends Record<string, unknown> {
  duration?: number;
  ease?: string | EaseFn;
}

export type KeyframesArrayInput = KeyframeArrayItem[];
export type KeyframesPercentInput = Record<string, Record<string, unknown> & { ease?: string | EaseFn }>;
export type KeyframesInput = KeyframesArrayInput | KeyframesPercentInput;

interface NormalizedSegment {
  duration: number;
  ease?: string | EaseFn;
  props: Record<string, unknown>;
}

function isPercentForm(input: KeyframesInput): input is KeyframesPercentInput {
  return !Array.isArray(input);
}

function normalizeArrayForm(input: KeyframesArrayInput, topDuration: number | undefined, defaultDuration: number): NormalizedSegment[] {
  const withoutOwnDuration = input.filter((kf) => kf.duration === undefined).length;
  const explicitTotal = input.reduce((sum, kf) => sum + (kf.duration ?? 0), 0);
  const evenShare =
    topDuration !== undefined ? (withoutOwnDuration > 0 ? Math.max(0, topDuration - explicitTotal) / withoutOwnDuration : 0) : defaultDuration;

  return input.map((kf) => {
    const { duration, ease, ...props } = kf;
    return { duration: duration ?? evenShare, ease, props };
  });
}

function normalizePercentForm(input: KeyframesPercentInput, topDuration: number, defaultEase: string | EaseFn | undefined): NormalizedSegment[] {
  const parsed = Object.entries(input)
    .map(([key, props]) => {
      const m = key.trim().match(/^(-?[\d.]+)%$/);
      if (!m) {
        console.warn(`[six] keyframes: invalid position "${key}", expected e.g. "50%"`);
        return null;
      }
      return { pos: parseFloat(m[1]) / 100, props };
    })
    .filter((v): v is { pos: number; props: Record<string, unknown> & { ease?: string | EaseFn } } => v !== null)
    .sort((a, b) => a.pos - b.pos);

  const segments: NormalizedSegment[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const prevPos = i === 0 ? 0 : parsed[i - 1].pos;
    const { ease, ...props } = parsed[i].props;
    segments.push({ duration: Math.max(0, (parsed[i].pos - prevPos) * topDuration), ease: ease ?? defaultEase, props });
  }

  return segments;
}

/**
 * Builds the internal Timeline a keyframed Tween composes (has-a, not is-a - see architecture
 * doc). Each keyframe becomes a `.fromTo()` segment; `carry` threads each segment's own end
 * values forward as the NEXT segment's explicit start, so segment 2 correctly starts from
 * segment 1's end rather than re-reading the DOM (which, by the time segment 2's track is
 * built, may not yet reflect segment 1's outcome - segment tracks are built lazily on first
 * render, not necessarily in the order segments visually play).
 */
export function buildKeyframeTimeline(targets: readonly Element[], vars: TweenVars): Timeline {
  const input = vars.keyframes as KeyframesInput;
  const segments = isPercentForm(input) ? normalizePercentForm(input, vars.duration ?? 0.5, vars.ease) : normalizeArrayForm(input, vars.duration, vars.duration ?? 0.5);

  const tl = new Timeline();
  const carry: Record<string, unknown> = {};

  for (const segment of segments) {
    const fromVars: Record<string, unknown> = {};
    for (const key in segment.props) {
      if (key in carry) fromVars[key] = carry[key];
    }

    tl.fromTo(targets, fromVars, { ...segment.props, duration: segment.duration, ease: segment.ease ?? vars.ease });
    Object.assign(carry, segment.props);
  }

  return tl;
}
