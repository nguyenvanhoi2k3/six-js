export type SvgShapeInput = Element | string;

const GEOMETRY_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);

/**
 * Tag-based, not `instanceof SVGGeometryElement` - jsdom (the test environment) doesn't define
 * that global at all, so an `instanceof` check would throw a ReferenceError the moment a test
 * imports this module, not just fail. A tag check works identically in a real browser and is
 * exactly what every other geometry helper here needs anyway (deciding how to build a `d` string).
 */
export function isGeometryElement(el: Element): boolean {
  return GEOMETRY_TAGS.has(el.tagName.toLowerCase());
}

function pathFromD(d: string): Element {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  return path;
}

/**
 * Resolves shape input into a live geometry element - an existing element is used as-is; a CSS
 * selector string that actually resolves to a geometry-capable element in the document uses that
 * match; anything else (including a syntactically invalid selector, e.g. raw path data starting
 * with "M") is treated as literal SVG path `d` data and materialized into a detached `<path>`,
 * matching GSAP's MotionPathPlugin own support for a raw "d" string with no path element required
 * at all. Per spec, `getTotalLength`/`getPointAtLength` work on a detached element the same as an
 * attached one in every evergreen browser - deliberately never appended to the DOM.
 */
export function resolveGeometry(input: SvgShapeInput): Element {
  if (typeof input !== "string") return input;
  try {
    const found = document.querySelector(input);
    if (found && isGeometryElement(found)) return found;
  } catch {
    // not a syntactically valid CSS selector - fall through to treating it as raw path data
  }
  return pathFromD(input);
}

// Standard circle/ellipse -> 4-arc cubic-bezier approximation constant: 4*(sqrt(2)-1)/3.
const KAPPA = 0.5522847498307936;

function ellipseToPath(cx: number, cy: number, rx: number, ry: number): string {
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  return [
    `M${cx - rx},${cy}`,
    `C${cx - rx},${cy - ky} ${cx - kx},${cy - ry} ${cx},${cy - ry}`,
    `C${cx + kx},${cy - ry} ${cx + rx},${cy - ky} ${cx + rx},${cy}`,
    `C${cx + rx},${cy + ky} ${cx + kx},${cy + ry} ${cx},${cy + ry}`,
    `C${cx - kx},${cy + ry} ${cx - rx},${cy + ky} ${cx - rx},${cy}`,
    "Z",
  ].join(" ");
}

function pointsToPath(pointsAttr: string, close: boolean): string {
  const nums = pointsAttr.trim().split(/[\s,]+/).map(Number);
  let d = "";
  for (let i = 0; i + 1 < nums.length; i += 2) {
    d += `${i === 0 ? "M" : "L"}${nums[i]},${nums[i + 1]} `;
  }
  return close ? `${d.trim()} Z` : d.trim();
}

/**
 * Converts any supported geometry element's shape into an equivalent `<path>` `d` string, so
 * draw/morph can operate uniformly on path data regardless of the source tag - a `<path>` itself
 * is returned as-is (its own `d`), everything else is expressed as an equivalent path.
 */
export function shapeToPath(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const num = (name: string): number => parseFloat(el.getAttribute(name) ?? "") || 0;

  switch (tag) {
    case "path":
      return el.getAttribute("d") ?? "";
    case "circle": {
      const r = num("r");
      return ellipseToPath(num("cx"), num("cy"), r, r);
    }
    case "ellipse":
      return ellipseToPath(num("cx"), num("cy"), num("rx"), num("ry"));
    case "rect": {
      const x = num("x");
      const y = num("y");
      const w = num("width");
      const h = num("height");
      const hasRx = el.hasAttribute("rx");
      const hasRy = el.hasAttribute("ry");
      let rx = Math.min(hasRx ? num("rx") : hasRy ? num("ry") : 0, w / 2);
      let ry = Math.min(hasRy ? num("ry") : hasRx ? num("rx") : 0, h / 2);
      if (!rx && !ry) return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
      return (
        `M${x + rx},${y} H${x + w - rx} A${rx},${ry} 0 0 1 ${x + w},${y + ry} ` +
        `V${y + h - ry} A${rx},${ry} 0 0 1 ${x + w - rx},${y + h} H${x + rx} ` +
        `A${rx},${ry} 0 0 1 ${x},${y + h - ry} V${y + ry} A${rx},${ry} 0 0 1 ${x + rx},${y} Z`
      );
    }
    case "line":
      return `M${num("x1")},${num("y1")} L${num("x2")},${num("y2")}`;
    case "polyline":
      return pointsToPath(el.getAttribute("points") ?? "", false);
    case "polygon":
      return pointsToPath(el.getAttribute("points") ?? "", true);
    default:
      return el.getAttribute("d") ?? "";
  }
}
