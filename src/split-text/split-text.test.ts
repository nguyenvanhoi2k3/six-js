import { describe, expect, it } from "vitest";
import { context } from "../core/context";
import { splitText, SplitText } from "./split-text";

describe("splitText / SplitText", () => {
  it("splits into chars, words, and lines by default", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el);

    expect(split.words.map((w) => w.textContent)).toEqual(["Hi", "there"]);
    expect(split.chars.map((c) => c.textContent)).toEqual(["H", "i", "t", "h", "e", "r", "e"]);
    expect(split.lines).toHaveLength(1);
    expect(split.isSplit).toBe(true);

    split.revert();
    el.remove();
  });

  it("only splits the requested types", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words" });

    expect(split.words).toHaveLength(2);
    expect(split.chars).toHaveLength(0);
    expect(split.lines).toHaveLength(0);

    split.revert();
    el.remove();
  });

  it("accepts a css selector target and a type array", () => {
    const el = document.createElement("div");
    el.className = "target";
    el.textContent = "hi";
    document.body.appendChild(el);

    const split = splitText(".target", { type: ["chars"] });
    expect(split.chars).toHaveLength(2);

    split.revert();
    el.remove();
  });

  it("sets aria-label from the original text and aria-hidden on generated wrappers by default", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words" });

    expect(el.getAttribute("aria-label")).toBe("Hi there");
    expect(split.words[0].getAttribute("aria-hidden")).toBe("true");

    split.revert();
    el.remove();
  });

  it("always increments wordsClass/charsClass/linesClass, no opt-in syntax needed", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { wordsClass: "word", charsClass: "char" });

    expect(split.words[0].className).toBe("word word1");
    expect(split.words[1].className).toBe("word word2");
    expect(split.chars[0].className).toBe("char char1");

    split.revert();
    el.remove();
  });

  it("revert() restores the original HTML and aria attributes", () => {
    const el = document.createElement("div");
    el.innerHTML = "Hi <b>there</b>";
    el.setAttribute("aria-label", "custom");
    document.body.appendChild(el);
    const originalHtml = el.innerHTML;

    const split = splitText(el, { type: "words" });
    expect(el.innerHTML).not.toBe(originalHtml);

    split.revert();

    expect(el.innerHTML).toBe(originalHtml);
    expect(el.getAttribute("aria-label")).toBe("custom");
    expect(split.isSplit).toBe(false);
    expect(split.words).toHaveLength(0);

    el.remove();
  });

  it("can be split() again after revert()", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words" });
    split.revert();
    split.split();

    expect(split.isSplit).toBe(true);
    expect(split.words).toHaveLength(2);

    split.revert();
    el.remove();
  });

  it("kill() reverts and permanently disables further split() calls", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words" });
    const originalHtml = "Hi there";
    split.kill();

    expect(el.innerHTML).toBe(originalHtml);
    expect(split.isSplit).toBe(false);
    expect(() => split.split()).toThrow();

    el.remove();
  });

  it("calling revert() then kill() (matching typical teardown usage) is safe and idempotent", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words" });
    expect(() => {
      split.revert();
      split.kill();
    }).not.toThrow();

    el.remove();
  });

  it("creating a new SplitText over an already-split element kills the previous owner", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const first = splitText(el, { type: "words" });
    const second = splitText(el, { type: "chars" });

    expect(first.isSplit).toBe(false);
    expect(second.isSplit).toBe(true);
    expect(second.chars.length).toBeGreaterThan(0);

    second.revert();
    el.remove();
  });

  it("is auto-captured by an active six.context() scope, and killed on ctx.revert()", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    let split!: SplitText;
    const ctx = context(() => {
      split = splitText(el, { type: "words" });
    });

    expect(split.isSplit).toBe(true);
    ctx.revert();

    expect(split.isSplit).toBe(false);
    expect(el.textContent).toBe("Hi there");

    el.remove();
  });

  it("wraps the requested collection in overflow-clip mask elements", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "words", overflow: "words" });

    expect(split.masks).toHaveLength(2);
    split.masks.forEach((m) => expect(m.style.overflow).toBe("clip"));
    expect(split.masks[0].contains(split.words[0])).toBe(true);

    split.revert();
    el.remove();
  });

  it("overflow: true auto-picks lines over words over chars", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    const split = splitText(el, { type: "chars,words,lines", overflow: true });

    expect(split.masks).toHaveLength(split.lines.length);

    split.revert();
    el.remove();
  });

  it("does not recurse into skipped elements", () => {
    const el = document.createElement("div");
    el.innerHTML = 'Hello <i class="icon">X</i> world';
    document.body.appendChild(el);
    const icon = el.querySelector(".icon") as HTMLElement;

    const split = splitText(el, { type: "words", skip: icon });

    expect(el.querySelector(".icon")).toBe(icon);
    expect(split.words.map((w) => w.textContent)).toEqual(["Hello", "world"]);

    split.revert();
    el.remove();
  });

  it("calls onSplit after splitting and onRevert after reverting", () => {
    const el = document.createElement("div");
    el.textContent = "Hi there";
    document.body.appendChild(el);

    let splitCalls = 0;
    let revertCalls = 0;

    const split = splitText(el, {
      type: "words",
      onSplit: (self) => {
        splitCalls++;
        expect(self.isSplit).toBe(true);
      },
      onRevert: (self) => {
        revertCalls++;
        expect(self.isSplit).toBe(false);
      },
    });

    expect(splitCalls).toBe(1);
    split.revert();
    expect(revertCalls).toBe(1);

    el.remove();
  });
});
