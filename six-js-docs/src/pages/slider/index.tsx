import React, { useEffect } from "react";
import LayoutProvider from "@theme/Layout/Provider";
import { useSixJs } from "../../useSixJs";
import "@six-js/core/style.css";
import { ScrollControllerProvider } from "@docusaurus/theme-common/internal";

import DefaultDemo from "../../components/slider-demos/default";
import PaginationDemo from "../../components/slider-demos/pagination";
import DynamicPaginationDemo from "../../components/slider-demos/dynamic-pagination";
import ProgressPaginationDemo from "../../components/slider-demos/progress-pagination";
import NumberPaginationDemo from "../../components/slider-demos/number-pagination";
import SnakePaginationDemo from "../../components/slider-demos/snake-pagination";
import FractionPaginationDemo from "../../components/slider-demos/fraction-pagination";
import VerticalSliderDemo from "../../components/slider-demos/vertical";
import PerviewDemo from "../../components/slider-demos/perview";
import AutoSizeDemo from "../../components/slider-demos/auto-size";
import CenteredDemo from "../../components/slider-demos/centered";
import AutoCenteredDemo from "../../components/slider-demos/auto-centered";
import CenterIfShortDemo from "../../components/slider-demos/center-if-short";
import GrabCursorDemo from "../../components/slider-demos/grab-cursor";
import DragFreeDemo from "../../components/slider-demos/drag-free";
import SnapDemo from "../../components/slider-demos/snap";
import LoopDemo from "../../components/slider-demos/loop";
import AutoPlayDemo from "../../components/slider-demos/auto-play";
import AutoHeightDemo from "../../components/slider-demos/auto-height";
import FadeDemo from "../../components/slider-demos/fade";
import RightPaddingDemo from "../../components/slider-demos/right-padding";
import LeftPaddingDemo from "../../components/slider-demos/left-padding";
import PerMoveDemo from "../../components/slider-demos/per-move";
import BreakpointsDemo from "../../components/slider-demos/breakpoints";
import ThumnailDemo from "../../components/slider-demos/thumbnail";

export default function SxSliderDemoPage() {
  // useSixJs();

  useEffect(() => {
    const sections = document.querySelectorAll('div[id^="demo-"]');
    const navLinks = document.querySelectorAll('aside a[href^="#demo-"]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) =>
              link.classList.remove("active-sidebar-link"),
            );

            const activeLink = document.querySelector(
              `aside a[href="#${entry.target.id}"]`,
            );
            if (activeLink) {
              activeLink.classList.add("active-sidebar-link");
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -50% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);
  return (
    <LayoutProvider>
      <ScrollControllerProvider>
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
            <h2>SLIDER</h2>
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
                  className="sidebar-link"
                  href="#demo-default"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Default
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-dynamic-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Dynamic pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-progress-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Progress pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-snake-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Snake pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-number-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Number pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-fraction-pagination"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Fraction pagination
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-vertical-slider"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Vertical slider
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-perview"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Slide per view
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-per-move"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Per move
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-auto-size"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Auto size
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-centered-slider"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Centered
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-auto-centered"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Auto Centered
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-center-if-short"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Center if short
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-grab-cursor"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Grab cursor
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-drag-free"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Drag free
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-snap"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Snap
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-loop"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Loop
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-auto-play"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Auto play
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-auto-height"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Auto height
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-fade"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Fade effect
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-right-padding"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Right padding
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-left-padding"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Left padding
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-breakpoints"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Breakpoints
                </a>
              </li>
              <li>
                <a
                  className="sidebar-link"
                  href="#demo-thumbnail"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Sync
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
            <PerMoveDemo />
            <AutoSizeDemo />
            <CenteredDemo />
            <AutoCenteredDemo />
            <CenterIfShortDemo />
            <GrabCursorDemo />
            <DragFreeDemo />
            <SnapDemo />
            <LoopDemo />
            <AutoPlayDemo />
            <AutoHeightDemo />
            <FadeDemo />
            <RightPaddingDemo />
            <LeftPaddingDemo />
            <BreakpointsDemo />
            <ThumnailDemo />
            <SnakePaginationDemo />
          </div>
        </div>
      </ScrollControllerProvider>
    </LayoutProvider>
  );
}
