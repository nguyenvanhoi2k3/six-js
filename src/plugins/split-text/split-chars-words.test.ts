import { describe, expect, it } from "vitest";
import { resolveWordDelimiter, splitWordsAndChars, SplitWordsCharsOptions } from "./split-chars-words";
import { createWrapper } from "./wrapper";

function baseOpts(overrides: Partial<SplitWordsCharsOptions> = {}): SplitWordsCharsOptions {
  return {
    delimiter: resolveWordDelimiter(undefined),
    reduceWhiteSpace: true,
    skip: [],
    onlyChars: false,
    deepSlice: false,
    specialCharsRegex: undefined,
    ...overrides,
  };
}

describe("splitWordsAndChars", () => {
  it("splits text into word wrapper elements, reconstructing the original text via DOM structure", () => {
    const el = document.createElement("div");
    el.textContent = "Hello world";
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts(), wordWrapper, null);

    expect(words.map((w) => w.textContent)).toEqual(["Hello", "world"]);
    expect(el.textContent).toBe("Hello world");
  });

  it("splits each word into char elements when a charWrapper is given", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    const words: HTMLElement[] = [];
    const chars: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);
    const charWrapper = createWrapper("char", {}, chars);

    splitWordsAndChars(el, baseOpts(), wordWrapper, charWrapper);

    expect(chars.map((c) => c.textContent)).toEqual(["H", "i", "t", "h", "e", "r", "e"]);
    expect(words[0].textContent).toBe("Hi");
    expect(words[1].textContent).toBe("there");
  });

  it("collapses runs of whitespace to a single space by default", () => {
    const el = document.createElement("div");
    el.textContent = "a    b";
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts(), wordWrapper, null);

    expect(words.map((w) => w.textContent)).toEqual(["a", "b"]);
  });

  it("supports a custom string delimiter, reinserted between words", () => {
    const el = document.createElement("div");
    el.textContent = "a-b-c";
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts({ delimiter: resolveWordDelimiter("-") }), wordWrapper, null);

    expect(words.map((w) => w.textContent)).toEqual(["a", "b", "c"]);
    expect(el.textContent).toBe("a-b-c");
  });

  it("recurses into non-skipped nested elements", () => {
    const el = document.createElement("div");
    const bold = document.createElement("b");
    bold.textContent = "bold text";
    el.append("plain ", bold);
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts(), wordWrapper, null);

    expect(words.map((w) => w.textContent)).toEqual(["plain", "bold", "text"]);
    expect(el.querySelector("b")).not.toBeNull();
  });

  it("does not recurse into a skipped element, leaving it as a standalone sibling when surrounded by spaces", () => {
    const el = document.createElement("div");
    const icon = document.createElement("i");
    icon.className = "icon";
    icon.textContent = "ICON";
    el.append("Hello ", icon, " world");
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts({ skip: [icon] }), wordWrapper, null);

    expect(el.querySelector(".icon")).toBe(icon);
    expect(icon.textContent).toBe("ICON");
    expect(words.map((w) => w.textContent)).toEqual(["Hello", "world"]);
  });

  it("folds a skipped element with no surrounding spaces into the single word it's embedded in", () => {
    const el = document.createElement("div");
    const icon = document.createElement("i");
    icon.className = "icon";
    icon.textContent = "-";
    el.append("wor", icon, "d");
    const words: HTMLElement[] = [];
    const wordWrapper = createWrapper("word", {}, words);

    splitWordsAndChars(el, baseOpts({ skip: [icon] }), wordWrapper, null);

    expect(words).toHaveLength(1);
    expect(words[0].contains(icon)).toBe(true);
    expect(words[0].textContent).toBe("wor-d");
  });
});
