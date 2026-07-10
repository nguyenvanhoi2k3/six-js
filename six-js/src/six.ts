// six-js\src\six.ts

import { logVersion } from "./log";
import { registerComponents } from "./components";
import { SxTween, TweenVars, TweenMode } from "./core/tween";
import { Playable } from "./core/playable";
import { setDefaults } from "./core/defaults";
import { ScrollTriggerController, OnScrollOptions } from "./core/scroll-trigger";
import { applyOverwrite } from "./core/overwrite-manager";
import "./properties";

logVersion();

let initialized = false;

function initElement() {
  if (initialized) return;
  registerComponents();
  initialized = true;
}

function resolveTriggerElement(
  target: string | HTMLElement | HTMLElement[],
): HTMLElement | null {
  if (typeof target === "string") return document.querySelector(target);
  if (Array.isArray(target)) return target[0] ?? null;
  return target;
}

type FullTweenVars = TweenVars & { onScroll?: OnScrollOptions };

function createTween(
  target: string | HTMLElement | HTMLElement[],
  vars: FullTweenVars,
  mode: TweenMode,
  fromVars?: Record<string, any>,
): Playable {
  const {
    onScroll,
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

  // restVars vẫn còn "duration"/"ease" (SxTween cần đọc 2 field này) lẫn property CSS ->
  // KHÔNG lọc tiếp ở đây, SxTween tự bỏ qua "duration"/"ease" khi build danh sách property.
  const tween = new SxTween(target, restVars, mode, fromVars);

  const playable = new Playable(tween, {
    // Có onScroll -> luôn không autoplay (scroll điều khiển). Không thì theo `paused`.
    autoplay: onScroll ? false : !paused,
    delay,
    repeat,
    repeatDelay,
    boomerang,
  });

  if (onStart) playable.on("start", onStart);
  if (onUpdate) playable.on("update", onUpdate);
  if (onComplete) playable.on("complete", onComplete);
  if (onRepeat) playable.on("repeat", onRepeat);
  if (onReverseComplete) playable.on("reverseComplete", onReverseComplete);

  applyOverwrite(tween.targetElements, playable, overwrite);

  if (onScroll) {
    const triggerEl = resolveTriggerElement(onScroll.target ?? target);

    if (!triggerEl) {
      console.warn(`[six-js] onScroll: trigger element not found`);
    } else {
      new ScrollTriggerController(triggerEl, playable, onScroll);
    }
  }

  return playable;
}

function to(target: string | HTMLElement | HTMLElement[], vars: FullTweenVars): Playable {
  return createTween(target, vars, "to");
}

function from(target: string | HTMLElement | HTMLElement[], vars: FullTweenVars): Playable {
  return createTween(target, vars, "from");
}

function fromTo(
  target: string | HTMLElement | HTMLElement[],
  fromVars: Record<string, any>,
  toVars: FullTweenVars,
): Playable {
  return createTween(target, toVars, "fromTo", fromVars);
}

export const six = {
  initElement,
  to,
  from,
  fromTo,
  setDefaults,
};