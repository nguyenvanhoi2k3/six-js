// src/properties/transform.ts
import { registerProperty, ParsedValue, NumericPropertyHandler } from "./registry";
import { readTransform, TransformValues } from "./transform-parser";
import { getStoredTransform } from "./transform-state";

/**
 * Lưu ý quan trọng: dùng `fn` (tên hàm CSS thật, vd "rotate") làm key lưu trạng thái,
 * KHÔNG dùng property alias (`key` truyền vào từ vars, vd "rotation"). Nhờ vậy nếu
 * anh trộn `rotate` và `rotation` (2 alias cùng trỏ 1 hàm CSS) trên nhiều tween khác
 * nhau của cùng 1 phần tử, chúng vẫn ghi đè đúng lên nhau thay vì tạo 2 rotate() chồng nhau.
 */
function transformHandler(
  fn: string,
  defaultUnit: string,
  valueKey: keyof TransformValues,
): NumericPropertyHandler {
  return {
    type: "numeric",
    isTransform: true,
    transformFn: fn,
    defaultUnit,
    getCurrent(target): ParsedValue {
      const stored = getStoredTransform(target, fn);
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

registerProperty("rotate", transformHandler("rotate", "deg", "rotate"));
registerProperty("rotateX", transformHandler("rotateX", "deg", "rotateX"));
registerProperty("rotateY", transformHandler("rotateY", "deg", "rotateY"));
registerProperty("rotateZ", transformHandler("rotateZ", "deg", "rotateZ"));

registerProperty("scale", transformHandler("scale", "", "scale"));
registerProperty("scaleX", transformHandler("scaleX", "", "scaleX"));
registerProperty("scaleY", transformHandler("scaleY", "", "scaleY"));
registerProperty("skewX", transformHandler("skewX", "deg", "skewX"));
registerProperty("skewY", transformHandler("skewY", "deg", "skewY"));