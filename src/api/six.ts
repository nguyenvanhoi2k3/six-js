import { resolveTargets, Tween, TweenMode, TweenTarget, TweenVars } from "../tween/tween";
import { Timeline, TimelineVars } from "../timeline/timeline";
import { StaggerInput, computeStaggerDelay } from "../timeline/stagger";
import { rootTimeline } from "../core/root";
import { GlobalDefaults, setDefaults } from "../core/defaults";
import { Context, context } from "../core/context";
import { ScrollTrigger, ScrollTriggerVars } from "../scroll-trigger/scroll-trigger";
import { registerComponents } from "../components";

export type SixTarget = TweenTarget;

/** `scrollTrigger.trigger` defaults to the tween/timeline's own target(s) when omitted. */
export type SixScrollTriggerVars = Omit<ScrollTriggerVars, "animation" | "trigger"> & { trigger?: Element | string };
export type SixTweenVars = TweenVars & { stagger?: StaggerInput; scrollTrigger?: SixScrollTriggerVars };

function resolveTrigger(target: SixTarget, override?: Element | string): Element | string {
  if (override) return override;
  if (typeof target === "string" || target instanceof Element) return target;
  return resolveTargets(target)[0];
}

function attachScrollTrigger(target: SixTarget, vars: SixScrollTriggerVars | undefined, animation: Tween | Timeline): void {
  if (!vars) return;
  const trigger = resolveTrigger(target, vars.trigger);
  ScrollTrigger.create({ ...vars, trigger, animation });
}

function createTween(target: SixTarget, vars: SixTweenVars, mode: TweenMode, fromVars?: Record<string, unknown>): Tween | Timeline {
  const { stagger, scrollTrigger, ...rest } = vars;

  if (stagger === undefined) {
    const tween = new Tween(target, rest, mode, fromVars);
    rootTimeline.add(tween);
    attachScrollTrigger(target, scrollTrigger, tween);
    return tween;
  }

  const elements = resolveTargets(target);
  const baseDelay = rest.delay ?? 0;
  const group = new Timeline();

  elements.forEach((el, index) => {
    const delay = baseDelay + computeStaggerDelay(index, elements.length, stagger);
    group.add(new Tween(el, { ...rest, delay }, mode, fromVars), 0);
  });

  rootTimeline.add(group);
  attachScrollTrigger(target, scrollTrigger, group);
  return group;
}

function to(target: SixTarget, vars: SixTweenVars): Tween | Timeline {
  return createTween(target, vars, "to");
}

function from(target: SixTarget, vars: SixTweenVars): Tween | Timeline {
  return createTween(target, vars, "from");
}

function fromTo(target: SixTarget, fromVars: Record<string, unknown>, toVars: SixTweenVars): Tween | Timeline {
  return createTween(target, toVars, "fromTo", fromVars);
}

function set(target: SixTarget, vars: Record<string, unknown>): Tween {
  const tween = new Tween(target, { ...vars, duration: 0 });
  rootTimeline.add(tween);
  return tween;
}

export type SixTimelineVars = TimelineVars & { scrollTrigger?: SixScrollTriggerVars };

function timeline(vars?: SixTimelineVars): Timeline {
  const { scrollTrigger, ...rest } = vars ?? {};
  const tl = new Timeline(rest);
  rootTimeline.add(tl);
  if (scrollTrigger) {
    if (!scrollTrigger.trigger) {
      console.warn("[six] timeline({ scrollTrigger }) requires an explicit trigger - a Timeline has no target to default to");
    } else {
      ScrollTrigger.create({ ...scrollTrigger, trigger: scrollTrigger.trigger, animation: tl });
    }
  }
  return tl;
}

function config(value: Partial<GlobalDefaults>): void {
  setDefaults(value);
}

export const six = {
  to,
  from,
  fromTo,
  set,
  timeline,
  config,
  context,
};

/** Defines every `sx-*` custom element (dialog, slider, marquee, animate). Each element's own definition is idempotent, so calling this more than once is safe. */
export function enableElements(): void {
  registerComponents();
}

export { ScrollTrigger };
export type { Context, GlobalDefaults, Tween, Timeline, TweenVars, TimelineVars, ScrollTriggerVars };
