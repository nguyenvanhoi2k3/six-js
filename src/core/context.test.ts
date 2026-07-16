import { describe, expect, it, vi } from "vitest";
import { Context, context, getActiveScope } from "./context";

describe("Context", () => {
  it("has no active scope outside of run()", () => {
    expect(getActiveScope()).toBeNull();
  });

  it("makes itself the active scope only while its function runs", () => {
    const ctx = new Context();
    let sawSelf: unknown;

    ctx.run((self) => {
      sawSelf = getActiveScope();
      expect(self).toBe(ctx);
    });

    expect(sawSelf).toBe(ctx);
    expect(getActiveScope()).toBeNull();
  });

  it("restores the previous scope after a nested run() completes", () => {
    const outer = new Context();
    const inner = new Context();

    outer.run(() => {
      expect(getActiveScope()).toBe(outer);
      inner.run(() => {
        expect(getActiveScope()).toBe(inner);
      });
      expect(getActiveScope()).toBe(outer);
    });
  });

  it("restores the previous scope even if the function throws", () => {
    const ctx = new Context();
    expect(() =>
      ctx.run(() => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(getActiveScope()).toBeNull();
  });

  it("kills every captured target on kill()/revert()", () => {
    const ctx = new Context();
    const a = { kill: vi.fn() };
    const b = { kill: vi.fn() };
    ctx.add(a);
    ctx.add(b);

    ctx.kill();

    expect(a.kill).toHaveBeenCalledOnce();
    expect(b.kill).toHaveBeenCalledOnce();
  });

  it("does not re-kill already-captured targets after a second kill()", () => {
    const ctx = new Context();
    const a = { kill: vi.fn() };
    ctx.add(a);

    ctx.kill();
    ctx.kill();

    expect(a.kill).toHaveBeenCalledOnce();
  });

  it("stops capturing new targets once dead", () => {
    const ctx = new Context();
    ctx.kill();

    const late = { kill: vi.fn() };
    ctx.add(late);
    ctx.kill();

    expect(late.kill).not.toHaveBeenCalled();
  });

  it("the context() factory runs its function immediately when provided", () => {
    const spy = vi.fn();
    context(spy);
    expect(spy).toHaveBeenCalledOnce();
  });

  describe("scope()", () => {
    it("makes the context the active scope while the wrapped function runs, even called later", () => {
      const ctx = new Context();
      const wrapped = ctx.scope(() => getActiveScope());

      expect(getActiveScope()).toBeNull(); // not active yet - scope() only wraps, doesn't run
      expect(wrapped()).toBe(ctx); // now active, for the duration of this one call
      expect(getActiveScope()).toBeNull(); // and restored again afterward
    });

    it("captures anything Killable created while the wrapped function runs", () => {
      const ctx = new Context();
      const target = { kill: vi.fn() };
      const wrapped = ctx.scope(() => {
        getActiveScope()?._capture(target);
      });

      wrapped();
      ctx.kill();

      expect(target.kill).toHaveBeenCalledOnce();
    });

    it("forwards arguments and the return value through to the wrapped function", () => {
      const ctx = new Context();
      const wrapped = ctx.scope((a: number, b: number) => a + b);

      expect(wrapped(2, 3)).toBe(5);
    });

    it("can be called more than once, each call captured independently", () => {
      const ctx = new Context();
      const targets = [{ kill: vi.fn() }, { kill: vi.fn() }];
      const wrapped = ctx.scope((target: { kill: () => void }) => {
        getActiveScope()?._capture(target);
      });

      wrapped(targets[0]);
      wrapped(targets[1]);
      ctx.kill();

      expect(targets[0].kill).toHaveBeenCalledOnce();
      expect(targets[1].kill).toHaveBeenCalledOnce();
    });
  });
});
