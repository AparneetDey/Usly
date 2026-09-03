import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Logout Icon
 */
export const LogOutIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default LogOutIcon;
