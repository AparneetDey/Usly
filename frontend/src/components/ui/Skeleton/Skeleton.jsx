import React from 'react';
import styles from './Skeleton.module.css';

export const Skeleton = ({
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  className = '',
  style = {},
  count = 1,
}) => {
  const inlineStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...style,
  };

  const skeletonClass = `${styles.skeleton} ${styles[variant] || ''} ${className}`.trim();

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full" aria-busy="true" aria-live="polite">
        {Array.from({ length: count }).map((_, idx) => (
          <span key={idx} className={skeletonClass} style={inlineStyle} />
        ))}
      </div>
    );
  }

  return (
    <span
      className={skeletonClass}
      style={inlineStyle}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

export default Skeleton;
