import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Menu Hamburger Icon
 */
export const MenuIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </BaseIcon>
);

export default MenuIcon;
