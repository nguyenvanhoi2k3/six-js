import { describe, expect, it } from "vitest";
import { composeTransform, getTransformCache, invalidateTransformCache, parseMatrixString, TransformCache } from "./transform-cache";

describe("parseMatrixString", () => {
  it("returns nothing for 'none' or empty", () => {
    expect(parseMatrixString("none")).toEqual({});
    expect(parseMatrixString("")).toEqual({});
  });

  it("decomposes an identity 2D matrix", () => {
    const result = parseMatrixString("matrix(1, 0, 0, 1, 0, 0)");
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.rotation).toBe(0);
    expect(result.scaleX).toBeCloseTo(1);
    expect(result.scaleY).toBeCloseTo(1);
  });

  it("decomposes translation", () => {
    const result = parseMatrixString("matrix(1, 0, 0, 1, 50, 100)");
    expect(result.x).toBe(50);
    expect(result.y).toBe(100);
  });

  it("decomposes a 90 degree rotation", () => {
    const result = parseMatrixString("matrix(0, 1, -1, 0, 0, 0)");
    expect(result.rotation).toBeCloseTo(90);
  });

  it("decomposes non-uniform scale", () => {
    const result = parseMatrixString("matrix(2, 0, 0, 3, 0, 0)");
    expect(result.scaleX).toBeCloseTo(2);
    expect(result.scaleY).toBeCloseTo(3);
  });

  it("reads translate x/y/z out of a matrix3d, defaulting rotation/scale to identity", () => {
    const values = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1];
    const result = parseMatrixString(`matrix3d(${values.join(",")})`);
    expect(result).toEqual({ x: 10, y: 20, z: 30 });
  });
});

describe("composeTransform", () => {
  const identity: TransformCache = {
    x: 0,
    y: 0,
    z: 0,
    xPercent: 0,
    yPercent: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
  };

  it("renders 'none' for the identity transform", () => {
    expect(composeTransform(identity, false)).toBe("none");
  });

  it("uses translate3d only when use3D is true", () => {
    const cache = { ...identity, x: 10, y: 20 };
    expect(composeTransform(cache, true)).toContain("translate3d(10px, 20px, 0px)");
    expect(composeTransform(cache, false)).toContain("translate(10px, 20px)");
    expect(composeTransform(cache, false)).not.toContain("translate3d");
  });

  it("only includes non-identity components", () => {
    const cache = { ...identity, rotation: 45 };
    const result = composeTransform(cache, false);
    expect(result).toBe("rotate(45deg)");
  });

  it("combines multiple components in a stable order", () => {
    const cache = { ...identity, x: 5, rotation: 10, scaleX: 2, scaleY: 2 };
    expect(composeTransform(cache, false)).toBe("translate(5px, 0px) rotate(10deg) scale(2, 2)");
  });
});

describe("getTransformCache", () => {
  it("returns identity defaults for an element with no existing transform", () => {
    const el = document.createElement("div");
    const cache = getTransformCache(el);
    expect(cache.x).toBe(0);
    expect(cache.scaleX).toBe(1);
  });

  it("returns the SAME cache object on repeated calls for the same element", () => {
    const el = document.createElement("div");
    const a = getTransformCache(el);
    a.x = 42;
    const b = getTransformCache(el);
    expect(b).toBe(a);
    expect(b.x).toBe(42);
  });

  it("gives different elements independent caches", () => {
    const elA = document.createElement("div");
    const elB = document.createElement("div");
    getTransformCache(elA).x = 1;
    expect(getTransformCache(elB).x).toBe(0);
  });

  it("resets to identity after invalidateTransformCache", () => {
    const el = document.createElement("div");
    getTransformCache(el).x = 99;
    invalidateTransformCache(el);
    expect(getTransformCache(el).x).toBe(0);
  });
});
