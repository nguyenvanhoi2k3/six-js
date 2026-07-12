import { SxMarquee, SxMarqueeInner, SxMarqueeItem } from "./marquee";

export function registerMarquee() {
  if (!customElements.get("sx-marquee")) {
    customElements.define("sx-marquee", SxMarquee);
  }

  if (!customElements.get("sx-marquee-inner")) {
    customElements.define("sx-marquee-inner", SxMarqueeInner);
  }

  if (!customElements.get("sx-marquee-item")) {
    customElements.define("sx-marquee-item", SxMarqueeItem);
  }
}
