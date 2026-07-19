import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ticker, TickerListener } from "../../core/ticker";
import { getTransformCache } from "../../animate/transform-cache";
import { parallax, ParallaxController, ParallaxVars } from "./parallax";
import { TweenTarget } from "../../tween/tween";

/**
 * parallax() drives the real shared `ticker` directly (see parallax.ts's doc comment for why).
 * Capturing `ticker.add`'s callbacks - instead of letting them actually register for real rAF
 * dispatch - gives full deterministic control, same approach burst.test.ts uses. Unlike Burst's
 * closed-form physics, parallax's damping genuinely needs a nonzero `deltaMs` per tick to move at
 * all, so `fire()` here takes it as an explicit second argument.
 */
function captureTick(): (time: number, deltaMs: number) => void {
  const captured: TickerListener[] = [];
  vi.spyOn(ticker, "add").mockImplementation((cb) => {
    captured.push(cb);
    return cb;
  });
  vi.spyOn(ticker, "remove").mockImplementation((cb) => {
    const i = captured.indexOf(cb);
    if (i !== -1) captured.splice(i, 1);
  });
  return (time: number, deltaMs: number) => captured.forEach((cb) => cb(time, deltaMs, 0));
}

function mockViewport(width: number, height: number): void {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(height);
}

function fireMouseMove(clientX: number, clientY: number): void {
  window.dispatchEvent(new MouseEvent("mousemove", { clientX, clientY }));
}

function makeLayer(strength?: string): HTMLElement {
  const el = document.createElement("div");
  if (strength !== undefined) el.setAttribute("sx-parallax-strength", strength);
  document.body.appendChild(el);
  return el;
}

function readXY(transform: string): { x: number; y: number } {
  const match = /translate(?:3d)?\(([-\d.]+)px,\s*([-\d.]+)px/.exec(transform);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 };
}

// parallax() has no fixed duration and never self-terminates like burst() does (see parallax.ts's
// own doc comment) - a test that forgets to kill() a real (unmocked) instance would leave a live
// listener on the shared ticker/pointer singletons for the rest of the process. `create()` tracks
// every controller a test makes so `afterEach` can always kill() them, regardless of what the test
// itself asserts.
let fire: (time: number, deltaMs: number) => void;
let controllers: ParallaxController[];

function create(target: TweenTarget, vars?: ParallaxVars): ParallaxController {
  const controller = parallax(target, vars);
  controllers.push(controller);
  return controller;
}

