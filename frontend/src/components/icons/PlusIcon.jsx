import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Plus Icon
 */
export const PlusIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </BaseIcon>
);

export default PlusIcon;
