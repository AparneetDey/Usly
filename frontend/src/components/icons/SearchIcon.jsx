import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Search Icon with mini heart lens
 */
export const SearchIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20l-4.35-4.35" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default SearchIcon;
