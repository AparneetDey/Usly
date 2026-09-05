import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Custom Retake / Rotate Counter-Clockwise Icon
 */
export const RotateCcwIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline
      points="1 4 1 10 7 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </BaseIcon>
);

export default RotateCcwIcon;
