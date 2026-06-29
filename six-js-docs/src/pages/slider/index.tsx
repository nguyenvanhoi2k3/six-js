import React from "react";
import LayoutProvider from "@theme/Layout/Provider";
import { useSixJs } from "../../useSixJs";

import DefaultDemo from "./default";
import PaginationDemo from "./pagination";
import DynamicPaginationDemo from "./dynamic-pagination";
import ProgressPaginationDemo from "./progress-pagination";
import NumberPaginationDemo from "./number-pagination";
import FractionPaginationDemo from "./fraction-pagination";
import VerticalSliderDemo from "./vertical";
import PerviewDemo from "./perview";

export default function SxSliderDemoPage() {
  useSixJs();

  return (
    <LayoutProvider>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <aside
          style={{
            position: "sticky",
            top: "0",
            width: "250px",
            padding: "1rem",
            borderRight: "1px solid #d5d5d5",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>SLIDER</h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "15px",
            }}
          >
            <li>
              <a
                href="#demo-default"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Default
              </a>
            </li>
            <li>
              <a
                href="#demo-pagination"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Pagination
              </a>
            </li>
            <li>
              <a
                href="#demo-dynamic-pagination"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Dynamic pagination
              </a>
            </li>
            <li>
              <a
                href="#demo-progress-pagination"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Progress pagination
              </a>
            </li>
            <li>
              <a
                href="#demo-number-pagination"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Number pagination
              </a>
            </li>
            <li>
              <a
                href="#demo-fraction-pagination"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Fraction pagination
              </a>
            </li>
            <li>
              <a
                href="#demo-vertical-slider"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Vertical slider
              </a>
            </li>
            <li>
              <a
                href="#demo-perview"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Slide per view
              </a>
            </li>
          </ul>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <DefaultDemo />
          <PaginationDemo />
          <DynamicPaginationDemo />
          <ProgressPaginationDemo />
          <NumberPaginationDemo />
          <FractionPaginationDemo />
          <VerticalSliderDemo />
          <PerviewDemo />
        </div>
      </div>
    </LayoutProvider>
  );
}
