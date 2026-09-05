import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Custom Video Recorder Icon
 */
export const VideoIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polygon
      points="23 7 16 12 23 17 23 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect
      x="1"
      y="5"
      width="15"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </BaseIcon>
);

export default VideoIcon;
