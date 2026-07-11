// six-js\src\components\animate\animate.ts
import { EASINGS, type EasingType } from "../../easing/easing";
import { observe, unobserve } from "../../core/observer";
import { parseTimeValue } from "../../core/time";
import { SafeHTMLElement } from "../../core/safe-element";

type AnimateType =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right";

type AnimateOptions = {
  x: number;
  y: number;
  easing: string;
  duration: number;
  delay: number;
};

export class SxAnimate extends SafeHTMLElement {
  private animation?: Animation;
  private options!: AnimateOptions;

  private static counter = 0;
  private readonly order = SxAnimate.counter++;

  private static _mediaQuery: MediaQueryList | null = null;

  private static get mediaQuery(): MediaQueryList {
    if (!this._mediaQuery) {
      this._mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    }
    return this._mediaQuery;
  }

  private static get reduceMotion() {
    return this.mediaQuery.matches;
  }

  static groupQueue = new Set<SxAnimate>();
  static isProcessingGroup = false;

  private static scheduleGroup() {
    if (this.isProcessingGroup || !this.groupQueue.size) return;

    this.isProcessingGroup = true;

    queueMicrotask(() => {
      this.handleGroup([...this.groupQueue]);
      this.groupQueue.clear();
      this.isProcessingGroup = false;
    });
  }

  static handleGroup(items: SxAnimate[]) {
    items.sort((a, b) => a.order - b.order);
    items.forEach((el, index) => {
      el.play(index * 120);
    });
  }

  get isGroup() {
    return this.hasAttribute("group");
  }

  connectedCallback() {
    this.options = this.getOptions();

    if (SxAnimate.reduceMotion) {
      this.style.opacity = "1";
      this.style.transform = "none";
      return;
    }

    this.setInitialState();

    observe(this, {
      enter: () => this.handleEnter(),
      leave: () => this.handleLeave(),
    });
  }

  disconnectedCallback() {
    this.animation?.cancel();
    unobserve(this);
    SxAnimate.groupQueue.delete(this);
  }

  private handleEnter() {
    if (!this.hasAttribute("replay")) {
      unobserve(this);
    }

    if (this.isGroup) {
      SxAnimate.groupQueue.add(this);
      SxAnimate.scheduleGroup();
    } else {
      this.play();
    }
  }

  private handleLeave() {
    if (this.hasAttribute("replay")) {
      this.reset();
    }
  }

  private getOptions(): AnimateOptions {
    const strength = Number(this.getAttribute("strength")) || 30;

    const offsets: Record<AnimateType, [number, number]> = {
      fade: [0, 0],
      "fade-up": [0, strength],
      "fade-down": [0, -strength],
      "fade-left": [strength, 0],
      "fade-right": [-strength, 0],
    };

    const type = (this.getAttribute("type") as AnimateType) ?? "fade-up";
    const easing = this.getAttribute("easing") as EasingType | null;
    const [x, y] = offsets[type] ?? offsets["fade-up"];

    return {
      x,
      y,
      easing: easing && easing in EASINGS ? easing : "strongInOut",
      duration: parseTimeValue(this.getAttribute("duration"), 400),
      delay: parseTimeValue(this.getAttribute("delay"), 0),
    };
  }

  private setInitialState() {
    this.style.opacity = "0";
    this.style.transform = "none";
  }

  reset() {
    this.animation?.cancel();
    this.animation = undefined;
    this.setInitialState();
  }

  play(extraDelay = 0) {
    const { x, y, easing, duration, delay } = this.options;

    this.animation?.cancel();

    this.animation = this.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${x}px, ${y}px, 0)`,
        },
        {
          opacity: 1,
          transform: "translate3d(0,0,0)",
        },
      ],
      {
        duration,
        delay: delay + extraDelay,
        easing,
        fill: "both",
      },
    );

    this.animation.onfinish = () => {
      this.style.opacity = "1";
      this.style.transform = "translate3d(0,0,0)";

      this.animation?.cancel();
      this.animation = undefined;
    };
  }
}

