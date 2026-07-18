import { describe, expect, it } from "vitest";
import { resolveCharSet } from "./char-sets";

describe("resolveCharSet", () => {
  it("defaults to upperCase (A-Z) when omitted", () => {
    expect(resolveCharSet(undefined)).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });

  it("resolves the named presets", () => {
    expect(resolveCharSet("upperCase")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(resolveCharSet("lowerCase")).toBe("abcdefghijklmnopqrstuvwxyz");
    expect(resolveCharSet("upperAndLowerCase")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
    expect(resolveCharSet("numeric")).toBe("0123456789");
  });

  it("treats any other non-empty string as a literal custom pool", () => {
    expect(resolveCharSet("XO")).toBe("XO");
    expect(resolveCharSet("jompaWB!^")).toBe("jompaWB!^");
  });

  it("falls back to upperCase for an empty custom string", () => {
    expect(resolveCharSet("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });
});
