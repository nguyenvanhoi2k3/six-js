export { VERSION } from "./version";

// The public `six` facade (api/six.ts) is wired up incrementally as each Phase 1 module
// (Core, Tween, Timeline, Animate, ScrollTrigger) lands - see LEGACY_CLEANUP.md for why the
// old six.ts/components/plugins tree still physically exists but is no longer referenced here.
