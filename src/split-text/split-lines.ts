import { createWrapper, WrapperConfig } from "./wrapper";

interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const EMPTY_BOUNDS: Bounds = { left: 0, top: 0, width: 0, height: 0 };

function findNextValidBounds(allBounds: Bounds[], startIndex: number): Bounds {
  let i = startIndex;
  while (++i < allBounds.length && allBounds[i] === EMPTY_BOUNDS);
  return allBounds[i] ?? EMPTY_BOUNDS;
}

function createLineWrapper(element: Element, nodes: ChildNode[], config: WrapperConfig, collection: HTMLElement[]): (start: number, end: number) => void {
  const lineWrapper = createWrapper("line", config, collection);
  const textAlign = window.getComputedStyle(element).textAlign || "left";

  return (start: number, end: number): void => {
    const newLine = lineWrapper("");
    newLine.style.textAlign = textAlign;
    element.insertBefore(newLine, nodes[start]);
    for (let idx = start; idx < end; idx++) newLine.appendChild(nodes[idx]);
    newLine.normalize();
  };
}

export function splitIntoLines(element: Element, config: WrapperConfig, collection: HTMLElement[]): void {
  const nodes = Array.from(element.childNodes);
  const wrapLine = createLineWrapper(element, nodes, config, collection);
  const toRemove: Element[] = [];
  const allBounds: Bounds[] = nodes.map((n) => (n.nodeType === Node.ELEMENT_NODE ? (n as Element).getBoundingClientRect() : EMPTY_BOUNDS));

  let lineStart = 0;
  let lastBounds: Bounds = EMPTY_BOUNDS;
  let i = 0;

  for (; i < nodes.length; i++) {
    const curNode = nodes[i];
    if (curNode.nodeType !== Node.ELEMENT_NODE) continue;

    if (curNode.nodeName === "BR") {
      if (!i || nodes[i - 1].nodeName !== "BR") {
        toRemove.push(curNode as Element);
        wrapLine(lineStart, i + 1);
      }
      lineStart = i + 1;
      lastBounds = findNextValidBounds(allBounds, i);
    } else {
      const curBounds = allBounds[i];
      if (i && curBounds.top > lastBounds.top && curBounds.left < lastBounds.left + lastBounds.width - 1) {
        wrapLine(lineStart, i);
        lineStart = i;
      }
      lastBounds = curBounds;
    }
  }

  if (lineStart < i) wrapLine(lineStart, i);
  toRemove.forEach((el) => el.parentNode?.removeChild(el));
}
