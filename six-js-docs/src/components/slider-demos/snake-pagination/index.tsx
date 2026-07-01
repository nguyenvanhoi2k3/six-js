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
  </sx-slider-track>
  <sx-slider-pagination effect="number"></sx-slider-pagination>
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

  sx-slider-pagination[effect="number"] {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  sx-slider-pagination[effect="number"] .sx-slider-pagination-bullet {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #f0f0f0;
    border: 1px solid #ccc;
    color: #333;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
  }

  sx-slider-pagination[effect="number"]
    .sx-slider-pagination-bullet[sx-bullet-active] {
    background-color: #000;
    border-color: #000;
    color: #fff;
  }
`;

export default function SnakePaginationDemo() {
  return (
    <div
      id="demo-snake-pagination"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center m-10">Snake pagination</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider name="snake-pagination">
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
            </sx-slider-track>
          </sx-slider>
          <sx-slider-pagination
            name="snake-pagination"
            effect="snake"
          ></sx-slider-pagination>
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
