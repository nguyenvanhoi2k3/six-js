import { describe, expect, it } from "vitest";
import { arrayOf, clamp, getByClass, getById, random } from "./utils";

describe("utils - arrayOf", () => {
  it("resolves a selector string to an array of matched elements", () => {
    document.body.innerHTML = `<div class="item"></div><div class="item"></div>`;
    expect(arrayOf(".item")).toHaveLength(2);
  });

  it("wraps a single element in an array", () => {
    const el = document.createElement("div");
    expect(arrayOf(el)).toEqual([el]);
  });

  it("scopes a selector query to the given container", () => {
    document.body.innerHTML = `<div id="a"><span class="x"></span></div><div id="b"><span class="x"></span><span class="x"></span></div>`;
    const scope = document.getElementById("b") as HTMLElement;
    expect(arrayOf(".x", scope)).toHaveLength(2);
  });

  it("returns an empty array for null/undefined", () => {
    expect(arrayOf(null)).toEqual([]);
    expect(arrayOf(undefined)).toEqual([]);
  });
});

describe("utils - getById/getByClass", () => {
  it("getById returns the matching element", () => {
    document.body.innerHTML = `<div id="target"></div>`;
    expect(getById("target")).toBe(document.getElementById("target"));
  });

  it("getById returns null when nothing matches", () => {
    expect(getById("missing")).toBeNull();
  });

  it("getByClass returns every element with the given class", () => {
    document.body.innerHTML = `<div class="item"></div><span class="item"></span><div class="other"></div>`;
    expect(getByClass("item")).toHaveLength(2);
  });

  it("getByClass scopes to the given container", () => {
    document.body.innerHTML = `<div id="a"><span class="x"></span></div><div id="b"><span class="x"></span><span class="x"></span></div>`;
    const scope = document.getElementById("b") as HTMLElement;
    expect(getByClass("x", scope)).toHaveLength(2);
  });
});

describe("utils - clamp", () => {
  it("passes through a value already inside the range", () => {
    expect(clamp(0, 10, 5)).toBe(5);
  });

  it("clamps a value below the minimum", () => {
    expect(clamp(0, 10, -5)).toBe(0);
  });

  it("clamps a value above the maximum", () => {
    expect(clamp(0, 10, 15)).toBe(10);
  });

  it("returns a reusable clamping function when value is omitted", () => {
    const clampToUnit = clamp(0, 1);
    expect(clampToUnit(-0.5)).toBe(0);
    expect(clampToUnit(0.5)).toBe(0.5);
    expect(clampToUnit(1.5)).toBe(1);
  });
});

describe("utils - random", () => {
  it("returns a number within [min, max] when given a range", () => {
    for (let i = 0; i < 50; i++) {
      const value = random(5, 10) as number;
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it("snaps to the nearest increment when snapIncrement is given", () => {
    for (let i = 0; i < 50; i++) {
      const value = random(0, 20, 5) as number;
      expect(value % 5).toBe(0);
    }
  });

  it("returns a generator function when returnFunction is true, producing a new value each call", () => {
    const gen = random(0, 100, undefined, true) as () => number;
    expect(typeof gen).toBe("function");
    const a = gen();
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(100);
  });

  it("picks a random element from an array", () => {
    const options = ["red", "green", "blue"];
    for (let i = 0; i < 20; i++) {
      expect(options).toContain(random(options));
    }
  });
});
