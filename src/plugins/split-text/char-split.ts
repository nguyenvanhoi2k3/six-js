const EMOJI_SAFE_CHAR_REGEX = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gsu;

let segmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined) {
    segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter() : null;
  }
  return segmenter;
}

export function mergeSpecialCharTokens(collection: string[], specialCharsRegex?: RegExp): string[] {
  if (!specialCharsRegex) return collection;

  const found = new Set(collection.join("").match(specialCharsRegex) ?? []);
  if (!found.size) return collection;

  let i = collection.length;
  while (--i > -1) {
    const word = collection[i];
    for (const token of found) {
      if (token.startsWith(word) && token.length > word.length) {
        let slots = 0;
        let combined = word;
        while (token.startsWith((combined += collection[i + ++slots])) && combined.length < token.length);
        if (slots && combined.length === token.length) {
          collection[i] = token;
          collection.splice(i + 1, slots);
          break;
        }
      }
    }
  }
  return collection;
}

export function splitGraphemes(text: string, specialCharsRegex?: RegExp): string[] {
  const seg = getSegmenter();
  if (seg) {
    const parts = Array.from(seg.segment(text), (s) => s.segment);
    return mergeSpecialCharTokens(parts, specialCharsRegex);
  }

  const regex = specialCharsRegex ? new RegExp(`${specialCharsRegex.source}|${EMOJI_SAFE_CHAR_REGEX.source}`, "gu") : EMOJI_SAFE_CHAR_REGEX;
  return text.match(regex) ?? [];
}

export function resolveSpecialCharsRegex(specialChars: string[] | RegExp | undefined): RegExp | undefined {
  if (!specialChars) return undefined;
  return Array.isArray(specialChars) ? new RegExp(`(?:${specialChars.join("|")})`, "gu") : specialChars;
}
