// six-js\src\components\slider\sx-slider-progress.ts
export class SxSliderProgress extends HTMLElement {
  private bar: HTMLDivElement;

  constructor() {
    super();
    // It's perfectly fine to create the element in memory here
    this.bar = document.createElement("div");
    this.bar.className = "sx-slider-progress-bar";
  }

  // ✅ Add the element to the DOM only when the component connects
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
      this.bar.style.transform = `scaleY(${clamped})`;
    } else {
      this.bar.style.transformOrigin = "left center";
      this.bar.style.transform = `scaleX(${clamped})`;
    }
  }
}

if (!customElements.get("sx-slider-progress")) {
  customElements.define("sx-slider-progress", SxSliderProgress);
}