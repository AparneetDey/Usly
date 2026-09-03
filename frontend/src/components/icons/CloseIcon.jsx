import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Close / Cancel Icon
 */
export const CloseIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default CloseIcon;
