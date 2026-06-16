import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

// Đổi tên component cho đúng với tên file marquee-demo
export default function SxMarqueeDemoPage() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex-center" style={{ padding: "2rem" }}>
          Đang tải bản demo...
        </div>
      }
    >
      {() => {
        require("@six-js/core");

        return (
          <>
            <div style={{ height: "10vh" }} />

         

            <div style={{ height: "20vh" }} />
          </>
        );
      }}
    </BrowserOnly>
  );
}
