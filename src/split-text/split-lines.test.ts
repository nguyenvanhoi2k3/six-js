import { describe, expect, it, vi } from "vitest";
import { splitIntoLines } from "./split-lines";

function rect(top: number, left: number, width: number, height = 20): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

describe("splitIntoLines", () => {
  it("keeps everything on one line when nothing wraps (jsdom has no real layout)", () => {
    const el = document.createElement("div");
    const w1 = document.createElement("div");
    w1.textContent = "a";
    const w2 = document.createElement("div");
    w2.textContent = "b";
    el.append(w1, " ", w2);

    const lines: HTMLElement[] = [];
    splitIntoLines(el, {}, lines);

    expect(lines).toHaveLength(1);
    expect(lines[0].textContent).toBe("a b");
  });

  it("starts a new line when a child's top increases and its left jumps back", () => {
    const el = document.createElement("div");
    const w1 = document.createElement("div");
    w1.textContent = "Hello";
    const w2 = document.createElement("div");
    w2.textContent = "world";
    const w3 = document.createElement("div");
    w3.textContent = "today";
    el.append(w1, " ", w2, " ", w3);

    vi.spyOn(w1, "getBoundingClientRect").mockReturnValue(rect(0, 0, 40));
    vi.spyOn(w2, "getBoundingClientRect").mockReturnValue(rect(0, 50, 40));
    vi.spyOn(w3, "getBoundingClientRect").mockReturnValue(rect(25, 0, 40));

    const lines: HTMLElement[] = [];
    splitIntoLines(el, {}, lines);

    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toBe("Hello world ");
    expect(lines[1].textContent).toBe("today");
  });

  it("treats a <br> as an explicit line break and removes it after wrapping", () => {
    const el = document.createElement("div");
    const w1 = document.createElement("div");
    w1.textContent = "Hello";
    const br = document.createElement("br");
    const w2 = document.createElement("div");
    w2.textContent = "world";
    el.append(w1, br, w2);

    const lines: HTMLElement[] = [];
    splitIntoLines(el, {}, lines);

    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toBe("Hello");
    expect(lines[1].textContent).toBe("world");
    expect(el.querySelector("br")).toBeNull();
  });

  it("applies the container's text-align to every generated line", () => {
    const el = document.createElement("div");
    el.style.textAlign = "center";
    const w1 = document.createElement("div");
    w1.textContent = "hi";
    el.append(w1);

    const lines: HTMLElement[] = [];
    splitIntoLines(el, {}, lines);

    expect(lines[0].style.textAlign).toBe("center");
  });

  it("names generated elements via linesClass, tag, and aria per config", () => {
    const el = document.createElement("div");
    const w1 = document.createElement("div");
    w1.textContent = "hi";
    el.append(w1);

    const lines: HTMLElement[] = [];
    splitIntoLines(el, { linesClass: "line", tag: "p" }, lines);

    expect(lines[0].tagName).toBe("P");
    expect(lines[0].className).toBe("line line1");
    expect(lines[0].getAttribute("aria-hidden")).toBe("true");
  });
});
