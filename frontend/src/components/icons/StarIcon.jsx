import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Star Icon for Special Days
 */
export const StarIcon = ({ color = 'currentColor', filled = false, ...props }) => (
  <BaseIcon {...props}>
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);

export default StarIcon;
