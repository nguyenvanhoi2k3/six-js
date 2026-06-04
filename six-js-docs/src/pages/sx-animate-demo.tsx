import React, { useEffect } from "react";

export default function SxAnimateDemoPage() {
  useEffect(() => {
    // Chỉ kích hoạt thư viện local phía client-side
    import("six-js");
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* Nút quay lại */}
      <div style={{ marginBottom: "2rem" }}>
        <a
          href="/docs/sx-animate"
          style={{
            color: "#333",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ⬅️ Quay lại tài liệu
        </a>
      </div>

      <h2 style={{ color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
        Test Playground: sx-animate
      </h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Hãy cuộn chuột xuống từ từ để test tính năng scroll đến đâu fade đến đấy.
      </p>

      {/* --- KHU VỰC TEST --- */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        
        {/* Hộp 1: Chạy ngay khi load trang vì nằm ở top */}
        <div style={{ marginTop: "2rem" }}>
          <sx-animate type="fade-in">
            <div style={{ padding: "2rem", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px" }}>
              <strong>[TOP] - Type: fade-in</strong>
              <p style={{ margin: "5px 0 0", color: "#666" }}>Hiệu ứng mờ dần tại chỗ ngay khi vừa vào trang.</p>
            </div>
          </sx-animate>
        </div>

        {/* Tạo khoảng cách 100% chiều cao màn hình để ẩn các hộp bên dưới */}
        <div style={{ height: "100vh", display: "flex", alignItems: "center", color: "#ccc", fontSize: "13px" }}>
          [ ↓ Cuộn chuột tiếp xuống dưới để xem Hộp 2 ]
        </div>

        {/* Hộp 2: Nằm sâu bên dưới, cuộn tới mới fade-up */}
        <sx-animate type="fade-up">
          <div style={{ padding: "2rem", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px" }}>
            <strong>Type: fade-up</strong>
            <p style={{ margin: "5px 0 0", color: "#666" }}>Vừa lọt vào tầm mắt là đẩy nhẹ từ dưới lên.</p>
          </div>
        </sx-animate>

        {/* Tiếp tục tạo khoảng cách màn hình */}
        <div style={{ height: "100vh", display: "flex", alignItems: "center", color: "#ccc", fontSize: "13px" }}>
          [ ↓ Cuộn chuột tiếp xuống dưới để xem Hộp 3 ]
        </div>

        {/* Hộp 3: Cuộn tới mới fade-down */}
        <sx-animate type="fade-down">
          <div style={{ padding: "2rem", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px" }}>
            <strong>Type: fade-down</strong>
            <p style={{ margin: "5px 0 0", color: "#666" }}>Vừa lọt vào tầm mắt là đẩy nhẹ từ trên xuống.</p>
          </div>
        </sx-animate>

        {/* Đệm thêm một đoạn cuối trang để dễ quan sát hộp 3 */}
        <div style={{ height: "30vh" }}></div>

      </div>
    </div>
  );
}