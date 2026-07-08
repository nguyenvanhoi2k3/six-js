// src/properties/discrete-props.ts
import { registerProperty, DiscretePropertyHandler } from "./registry";

function discreteHandler(cssKey: string): DiscretePropertyHandler {
  return {
    type: "discrete",
    cssKey,
    apply(target, value) {
      (target.style as any)[cssKey] = value;
    },
  };
}

// Các property không thể nội suy tuyến tính — set ngay lập tức, không animate qua từng frame.
const DISCRETE_KEYS = [
  "display",
  "position",
  "visibility",
  "justifyContent",
  "alignItems",
  "alignContent",
  "alignSelf",
  "flexDirection",
  "flexWrap",
  "textAlign",
  "overflow",
  "overflowX",
  "overflowY",
  "pointerEvents",
  "cursor",
  "whiteSpace",
  "textTransform",
  "textDecoration",
  "listStyleType",
  "float",
  "clear",
  "objectFit",
];

DISCRETE_KEYS.forEach((key) => registerProperty(key, discreteHandler(key)));