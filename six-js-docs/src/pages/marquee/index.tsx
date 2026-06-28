import React from "react";
import LayoutProvider from "@theme/Layout/Provider";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { useSixJs } from "../../useSixJs";

const marquee1 = `<sx-marquee>
  <sx-marquee-inner>
    <sx-marquee-item>
      <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>`;

const marquee2 = `<sx-marquee direction="right" speed="120">
  <sx-marquee-inner>
    <sx-marquee-item>
      <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>`;

const marquee3 = `<sx-marquee clone="false" speed="200">
  <sx-marquee-inner>
    <sx-marquee-item>
      <span>Khi clone false nội dung sẽ không bị lặp lại</span>
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>`;

const marquee4 = `<sx-marquee pause-on-hover="false">
  <sx-marquee-inner>
    <sx-marquee-item>
      <img
        style="width: 300px; height: 200px; object-fit: cover;"
        src="https://images.pexels.com/photos/11774912/pexels-photo-11774912.jpeg"
        alt=""
      />
    </sx-marquee-item>

    <sx-marquee-item>
      <img
        style="width: 280px; height: 250px; object-fit: cover;"
        src="https://images.pexels.com/photos/10737735/pexels-photo-10737735.jpeg"
        alt=""
      />
    </sx-marquee-item>

    <sx-marquee-item>
      <img
        style="width: 300px; height: 200px; object-fit: cover;"
        src="https://images.pexels.com/photos/5739232/pexels-photo-5739232.jpeg"
        alt=""
      />
    </sx-marquee-item>

    <sx-marquee-item>
      <img
        style="width: 220px; height: 220px; object-fit: cover;"
        src="https://images.pexels.com/photos/36412364/pexels-photo-36412364.jpeg"
        alt=""
      />
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>`;

export default function SxMarqueeDemoPage() {
  useSixJs();
  return (
    <LayoutProvider>
      <>
        <h3 className="flex-center m-10">Marquee cơ bản</h3>
        <Tabs>
          <TabItem value="demo" label="Demo" default>
            <sx-marquee>
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          </TabItem>
          <TabItem value="html" label="Html">
            <CodeBlock language="html">{marquee1}</CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>

        <h3 className="flex-center m-10">direction + speed</h3>
        <Tabs>
          <TabItem value="demo" label="Demo" default>
            <sx-marquee direction="right" speed="120">
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          </TabItem>
          <TabItem value="html" label="Html">
            <CodeBlock language="html">{marquee2}</CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>

        <h3 className="flex-center m-10">clone="false"</h3>
        <Tabs>
          <TabItem value="demo" label="Demo" default>
            <sx-marquee clone="false" speed="200">
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>Khi clone false nội dung sẽ không bị lặp lại</span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          </TabItem>
          <TabItem value="html" label="Html">
            <CodeBlock language="html">{marquee3}</CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>

        <h3 className="flex-center m-10">pause-on-hover="false"</h3>
        <Tabs>
          <TabItem value="demo" label="Demo" default>
            <sx-marquee pause-on-hover="false">
              <sx-marquee-inner>
                <sx-marquee-item>
                  <img
                    style={{
                      width: "300px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    src="https://images.pexels.com/photos/11774912/pexels-photo-11774912.jpeg"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    style={{
                      width: "280px",
                      height: "250px",
                      objectFit: "cover",
                    }}
                    src="https://images.pexels.com/photos/10737735/pexels-photo-10737735.jpeg"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    style={{
                      width: "300px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    src="https://images.pexels.com/photos/5739232/pexels-photo-5739232.jpeg"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                    }}
                    src="https://images.pexels.com/photos/36412364/pexels-photo-36412364.jpeg"
                    alt=""
                  />
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          </TabItem>
          <TabItem value="html" label="Html">
            <CodeBlock language="html">{marquee4}</CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>
      </>
    </LayoutProvider>
  );
}
