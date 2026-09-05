import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Eye Icon for viewing password or hidden content
 */
export const EyeIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);

export default EyeIcon;
