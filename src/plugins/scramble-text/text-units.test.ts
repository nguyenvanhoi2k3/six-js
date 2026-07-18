import { describe, expect, it } from "vitest";
import { splitUnits, randomChar, randomString } from "./text-units";

describe("splitUnits", () => {
  it("splits into individual characters by default (\"\" delimiter)", () => {
    expect(splitUnits("abc", "")).toEqual(["a", "b", "c"]);
  });

  it("keeps a surrogate-pair character (e.g. an emoji) intact instead of splitting it in half", () => {
    const withEmoji = "a🚀b";
    expect(splitUnits(withEmoji, "")).toEqual(["a", "🚀", "b"]);
    // sanity check: the naive index-based approach WOULD split it, proving this matters
    expect(withEmoji.length).toBe(4);
  });

  it("splits on a literal delimiter (e.g. word-by-word via \" \")", () => {
    expect(splitUnits("hello scrambled world", " ")).toEqual(["hello", "scrambled", "world"]);
  });
});

describe("randomChar / randomString", () => {
  it("always draws from the given pool", () => {
    const pool = "XY";
    for (let i = 0; i < 50; i++) {
      expect(pool.includes(randomChar(pool))).toBe(true);
    }
  });

  it("randomString produces the requested length, every character from the pool", () => {
    const pool = "0123456789";
    const s = randomString(12, pool);
    expect(s).toHaveLength(12);
    expect([...s].every((c) => pool.includes(c))).toBe(true);
  });

  it("is deterministic when an rng is injected", () => {
    const rng = () => 0; // always picks index 0
    expect(randomChar("ABC", rng)).toBe("A");
    expect(randomString(5, "ABC", rng)).toBe("AAAAA");
  });
});
