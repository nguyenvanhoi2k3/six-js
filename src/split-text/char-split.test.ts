import { describe, expect, it } from "vitest";
import { mergeSpecialCharTokens, resolveSpecialCharsRegex, splitGraphemes } from "./char-split";

describe("splitGraphemes", () => {
  it("splits plain ascii text into individual characters", () => {
    expect(splitGraphemes("abc")).toEqual(["a", "b", "c"]);
  });

  it("keeps a multi-codepoint emoji as a single grapheme", () => {
    expect(splitGraphemes("a👍b")).toEqual(["a", "👍", "b"]);
  });

  it("keeps a ZWJ emoji sequence (family) as one grapheme", () => {
    const family = "👨‍👩‍👧‍👦";
    expect(splitGraphemes(family)).toEqual([family]);
  });

  it("merges runs of chars matching specialChars into one atomic token", () => {
    const regex = resolveSpecialCharsRegex(["->"]);
    expect(splitGraphemes("a->b", regex)).toEqual(["a", "->", "b"]);
  });
});

describe("mergeSpecialCharTokens", () => {
  it("returns the collection unchanged when no regex is given", () => {
    expect(mergeSpecialCharTokens(["a", "b"])).toEqual(["a", "b"]);
  });

  it("merges adjacent tokens that together match a special-chars pattern", () => {
    const regex = resolveSpecialCharsRegex(["foo"]);
    expect(mergeSpecialCharTokens(["f", "o", "o", "bar"], regex)).toEqual(["foo", "bar"]);
  });

  it("leaves tokens alone when nothing matches", () => {
    const regex = resolveSpecialCharsRegex(["zzz"]);
    expect(mergeSpecialCharTokens(["a", "b", "c"], regex)).toEqual(["a", "b", "c"]);
  });
});

describe("resolveSpecialCharsRegex", () => {
  it("returns undefined when no specialChars given", () => {
    expect(resolveSpecialCharsRegex(undefined)).toBeUndefined();
  });

  it("passes a given RegExp through untouched", () => {
    const regex = /foo/gu;
    expect(resolveSpecialCharsRegex(regex)).toBe(regex);
  });

  it("builds an alternation regex from a string array", () => {
    const regex = resolveSpecialCharsRegex(["ab", "cd"])!;
    expect("xxabcdxx".match(regex)).toEqual(["ab", "cd"]);
  });
});
