import React, { useState, useMemo } from 'react';
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
  const [activeCreatorId, setActiveCreatorId] = useState(null);
  const [initialIndex, setInitialIndex] = useState(0);

  // Normalize creator ID comparisons for MongoDB ObjectIds and populated objects
  const getCreatorId = (m) => String(m?.createdBy?._id || m?.createdBy || '');
  const currentUserIdStr = String(user?._id || user?.id || '');
  const partnerIdStr = String(partner?._id || partner?.id || '');

  const userMoments = moments.filter((m) => getCreatorId(m) === currentUserIdStr);
  const partnerMoments = moments.filter((m) => getCreatorId(m) === partnerIdStr);

  // Scoped sequence for the viewer: strictly contains only the selected creator's active moments, sorted chronologically
  const viewerMomentsList = useMemo(() => {
    if (!activeCreatorId) return [];
    return moments
      .filter((m) => getCreatorId(m) === String(activeCreatorId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [moments, activeCreatorId]);

  const handleOpenUserMoments = () => {
    if (userMoments.length > 0) {
      setActiveCreatorId(currentUserIdStr);
      setInitialIndex(0);
      setIsViewerOpen(true);
    } else {
      setIsCreatorOpen(true);
    }
  };

  const handleOpenPartnerMoments = () => {
    if (partnerMoments.length > 0) {
      setActiveCreatorId(partnerIdStr);
      setInitialIndex(0);
      setIsViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setActiveCreatorId(null);
    setInitialIndex(0);
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
            <span>Moments</span>
          </h2>
          <span className={styles.momentsSubtitle}>
            Share quick snippets of your life
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
        onClose={handleCloseViewer}
        momentsList={viewerMomentsList}
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
