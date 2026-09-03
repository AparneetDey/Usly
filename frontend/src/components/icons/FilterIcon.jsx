import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Filter Sliders Icon
 */
export const FilterIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="6" r="2.5" fill={color} />
    <circle cx="16" cy="12" r="2.5" fill={color} />
    <circle cx="10" cy="18" r="2.5" fill={color} />
  </BaseIcon>
);

export default FilterIcon;
