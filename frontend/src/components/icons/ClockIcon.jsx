import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Clock Icon
 */
export const ClockIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default ClockIcon;
