// six-js\src\six.ts

import { logVersion } from "./log";
import { registerComponents } from "./components";
import { SxTween, TweenVars } from "./core/tween";
import { Playable } from "./core/playable";
import "./properties"; // đăng ký toàn bộ property handler (transform, css-numeric...)

logVersion();

let initialized = false;

function initElement() {
  if (initialized) return;
  registerComponents();
  initialized = true;
}

function to(target: string | HTMLElement | HTMLElement[], vars: TweenVars): Playable {
  const tween = new SxTween(target, vars);
  return new Playable(tween, true);
}

export const six = {
  initElement,
  to,
};