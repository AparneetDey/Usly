import React from 'react';
import BaseIcon from './BaseIcon.jsx';

export const MoonIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default MoonIcon;
