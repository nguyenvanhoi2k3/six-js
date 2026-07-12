import { registerProperty, ParsedValue } from "./registry";

function isMediaElement(target: HTMLElement): target is HTMLVideoElement | HTMLAudioElement {
  return target instanceof HTMLVideoElement || target instanceof HTMLAudioElement;
}

registerProperty("currentTime", {
  type: "numeric",
  isTransform: false,
  defaultUnit: "",
  getCurrent(target: HTMLElement): ParsedValue {
    return { num: isMediaElement(target) ? target.currentTime : 0, unit: "" };
  },
  apply(target: HTMLElement, value: ParsedValue) {
    if (isMediaElement(target)) target.currentTime = value.num;
  },
});
