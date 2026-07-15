import { describe, expect, it } from "vitest";
import { PositionContext, resolvePosition } from "./position-parser";

function ctx(overrides: Partial<PositionContext> = {}): PositionContext {
  return {
    end: 10,
    prevStart: 2,
    prevEnd: 5,
    getLabel: (name) => (name === "mark" ? 3 : undefined),
    ...overrides,
  };
}

describe("resolvePosition", () => {
  it("defaults to the context's end/cursor when no position is given", () => {
    expect(resolvePosition(undefined, ctx())).toBe(10);
  });

  it("treats a number as an absolute position, clamped at 0", () => {
    expect(resolvePosition(4, ctx())).toBe(4);
    expect(resolvePosition(-4, ctx())).toBe(0);
  });

  it("resolves '<' to the previous child's start", () => {
    expect(resolvePosition("<", ctx())).toBe(2);
  });

  it("resolves '<+=1' / '<-=1' relative to the previous child's start", () => {
    expect(resolvePosition("<+=1", ctx())).toBe(3);
    expect(resolvePosition("<-=1", ctx())).toBe(1);
  });

  it("resolves '>' to the previous child's end", () => {
    expect(resolvePosition(">", ctx())).toBe(5);
  });

  it("resolves '>+=0.5' relative to the previous child's end", () => {
    expect(resolvePosition(">+=0.5", ctx())).toBeCloseTo(5.5);
  });

  it("resolves '+=1'/'-=1' relative to the timeline's current end", () => {
    expect(resolvePosition("+=1", ctx())).toBe(11);
    expect(resolvePosition("-=1", ctx())).toBe(9);
  });

  it("resolves a bare label name", () => {
    expect(resolvePosition("mark", ctx())).toBe(3);
  });

  it("resolves a label with a relative offset", () => {
    expect(resolvePosition("mark+=2", ctx())).toBe(5);
    expect(resolvePosition("mark-=1", ctx())).toBe(2);
  });

  it("warns and falls back to the current end for an unknown label", () => {
    expect(resolvePosition("nope", ctx())).toBe(10);
  });

  it("never returns a negative position even with a large negative offset", () => {
    expect(resolvePosition("<-=100", ctx())).toBe(0);
  });
});
