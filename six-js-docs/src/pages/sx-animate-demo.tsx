import React, { useEffect, useState } from "react";

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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
};

const cardStyle = {
  height: "180px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  background: "linear-gradient(180deg,#fff 0%,#f8fafc 100%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "24px",
};

function DemoCard({ title, description }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

function ReplaySection({ title, description, children }) {
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
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            {title}
          </h2>

          {description && (
            <p
              style={{
                marginTop: 10,
                color: "#64748b",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >

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
            ↻ Replay
          </button>
        </div>
      </div>

      <div
        key={key}
        style={{
          marginTop: 24,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function SxAnimateDemoPage() {
  useEffect(() => {
    import("six-js");
  }, []);

  const types = ["fade", "fade-up", "fade-down", "fade-left", "fade-right"];

  const durations = [300, 1000, 2000];

  const delays = [0, 300, 600];

  const strengths = [50, 100, 200];

  const easings = [
    "linear",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "expo-in",
    "expo-out",
    "expo-in-out",
    "back-in",
    "back-out",
    "back-in-out",
  ];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <a
          href="/docs/sx-animate"
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
            background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 56,
              fontWeight: 900,
            }}
          >
            Sx Animate
          </h1>

          <p
            style={{
              marginTop: 16,
              opacity: 0.9,
              maxWidth: 700,
              marginInline: "auto",
              fontSize: 18,
            }}
          >
            Lightweight viewport animation component built for performance,
            accessibility and Core Web Vitals.
          </p>
        </div>

        {/* TYPE */}

        <ReplaySection
          title="Type"
          description="Các kiểu animation được hỗ trợ."
        >
          <div style={gridStyle}>
            {types.map((type) => (
              <sx-animate key={type} type={type}>
                <DemoCard title={type} description="Animation Type" />
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* DURATION */}

        <ReplaySection
          title="Duration"
          description="Điều chỉnh tốc độ animation."
        >
          <div style={gridStyle}>
            {durations.map((duration) => (
              <sx-animate key={duration} duration={duration} type="fade-up">
                <DemoCard title={`${duration}ms`} description="Duration" />
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* DELAY */}

        <ReplaySection
          title="Delay"
          description="Độ trễ trước khi animation bắt đầu."
        >
          <div style={gridStyle}>
            {delays.map((delay) => (
              <sx-animate key={delay} delay={delay} type="fade-right">
                <DemoCard title={`${delay}ms`} description="Delay" />
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* STRENGTH */}

        <ReplaySection title="Strength" description="Khoảng cách dịch chuyển.">
          <div style={gridStyle}>
            {strengths.map((strength) => (
              <sx-animate key={strength} strength={strength} type="fade-up">
                <DemoCard title={`${strength}`} description="Strength" />
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* EASING */}

        <ReplaySection title="Easing" description="Các easing function.">
          <div style={gridStyle}>
            {easings.map((easing) => (
              <sx-animate key={easing} easing={easing} type="fade-left">
                <DemoCard title={easing} description="Easing" />
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* SCROLL GAP */}

        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          ↓ Scroll xuống để test Group & Once
        </div>

        {/* GROUP */}

        <ReplaySection
          title="Group"
          description="Các animation chạy tuần tự thay vì đồng thời."
        >
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <sx-animate key={item} group type="fade-up">
                <div
                  style={{
                    height: 90,
                    borderRadius: 18,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    fontWeight: 700,
                  }}
                >
                  Group Item {item}
                </div>
              </sx-animate>
            ))}
          </div>
        </ReplaySection>

        {/* ONCE */}

        <ReplaySection
          title="Once"
          description="So sánh hành vi giữa once=false và once=true."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 24,
            }}
          >
            <sx-animate once="false" type="fade-up" easing="back-out">
              <DemoCard
                title="once=false"
                description="Animation chạy lại mỗi lần quay lại viewport."
              />
            </sx-animate>

            <sx-animate once="true" type="fade-up">
              <DemoCard
                title="once=true"
                description="Animation chỉ chạy một lần."
              />
            </sx-animate>
          </div>
        </ReplaySection>

        <div
          style={{
            height: "100vh",
          }}
        />
      </div>
    </div>
  );
}
