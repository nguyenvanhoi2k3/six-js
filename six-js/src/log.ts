import { VERSION } from "./version";

let logged = false;

export function logVersion() {
  if (logged) return;

  logged = true;

  console.log(
    ` SixJS v${VERSION}`,
  );
}