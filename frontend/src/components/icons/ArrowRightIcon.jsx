import React from 'react';
import BaseIcon from './BaseIcon.jsx';

export const ArrowRightIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <polyline points="12 5 19 12 12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default ArrowRightIcon;
