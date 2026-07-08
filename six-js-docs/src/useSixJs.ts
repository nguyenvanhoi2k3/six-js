// useSixJs.ts
import { useEffect } from "react";
import { six } from "@six-js/core";

export function useSixJs() {
  useEffect(() => {
    six.initElement();
  }, []);
}
