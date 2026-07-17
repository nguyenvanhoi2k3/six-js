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

/**
 * Background scroll behavior while this dialog is open:
 * - false (default): absolute lock - CSS `overflow: hidden` (hides the native scrollbar
 *   entirely) plus wheel/touch preventDefault (belt and suspenders against a JS-driven scroller
 *   like six-js's SmoothScroll plugin, which overflow:hidden alone can't reliably stop).
 * - "scrollbar": partial lock - wheel/touch preventDefault only, no CSS change, so the native
 *   scrollbar stays visible (no flicker) - dragging its thumb is NOT blocked (no JS API can
 *   intercept that), an intentionally accepted gap for this mode.
 * - true: no lock at all, background stays fully scrollable.
 */
export type DialogScrollable = boolean | "scrollbar";

export interface DialogOptions {
  name: string | null;
  duration: number;
  closeOnOutsideClick: boolean;
  closeOnEscKey: boolean;
  scrollable: DialogScrollable;
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
