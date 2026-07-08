// src/properties/css-numeric.ts
import { registerProperty, parseNumericValue, ParsedValue, NumericPropertyHandler } from "./registry";

function cssNumericHandler(cssKey: string, defaultUnit: string): NumericPropertyHandler {
  return {
    type: "numeric",
    isTransform: false,
    defaultUnit,
    getCurrent(target): ParsedValue {
      const raw = (window.getComputedStyle(target) as any)[cssKey];
      return parseNumericValue(raw, defaultUnit);
    },
    apply(target, value) {
      (target.style as any)[cssKey] = `${value.num}${value.unit}`;
    },
  };
}

// Layout
registerProperty("width", cssNumericHandler("width", "px"));
registerProperty("height", cssNumericHandler("height", "px"));
registerProperty("top", cssNumericHandler("top", "px"));
registerProperty("left", cssNumericHandler("left", "px"));
registerProperty("right", cssNumericHandler("right", "px"));
registerProperty("bottom", cssNumericHandler("bottom", "px"));

// Border
registerProperty("borderRadius", cssNumericHandler("borderRadius", "px"));
registerProperty("borderWidth", cssNumericHandler("borderWidth", "px"));

// Opacity
registerProperty("opacity", cssNumericHandler("opacity", ""));

// Font
registerProperty("fontSize", cssNumericHandler("fontSize", "px"));
registerProperty("letterSpacing", cssNumericHandler("letterSpacing", "px"));