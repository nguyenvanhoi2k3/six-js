/* six-js\src\components\dialog\types.ts */

export interface DialogOptions {
  name: string | null;
  duration: number;
  closeOnOutsideClick: boolean;
  closeOnEscKey: boolean;
  scrollable: boolean;
  overlay: boolean;
  overlayStyle: string;
}

export interface DialogToggleDetail {
  name: string;
}

export interface SxDialogEventMap {
  "sx-dialog-toggle": CustomEvent<DialogToggleDetail>;
  "sx-dialog-before-open": CustomEvent<{ name: string }>;
  "sx-dialog-after-open": CustomEvent<{ name: string }>;
  "sx-dialog-before-close": CustomEvent<{ name: string }>;
  "sx-dialog-after-close": CustomEvent<{ name: string }>;
}

declare global {
  interface HTMLElementEventMap extends SxDialogEventMap {}
}
