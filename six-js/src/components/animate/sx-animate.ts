import { EASINGS, type EasingType } from "../../easing/easing";

type AnimateType =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right";

export class SxAnimate extends HTMLElement {
  private static observer?: IntersectionObserver;

  private once = true;

  static get observedAttributes() {
    return ["type", "duration", "delay", "strength", "easing", "once"];
  }

  connectedCallback() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.classList.add("is-visible");
      return;
    }

    this.once = this.getBooleanAttr("once", true);

    this.setupVariables();

    if (!SxAnimate.observer) {
      SxAnimate.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as SxAnimate;

            if (entry.isIntersecting) {
              requestAnimationFrame(() => {
                el.classList.add("is-visible");
              });

              if (el.once) {
                SxAnimate.observer?.unobserve(el);
              }
            } else if (!el.once) {
              requestAnimationFrame(() => {
                el.classList.remove("is-visible");
              });
            }
          }
        },
        {
          rootMargin: "0px 0px -15% 0px",
          threshold: 0.01,
        },
      );
    }

    SxAnimate.observer.observe(this);
  }

  disconnectedCallback() {
    SxAnimate.observer?.unobserve(this);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) {
      return;
    }

    if (name === "once") {
      this.once = this.getBooleanAttr("once", true);

      return;
    }

    this.setupVariables();
  }

  private getBooleanAttr(name: string, defaultValue = true): boolean {
    const value = this.getAttribute(name);

    if (value === null) {
      return defaultValue;
    }

    return !["false", "0", "off"].includes(value.toLowerCase());
  }

  private setupVariables() {
    const type = (this.getAttribute("type") || "fade-up") as AnimateType;

    const duration = Math.max(0, Number(this.getAttribute("duration") ?? 400));

    const delay = Math.max(0, Number(this.getAttribute("delay") ?? 0));

    const strength = Math.max(0, Number(this.getAttribute("strength") ?? 30));

    const easingKey = (this.getAttribute("easing") ??
      "ease-in-out") as EasingType;

    const easing = EASINGS[easingKey] ?? EASINGS["ease-in-out"];

    this.style.setProperty("--sx-duration", `${duration}ms`);

    this.style.setProperty("--sx-delay", `${delay + this.groupDelay()}ms`);

    this.style.setProperty("--sx-easing", easing);

    let x = 0;
    let y = 0;

    switch (type) {
      case "fade-up":
        y = strength;
        break;

      case "fade-down":
        y = -strength;
        break;

      case "fade-left":
        x = strength;
        break;

      case "fade-right":
        x = -strength;
        break;
    }

    this.style.setProperty("--sx-x", `${x}px`);

    this.style.setProperty("--sx-y", `${y}px`);
  }

  private groupDelay(): number {
    if (!this.hasAttribute("group")) {
      return 0;
    }

    const parent = this.parentElement;

    if (!parent) {
      return 0;
    }

    const items = Array.from(
      parent.querySelectorAll<SxAnimate>("sx-animate[group]"),
    );

    const index = items.indexOf(this);

    return index > -1 ? index * 80 : 0;
  }
}

if (!customElements.get("sx-animate")) {
  customElements.define("sx-animate", SxAnimate);
}
