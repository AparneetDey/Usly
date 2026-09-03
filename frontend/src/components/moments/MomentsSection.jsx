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
  const [selectedMomentsList, setSelectedMomentsList] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const userMoments = moments.filter((m) => (m.createdBy?._id || m.createdBy) === user?._id);
  const partnerMoments = moments.filter((m) => (m.createdBy?._id || m.createdBy) === partner?._id);

  const handleOpenUserMoments = () => {
    if (userMoments.length > 0) {
      setSelectedMomentsList(userMoments);
      setInitialIndex(0);
    } else {
      setIsCreatorOpen(true);
    }
  };

  const handleOpenPartnerMoments = () => {
    if (partnerMoments.length > 0) {
      setSelectedMomentsList(partnerMoments);
      setInitialIndex(0);
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
        isOpen={selectedMomentsList.length > 0}
        onClose={() => setSelectedMomentsList([])}
        momentsList={selectedMomentsList}
        initialIndex={initialIndex}
        currentUserId={user?._id}
        onDelete={async (id) => {
          await deleteMoment(id);
          setSelectedMomentsList((prev) => {
            const updated = prev.filter((m) => m._id !== id);
            if (updated.length === 0) {
              return [];
            }
            return updated;
          });
        }}
        onAddReaction={async (id, reaction) => {
          const updated = await addReaction(id, reaction);
          setSelectedMomentsList((prev) => prev.map((m) => (m._id === id ? updated : m)));
        }}
        onRemoveReaction={async (id) => {
          const updated = await removeReaction(id);
          setSelectedMomentsList((prev) => prev.map((m) => (m._id === id ? updated : m)));
        }}
        onAddComment={async (id, msg) => {
          const updated = await addComment(id, msg);
          setSelectedMomentsList((prev) => prev.map((m) => (m._id === id ? updated : m)));
        }}
        onDeleteComment={async (id, commentId) => {
          const updated = await deleteComment(id, commentId);
          setSelectedMomentsList((prev) => prev.map((m) => (m._id === id ? updated : m)));
        }}
      />
    </div>
  );
};

export default MomentsSection;