describe("parallax", () => {
  beforeEach(() => {
    fire = captureTick();
    controllers = [];
  });

  afterEach(() => {
    controllers.forEach((c) => c.kill());
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders frame 0 synchronously at the base position when the pointer hasn't moved yet", () => {
    const el = makeLayer();
    create(el, { strength: 50 });

    expect(readXY(el.style.transform)).toEqual({ x: 0, y: 0 });
  });

  it("moves an element toward strength * pointer position over successive ticks, damped not instant", () => {
    mockViewport(1000, 1000);
    const el = makeLayer();

    create(el, { strength: 100, lerp: 0.1 });
    fireMouseMove(1000, 500); // nx=1, ny=0 -> targetX = 100

    fire(0, 16);
    const { x: x1 } = readXY(el.style.transform);
    expect(x1).toBeGreaterThan(0);
    expect(x1).toBeLessThan(100); // damped - hasn't snapped to the target yet

    fire(0, 16);
    const { x: x2 } = readXY(el.style.transform);
    expect(x2).toBeGreaterThan(x1);
    expect(x2).toBeLessThan(100);
  });

  it("stops writing style.transform once an element has settled on its target (performance guard)", () => {
    mockViewport(1000, 1000);
    const el = makeLayer("50");

    create(el, { lerp: 0 }); // instant follow - reaches the target in a single tick
    fireMouseMove(1000, 500); // nx=1 -> target = 50
    fire(0, 16);
    expect(readXY(el.style.transform).x).toBeCloseTo(50);

    const setSpy = vi.spyOn(el.style, "transform", "set");
    fire(0, 16); // pointer hasn't moved - element is already sitting on its target
    fire(0, 16);
    fire(0, 16);

    expect(setSpy).not.toHaveBeenCalled();
  });

  it("resumes writing style.transform as soon as the cursor moves again after settling", () => {
    mockViewport(1000, 1000);
    const el = makeLayer("50");

    create(el, { lerp: 0 });
    fireMouseMove(1000, 500); // nx=1 -> target = 50
    fire(0, 16);
    expect(readXY(el.style.transform).x).toBeCloseTo(50);

    fireMouseMove(0, 500); // nx=-1 -> target = -50
    fire(0, 16);
    expect(readXY(el.style.transform).x).toBeCloseTo(-50);
  });

  it("reads sx-parallax-strength per element, overriding vars.strength", () => {
    mockViewport(1000, 1000);
    const weak = makeLayer("10");
    const strong = makeLayer("80");

    // lerp: 0 = instant follow, so a single tick already lands exactly on the target - easier to assert exact values.
    create([weak, strong], { strength: 30, lerp: 0 });
    fireMouseMove(1000, 500); // nx=1
    fire(0, 16);

    expect(readXY(weak.style.transform).x).toBeCloseTo(10);
    expect(readXY(strong.style.transform).x).toBeCloseTo(80);
  });

  it("negative strength moves opposite the cursor", () => {
    mockViewport(1000, 1000);
    const el = makeLayer("-40");

    create(el, { lerp: 0 });
    fireMouseMove(1000, 500); // nx=1
    fire(0, 16);

    expect(readXY(el.style.transform).x).toBeCloseTo(-40);
  });

  it("composes additively with a pre-existing transform instead of overwriting it", () => {
    // jsdom's getComputedStyle doesn't normalize an inline `translate()` string into `matrix()`
    // form, so transform-cache.ts's own matrix-string parsing can't pick it up from a style
    // string in this test environment - seed the shared cache directly instead, same pattern
    // motion-path.test.ts's own composability check uses.
    mockViewport(1000, 1000);
    const el = makeLayer("50");
    getTransformCache(el).x = 20;

    create(el, { lerp: 0 });
    fireMouseMove(1000, 500); // nx=1
    fire(0, 16);

    expect(readXY(el.style.transform).x).toBeCloseTo(70); // 20px pre-existing base + 50px offset
  });

  it("kill() resets the element back to its pre-parallax base transform, not left mid-offset", () => {
    mockViewport(1000, 1000);
    const el = makeLayer("50");

    const controller = create(el, { lerp: 0 });
    fireMouseMove(1000, 500);
    fire(0, 16);
    expect(readXY(el.style.transform).x).toBeCloseTo(50);

    controller.kill();
    expect(readXY(el.style.transform).x).toBeCloseTo(0);
  });

  it("kill() stops all future rendering", () => {
    mockViewport(1000, 1000);
    const el = makeLayer("50");

    const controller = create(el, { lerp: 0 });
    controller.kill();

    fireMouseMove(1000, 500);
    fire(0, 16);

    expect(readXY(el.style.transform).x).toBeCloseTo(0);
  });

  it("shares one native mousemove listener across simultaneous instances; only the last kill() detaches it", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const elA = makeLayer();
    const elB = makeLayer();

    const a = create(elA);
    const b = create(elB);

    expect(addSpy.mock.calls.filter((c) => c[0] === "mousemove")).toHaveLength(1);

    a.kill();
    expect(removeSpy.mock.calls.filter((c) => c[0] === "mousemove")).toHaveLength(0);

    b.kill();
    expect(removeSpy.mock.calls.filter((c) => c[0] === "mousemove")).toHaveLength(1);
  });

  it("warns and returns a safely-callable no-op controller when no target resolves", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const controller = create(".does-not-exist");

    expect(warnSpy).toHaveBeenCalled();
    expect(() => controller.kill()).not.toThrow();
  });
});
