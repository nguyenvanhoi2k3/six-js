// useSixJs.ts
import { useEffect } from "react";

export function useSixJs() {
  useEffect(() => {
    import("@six-js/core");
  }, []);
}
