import React from 'react';
import BaseIcon from './BaseIcon.jsx';

export const ChevronDownIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline points="6 9 12 15 18 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default ChevronDownIcon;
