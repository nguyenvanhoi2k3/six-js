// src/properties/transform-parser.ts

export interface TransformValues {
  x: number;
  y: number;
  z: number;
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

const IDENTITY: TransformValues = {
  x: 0,
  y: 0,
  z: 0,
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

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Đọc transform hiện tại của phần tử từ computed style, decompose ra
 * x/y/z/rotate/scale. Dùng cho to()/from() để biết "điểm bắt đầu thật"
 * thay vì luôn giả định 0.
 *
 * Giới hạn đã biết:
 * - skewX/skewY không decompose được từ matrix (luôn trả 0) — CSS matrix
 *   không tách biệt rõ skew khỏi scale/rotate, cần lưu trạng thái riêng
 *   nếu sau này cần track skew chính xác.
 * - "scale" (uniform) trả về scaleX khi scaleX !== scaleY.
 */
export function readTransform(target: HTMLElement): TransformValues {
  const computed = window.getComputedStyle(target).transform;

  if (!computed || computed === "none") {
    return { ...IDENTITY };
  }

  if (computed.startsWith("matrix3d")) {
    return parseMatrix3d(computed);
  }

  return parseMatrix2d(computed);
}

function parseMatrix2d(value: string): TransformValues {
  const match = value.match(/matrix\(([^)]+)\)/);

  if (!match) return { ...IDENTITY };

  const parts = match[1].split(",").map((n) => parseFloat(n.trim()));
  const [a, b, c, d, tx, ty] = parts;

  const scaleX = Math.sqrt(a * a + b * b);
  const scaleY = Math.sqrt(c * c + d * d);
  const rotate = Math.atan2(b, a) * RAD_TO_DEG;

  return {
    x: tx,
    y: ty,
    z: 0,
    rotate,
    rotateX: 0,
    rotateY: 0,
    rotateZ: rotate,
    scale: scaleX,
    scaleX,
    scaleY,
    skewX: 0,
    skewY: 0,
  };
}

function parseMatrix3d(value: string): TransformValues {
  const match = value.match(/matrix3d\(([^)]+)\)/);

  if (!match) return { ...IDENTITY };

  const m = match[1].split(",").map((n) => parseFloat(n.trim()));

  // CSS matrix3d liệt kê theo cột: m11,m12,m13,m14, m21,m22,m23,m24, m31,m32,m33,m34, m41,m42,m43,m44
  const m11 = m[0],
    m12 = m[1],
    m13 = m[2];
  const m21 = m[4],
    m22 = m[5],
    m23 = m[6];
  const m31 = m[8],
    m32 = m[9],
    m33 = m[10];
  const m41 = m[12],
    m42 = m[13],
    m43 = m[14];

  const scaleX = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  const scaleY = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  const scaleZ = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

  const rotateZ = Math.atan2(m12, m11) * RAD_TO_DEG;
  const rotateY =
    Math.atan2(-m13, Math.sqrt(m23 * m23 + m33 * m33)) * RAD_TO_DEG;
  const rotateX = Math.atan2(m23, m33) * RAD_TO_DEG;

  return {
    x: m41,
    y: m42,
    z: m43,
    rotate: rotateZ,
    rotateX,
    rotateY,
    rotateZ,
    scale: scaleX,
    scaleX,
    scaleY,
    skewX: 0,
    skewY: 0,
  };
}
