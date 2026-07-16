import type { PropertyTrack } from "./property-track";
import type { Tween } from "./tween";

const owners = new WeakMap<Element, Map<string, Tween>>();

function ownerMapFor(target: Element): Map<string, Tween> {
  let map = owners.get(target);
  if (!map) {
    map = new Map();
    owners.set(target, map);
  }
  return map;
}

export function applyOverwrite(tween: Tween, mode: boolean | "auto" | undefined, tracks: readonly PropertyTrack[]): void {
  const toKill = new Set<Tween>();

  for (const track of tracks) {
    const map = ownerMapFor(track.target);
    const owner = map.get(track.prop);
    if (mode && owner && owner !== tween) {
      if (mode === true) toKill.add(owner);
      else owner._dropTrack(track.target, track.prop);
    }
    map.set(track.prop, tween);
  }

  for (const owner of toKill) owner.kill();
}
