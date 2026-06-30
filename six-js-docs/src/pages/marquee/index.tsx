import React from "react";
import LayoutProvider from "@theme/Layout/Provider";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { useSixJs } from "../../useSixJs";
import "@six-js/core/style.css";
import "./style.css";

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

const marqueeUp = `<sx-marquee
  direction="up"
  pause-on-hover="false"
  speed="70"
  style="height: 400px; border: 1px solid #ddd;">
  <sx-marquee-inner>
    <sx-marquee-item>
      <div class="card">
        <div class="card-header">
          <img
            class="card-avt"
            src="https://i.pravatar.cc/150?img=32"
            alt=""
          />
          <div class="card-name">Emily Johnson</div>
        </div>
        <div>
          I'm thoroughly impressed with Marquee's performance and
          ease of use. It made implementing complex scrolling texts
          a breeze, and the support for TypeScript is top-notch.
        </div>
      </div>
    </sx-marquee-item>
    <sx-marquee-item>
      <div class="card">
        <div class="card-header">
          <img
            class="card-avt"
            src="https://i.pravatar.cc/150?img=31"
            alt=""
          />
          <div class="card-name">Dan Gale</div>
        </div>
        <div>
          I'm thoroughly impressed with Marquee's performance and
          ease of use. It made implementing complex scrolling texts
          a breeze, and the support for TypeScript is top-notch.
        </div>
      </div>
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>`;

const marqueeUpCss = `.card {
  width: 400px;
  background: #ccc;
  padding: 2rem;
  margin: 0 auto;
}

.card-header {
  display: flex;
  gap: 10px;
  padding-bottom: 10px;
}

.card-avt {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}
`;

export default function SxMarqueeDemoPage() {
  useSixJs();
  return (
    <LayoutProvider>
      <>
        <h3 className="flex-center m-10">Default</h3>
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
            <CodeBlock showLineNumbers language="html">
              {marquee1}
            </CodeBlock>
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
            <CodeBlock showLineNumbers language="html">
              {marquee2}
            </CodeBlock>
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
            <CodeBlock showLineNumbers language="html">
              {marquee3}
            </CodeBlock>
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
            <CodeBlock showLineNumbers language="html">
              {marquee4}
            </CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>

        {/* ================= NEW DEMO: DIRECTION UP ================= */}
        <h3 className="flex-center m-10">direction="up" (Cuộn từ dưới lên)</h3>
        <Tabs>
          <TabItem value="demo" label="Demo" default>
            <sx-marquee
              direction="up"
              pause-on-hover="false"
              speed="70"
              style={{
                height: "400px",
                border: "1px solid #ddd",
              }}
            >
              <sx-marquee-inner>
                <sx-marquee-item>
                  <div className="card">
                    <div className="card-header">
                      <img
                        className="card-avt"
                        src="https://i.pravatar.cc/150?img=32"
                        alt=""
                      />
                      <div className="card-name">Emily Johnson</div>
                    </div>
                    <div>
                      I'm thoroughly impressed with Marquee's performance and
                      ease of use. It made implementing complex scrolling texts
                      a breeze, and the support for TypeScript is top-notch.
                    </div>
                  </div>
                </sx-marquee-item>
                <sx-marquee-item>
                  <div className="card">
                    <div className="card-header">
                      <img
                        className="card-avt"
                        src="https://i.pravatar.cc/150?img=31"
                        alt=""
                      />
                      <div className="card-name">Dan Gale</div>
                    </div>
                    <div>
                      I'm thoroughly impressed with Marquee's performance and
                      ease of use. It made implementing complex scrolling texts
                      a breeze, and the support for TypeScript is top-notch.
                    </div>
                  </div>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          </TabItem>
          <TabItem value="html" label="Html">
            <CodeBlock showLineNumbers language="html">
              {marqueeUp}
            </CodeBlock>
          </TabItem>
          <TabItem value="css" label="Css">
            <CodeBlock showLineNumbers language="css">
              {marqueeUpCss}
            </CodeBlock>
          </TabItem>
        </Tabs>

        <div className="h30"></div>
      </>
    </LayoutProvider>
  );
}
