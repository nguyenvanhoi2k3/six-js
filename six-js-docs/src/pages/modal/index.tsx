import React from "react";
import LayoutProvider from "@theme/Layout/Provider";
import { useSixJs } from "../../useSixJs";
import "@six-js/core/style.css";

export default function SxMarqueeDemoPage() {
  useSixJs();
  return (
    <LayoutProvider>
      <>
        ne
        <div className="h30"></div>
      </>
    </LayoutProvider>
  );
}
