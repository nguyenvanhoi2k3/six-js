// six-js\src\six.ts

import { logVersion } from "./log";
import { registerComponents } from "./components";
import { SxTween, TweenVars } from "./core/tween";
import { Playable } from "./core/playable";
import { setDefault } from "./core/defaults";
import "./properties";

logVersion();

let initialized = false;

function initElement() {
  if (initialized) return;
  registerComponents();
  initialized = true;
}

function to(target: string | HTMLElement | HTMLElement[], vars: TweenVars): Playable {
  const tween = new SxTween(target, vars, "to");
  return new Playable(tween, true);
}

function from(target: string | HTMLElement | HTMLElement[], vars: TweenVars): Playable {
  const tween = new SxTween(target, vars, "from");
  return new Playable(tween, true);
}

function fromTo(
  target: string | HTMLElement | HTMLElement[],
  fromVars: Record<string, any>,
  toVars: TweenVars,
): Playable {
  const tween = new SxTween(target, toVars, "fromTo", fromVars);
  return new Playable(tween, true);
}

export const six = {
  initElement,
  to,
  from,
  fromTo,
  setDefault,
};