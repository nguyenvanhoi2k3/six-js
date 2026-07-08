// src/properties/complex-props.ts
import { registerProperty, ComplexPropertyHandler } from "./registry";

function complexHandler(cssKey: string): ComplexPropertyHandler {
  return {
    type: "complex",
    cssKey,
    getCurrent(target): string {
      const raw = (window.getComputedStyle(target) as any)[cssKey];
      return raw && raw !== "none" ? raw : "";
    },
    apply(target, value) {
      (target.style as any)[cssKey] = value;
    },
  };
}

registerProperty("boxShadow", complexHandler("boxShadow"));
registerProperty("filter", complexHandler("filter"));