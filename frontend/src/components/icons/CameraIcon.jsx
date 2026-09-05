import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Custom Camera Shutter Icon
 */
export const CameraIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle
      cx="12"
      cy="13"
      r="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </BaseIcon>
);

export default CameraIcon;
