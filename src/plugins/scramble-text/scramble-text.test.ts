import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrambleTextAnimation, scrambleText } from "./scramble-text";
import { OdometerAnimation } from "./odometer";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function rootNow(): number {
  return rootTimeline.totalTime() as number;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrambleTextAnimation", () => {
  it("reveals characters left-to-right in place, exactly matching the target text once complete", () => {
    const el = document.createElement("div");
    el.textContent = "AAAAA"; // same length as the target text, to isolate reveal from tweenLength
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 1, ease: "none" });

    anim.totalTime(0, true);
    expect(el.textContent).toHaveLength(5);
    expect([...el.textContent!].every((c) => UPPER.includes(c))).toBe(true); // fully scrambled, not the literal original text

    anim.totalTime(0.6, true);
    expect(el.textContent!.slice(0, 3)).toBe("HEL"); // round(5 * 0.6) = 3 already-correct characters
    expect(el.textContent).toHaveLength(5);

    anim.totalTime(1, true);
    expect(el.textContent).toBe("HELLO");
  });

  it("rightToLeft reveals from the end of the text instead of the start", () => {
    const el = document.createElement("div");
    el.textContent = "AAAAA";
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 1, ease: "none", rightToLeft: true });

    anim.totalTime(0.6, true);
    expect(el.textContent!.slice(-3)).toBe("LLO"); // last 3 chars of "HELLO" are already correct
    expect(el.textContent).toHaveLength(5);
  });

  it("tweenLength (default true) interpolates the displayed length between old and new text", () => {
    const el = document.createElement("div");
    el.textContent = "HI"; // length 2
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 2, ease: "none" }); // length 5

    anim.totalTime(0, true);
    expect(el.textContent).toHaveLength(2); // starts at the OLD length

    anim.totalTime(1, true); // halfway: round(2 + (5-2)*0.5) = 4
    expect(el.textContent).toHaveLength(4);
    expect(el.textContent!.slice(0, 3)).toBe("HEL"); // round(5*0.5) = 3 revealed chars fit within the 4 displayed

    anim.totalTime(2, true);
    expect(el.textContent).toBe("HELLO"); // ends at the NEW length
  });

  it("tweenLength: false snaps straight to the new text's length instead of interpolating", () => {
    const el = document.createElement("div");
    el.textContent = "HI";
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 1, ease: "none", tweenLength: false });

    anim.totalTime(0, true);
    expect(el.textContent).toHaveLength(5); // already at the new length, even at progress 0

    anim.totalTime(1, true);
    expect(el.textContent).toBe("HELLO");
  });

  it("revealDelay keeps the text fully scrambled until it elapses, then reveals over the rest of the duration", () => {
    const el = document.createElement("div");
    el.textContent = "AAAAA";
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 1, ease: "none", revealDelay: 0.5 });

    anim.totalTime(0.5, true);
    expect(el.textContent).not.toContain("H"); // extremely unlikely to coincidentally scramble to a leading "H", but assert the structural guarantee instead
    expect(el.textContent).toHaveLength(5);

    anim.totalTime(1, true); // reveal ramps 0->1 over the remaining 0.5s, so it's fully revealed by duration
    expect(el.textContent).toBe("HELLO");
  });

  it("defaults to reusing the target's current text when `text` is omitted", () => {
    const el = document.createElement("div");
    el.textContent = "STATIC";
    const anim = new ScrambleTextAnimation(el, { duration: 1, ease: "none" });

    anim.totalTime(1, true);
    expect(el.textContent).toBe("STATIC");
  });

  it("chars picks the scramble pool used for the not-yet-revealed portion", () => {
    const el = document.createElement("div");
    el.textContent = "0000000000";
    const anim = new ScrambleTextAnimation(el, { text: "0000000000", duration: 1, ease: "none", chars: "numeric" });

    anim.totalTime(0, true);
    expect([...el.textContent!].every((c) => "0123456789".includes(c))).toBe(true);
  });

  it("delimiter reveals word-by-word instead of character-by-character", () => {
    const el = document.createElement("div");
    el.textContent = "a b c";
    const anim = new ScrambleTextAnimation(el, { text: "one two three", duration: 1, ease: "none", delimiter: " " });

    anim.totalTime(0.4, true); // round(3 * 0.4) = 1 revealed word
    const words = el.textContent!.split(" ");
    expect(words[0]).toBe("one");
    expect(words).toHaveLength(3);

    anim.totalTime(1, true);
    expect(el.textContent).toBe("one two three");
  });

  it("newClass/oldClass wrap the revealed and scrambled portions in spans, escaping markup-unsafe characters", () => {
    const el = document.createElement("div");
    el.textContent = "aa";
    const anim = new ScrambleTextAnimation(el, { text: "<b>", duration: 0, newClass: "new" });

    anim.totalTime(0, true); // zero duration -> immediately fully revealed
    expect(el.innerHTML).toBe('<span class="new">&lt;b&gt;</span>');
  });

  it("<input>/<textarea> targets write to .value, ignoring newClass/oldClass (no markup possible in a form value)", () => {
    const input = document.createElement("input");
    input.value = "AAAAA";
    const anim = new ScrambleTextAnimation(input, { text: "HELLO", duration: 1, ease: "none", newClass: "new" });

    anim.totalTime(1, true);
    expect(input.value).toBe("HELLO");
  });

  it("re-randomizes the scrambled filler only once per scramble interval, not on every render call", () => {
    const el = document.createElement("div");
    el.textContent = "AAAAA";
    const anim = new ScrambleTextAnimation(el, { text: "HELLO", duration: 1, ease: "none" });
    const spy = vi.spyOn(Math, "random");

    anim.totalTime(0, true);
    const before = spy.mock.calls.length;

    anim.totalTime(0.01, true); // well within the same ~0.0667s (speed: 1) scramble interval
    expect(spy.mock.calls.length).toBe(before);

    anim.totalTime(0.2, true); // several intervals later
    expect(spy.mock.calls.length).toBeGreaterThan(before);
  });
});

