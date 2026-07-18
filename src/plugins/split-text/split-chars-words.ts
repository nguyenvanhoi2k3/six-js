import { mergeSpecialCharTokens, splitGraphemes } from "./char-split";
import { disallowInline, Wrapper } from "./wrapper";

export type WordDelimiter = string | RegExp | { delimiter: string | RegExp; replaceWith?: string };

export interface ResolvedDelimiter {
  splitter: string | RegExp;
  replacement: string;
  isSpace: boolean;
}

export function resolveWordDelimiter(wordDelimiter?: WordDelimiter): ResolvedDelimiter {
  if (wordDelimiter && typeof wordDelimiter === "object" && !(wordDelimiter instanceof RegExp)) {
    const replacement = wordDelimiter.replaceWith ?? "";
    return { splitter: wordDelimiter.delimiter, replacement, isSpace: replacement === " " };
  }
  if (wordDelimiter instanceof RegExp) {
    return { splitter: wordDelimiter, replacement: "", isSpace: false };
  }
  const replacement = wordDelimiter === "" ? "" : (wordDelimiter ?? " ");
  return { splitter: replacement, replacement, isSpace: replacement === " " };
}

export interface SplitWordsCharsOptions {
  delimiter: ResolvedDelimiter;
  reduceWhiteSpace: boolean;
  prepareText?: (text: string, element: Element) => string;
  skip: Element[];
  onlyChars: boolean;
  deepSlice: boolean;
  specialCharsRegex?: RegExp;
}

function insertBefore(parent: Element, newChild: string | Node, ref: Node | null): void {
  parent.insertBefore(typeof newChild === "string" ? document.createTextNode(newChild) : newChild, ref);
}

export function splitWordsAndChars(
  element: Element,
  opts: SplitWordsCharsOptions,
  wordWrapper: Wrapper,
  charWrapper: Wrapper | null,
  isNested = false
): void {
  const { delimiter, reduceWhiteSpace, prepareText, skip, onlyChars, deepSlice, specialCharsRegex } = opts;
  const { splitter, replacement, isSpace } = delimiter;
  const nodes = Array.from(element.childNodes);
  const elementBounds = element.getBoundingClientRect();
  const isPreformatted = !reduceWhiteSpace && window.getComputedStyle(element).whiteSpace.slice(0, 3) === "pre";
  const wordsCollection = wordWrapper.collection;
  const sliceLines = deepSlice && isNested;

  let lastBounds = elementBounds;
  let skippedPreviousSibling: Element | null = null;

  for (let i = 0; i < nodes.length; i++) {
    const curNode = nodes[i];

    if (curNode.nodeType === Node.TEXT_NODE) {
      let curTextContent = curNode.textContent || "";
      if (reduceWhiteSpace) {
        curTextContent = curTextContent.replace(/\s+/g, " ");
      } else if (isPreformatted) {
        curTextContent = curTextContent.replace(/\n/g, `${replacement}\n`);
      }
      if (prepareText) curTextContent = prepareText(curTextContent, element);
      curNode.textContent = curTextContent;

      const words = splitter ? curTextContent.split(splitter) : splitGraphemes(curTextContent, specialCharsRegex);

      const lastWordText = words[words.length - 1] ?? "";
      const endsWithSpace = !isSpace ? lastWordText.slice(-1) === " " : !lastWordText;
      if (!lastWordText) words.pop();

      lastBounds = elementBounds;
      const startsWithSpace = !isSpace ? (words[0] ?? "").charAt(0) === " " : !words[0];
      if (startsWithSpace) insertBefore(element, " ", curNode);
      if (!words[0]) words.shift();

      mergeSpecialCharTokens(words, specialCharsRegex);
      if (!sliceLines) curNode.textContent = "";

      for (let j = 1; j <= words.length; j++) {
        let wordText = words[j - 1];

        if (!reduceWhiteSpace && isPreformatted && wordText.charAt(0) === "\n") {
          const prev = curNode.previousSibling;
          if (prev) prev.parentNode?.removeChild(prev);
          insertBefore(element, document.createElement("br"), curNode);
          wordText = wordText.slice(1);
        }

        if (!reduceWhiteSpace && wordText === "") {
          insertBefore(element, replacement, curNode);
        } else if (wordText === " ") {
          element.insertBefore(document.createTextNode(" "), curNode);
        } else {
          if (!isSpace && wordText.charAt(0) === " ") insertBefore(element, " ", curNode);

          let curWordEl: HTMLElement;
          const continuesSkippedWord =
            !!skippedPreviousSibling &&
            j === 1 &&
            !startsWithSpace &&
            wordsCollection.indexOf(skippedPreviousSibling.parentNode as HTMLElement) > -1;

          if (continuesSkippedWord) {
            curWordEl = wordsCollection[wordsCollection.length - 1];
            curWordEl.appendChild(document.createTextNode(charWrapper ? "" : wordText));
          } else {
            curWordEl = wordWrapper(charWrapper ? "" : wordText);
            insertBefore(element, curWordEl, curNode);
            if (skippedPreviousSibling && j === 1 && !startsWithSpace) {
              curWordEl.insertBefore(skippedPreviousSibling, curWordEl.firstChild);
            }
          }

          if (charWrapper) {
            for (const ch of splitGraphemes(wordText, specialCharsRegex)) {
              curWordEl.appendChild(ch === " " ? document.createTextNode(" ") : charWrapper(ch));
            }
          }

          if (sliceLines) {
            curTextContent = curTextContent.substring(wordText.length + 1);
            curNode.textContent = curTextContent;
            const bounds = curWordEl.getBoundingClientRect();
            if (bounds.top > lastBounds.top && bounds.left <= lastBounds.left) {
              const clonedNode = element.cloneNode(false) as Element;
              let curSubNode: ChildNode | null = element.childNodes[0];
              while (curSubNode && curSubNode !== curWordEl) {
                const tempSubNode = curSubNode;
                curSubNode = curSubNode.nextSibling;
                clonedNode.appendChild(tempSubNode);
              }
              element.parentNode?.insertBefore(clonedNode, element);
              if (onlyChars) disallowInline(clonedNode as HTMLElement);
            }
            lastBounds = bounds;
          }

          if (j < words.length || endsWithSpace) {
            const trailing = j >= words.length ? " " : !isSpace && wordText.slice(-1) === " " ? ` ${replacement}` : replacement;
            insertBefore(element, trailing, curNode);
          }
        }
      }

      element.removeChild(curNode);
      skippedPreviousSibling = null;
    } else if (curNode.nodeType === Node.ELEMENT_NODE) {
      const el = curNode as Element;
      if (skip.indexOf(el) > -1) {
        if (wordsCollection.indexOf(el.previousSibling as HTMLElement) > -1) {
          wordsCollection[wordsCollection.length - 1].appendChild(el);
        }
        skippedPreviousSibling = el;
      } else {
        splitWordsAndChars(el, opts, wordWrapper, charWrapper, true);
        skippedPreviousSibling = null;
      }
      if (onlyChars) disallowInline(el as HTMLElement);
    }
  }
}
