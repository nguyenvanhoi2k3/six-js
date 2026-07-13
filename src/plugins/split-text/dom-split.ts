export interface WordCharBuildOptions {
  tag: string;
  wantsChars: boolean;
  needsWordWrapper: boolean;
  wordsClass: string;
  charsClass: string;
}

export interface WordCharBuildResult {
  wordEls: HTMLElement[];
  charEls: HTMLElement[];
}

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "BR",
  "IMG",
  "SVG",
  "VIDEO",
  "AUDIO",
  "CANVAS",
  "IFRAME",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OBJECT",
  "EMBED",
]);

let emojiSafeRegex: RegExp | null | undefined;

function getEmojiSafeRegex(): RegExp | null {
  if (emojiSafeRegex !== undefined) return emojiSafeRegex;

  try {
    emojiSafeRegex = new RegExp(
      "\\p{Regional_Indicator}{2}|\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F\\u20E3?)?(\\u200D\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F\\u20E3?)?)*|.",
      "gu",
    );
  } catch {
    emojiSafeRegex = null;
  }

  return emojiSafeRegex;
}

function segmentGraphemes(text: string): string[] {
  const Segmenter = (Intl as any)?.Segmenter;
  if (Segmenter) {
    return Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s: any) => s.segment);
  }

  const regex = getEmojiSafeRegex();
  return regex ? text.match(regex) ?? [] : Array.from(text);
}

export function applyIndexedClass(el: HTMLElement, className: string, index: number): void {
  if (!className) return;

  if (className.includes("++")) {
    const base = className.replace("++", "").trim();
    if (base) el.classList.add(base, `${base}${index}`);
  } else {
    el.classList.add(className);
  }
}

function createWrapper(tag: string, display: "inline-block" | "block"): HTMLElement {
  const el = document.createElement(tag);

  if (tag.toLowerCase() !== "span") {
    el.style.position = "relative";
    el.style.display = display;
  }

  if (display === "inline-block") el.style.verticalAlign = "baseline";

  return el;
}

export function splitIntoWordsAndChars(root: HTMLElement, options: WordCharBuildOptions): WordCharBuildResult {
  const wordEls: HTMLElement[] = [];
  const charEls: HTMLElement[] = [];
  let wordIndex = 0;
  let charIndex = 0;

  function buildChar(text: string): HTMLElement {
    const el = createWrapper(options.tag, "inline-block");
    el.textContent = text;
    applyIndexedClass(el, options.charsClass, charIndex++);
    charEls.push(el);
    return el;
  }

  function buildWordToken(word: string, appendTo: (node: Node) => void): void {
    if (options.needsWordWrapper) {
      const wordEl = createWrapper(options.tag, "inline-block");
      applyIndexedClass(wordEl, options.wordsClass, wordIndex++);

      if (options.wantsChars) {
        wordEl.style.whiteSpace = "nowrap";
        wordEl.style.overflowWrap = "normal";
        wordEl.style.wordBreak = "normal";

        for (const ch of segmentGraphemes(word)) {
          wordEl.appendChild(buildChar(ch));
        }
      } else {
        wordEl.textContent = word;
      }

      wordEls.push(wordEl);
      appendTo(wordEl);
    } else {
      for (const ch of segmentGraphemes(word)) {
        appendTo(buildChar(ch));
      }
    }
  }

  function processTextNode(node: Text): void {
    const text = node.data.replace(/\s+/g, " ");
    if (text === "") return;

    const tokens = text.split(/(\s+)/).filter((t) => t.length > 0);
    const fragment = document.createDocumentFragment();

    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        fragment.appendChild(document.createTextNode(token));
      } else {
        buildWordToken(token, (n) => fragment.appendChild(n));
      }
    }

    node.replaceWith(fragment);
  }

  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node as Text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    if (SKIP_TAGS.has(el.tagName)) return;

    for (const child of Array.from(el.childNodes)) {
      walk(child);
    }
  }

  for (const child of Array.from(root.childNodes)) {
    walk(child);
  }

  return { wordEls, charEls };
}

export function unwrapWords(root: HTMLElement, wordEls: HTMLElement[]): void {
  for (const el of wordEls) {
    el.replaceWith(...Array.from(el.childNodes));
  }
  root.normalize();
}

export interface LineBuildOptions {
  tag: string;
  linesClass: string;
}

export function groupWordsIntoLines(root: HTMLElement, wordEls: HTMLElement[], options: LineBuildOptions): HTMLElement[] {
  if (wordEls.length === 0) return [];

  const groups: HTMLElement[][] = [[wordEls[0]]];
  let lastRect = wordEls[0].getBoundingClientRect();

  for (let i = 1; i < wordEls.length; i++) {
    const rect = wordEls[i].getBoundingClientRect();
    const isNewLine = rect.top > lastRect.top && rect.left < lastRect.left + lastRect.width - 1;

    if (isNewLine) groups.push([wordEls[i]]);
    else groups[groups.length - 1].push(wordEls[i]);

    lastRect = rect;
  }

  const range = document.createRange();
  const fragments: DocumentFragment[] = [];

  for (let i = 0; i < groups.length; i++) {
    if (i === 0) range.setStart(root, 0);
    else range.setStartBefore(groups[i][0]);

    if (i === groups.length - 1) range.setEnd(root, root.childNodes.length);
    else range.setEndBefore(groups[i + 1][0]);

    fragments.push(range.extractContents());
  }

  const lineEls: HTMLElement[] = [];

  for (let i = 0; i < fragments.length; i++) {
    const lineEl = createWrapper(options.tag, "block");
    applyIndexedClass(lineEl, options.linesClass, i);
    lineEl.appendChild(fragments[i]);
    root.appendChild(lineEl);
    lineEls.push(lineEl);
  }

  root.normalize();

  return lineEls;
}

const MASK_DESCENDER_BUFFER = "0.25em";

export function applyMask(els: HTMLElement[]): void {
  for (const el of els) {
    const mask = el.cloneNode(false) as HTMLElement;
    mask.style.overflow = "clip";
    mask.style.paddingBottom = MASK_DESCENDER_BUFFER;
    mask.style.marginBottom = `-${MASK_DESCENDER_BUFFER}`;
    mask.className = el.className
      ? el.className
          .trim()
          .split(/\s+/)
          .map((c) => `${c}-mask`)
          .join(" ")
      : "";
    el.replaceWith(mask);
    mask.appendChild(el);
  }
}
