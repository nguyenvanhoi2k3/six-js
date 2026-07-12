/* C:\Users\nguye\OneDrive\Máy tính\six-js-librari\six-js\src\components\dialog\dialog.ts */

import { parseTimeValue } from '../../core/time';
import type { DialogEffect, DialogOptions, DialogPosition, DialogToggleDetail } from './types';
import { SafeHTMLElement } from '../../core/safe-element';
import { Breakpoints } from '../../core/breakpoints';

const DEFAULT_OPTIONS: Omit<DialogOptions, 'name'> = {
  duration: 300,
  closeOnOutsideClick: true,
  closeOnEscKey: true,
  scrollable: false,
  overlay: true,
  overlayStyle: 'background-color: rgba(0, 0, 0, 0.5);',
  effect: 'zoom',
  position: 'center',
};

export class SxDialog extends SafeHTMLElement {
  private static readonly DRAG_MAP: Record<DialogPosition, { axis: 'x' | 'y'; sign: 1 | -1 }> = {
    center: { axis: 'y', sign: 1 },
    top: { axis: 'y', sign: -1 },
    bottom: { axis: 'y', sign: 1 },
    left: { axis: 'x', sign: -1 },
    right: { axis: 'x', sign: 1 },
    'top-left': { axis: 'y', sign: -1 },
    'top-right': { axis: 'y', sign: -1 },
    'bottom-left': { axis: 'y', sign: 1 },
    'bottom-right': { axis: 'y', sign: 1 },
  };

  private static readonly baseZIndex = 9999;
  private static readonly openStack: SxDialog[] = [];

  private isOpen = false;
  private previousActiveElement: HTMLElement | null = null;
  private focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

  private backdropEl: HTMLElement | null = null;
  private dialogCoreEl: HTMLElement | null = null;
  private closeCursorEl: HTMLElement | null = null;
  private movingCloseCursor = false;
  private originalContentHTML = '';

