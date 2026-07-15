import { ticker } from "./ticker";
import { Timeline } from "../timeline/timeline";

/**
 * The one Timeline registered with the Ticker. Every top-level `six.to()/timeline()` attaches
 * here by default (matching GSAP's `gsap.globalTimeline`), so there is exactly one ticker
 * listener in the whole system regardless of how many animations exist - everything else
 * receives time via recursive Animation.render() calls, not by registering its own callback.
 *
 * `unbounded: true` means its own totalDuration is always Infinity (never clamped by whatever
 * children currently exist), and `defaultPosition: "now"` means a child added with no explicit
 * position starts at the root's CURRENT playhead - together these are what let independently
 * created top-level tweens/timelines all play immediately/concurrently rather than queuing
 * behind one another the way children of an ordinary (sequential) Timeline do.
 *
 * The ticker is kept always-on for Phase 1 rather than implementing GSAP's autoSleep
 * (stop the rAF loop entirely once nothing is active) - a deliberately simpler, documented
 * scope cut; see the architecture doc.
 */
export const rootTimeline = new Timeline({ unbounded: true, defaultPosition: "now" });

ticker.add((timeSeconds) => rootTimeline.render(timeSeconds));
