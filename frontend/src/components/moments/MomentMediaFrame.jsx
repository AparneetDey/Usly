import React from 'react';
import styles from './Moments.module.css';

/**
 * Reusable Moment Media Frame
 * Used by both MomentCreatorModal preview and MomentViewerModal viewer to guarantee
 * 100% identical positioning, aspect ratio, scaling, and framing.
 */
const MomentMediaFrame = ({
  media,
  alt = 'Moment Media',
  videoRef,
  controls = true,
  autoPlay = false,
  onVideoTimeUpdate,
  onVideoEnded,
  onVideoCanPlay,
  onVideoLoadedData,
  onVideoWaiting,
  onVideoPlaying,
  onVideoError,
  isDragging = false,
  children,
  className = '',
}) => {
  const transform = media?.transform || {};
  const scale = Number(transform.scale) || 1;
  const x = Number(transform.x) || 0;
  const y = Number(transform.y) || 0;

  // Responsive percentage transform: translateX(x * 100%), translateY(y * 100%), scale(scale)
  const mediaTransformStyle = {
    transform: `translate3d(${x * 100}%, ${y * 100}%, 0) scale(${scale})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const isVideo = media?.type === 'video';

  return (
    <div className={`${styles.mediaContainer} ${className}`}>
      <div className={styles.mediaWrapper}>
        {isVideo ? (
          <video
            ref={videoRef}
            src={media.url}
            controls={controls}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            playsInline
            autoPlay={autoPlay}
            preload="auto"
            onTimeUpdate={onVideoTimeUpdate}
            onEnded={onVideoEnded}
            onCanPlay={onVideoCanPlay}
            onLoadedData={onVideoLoadedData}
            onWaiting={onVideoWaiting}
            onPlaying={onVideoPlaying}
            onError={onVideoError}
            className={styles.momentMedia}
            style={mediaTransformStyle}
          />
        ) : (
          <img
            src={media.url}
            alt={alt}
            className={styles.momentMedia}
            style={mediaTransformStyle}
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default MomentMediaFrame;
