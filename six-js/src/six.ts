// six-js\src\six.ts

import { logVersion } from "./log";
import { registerComponents } from "./components";
import { SxTween, TweenVars, TweenMode } from "./core/tween";
import { Playable, PlayableOptions } from "./core/playable";
import { setDefaults } from "./core/defaults";
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

interface ExtendedVars extends TweenVars {
  onScroll?: OnScrollOptions;
  /** Giây, chờ trước khi tween bắt đầu chạy */
  delay?: number;
  /** Số lần lặp thêm sau lần đầu. -1 = vô hạn */
  repeat?: number;
  /** Giây, khoảng nghỉ giữa các lần lặp */
  repeatDelay?: number;
  /** true = mỗi lần lặp đảo chiều (tương đương yoyo GSAP) */
  reverse?: boolean;
  /** Mặc định true: tween mới tự động "giết" tween cũ đang động vào cùng property/phần tử */
  overwrite?: boolean;
  /** true: tween được tạo (và render frame đầu) nhưng không tự chạy, phải gọi .play() thủ công */
  pause?: boolean;
  /** Hệ số tốc độ phát lại (tương đương timeScale GSAP). Mặc định 1. */
  speed?: number;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
  onRepeat?: () => void;
  onReverseComplete?: () => void;
}

/**
 * Registry theo dõi Playable nào đang "làm chủ" 1 property trên 1 phần tử, để
 * overwrite có thể kill tween cũ khi tween mới động vào đúng property đó.
 */
const overwriteRegistry = new WeakMap<HTMLElement, Map<string, Playable>>();

function applyOverwrite(tween: SxTween, playable: Playable): void {
  for (const { target, keys } of tween.getTouchedProperties()) {
    let slot = overwriteRegistry.get(target);

    if (!slot) {
      slot = new Map();
      overwriteRegistry.set(target, slot);
    }

    for (const key of keys) {
      const existing = slot.get(key);

      if (existing && existing !== playable) {
        existing.kill();
      }

      slot.set(key, playable);
    }
  }
}

function createTween(
  target: string | HTMLElement | HTMLElement[],
  vars: ExtendedVars,
  mode: TweenMode,
  fromVars?: Record<string, any>,
): Playable {
  const {
    onScroll,
    delay,
    repeat,
    repeatDelay,
    reverse,
    overwrite,
    pause,
    speed,
    onStart,
    onUpdate,
    onComplete,
    onRepeat,
    onReverseComplete,
    ...restVars
  } = vars;

  const tween = new SxTween(target, restVars, mode, fromVars);

  const playableOptions: PlayableOptions = { delay, repeat, repeatDelay, yoyo: reverse, speed };
  // Luôn construct với autoplay:false rồi mới play() thủ công SAU khi đã gắn listener,
  // vì Playable bắn "start" ngay trong constructor nếu autoplay:true — nếu gắn .on()
  // sau khi construct xong thì listener luôn bị lỡ mất sự kiện "start" đầu tiên.
  const playable = new Playable(tween, false, playableOptions);

  if (onStart) playable.on("start", onStart);
  if (onUpdate) playable.on("update", onUpdate);
  if (onComplete) playable.on("complete", onComplete);
  if (onRepeat) playable.on("repeat", onRepeat);
  if (onReverseComplete) playable.on("reverseComplete", onReverseComplete);

  if (overwrite !== false) {
    applyOverwrite(tween, playable);
  }

  if (onScroll) {
    const triggerEl = resolveTriggerElement(onScroll.target ?? target);

    if (!triggerEl) {
      console.warn(`[six-js] onScroll: trigger element not found`);
    } else {
      new ScrollTriggerController(triggerEl, playable, onScroll);
    }
  } else if (!pause) {
    playable.play();
  }

  return playable;
}

function to(target: string | HTMLElement | HTMLElement[], vars: ExtendedVars): Playable {
  return createTween(target, vars, "to");
}

function from(target: string | HTMLElement | HTMLElement[], vars: ExtendedVars): Playable {
  return createTween(target, vars, "from");
}

function fromTo(
  target: string | HTMLElement | HTMLElement[],
  fromVars: Record<string, any>,
  toVars: ExtendedVars,
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