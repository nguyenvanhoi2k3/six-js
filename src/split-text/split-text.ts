import { getActiveScope } from "../core/context";
import { resolveSpecialCharsRegex } from "./char-split";
import { resolveWordDelimiter, splitWordsAndChars, WordDelimiter } from "./split-chars-words";
import { splitIntoLines } from "./split-lines";
import { applyMask } from "./mask";
import { watchForResplit, AutoResplitHandle } from "./auto-resplit";
import { createWrapper, WrapperConfig } from "./wrapper";

export type SplitTextTarget = string | Element | Element[] | ArrayLike<Element> | null | undefined;
export type SplitTextType = "chars" | "words" | "lines" | SplitTextKind[] | string;
type SplitTextKind = "chars" | "words" | "lines";
export type SplitTextAria = "auto" | "hidden" | "none";
export type SplitTextMask = boolean | SplitTextKind;

export interface SplitTextVars {
  type?: SplitTextType;
  wordsClass?: string;
  charsClass?: string;
  linesClass?: string;
  tag?: string;
  aria?: SplitTextAria;
  overflow?: SplitTextMask;
  skip?: SplitTextTarget;
  wordDelimiter?: WordDelimiter;
  reduceWhiteSpace?: boolean;
  specialChars?: string[] | RegExp;
  smartWrap?: boolean;
  propIndex?: boolean;
  prepareText?: (text: string, element: Element) => string;
  onSplit?: (self: SplitText) => void;
  onRevert?: (self: SplitText) => void;
}

interface OriginalRecord {
  element: HTMLElement;
  html: string;
  ariaLabel: string | null;
  ariaHidden: string | null;
}

const ownerRegistry = new WeakMap<Element, SplitText>();

function toElements(target: SplitTextTarget): HTMLElement[] {
  if (!target) return [];
  if (typeof target === "string") return Array.from(document.querySelectorAll<HTMLElement>(target));
  if (target instanceof Element) return [target as HTMLElement];
  return Array.from(target as ArrayLike<Element>).filter((el): el is HTMLElement => el instanceof HTMLElement);
}

function typeTokens(type: SplitTextType): string {
  return Array.isArray(type) ? type.join(",") : type;
}

function parseSplitType(type: SplitTextType): { chars: boolean; words: boolean; lines: boolean } {
  const tokens = typeTokens(type);
  return {
    chars: tokens.includes("chars"),
    words: tokens.includes("words"),
    lines: tokens.includes("lines"),
  };
}

function pickMaskCollection(self: SplitText, overflow: SplitTextMask, splitLines: boolean, splitWords: boolean): HTMLElement[] {
  const kind = overflow === true ? (splitLines ? "lines" : splitWords ? "words" : "chars") : overflow;
  if (kind === "lines") return self.lines;
  if (kind === "words") return self.words;
  return self.chars;
}

function unwrapWords(words: HTMLElement[], smartWrap: boolean, splitChars: boolean): void {
  for (const word of words) {
    const next = word.nextSibling;
    if (splitChars || !next || next.nodeType !== Node.TEXT_NODE) {
      if (smartWrap) {
        const span = document.createElement("span");
        span.style.whiteSpace = "nowrap";
        while (word.firstChild) span.appendChild(word.firstChild);
        word.replaceWith(span);
      } else {
        word.replaceWith(...word.childNodes);
      }
    } else {
      next.textContent = (word.textContent || "") + (next.textContent || "");
      word.remove();
    }
  }
}

function restoreOriginal(record: OriginalRecord): void {
  record.element.innerHTML = record.html;
  if (record.ariaLabel !== null) record.element.setAttribute("aria-label", record.ariaLabel);
  else record.element.removeAttribute("aria-label");
  if (record.ariaHidden !== null) record.element.setAttribute("aria-hidden", record.ariaHidden);
  else record.element.removeAttribute("aria-hidden");
}

export class SplitText {
  elements: HTMLElement[];
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  masks: HTMLElement[] = [];
  isSplit = false;
  vars: SplitTextVars;

