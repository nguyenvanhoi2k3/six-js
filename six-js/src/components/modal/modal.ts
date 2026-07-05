// six-js\src\components\modal\modal.ts

import type { ModalToggleDetail } from './modal-trigger';

export class SxModal extends HTMLElement {
  private isOpen = false;
  private previousActiveElement: HTMLElement | null = null;
  private focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['sx-open', 'duration', 'scrollable', 'overlay', 'overlay-style'];
  }

  get name() { return this.getAttribute('name'); }
  get duration() { return Number(this.getAttribute('duration')) || 300; }
  get closeOnOutsideClick() { return this.getAttribute('close-on-outside-click') !== 'false'; }
  get closeOnEscKey() { return this.getAttribute('close-on-esc-key') !== 'false'; }
  get scrollable() { return this.getAttribute('scrollable') === 'true'; }
  get overlay() { return this.getAttribute('overlay') !== 'false'; }
  get overlayStyle() { return this.getAttribute('overlay-style') || 'background-color: rgba(0, 0, 0, 0.5);'; }

  connectedCallback() {
    this.render();
    window.addEventListener('sx-modal-toggle', this.handleToggleEvent as EventListener);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('sx-modal-toggle', this.handleToggleEvent as EventListener);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleToggleEvent = (e: CustomEvent<ModalToggleDetail>) => {
    if (e.detail.name === this.name) {
      this.isOpen ? this.close() : this.open();
    }
  };

  public open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.setAttribute('sx-open', '');
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.lockScroll();
    requestAnimationFrame(() => this.focusFirstElement());
  }

  public close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.removeAttribute('sx-open');
    this.unlockScroll();
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private lockScroll() {
    if (document.body.style.overflow === 'hidden') return; 
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty('--sx-scrollbar-width', `${scrollbarWidth}px`);
    document.body.style.paddingRight = 'var(--sx-scrollbar-width)';
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    setTimeout(() => {
      const openModals = document.querySelectorAll('sx-modal[sx-open]');
      if (openModals.length === 0) {
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
        document.body.style.removeProperty('--sx-scrollbar-width');
      }
    }, this.duration);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isOpen) return;
    if (e.key === 'Escape' && this.closeOnEscKey) {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  };

  private getFocusableElements(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(this.focusableElementsString));
  }

  private focusFirstElement() {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length) {
      focusableElements[0].focus();
    } else {
      (this.shadowRoot!.querySelector('.dialog') as HTMLElement).focus();
    }
  }

  private trapFocus(e: KeyboardEvent) {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  private handleBackdropClick = (e: Event) => {
    if (this.closeOnOutsideClick) {
      this.close();
    }
  };

  private render() {
    const style = `
      :host {
        --sx-duration: ${this.duration}ms;
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        pointer-events: none;
      }
      
      :host([sx-open]) {
        visibility: visible;
        pointer-events: auto;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        z-index: -1;
        opacity: 0;
        transition: opacity var(--sx-duration) ease;
      }
      
      :host([sx-open]) .backdrop {
        opacity: 1;
      }

      .dialog {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: var(--sx-modal-max-width, 90vw);
        max-height: calc(100vh - 4rem);
        background: transparent;
        opacity: 0;
        transform: scale(0.96) translateY(10px);
        transition: opacity var(--sx-duration) cubic-bezier(0.4, 0, 0.2, 1), 
                    transform var(--sx-duration) cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
        display: flex;
        flex-direction: column;
        outline: none;
      }

      :host([sx-open]) .dialog {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      .dialog-content {
         background: var(--sx-modal-bg-color, #ffffff);
         border-radius: var(--sx-modal-border-radius, 8px);
         box-shadow: var(--sx-modal-shadow);
         width: 100%;
      }

      :host([scrollable="true"]) .dialog {
        overflow-y: auto;
      }
    `;

    this.shadowRoot!.innerHTML = `
      <style>${style}</style>
      ${this.overlay ? `<div class="backdrop" style="${this.overlayStyle}" part="backdrop"></div>` : ''}
      <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
        <div class="dialog-content" part="content">
          <slot></slot>
        </div>
      </div>
    `;

    const backdrop = this.shadowRoot!.querySelector('.backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', this.handleBackdropClick);
    }
  }
}

if (!customElements.get('sx-modal')) {
  customElements.define('sx-modal', SxModal);
}