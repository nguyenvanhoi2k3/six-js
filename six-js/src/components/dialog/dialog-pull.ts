// six-js\src\components\dialog\dialog-pull.ts
import { SafeHTMLElement } from '../../core/safe-element';
import type { SxDialog } from './dialog';

export class SxDialogPull extends SafeHTMLElement {
  private dialogEl: SxDialog | null = null;
  private pointerId: number | null = null;
  private startPos = 0;
  private startTime = 0;
  private currentOffset = 0;
  private dragging = false;

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'separator');
    if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
    this.addEventListener('pointerdown', this.handlePointerDown);
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this.handlePointerDown);
    this.removeEventListener('pointermove', this.handlePointerMove);
    this.removeEventListener('pointerup', this.handlePointerEnd);
    this.removeEventListener('pointercancel', this.handlePointerEnd);
  }

  private get threshold(): number {
    const attr = Number(this.getAttribute('threshold'));
    return attr > 0 && attr < 1 ? attr : 0.25;
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.dialogEl = this.closest('sx-dialog') as SxDialog | null;
    if (!this.dialogEl?.coreElement) return;

    this.pointerId = e.pointerId;
    this.dragging = true;
    this.startTime = performance.now();
    this.currentOffset = 0;
    this.startPos = this.dialogEl.dragAxis === 'y' ? e.clientY : e.clientX;

    this.dialogEl.beginDrag();
    this.setPointerCapture(e.pointerId);

    this.addEventListener('pointermove', this.handlePointerMove);
    this.addEventListener('pointerup', this.handlePointerEnd);
    this.addEventListener('pointercancel', this.handlePointerEnd);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.dragging || !this.dialogEl) return;

    const pos = this.dialogEl.dragAxis === 'y' ? e.clientY : e.clientX;
    const rawDelta = pos - this.startPos;
    const sign = this.dialogEl.dragSign;

    this.currentOffset = rawDelta * sign > 0 ? rawDelta : 0;
    this.dialogEl.updateDrag(this.currentOffset);
  };

  private handlePointerEnd = (_e: PointerEvent) => {
    if (!this.dragging || !this.dialogEl) return;
    this.dragging = false;

    this.removeEventListener('pointermove', this.handlePointerMove);
    this.removeEventListener('pointerup', this.handlePointerEnd);
    this.removeEventListener('pointercancel', this.handlePointerEnd);
    if (this.pointerId !== null) this.releasePointerCapture(this.pointerId);

    const elapsed = performance.now() - this.startTime;
    const velocity = elapsed > 0 ? Math.abs(this.currentOffset) / elapsed : 0;
    const rect = this.dialogEl.coreElement!.getBoundingClientRect();
    const size = this.dialogEl.dragAxis === 'y' ? rect.height : rect.width;

    const shouldClose = Math.abs(this.currentOffset) > size * this.threshold || velocity > 0.5;
    this.dialogEl.endDrag(shouldClose);
  };
}
