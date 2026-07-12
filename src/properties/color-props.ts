import { registerProperty, ColorPropertyHandler } from "./registry";
import { RGBA, parseColor, parseRgbString, rgbaToString } from "./color-utils";

function colorHandler(cssKey: string): ColorPropertyHandler {
  return {
    type: "color",
    cssKey,
    getCurrent(target): RGBA {
      const raw = window.getComputedStyle(target)[cssKey as any];
      return parseRgbString(raw);
    },
    apply(target, value: RGBA) {
      (target.style as any)[cssKey] = rgbaToString(value);
    },
  };
}

registerProperty("backgroundColor", colorHandler("backgroundColor"));
registerProperty("color", colorHandler("color"));
registerProperty("borderColor", colorHandler("borderColor"));

registerProperty("background", colorHandler("backgroundColor"));

export { parseColor };