import React, { useState } from "react"; // <-- Thêm useState
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from "@theme/CodeBlock";
import type {} from "@six-js/core";
import "./style.css";

const sliderCode = `<sx-slider name="simple-slider">
  <sx-slider-track>
    <sx-slider-slide>Slide 1</sx-slider-slide>
    <sx-slider-slide>Slide 2</sx-slider-slide>
    <sx-slider-slide>Slide 3</sx-slider-slide>
    <sx-slider-slide>Slide 4</sx-slider-slide>
  </sx-slider-track>
</sx-slider>`;

export default function SxSliderDemoPage() {
  const [showCode, setShowCode] = useState(false); // State quản lý ẩn/hiện

  return (
    <BrowserOnly
      fallback={
        <div className="flex-center" style={{ padding: "2rem" }}>
          Đang tải bản demo...
        </div>
      }
    >
      {() => {
        return (
          <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
              
              {/* Phần chạy Demo */}
              <div className="flex" style={{ padding: "2.5rem", background: "#f9f9f9" }}>
                <sx-slider name="simple-slider">
                  <sx-slider-track>
                    <sx-slider-slide>Slide 1</sx-slider-slide>
                    <sx-slider-slide>Slide 2</sx-slider-slide>
                    <sx-slider-slide>Slide 3</sx-slider-slide>
                    <sx-slider-slide>Slide 4</sx-slider-slide>
                  </sx-slider-track>
                </sx-slider>
              </div>

              {/* Thanh điều khiển nút bấm */}
              <div style={{ padding: "0.5rem 1rem", borderTop: "1px solid #ddd", display: "flex", justifyContent: "flex-end", background: "#fff" }}>
                <button 
                  onClick={() => setShowCode(!showCode)}
                  style={{ padding: "5px 12px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
                >
                  {showCode ? "</> Hide Code" : "</> Show Code"}
                </button>
              </div>

              {/* Phần code block sẽ hiển thị khi showCode = true */}
              {showCode && (
                <div style={{ borderTop: "1px solid #ddd" }}>
                  <CodeBlock language="html">
                    {sliderCode}
                  </CodeBlock>
                </div>
              )}

            </div>
          </div>
        );
      }}
    </BrowserOnly>
  );
}