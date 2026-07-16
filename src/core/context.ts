export interface Killable {
  kill(): unknown;
}

interface ScopeCapture {
  _capture(target: Killable): void;
}

let activeScope: ScopeCapture | null = null;

/** Used by Animation's constructor to auto-register itself with whatever Context is currently running. */
export function getActiveScope(): ScopeCapture | null {
  return activeScope;
}

/**
 * six.context()-equivalent: anything Killable (Tween/Timeline, or anything else you `.add()`)
 * created while this context's function is running is captured automatically, so a single
 * `revert()`/`kill()` cleans up everything at once - useful for component-scoped cleanup (e.g.
 * in a framework's unmount hook).
 */
export class Context {
  private captured = new Set<Killable>();
  private dead = false;

  constructor(fn?: (self: Context) => void) {
    if (fn) this.run(fn);
  }

  run<T>(fn: (self: Context) => T): T {
    if (this.dead) throw new Error("[six] cannot run a reverted context");

    const prev = activeScope;
    activeScope = this;
    try {
      return fn(this);
    } finally {
      activeScope = prev;
    }
  }

  add(target: Killable): void {
    if (!this.dead) this.captured.add(target);
  }

  /**
   * Wraps `fn` so that whenever the RETURNED function is eventually called - from an event
   * listener, a timeout, a promise, anything outside this context's own synchronous `run()` call
   * - anything Killable it creates still gets captured into this context, exactly as if it had
   * run synchronously inside `run()`. Needed because auto-capture only works while this context is
   * the active scope, which by definition isn't true anymore once the callback that created it has
   * already returned - e.g. a click handler registered inside a `six.breakpoint()`/`six.context()`
   * callback runs later, on its own, with no context active unless it's wrapped like this first.
   */
  scope<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
    return (...args: A) => this.run(() => fn(...args));
  }

  _capture(target: Killable): void {
    this.add(target);
  }

  revert(): void {
    this.captured.forEach((t) => t.kill());
    this.captured.clear();
  }

  kill(): void {
    if (this.dead) return;
    this.dead = true;
    this.revert();
  }

  get isDead(): boolean {
    return this.dead;
  }
}

export function context(fn?: (self: Context) => void): Context {
  return new Context(fn);
}
