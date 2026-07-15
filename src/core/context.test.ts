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
});
