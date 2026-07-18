import { describe, expect, it } from "vitest";
import { createWrapper, disallowInline } from "./wrapper";

describe("createWrapper", () => {
  it("defaults to a div, positioned relative, inline-block for words/chars", () => {
    const collection: HTMLElement[] = [];
    const wrap = createWrapper("word", {}, collection);
    const el = wrap("hi");

    expect(el.tagName).toBe("DIV");
    expect(el.textContent).toBe("hi");
    expect(el.style.position).toBe("relative");
    expect(el.style.display).toBe("inline-block");
    expect(collection).toEqual([el]);
  });

  it("uses block display for lines", () => {
    const wrap = createWrapper("line", {}, []);
    expect(wrap("").style.display).toBe("block");
  });

  it("skips inline position/display styling when tag is span", () => {
    const wrap = createWrapper("word", { tag: "span" }, []);
    const el = wrap("hi");
    expect(el.tagName).toBe("SPAN");
    expect(el.style.position).toBe("");
    expect(el.style.display).toBe("");
  });

  it("always increments the class, no opt-in syntax required", () => {
    const collection: HTMLElement[] = [];
    const wrap = createWrapper("word", { wordsClass: "word" }, collection);
    const a = wrap("a");
    const b = wrap("b");
    expect(a.className).toBe("word word1");
    expect(b.className).toBe("word word2");
  });

  it("reads the class from the kind-specific config key", () => {
    expect(createWrapper("char", { charsClass: "char" }, [])("x").className).toBe("char char1");
    expect(createWrapper("line", { linesClass: "line" }, [])("x").className).toBe("line line1");
  });

  it("sets aria-hidden by default (aria: auto)", () => {
    const el = createWrapper("word", {}, [])("hi");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("omits aria-hidden when aria is none", () => {
    const el = createWrapper("word", { aria: "none" }, [])("hi");
    expect(el.hasAttribute("aria-hidden")).toBe(false);
  });

  it("sets a --word/--char/--line custom property when propIndex is on", () => {
    const el = createWrapper("char", { propIndex: true }, [])("x");
    expect(el.style.getPropertyValue("--char")).toBe("1");
  });
});

describe("disallowInline", () => {
  it("forces inline-block when computed display is inline", () => {
    const el = document.createElement("b");
    document.body.appendChild(el);
    disallowInline(el);
    expect(el.style.display).toBe("inline-block");
    el.remove();
  });
});
