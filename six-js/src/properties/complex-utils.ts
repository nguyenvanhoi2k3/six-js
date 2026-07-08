// src/properties/complex-utils.ts

const NUMBER_REGEX = /-?[\d.]+/g;

function countNumbers(str: string): number {
  return (str.match(NUMBER_REGEX) || []).length;
}

/**
 * Kiểm tra xem 2 chuỗi có cùng "cấu trúc" (cùng số lượng con số) để nội suy an toàn
 * không. Gọi 1 lần lúc setup (không phải mỗi frame) để cảnh báo sớm cho dev,
 * tránh log spam.
 */
export function validateComplexPair(startStr: string, endStr: string, key: string): boolean {
  const startCount = countNumbers(startStr);
  const endCount = countNumbers(endStr);
  const ok = startCount === endCount && endCount > 0;

  if (!ok) {
    console.warn(`[six-js] "${key}": shape mismatch (${startCount} vs ${endCount} numbers), will snap instead of interpolate`);
  }

  return ok;
}

/**
 * Nội suy 2 chuỗi CSS phức hợp (boxShadow, filter...) bằng cách thay từng con số
 * trong chuỗi đích (endStr) bằng giá trị nội suy tương ứng theo vị trí.
 * Nếu số lượng con số không khớp, fallback: giữ nguyên endStr's number (không animate).
 */
export function interpolateComplexString(startStr: string, endStr: string, t: number): string {
  const startNums = (startStr.match(NUMBER_REGEX) || []).map(Number);
  let i = 0;

  return endStr.replace(NUMBER_REGEX, (match) => {
    const end = parseFloat(match);
    const start = startNums[i] ?? end; // không khớp cấu trúc -> giữ nguyên giá trị cuối
    i++;

    const value = start + (end - start) * t;
    return String(Math.round(value * 1000) / 1000);
  });
}