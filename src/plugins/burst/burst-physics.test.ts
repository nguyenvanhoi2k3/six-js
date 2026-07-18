import { describe, expect, it } from "vitest";
import { pointOnCircle, projectilePosition } from "./burst-physics";

describe("pointOnCircle", () => {
  it("0deg points straight up (negative y, zero x)", () => {
    const { dx, dy } = pointOnCircle(0, 100);
    expect(dx).toBeCloseTo(0);
    expect(dy).toBeCloseTo(-100);
  });

  it("90deg points right (positive x, zero y)", () => {
    const { dx, dy } = pointOnCircle(90, 100);
    expect(dx).toBeCloseTo(100);
    expect(dy).toBeCloseTo(0);
  });

  it("180deg points down (zero x, positive y)", () => {
    const { dx, dy } = pointOnCircle(180, 100);
    expect(dx).toBeCloseTo(0);
    expect(dy).toBeCloseTo(100);
  });

  it("270deg points left (negative x, zero y)", () => {
    const { dx, dy } = pointOnCircle(270, 100);
    expect(dx).toBeCloseTo(-100);
    expect(dy).toBeCloseTo(0);
  });

  it("scales linearly with magnitude", () => {
    const half = pointOnCircle(45, 50);
    const full = pointOnCircle(45, 100);
    expect(full.dx).toBeCloseTo(half.dx * 2);
    expect(full.dy).toBeCloseTo(half.dy * 2);
  });
});

describe("projectilePosition", () => {
  it("x is pure constant-velocity motion (no horizontal deceleration)", () => {
    const p1 = projectilePosition(100, 0, 900, 0.5);
    const p2 = projectilePosition(100, 0, 900, 1.0);
    expect(p1.x).toBeCloseTo(50);
    expect(p2.x).toBeCloseTo(100);
    expect(p2.x).toBeCloseTo(p1.x * 2); // constant vx -> x scales linearly with t
  });

  it("position at t=0 is exactly the origin", () => {
    const { x, y } = projectilePosition(120, -200, 650, 0);
    expect(x).toBe(0);
    expect(y).toBe(0);
  });

  it("matches the closed-form kinematics equation y = vy*t + 0.5*g*t^2", () => {
    const vy = -180;
    const g = 700;
    const t = 0.42;
    const { y } = projectilePosition(0, vy, g, t);
    expect(y).toBeCloseTo(vy * t + 0.5 * g * t * t);
  });

  it("a straight-up launch decelerates continuously (no kink at any point)", () => {
    const vy = -300;
    const g = 900;
    const samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => projectilePosition(0, vy, g, t).y);
    const velocities = samples.slice(1).map((y, i) => (y - samples[i]) / 0.1);
    for (let i = 1; i < velocities.length; i++) {
      expect(velocities[i]).toBeGreaterThan(velocities[i - 1]); // vertical velocity increases smoothly (gravity), never jumps
    }
  });

  it("zero initial velocity falls purely under gravity", () => {
    const { x, y } = projectilePosition(0, 0, 1000, 1);
    expect(x).toBe(0);
    expect(y).toBeCloseTo(500);
  });
});
