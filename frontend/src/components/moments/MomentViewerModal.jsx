import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CloseIcon,
  TrashIcon,
  SendIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../icons/index.js';
import Button from '../ui/Button/Button.jsx';
import Input from '../ui/Input/Input.jsx';
import MomentMediaFrame from './MomentMediaFrame.jsx';
import styles from './Moments.module.css';

const REACTION_OPTIONS = ['❤️', '🥰', '😍', '😂', '😢', '✨'];
const IMAGE_DURATION_MS = 5000;
const PROGRESS_STEP_MS = 50;

const MomentViewerModal = ({
  isOpen,
  onClose,
  momentsList = [],
  initialIndex = 0,
  currentUserId,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  onDeleteComment,
}) => {
  const activeMoments = Array.isArray(momentsList) ? momentsList : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  const [commentMessage, setCommentMessage] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [direction, setDirection] = useState('none');

  const videoRef = useRef(null);
  const wasOpenRef = useRef(false);

  // Sync index and reset states only when modal opens (false -> true)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const safeIndex = Math.min(Math.max(0, initialIndex), Math.max(0, activeMoments.length - 1));
      setCurrentIndex(safeIndex);
      setProgress(0);
      setIsPaused(false);
      setIsCommentFocused(false);
      setDirection('none');
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialIndex, activeMoments.length]);

  // Handle active moments array boundary/deletion sync
  useEffect(() => {
    if (isOpen && activeMoments.length === 0) {
      onClose();
    } else if (isOpen && currentIndex >= activeMoments.length) {
      setCurrentIndex(Math.max(0, activeMoments.length - 1));
    }
  }, [isOpen, activeMoments.length, currentIndex, onClose]);

  const currentMoment = activeMoments[currentIndex] || null;

  // Reset progress when current moment changes
  useEffect(() => {
    if (!currentMoment) return;
    setProgress(0);
  }, [currentMoment?._id]);

  // Next moment / auto-advance handler
  const handleNext = useCallback(() => {
    if (currentIndex < activeMoments.length - 1) {
      setDirection('next');
      setProgress(0);
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, activeMoments.length, onClose]);

  // Prev moment handler
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('prev');
      setProgress(0);
      setCurrentIndex((i) => i - 1);
    } else {
      setProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [currentIndex]);

  // Image Auto-Advance Engine (5-Second Timer)
  useEffect(() => {
    if (!isOpen || !currentMoment || currentMoment.media?.type === 'video' || isPaused || isCommentFocused) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextPct = prev + (PROGRESS_STEP_MS / IMAGE_DURATION_MS) * 100;
        if (nextPct >= 100) {
          clearInterval(interval);
          handleNext();
          return 0;
        }
        return nextPct;
      });
    }, PROGRESS_STEP_MS);

    return () => clearInterval(interval);
  }, [isOpen, currentMoment?._id, currentMoment?.media?.type, isPaused, isCommentFocused, handleNext]);

  // Video Autoplay & Pause Control
  useEffect(() => {
    if (!isOpen || !currentMoment || currentMoment.media?.type !== 'video' || !videoRef.current) {
      return;
    }

    if (isPaused || isCommentFocused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, currentMoment?._id, currentMoment?.media?.type, isPaused, isCommentFocused]);

  // Video Time Update & Ended Handlers
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const currentPct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentPct);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  // Keyboard Navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  if (!isOpen || !currentMoment) return null;

  const isCreator = (currentMoment.createdBy?._id || currentMoment.createdBy) === currentUserId;
  const creatorName = isCreator ? 'You' : currentMoment.createdBy?.name || 'Partner';

  const userReaction = currentMoment.reactions?.find(
    (r) => (r.userId?._id || r.userId) === currentUserId
  );

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const formatExpiresIn = (expiresStr) => {
    if (!expiresStr) return '';
    const diffMs = new Date(expiresStr) - new Date();
    if (diffMs <= 0) return 'Expired';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours < 1) return `Expires in ${diffMins}m`;
    return `Expires in ${diffHours}h`;
  };

  const handleReactionClick = (emoji) => {
    if (userReaction?.reaction === emoji) {
      onRemoveReaction(currentMoment._id);
    } else {
      onAddReaction(currentMoment._id, emoji);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentMessage.trim()) return;

    setSubmittingComment(true);
    try {
      await onAddComment(currentMoment._id, commentMessage.trim());
      setCommentMessage('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={styles.viewerOverlay} onClick={onClose}>
      <div className={styles.viewerCard} onClick={(e) => e.stopPropagation()}>
        {/* Segmented Story Progress Bar */}
        <div className="flex gap-1.5 px-4 pt-3 bg-surface">
          {activeMoments.map((m, idx) => {
            let widthPct = 0;
            if (idx < currentIndex) {
              widthPct = 100;
            } else if (idx === currentIndex) {
              widthPct = Math.min(100, Math.max(0, progress));
            } else {
              widthPct = 0;
            }

            return (
              <div
                key={m._id || idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 'next' : 'prev');
                  setProgress(0);
                  setCurrentIndex(idx);
                }}
                className="h-1 flex-1 bg-border rounded-full overflow-hidden cursor-pointer relative"
                title={`Moment ${idx + 1} of ${activeMoments.length}`}
              >
                <div
                  className="h-full bg-primary transition-all duration-75 ease-linear"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Header Bar */}
        <div className={styles.viewerHeader}>
          <div className={styles.creatorInfo}>
            <div className={styles.smallAvatar}>
              {currentMoment.createdBy?.avatar ? (
                <img src={currentMoment.createdBy.avatar} alt={creatorName} className="w-full h-full object-cover" />
              ) : (
                getInitials(creatorName)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className={styles.creatorName}>{creatorName}</h3>
                {activeMoments.length > 1 && (
                  <span className="text-[11px] font-bold text-muted bg-surface-alt px-1.5 py-0.2 rounded">
                    {currentIndex + 1}/{activeMoments.length}
                  </span>
                )}
              </div>
              <span className={styles.momentTime}>
                {formatRelativeTime(currentMoment.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCreator && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this moment?')) {
                    onDelete(currentMoment._id);
                  }
                }}
                className="p-1.5 text-muted hover:text-highlight transition-colors"
                title="Delete Moment"
              >
                <TrashIcon size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-muted hover:text-text transition-colors">
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Shared MomentMediaFrame with Touch/Mouse Hold to Pause */}
        <div
          className="relative flex-1 min-h-[280px] max-h-[min(52vh,460px)] bg-black overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Previous Moment Overlay Button */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
              title="Previous Moment (Left Arrow)"
            >
              <ChevronLeftIcon size={20} />
            </button>
          )}

          {/* Next Moment Overlay Button */}
          {activeMoments.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
              title="Next Moment (Right Arrow)"
            >
              <ChevronRightIcon size={20} />
            </button>
          )}

          {/* Render shared MomentMediaFrame with direction transition animation */}
          <div
            key={`${currentMoment._id}`}
            className={`w-full h-full ${direction === 'next' ? styles.slideNext : direction === 'prev' ? styles.slidePrev : ''}`}
          >
            <MomentMediaFrame
              media={currentMoment.media}
              alt={currentMoment.caption || 'Moment'}
              videoRef={videoRef}
              controls
              autoPlay={false}
              onVideoTimeUpdate={handleVideoTimeUpdate}
              onVideoEnded={handleVideoEnded}
            />
          </div>
        </div>

        {/* Caption */}
        {currentMoment.caption && (
          <div className={styles.captionBox}>
            <p className="m-0">{currentMoment.caption}</p>
          </div>
        )}

        {/* Reaction Emoji Picker */}
        <div className={styles.reactionsBar}>
          {REACTION_OPTIONS.map((emoji) => {
            const isSelected = userReaction?.reaction === emoji;
            const count = currentMoment.reactions?.filter((r) => r.reaction === emoji).length || 0;

            return (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`${styles.reactionBtn} ${isSelected ? styles.activeReaction : ''}`}
                title={isSelected ? 'Remove reaction' : 'React'}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="text-xs font-bold text-primary">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Comments Section */}
        <div className={styles.commentsContainer}>
          {(!currentMoment.comments || currentMoment.comments.length === 0) ? (
            <p className="text-xs text-muted italic text-center py-2">
              No comments yet. Leave a sweet message!
            </p>
          ) : (
            currentMoment.comments.map((c) => {
              const isCommentAuthor = (c.userId?._id || c.userId) === currentUserId;
              const authorName = isCommentAuthor ? 'You' : c.userId?.name || 'Partner';

              return (
                <div key={c._id} className={styles.commentItem}>
                  <div>
                    <span className={styles.commentAuthor}>{authorName}:</span>
                    <span className={styles.commentText}>{c.message}</span>
                  </div>
                  {isCommentAuthor && (
                    <button
                      onClick={() => onDeleteComment(currentMoment._id, c._id)}
                      className="p-1 text-muted hover:text-highlight transition-colors shrink-0"
                      title="Delete Comment"
                    >
                      <TrashIcon size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input with Focus Listener to Pause Auto-Advance */}
        <form onSubmit={handleSendComment} className={styles.commentForm}>
          <Input
            placeholder="Add a comment..."
            value={commentMessage}
            onChange={(e) => setCommentMessage(e.target.value)}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setIsCommentFocused(false)}
            className="flex-1"
          />
          <Button type="submit" variant="primary" loading={submittingComment} disabled={!commentMessage.trim()}>
            <SendIcon size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MomentViewerModal;
