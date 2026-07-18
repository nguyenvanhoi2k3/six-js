/**
 * Splits text into the atomic pieces that get individually revealed. `""` (the default, matching
 * GSAP's own default `delimiter`) splits into individual characters via `Array.from` rather than
 * a `for (let i...)` index loop or `text.split("")` - both of those split by UTF-16 code unit,
 * which cuts surrogate-pair characters (emoji, some CJK/astral-plane glyphs) in half; `Array.from`
 * iterates by Unicode code point instead. A non-empty delimiter (GSAP documents `" "` for
 * word-by-word reveal) is a literal `String.split`.
 */
export function splitUnits(text: string, delimiter: string): string[] {
  return delimiter === "" ? Array.from(text) : text.split(delimiter);
}

export function randomChar(pool: string, rng: () => number = Math.random): string {
  return pool.charAt(Math.floor(rng() * pool.length));
}

export function randomString(length: number, pool: string, rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < length; i++) out += randomChar(pool, rng);
  return out;
}
