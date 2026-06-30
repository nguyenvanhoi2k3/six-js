import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider>
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
  </sx-slider-track>
  <sx-slider-pagination effect="dynamic"></sx-slider-pagination>
</sx-slider>
`;

const css = `.slide {
    width: 100%;
    background: #e4e4e4;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  sx-slider-pagination {
    display: flex;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 1rem;
    margin: auto;
  }

  sx-slider-pagination[effect="dynamic"] {
    overflow: hidden;
    position: relative;
    transition: width 0.3s ease;
  }

  sx-slider-pagination[effect="dynamic"] .sx-slider-pagination-inner {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
    will-change: transform;
  }

  sx-slider-pagination[effect="dynamic"] .sx-slider-pagination-bullet {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    border: none;
    background: #979797;
    transition: 0.3s ease;
    border-radius: 50%;
    cursor: pointer;
  }

  sx-slider-pagination[effect="dynamic"]
    .sx-slider-pagination-bullet[sx-bullet-active] {
    transform: scale(1);
    background: #000;
  }

  sx-slider-pagination[effect="dynamic"]
    .sx-slider-pagination-bullet.sx-bullet-main {
    transform: scale(1);
  }

  sx-slider-pagination[effect="dynamic"]
    .sx-slider-pagination-bullet.sx-bullet-medium {
    transform: scale(0.66);
  }

  sx-slider-pagination[effect="dynamic"]
    .sx-slider-pagination-bullet.sx-bullet-small {
    transform: scale(0.33);
  }
`;

export default function DynamicPaginationDemo() {
  return (
    <div id="demo-dynamic-pagination" style={{ marginBottom: "30vh", paddingTop: "2rem" }}>
      <h3 className="flex-center m-10">Dynamic pagination</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider>
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
            <sx-slider-pagination effect="dynamic"></sx-slider-pagination>
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