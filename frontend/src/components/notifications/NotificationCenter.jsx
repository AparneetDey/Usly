import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, TrashIcon, SparklesIcon } from '../icons/index.js';
import { useNotifications } from '../../context/NotificationContext.jsx';
import styles from './NotificationCenter.module.css';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = new Date() - new Date(dateStr);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getInitials = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

const NotificationCenter = ({ isOpen, onClose, bellButtonRef }) => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    deleteNotification,
    openInformativeModal,
    loading,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Freshly fetch notifications every time the notification center is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Handle ?notificationId= query param (e.g. from Web Push notification click)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const notificationId = searchParams.get('notificationId');

    const notifsList = Array.isArray(notifications) ? notifications : [];
    if (notificationId && notifsList.length > 0) {
      const target = notifsList.find((n) => n._id === notificationId);
      if (target) {
        if (!target.isRead) {
          markAsRead(target._id);
        }
        if (target.importance === 'informative' || target.type === 'USLY_UPDATE') {
          openInformativeModal(target);
        }
      }
      // Clean up URL query param without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [notifications, markAsRead, openInformativeModal]);

  // Close dropdown on click outside, but ignore clicks on the bell button itself (since bell button onClick toggles it)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (bellButtonRef?.current && bellButtonRef.current.contains(e.target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose, bellButtonRef]);

  if (!isOpen) return null;

  const notifsList = Array.isArray(notifications) ? notifications : [];
  const priorityNotifications = notifsList.filter((n) => n.importance === 'priority');
  const informativeNotifications = notifsList.filter(
    (n) => n.importance === 'informative' || n.type === 'USLY_UPDATE'
  );
  const activityNotifications = notifsList.filter(
    (n) => n.importance === 'activity' && n.type !== 'USLY_UPDATE'
  );

  const displayedNotifications =
    activeTab === 'priority'
      ? priorityNotifications
      : activeTab === 'informative'
      ? informativeNotifications
      : activeTab === 'activity'
      ? activityNotifications
      : notifsList;

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }

    if (n.importance === 'informative' || n.type === 'USLY_UPDATE') {
      onClose();
      openInformativeModal(n);
      return;
    }

    if (n.isExpired) {
      return; // Expired moments cannot be navigated to
    }

    onClose();

    // Entity URL resolution
    switch (n.entityType) {
      case 'Letter':
        navigate('/letters');
        break;
      case 'Complaint':
        navigate('/complaints');
        break;
      case 'Event':
        navigate('/calendar');
        break;
      case 'Moment':
        navigate('/');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      await deleteAllNotifications();
    }
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className={styles.mobileBackdrop}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className={styles.notificationDropdown} ref={dropdownRef}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <h3 className={styles.title}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className={styles.unreadCountBadge}>{unreadCount}</span>
                )}
              </div>

              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={styles.actionBtn}
                    title="Mark all as read"
                  >
                    <CheckIcon size={14} />
                    <span>Read all</span>
                  </button>
                )}

                {notifsList.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                    title="Delete all notifications"
                  >
                    <TrashIcon size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Bar */}
            <div className={styles.tabsBar}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({notifsList.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'priority' ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveTab('priority')}
              >
                Priority ({priorityNotifications.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'informative' ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveTab('informative')}
              >
                Informative ({informativeNotifications.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity ({activityNotifications.length})
              </button>
            </div>

            {/* Feed Container */}
            <div className={styles.listContainer}>
              {loading && notifsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted">
                  Loading notifications...
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💜</div>
                  <p className={styles.emptyText}>
                    {activeTab === 'priority'
                      ? 'No priority notifications'
                      : activeTab === 'informative'
                      ? 'No Usly updates yet'
                      : activeTab === 'activity'
                      ? 'No activity updates yet'
                      : 'Your notification center is clear!'}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((n) => {
                  const isPriority = n.importance === 'priority';
                  const isInformative = n.importance === 'informative' || n.type === 'USLY_UPDATE';
                  const actorName = isInformative ? 'Usly' : (n.actor?.name || 'Usly');
                  const isUnread = !n.isRead;

                  return (
                    <div
                      key={n._id}
                      onClick={() => handleItemClick(n)}
                      className={`${styles.item} ${
                        isUnread ? styles.unreadItem : styles.readItem
                      } ${
                        isPriority
                          ? styles.priorityItem
                          : isInformative
                          ? styles.informativeItem
                          : styles.activityItem
                      }`}
                    >
                      {/* Actor Avatar or Usly Sparkle Badge */}
                      <div
                        className={`${styles.actorAvatar} ${
                          isInformative ? styles.informativeAvatar : ''
                        }`}
                      >
                        {isInformative ? (
                          <SparklesIcon size={18} />
                        ) : n.actor?.avatar ? (
                          <img
                            src={n.actor.avatar}
                            alt={actorName}
                            className={styles.avatarImg}
                          />
                        ) : (
                          getInitials(actorName)
                        )}
                      </div>

                      {/* Content */}
                      <div className={styles.itemContent}>
                        <div className={styles.itemHeader}>
                          <h4 className={styles.itemTitle}>{n.title}</h4>
                          <span className={styles.itemTime}>
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>

                        <p className={styles.itemMessage}>{n.message}</p>

                        <div className="flex items-center gap-2 mt-1">
                          {isPriority && (
                            <span className={styles.priorityTag}>Priority</span>
                          )}
                          {isInformative && (
                            <span className={styles.informativeTag}>Usly Update</span>
                          )}
                          {n.isExpired && (
                            <span className={styles.expiredTag}>Expired</span>
                          )}
                        </div>
                      </div>

                      {/* Unread dot indicator */}
                      {isUnread && <div className={styles.unreadDot} title="Unread" />}

                      {/* Individual delete button */}
                      <button
                        onClick={(e) => handleDeleteItem(e, n._id)}
                        className={styles.itemDeleteBtn}
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationCenter;