  private originals: OriginalRecord[] = [];
  private resplitHandle: AutoResplitHandle | null = null;
  private dead = false;

  constructor(target: SplitTextTarget, vars: SplitTextVars = {}) {
    this.elements = toElements(target);
    this.vars = vars;

    this.elements.forEach((el) => {
      ownerRegistry.get(el)?.kill();
      ownerRegistry.set(el, this);
    });

    getActiveScope()?._capture(this);
    this.split(vars);
  }

  split(vars: SplitTextVars = this.vars): this {
    if (this.dead) throw new Error("[six] cannot split() a killed splitText()");
    if (this.isSplit) this.revert();
    this.vars = vars;

    const { type = "chars,words,lines", aria = "auto", overflow, skip, wordDelimiter, reduceWhiteSpace = true, specialChars, onSplit } = vars;

    const { chars: splitChars, words: splitWords, lines: splitLines } = parseSplitType(type);
    if (!splitChars && !splitWords && !splitLines) return this;

    const onlyChars = splitChars && !splitWords && !splitLines;
    const specialCharsRegex = resolveSpecialCharsRegex(specialChars);
    const skipEls = toElements(skip);
    const resolvedDelimiter = resolveWordDelimiter(wordDelimiter);
    const wrapperConfig: WrapperConfig = {
      tag: vars.tag,
      aria,
      propIndex: vars.propIndex,
      wordsClass: vars.wordsClass,
      charsClass: vars.charsClass,
      linesClass: vars.linesClass,
    };

    this.elements.forEach((element) => {
      this.originals.push({
        element,
        html: element.innerHTML,
        ariaLabel: element.getAttribute("aria-label"),
        ariaHidden: element.getAttribute("aria-hidden"),
      });

      if (aria === "auto") element.setAttribute("aria-label", (element.textContent || "").trim());
      else if (aria === "hidden") element.setAttribute("aria-hidden", "true");

      const chars: HTMLElement[] = [];
      const words: HTMLElement[] = [];
      const lines: HTMLElement[] = [];
      const charWrapper = splitChars ? createWrapper("char", wrapperConfig, chars) : null;
      const wordWrapper = createWrapper("word", wrapperConfig, words);

      splitWordsAndChars(
        element,
        {
          delimiter: resolvedDelimiter,
          reduceWhiteSpace,
          prepareText: vars.prepareText,
          skip: skipEls,
          onlyChars,
          deepSlice: splitLines || onlyChars,
          specialCharsRegex,
        },
        wordWrapper,
        charWrapper
      );

      if (splitLines) splitIntoLines(element, wrapperConfig, lines);

      if (!splitWords) {
        unwrapWords(words, !!vars.smartWrap && !splitLines, splitChars);
        words.length = 0;
        element.normalize();
      }

      this.lines.push(...lines);
      this.words.push(...words);
      this.chars.push(...chars);
    });

    if (overflow) {
      this.masks.push(...applyMask(pickMaskCollection(this, overflow, splitLines, splitWords)));
    }

    this.isSplit = true;

    if (splitLines) {
      this.resplitHandle = watchForResplit(this.elements, () => {
        if (this.isSplit) this.split(this.vars);
      });
    }

    onSplit?.(this);
    return this;
  }

  revert(): this {
    if (!this.isSplit) return this;

    this.resplitHandle?.disconnect();
    this.resplitHandle = null;

    this.originals.forEach(restoreOriginal);
    this.elements.forEach((el) => {
      if (ownerRegistry.get(el) === this) ownerRegistry.delete(el);
    });

    this.chars.length = 0;
    this.words.length = 0;
    this.lines.length = 0;
    this.masks.length = 0;
    this.originals.length = 0;
    this.isSplit = false;

    this.vars.onRevert?.(this);
    return this;
  }

  kill(): void {
    if (this.dead) return;
    this.dead = true;
    this.revert();
  }
}

export function splitText(target: SplitTextTarget, vars?: SplitTextVars): SplitText {
  return new SplitText(target, vars);
}
