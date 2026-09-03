import React from 'react';
import BaseIcon from './BaseIcon.jsx';

export const ChevronLeftIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline points="15 18 9 12 15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default ChevronLeftIcon;
