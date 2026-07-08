// src/properties/color-props.ts
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

// Alias: cho phép dùng "background" như "backgroundColor" khi vars chỉ truyền màu đơn thuần.
// Lưu ý: "background" là shorthand CSS thật (còn gồm image, position, size...);
// alias này CHỈ set backgroundColor, không hỗ trợ gradient/background-image qua tween.
registerProperty("background", colorHandler("backgroundColor"));

export { parseColor };