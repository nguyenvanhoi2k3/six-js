// src/jsx.d.ts
/* ---------- sx-animate ---------- */
interface SxAnimateAttrs {
  type?: "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right";
  strength?: number | string;
  easing?: string;
  duration?: number | string;
  delay?: number | string;
  group?: boolean | "";
  replay?: boolean | "";
}

/* ---------- sx-marquee ---------- */
interface SxMarqueeAttrs {
  direction?: "left" | "right" | "up" | "down";
  speed?: number | string;
  "pause-on-hover"?: boolean | string;
  gap?: number | string;
  clone?: boolean | string;
}

/* ---------- sx-slider ---------- */
interface SxSliderAttrs {
  name?: string;
  "per-view"?: number | string;
  gap?: string | number;
  drag?: "true" | "false" | "free";
  speed?: number | string;
  "right-padding"?: string;
  "left-padding"?: string;
  rewind?: boolean | string;
  "edge-resistance"?: number | string;
  loop?: boolean | string;
  "grab-cursor"?: boolean | string;
  snap?: boolean | string;
  autoplay?: boolean | string;
  interval?: number | string;
  "start-index"?: number | string;
  "auto-size"?: boolean | string;
  "per-move"?: "auto" | number | string;
  "auto-height"?: boolean | string;
  centered?: boolean | string;
  "auto-centered"?: boolean | string;
  "center-if-short"?: boolean | string;
  direction?: "horizontal" | "vertical";
  "vertical-scroll"?: boolean | string;
  effect?: "slide" | "fade";
  breakpoints?: string;
  sync?: string;
  "lock-active"?: boolean | string;
}

/* ---------- sx-slider-pagination ---------- */
interface SxSliderPaginationAttrs {
  effect?: "dynamic" | "snake" | "number" | "default" | string;
  name?: string;
}

/* ---------- sx-slider-prev / sx-slider-next ---------- */
interface SxSliderNavAttrs {
  name?: string;
}
/* ---------- sx-slider-progress ---------- */
interface SxSliderProgressAttrs {
  name?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // animate
      "sx-animate": Omit<JSX.IntrinsicElements["div"], "type"> & SxAnimateAttrs;

      // marquee
      "sx-marquee": JSX.IntrinsicElements["div"] & SxMarqueeAttrs;
      "sx-marquee-inner": JSX.IntrinsicElements["div"];
      "sx-marquee-item": JSX.IntrinsicElements["div"];

      // slider
      "sx-slider": Omit<JSX.IntrinsicElements["div"], "name"> & SxSliderAttrs;
      "sx-slider-track": JSX.IntrinsicElements["div"];
      "sx-slider-slide": JSX.IntrinsicElements["div"];
      "sx-slider-prev": JSX.IntrinsicElements["button"] & SxSliderNavAttrs;
      "sx-slider-next": JSX.IntrinsicElements["button"] & SxSliderNavAttrs;
      "sx-slider-pagination": JSX.IntrinsicElements["div"] &
        SxSliderPaginationAttrs;
      "sx-slider-progress": JSX.IntrinsicElements["div"];

      // dialog
      "sx-dialog": JSX.IntrinsicElements["div"] & SxDialogAttrs;
      "sx-dialog-trigger": JSX.IntrinsicElements["div"] & SxDialogTriggerAttrs;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        // animate
        "sx-animate": Omit<JSX.IntrinsicElements["div"], "type"> &
          SxAnimateAttrs;

        // marquee
        "sx-marquee": JSX.IntrinsicElements["div"] & SxMarqueeAttrs;
        "sx-marquee-inner": JSX.IntrinsicElements["div"];
        "sx-marquee-item": JSX.IntrinsicElements["div"];

        // slider
        "sx-slider": Omit<JSX.IntrinsicElements["div"], "name"> & SxSliderAttrs;
        "sx-slider-track": JSX.IntrinsicElements["div"];
        "sx-slider-slide": JSX.IntrinsicElements["div"];
        "sx-slider-prev": JSX.IntrinsicElements["button"] & SxSliderNavAttrs;
        "sx-slider-next": JSX.IntrinsicElements["button"] & SxSliderNavAttrs;
        "sx-slider-pagination": JSX.IntrinsicElements["div"] &
          SxSliderPaginationAttrs;
        "sx-slider-progress": JSX.IntrinsicElements["div"];
      }
    }
  }
}

/* ---------- sx-dialog ---------- */
interface SxDialogAttrs {
  name: string;
  duration?: number | string;
  "close-on-outside-click"?: boolean | "true" | "false";
  "close-on-esc-key"?: boolean | "true" | "false";
  scrollable?: boolean | "true" | "false";
  overlay?: boolean | "true" | "false";
  "overlay-style"?: string;
}

interface SxDialogTriggerAttrs {
  name: string;
}

export {};
