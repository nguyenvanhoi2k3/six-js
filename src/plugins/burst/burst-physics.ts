/**
 * Angle convention: 0deg points straight up, increasing clockwise (screen-y-down coordinates) -
 * so a full radial burst is `spread: [0, 360]`, and a narrow upward cone (a directional launch)
 * is something like `spread: [-45, 45]`. `magnitude` is a plain scalar - callers use this both to
 * turn an angle+distance into a displacement and an angle+speed into a velocity vector, since the
 * geometry is identical either way.
 */
export function pointOnCircle(angleDeg: number, magnitude: number): { dx: number; dy: number } {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    dx: magnitude * Math.sin(angleRad),
    dy: -magnitude * Math.cos(angleRad),
  };
}

/**
 * Real projectile motion: constant horizontal velocity, constant downward acceleration (gravity)
 * on the vertical axis - a single continuous curve, not two eased segments stitched together at
 * an arbitrary "burst distance" (the earlier Tween-based implementation did that and visibly
 * kinked: x-velocity eased to a dead stop at the phase boundary instead of drifting continuously,
 * which read as choppy/unnatural). `t`/`gravity` share whatever time unit the caller uses
 * (burst.ts uses seconds throughout). Pure and DOM-free so the curve itself is unit-testable
 * without a browser.
 */
export function projectilePosition(vx: number, vy: number, gravity: number, t: number): { x: number; y: number } {
  return {
    x: vx * t,
    y: vy * t + 0.5 * gravity * t * t,
  };
}
