import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

// Đổi tên component cho đúng với tên file marquee-demo
export default function SxMarqueeDemoPage() {
  return (
    <BrowserOnly
      fallback={
        <div className="flex-center" style={{ padding: "2rem" }}>
          Đang tải bản demo...
        </div>
      }
    >
      {() => {
        // Chỉ nạp thư viện khi chạy trên trình duyệt (Client-side)
        require("@six-js/core");

        return (
          <>
            <div style={{ height: "10vh" }} />

            <sx-marquee
              className="flex-center"
              style={{
                border: "1px solid #797878",
                background: "#ccc",
                height: "50px",
              }}
              direction="right"
              speed="100"
              pause-on-hover="false"
            >
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>

            <div style={{ height: "20vh" }} />

            <sx-marquee
              className="flex-center"
              style={{
                border: "1px solid #797878",
                background: "#ccc",
                height: "50px",
              }}
              speed="100"
              pause-on-hover="false"
            >
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>item marquee 1</span>
                </sx-marquee-item>
                <sx-marquee-item>
                  <span>item marquee 2</span>
                </sx-marquee-item>
                <sx-marquee-item>
                  <span>item marquee 3</span>
                </sx-marquee-item>
                <sx-marquee-item>
                  <span>item marquee 4</span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>

            <div style={{ height: "20vh" }} />

            <sx-marquee speed="200" clone="false">
              <sx-marquee-inner>
                <sx-marquee-item>
                  <span>
                    Khi clone="false" nội dung sẽ không được nhân bản và tự chạy
                    lại khi đi hết
                  </span>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>

            <div style={{ height: "20vh" }} />

            <sx-marquee className="flex-center" direction="right" speed="150">
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

            <div style={{ height: "20vh" }} />

            <sx-marquee
              className="flex-center"
              speed="100"
              gap="50"
              pause-on-hover="false"
            >
              <sx-marquee-inner>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/1384/1384060.png"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/15707/15707749.png"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/3116/3116491.png"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/5969/5969020.png"
                    alt=""
                  />
                </sx-marquee-item>
                <sx-marquee-item>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/5968/5968472.png"
                    alt=""
                  />
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>

            <div style={{ height: "20vh" }} />
          </>
        );
      }}
    </BrowserOnly>
  );
}
