import { describe, expect, it } from "vitest";
import { canInterpolateComplex, interpolateComplexString } from "./complex-string";

describe("canInterpolateComplex", () => {
  it("is true for strings with the same token shape", () => {
    expect(canInterpolateComplex("0px 0px 10px rgba(0,0,0,0.5)", "5px 5px 20px rgba(255,0,0,1)")).toBe(true);
  });

  it("is false when token counts differ", () => {
    expect(canInterpolateComplex("0px 0px 10px", "0px 0px 10px 5px")).toBe(false);
  });

  it("is false when token types differ at the same position", () => {
    expect(canInterpolateComplex("0px red", "0px 5px")).toBe(false);
  });
});

describe("interpolateComplexString", () => {
  it("interpolates multiple numbers positionally", () => {
    expect(interpolateComplexString("0px 0px", "10px 20px", 0.5)).toBe("5px 10px");
  });

  it("interpolates an embedded color alongside numbers", () => {
    const result = interpolateComplexString("0px 0px 0px rgba(0,0,0,0)", "10px 10px 10px rgba(200,100,0,1)", 0.5);
    expect(result).toBe("5px 5px 5px rgba(100, 50, 0, 0.5)");
  });

  it("keeps the end string's unit when only the end value specifies one", () => {
    expect(interpolateComplexString("0", "100%", 1)).toBe("100%");
  });

  it("preserves literal glue text between tokens", () => {
    expect(interpolateComplexString("translate(0px, 0px)", "translate(10px, 20px)", 0.5)).toBe("translate(5px, 10px)");
  });

  it("uses the end token directly when the start string has no corresponding token", () => {
    expect(interpolateComplexString("0px", "0px 5px", 0)).toBe("0px 5px");
  });
});
