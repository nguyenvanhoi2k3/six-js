import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider per-view="3" grab-cursor drag="free" gap="10">
  <sx-slider-track>
    <sx-slider-slide>
      <div class="slide">Slide 1</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 2</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 3</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 4</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 5</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 6</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 7</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 8</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 9</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide">Slide 10</div>
    </sx-slider-slide>
  </sx-slider-track>
  <sx-slider-progress></sx-slider-progress>
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

  sx-slider-progress {
    display: block;
    position: relative;
    width: 100%;
    height: 4px;
    background: #96bfff6f;
    overflow: hidden;
    border-radius: 2px;
  }

  .sx-slider-progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #78a5ee;
    will-change: transform;
  }
`;

export default function DragFreeDemo() {
  return (
    <div id="demo-drag-free" style={{ marginBottom: "30vh", paddingTop: "2rem" }}>
      <h3 className="flex-center m-10">Drag free</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider per-view="3" grab-cursor drag="free" gap="10">
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
              <sx-slider-slide>
                <div className="slide">Slide 9</div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide">Slide 10</div>
              </sx-slider-slide>
            </sx-slider-track>
            <sx-slider-progress></sx-slider-progress>
          </sx-slider>
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