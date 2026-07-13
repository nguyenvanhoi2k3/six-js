import type { SixTarget } from "../../six";
import { getActiveScope, Killable } from "../../core/scope-stack";
import { splitIntoWordsAndChars, groupWordsIntoLines, applyMask, unwrapWords } from "./dom-split";

export interface SplitTextVars {
  type?: string;
  tag?: string;
  charsClass?: string;
  wordsClass?: string;
  linesClass?: string;
  mask?: "chars" | "words" | "lines";
  autoSplit?: boolean;
  aria?: "auto" | "none";
  onSplit?: (self: SplitText) => void | Killable | Killable[];
}

const isBrowser = typeof document !== "undefined";

const RESIZE_DEBOUNCE_MS = 200;

function resolveTargets(target: SixTarget): HTMLElement[] {
  if (typeof target === "string") return Array.from(document.querySelectorAll<HTMLElement>(target));
  if (Array.isArray(target)) return target.filter((el): el is HTMLElement => el != null);
  return target ? [target] : [];
}

function parseType(type: string): { wantsChars: boolean; wantsWords: boolean; wantsLines: boolean } {
  const levels = type.split(",").map((s) => s.trim().toLowerCase());
  return {
    wantsChars: levels.includes("chars"),
    wantsWords: levels.includes("words"),
    wantsLines: levels.includes("lines"),
  };
}

const elementOwners = new WeakMap<HTMLElement, SplitText>();

export class SplitText implements Killable {
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];

  private targets: HTMLElement[] = [];
  private vars: SplitTextVars;
  private originalHTML = new WeakMap<HTMLElement, string>();
  private ownedAriaLabel = new WeakSet<HTMLElement>();
  private widthByRoot = new WeakMap<HTMLElement, number>();
  private lastKillables: Killable[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private reverted = false;

  constructor(target: SixTarget, vars: SplitTextVars = {}) {
    getActiveScope()?._capture(this);

    this.vars = vars;

    if (!isBrowser) return;

    this.targets = resolveTargets(target);

    if (this.targets.length === 0) {
      console.warn("[six-js] splitText: no elements matched");
    }

    this.performSplit();

    if (vars.autoSplit && parseType(vars.type ?? "chars,words,lines").wantsLines) {
      this.setupAutoSplit();
    }
  }

  split(vars?: SplitTextVars): this {
    if (!isBrowser) return this;

    if (vars) this.vars = { ...this.vars, ...vars };
    this.performSplit();

    return this;
  }

  private performSplit(): void {
    this.reverted = false;

    const type = this.vars.type ?? "chars,words,lines";
    const { wantsChars, wantsWords, wantsLines } = parseType(type);
    const tag = this.vars.tag ?? "div";
    const ariaMode = this.vars.aria ?? "auto";

    this.chars = [];
    this.words = [];
    this.lines = [];

    for (const root of this.targets) {
      const priorOwner = elementOwners.get(root);
      if (priorOwner && priorOwner !== this) priorOwner.revert();
      elementOwners.set(root, this);

      const savedHTML = this.originalHTML.get(root);
      if (savedHTML === undefined) {
        this.originalHTML.set(root, root.innerHTML);
      } else {
        root.innerHTML = savedHTML;
      }

      if (ariaMode === "auto" && !root.hasAttribute("aria-label")) {
        root.setAttribute("aria-label", root.textContent ?? "");
        this.ownedAriaLabel.add(root);
      }

      const { wordEls, charEls } = splitIntoWordsAndChars(root, {
        tag,
        wantsChars,
        needsWordWrapper: wantsWords || wantsLines,
        wordsClass: this.vars.wordsClass ?? "",
        charsClass: this.vars.charsClass ?? "",
      });

      const lineEls = wantsLines
        ? groupWordsIntoLines(root, wordEls, { tag, linesClass: this.vars.linesClass ?? "" })
        : [];

      if (wantsLines && !wantsWords) {
        unwrapWords(root, wordEls);
      }

      if (wantsLines && this.vars.autoSplit) {
        this.widthByRoot.set(root, root.offsetWidth);
      }

      const mask = this.vars.mask;
      if (mask) {
        this.applyMaskFor(mask, { charEls, wordEls, lineEls, wantsChars, wantsWords, wantsLines });
      }

      if (ariaMode === "auto") {
        for (const el of [...charEls, ...(wantsWords ? wordEls : []), ...lineEls]) {
          el.setAttribute("aria-hidden", "true");
        }
      }

      if (wantsChars) this.chars.push(...charEls);
      if (wantsWords) this.words.push(...wordEls);
      if (wantsLines) this.lines.push(...lineEls);
    }

    for (const killable of this.lastKillables) killable.kill();
    this.lastKillables = [];

    const result = this.vars.onSplit?.(this);
    if (result) {
      this.lastKillables = Array.isArray(result) ? result : [result];
    }
  }

  private applyMaskFor(
    mask: "chars" | "words" | "lines",
    levels: {
      charEls: HTMLElement[];
      wordEls: HTMLElement[];
      lineEls: HTMLElement[];
      wantsChars: boolean;
      wantsWords: boolean;
      wantsLines: boolean;
    },
  ): void {
    if (mask === "chars" && levels.wantsChars) applyMask(levels.charEls);
    else if (mask === "words" && levels.wantsWords) applyMask(levels.wordEls);
    else if (mask === "lines" && levels.wantsLines) applyMask(levels.lineEls);
    else console.warn(`[six-js] splitText: mask "${mask}" requires type to include "${mask}"`);
  }

  private onFontsLoaded = (): void => {
    if (!this.reverted) this.performSplit();
  };

  private setupAutoSplit(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);

        this.resizeTimer = setTimeout(() => {
          this.resizeTimer = null;
          this.checkWidths();
        }, RESIZE_DEBOUNCE_MS);
      });

      for (const root of this.targets) {
        this.resizeObserver.observe(root);
      }
    }

    if (typeof document.fonts !== "undefined") {
      document.fonts.addEventListener("loadingdone", this.onFontsLoaded);
    }
  }

  private checkWidths(): void {
    if (this.reverted) return;

    for (const root of this.targets) {
      if (root.offsetWidth !== this.widthByRoot.get(root)) {
        this.performSplit();
        return;
      }
    }
  }

  revert(): void {
    if (this.reverted) return;
    this.reverted = true;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }

    if (isBrowser && typeof document.fonts !== "undefined") {
      document.fonts.removeEventListener("loadingdone", this.onFontsLoaded);
    }

    for (const killable of this.lastKillables) killable.kill();
    this.lastKillables = [];

    for (const root of this.targets) {
      if (elementOwners.get(root) === this) elementOwners.delete(root);

      const savedHTML = this.originalHTML.get(root);
      if (savedHTML !== undefined) root.innerHTML = savedHTML;

      if (this.ownedAriaLabel.has(root)) {
        root.removeAttribute("aria-label");
        this.ownedAriaLabel.delete(root);
      }
    }

    this.chars = [];
    this.words = [];
    this.lines = [];
  }

  kill(): void {
    this.revert();
  }
}

export function splitText(target: SixTarget, vars?: SplitTextVars): SplitText {
  return new SplitText(target, vars);
}
