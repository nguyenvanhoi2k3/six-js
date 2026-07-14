import { describe, expect, it } from "vitest";
import { convertToPx } from "./unit-convert";

describe("convertToPx", () => {
  it("passes px through unchanged", () => {
    const el = document.createElement("div");
    expect(convertToPx(el, "left", 10, "px")).toBe(10);
  });

  it("passes angle units through unchanged (not measurable via layout)", () => {
    const el = document.createElement("div");
    expect(convertToPx(el, "rotation", 90, "deg")).toBe(90);
  });

  it("converts rem using the root element's font-size", () => {
    document.documentElement.style.fontSize = "20px";
    const el = document.createElement("div");
    expect(convertToPx(el, "left", 2, "rem")).toBe(40);
    document.documentElement.style.fontSize = "";
  });

  it("converts em using the target's own font-size", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.style.fontSize = "10px";
    expect(convertToPx(el, "left", 3, "em")).toBe(30);
    el.remove();
  });

  it("converts vh/vw using the viewport size", () => {
    const el = document.createElement("div");
    expect(convertToPx(el, "top", 50, "vh")).toBeCloseTo(window.innerHeight * 0.5);
    expect(convertToPx(el, "left", 50, "vw")).toBeCloseTo(window.innerWidth * 0.5);
  });

  it("returns the raw value for a detached element with % (no parent to measure)", () => {
    const el = document.createElement("div");
    expect(convertToPx(el, "left", 50, "%")).toBe(50);
  });
});
