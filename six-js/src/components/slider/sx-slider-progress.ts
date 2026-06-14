export class SxSliderProgress extends HTMLElement {
  private bar: HTMLDivElement;

  constructor() {
    super();
    this.bar = document.createElement("div");
    this.bar.className = "sx-slider-progress-bar";
    this.appendChild(this.bar);
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