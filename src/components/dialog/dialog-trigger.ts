// six-js\src\components\modal\modal-trigger.ts
import { SafeHTMLElement } from '../../core/safe-element';

export interface DialogToggleDetail {
  name: string;
}

export class SxDialogTrigger extends SafeHTMLElement {
  private dialogEl: HTMLElement | null = null;
  private observer: MutationObserver | null = null;

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");

    this.addEventListener("click", this.toggleDialog);
    this.addEventListener("keydown", this.handleKeyDown);

    this.observeDialog();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.toggleDialog);
    this.removeEventListener("keydown", this.handleKeyDown);
    this.observer?.disconnect();
    this.observer = null;
    this.dialogEl = null;
  }

  private observeDialog() {
    const name = this.getAttribute("name");
    if (!name) return;

    this.dialogEl = Array.from(document.querySelectorAll("sx-dialog")).find(
      (d) => d.getAttribute("name") === name,
    ) as HTMLElement | undefined ?? null;
    if (!this.dialogEl) return;

    this.syncActiveState();

    this.observer = new MutationObserver(this.syncActiveState);
    this.observer.observe(this.dialogEl, { attributes: true, attributeFilter: ["sx-open"] });
  }

  private syncActiveState = () => {
    if (this.dialogEl?.hasAttribute("sx-open")) {
      this.setAttribute("sx-active", "");
    } else {
      this.removeAttribute("sx-active");
    }
  };

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

