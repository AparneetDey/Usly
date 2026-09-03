import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute Location Pin Icon for Trip events
 */
export const LocationPinIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    <path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </BaseIcon>
);

export default LocationPinIcon;
