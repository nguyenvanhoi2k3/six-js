export interface AutoResplitHandle {
  disconnect(): void;
}

export function watchForResplit(elements: HTMLElement[], resplit: () => void): AutoResplitHandle {
  const widths = new Map<HTMLElement, number>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const checkWidths = (): void => {
    for (const el of elements) {
      const w = el.offsetWidth;
      if (widths.get(el) !== w) {
        widths.set(el, w);
        resplit();
        return;
      }
    }
  };

  const observer =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(checkWidths, 200);
        })
      : undefined;

  elements.forEach((el) => {
    widths.set(el, el.offsetWidth);
    observer?.observe(el);
  });

  const onFontsLoaded = (): void => resplit();
  const fonts = typeof document !== "undefined" ? document.fonts : undefined;
  fonts?.addEventListener("loadingdone", onFontsLoaded);

  return {
    disconnect(): void {
      clearTimeout(timer);
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", onFontsLoaded);
    },
  };
}
