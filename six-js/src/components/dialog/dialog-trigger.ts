// six-js\src\components\modal\modal-trigger.ts
import { SafeHTMLElement } from '../../core/safe-element';

export interface DialogToggleDetail {
  name: string;
}

export class SxDialogTrigger extends SafeHTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");

    this.addEventListener("click", this.toggleDialog);
    this.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.toggleDialog);
    this.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggleDialog();
    }
  };

  private toggleDialog = () => {
    const name = this.getAttribute("name");
    if (name) {
      window.dispatchEvent(
        new CustomEvent<DialogToggleDetail>("sx-dialog-toggle", {
          detail: { name },
        }),
      );
    }
  };
}

