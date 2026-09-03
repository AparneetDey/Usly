import React from 'react';
import BaseIcon from './BaseIcon.jsx';

export const ChevronRightIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default ChevronRightIcon;
