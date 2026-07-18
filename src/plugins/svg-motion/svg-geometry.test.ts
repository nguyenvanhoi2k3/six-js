import { describe, expect, it } from "vitest";
import { isGeometryElement, resolveGeometry, shapeToPath } from "./svg-geometry";

const SVG_NS = "http://www.w3.org/2000/svg";

function svg(tag: string, attrs: Record<string, string> = {}): Element {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

describe("isGeometryElement", () => {
  it("recognizes every supported shape tag", () => {
    for (const tag of ["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]) {
      expect(isGeometryElement(svg(tag))).toBe(true);
    }
  });

  it("rejects non-geometry elements", () => {
    expect(isGeometryElement(svg("g"))).toBe(false);
    expect(isGeometryElement(document.createElement("div"))).toBe(false);
  });
});

describe("resolveGeometry", () => {
  it("returns an existing element as-is", () => {
    const path = svg("path", { d: "M0,0 L1,1" });
    expect(resolveGeometry(path)).toBe(path);
  });

  it("resolves a selector that matches a geometry element in the document", () => {
    const container = document.createElementNS(SVG_NS, "svg");
    const path = svg("path", { id: "my-path", d: "M0,0 L1,1" });
    container.appendChild(path);
    document.body.appendChild(container);

    expect(resolveGeometry("#my-path")).toBe(path);

    document.body.removeChild(container);
  });

  it("falls back to treating the string as raw path data when it doesn't resolve to a geometry element", () => {
    const el = resolveGeometry("M0,0 L100,100");
    expect(el.tagName.toLowerCase()).toBe("path");
    expect(el.getAttribute("d")).toBe("M0,0 L100,100");
    expect(el.parentNode).toBeNull(); // deliberately never appended to the DOM
  });

  it("falls back to raw path data when the selector syntax itself is invalid", () => {
    const el = resolveGeometry("123-not-a-selector");
    expect(el.getAttribute("d")).toBe("123-not-a-selector");
  });
});

describe("shapeToPath", () => {
  it("returns a path's own d attribute unchanged", () => {
    expect(shapeToPath(svg("path", { d: "M1,2 L3,4" }))).toBe("M1,2 L3,4");
  });

  it("converts a circle into a 4-arc bezier approximation starting at its leftmost point", () => {
    const d = shapeToPath(svg("circle", { cx: "10", cy: "10", r: "5" }));
    expect(d.startsWith("M5,10")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  it("converts an ellipse the same way, using independent rx/ry", () => {
    const d = shapeToPath(svg("ellipse", { cx: "0", cy: "0", rx: "10", ry: "5" }));
    expect(d.startsWith("M-10,0")).toBe(true);
  });

  it("converts a plain rect (no radius) into a 4-line closed path", () => {
    const d = shapeToPath(svg("rect", { x: "0", y: "0", width: "10", height: "20" }));
    expect(d).toBe("M0,0 H10 V20 H0 Z");
  });

  it("converts a rounded rect into an arc-cornered path", () => {
    const d = shapeToPath(svg("rect", { x: "0", y: "0", width: "10", height: "10", rx: "2" }));
    expect(d).toContain("A2,2 0 0 1");
  });

  it("converts a line into a two-point path", () => {
    expect(shapeToPath(svg("line", { x1: "0", y1: "0", x2: "5", y2: "5" }))).toBe("M0,0 L5,5");
  });

  it("converts a polyline into an open path", () => {
    const d = shapeToPath(svg("polyline", { points: "0,0 5,5 10,0" }));
    expect(d).toBe("M0,0 L5,5 L10,0");
  });

  it("converts a polygon into a closed path", () => {
    const d = shapeToPath(svg("polygon", { points: "0,0 5,5 10,0" }));
    expect(d).toBe("M0,0 L5,5 L10,0 Z");
  });
});
