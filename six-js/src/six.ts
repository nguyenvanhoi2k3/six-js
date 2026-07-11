import { registerComponents } from "./components";
import { SxTween, TweenVars, TweenMode } from "./core/tween";
import { Playable } from "./core/playable";
import { setDefaults } from "./core/defaults";
import { ScrollTriggerController, OnScrollOptions } from "./core/scroll-trigger";
import { applyOverwrite } from "./core/overwrite-manager";
import { computeStaggerDelay, PlayableGroup, StaggerInput } from "./core/stagger";
import { SxTimeline, TimelineVars } from "./core/timeline";
import { VERSION } from "./version";
import "./properties";

console.log(` SixJS v${VERSION}`);

let initialized = false;

function initElements() {
  if (initialized) return;
  registerComponents();
  initialized = true;
}

export type SixTarget = string | HTMLElement | (HTMLElement | null | undefined)[] | null | undefined;

function getClass(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

function getId(selector: string): HTMLElement | null {
  const id = selector.startsWith("#") ? selector.slice(1) : selector;
  return document.getElementById(id);
}

function set(target: SixTarget, vars: Record<string, any>): void {
  const tween = new SxTween(target, { ...vars, duration: 0 }, "to");
  tween.render(0);
  tween.onComplete();
}

function resolveTriggerElement(target: SixTarget): HTMLElement | null {
  if (typeof target === "string") return document.querySelector(target);
  if (Array.isArray(target)) return target.find((el): el is HTMLElement => el != null) ?? null;
  return target ?? null;
}

function resolveTargetList(target: SixTarget): HTMLElement[] {
  if (typeof target === "string") return Array.from(document.querySelectorAll(target));
  if (Array.isArray(target)) return target.filter((el): el is HTMLElement => el != null);
  return target ? [target] : [];
}

type FullTweenVars = TweenVars & { onScroll?: OnScrollOptions; stagger?: StaggerInput };

function buildSingleTween(
  target: SixTarget,
  restVars: TweenVars,
  mode: TweenMode,
  fromVars: Record<string, any> | undefined,
  extraDelay: number,
  common: {
    onScroll?: OnScrollOptions;
    delay?: number;
    paused?: boolean;
    repeat?: number;
    repeatDelay?: number;
    boomerang?: boolean;
    overwrite?: boolean | "auto";
    onStart?: () => void;
    onUpdate?: () => void;
    onComplete?: () => void;
    onRepeat?: () => void;
    onReverseComplete?: () => void;
  },
): Playable {
  const tween = new SxTween(target, restVars, mode, fromVars);

  const playable = new Playable(tween, {
    autoplay: common.onScroll ? false : !common.paused,
    delay: (common.delay ?? 0) + extraDelay,
    repeat: common.repeat,
    repeatDelay: common.repeatDelay,
    boomerang: common.boomerang,
  });

  if (common.onStart) playable.on("start", common.onStart);
  if (common.onUpdate) playable.on("update", common.onUpdate);
  if (common.onComplete) playable.on("complete", common.onComplete);
  if (common.onRepeat) playable.on("repeat", common.onRepeat);
  if (common.onReverseComplete) playable.on("reverseComplete", common.onReverseComplete);

  applyOverwrite(tween.targetElements, playable, common.overwrite);

  if (common.onScroll) {
    const triggerEl = resolveTriggerElement(common.onScroll.target ?? target);

    if (!triggerEl) {
      console.warn(`[six-js] onScroll: trigger element not found`);
    } else {
      new ScrollTriggerController(triggerEl, playable, common.onScroll);
    }
  }

  return playable;
}

function createTween(
  target: SixTarget,
  vars: FullTweenVars,
  mode: TweenMode,
  fromVars?: Record<string, any>,
): Playable | PlayableGroup {
  const {
    onScroll,
    stagger,
    delay,
    paused,
    repeat,
    repeatDelay,
    boomerang,
    overwrite,
    onStart,
    onUpdate,
    onComplete,
    onRepeat,
    onReverseComplete,
    ...restVars
  } = vars;

  const common = { onScroll, delay, paused, repeat, repeatDelay, boomerang, overwrite, onStart, onUpdate, onComplete, onRepeat, onReverseComplete };

  if (stagger === undefined) {
    return buildSingleTween(target, restVars, mode, fromVars, 0, common);
  }

  const elements = resolveTargetList(target);

  if (elements.length === 0) {
    console.warn(`[six-js] stagger: no elements matched`);
  }

  const hasIndexFn = Object.values(restVars).some((v) => typeof v === "function");
  if (hasIndexFn) {
    console.warn(
      `[six-js] stagger: function value (index, el) => ... luôn nhận index=0 vì mỗi phần ` +
        `tử stagger giờ là 1 tween độc lập, không phải index gốc trong danh sách. Nếu cần ` +
        `giá trị theo index gốc, hãy tự tính mảng giá trị trước thay vì dùng callback.`,
    );
  }

  const delays = elements.map((_, index) => computeStaggerDelay(index, elements.length, stagger));

  const childCommon = onScroll ? { ...common, onScroll: undefined, paused: true } : common;

  const usesGroupSeek = !!onScroll && (onScroll.sync === true || typeof onScroll.sync === "number");

  const playables = elements.map((el, index) =>
    buildSingleTween(el, restVars, mode, fromVars, usesGroupSeek ? 0 : delays[index], childCommon),
  );

  const group = new PlayableGroup(playables, delays);

  if (onScroll) {
    const triggerEl = resolveTriggerElement(onScroll.target ?? target);

    if (!triggerEl) {
      console.warn(`[six-js] onScroll: trigger element not found`);
    } else {
      new ScrollTriggerController(triggerEl, group, onScroll);
    }
  }

  return group;
}

function to(target: SixTarget, vars: FullTweenVars): Playable | PlayableGroup {
  return createTween(target, vars, "to");
}

function from(target: SixTarget, vars: FullTweenVars): Playable | PlayableGroup {
  return createTween(target, vars, "from");
}

function fromTo(target: SixTarget, fromVars: Record<string, any>, toVars: FullTweenVars): Playable | PlayableGroup {
  return createTween(target, toVars, "fromTo", fromVars);
}

function timeline(vars?: TimelineVars): SxTimeline {
  return new SxTimeline(vars);
}

export const six = {
  initElements,
  getClass,
  getId,
  set,
  to,
  from,
  fromTo,
  timeline,
  setDefaults,
};