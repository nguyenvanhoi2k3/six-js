/**
 * `chars` option resolution for scrambleText - matches GSAP's own ScrambleTextPlugin named
 * presets (verified against its public docs page, since the plugin itself is a paid Club
 * GreenSock bonus plugin with no publicly readable source): `"upperCase"` (the documented
 * default), `"lowerCase"`, `"upperAndLowerCase"`. `"numeric"` is a six-js addition - not a GSAP
 * preset, but a common enough want (odometer-style digit counters) to be worth a named shortcut
 * rather than forcing callers to spell out `"0123456789"` every time. Any other non-empty string
 * is used as a literal custom pool, exactly like GSAP's own `chars: "XO"` / `chars: "jompaWB!^"`
 * examples.
 */
export type ScrambleTextCharSet = "upperCase" | "lowerCase" | "upperAndLowerCase" | "numeric" | string;

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMERIC = "0123456789";

export function resolveCharSet(chars: ScrambleTextCharSet | undefined): string {
  switch (chars) {
    case undefined:
    case "upperCase":
      return UPPER;
    case "lowerCase":
      return LOWER;
    case "upperAndLowerCase":
      return UPPER + LOWER;
    case "numeric":
      return NUMERIC;
    default:
      return chars.length ? chars : UPPER;
  }
}
