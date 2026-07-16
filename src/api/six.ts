import { resolveTargets, Tween, TweenMode, TweenTarget, TweenVars } from "../tween/tween";
import { Timeline, TimelineVars } from "../timeline/timeline";
import { StaggerInput, computeStaggerDelay } from "../timeline/stagger";
import { rootTimeline } from "../core/root";
import { GlobalDefaults, setDefaults } from "../core/defaults";
import { Context, context } from "../core/context";
import { Breakpoint, BreakpointCallback, BreakpointConditions, BreakpointContext, breakpoint } from "../core/breakpoint";
import { OnScroll, OnScrollVars } from "../on-scroll/on-scroll";
import { registerComponents } from "../components";
import * as utils from "../utils/utils";
import { VERSION } from "../version";

console.log(`sixjs v${VERSION}`);

export type SixTarget = TweenTarget;

/** `onScroll.trigger` defaults to the tween/timeline's own target(s) when omitted. */
export type SixOnScrollVars = Omit<OnScrollVars, "animation" | "trigger"> & { trigger?: Element | string };
export type SixTweenVars = TweenVars & { stagger?: StaggerInput; onScroll?: SixOnScrollVars };

function resolveTrigger(target: SixTarget, override?: Element | string): Element | string {
  if (override) return override;
  if (typeof target === "string" || target instanceof Element) return target;
  return resolveTargets(target)[0];
}

function attachOnScroll(target: SixTarget, vars: SixOnScrollVars | undefined, animation: Tween | Timeline): void {
  if (!vars) return;
  const trigger = resolveTrigger(target, vars.trigger);
  OnScroll.create({ ...vars, trigger, animation });
}

function createTween(target: SixTarget, vars: SixTweenVars, mode: TweenMode, fromVars?: Record<string, unknown>): Tween | Timeline {
  const { stagger, onScroll, ...rest } = vars;

  if (stagger === undefined) {
    const tween = new Tween(target, rest, mode, fromVars);
    rootTimeline.add(tween);
    attachOnScroll(target, onScroll, tween);
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
  attachOnScroll(target, onScroll, group);
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

export type SixTimelineVars = TimelineVars & { onScroll?: SixOnScrollVars };

function timeline(vars?: SixTimelineVars): Timeline {
  const { onScroll, ...rest } = vars ?? {};
  const tl = new Timeline(rest);
  rootTimeline.add(tl);
  if (onScroll) {
    if (!onScroll.trigger) {
      console.warn("[six] timeline({ onScroll }) requires an explicit trigger - a Timeline has no target to default to");
    } else {
      OnScroll.create({ ...onScroll, trigger: onScroll.trigger, animation: tl });
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
  breakpoint,
  utils,
};

/** Defines every `sx-*` custom element (dialog, slider, marquee, animate). Each element's own definition is idempotent, so calling this more than once is safe. */
export function enableElements(): void {
  registerComponents();
}

export { OnScroll };
export type { Context, GlobalDefaults, Tween, Timeline, TweenVars, TimelineVars, OnScrollVars, Breakpoint, BreakpointConditions, BreakpointCallback, BreakpointContext };
