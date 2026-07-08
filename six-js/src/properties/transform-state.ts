// src/properties/transform-state.ts

export interface StoredTransformValue {
  value: number;
  unit: string;
  fn: string; // tên hàm CSS: translateX, rotate, scaleX...
}

/**
 * Lưu giá trị transform "cuối cùng đã set" cho từng property trên từng phần tử,
 * không phụ thuộc tween nào đang giữ nó. Nhờ vậy tween B (chỉ động vào y, rotate)
 * không xoá mất x mà tween A đã set trước đó khi build lại chuỗi `transform`.
 */
const store = new WeakMap<HTMLElement, Map<string, StoredTransformValue>>();

function getMap(target: HTMLElement): Map<string, StoredTransformValue> {
  let map = store.get(target);
  if (!map) {
    map = new Map();
    store.set(target, map);
  }
  return map;
}

export function getStoredTransform(
  target: HTMLElement,
  key: string,
): StoredTransformValue | undefined {
  return store.get(target)?.get(key);
}

export function setStoredTransform(
  target: HTMLElement,
  key: string,
  value: StoredTransformValue,
): void {
  getMap(target).set(key, value);
}

/** Ghép toàn bộ property đã từng được set (bởi bất kỳ tween nào) thành 1 chuỗi transform */
export function buildTransformString(target: HTMLElement): string {
  const map = store.get(target);

  if (!map || map.size === 0) return "";

  let str = "";
  for (const { fn, value, unit } of map.values()) {
    str += `${fn}(${value}${unit}) `;
  }

  return str.trim();
}