import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<sx-slider
  name="auto-height-slider"
  per-view="3"
  auto-height
  gap="10"
>
  <sx-slider-track>
    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 1
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 2
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 3
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 400px;">
        Slide 4
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 5
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 6
      </div>
    </sx-slider-slide>

    <sx-slider-slide>
      <div class="slide" style="height: 300px;">
        Slide 7
      </div>
    </sx-slider-slide>
  </sx-slider-track>
</sx-slider>
<!-- 
Nên đặt pagination bên ngoài khi dùng auto-height vì:
  Chiều cao của track sẽ co giãn. Nếu đặt pagination ở bên trong,
  phần nội dung slide dài hơn có thể tạm thời tràn ra và đè lên pagination
  trong một khoảng thời gian ngắn của hiệu ứng chuyển cảnh.
-->
<sx-slider-pagination
  name="auto-height-slider"
  class="slider-pagination"
></sx-slider-pagination>`;

const css = `.slide {
    background: #e4e4e4;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  .slider-pagination {
    display: flex;
    gap: 4px;
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

export default function AutoHeightDemo() {
  return (
    <div
      id="demo-auto-height"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center m-10">Auto height</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <sx-slider
            name="auto-height-slider"
            per-view="3"
            auto-height
            gap="10"
          >
            <sx-slider-track>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 1
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 2
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 3
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "400px" }}>
                  Slide 4
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 5
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 6
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div className="slide" style={{ height: "300px" }}>
                  Slide 7
                </div>
              </sx-slider-slide>
            </sx-slider-track>
          </sx-slider>
          <sx-slider-pagination
            name="auto-height-slider"
            className="slider-pagination"
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
