import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Lock Icon with heart keyhole
 */
export const LockIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <rect x="5" y="11" width="14" height="10" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="15.5" r="1.5" fill={color} />
  </BaseIcon>
);

export default LockIcon;
