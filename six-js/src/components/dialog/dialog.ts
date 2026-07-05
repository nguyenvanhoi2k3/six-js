/* C:\Users\nguye\OneDrive\Máy tính\six-js-librari\six-js\src\components\dialog\dialog.ts */

import type { DialogOptions, DialogToggleDetail } from './types';

// Khởi tạo giá trị mặc định chuẩn theo interface DialogOptions
const DEFAULT_OPTIONS: Omit<DialogOptions, 'name'> = {
  duration: 300,
  closeOnOutsideClick: true,
  closeOnEscKey: true,
  scrollable: false,
  overlay: true,
  overlayStyle: 'background-color: rgba(0, 0, 0, 0.5);',
};

export class SxDialog extends HTMLElement {
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

  // --- Map Attributes về chuẩn DialogOptions ---
  get name(): DialogOptions['name'] { 
    return this.getAttribute('name'); 
  }
  
  get duration(): DialogOptions['duration'] { 
    const attr = this.getAttribute('duration');
    return attr ? Number(attr) : DEFAULT_OPTIONS.duration; 
  }
  
  get closeOnOutsideClick(): DialogOptions['closeOnOutsideClick'] { 
    const attr = this.getAttribute('close-on-outside-click');
    return attr !== null ? attr !== 'false' : DEFAULT_OPTIONS.closeOnOutsideClick; 
  }
  
  get closeOnEscKey(): DialogOptions['closeOnEscKey'] { 
    const attr = this.getAttribute('close-on-esc-key');
    return attr !== null ? attr !== 'false' : DEFAULT_OPTIONS.closeOnEscKey; 
  }
  
  get scrollable(): DialogOptions['scrollable'] { 
    return this.getAttribute('scrollable') === 'true' || DEFAULT_OPTIONS.scrollable; 
  }
  
  get overlay(): DialogOptions['overlay'] { 
    const attr = this.getAttribute('overlay');
    return attr !== null ? attr !== 'false' : DEFAULT_OPTIONS.overlay; 
  }
  
  get overlayStyle(): DialogOptions['overlayStyle'] { 
    return this.getAttribute('overlay-style') || DEFAULT_OPTIONS.overlayStyle; 
  }

  connectedCallback() {
    this.render();
    window.addEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleToggleEvent = (e: CustomEvent<DialogToggleDetail>) => {
    if (e.detail.name === this.name) {
      this.isOpen ? this.close() : this.open();
    }
  };

  // --- Dispatch Custom Event phục vụ Lifecycle (Mở rộng cho Developer bên ngoài dùng) ---
  private dispatchLifecycleEvent(eventName: 'sx-dialog-before-open' | 'sx-dialog-after-open' | 'sx-dialog-before-close' | 'sx-dialog-after-close') {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true, // Cho phép lọt qua Shadow DOM boundary
      detail: { name: this.name }
    }));
  }

  public open() {
    if (this.isOpen) return;
    
    this.dispatchLifecycleEvent('sx-dialog-before-open');
    
    this.isOpen = true;
    this.setAttribute('sx-open', '');
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.lockScroll();
    
    requestAnimationFrame(() => {
      this.focusFirstElement();
      this.dispatchLifecycleEvent('sx-dialog-after-open');
    });
  }

  public close() {
    if (!this.isOpen) return;
    
    this.dispatchLifecycleEvent('sx-dialog-before-close');
    
    this.isOpen = false;
    this.removeAttribute('sx-open');
    this.unlockScroll();
    
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    setTimeout(() => {
      this.dispatchLifecycleEvent('sx-dialog-after-close');
    }, this.duration);
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
      const openDialogs = document.querySelectorAll('sx-dialog[sx-open]');
      if (openDialogs.length === 0) {
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
        max-width: var(--sx-dialog-max-width, 90vw);
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
         background: var(--sx-dialog-bg-color, #ffffff);
         border-radius: var(--sx-dialog-border-radius, 8px);
         box-shadow: var(--sx-dialog-shadow);
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

if (!customElements.get('sx-dialog')) {
  customElements.define('sx-dialog', SxDialog);
}