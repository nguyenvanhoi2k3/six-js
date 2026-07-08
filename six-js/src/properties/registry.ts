// src/properties/registry.ts
import { RGBA } from "./color-utils";

export interface ParsedValue {
  num: number;
  unit: string;
}

export interface NumericPropertyHandler {
  type: "numeric";
  isTransform: boolean;
  transformFn?: string;
  defaultUnit: string;
  getCurrent(target: HTMLElement, key: string): ParsedValue;
  apply(target: HTMLElement, value: ParsedValue): void;
}

export interface ColorPropertyHandler {
  type: "color";
  cssKey: string;
  getCurrent(target: HTMLElement): RGBA;
  apply(target: HTMLElement, value: RGBA): void;
}

export interface DiscretePropertyHandler {
  type: "discrete";
  cssKey: string;
  apply(target: HTMLElement, value: string): void;
}

/** Giá trị nhiều con số gộp trong 1 chuỗi: boxShadow, filter, clipPath... */
export interface ComplexPropertyHandler {
  type: "complex";
  cssKey: string;
  getCurrent(target: HTMLElement): string;
  apply(target: HTMLElement, value: string): void;
}

export type PropertyHandler =
  | NumericPropertyHandler
  | ColorPropertyHandler
  | DiscretePropertyHandler
  | ComplexPropertyHandler;

const registry = new Map<string, PropertyHandler>();

export function registerProperty(key: string, handler: PropertyHandler): void {
  registry.set(key, handler);
}

/**
 * rawValue được truyền vào để fallback (property chưa đăng ký tường minh)
 * tự quyết định nên xử lý như numeric hay discrete, tránh set NaN vào style.
 */
export function getPropertyHandler(key: string, rawValue?: string | number): PropertyHandler {
  const existing = registry.get(key);
  if (existing) return existing;

  if (key.startsWith("--")) {
    return cssVariableHandler(key, rawValue);
  }

  return fallbackHandler(key, rawValue);
}

/**
 * CSS custom property (vd "--size"). KHÔNG dùng bracket notation (style["--size"])
 * để đọc/ghi — không ổn định trên các bản Safari cũ. Luôn dùng đúng API chuẩn
 * getPropertyValue()/setProperty(), hoạt động nhất quán trên mọi trình duyệt.
 */
function cssVariableHandler(key: string, rawValue?: string | number): PropertyHandler {
  if (typeof rawValue === "string" && !isNumericLike(rawValue)) {
    return {
      type: "discrete",
      cssKey: key,
      apply(target, value) {
        target.style.setProperty(key, value);
      },
    };
  }

  return {
    type: "numeric",
    isTransform: false,
    defaultUnit: "",
    getCurrent(target): ParsedValue {
      const raw = window.getComputedStyle(target).getPropertyValue(key).trim();

      if (!raw) {
        console.warn(
          `[six-js] CSS variable "${key}" chưa có giá trị nào trên phần tử này ` +
            `(getPropertyValue trả về rỗng) — mặc định dùng 0. Kiểm tra lại đã khai báo ` +
            `"${key}" trong inline style hoặc CSS chưa.`,
        );
      }

      return parseNumericValue(raw);
    },
    apply(target, value) {
      target.style.setProperty(key, `${value.num}${value.unit}`);
    },
  };
}

export function hasPropertyHandler(key: string): boolean {
  return registry.has(key);
}

function isNumericLike(value: string): boolean {
  return /^-?[\d.]+[a-z%]*$/i.test(value.trim());
}

function fallbackHandler(key: string, rawValue?: string | number): PropertyHandler {
  if (typeof rawValue === "string" && !isNumericLike(rawValue)) {
    return {
      type: "discrete",
      cssKey: key,
      apply(target, value) {
        (target.style as any)[key] = value;
      },
    };
  }

  return {
    type: "numeric",
    isTransform: false,
    defaultUnit: "",
    getCurrent(target) {
      const raw = (window.getComputedStyle(target) as any)[key];

      if (raw === undefined) {
        console.warn(
          `[six-js] Thuộc tính "${key}" không phải là CSS property hợp lệ ` +
            `(getComputedStyle trả về undefined). Kiểm tra lại tên — ví dụ đúng chuẩn CSS ` +
            `là "rotate" chứ không phải "rotation" (đó là tên riêng của GSAP), ` +
            `nếu six-js chưa hỗ trợ alias này hãy đăng ký thêm trong properties/.`,
        );
        return { num: 0, unit: "" };
      }

      return parseNumericValue(raw);
    },
    apply(target, value) {
      (target.style as any)[key] = `${value.num}${value.unit}`;
    },
  };
}

export function parseNumericValue(
  value: string | number | undefined | null,
  fallbackUnit = "",
): ParsedValue {
  if (typeof value === "number") {
    return { num: value, unit: fallbackUnit };
  }

  if (typeof value !== "string" || value.length === 0) {
    // Guard: tránh crash "Cannot read properties of undefined (reading 'match')"
    // khi computed style trả về undefined/null vì property không hợp lệ.
    return { num: 0, unit: fallbackUnit };
  }

  const match = value.match(/^(-?[\d.]+)([a-z%]*)$/i);

  if (!match) {
    return { num: parseFloat(value) || 0, unit: fallbackUnit };
  }

  return { num: parseFloat(match[1]) || 0, unit: match[2] || fallbackUnit };
}

const RELATIVE_REGEX = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;

/**
 * Xử lý cú pháp tương đối kiểu GSAP: "+=100", "-=50", "*=2", "/=2".
 * Cần currentNum/currentUnit (giá trị hiện tại của property) để tính ra end thật.
 * Nếu rawValue không phải dạng tương đối, fallback về parseNumericValue bình thường.
 */
export function resolveNumericValue(
  rawValue: string | number,
  currentNum: number,
  currentUnit: string,
  fallbackUnit: string,
): ParsedValue {
  if (typeof rawValue !== "string") {
    return parseNumericValue(rawValue, fallbackUnit);
  }

  const relMatch = rawValue.match(RELATIVE_REGEX);

  if (!relMatch) {
    return parseNumericValue(rawValue, fallbackUnit);
  }

  const [, op, deltaStr, unit] = relMatch;
  const delta = parseFloat(deltaStr);
  const resolvedUnit = unit || currentUnit || fallbackUnit;

  if (isNaN(delta)) {
    console.warn(
      `[six-js] Giá trị tương đối không hợp lệ: "${rawValue}" — con số sau toán tử không parse được. ` +
        `Giữ nguyên giá trị hiện tại (${currentNum}${resolvedUnit}).`,
    );
    return { num: currentNum, unit: resolvedUnit };
  }

  if (op === "/" && delta === 0) {
    console.warn(
      `[six-js] "${rawValue}" — không thể chia cho 0. Giữ nguyên giá trị hiện tại (${currentNum}${resolvedUnit}).`,
    );
    return { num: currentNum, unit: resolvedUnit };
  }

  let num: number;
  switch (op) {
    case "+":
      num = currentNum + delta;
      break;
    case "-":
      num = currentNum - delta;
      break;
    case "*":
      num = currentNum * delta;
      break;
    case "/":
      num = currentNum / delta;
      break;
    default:
      num = currentNum;
  }

  return { num, unit: resolvedUnit };
}