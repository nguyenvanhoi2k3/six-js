import { registerAnimate } from "./animate";
import { registerMarquee } from "./marquee";
import { registerSlider } from "./slider";
import { registerDialog } from "./dialog";

export function registerComponents() {
  registerMarquee();
  registerAnimate();
  registerSlider();
  registerDialog();
}
