// six-js\src\components\accordion\accordion-trigger.ts
import { SafeHTMLElement } from "../../core/safe-element";

export class SxAccordionTrigger extends SafeHTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("aria-expanded")) this.setAttribute("aria-expanded", "false");
    this.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.getAttribute("aria-disabled") === "true") return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.click();
      return;
    }
    // ArrowUp/ArrowDown/Home/End move focus across sibling triggers, which needs knowledge of
    // the whole group - handled by the closest sx-accordion's own keydown listener instead of
    // here; just let them bubble unmodified.
  };
}
