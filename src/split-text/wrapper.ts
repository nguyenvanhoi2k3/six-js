export type SplitKind = "word" | "char" | "line";

export interface WrapperConfig {
  tag?: string;
  aria?: "auto" | "hidden" | "none";
  propIndex?: boolean;
  wordsClass?: string;
  charsClass?: string;
  linesClass?: string;
}

export interface Wrapper {
  (text: string): HTMLElement;
  collection: HTMLElement[];
}

const CLASS_KEY: Record<SplitKind, keyof WrapperConfig> = {
  word: "wordsClass",
  char: "charsClass",
  line: "linesClass",
};

export function createWrapper(kind: SplitKind, config: WrapperConfig, collection: HTMLElement[]): Wrapper {
  const className = config[CLASS_KEY[kind]] as string | undefined;
  const tag = config.tag || "div";
  const aria = config.aria ?? "auto";
  const propIndex = !!config.propIndex;
  const display = kind === "line" ? "block" : "inline-block";

  const wrapper = ((text: string): HTMLElement => {
    const el = document.createElement(tag);
    const index = collection.length + 1;

    if (className) el.className = `${className} ${className}${index}`;
    if (propIndex) el.style.setProperty(`--${kind}`, String(index));
    if (aria !== "none") el.setAttribute("aria-hidden", "true");
    if (tag !== "span") {
      el.style.position = "relative";
      el.style.display = display;
    }
    el.textContent = text;
    collection.push(el);
    return el;
  }) as Wrapper;

  wrapper.collection = collection;
  return wrapper;
}

export function disallowInline(element: HTMLElement): void {
  if (window.getComputedStyle(element).display === "inline") element.style.display = "inline-block";
}
