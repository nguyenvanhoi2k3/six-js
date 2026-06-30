import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider auto-size auto-centered gap="10">
  <sx-slider-track>
    <sx-slider-slide>
      <div class="slide" style="width: 600px;">Slide 1</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 350px;">Slide 2</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 300px;">Slide 3</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 650px;">Slide 4</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 350px;">Slide 5</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 450px;">Slide 6</div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="width: 700px;">Slide 7</div>
    </sx-slider-slide>
  </sx-slider-track>
</sx-slider>`;

const css = `.slide {
    background: #e4e4e4;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
`;

export default function AutoCenteredDemo() {
  return (
    <div
      id="demo-auto-centered"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center">Auto centered</h3>
      <div className="m-10" style={{ width: "fit-content", margin: "auto", fontSize: "14px" }}>
        Centered nhưng xóa khoảng trống 2 bên
      </div>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider auto-size auto-centered gap="10">
            <sx-slider-track>
              <sx-slider-slide>
                <div className="slide" style={{ width: "600px" }}>
                  Slide 1
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "350px" }}>
                  Slide 2
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "300px" }}>
                  Slide 3
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "650px" }}>
                  Slide 4
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "350px" }}>
                  Slide 5
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "450px" }}>
                  Slide 6
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ width: "700px" }}>
                  Slide 7
                </div>
              </sx-slider-slide>
            </sx-slider-track>
            <div className="line-vertical-center"></div>
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
