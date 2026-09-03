import React from 'react';
import Skeleton from './Skeleton.jsx';

/**
 * Story ring skeleton placeholder for Moments section
 */
export const MomentSkeleton = () => (
  <div className="flex items-center gap-6" aria-busy="true">
    <div className="flex flex-col items-center gap-1.5">
      <Skeleton width="64px" height="64px" variant="circular" />
      <Skeleton width="48px" height="12px" variant="text" />
    </div>
    <div className="flex flex-col items-center gap-1.5">
      <Skeleton width="64px" height="64px" variant="circular" />
      <Skeleton width="48px" height="12px" variant="text" />
    </div>
  </div>
);

/**
 * Skeleton card matching summary cards on Home page
 */
export const SummaryCardSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm" aria-busy="true">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton width="20px" height="20px" variant="circular" />
          <Skeleton width="120px" height="18px" variant="text" />
        </div>
        <Skeleton width="60px" height="20px" borderRadius="999px" />
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton width="80%" height="20px" variant="text" />
        <Skeleton width="45%" height="14px" variant="text" />
        <Skeleton width="90%" height="14px" variant="text" />
      </div>
    </div>

    <div className="pt-3 border-t border-border mt-2 flex justify-between items-center">
      <Skeleton width="90px" height="14px" variant="text" />
      <Skeleton width="16px" height="16px" variant="circular" />
    </div>
  </div>
);

/**
 * Skeleton card matching LetterCard component
 */
export const LetterCardSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between h-48 shadow-sm" aria-busy="true">
    <div>
      <div className="flex items-center justify-between mb-3">
        <Skeleton width="28px" height="28px" variant="circular" />
        <Skeleton width="50px" height="16px" borderRadius="999px" />
      </div>
      <Skeleton width="75%" height="20px" variant="text" className="mb-2" />
      <Skeleton width="95%" height="14px" variant="text" />
      <Skeleton width="60%" height="14px" variant="text" />
    </div>
    <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
      <Skeleton width="110px" height="14px" variant="text" />
      <Skeleton width="70px" height="14px" variant="text" />
    </div>
  </div>
);

/**
 * Skeleton card matching ComplaintCard component
 */
export const ComplaintCardSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between h-44 shadow-sm" aria-busy="true">
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton width="24px" height="24px" variant="circular" />
          <Skeleton width="140px" height="18px" variant="text" />
        </div>
        <Skeleton width="65px" height="20px" borderRadius="999px" />
      </div>
      <Skeleton width="90%" height="14px" variant="text" />
      <Skeleton width="70%" height="14px" variant="text" />
    </div>
    <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
      <Skeleton width="100px" height="14px" variant="text" />
      <Skeleton width="40px" height="14px" variant="text" />
    </div>
  </div>
);

/**
 * Document-style skeleton for reading letters
 */
export const LetterDocumentSkeleton = () => (
  <div className="p-6 bg-surface border border-border rounded-xl space-y-4" aria-busy="true">
    <div className="flex justify-between items-center border-b border-border pb-3">
      <Skeleton width="120px" height="16px" variant="text" />
      <Skeleton width="90px" height="14px" variant="text" />
    </div>
    <div className="space-y-2 py-2">
      <Skeleton width="100%" height="16px" variant="text" />
      <Skeleton width="92%" height="16px" variant="text" />
      <Skeleton width="96%" height="16px" variant="text" />
      <Skeleton width="65%" height="16px" variant="text" />
      <Skeleton width="88%" height="16px" variant="text" />
      <Skeleton width="40%" height="16px" variant="text" />
    </div>
    <div className="flex justify-end pt-3 border-t border-border">
      <Skeleton width="100px" height="16px" variant="text" />
    </div>
  </div>
);

export default Skeleton;
