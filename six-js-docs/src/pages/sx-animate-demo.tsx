import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function SxAnimateDemoPage() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex-center" style={{ padding: "2rem" }}>
          Đang tải bản demo...
        </div>
      }
    >
      {() => {
        // Đưa thư viện vào đây để Node.js không đọc nó khi build,
        // thư viện sẽ chỉ được kích hoạt khi chạy trên trình duyệt (Client-side)
        require("@six-js/core");

        return (
          <>
            <sx-animate type="fade" duration={800}>
              <h2 className="space flex-center">
                Scroll down to see the animation
              </h2>
            </sx-animate>

            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade" duration={800} className="box">
                fade
              </sx-animate>
              <sx-animate type="fade" duration={800} className="box">
                fade
              </sx-animate>
              <sx-animate type="fade" duration={800} className="box">
                fade
              </sx-animate>
              <sx-animate type="fade" duration={800} className="box">
                fade
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-left" className="box">
                fade-left
              </sx-animate>
              <sx-animate type="fade-left" className="box">
                fade-left
              </sx-animate>
              <sx-animate type="fade-left" className="box">
                fade-left
              </sx-animate>
              <sx-animate type="fade-left" className="box">
                fade-left
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-right" className="box">
                fade-right
              </sx-animate>
              <sx-animate type="fade-right" className="box">
                fade-right
              </sx-animate>
              <sx-animate type="fade-right" className="box">
                fade-right
              </sx-animate>
              <sx-animate type="fade-right" className="box">
                fade-right
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-down" className="box">
                fade-down
              </sx-animate>
              <sx-animate type="fade-down" className="box">
                fade-down
              </sx-animate>
              <sx-animate type="fade-down" className="box">
                fade-down
              </sx-animate>
              <sx-animate type="fade-down" className="box">
                fade-down
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
            </div>
            <div className="flex-center gp-20 pb-20">
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
              <sx-animate type="fade-up" className="box" group>
                group
              </sx-animate>
            </div>
            <h2 className="space flex-center">
              <sx-animate type="fade" duration={800}>
                End
              </sx-animate>
            </h2>
          </>
        );
      }}
    </BrowserOnly>
  );
}