  private breakpointsConfig: Record<number, any> | null = null;
  private originalOptions: Omit<DialogOptions, 'name'> | null = null;
  private resizeRaf: number | null = null;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['sx-open', 'duration', 'scrollable', 'overlay', 'overlay-style', 'effect', 'position', 'breakpoints'];
  }

  get name(): DialogOptions['name'] { return this.getAttribute('name'); }
  get duration(): DialogOptions['duration'] { 
    const attr = this.getAttribute('duration');
    return parseTimeValue(attr, DEFAULT_OPTIONS.duration);
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
  get effect(): DialogOptions['effect'] {
    return (this.getAttribute('effect') as DialogEffect) || DEFAULT_OPTIONS.effect;
  }
  get position(): DialogOptions['position'] {
    return (this.getAttribute('position') as DialogPosition) || DEFAULT_OPTIONS.position;
  }

  connectedCallback() {
    // Lưu lại HTML Light DOM ban đầu do người dùng viết
    this.originalContentHTML = this.innerHTML;
    this.originalOptions = {
      duration: this.duration,
      closeOnOutsideClick: this.closeOnOutsideClick,
      closeOnEscKey: this.closeOnEscKey,
      scrollable: this.scrollable,
      overlay: this.overlay,
      overlayStyle: this.overlayStyle,
      effect: this.effect,
      position: this.position,
    };
    this.breakpointsConfig = Breakpoints.parse(this.getAttribute('breakpoints'));

    this.render();
    this.applyBreakpoints();

    window.addEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    window.addEventListener('resize', this.handleResize);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('sx-dialog-toggle', this.handleToggleEvent as EventListener);
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeRaf !== null) cancelAnimationFrame(this.resizeRaf);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.setInertOnSiblings(false); // Clean up dọn dẹp nếu component bị hủy đột ngột
    this.closeCursorEl?.remove();
    this.closeCursorEl = null;

    const stackIdx = SxDialog.openStack.indexOf(this);
    if (stackIdx !== -1) SxDialog.openStack.splice(stackIdx, 1);
  }

  private handleToggleEvent = (e: CustomEvent<DialogToggleDetail>) => {
    if (e.detail.name === this.name) {
      this.isOpen ? this.close() : this.open();
    }
  };

  private handleResize = () => {
    if (this.resizeRaf !== null) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => this.applyBreakpoints());
  };

  private applyBreakpoints() {
    if (!this.breakpointsConfig || !this.originalOptions) return;

    const merged = Breakpoints.getMatch(
      window.innerWidth,
      this.originalOptions,
      this.breakpointsConfig,
    ) as Omit<DialogOptions, 'name'>;

    this.setAttribute('effect', merged.effect);
    this.setAttribute('position', merged.position);
    this.setAttribute('duration', String(merged.duration / 1000));
    this.setAttribute('close-on-outside-click', String(merged.closeOnOutsideClick));
    this.setAttribute('close-on-esc-key', String(merged.closeOnEscKey));
    this.setAttribute('scrollable', String(merged.scrollable));
    this.setAttribute('overlay', String(merged.overlay));
    this.setAttribute('overlay-style', merged.overlayStyle);

    this.style.setProperty('--sx-duration', `${this.duration}ms`);
    this.syncOverlay();
  }

  private syncOverlay() {
    if (this.overlay) {
      if (!this.backdropEl) {
        this.backdropEl = document.createElement('div');
        this.backdropEl.className = 'sx-dialog-backdrop';
        this.attachBackdropListeners(this.backdropEl);
        this.insertBefore(this.backdropEl, this.firstChild);
      }
      this.backdropEl.setAttribute('style', this.overlayStyle);
    } else if (this.backdropEl) {
      this.detachBackdropListeners(this.backdropEl);
      this.backdropEl.remove();
      this.backdropEl = null;
    }
  }

  public registerCloseCursor(el: HTMLElement) {
    if (this.closeCursorEl && this.closeCursorEl !== el) {
      const old = this.closeCursorEl;
      this.closeCursorEl = null;
      old.remove();
    }

    this.movingCloseCursor = true;
    document.body.appendChild(el);
    this.movingCloseCursor = false;
    this.closeCursorEl = el;
  }

  public unregisterCloseCursor(el: HTMLElement) {
    if (this.movingCloseCursor) return;
    if (this.closeCursorEl === el) {
      this.closeCursorEl = null;
    }
  }

  private dispatchLifecycleEvent(
    eventName: 'sx-dialog-before-open' | 'sx-dialog-after-open' | 'sx-dialog-before-close' | 'sx-dialog-after-close',
    cancelable = false,
  ): boolean {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable,
      detail: { name: this.name },
    });
    this.dispatchEvent(event);
    return !event.defaultPrevented;
  }

  public open(): boolean {
    if (this.isOpen) return false;
    if (!this.dispatchLifecycleEvent('sx-dialog-before-open', true)) return false;

    this.isOpen = true;
    this.clearDragStyles();
    if (this.dialogCoreEl) this.dialogCoreEl.scrollTop = 0;

    SxDialog.openStack.push(this);
    this.style.zIndex = String(SxDialog.baseZIndex + SxDialog.openStack.length);

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

    return true;
  }

  public close(): boolean {
    if (!this.isOpen) return false;
    if (!this.dispatchLifecycleEvent('sx-dialog-before-close', true)) return false;

    this.isOpen = false;
    this.handleBackdropPointerLeave();

    const stackIdx = SxDialog.openStack.indexOf(this);
    if (stackIdx !== -1) SxDialog.openStack.splice(stackIdx, 1);
    this.style.zIndex = '';

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

    return true;
  }

  public get coreElement(): HTMLElement | null {
    return this.dialogCoreEl;
  }

  public get dragAxis(): 'x' | 'y' {
    return SxDialog.DRAG_MAP[this.position].axis;
  }

  public get dragSign(): 1 | -1 {
    return SxDialog.DRAG_MAP[this.position].sign;
  }

  public beginDrag() {
    if (!this.dialogCoreEl) return;
    this.dialogCoreEl.style.transition = 'none';
  }

  public updateDrag(offsetPx: number) {
    if (!this.dialogCoreEl) return;
    const fn = this.dragAxis === 'y' ? 'translateY' : 'translateX';
    this.dialogCoreEl.style.transform = `${fn}(${offsetPx}px)`;
  }

  public endDrag(shouldClose: boolean) {
    if (!this.dialogCoreEl) return;

    const ease = `${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    if (shouldClose) {
      const fn = this.dragAxis === 'y' ? 'translateY' : 'translateX';
      const exitDistance = (this.dragAxis === 'y' ? window.innerHeight : window.innerWidth) * this.dragSign;

      this.dialogCoreEl.style.transition = `transform ${ease}, opacity ${ease}`;
      this.dialogCoreEl.style.transform = `${fn}(${exitDistance}px)`;
      this.dialogCoreEl.style.opacity = '0';

      if (!this.close()) {
        this.dialogCoreEl.style.transform = '';
        this.dialogCoreEl.style.opacity = '';
      }
    } else {
      this.dialogCoreEl.style.transition = `transform ${ease}`;
      this.dialogCoreEl.style.transform = '';
    }
  }

  private clearDragStyles() {
    if (!this.dialogCoreEl) return;
    this.dialogCoreEl.style.transition = '';
    this.dialogCoreEl.style.transform = '';
    this.dialogCoreEl.style.opacity = '';
  }

  // ✅ Inert background helper
  private setInertOnSiblings(isInert: boolean) {
    let parent = this.parentElement;
    while (parent) {
      Array.from(parent.children).forEach(sibling => {
        if (sibling !== this && sibling !== this.closeCursorEl && !sibling.contains(this)) {
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
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (this.closeOnEscKey) {
        e.preventDefault();
        this.close();
      }
      return;
    }
    if (e.key === 'Tab') {
      e.stopPropagation();
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

  private handleBackdropPointerMove = (e: PointerEvent) => {
    if (!this.closeCursorEl || !this.closeOnOutsideClick) return;
    this.closeCursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    if (!this.closeCursorEl.classList.contains('is-visible')) {
      this.closeCursorEl.classList.add('is-visible');
      if (this.backdropEl) this.backdropEl.style.cursor = 'none';
    }
  };

  private handleBackdropPointerLeave = () => {
    this.closeCursorEl?.classList.remove('is-visible');
    if (this.backdropEl) this.backdropEl.style.cursor = '';
  };

  private attachBackdropListeners(el: HTMLElement) {
    el.addEventListener('click', this.handleBackdropClick);
    el.addEventListener('pointermove', this.handleBackdropPointerMove as EventListener);
    el.addEventListener('pointerleave', this.handleBackdropPointerLeave);
  }

  private detachBackdropListeners(el: HTMLElement) {
    el.removeEventListener('click', this.handleBackdropClick);
    el.removeEventListener('pointermove', this.handleBackdropPointerMove as EventListener);
    el.removeEventListener('pointerleave', this.handleBackdropPointerLeave);
  }

  private render() {
    this.style.setProperty('--sx-duration', `${this.duration}ms`);
    this.setAttribute('effect', this.effect);
    this.setAttribute('position', this.position);

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
      this.attachBackdropListeners(this.backdropEl);
    }
  }
}
