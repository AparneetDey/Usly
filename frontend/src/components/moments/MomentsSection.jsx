import React, { useState } from 'react';
import { PlusIcon, HeartIcon } from '../icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import useMoments from '../../hooks/useMoments.js';
import { MomentSkeleton } from '../ui/Skeleton/index.js';
import MomentCreatorModal from './MomentCreatorModal.jsx';
import MomentViewerModal from './MomentViewerModal.jsx';
import styles from './Moments.module.css';

const MomentsSection = () => {
  const { user, partner } = useAuth();
  const {
    moments,
    loading,
    createMoment,
    deleteMoment,
    addReaction,
    removeReaction,
    addComment,
    deleteComment,
  } = useMoments();

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const userMoments = moments.filter((m) => (m.createdBy?._id || m.createdBy) === user?._id);
  const partnerMoments = moments.filter((m) => (m.createdBy?._id || m.createdBy) === partner?._id);

  // Chronologically sort all active moments (oldest active first for story playback queue)
  const chronologicalActiveMoments = [...moments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const handleOpenUserMoments = () => {
    if (userMoments.length > 0) {
      // Find the oldest active moment for the user to start playback from
      const userMomentsOldestFirst = [...userMoments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const targetId = userMomentsOldestFirst[0]?._id;
      const idx = chronologicalActiveMoments.findIndex((m) => m._id === targetId);

      setInitialIndex(idx >= 0 ? idx : 0);
      setIsViewerOpen(true);
    } else {
      setIsCreatorOpen(true);
    }
  };

  const handleOpenPartnerMoments = () => {
    if (partnerMoments.length > 0) {
      // Find the oldest active moment for the partner to start playback from
      const partnerMomentsOldestFirst = [...partnerMoments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const targetId = partnerMomentsOldestFirst[0]?._id;
      const idx = chronologicalActiveMoments.findIndex((m) => m._id === targetId);

      setInitialIndex(idx >= 0 ? idx : 0);
      setIsViewerOpen(true);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={styles.momentsSection}>
      <div className={styles.momentsHeader}>
        <div>
          <h2 className={styles.momentsTitle}>
            <HeartIcon size={18} filled className="text-accent" />
            <span>24-Hour Moments</span>
          </h2>
          <span className={styles.momentsSubtitle}>
            Share quick snippets that vanish after 24 hours
          </span>
        </div>

        <button
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover bg-surface-alt hover:bg-border/60 px-3 py-1.5 rounded-full transition-colors"
        >
          <PlusIcon size={14} />
          <span>Add Moment</span>
        </button>
      </div>

      {loading ? (
        <div className="py-1">
          <MomentSkeleton />
        </div>
      ) : (
        <div className={styles.storyRow}>
          {/* Your Moment Badge */}
          <button className={styles.storyItem} onClick={handleOpenUserMoments}>
            <div className={`${styles.avatarRing} ${userMoments.length > 0 ? styles.activeRing : ''}`}>
              <div className={styles.avatarInner}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              {userMoments.length === 0 ? (
                <div className={styles.addBadge}>
                  <PlusIcon size={12} />
                </div>
              ) : userMoments.length > 1 ? (
                <div className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface shadow-sm">
                  {userMoments.length}
                </div>
              ) : null}
            </div>
            <span className={styles.storyName}>You</span>
          </button>

          {/* Partner's Moment Badge */}
          {partner && (
            <button
              className={styles.storyItem}
              onClick={handleOpenPartnerMoments}
              disabled={partnerMoments.length === 0}
            >
              <div className={`${styles.avatarRing} ${partnerMoments.length > 0 ? styles.activeRing : ''}`}>
                <div className={styles.avatarInner}>
                  {partner.avatar ? (
                    <img src={partner.avatar} alt={partner.name} className={styles.avatarImg} />
                  ) : (
                    getInitials(partner.name)
                  )}
                </div>
                {partnerMoments.length > 1 && (
                  <div className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface shadow-sm">
                    {partnerMoments.length}
                  </div>
                )}
              </div>
              <span className={styles.storyName}>{partner.name}</span>
            </button>
          )}
        </div>
      )}

      {/* Creator Modal */}
      <MomentCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreate={createMoment}
        loading={loading}
      />

      {/* Multi-Moment Viewer Modal */}
      <MomentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        momentsList={chronologicalActiveMoments}
        initialIndex={initialIndex}
        currentUserId={user?._id}
        onDelete={async (id) => {
          await deleteMoment(id);
        }}
        onAddReaction={async (id, reaction) => {
          await addReaction(id, reaction);
        }}
        onRemoveReaction={async (id) => {
          await removeReaction(id);
        }}
        onAddComment={async (id, msg) => {
          await addComment(id, msg);
        }}
        onDeleteComment={async (id, commentId) => {
          await deleteComment(id, commentId);
        }}
      />
    </div>
  );
};

export default MomentsSection;
