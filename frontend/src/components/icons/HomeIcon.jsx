import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Home Icon with heart door detail
 */
export const HomeIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    {/* Chimney */}
    <path d="M18 8.5V4h-2.5v2.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Roof & House body */}
    <path
      d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Heart door */}
    <path
      d="M12 17.2l-.35-.32c-1.25-1.12-1.95-1.87-1.95-2.78 0-.75.58-1.35 1.33-1.35.42 0 .82.2 1.1.5.28-.3.68-.5 1.1-.5.75 0 1.33.6 1.33 1.35 0 .91-.7 1.66-1.95 2.78L12 17.2z"
      fill={color}
    />
  </BaseIcon>
);

export default HomeIcon;
