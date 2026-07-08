//six-js\src\components\modal\index.ts
import "./dialog.css";

import { SxDialog } from "./dialog";
import { SxDialogTrigger } from "./dialog-trigger";

export function registerDialog() {
  if (!customElements.get("sx-dialog")) {
    customElements.define("sx-dialog", SxDialog);
  }

  if (!customElements.get("sx-dialog-trigger")) {
    customElements.define("sx-dialog-trigger", SxDialogTrigger);
  }
}
