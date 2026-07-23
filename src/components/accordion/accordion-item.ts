// six-js\src\components\accordion\accordion-item.ts
import { SafeHTMLElement } from "../../core/safe-element";
import type { SxAccordionContent } from "./accordion-content";
import type { SxAccordionTrigger } from "./accordion-trigger";

let idCounter = 0;

export class SxAccordionItem extends SafeHTMLElement {
  private triggerEl: SxAccordionTrigger | null = null;
  private contentEl: SxAccordionContent | null = null;
  private _open = false;

  static get observedAttributes() {
    return ["sx-open", "disabled"];
  }

  connectedCallback() {
    this.triggerEl = this.querySelector<SxAccordionTrigger>(":scope > sx-accordion-trigger");
    this.contentEl = this.querySelector<SxAccordionContent>(":scope > sx-accordion-content");
    if (!this.triggerEl || !this.contentEl) return;

    const n = ++idCounter;
    if (!this.triggerEl.id) this.triggerEl.id = `sx-accordion-trigger-${n}`;
    if (!this.contentEl.id) this.contentEl.id = `sx-accordion-content-${n}`;
    this.triggerEl.setAttribute("aria-controls", this.contentEl.id);
    this.contentEl.setAttribute("aria-labelledby", this.triggerEl.id);

    this._open = this.hasAttribute("sx-open");
    this.triggerEl.setAttribute("aria-expanded", String(this._open));
    this.contentEl.setInitialState(this._open);
    this.syncDisabledState();

    this.triggerEl.addEventListener("click", this.handleTriggerClick);
  }

  disconnectedCallback() {
    this.triggerEl?.removeEventListener("click", this.handleTriggerClick);
  }

  attributeChangedCallback(name: string) {
    if (!this.triggerEl || !this.contentEl) return;
    if (name === "sx-open") {
      const shouldBeOpen = this.hasAttribute("sx-open");
      if (shouldBeOpen !== this._open) this.setOpenState(shouldBeOpen);
    } else if (name === "disabled") {
      this.syncDisabledState();
    }
  }

  private syncDisabledState(): void {
    if (!this.triggerEl) return;
    if (this.disabled) {
      this.triggerEl.setAttribute("aria-disabled", "true");
      this.triggerEl.setAttribute("tabindex", "-1");
    } else {
      this.triggerEl.removeAttribute("aria-disabled");
      this.triggerEl.setAttribute("tabindex", "0");
    }
  }

  private handleTriggerClick = (): void => {
    if (this.disabled) return;
    this.toggle();
  };

  public get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  public get value(): string {
    return this.getAttribute("value") ?? this.triggerEl?.id ?? "";
  }

  public get open(): boolean {
    return this._open;
  }

  public set open(value: boolean) {
    this.setOpenState(value);
  }

  public toggle(): void {
    this.setOpenState(!this._open);
  }

  public show(): void {
    this.setOpenState(true);
  }

  public hide(): void {
    this.setOpenState(false);
  }

  private setOpenState(shouldOpen: boolean): void {
    if (shouldOpen === this._open) return;
    if (!this.contentEl || !this.triggerEl) return;

    const beforeEvent = shouldOpen ? "sx-accordion-before-open" : "sx-accordion-before-close";
    const evt = new CustomEvent(beforeEvent, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { value: this.value },
    });
    this.dispatchEvent(evt);
    if (evt.defaultPrevented) return;

    // Move focus out to our own trigger BEFORE collapsing starts - once the panel goes inert,
    // the browser blurs whatever was focused inside it to <body> with no guaranteed next stop,
    // which feels broken if the user was, say, tabbing through a link in this exact panel.
    if (!shouldOpen && this.contentEl.contains(document.activeElement)) {
      this.triggerEl.focus();
    }

    this._open = shouldOpen;
    if (shouldOpen) this.setAttribute("sx-open", "");
    else this.removeAttribute("sx-open");
    this.triggerEl.setAttribute("aria-expanded", String(shouldOpen));

    const afterEvent = shouldOpen ? "sx-accordion-after-open" : "sx-accordion-after-close";
    const dispatchAfter = () =>
      this.dispatchEvent(
        new CustomEvent(afterEvent, { bubbles: true, composed: true, detail: { value: this.value } }),
      );

    if (shouldOpen) {
      this.contentEl.expand(dispatchAfter);
      // Lets an ancestor sx-accordion (single-select mode) know it should close any other open
      // sibling item - purely event-driven so the root needs no persistent list of its children.
      this.dispatchEvent(
        new CustomEvent("sx-accordion-item-open", { bubbles: true, composed: true, detail: { value: this.value } }),
      );
    } else {
      this.contentEl.collapse(dispatchAfter);
    }
  }
}
