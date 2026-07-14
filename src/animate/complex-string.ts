import { formatColor, interpolateColor, parseColor, RGBA } from "./color";

type Token = { type: "number"; value: number; unit: string } | { type: "color"; value: RGBA };

const TOKEN_RE = /#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(?:[a-z%]+)?/gi;

function classify(raw: string): Token {
  if (raw[0] === "#" || /^(rgba?|hsla?)\(/i.test(raw)) {
    return { type: "color", value: parseColor(raw) };
  }
  const match = raw.match(/^(-?\d*\.?\d+)([a-z%]*)$/i)!;
  return { type: "number", value: parseFloat(match[1]), unit: match[2] };
}

interface Split {
  literals: string[];
  tokens: Token[];
}

function split(str: string): Split {
  const tokens: Token[] = [];
  const literals: string[] = [];
  let lastIndex = 0;

  for (const match of str.matchAll(TOKEN_RE)) {
    literals.push(str.slice(lastIndex, match.index));
    tokens.push(classify(match[0]));
    lastIndex = match.index! + match[0].length;
  }
  literals.push(str.slice(lastIndex));

  return { literals, tokens };
}

/** Whether `a` and `b` have the same sequence of number/color tokens, so they can be smoothly interpolated. */
export function canInterpolateComplex(a: string, b: string): boolean {
  const ta = split(a).tokens;
  const tb = split(b).tokens;
  return ta.length === tb.length && ta.every((t, i) => t.type === tb[i].type);
}

function renderToken(startToken: Token | undefined, endToken: Token, t: number): string {
  if (!startToken || startToken.type !== endToken.type) {
    const chosen = t >= 1 ? endToken : startToken ?? endToken;
    return chosen.type === "color" ? formatColor(chosen.value) : `${chosen.value}${chosen.unit}`;
  }

  if (endToken.type === "color") {
    return formatColor(interpolateColor((startToken as { type: "color"; value: RGBA }).value, endToken.value, t));
  }

  const startNum = (startToken as { type: "number"; value: number; unit: string }).value;
  const value = startNum + (endToken.value - startNum) * t;
  const unit = endToken.unit || (startToken as { type: "number"; value: number; unit: string }).unit;
  return `${Math.round(value * 10000) / 10000}${unit}`;
}

/** Interpolates two structurally-compatible complex CSS strings (e.g. box-shadow) at `t` in [0, 1]. */
export function interpolateComplexString(a: string, b: string, t: number): string {
  const start = split(a);
  const end = split(b);

  let result = "";
  for (let i = 0; i < end.literals.length; i++) {
    result += end.literals[i];
    if (i < end.tokens.length) {
      result += renderToken(start.tokens[i], end.tokens[i], t);
    }
  }
  return result;
}
