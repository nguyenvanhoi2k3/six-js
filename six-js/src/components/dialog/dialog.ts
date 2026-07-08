/* C:\Users\nguye\OneDrive\Máy tính\six-js-librari\six-js\src\components\dialog\dialog.ts */

import type { DialogOptions, DialogToggleDetail } from './types';

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
  
  private backdropEl: HTMLElement | null = null;
  private dialogCoreEl: HTMLElement | null = null;
  private originalContentHTML = '';

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['sx-open', 'duration', 'scrollable', 'overlay', 'overlay-style'];
  }

  get name(): DialogOptions['name'] { return this.getAttribute('name'); }
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
    const attr = this.getAttribute('scrollable');
    return attr !== null ? attr !== 'false' : DEFAULT_OPTIONS.scrollable; 
  }
  get overlay(): DialogOptions['overlay'] { 
    const attr = this.getAttribute('overlay');
    return attr !== null ? attr !== 'false' : DEFAULT_OPTIONS.overlay; 
  }
  get overlayStyle(): DialogOptions['overlayStyle'] { 
    return this.getAttribute('overlay-style') || DEFAULT_OPTIONS.overlayStyle; 
  }

  connectedCallback() {
    // Lưu lại HTML Light DOM ban đầu do người dùng viết
    this.originalContentHTML = this.innerHTML;
    this.render();
    
    window.addEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.setInertOnSiblings(false); // Clean up dọn dẹp nếu component bị hủy đột ngột
  }

  private handleToggleEvent = (e: CustomEvent<DialogToggleDetail>) => {
    if (e.detail.name === this.name) {
      this.isOpen ? this.close() : this.open();
    }
  };

  private dispatchLifecycleEvent(eventName: 'sx-dialog-before-open' | 'sx-dialog-after-open' | 'sx-dialog-before-close' | 'sx-dialog-after-close') {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: { name: this.name }
    }));
  }

  public open() {
    if (this.isOpen) return;
    
    this.dispatchLifecycleEvent('sx-dialog-before-open');
    this.isOpen = true;
    
    // ✅ Screen reader support & Visibility toggle
    this.setAttribute('sx-open', '');
    this.dialogCoreEl?.setAttribute('aria-hidden', 'false');
    
    // ✅ Restore focus sau khi đóng (Lưu lại element kích hoạt)
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    this.lockScroll();
    // ✅ Inert background (Chặn Screen Reader đọc các phần tử ngoài Dialog)
    this.setInertOnSiblings(true); 
    
    requestAnimationFrame(() => {
      // ✅ Initial focus & Auto focus
      this.focusFirstElement();
      this.dispatchLifecycleEvent('sx-dialog-after-open');
    });
  }

  public close() {
    if (!this.isOpen) return;
    
    this.dispatchLifecycleEvent('sx-dialog-before-close');
    this.isOpen = false;
    
    this.removeAttribute('sx-open');
    this.dialogCoreEl?.setAttribute('aria-hidden', 'true');
    
    this.unlockScroll();
    // ✅ Gỡ bỏ inert để trang hoạt động bình thường trở lại
    this.setInertOnSiblings(false);
    
    // ✅ Restore focus trả lại nơi sinh ra
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    setTimeout(() => {
      this.dispatchLifecycleEvent('sx-dialog-after-close');
    }, this.duration);
  }

  // ✅ Inert background helper
  private setInertOnSiblings(isInert: boolean) {
    let parent = this.parentElement;
    while (parent) {
      Array.from(parent.children).forEach(sibling => {
        if (sibling !== this && !sibling.contains(this)) {
          if (isInert) {
            sibling.setAttribute('inert', '');
            sibling.setAttribute('aria-hidden', 'true');
          } else {
            sibling.removeAttribute('inert');
            sibling.removeAttribute('aria-hidden');
          }
        }
      });
      if (parent.tagName === 'BODY') break;
      parent = parent.parentElement;
    }
  }

  private lockScroll() {
    if (this.scrollable) return; 
    if (document.body.style.overflow === 'hidden') return; 

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty('--sx-scrollbar-width', `${scrollbarWidth}px`);
    document.body.style.paddingRight = 'var(--sx-scrollbar-width)';
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    if (this.scrollable) return; 
    
    setTimeout(() => {
      const openDialogs = Array.from(document.querySelectorAll('sx-dialog[sx-open]'));
      const hasLockedDialog = openDialogs.some(d => !(d as any).scrollable);
      
      if (!hasLockedDialog) {
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
      // ✅ Tab cycle & Shift+Tab cycle
      this.trapFocus(e);
    }
  };

  private getFocusableElements(): HTMLElement[] {
    if (!this.dialogCoreEl) return [];
    return Array.from(this.dialogCoreEl.querySelectorAll<HTMLElement>(this.focusableElementsString))
      .filter(el => el.tabIndex !== -1 && (el as any).disabled !== true);
  }

  private focusFirstElement() {
    // Ưu tiên 1: Tìm phần tử có thuộc tính [autofocus] do người dùng tự đặt bên trong
    const autoFocusEl = this.querySelector('[autofocus]') as HTMLElement;
    if (autoFocusEl) {
      autoFocusEl.focus();
      return;
    }

    // Ưu tiên 2: Lấy phần tử focusable đầu tiên tìm thấy
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length) {
      focusableElements[0].focus();
    } else if (this.dialogCoreEl) {
      // Ưu tiên 3: Nếu không có gì focus được, focus vào chính hộp hội thoại
      this.dialogCoreEl.focus();
    }
  }

  // ✅ Focus Trap logic (Chặn vòng lặp Tab / Shift+Tab)
  private trapFocus(e: KeyboardEvent) {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + Tab (Đi lùi)
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else { // Tab (Đi tiến)
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  private handleBackdropClick = (e: Event) => {
    if (this.closeOnOutsideClick) {
      this.close();
    }
  };

  private render() {
    this.style.setProperty('--sx-duration', `${this.duration}ms`);
    
    // Đọc ID tiêu đề và nội dung để tự động cấu hình ARIA liên kết ngầm
    const titleEl = this.querySelector('[id*="title"], [class*="title"]');
    const descEl = this.querySelector('[id*="desc"], [class*="desc"]');
    
    const labelAttr = titleEl ? `aria-labelledby="${titleEl.id || 'sx-dialog-title'}"` : '';
    const descAttr = descEl ? `aria-describedby="${descEl.id || 'sx-dialog-desc'}"` : '';
    
    // Gán ID dự phòng nếu người dùng đặt class/tag mà quên điền ID để ARIA map trúng
    if (titleEl && !titleEl.id) titleEl.id = 'sx-dialog-title';
    if (descEl && !descEl.id) descEl.id = 'sx-dialog-desc';

    this.innerHTML = `
      ${this.overlay ? `<div class="sx-dialog-backdrop" style="${this.overlayStyle}"></div>` : ''}
      <div class="sx-dialog-core" 
           role="dialog" 
           aria-modal="true" 
           aria-hidden="true"
           tabindex="-1"
           ${labelAttr}
           ${descAttr}>
        ${this.originalContentHTML}
      </div>
    `;

    this.backdropEl = this.querySelector('.sx-dialog-backdrop');
    this.dialogCoreEl = this.querySelector('.sx-dialog-core');

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', this.handleBackdropClick);
    }
  }
}
