import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Custom Front/Rear Switch Camera Icon
 */
export const SwitchCameraIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8h-3l4 4 4-4h-3c0-3.3 2.7-6 6-6s6 2.7 6 6h-3l4 4 4-4h-3z"
      fill={color}
    />
    <path
      d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8h3l-4-4-4 4h3c0 3.3-2.7 6-6 6s-6-2.7-6-6h3l-4-4-4 4h3z"
      fill={color}
    />
  </BaseIcon>
);

export default SwitchCameraIcon;
