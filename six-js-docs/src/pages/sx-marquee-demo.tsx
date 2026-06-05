import React, { useEffect, useState } from "react";

// Tái sử dụng hệ thống style đồng bộ với trang trước
const pageStyle = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "40px",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "24px",
  padding: "32px",
  marginTop: "40px",
  boxShadow: "0 4px 20px rgba(0,0,0,.04)",
};

// Chuỗi HTML dùng chung cho danh sách các item mẫu bên trong Marquee
const sampleItemsHTML = `
  <sx-marquee-inner>
    <sx-marquee-item><div class="sx-demo-card">🔥 Item Mẫu</div></sx-marquee-item>
  </sx-marquee-inner>
`;

function StaticSection({ title, description, marqueeHtmlContent }) {
  const [key, setKey] = useState(0);

  return (
    <section style={sectionStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>{title}</h2>
          {description && (
            <p style={{ marginTop: 10, color: "#64748b" }}>{description}</p>
          )}
        </div>

        <div>
          <button
            onClick={() => setKey((v) => v + 1)}
            style={{
              border: 0,
              cursor: "pointer",
              borderRadius: 12,
              padding: "10px 16px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            ↻ Reset
          </button>
        </div>
      </div>

      {/* Ép trình duyệt tự động dựng lại HTML thô khi bấm Reset */}
      <div
        key={key}
        style={{ marginTop: 24 }}
        dangerouslySetInnerHTML={{ __html: marqueeHtmlContent }}
      />
    </section>
  );
}

export default function SxMarqueeDemoPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    import("six-js")
      .then(() => setIsLoaded(true))
      .catch((err) => console.error("Failed to load six-js:", err));

    return () => {
      setIsLoaded(false);
    };
  }, []);

  if (!isLoaded) {
    return <div style={pageStyle}>Đang tải cấu hình phần Marquee...</div>;
  }

  return (
    <div style={pageStyle}>
      {/* Nhúng đoạn CSS tùy biến cho class của item vào trang */}
      <style>{`
        .sx-demo-card {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 16px;
          whiteSpace: nowrap;
          border-radius: 8px;
        }
        .complex-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .complex-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        /* CSS cho phần ảnh Demo mới bổ sung */
        .marquee-img {
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          display: block;
        }
      `}</style>

      <div style={containerStyle}>
        <a
          href="/docs/sx-marquee"
          style={{
            color: "#334155",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Quay lại tài liệu
        </a>

        {/* HERO */}
        <div
          style={{
            marginTop: 20,
            padding: "80px 40px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 56, fontWeight: 900 }}>
            Sx Marquee
          </h1>
        </div>

        {/* DEFAULT */}
        <StaticSection
          title="Default"
          description="Cấu hình mặc định (Chạy trái, speed=50, pause-on-hover=true, gap=16)."
          marqueeHtmlContent={`
            <sx-marquee>
              ${sampleItemsHTML}
            </sx-marquee>
          `}
        />

        {/* DIRECTION */}
        <StaticSection
          title="Direction"
          description="Thay đổi hướng di chuyển qua thuộc tính direction (left | right)."
          marqueeHtmlContent={`
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">DIRECTION="LEFT"</span>
                <sx-marquee direction="left">${sampleItemsHTML}</sx-marquee>
              </div>
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">DIRECTION="RIGHT"</span>
                <sx-marquee direction="right">${sampleItemsHTML}</sx-marquee>
              </div>
            </div>
          `}
        />

        {/* SPEED */}
        <StaticSection
          title="Speed"
          description="Điều chỉnh tốc độ cuộn (speed càng cao chạy càng nhanh)."
          marqueeHtmlContent={`
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">SPEED="20" (Chậm)</span>
                <sx-marquee speed="20">${sampleItemsHTML}</sx-marquee>
              </div>
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">SPEED="120" (Nhanh)</span>
                <sx-marquee speed="120">${sampleItemsHTML}</sx-marquee>
              </div>
            </div>
          `}
        />

        {/* PAUSE ON HOVER */}
        <StaticSection
          title="Pause on Hover"
          description="Bật / Tắt tính năng dừng chuyển động khi rê chuột vào."
          marqueeHtmlContent={`
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">PAUSE-ON-HOVER="TRUE" (Rê chuột thử xem)</span>
                <sx-marquee pause-on-hover="true">${sampleItemsHTML}</sx-marquee>
              </div>
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">PAUSE-ON-HOVER="FALSE" (Không dừng khi hover)</span>
                <sx-marquee pause-on-hover="false">${sampleItemsHTML}</sx-marquee>
              </div>
            </div>
          `}
        />

        {/* GAP */}
        <StaticSection
          title="Gap"
          description="Khoảng cách giữa các item nhận số (px) hoặc chuỗi css unit (rem, em...)."
          marqueeHtmlContent={`
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">GAP="5" (Rất khít)</span>
                <sx-marquee gap="5">${sampleItemsHTML}</sx-marquee>
              </div>
              <div>
                <span style="font-size: 14px; font-weight: 700; color: #64748b;">GAP="3rem" (Rất rộng)</span>
                <sx-marquee gap="3rem">${sampleItemsHTML}</sx-marquee>
              </div>
            </div>
          `}
        />

        {/* NEW: IMAGE GALLERY DEMO */}
        <StaticSection
          title="Image Gallery"
          description="Ứng dụng Marquee để hiển thị dải hình ảnh sản phẩm hoặc logo đối tác liên tục."
          marqueeHtmlContent={`
            <sx-marquee speed="100" gap="24" pause-on-hover="false">
              <sx-marquee-inner>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/300/200?random=1" alt="Demo 1"/></sx-marquee-item>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/350/250?random=2" alt="Demo 2"/></sx-marquee-item>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/300/200?random=3" alt="Demo 3"/></sx-marquee-item>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/100/200?random=4" alt="Demo 4"/></sx-marquee-item>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/300/360?random=5" alt="Demo 5"/></sx-marquee-item>
                <sx-marquee-item><img class="marquee-img" src="https://picsum.photos/400/300?random=6" alt="Demo 6"/></sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          `}
        />

        {/* COMPLEX CONTENT */}
        <StaticSection
          title="Complex Content"
          description="Chạy marquee với các khối thẻ HTML phức tạp (Hình ảnh, Thẻ bài viết)."
          marqueeHtmlContent={`
            <sx-marquee speed="40" gap="24">
              <sx-marquee-inner>
                <sx-marquee-item>
                  <div class="complex-card">
                    <div class="complex-icon">🚀</div>
                    <div>
                      <div style="font-weight: 700; font-size: 14px; color: #1e293b;">Tính năng mới #1</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Mô tả ngắn gọn về sản phẩm...</div>
                    </div>
                  </div>
                </sx-marquee-item>
                <sx-marquee-item>
                  <div class="complex-card">
                    <div class="complex-icon">⚡</div>
                    <div>
                      <div style="font-weight: 700; font-size: 14px; color: #1e293b;">Tối ưu hiệu năng #2</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Tốc độ tải trang nhanh gấp đôi...</div>
                    </div>
                  </div>
                </sx-marquee-item>
                <sx-marquee-item>
                  <div class="complex-card">
                    <div class="complex-icon">🎨</div>
                    <div>
                      <div style="font-weight: 700; font-size: 14px; color: #1e293b;">Giao diện đẹp #3</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Hỗ trợ tùy biến Dark Mode...</div>
                    </div>
                  </div>
                </sx-marquee-item>
              </sx-marquee-inner>
            </sx-marquee>
          `}
        />

        <div style={{ height: "40px" }} />
      </div>
    </div>
  );
}
