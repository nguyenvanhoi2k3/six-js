// six-js\src\components\modal\modal-trigger.ts

export interface ModalToggleDetail {
  name: string;
}

export class SxModalTrigger extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');

    this.addEventListener('click', this.toggleModal);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.toggleModal);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleModal();
    }
  };

  private toggleModal = () => {
    const name = this.getAttribute('name');
    if (name) {
      window.dispatchEvent(
        new CustomEvent<ModalToggleDetail>('sx-modal-toggle', {
          detail: { name },
        })
      );
    }
  };
}

if (!customElements.get('sx-modal-trigger')) {
  customElements.define('sx-modal-trigger', SxModalTrigger);
}