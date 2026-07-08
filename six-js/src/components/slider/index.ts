// six-js\src\components\slider\index.ts
import "./slider.css";
export * from "./types";

import { SxSliderSlide } from "./slider-slide";
import { SxSliderPagination } from "./slider-pagination";
import { SxSliderNext } from "./slider-next";
import { SxSliderProgress } from "./slider-progress";
import { SxSliderPrev } from "./slider-prev";
import { SxSliderTrack } from "./slider-track";
import { SxSlider } from "./slider";

export function registerSlider() {
  if (!customElements.get("sx-slider")) {
    customElements.define("sx-slider", SxSlider);
  }

  if (!customElements.get("sx-slider-track")) {
    customElements.define("sx-slider-track", SxSliderTrack);
  }

  if (!customElements.get("sx-slider-slide")) {
    customElements.define("sx-slider-slide", SxSliderSlide);
  }

  if (!customElements.get("sx-slider-progress")) {
    customElements.define("sx-slider-progress", SxSliderProgress);
  }

  if (!customElements.get("sx-slider-prev")) {
    customElements.define("sx-slider-prev", SxSliderPrev);
  }

  if (!customElements.get("sx-slider-pagination")) {
    customElements.define("sx-slider-pagination", SxSliderPagination);
  }

  if (!customElements.get("sx-slider-next")) {
    customElements.define("sx-slider-next", SxSliderNext);
  }
}
