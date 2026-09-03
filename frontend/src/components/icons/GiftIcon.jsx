import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Gift Icon for Birthday events
 */
export const GiftIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline points="20 12 20 22 4 22 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="2" y="7" width="20" height="5" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="22" x2="12" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default GiftIcon;
