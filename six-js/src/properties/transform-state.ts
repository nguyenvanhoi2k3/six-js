export interface StoredTransformValue {
  value: number;
  unit: string;
  fn: string; 
}

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

export function buildTransformString(target: HTMLElement): string {
  const map = store.get(target);

  if (!map || map.size === 0) return "";

  let str = "";
  for (const { fn, value, unit } of map.values()) {
    str += `${fn}(${value}${unit}) `;
  }

  return str.trim();
}