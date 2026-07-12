import { registerProperty, ParsedValue, NumericPropertyHandler } from "./registry";
import { getTransformValue, setTransformValue, TransformCache } from "./transform-state";

function cacheHandler(cacheKey: keyof TransformCache, defaultUnit: string, pxAxis?: "x" | "y"): NumericPropertyHandler {
  return {
    type: "numeric",
    isTransform: true,
    transformFn: cacheKey,
    pxAxis,
    defaultUnit,
    getCurrent(target): ParsedValue {
      return { num: getTransformValue(target, cacheKey), unit: defaultUnit };
    },
    apply(target, value) {
      setTransformValue(target, cacheKey, value.num);
    },
  };
}

function pxOrPercent(
  pxKey: keyof TransformCache,
  percentKey: keyof TransformCache,
  axis: "x" | "y",
): (rawValue?: string | number) => NumericPropertyHandler {
  const pxHandler = cacheHandler(pxKey, "px", axis);
  const percentHandler = cacheHandler(percentKey, "%");

  return (rawValue) => (typeof rawValue === "string" && rawValue.trim().endsWith("%") ? percentHandler : pxHandler);
}

registerProperty("x", pxOrPercent("x", "xPercent", "x"));
registerProperty("y", pxOrPercent("y", "yPercent", "y"));
registerProperty("z", cacheHandler("z", "px"));

registerProperty("rotate", cacheHandler("rotate", "deg"));
registerProperty("rotateX", cacheHandler("rotateX", "deg"));
registerProperty("rotateY", cacheHandler("rotateY", "deg"));
registerProperty("rotateZ", cacheHandler("rotateZ", "deg"));

registerProperty("scale", cacheHandler("scale", ""));
registerProperty("scaleX", cacheHandler("scaleX", ""));
registerProperty("scaleY", cacheHandler("scaleY", ""));

registerProperty("skewX", cacheHandler("skewX", "deg"));
registerProperty("skewY", cacheHandler("skewY", "deg"));
