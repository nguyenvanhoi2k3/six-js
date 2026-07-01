import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider name="snake-pagination">
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
></sx-slider-pagination>`;

const css = `.slide {
    width: 100%;
    background: #e4e4e4;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  sx-slider-pagination[effect="snake"] .sx-slider-pagination-bullet {
    width: 10px;
    height: 10px;
    background: #7d7d7d;
    display: block;
    border-radius: 50%;
    transition: 0.3s;
    cursor: pointer;
  }

  sx-slider-pagination[effect="snake"] {
    position: relative;
    display: flex;
    gap: 10px;
  }

  sx-slider-pagination[effect="snake"] .sx-slider-pagination-bar {
    position: absolute;
    height: 10px;
    background-color: #000;
    border-radius: 5px;
    top: 0;
    left: 0;
    width: 10px;
    transition:
      left 0.3s cubic-bezier(0.25, 1, 0.5, 1),
      width 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
    z-index: 1;
  }

  sx-slider-pagination[effect="snake"]
    .sx-slider-pagination-bullet[sx-bullet-active] {
    background: #000;
    z-index: 1000;
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
