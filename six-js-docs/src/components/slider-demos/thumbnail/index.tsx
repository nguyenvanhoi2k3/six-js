import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import "./style.scss";

const html = `<div style="display: flex;">
  <sx-slider
    name="slider-main"
    sync="slider-thumb-v, slider-thumb-h"
    per-view="1"
    gap="10"
    effect="fade"
  >
    <sx-slider-track>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 1</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 2</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 3</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 4</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 5</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 6</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 7</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 8</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 9</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 100%;">Slide 10</div>
      </sx-slider-slide>
    </sx-slider-track>
  </sx-slider>

  <sx-slider
    name="slider-thumb-v"
    sync="slider-main"
    direction="vertical"
    gap="10"
    snap
    drag="free"
    lock-active
    auto-centered
    auto-size
    style="width: 100px;"
  >
    <sx-slider-track>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 1</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 2</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 3</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 4</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 5</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 6</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 7</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 8</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 9</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide" style="width: 100%; height: 150px;">Slide 10</div>
      </sx-slider-slide>
    </sx-slider-track>
  </sx-slider>
</div>

<sx-slider
  name="slider-thumb-h"
  sync="slider-main"
  per-view="5"
  gap="10"
  snap
  drag="free"
  lock-active
  auto-centered
>
  <sx-slider-track>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 1</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 2</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 3</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 4</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 5</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 6</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 7</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 8</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 9</div>
    </sx-slider-slide>
    <sx-slider-slide>
      <div class="slide" style="width: 100%; height: 100px;">Slide 10</div>
    </sx-slider-slide>
  </sx-slider-track>
</sx-slider>`;

const css = `.slide {
    background: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #989898;
    user-select: none;
  }

  sx-slider[name="slider-thumb-v"] {
    margin-left: 20px;
  }
  sx-slider[name="slider-thumb-h"] {
    margin-top: 20px;
  }

  sx-slider[name="slider-thumb-v"] sx-slider-slide,
  sx-slider[name="slider-thumb-h"] sx-slider-slide {
    opacity: 0.5;
    transition: opacity 0.3s ease;
    cursor: pointer;
  }

  sx-slider[name="slider-thumb-v"] sx-slider-slide[sx-slide-active],
  sx-slider[name="slider-thumb-h"] sx-slider-slide[sx-slide-active] {
    opacity: 1;
  }

  sx-slider[name="slider-thumb-v"] sx-slider-slide:hover,
  sx-slider[name="slider-thumb-h"] sx-slider-slide:hover {
    opacity: 1;
  }
`;

export default function ThumnailDemo() {
  return (
    <div
      id="demo-thumbnail"
      style={{ marginBottom: "30vh", paddingTop: "2rem" }}
    >
      <h3 className="flex-center m-10">Sync</h3>
      <Tabs>
        <TabItem value="demo" label="Demo" default>
          <div style={{ display: "flex" }}>
            <sx-slider
              name="slider-main"
              sync="slider-thumb-v, slider-thumb-h"
              per-view="1"
              gap="10"
              effect="fade"
            >
              <sx-slider-track>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 1
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 2
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 3
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 4
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 5
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 6
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 7
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 8
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 9
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "100%" }}
                  >
                    Slide 10
                  </div>
                </sx-slider-slide>
              </sx-slider-track>
            </sx-slider>

            <sx-slider
              name="slider-thumb-v"
              sync="slider-main"
              direction="vertical"
              gap="10"
              snap
              drag="free"
              lock-active
              auto-centered
              auto-size
              style={{ width: "100px" }}
            >
              <sx-slider-track>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 1
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 2
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 3
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 4
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 5
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 6
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 7
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 8
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 9
                  </div>
                </sx-slider-slide>
                <sx-slider-slide>
                  <div
                    className="slide"
                    style={{ width: "100%", height: "150px" }}
                  >
                    Slide 10
                  </div>
                </sx-slider-slide>
              </sx-slider-track>
            </sx-slider>
          </div>

          <sx-slider
            name="slider-thumb-h"
            sync="slider-main"
            per-view="5"
            gap="10"
            snap
            drag="free"
            lock-active
            auto-centered
          >
            <sx-slider-track>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 1
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 2
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 3
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 4
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 5
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 6
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 7
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 8
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 9
                </div>
              </sx-slider-slide>
              <sx-slider-slide>
                <div
                  className="slide"
                  style={{ width: "100%", height: "100px" }}
                >
                  Slide 10
                </div>
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
