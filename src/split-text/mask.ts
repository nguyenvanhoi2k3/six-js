export function applyMask(elements: HTMLElement[]): HTMLElement[] {
  return elements.map((el) => {
    const maskEl = el.cloneNode(false) as HTMLElement;
    el.replaceWith(maskEl);
    maskEl.appendChild(el);
    if (el.className) {
      maskEl.className = el.className
        .trim()
        .split(/\s+/)
        .map((c) => `${c}-mask`)
        .join(" ");
    }
    maskEl.style.overflow = "clip";
    return maskEl;
  });
}
