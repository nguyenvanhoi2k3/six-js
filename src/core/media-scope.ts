import { getActiveScope, popActiveScope, pushActiveScope, ScopeCapture, Killable } from "./scope-stack";

export type MediaQueryMap = Record<string, string>;

type SingleHandler = (matches: boolean, scope: SxMediaScope) => void | (() => void);
type MapHandler<T extends MediaQueryMap> = (matches: { [K in keyof T]: boolean }, scope: SxMediaScope) => void | (() => void);

interface QueryEntry {
  name: string | null;
  query: string;
  mql: MediaQueryList | null;
}

function hasMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function addMqlListener(mql: MediaQueryList, listener: () => void): void {
  if (typeof mql.addEventListener === "function") mql.addEventListener("change", listener);
  else mql.addListener(listener);
}

function removeMqlListener(mql: MediaQueryList, listener: () => void): void {
  if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", listener);
  else mql.removeListener(listener);
}

export class SxMediaScope implements ScopeCapture {
  private entries: QueryEntry[] = [];
  private captured = new Set<Killable>();
  private teardownFn: (() => void) | undefined;
  private dead = false;
  private hasRun = false;
  private lastSnapshot: any;
  private rafId: number | null = null;
  private readonly single: boolean;
  private readonly handler: (matches: any, scope: SxMediaScope) => void | (() => void);
  private readonly onChange = () => this.scheduleRun();

  constructor(queries: string | MediaQueryMap, handler: (matches: any, scope: SxMediaScope) => void | (() => void)) {
    getActiveScope()?._capture(this);

    this.handler = handler;
    this.single = typeof queries === "string";

    if (this.single) {
      this.entries.push({ name: null, query: queries as string, mql: null });
    } else {
      for (const name in queries as MediaQueryMap) {
        this.entries.push({ name, query: (queries as MediaQueryMap)[name], mql: null });
      }
    }

    if (!hasMatchMedia()) {
      this.run();
      return;
    }

    for (const entry of this.entries) {
      entry.mql = window.matchMedia(entry.query);
      addMqlListener(entry.mql, this.onChange);
    }

    this.run();
  }

  private snapshot(): any {
    if (this.single) return this.entries[0].mql ? this.entries[0].mql.matches : false;

    const result: Record<string, boolean> = {};
    for (const entry of this.entries) result[entry.name!] = entry.mql ? entry.mql.matches : false;
    return result;
  }

  private snapshotsEqual(a: any, b: any): boolean {
    if (this.single) return a === b;

    for (const key in a) if (a[key] !== b[key]) return false;
    return true;
  }

  private requestFrame(cb: FrameRequestCallback): number {
    if (typeof requestAnimationFrame !== "undefined") return requestAnimationFrame(cb);
    return setTimeout(cb, 16) as unknown as number;
  }

  private cancelFrame(id: number): void {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(id);
      return;
    }
    clearTimeout(id);
  }

  private scheduleRun(): void {
    if (this.dead || this.rafId !== null) return;

    this.rafId = this.requestFrame(() => {
      this.rafId = null;
      this.run();
    });
  }

  private run(): void {
    if (this.dead) return;

    const next = this.snapshot();

    if (this.hasRun && this.snapshotsEqual(next, this.lastSnapshot)) return;

    this.teardown();
    this.lastSnapshot = next;
    this.hasRun = true;

    pushActiveScope(this);
    try {
      const result = this.handler(next, this);
      this.teardownFn = typeof result === "function" ? result : undefined;
    } finally {
      popActiveScope();
    }
  }

  private teardown(): void {
    this.captured.forEach((target) => target.kill());
    this.captured.clear();

    if (this.teardownFn) {
      this.teardownFn();
      this.teardownFn = undefined;
    }
  }

  _capture(target: Killable): void {
    this.captured.add(target);
  }

  track<T extends (...args: any[]) => any>(fn: T): T {
    const scope = this;

    return ((...args: Parameters<T>) => {
      if (scope.dead) return;

      pushActiveScope(scope);
      try {
        return fn(...args);
      } finally {
        popActiveScope();
      }
    }) as T;
  }

  refresh(): void {
    if (this.dead) return;

    this.hasRun = false;
    this.run();
  }

  kill(): void {
    if (this.dead) return;
    this.dead = true;

    if (this.rafId !== null) {
      this.cancelFrame(this.rafId);
      this.rafId = null;
    }

    this.teardown();

    for (const entry of this.entries) {
      if (entry.mql) removeMqlListener(entry.mql, this.onChange);
    }
  }

  get matches(): any {
    return this.snapshot();
  }

  get isDead(): boolean {
    return this.dead;
  }
}

export function media(query: string, handler: SingleHandler): SxMediaScope;
export function media<T extends MediaQueryMap>(queries: T, handler: MapHandler<T>): SxMediaScope;
export function media(queries: string | MediaQueryMap, handler: (matches: any, scope: SxMediaScope) => void | (() => void)): SxMediaScope {
  return new SxMediaScope(queries, handler);
}
