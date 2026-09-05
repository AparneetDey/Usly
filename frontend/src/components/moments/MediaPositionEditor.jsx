import React, { useState, useRef, useEffect, useCallback } from 'react';
import MomentMediaFrame from './MomentMediaFrame.jsx';
import styles from './Moments.module.css';

const MIN_SCALE = 1.0;
const MAX_SCALE = 3.0;

/**
 * Interactive Media Positioning Editor
 * Provides drag/pan, pinch-zoom, mouse wheel zoom, clamping limits, and position reset.
 * Emits normalized transform metadata ({ scale, x, y }) to the parent component.
 */
const MediaPositionEditor = ({
  mediaUrl,
  mediaType = 'image',
  transform = { scale: 1, x: 0, y: 0 },
  onChange,
}) => {
  const containerRef = useRef(null);
  const activePointersRef = useRef(new Map());

  const [scale, setScale] = useState(transform.scale || 1);
  const [x, setX] = useState(transform.x || 0);
  const [y, setY] = useState(transform.y || 0);
  const [isDragging, setIsDragging] = useState(false);

  const initialDragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialPinchDist: 0,
  });

  // Clamp function ensuring media always covers the frame without empty gaps
  const clampTransform = useCallback((newScale, newX, newY) => {
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    const maxPan = (clampedScale - 1) / 2;
    const clampedX = Math.max(-maxPan, Math.min(maxPan, newX));
    const clampedY = Math.max(-maxPan, Math.min(maxPan, newY));

    return {
      scale: Number(clampedScale.toFixed(4)),
      x: Number(clampedX.toFixed(4)),
      y: Number(clampedY.toFixed(4)),
    };
  }, []);

  // Sync internal state if prop transform resets or changes
  useEffect(() => {
    const clamped = clampTransform(
      transform.scale || 1,
      transform.x || 0,
      transform.y || 0
    );
    setScale(clamped.scale);
    setX(clamped.x);
    setY(clamped.y);
  }, [transform.scale, transform.x, transform.y, clampTransform]);

  const updateTransformState = (newScale, newX, newY) => {
    const clamped = clampTransform(newScale, newX, newY);
    setScale(clamped.scale);
    setX(clamped.x);
    setY(clamped.y);
    if (onChange) {
      onChange(clamped);
    }
  };

  const handleReset = () => {
    updateTransformState(1, 0, 0);
  };

  const handleZoomChange = (delta) => {
    const targetScale = scale + delta;
    updateTransformState(targetScale, x, y);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    updateTransformState(scale + zoomFactor, x, y);
  };

  // Pointer Down (Mouse click or Touch start)
  const handlePointerDown = (e) => {
    if (!containerRef.current) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    containerRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 1) {
      initialDragRef.current = {
        startX: pointers[0].x,
        startY: pointers[0].y,
        initialX: x,
        initialY: y,
        initialScale: scale,
        initialPinchDist: 0,
      };
    } else if (pointers.length === 2) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      initialDragRef.current = {
        startX: (p1.x + p2.x) / 2,
        startY: (p1.y + p2.y) / 2,
        initialX: x,
        initialY: y,
        initialScale: scale,
        initialPinchDist: dist,
      };
    }
  };

  // Pointer Move (Mouse drag or Touch drag/pinch)
  const handlePointerMove = (e) => {
    if (!activePointersRef.current.has(e.pointerId) || !containerRef.current) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pointers = Array.from(activePointersRef.current.values());

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;

    if (pointers.length === 1) {
      const currentPoint = pointers[0];
      const deltaX = (currentPoint.x - initialDragRef.current.startX) / width;
      const deltaY = (currentPoint.y - initialDragRef.current.startY) / height;

      const targetX = initialDragRef.current.initialX + deltaX;
      const targetY = initialDragRef.current.initialY + deltaY;

      updateTransformState(scale, targetX, targetY);
    } else if (pointers.length === 2) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (initialDragRef.current.initialPinchDist > 0) {
        const pinchScaleRatio = dist / initialDragRef.current.initialPinchDist;
        const targetScale = initialDragRef.current.initialScale * pinchScaleRatio;

        const currentCenterX = (p1.x + p2.x) / 2;
        const currentCenterY = (p1.y + p2.y) / 2;
        const deltaX = (currentCenterX - initialDragRef.current.startX) / width;
        const deltaY = (currentCenterY - initialDragRef.current.startY) / height;

        const targetX = initialDragRef.current.initialX + deltaX;
        const targetY = initialDragRef.current.initialY + deltaY;

        updateTransformState(targetScale, targetX, targetY);
      }
    }
  };

  // Pointer Up / Cancel
  const handlePointerUp = (e) => {
    activePointersRef.current.delete(e.pointerId);
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    }
  };

  const currentTransform = { scale, x, y };
  const currentMedia = {
    url: mediaUrl,
    type: mediaType,
    transform: currentTransform,
  };

  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="flex flex-col gap-2">
      {/* Live Preview Container matching real Moment viewer frame */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`${styles.editorFrame} ${isDragging ? styles.isDragging : ''}`}
        title="Drag to position • Scroll/Pinch to zoom"
      >
        <MomentMediaFrame
          media={currentMedia}
          isDragging={isDragging}
          controls={false}
          autoPlay={mediaType === 'video'}
        >
          {/* <div className={styles.editorOverlayBadge}>
            Live Moment Preview
          </div> */}
        </MomentMediaFrame>
      </div>

      {/* Editor Control Toolbar */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleZoomChange(-0.15)}
            disabled={scale <= MIN_SCALE}
            className={styles.editorBtn}
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-xs font-bold text-text w-12 text-center select-none">
            {zoomPercentage}%
          </span>
          <button
            type="button"
            onClick={() => handleZoomChange(0.15)}
            disabled={scale >= MAX_SCALE}
            className={styles.editorBtn}
            title="Zoom In"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-bold text-primary hover:text-primary-hover px-2.5 py-1 rounded-full bg-surface-alt border border-border transition-colors"
        >
          Reset Position
        </button>
      </div>
      <p className="text-[11px] text-muted text-center m-0 select-none">
        Drag photo/video to reposition • Scroll or pinch to zoom
      </p>
    </div>
  );
};

export default MediaPositionEditor;
