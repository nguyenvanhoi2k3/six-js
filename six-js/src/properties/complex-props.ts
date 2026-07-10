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

/**
 * borderRadius PHẢI dùng complex handler, KHÔNG dùng numeric handler thông thường.
 *
 * Lý do: border-radius theo "%" là property 2 TRỤC ĐỘC LẬP — bán kính ngang tính
 * theo % của width, bán kính dọc tính theo % của height. Một numeric handler chỉ lưu
 * ĐƯỢC 1 con số nên buộc phải quy đổi "%" ra 1 giá trị px "đại diện" (đo qua
 * getComputedStyle) rồi animate uniform — dẫn tới 2 lỗi thấy rõ trên box không vuông:
 * 1. Bán kính chạm giới hạn nửa cạnh ngắn hơn giữa chừng animation -> hình ảnh trông
 *    như "đứng khựng" dù giá trị JS vẫn tăng.
 * 2. Lúc progress=1 phải "snap" qua chuỗi % gốc (hình elip đúng) khác hẳn hình tròn
 *    đều đang animate -> giật/nhảy đột ngột ở khung hình cuối.
 *
 * Dùng complex handler: chỉ thay THẲNG con số trong chuỗi text (vd "0%" -> "50%"),
 * GIỮ NGUYÊN đơn vị "%" xuyên suốt animation, để chính trình duyệt tự tính đúng cả 2
 * trục ở MỌI frame — không còn khựng, không còn nhảy cuối, và tự động đúng cho mọi
 * tỉ lệ box (vuông hay chữ nhật).
 */
registerProperty("borderRadius", complexHandler("borderRadius"));