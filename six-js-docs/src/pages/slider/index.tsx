import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import LayoutProvider from "@theme/Layout/Provider";
import "./style.css";

const sliderHtml = `<sx-slider name="simple-slider">
  <sx-slider-track>
    <sx-slider-slide>Slide 1</sx-slider-slide>
    <sx-slider-slide>Slide 2</sx-slider-slide>
    <sx-slider-slide>Slide 3</sx-slider-slide>
    <sx-slider-slide>Slide 4</sx-slider-slide>
  </sx-slider-track>
</sx-slider>`;

const sliderCss = `/* Cấu hình style cho Slider */
sx-slider {
  display: block;
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
}

sx-slider-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3578e5;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}`;

export default function SxSliderDemoPage() {
  return (
    <LayoutProvider>
      <div
        style={{
          padding: "3rem 2rem",
          maxWidth: "900px",
          margin: "0 auto",
          minHeight: "100vh",
          backgroundColor: "var(--ifm-background-color)",
          color: "var(--ifm-font-color-base)",
        }}
      >
        <Tabs>
          <TabItem value="demo" label="🎮 Bản Demo" default>
            <div
              style={{
                border: "1px solid var(--ifm-contents-border-color)",
                borderRadius: "8px",
                padding: "2.5rem",
                background: "var(--ifm-background-color)",
                marginTop: "1rem",
              }}
            >
              <sx-slider name="simple-slider">
                <sx-slider-track>
                  <sx-slider-slide>Slide 1</sx-slider-slide>
                  <sx-slider-slide>Slide 2</sx-slider-slide>
                  <sx-slider-slide>Slide 3</sx-slider-slide>
                  <sx-slider-slide>Slide 4</sx-slider-slide>
                </sx-slider-track>
              </sx-slider>
            </div>
          </TabItem>

          <TabItem value="html" label="📄 Code HTML">
            <div style={{ marginTop: "1rem" }}>
              <CodeBlock language="html">{sliderHtml}</CodeBlock>
            </div>
          </TabItem>

          <TabItem value="css" label="🎨 Code CSS">
            <div style={{ marginTop: "1rem" }}>
              <CodeBlock language="css">{sliderCss}</CodeBlock>
            </div>
          </TabItem>
        </Tabs>
      </div>
    </LayoutProvider>
  );
}
