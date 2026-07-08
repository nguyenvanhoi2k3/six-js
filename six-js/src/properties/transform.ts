// src/properties/transform.ts
import { registerProperty, ParsedValue, NumericPropertyHandler } from "./registry";
import { readTransform, TransformValues } from "./transform-parser";
import { getStoredTransform } from "./transform-state";

/**
 * storeKey mặc định trùng `fn` (tên hàm CSS). Với xAxis/yAxis, cần storeKey RIÊNG
 * (khác x/y) dù cùng dùng translateX/translateY — nhờ 2 phép translateX liên tiếp
 * cộng dồn tuyến tính đúng theo toán học transform matrix, x (px) và xAxis (%) tự
 * cộng vào nhau khi build chuỗi transform, không cần calc().
 */
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
      // no-op: transform được ghép chuỗi tập trung qua transform-state, không set riêng lẻ ở đây
    },
  };
}

registerProperty("x", transformHandler("translateX", "px", "x"));
registerProperty("y", transformHandler("translateY", "px", "y"));
registerProperty("z", transformHandler("translateZ", "px", "z"));

// translateX/translateY = translate theo % kích thước của chính phần tử (number -> px,
// "N%" -> %). storeKey riêng để không đè lên ô của x/y — 2 lệnh translateX cộng dồn
// tuyến tính đúng khi build chuỗi transform (miễn không có rotate/scale chen giữa).
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