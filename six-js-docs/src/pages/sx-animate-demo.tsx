import "@six-js/core";
import "@six-js/core/style.css";
import styles from "./index.module.css";
import React, { useEffect } from "react";
import Layout from "@theme/Layout";

export default function SxAnimateDemoPage() {
  return (
    <>
      <div style={{ background: "white" }}>
        <div style={{ height: "110vh" }}></div>
        <sx-animate type="fade-left" once="false">
          <div className={styles.box}>Hello, SxAnimate!</div>
        </sx-animate>
        <div style={{ height: "110vh" }}></div>
      </div>
    </>
  );
}
