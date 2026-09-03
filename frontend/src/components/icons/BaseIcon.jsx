import React from 'react';

/**
 * Base SVG Wrapper for Usly custom icon system
 */
const BaseIcon = ({
  size = 20,
  width,
  height,
  className = '',
  children,
  ariaLabel,
  viewBox = '0 0 24 24',
  ...props
}) => {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      {...props}
    >
      {children}
    </svg>
  );
};

export default BaseIcon;
