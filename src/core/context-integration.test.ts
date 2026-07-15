import { describe, expect, it, vi } from "vitest";
import { Context } from "./context";
import { Tween } from "../tween/tween";
import { Timeline } from "../timeline/timeline";

describe("Context - auto-capture of animations", () => {
  it("captures a Tween created inside run() and kills it on context.kill()", () => {
    const el = document.createElement("div");
    const ctx = new Context();

    const tween = ctx.run(() => new Tween(el, { opacity: 1, duration: 1 }));
    const killSpy = vi.spyOn(tween, "kill");

    ctx.kill();

    expect(killSpy).toHaveBeenCalledOnce();
  });

  it("does not capture a Tween created outside of run()", () => {
    const el = document.createElement("div");
    const ctx = new Context();

    const tween = new Tween(el, { opacity: 1, duration: 1 });
    const killSpy = vi.spyOn(tween, "kill");

    ctx.kill();

    expect(killSpy).not.toHaveBeenCalled();
  });

  it("captures a Timeline created inside run() and kills it (which cascades to its children) on context.kill()", () => {
    const el = document.createElement("div");
    const ctx = new Context();

    const tl = ctx.run(() => {
      const timeline = new Timeline();
      timeline.to(el, { opacity: 1, duration: 1 });
      return timeline;
    });
    const child = tl.getChildren()[0];
    const killSpy = vi.spyOn(tl, "kill");

    ctx.kill();

    expect(killSpy).toHaveBeenCalledOnce();
    expect(child.parent).toBeNull(); // Timeline.kill() cascades to its children
  });
});
