import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider per-view="4" center-if-short gap="10">
  <sx-slider-track>
    <sx-slider-slide>
      <div class="slide">
        Slide 1
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide">
        Slide 2
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide">
        Slide 3
      </div>
    </sx-slider-slide>
  </sx-slider-track>
</sx-slider>`;

const css = `.slide {
    background: #e4e4e4;
    width: 100%;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
`;

export default function CenterIfShortDemo() {
  return (
    <div
      id="demo-center-if-short"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center">Center if short</h3>
      <div
        className="m-10"
        style={{ width: "fit-content", margin: "auto", fontSize: "14px" }}
      >
        Nếu không thì slide sẽ căn trái
      </div>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider per-view="4" center-if-short gap="10">
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
