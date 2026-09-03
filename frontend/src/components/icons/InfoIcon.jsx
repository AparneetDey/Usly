import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Info Icon
 */
export const InfoIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="12" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </BaseIcon>
);

export default InfoIcon;
