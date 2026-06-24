// six-js\src\components\slider\sx-slider-slide.ts
export class SxSliderSlide extends HTMLElement {
  constructor() {
    super();
  }
}

if (!customElements.get("sx-slider-slide")) {
  customElements.define("sx-slider-slide", SxSliderSlide);
}
