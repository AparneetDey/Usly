import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute User Profile Icon
 */
export const UserIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 21a6.5 6.5 0 0113 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default UserIcon;
