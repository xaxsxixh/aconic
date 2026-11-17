"use client";

import { useRef, type PointerEvent } from "react";

export function CampusHeroArt() {
  const sceneRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    sceneRef.current?.style.setProperty("--scene-tilt-x", `${x * 4}deg`);
    sceneRef.current?.style.setProperty("--scene-tilt-y", `${y * -3}deg`);
  }

  function resetPointer() {
    sceneRef.current?.style.setProperty("--scene-tilt-x", "0deg");
    sceneRef.current?.style.setProperty("--scene-tilt-y", "0deg");
  }

  return (
    <div
      ref={sceneRef}
      className="hero-art relative mx-auto w-full max-w-[620px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-hidden="true"
    >
      <div className="hero-scene">
        <div className="scene-halo" />
        <div className="scene-camera">
          <div className="campus-platform">
            <div className="platform-lower" />
            <div className="platform-top">
              <span className="campus-walkway" />
              <span className="campus-lawn campus-lawn-one" />
              <span className="campus-lawn campus-lawn-two" />
            </div>
          </div>

          <div className="campus-building campus-building-main">
            <div className="building-roof" />
            <div className="building-front">
              <div className="building-mark">A</div>
              <div className="building-windows" />
              <div className="building-door" />
            </div>
            <div className="building-side">
              <div className="building-side-windows" />
            </div>
          </div>

          <div className="campus-building campus-building-left">
            <div className="building-roof" />
            <div className="building-front">
              <div className="building-windows" />
              <div className="building-door" />
            </div>
            <div className="building-side" />
          </div>

          <div className="campus-building campus-building-right">
            <div className="building-roof" />
            <div className="building-front">
              <div className="building-windows" />
              <div className="building-door" />
            </div>
            <div className="building-side" />
          </div>

          <div className="scene-report scene-card">
            <div className="scene-card-heading">
              <span className="scene-icon">!</span>
              <span className="scene-eyebrow">New report</span>
              <span className="scene-menu-dots">•••</span>
            </div>
            <strong>Campus issue</strong>
            <span className="scene-card-meta">Location · Category</span>
            <span className="scene-report-status"><span /> Received</span>
          </div>

          <div className="scene-status scene-card">
            <span className="scene-eyebrow">Issue progress</span>
            <div className="scene-status-track">
              <span className="scene-status-step is-current"><i>1</i><b>Received</b></span>
              <span className="scene-status-line is-current" />
              <span className="scene-status-step"><i>2</i><b>In progress</b></span>
              <span className="scene-status-line" />
              <span className="scene-status-step"><i>3</i><b>Fixed</b></span>
            </div>
          </div>

          <div className="scene-location-pin">
            <span className="pin-shadow" />
            <span className="pin-head"><span /></span>
            <span className="pin-stem" />
          </div>

          <div className="scene-impact scene-card">
            <span className="scene-impact-icon">+</span>
            <span><strong>Student impact</strong><small>Shared support is visible</small></span>
          </div>

          <div className="scene-resolved scene-card">
            <span className="scene-resolved-icon">✓</span>
            <span><strong>Campus, improved</strong><small>Every report moves us forward</small></span>
          </div>
        </div>

        <div className="scene-caption">
          <span className="scene-caption-mark" />
          <span><strong>One campus. Shared progress.</strong><small>From the first report to a better space</small></span>
        </div>
      </div>
    </div>
  );
}
