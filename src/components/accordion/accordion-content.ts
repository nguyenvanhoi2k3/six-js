// six-js\src\components\accordion\accordion-content.ts
import { SafeHTMLElement } from "../../core/safe-element";

export class SxAccordionContent extends SafeHTMLElement {
  private innerEl: HTMLDivElement | null = null;
  private targetOpen = false;
  private pendingTimeout: number | null = null;
  private pendingDone: (() => void) | null = null;

  connectedCallback() {
    // Padding must live on the generated inner wrapper, never on the host - if a consumer's CSS
    // put padding directly on sx-accordion-content, the box could never truly reach height:0,
    // and the collapse animation would visibly stop short instead of fully closing.
    if (!this.innerEl) {
      const inner = document.createElement("div");
      inner.className = "sx-accordion-content-inner";
      while (this.firstChild) inner.appendChild(this.firstChild);
      this.appendChild(inner);
      this.innerEl = inner;
    }

    // role="region" is deliberately NOT applied by default - on an accordion with many items it
    // creates landmark clutter for screen readers navigating by region; a consumer who wants it
    // for a small/critical accordion can add role="region" themselves (untouched either way -
    // sx-accordion-item sets aria-labelledby regardless of whether a role is present).
    this.addEventListener("transitionend", this.onTransitionEnd);
  }

  disconnectedCallback() {
    this.removeEventListener("transitionend", this.onTransitionEnd);
    this.clearPending();
  }

  private clearPending(): void {
    if (this.pendingTimeout !== null) {
      window.clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    this.pendingDone = null;
  }

  private runPendingOnce(): void {
    const done = this.pendingDone;
    this.clearPending();
    done?.();
  }

  private onTransitionEnd = (e: TransitionEvent): void => {
    if (e.target !== this || e.propertyName !== "height") return;
    this.runPendingOnce();
  };

  private transitionDurationMs(): number {
    const raw = getComputedStyle(this).transitionDuration.split(",");
    const values = raw.map((s) => parseFloat(s) * 1000).filter((n) => Number.isFinite(n));
    return values.length ? Math.max(...values) : 0;
  }

  private schedule(onSettled: () => void): void {
    this.pendingDone = onSettled;
    const duration = this.transitionDurationMs();
    // transitionend is the real signal; this timeout is only a safety net for a transition that
    // for some reason never fires it (declared duration overridden away, tab backgrounded, etc.)
    // - whichever fires first wins, the other is cleared by runPendingOnce()/clearPending().
    this.pendingTimeout = window.setTimeout(() => this.runPendingOnce(), duration + 50);
  }

  /** Applies open/closed state immediately, with no transition - for first paint only. */
  public setInitialState(open: boolean): void {
    this.clearPending();
    this.targetOpen = open;
    if (open) {
      this.removeAttribute("inert");
      this.removeAttribute("aria-hidden");
      this.style.height = "auto";
    } else {
      this.setAttribute("inert", "");
      this.setAttribute("aria-hidden", "true");
      this.style.height = "0px";
    }
  }

  public expand(onComplete?: () => void): void {
    this.clearPending();
    this.targetOpen = true;
    this.removeAttribute("inert");
    this.removeAttribute("aria-hidden");

    // Classic (and only reliable, cross-browser) height-from-0 transition trick: pin the CURRENT
    // rendered height as an explicit value first (reading it also flushes layout), force one more
    // flush so the browser commits that as a real prior frame, then write the real target - two
    // writes to the same property in the same task would otherwise get coalesced with no
    // transition at all.
    const startPx = this.getBoundingClientRect().height;
    this.style.height = `${startPx}px`;
    void this.offsetHeight;
    this.style.height = `${this.scrollHeight}px`;

    this.schedule(() => {
      // Only settle to auto if nothing re-toggled us closed again in the meantime.
      if (this.targetOpen) this.style.height = "auto";
      onComplete?.();
    });
  }

  public collapse(onComplete?: () => void): void {
    this.clearPending();
    this.targetOpen = false;
    this.setAttribute("inert", "");
    this.setAttribute("aria-hidden", "true");

    const startPx = this.getBoundingClientRect().height;
    this.style.height = `${startPx}px`;
    void this.offsetHeight;
    this.style.height = "0px";

    this.schedule(() => {
      onComplete?.();
    });
  }
}
