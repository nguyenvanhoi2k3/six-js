/* six-js\src\components\dialog\types.ts */

export type DialogEffect =
  | "fade"
  | "zoom"
  | "zoom-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "flip-x"
  | "flip-y";

export type DialogPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface DialogOptions {
  name: string | null;
  duration: number;
  closeOnOutsideClick: boolean;
  closeOnEscKey: boolean;
  scrollable: boolean;
  overlay: boolean;
  overlayStyle: string;
  effect: DialogEffect;
  position: DialogPosition;
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
