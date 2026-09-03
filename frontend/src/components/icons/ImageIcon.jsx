import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Picture / Memories Gallery Icon
 */
export const ImageIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    {/* Frame */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cute Sun */}
    <circle cx="8.5" cy="8.5" r="2" stroke={color} strokeWidth="1.75" />
    {/* Mountains */}
    <path
      d="M21 16l-5-5-6 6-3-3-4 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);

export default ImageIcon;
