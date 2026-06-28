import React from "react";
import LayoutProvider from "@theme/Layout/Provider";
import { useSixJs } from "../../useSixJs";

export default function SxAnimateDemoPage() {
  useSixJs();
  return (
    <LayoutProvider>
      <>
        <sx-animate type="fade" duration={800}>
          <h2 style={{ height: "100vh" }} className="flex-center">
            Scroll down to see the animation
          </h2>
        </sx-animate>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade" duration={800} className="box">
            fade
          </sx-animate>
          <sx-animate type="fade" duration={800} className="box">
            fade
          </sx-animate>
          <sx-animate type="fade" duration={800} className="box">
            fade
          </sx-animate>
          <sx-animate type="fade" duration={800} className="box">
            fade
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-left" className="box">
            fade-left
          </sx-animate>
          <sx-animate type="fade-left" className="box">
            fade-left
          </sx-animate>
          <sx-animate type="fade-left" className="box">
            fade-left
          </sx-animate>
          <sx-animate type="fade-left" className="box">
            fade-left
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-right" className="box">
            fade-right
          </sx-animate>
          <sx-animate type="fade-right" className="box">
            fade-right
          </sx-animate>
          <sx-animate type="fade-right" className="box">
            fade-right
          </sx-animate>
          <sx-animate type="fade-right" className="box">
            fade-right
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-down" className="box">
            fade-down
          </sx-animate>
          <sx-animate type="fade-down" className="box">
            fade-down
          </sx-animate>
          <sx-animate type="fade-down" className="box">
            fade-down
          </sx-animate>
          <sx-animate type="fade-down" className="box">
            fade-down
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
        </div>
        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-up" className="box blue" group replay>
            REPLAY
          </sx-animate>
          <sx-animate type="fade-up" className="box blue" group replay>
            REPLAY
          </sx-animate>
          <sx-animate type="fade-up" className="box blue" group replay>
            REPLAY
          </sx-animate>
          <sx-animate type="fade-up" className="box blue" group replay>
            REPLAY
          </sx-animate>
        </div>

        <div className="flex-center gp-20 pb-20">
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
          <sx-animate type="fade-up" className="box" group>
            group
          </sx-animate>
        </div>

        <h2 style={{ height: "100vh" }} className="flex-center">
          <sx-animate type="fade" duration={800}>
            End
          </sx-animate>
        </h2>
      </>
    </LayoutProvider>
  );
}
