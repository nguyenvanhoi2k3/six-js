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
  </sx-slider-track>
  <sx-slider-pagination class="slider-pagination"></sx-slider-pagination>
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

  .slider-pagination {
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    gap: 10px;
    display: flex;
    justify-content: center;
  }

  .sx-slider-pagination-bullet {
    width: 10px;
    height: 10px;
    background: #e4e4e4;
    border: 1px solid #000;
    display: block;
    border-radius: 50%;
    transition: 0.3s;
    cursor: pointer;
  }

  .sx-slider-pagination-bullet:hover {
    background-color: #000;
  }

  .sx-slider-pagination-bullet[sx-bullet-active] {
    background-color: #000;
  }
`;

export default function PaginationDemo() {
  return (
    <div id="demo-pagination" style={{ marginBottom: "30vh", paddingTop: "2rem" }}>
      <h3 className="flex-center m-10">Pagination</h3>
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
            </sx-slider-track>
            <sx-slider-pagination className="slider-pagination"></sx-slider-pagination>
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