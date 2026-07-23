import { registerMarquee } from "./marquee";
import { registerSlider } from "./slider";
import { registerDialog } from "./dialog";
import { registerAccordion } from "./accordion";

export { registerMarquee, registerSlider, registerDialog, registerAccordion };

export function registerComponents() {
  registerMarquee();
  registerSlider();
  registerDialog();
  registerAccordion();
}
