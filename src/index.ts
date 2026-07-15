export { VERSION } from "./version";
export { six } from "./api/six";
export type { Context, GlobalDefaults, Timeline, TimelineVars, Tween, TweenVars } from "./api/six";

// ScrollTrigger wiring lands once that module is implemented - see LEGACY_CLEANUP.md for why the
// old six.ts/components/plugins tree still physically exists but is no longer referenced here.
