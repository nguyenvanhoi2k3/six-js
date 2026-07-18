import { describe, expect, it } from "vitest";
import { OdometerAnimation } from "./odometer";

function translateY(el: HTMLElement): number {
  const m = /translateY\((-?[\d.]+)px\)/.exec(el.style.transform);
  return m ? parseFloat(m[1]) : NaN;
}

function reels(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(".six-odometer-reel"));
}

describe("OdometerAnimation", () => {
  it("builds one masked reel per non-whitespace character, each ending on the correct final character", () => {
    const el = document.createElement("div");
    el.textContent = "AB";
    const anim = new OdometerAnimation(el, { text: "HI", duration: 1, reelSize: 4 });
    void anim;

    const reelEls = reels(el);
    expect(reelEls).toHaveLength(2);

    for (const [i, reel] of reelEls.entries()) {
      const lines = Array.from(reel.children) as HTMLElement[];
      expect(lines).toHaveLength(5); // reelSize (4 random) + 1 final
      expect(lines[lines.length - 1].textContent).toBe("HI"[i]); // last line is always the correct final character
    }
  });

  it("renders whitespace as a plain space with no reel", () => {
    const el = document.createElement("div");
    el.textContent = "x";
    const anim = new OdometerAnimation(el, { text: "A B", duration: 1 });
    void anim;

    expect(reels(el)).toHaveLength(2); // "A" and "B" get reels, the space doesn't
    const plain = Array.from(el.children).filter((c) => !c.classList.contains("six-odometer-char"));
    expect(plain).toHaveLength(1);
    expect(plain[0].textContent).toBe(" ");
  });

  it("every reel starts at translateY(0) and lands at -maxOffset once fully complete", () => {
    const el = document.createElement("div");
    el.textContent = "x";
    const anim = new OdometerAnimation(el, { text: "AB", duration: 1, ease: "none", reelSize: 4 });

    anim.totalTime(0, true);
    for (const reel of reels(el)) expect(translateY(reel)).toBe(0);

    anim.totalTime(1, true);
    const landed = reels(el).map(translateY);
    expect(landed[0]).toBeLessThan(0);
    expect(landed[0]).toBeCloseTo(landed[1]); // both fully landed at the same (negative) maxOffset by the end
  });

  it("charStagger makes later characters lag behind earlier ones mid-animation", () => {
    const el = document.createElement("div");
    el.textContent = "x";
    const anim = new OdometerAnimation(el, { text: "AB", duration: 2, ease: "none", charStagger: 0.5 });

    anim.totalTime(1, true); // halfway through the overall duration
    const [first, second] = reels(el).map(translateY);
    // both have moved, but the second (delayed) character hasn't traveled as far yet
    expect(first).toBeLessThan(0);
    expect(second).toBeLessThan(0);
    expect(Math.abs(second)).toBeLessThan(Math.abs(first));
  });

  it("rightToLeft reverses which character lands first", () => {
    const el = document.createElement("div");
    el.textContent = "x";
    const anim = new OdometerAnimation(el, { text: "AB", duration: 2, ease: "none", charStagger: 0.5, rightToLeft: true });

    anim.totalTime(1, true);
    const [first, second] = reels(el).map(translateY);
    // rightToLeft: the FIRST character (index 0) is now the one that lags
    expect(Math.abs(first)).toBeLessThan(Math.abs(second));
  });

  it("all reels finish together at the end of duration regardless of charStagger", () => {
    const el = document.createElement("div");
    el.textContent = "x";
    const anim = new OdometerAnimation(el, { text: "ABC", duration: 2, ease: "none", charStagger: 0.5 });

    anim.totalTime(2, true);
    const values = reels(el).map(translateY);
    expect(values[0]).toBeCloseTo(values[1]);
    expect(values[1]).toBeCloseTo(values[2]);
  });

  it("defaults to reusing the target's current text when `text` is omitted", () => {
    const el = document.createElement("div");
    el.textContent = "HI";
    const anim = new OdometerAnimation(el, { duration: 1 });
    void anim;

    const reelEls = reels(el);
    expect(reelEls.map((r) => r.lastElementChild?.textContent)).toEqual(["H", "I"]);
  });
});
