import { describe, expect, it } from "vitest";
import { applyMask } from "./mask";

describe("applyMask", () => {
  it("wraps each element in a clone of itself with overflow: clip", () => {
    const container = document.createElement("div");
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = "hello";
    container.appendChild(line);

    const [mask] = applyMask([line]);

    expect(mask.tagName).toBe("DIV");
    expect(mask.style.overflow).toBe("clip");
    expect(mask.contains(line)).toBe(true);
    expect(mask.parentNode).toBe(container);
    expect(line.parentNode).toBe(mask);
  });

  it("suffixes every existing class with -mask on the wrapper, not the original", () => {
    const line = document.createElement("div");
    line.className = "line line1";
    document.body.appendChild(line);

    const [mask] = applyMask([line]);

    expect(mask.className).toBe("line-mask line1-mask");
    expect(line.className).toBe("line line1");
    mask.remove();
  });

  it("leaves className empty when the original has none", () => {
    const line = document.createElement("div");
    document.body.appendChild(line);

    const [mask] = applyMask([line]);
    expect(mask.className).toBe("");
    mask.remove();
  });

  it("returns one mask wrapper per input element, in order", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    document.body.append(a, b);

    const masks = applyMask([a, b]);
    expect(masks).toHaveLength(2);
    expect(masks[0].contains(a)).toBe(true);
    expect(masks[1].contains(b)).toBe(true);
    masks.forEach((m) => m.remove());
  });
});
