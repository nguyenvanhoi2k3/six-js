// six-js\src\six.ts

import { logVersion } from "./log";
import { registerComponents } from "./components";
import { SxTween, TweenVars, TweenMode } from "./core/tween";
import { Playable } from "./core/playable";
import { setDefault } from "./core/defaults";
import { ScrollTriggerController, OnScrollOptions } from "./core/scroll-trigger";
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

function createTween(
  target: string | HTMLElement | HTMLElement[],
  vars: TweenVars & { onScroll?: OnScrollOptions },
  mode: TweenMode,
  fromVars?: Record<string, any>,
): Playable {
  const { onScroll, ...restVars } = vars;

  const tween = new SxTween(target, restVars, mode, fromVars);
  const playable = new Playable(tween, !onScroll); // có onScroll -> không autoplay, để scroll điều khiển

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

function to(
  target: string | HTMLElement | HTMLElement[],
  vars: TweenVars & { onScroll?: OnScrollOptions },
): Playable {
  return createTween(target, vars, "to");
}

function from(
  target: string | HTMLElement | HTMLElement[],
  vars: TweenVars & { onScroll?: OnScrollOptions },
): Playable {
  return createTween(target, vars, "from");
}

function fromTo(
  target: string | HTMLElement | HTMLElement[],
  fromVars: Record<string, any>,
  toVars: TweenVars & { onScroll?: OnScrollOptions },
): Playable {
  return createTween(target, toVars, "fromTo", fromVars);
}

export const six = {
  initElement,
  to,
  from,
  fromTo,
  setDefault,
};