describe("scrambleText()", () => {
  it("a single resolved target attaches directly to rootTimeline as a bare ScrambleTextAnimation", () => {
    const el = document.createElement("div");
    el.textContent = "AAAAA";
    document.body.appendChild(el);
    const t0 = rootNow();

    const anim = scrambleText(el, { text: "HELLO", duration: 1, ease: "none" });
    expect(anim).toBeInstanceOf(ScrambleTextAnimation);

    rootTimeline.totalTime(t0 + 1, true);
    expect(el.textContent).toBe("HELLO");

    document.body.removeChild(el);
  });

  it("mode: 'odometer' dispatches to OdometerAnimation instead", () => {
    const el = document.createElement("div");
    el.textContent = "HI";
    document.body.appendChild(el);

    const anim = scrambleText(el, { text: "HI", duration: 1, mode: "odometer" });
    expect(anim).toBeInstanceOf(OdometerAnimation);

    document.body.removeChild(el);
  });

  it("multiple resolved targets are grouped into one Timeline, staggered", () => {
    const container = document.createElement("div");
    const a = document.createElement("span");
    a.className = "word";
    a.textContent = "aa";
    const b = document.createElement("span");
    b.className = "word";
    b.textContent = "bb";
    container.appendChild(a);
    container.appendChild(b);
    document.body.appendChild(container);
    const t0 = rootNow();

    const group = scrambleText(".word", { text: "HI", duration: 1, ease: "none", stagger: 0.5 });
    expect(group).toBeInstanceOf(Timeline);
    expect((group as Timeline).getChildren()).toHaveLength(2);

    rootTimeline.totalTime(t0 + 1, true); // first has had 1s (done); second (delay 0.5) has had only 0.5s
    expect(a.textContent).toBe("HI");
    expect(b.textContent).not.toBe("HI");

    document.body.removeChild(container);
  });

  it("warns and returns a harmless empty Timeline when nothing resolves", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = scrambleText(".nope-does-not-exist", { duration: 1 });
    expect(result).toBeInstanceOf(Timeline);
    expect((result as Timeline).getChildren()).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });
});
