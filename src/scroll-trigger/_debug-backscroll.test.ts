import { describe, expect, it, vi } from "vitest";
import { six } from "../api/six";
import { ticker } from "../core/ticker";
import { invalidateReads } from "./observer";

describe("debug: isolate multi-word setup issue", () => {
  it("2 words, verbose diagnostics", () => {
    document.body.innerHTML = `
      <div id="container">
        <div id="track">
          <span class="w" id="w0">Lorem</span>
          <span class="w" id="w1">ipsum</span>
        </div>
      </div>
    `;
    const container = document.getElementById("container")!;
    const track = document.getElementById("track")!;
    const words = Array.from(document.querySelectorAll<HTMLElement>(".w"));

    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1000);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({ top: 800, left: 0, bottom: 900, right: 1000, width: 1000, height: 100, x: 0, y: 800, toJSON: () => ({}) });
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    invalidateReads();

    Object.defineProperty(track, "scrollWidth", { value: 5000, configurable: true });
    const naturalLefts = [1200, 1600];
    words.forEach((word, i) => {
      vi.spyOn(word, "getBoundingClientRect").mockImplementation(() => {
        const t = track.style.transform || "";
        const m = t.match(/translate(?:3d)?\(([-\d.]+)px/);
        const x = m ? parseFloat(m[1]) : 0;
        const left = naturalLefts[i] + x;
        console.log(`  [mock rect ${word.id}] track.transform="${t}" parsedX=${x} left=${left}`);
        return { top: 0, left, right: left + 80, bottom: 20, width: 80, height: 20, x: left, y: 0, toJSON: () => ({}) } as DOMRect;
      });
    });

    const distance = 5000 - 1000;
    console.log("distance =", distance);

    words.forEach((word) => six.set(word, { opacity: 0 }));
    words.forEach((word) => console.log("after set:", word.id, word.style.opacity));

    const scrollTween = six.to(track, {
      x: -distance,
      ease: "none",
      scrollTrigger: { trigger: container, start: "center center", end: `+=${distance}`, scrub: 1 },
    });

    console.log("scrollTween created, totalProgress=", scrollTween.totalProgress(), "totalDuration=", scrollTween.totalDuration());

    const wordTweens = words.map((word) => {
      const tw = six.to(word, {
        opacity: 1,
        duration: 0.5,
        ease: "none",
        scrollTrigger: { trigger: word, containerAnimation: scrollTween, horizontal: true, start: "left 70%" },
      });
      console.log("after six.to construction:", word.id, "opacity=", word.style.opacity, "tween.paused=", tw.paused(), "tween.totalProgress=", tw.totalProgress());
      return tw;
    });

    scrollTween.on("update", () => console.log("  >>> scrollTween 'update' event fired, progress now", scrollTween.totalProgress()));

    console.log("--- setting scrollTween.totalProgress(0.9) ---");
    scrollTween.totalProgress(0.9);
    console.log("scrollTween now at", scrollTween.totalProgress());
    words.forEach((w, i) => console.log(w.id, "opacity=", w.style.opacity, "tween.totalProgress=", wordTweens[i].totalProgress(), "tween.paused=", wordTweens[i].paused()));

    console.log("--- ticking 40x16ms ---");
    for (let i = 0; i < 40; i++) ticker.tick(16);
    words.forEach((w, i) => console.log(w.id, "opacity=", w.style.opacity, "tween.totalProgress=", wordTweens[i].totalProgress()));

    expect(words[0].style.opacity).toBe("1");
  });
});
