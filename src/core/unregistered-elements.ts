/**
 * Warns about any `sx-*` tag present in the page that was never `customElements.define()`d - the
 * classic silent-failure case for an opt-in-registration web component system (no browser
 * error/warning of its own for an unknown custom element). Deliberately tag-name-pattern-only, no
 * hardcoded list of real component tags and no import from `src/components/` - that's what lets
 * this live in the always-loaded core bundle without pulling in any component code, and is also
 * why it can catch the case a per-component check never can: a page that imports `six` but never
 * touches `@six-js/core/Components` at all still gets this scan (nothing component-side would
 * ever run in that case, since none of that code is even loaded).
 *
 * Queries `:not(:defined)` rather than `"*"` - a real perf concern, not a hypothetical one: `"*"`
 * would force a JS-side `tagName` check against every single element in the document, an O(page
 * size) cost paid by every `@six-js/core` consumer regardless of whether they use any component at
 * all. `:not(:defined)` is native Custom Elements v1 spec - it only matches hyphenated tags that
 * haven't been upgraded yet, filtered by the browser's own selector engine, so the JS-side loop
 * below only ever touches genuine candidates (typically zero) instead of the whole page.
 *
 * One-time scan after the DOM is ready, not a persistent `MutationObserver` - matches this
 * codebase's existing "correct once, at a natural checkpoint" precedent (`on-scroll/observer.ts`'s
 * `addResizeListener` re-running once on `load` if the document wasn't ready yet), not a
 * documented decision to track every future DOM mutation forever. Deferred via
 * `requestIdleCallback` (falling back to `setTimeout` where unavailable, e.g. older Safari) rather
 * than `queueMicrotask` - this is a dev-experience warning, not a correctness-critical check, so
 * it should never compete with real work during the page's own critical startup window.
 */
function scan(): void {
  if (typeof document === "undefined" || typeof customElements === "undefined") return;

  const warned = new Set<string>();
  document.querySelectorAll(":not(:defined)").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!tag.startsWith("sx-") || warned.has(tag)) return;
    warned.add(tag);
    console.warn(`[six-js] <${tag}> not registered - import it from "@six-js/core/Components"`);
  });
}

function runWhenIdle(fn: () => void): void {
  if (typeof requestIdleCallback === "function") requestIdleCallback(fn);
  else setTimeout(fn, 0);
}

export function watchForUnregisteredElements(): void {
  if (typeof document === "undefined") return;

  const run = (): void => runWhenIdle(scan);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
}
