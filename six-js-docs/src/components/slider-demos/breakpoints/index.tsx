import React, { useState, useCallback, useRef } from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider
    per-view="1"
    gap="0"
    speed="0.4"
    breakpoints='{
    "360": {
        "perView": 1,
        "gap": 0,
        "effect": "fade"
    },
    "576": {
        "perView": 2,
        "gap": 10,
        "rightPadding": 0,
        "effect": "slide"
    },
    "992": {
        "perView": 3,
        "gap": 20,
        "drag": "true",
        "loop": false,
        "rightPadding": 100
    },
    "1200": {
        "perView": 4,
        "gap": 40,
        "drag": "free",
        "loop": true,
        "rightPadding": 0
    }
    }'
>
    <sx-slider-track>
    <sx-slider-slide>
        <div className="slide">Slide 1</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 2</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 3</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 4</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 5</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 6</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 7</div>
    </sx-slider-slide>
    <sx-slider-slide>
        <div className="slide">Slide 8</div>
    </sx-slider-slide>
    </sx-slider-track>
</sx-slider>`;

const css = `.slide {
    width: 100%;
    background: #e4e4e4;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
`;

export default function BreakpointsDemo() {
  const [frameWidth, setFrameWidth] = useState<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const frameCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const sliderEl = entry.target.querySelector("sx-slider");
          if (sliderEl) {
            setFrameWidth(Math.round(sliderEl.getBoundingClientRect().width));
          }
        }
      });

      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  return (
    <div
      id="demo-breakpoints"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center m-10">Breakpoints</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <div className="resizable-badge">
            Frame Width: <span>{frameWidth}px</span> (Responsive mọi thuộc tính trừ
            "direction") <br />
            Kéo frame để xem thay đổi
          </div>

          <div className="resizable-frame" ref={frameCallbackRef}>
            <sx-slider
              per-view="1"
              gap="0"
              speed="0.4"
              breakpoints='{
                "360": {
                    "perView": 1,
                    "gap": 0,
                    "effect": "fade"
                },
                "576": {
                    "perView": 2,
                    "gap": 10,
                    "rightPadding": 0,
                    "effect": "slide"
                },
                "992": {
                    "perView": 3,
                    "gap": 20,
                    "drag": "true",
                    "loop": false,
                    "rightPadding": 100
                },
                "1200": {
                    "perView": 4,
                    "gap": 40,
                    "drag": "free",
                    "loop": true,
                    "rightPadding": 0
                }
              }'
            >
              <sx-slider-track>
                <sx-slider-slide>
                  <div className="slide">Slide 1</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 2</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 3</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 4</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 5</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 6</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 7</div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div className="slide">Slide 8</div>
                </sx-slider-slide>
              </sx-slider-track>
            </sx-slider>
          </div>
        </TabItem>
        <TabItem value="html" label="Html">
          <CodeBlock showLineNumbers language="html">
            {html}
          </CodeBlock>
        </TabItem>
        <TabItem value="css" label="Css">
          <CodeBlock showLineNumbers language="css">
            {css}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
}
