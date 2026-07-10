import { registerProperty, ParsedValue, NumericPropertyHandler } from "./registry";
import { readTransform, TransformValues } from "./transform-parser";
import { getStoredTransform } from "./transform-state";

function transformHandler(
  fn: string,
  defaultUnit: string,
  valueKey: keyof TransformValues,
  storeKey: string = fn,
): NumericPropertyHandler {
  return {
    type: "numeric",
    isTransform: true,
    transformFn: fn,
    transformStoreKey: storeKey,
    defaultUnit,
    getCurrent(target): ParsedValue {
      const stored = getStoredTransform(target, storeKey);
      if (stored) return { num: stored.value, unit: stored.unit };

      const values = readTransform(target);
      return { num: values[valueKey], unit: defaultUnit };
    },
    apply() {
    },
  };
}

registerProperty("x", transformHandler("translateX", "px", "x"));
registerProperty("y", transformHandler("translateY", "px", "y"));
registerProperty("z", transformHandler("translateZ", "px", "z"));

registerProperty("translateX", transformHandler("translateX", "px", "x", "translateX-2"));
registerProperty("translateY", transformHandler("translateY", "px", "y", "translateY-2"));

registerProperty("rotate", transformHandler("rotate", "deg", "rotate"));
registerProperty("rotateX", transformHandler("rotateX", "deg", "rotateX"));
registerProperty("rotateY", transformHandler("rotateY", "deg", "rotateY"));
registerProperty("rotateZ", transformHandler("rotateZ", "deg", "rotateZ"));

registerProperty("scale", transformHandler("scale", "", "scale"));
registerProperty("scaleX", transformHandler("scaleX", "", "scaleX"));
registerProperty("scaleY", transformHandler("scaleY", "", "scaleY"));
registerProperty("skewX", transformHandler("skewX", "deg", "skewX"));
registerProperty("skewY", transformHandler("skewY", "deg", "skewY"));