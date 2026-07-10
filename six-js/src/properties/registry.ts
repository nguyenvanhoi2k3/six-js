import { RGBA } from "./color-utils";

export interface ParsedValue {
  num: number;
  unit: string;
}

export interface NumericPropertyHandler {
  type: "numeric";
  isTransform: boolean;
  transformFn?: string;
  transformStoreKey?: string;
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

export function getPropertyHandler(key: string, rawValue?: string | number): PropertyHandler {
  const existing = registry.get(key);
  if (existing) return existing;

  if (key.startsWith("--")) {
    return cssVariableHandler(key, rawValue);
  }

  return fallbackHandler(key, rawValue);
}

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
        console.warn(`[six-js] CSS variable "${key}" not set, defaulting to 0`);
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
        console.warn(`[six-js] Invalid CSS property: "${key}"`);
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
    return { num: 0, unit: fallbackUnit };
  }

  const match = value.match(/^(-?[\d.]+)([a-z%]*)$/i);

  if (!match) {
    return { num: parseFloat(value) || 0, unit: fallbackUnit };
  }

  return { num: parseFloat(match[1]) || 0, unit: match[2] || fallbackUnit };
}

const RELATIVE_REGEX = /^([+\-*/])=(-?[\d.]+)([a-z%]*)$/i;

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
    console.warn(`[six-js] Invalid relative value: "${rawValue}"`);
    return { num: currentNum, unit: resolvedUnit };
  }

  if (op === "/" && delta === 0) {
    console.warn(`[six-js] Division by zero: "${rawValue}"`);
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