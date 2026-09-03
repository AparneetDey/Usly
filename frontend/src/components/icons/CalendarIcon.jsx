import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Calendar Icon with mini heart motif
 */
export const CalendarIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    {/* Calendar outer box */}
    <rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Top binder rings */}
    <path
      d="M8 2v4M16 2v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Divider line */}
    <path
      d="M3 9h18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Cute center heart */}
    <path
      d="M12 16.5l-.65-.6c-2.3-2.08-3.85-3.48-3.85-5.18 0-1.39 1.09-2.47 2.47-2.47.78 0 1.53.36 2.03.94.5-.58 1.25-.94 2.03-.94 1.38 0 2.47 1.08 2.47 2.47 0 1.7-1.55 3.1-3.85 5.19l-.65.59z"
      fill={color}
      opacity="0.85"
    />
  </BaseIcon>
);

export default CalendarIcon;
