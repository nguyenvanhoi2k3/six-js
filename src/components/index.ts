import { registerMarquee } from "./marquee";
import { registerSlider } from "./slider";
import { registerDialog } from "./dialog";

export { registerMarquee, registerSlider, registerDialog };

export function registerComponents() {
  registerMarquee();
  registerSlider();
  registerDialog();
}
