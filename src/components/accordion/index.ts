// six-js\src\components\accordion\index.ts
import "./accordion.css";

import { SxAccordionContent } from "./accordion-content";
import { SxAccordionTrigger } from "./accordion-trigger";
import { SxAccordionItem } from "./accordion-item";
import { SxAccordion } from "./accordion";

export function registerAccordion() {
  // Leaf tags must be defined (and thus upgraded) before sx-accordion-item, since its own
  // connectedCallback calls contentEl.expand()/collapse()/setInitialState() synchronously - if
  // sx-accordion-content weren't upgraded yet, those custom methods simply wouldn't exist on it.
  // customElements.define() upgrades every existing matching element the moment it's called, in
  // tree order, so defining children first guarantees they're already real instances by the time
  // sx-accordion-item's define() call runs its connectedCallback for any pre-existing markup.
  if (!customElements.get("sx-accordion-content")) {
    customElements.define("sx-accordion-content", SxAccordionContent);
  }
  if (!customElements.get("sx-accordion-trigger")) {
    customElements.define("sx-accordion-trigger", SxAccordionTrigger);
  }
  if (!customElements.get("sx-accordion-item")) {
    customElements.define("sx-accordion-item", SxAccordionItem);
  }
  if (!customElements.get("sx-accordion")) {
    customElements.define("sx-accordion", SxAccordion);
  }
}
