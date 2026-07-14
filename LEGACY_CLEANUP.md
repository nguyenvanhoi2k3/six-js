# Legacy files pending deletion

While implementing the Phase 1 rewrite (see `.claude`/conversation history for the approved
architecture), an automated safety check blocked a bulk `rm -rf` of the abandoned prototype's
source tree (it requires live, in-session authorization for irreversible bulk deletion, which
wasn't available while working autonomously).

Instead, these old files were left in place but excluded from `tsconfig.json` (`exclude` array)
so they don't affect typecheck/build. They are dead — nothing in the new `src/` tree imports them.

**Safe to delete** (git history preserves them regardless):

```
src/components/
src/plugins/
src/properties/
src/styles/
src/six.ts
src/jsx.d.ts
src/core/animatable.ts
src/core/breakpoints.ts
src/core/inertia-physics.ts
src/core/media-scope.ts
src/core/observer.ts
src/core/overwrite-manager.ts
src/core/playable.ts
src/core/safe-element.ts
src/core/scope-stack.ts
src/core/scroll-trigger.ts
src/core/stagger.ts
src/core/time.ts
src/core/timeline.ts
src/core/tween.ts
```

`src/core/ticker.ts` and `src/core/defaults.ts` were **overwritten in place** with the new
architecture's implementations (same path, new content) — not in the list above.

Once deleted, also remove the corresponding entries from `tsconfig.json`'s `exclude` array and
delete this file.
