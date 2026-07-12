//six-js\src\components\modal\index.ts
import "./dialog.css";

import { SxDialog } from "./dialog";
import { SxDialogTrigger } from "./dialog-trigger";
import { SxDialogPull } from "./dialog-pull";
import { SxCloseCursor } from "./close-cursor";

export function registerDialog() {
  if (!customElements.get("sx-dialog")) {
    customElements.define("sx-dialog", SxDialog);
  }

  if (!customElements.get("sx-dialog-trigger")) {
    customElements.define("sx-dialog-trigger", SxDialogTrigger);
  }

  if (!customElements.get("sx-dialog-pull")) {
    customElements.define("sx-dialog-pull", SxDialogPull);
  }

  if (!customElements.get("sx-close-cursor")) {
    customElements.define("sx-close-cursor", SxCloseCursor);
  }
}
