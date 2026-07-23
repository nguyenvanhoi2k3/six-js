// six-js\src\components\accordion\accordion.ts
import { SafeHTMLElement } from "../../core/safe-element";
import type { SxAccordionItem } from "./accordion-item";
import type { SxAccordionToggleDetail } from "./types";

export class SxAccordion extends SafeHTMLElement {
  static get observedAttributes() {
    return ["duration"];
  }

  public get multiple(): boolean {
    return this.hasAttribute("multiple");
  }

  public get duration(): number {
    const attr = this.getAttribute("duration");
    const parsed = attr !== null ? Number(attr) : NaN;
    return Number.isFinite(parsed) ? parsed * 1000 : 250;
  }

  connectedCallback() {
    this.syncDuration();
    this.addEventListener("sx-accordion-item-open", this.handleItemOpen);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("sx-accordion-item-open", this.handleItemOpen);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  attributeChangedCallback(name: string) {
    if (name === "duration") this.syncDuration();
  }

  private syncDuration(): void {
    this.style.setProperty("--sx-accordion-duration", `${this.duration}ms`);
  }

  private getItems(): SxAccordionItem[] {
    return Array.from(this.children).filter(
      (el): el is SxAccordionItem => el.tagName === "SX-ACCORDION-ITEM",
    );
  }

  private handleItemOpen = (e: CustomEvent<SxAccordionToggleDetail>): void => {
    if (this.multiple) return;
    const openedItem = e.target as SxAccordionItem;

    // This event bubbles (so a single ancestor listener is enough for the common case), which
    // means a nested sx-accordion's own "item opened" event also reaches every accordion ABOVE
    // it, not just its own direct parent. Without this guard, an outer accordion would mistake
    // "some descendant, arbitrarily deep, just opened" for "one of MY OWN items just opened" and
    // close whichever of its own items was open - including the very item that contains the
    // nested accordion the event actually came from.
    if (openedItem.parentElement !== this) return;

    for (const item of this.getItems()) {
      if (item !== openedItem && item.open) item.hide();
    }
  };

  private getTriggers(): HTMLElement[] {
    const triggers: HTMLElement[] = [];
    for (const item of this.getItems()) {
      if (item.disabled) continue;
      const trigger = item.querySelector<HTMLElement>(":scope > sx-accordion-trigger");
      if (trigger) triggers.push(trigger);
    }
    return triggers;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;

    const target = e.target as HTMLElement | null;
    if (!target || target.tagName !== "SX-ACCORDION-TRIGGER") return;

    // Direct-membership check, not just "some trigger somewhere below me": this guards against a
    // nested sx-accordion inside one of this accordion's own panels - a keydown on ITS trigger
    // bubbles up through this listener too, but indexOf below is -1 for it, so it's a no-op here
    // (the nested accordion's own listener already handled it on the way up).
    const triggers = this.getTriggers();
    const currentIndex = triggers.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex: number;
    switch (e.key) {
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      default: // "End"
        nextIndex = triggers.length - 1;
        break;
    }

    e.preventDefault();
    triggers[nextIndex]?.focus();
  };
}
