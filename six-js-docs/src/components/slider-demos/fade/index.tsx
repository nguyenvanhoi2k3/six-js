import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider effect="fade">
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
  <sx-slider-prev class="prev">Prev</sx-slider-prev>
  <sx-slider-next class="next">Next</sx-slider-next>
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

export default function FadeDemo() {
  return (
    <div id="demo-fade" style={{ marginBottom: "30vh", paddingTop: "2rem" }}>
      <h3 className="flex-center m-10">Fade effect</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider effect="fade">
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