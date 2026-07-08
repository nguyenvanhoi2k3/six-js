// src/properties/dynamic-value.ts

const RANDOM_REGEX = /^random\((.+)\)$/i;

function isNumericToken(s: string): boolean {
  return /^-?[\d.]+$/.test(s.trim());
}

function resolveRandomString(value: string): string | number {
  const match = value.match(RANDOM_REGEX);
  if (!match) return value;

  const parts = match[1].split(",").map((s) => s.trim());

  if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) {
    console.warn(`[six-js] Invalid random() syntax: "${value}"`);
    return value;
  }

  // random(min, max) với đúng 2 số -> random trong khoảng
  if (parts.length === 2 && parts.every(isNumericToken)) {
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    return min + Math.random() * (max - min);
  }

  // random(a, b, c, ...) -> chọn ngẫu nhiên 1 phần tử (dùng được cho màu, ease, bất kỳ giá trị rời rạc nào)
  return parts[Math.floor(Math.random() * parts.length)];
}

/**
 * Resolve giá trị "động" trong vars trước khi tween xử lý:
 * - function(index, target) -> gọi và lấy kết quả
 * - "random(min,max)" / "random(a,b,c)" -> random hoá
 * Gọi 1 lần lúc setup cho từng target, không phải mỗi frame.
 */
export function resolveDynamicValue(raw: any, index: number, target: HTMLElement): any {
  let value = raw;

  if (typeof value === "function") {
    value = value(index, target);
  }

  if (typeof value === "string") {
    value = resolveRandomString(value);
  }

  return value;
}