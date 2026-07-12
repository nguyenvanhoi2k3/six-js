// six-js\src\components\slider\slider-progress.ts
import { setTransformValue, buildTransformString } from "../../properties/transform-state";
import { SafeHTMLElement } from "../../core/safe-element";

export class SxSliderProgress extends SafeHTMLElement {
  private bar: HTMLDivElement;

  constructor() {
    super();
    this.bar = document.createElement("div");
    this.bar.className = "sx-slider-progress-bar";
  }

  connectedCallback() {
    if (!this.contains(this.bar)) {
      this.appendChild(this.bar);
    }
  }

  public update(ratio: number, direction: "horizontal" | "vertical", transition: string) {
    const clamped = Math.max(0, Math.min(1, ratio));
    
    this.bar.style.transition = transition || "none";

    if (direction === "vertical") {
      this.bar.style.transformOrigin = "top center";
      setTransformValue(this.bar, "scaleY", clamped);
      setTransformValue(this.bar, "scaleX", 1);
    } else {
      this.bar.style.transformOrigin = "left center";
      setTransformValue(this.bar, "scaleX", clamped);
      setTransformValue(this.bar, "scaleY", 1);
    }

    this.bar.style.transform = buildTransformString(this.bar);
  }
}
