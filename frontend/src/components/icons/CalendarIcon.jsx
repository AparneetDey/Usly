import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Calendar Icon with prominent filled heart motif
 */
export const CalendarIcon = ({ color = 'currentColor', heartColor, ...props }) => {
  const hColor = heartColor || color;

  return (
    <BaseIcon {...props}>
      {/* Calendar outer box */}
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="3.5"
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
      {/* Header divider line */}
      <path
        d="M3 9h18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Prominent, bold, cute filled heart in center of calendar grid */}
      <path
        d="M12 17.8l-.88-.8c-3.12-2.83-5.17-4.69-5.17-6.95 0-1.84 1.45-3.3 3.3-3.3 1.04 0 2.04.48 2.75 1.25.71-.77 1.71-1.25 2.75-1.25 1.85 0 3.3 1.46 3.3 3.3 0 2.26-2.05 4.12-5.17 6.95l-.88.8z"
        fill={hColor}
      />
    </BaseIcon>
  );
};

export default CalendarIcon;
