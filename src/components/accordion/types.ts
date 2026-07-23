/* six-js\src\components\accordion\types.ts */

export interface SxAccordionToggleDetail {
  value: string;
}

export interface SxAccordionEventMap {
  "sx-accordion-before-open": CustomEvent<SxAccordionToggleDetail>;
  "sx-accordion-after-open": CustomEvent<SxAccordionToggleDetail>;
  "sx-accordion-before-close": CustomEvent<SxAccordionToggleDetail>;
  "sx-accordion-after-close": CustomEvent<SxAccordionToggleDetail>;
  "sx-accordion-item-open": CustomEvent<SxAccordionToggleDetail>;
}

declare global {
  interface HTMLElementEventMap extends SxAccordionEventMap {}
}
