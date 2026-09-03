import React, { useState } from 'react';
import BaseIcon from './BaseIcon.jsx';

/**
 * Cute rounded Complaint / Ticket Icon with pouty speech bubble
 */
export const ComplaintIcon = ({ color = 'currentColor', ...props }) => (
  <BaseIcon {...props}>
    {/* Cute speech bubble shape */}
    <path
      d="M21 11.5C21 16.19 16.97 20 12 20C10.5 20 9.07 19.64 7.8 19L3 20.5L4.5 16.2C3.55 14.85 3 13.23 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Pouty / angry cute eyes */}
    <path
      d="M8.5 9.5L10 11M15.5 9.5L14 11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Pouty mouth */}
    <path
      d="M9.5 15C10.5 14 13.5 14 14.5 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </BaseIcon>
);

export default ComplaintIcon;
