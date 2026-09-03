import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Checkmark Icon
 */
export const CheckIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </BaseIcon>
);

export default CheckIcon;
