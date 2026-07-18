// UMD-only entry - see core.ts's comment for why this is separate from the ESM entries. Four
// register functions, no single "default" - global becomes a plain object of named exports
// (`window.Components = { registerMarquee, registerSlider, registerDialog, registerComponents }`),
// used as `Components.registerDialog()` etc.
export { registerMarquee, registerSlider, registerDialog, registerComponents } from "../../components";
