/**
 * Pure repeat/yoyo math shared by Tween and Timeline. Given a position along an animation's
 * OWN totalTime axis, resolves which iteration that lands in and the local time within it.
 *
 * This function only answers "where are we" for a given totalTime - it does not know or care
 * whether time is currently increasing or decreasing. Detecting "we just crossed an iteration
 * boundary while playing forward" (needed to fire onRepeat exactly once) is the caller's
 * responsibility, by comparing the previous and new totalTime.
 */

export interface CycleResult {
  /** 0-indexed iteration number. */
  iteration: number;
  /** Local time within the iteration, in the range [0, dur]. Already yoyo-flipped if `reversed`. */
  time: number;
  /** True if this iteration is a yoyo-reversed pass (odd iteration with yoyo enabled). */
  reversed: boolean;
}

/** repeat < 0 means infinite, matching the `repeat: -1` convention used throughout the public API. */
export function totalDurationOf(dur: number, repeat: number, repeatDelay: number): number {
  if (repeat < 0) return Infinity;
  return dur * (repeat + 1) + repeatDelay * repeat;
}

export function resolveCycle(totalTime: number, dur: number, repeat: number, repeatDelay: number, yoyo: boolean): CycleResult {
  if (dur <= 0) {
    return { iteration: 0, time: 0, reversed: false };
  }

  if (repeat === 0) {
    const time = totalTime < 0 ? 0 : totalTime > dur ? dur : totalTime;
    return { iteration: 0, time, reversed: false };
  }

  const cycleLength = dur + repeatDelay;
  const tDur = totalDurationOf(dur, repeat, repeatDelay);

  let clamped = totalTime;
  if (clamped < 0) clamped = 0;
  else if (repeat >= 0 && clamped > tDur) clamped = tDur;

  let iteration = Math.floor(clamped / cycleLength);
  let time = clamped - iteration * cycleLength;

  // Landing exactly on a boundary is only ambiguous when there's no repeatDelay gap
  // (cycleLength === dur): it could mean "end of the previous iteration" or "start of
  // this one". Treat it as the end of the previous iteration, so completion/onRepeat
  // boundaries are well-defined without needing directional (increasing/decreasing)
  // context here. When a gap exists, landing exactly on the boundary unambiguously
  // means "start of this iteration" (the gap already fully accounts for the point
  // right before it), so no adjustment is needed.
  if (repeatDelay === 0 && iteration > 0 && time === 0) {
    iteration -= 1;
    time = dur;
  }

  if (repeat >= 0 && iteration > repeat) {
    iteration = repeat;
    time = clamped - iteration * cycleLength;
  }

  if (time > dur) time = dur; // inside the repeatDelay gap - hold at the iteration's end value

  const reversed = yoyo && iteration % 2 === 1;
  if (reversed) time = dur - time;

  return { iteration, time, reversed };
}
