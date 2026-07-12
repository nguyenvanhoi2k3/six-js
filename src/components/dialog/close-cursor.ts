// six-js\src\components\dialog\close-cursor.ts
import { SafeHTMLElement } from '../../core/safe-element';
import type { SxDialog } from './dialog';

export class SxCloseCursor extends SafeHTMLElement {
  private dialogEl: SxDialog | null = null;

  connectedCallback() {
    if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
    this.dialogEl = this.closest('sx-dialog') as SxDialog | null;
    this.dialogEl?.registerCloseCursor(this);
  }

  disconnectedCallback() {
    this.dialogEl?.unregisterCloseCursor(this);
    this.dialogEl = null;
  }
}
