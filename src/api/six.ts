import { resolveTargets, Tween, TweenMode, TweenTarget, TweenVars } from "../tween/tween";
import { Timeline, TimelineVars } from "../timeline/timeline";
import { StaggerInput, computeStaggerDelay } from "../timeline/stagger";
import { rootTimeline } from "../core/root";
import { GlobalDefaults, setDefaults } from "../core/defaults";
import { Context, context } from "../core/context";

export type SixTarget = TweenTarget;
export type SixTweenVars = TweenVars & { stagger?: StaggerInput };

function createTween(target: SixTarget, vars: SixTweenVars, mode: TweenMode, fromVars?: Record<string, unknown>): Tween | Timeline {
  const { stagger, ...rest } = vars;

  if (stagger === undefined) {
    const tween = new Tween(target, rest, mode, fromVars);
    rootTimeline.add(tween);
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

function timeline(vars?: TimelineVars): Timeline {
  const tl = new Timeline(vars);
  rootTimeline.add(tl);
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

export type { Context, GlobalDefaults, Tween, Timeline, TweenVars, TimelineVars };
