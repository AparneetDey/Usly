import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Envelope / Letter Icon with heart seal
 */
export const MailIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    {/* Envelope Body */}
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Flap lines */}
    <path
      d="M3 7l9 6 9-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Heart seal */}
    <path
      d="M12 15l-.45-.4c-1.6-1.44-2.55-2.4-2.55-3.58 0-.96.75-1.72 1.71-1.72.54 0 1.06.25 1.41.65.35-.4.87-.65 1.41-.65.96 0 1.71.76 1.71 1.72 0 1.18-.95 2.14-2.55 3.59L12 15z"
      fill={color}
    />
  </BaseIcon>
);

export default MailIcon;
