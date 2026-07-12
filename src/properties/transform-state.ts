import { readTransform } from "./transform-parser";

export interface TransformCache {
  x: number;
  y: number;
  z: number;
  xPercent: number;
  yPercent: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}

const IDENTITY: TransformCache = {
  x: 0,
  y: 0,
  z: 0,
  xPercent: 0,
  yPercent: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
};

const store = new WeakMap<HTMLElement, TransformCache>();

function createCache(target: HTMLElement): TransformCache {
  const existing = readTransform(target);

  return {
    ...IDENTITY,
    x: existing.x,
    y: existing.y,
    z: existing.z,
    rotate: existing.rotate,
    rotateX: existing.rotateX,
    rotateY: existing.rotateY,
    rotateZ: existing.rotateZ,
    scale: existing.scale,
    scaleX: existing.scaleX,
    scaleY: existing.scaleY,
    skewX: existing.skewX,
    skewY: existing.skewY,
  };
}

function getCache(target: HTMLElement): TransformCache {
  let cache = store.get(target);

  if (!cache) {
    cache = createCache(target);
    store.set(target, cache);
  }

  return cache;
}

export function getTransformValue(target: HTMLElement, key: keyof TransformCache): number {
  return getCache(target)[key];
}

export function setTransformValue(target: HTMLElement, key: keyof TransformCache, value: number): void {
  getCache(target)[key] = value;
}

export function buildTransformString(target: HTMLElement): string {
  const c = getCache(target);

  return (
    `translate(${c.xPercent}%, ${c.yPercent}%) ` +
    `translate3d(${c.x}px, ${c.y}px, ${c.z}px) ` +
    `rotate(${c.rotate}deg) rotateX(${c.rotateX}deg) rotateY(${c.rotateY}deg) rotateZ(${c.rotateZ}deg) ` +
    `scale(${c.scale}) scaleX(${c.scaleX}) scaleY(${c.scaleY}) ` +
    `skewX(${c.skewX}deg) skewY(${c.skewY}deg)`
  );
}
