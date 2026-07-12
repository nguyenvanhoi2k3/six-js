import { SxAnimate } from "./animate";

export function registerAnimate() {
  if (!customElements.get("sx-animate")) {
    customElements.define("sx-animate", SxAnimate);
  }
}
