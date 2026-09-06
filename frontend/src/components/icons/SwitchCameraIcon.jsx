import React from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Custom Switch/Flip Camera Icon for Usly
 * Features a camera silhouette with curved flip/switch arrows in the center lens.
 */
export const SwitchCameraIcon = ({ color = 'currentColor', size = 20, className = '', ...props }) => (
  <BaseIcon size={size} className={className} {...props}>
    {/* Camera Body Outline (natural 4:3 camera proportions) */}
    <path
      d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-2.5h5L16 7h3a2 2 0 0 1 2 2v10z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Upper Clockwise Flip Arrow - True Circle Arc */}
    <path
      d="M8.5 13.8a3.5 3.5 0 0 1 6.3-1.8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <polyline
      points="15 9.2 15 12 12.2 12"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Lower Clockwise Flip Arrow - True Circle Arc */}
    <path
      d="M15.5 14.2a3.5 3.5 0 0 1-6.3 1.8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <polyline
      points="9 18.8 9 16 11.8 16"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </BaseIcon>
);

export const CameraSwitchIcon = SwitchCameraIcon;
export default SwitchCameraIcon;
