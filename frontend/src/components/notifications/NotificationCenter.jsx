import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const NotificationCenter = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const priorityNotifications = notifications.filter((n) => n.importance === 'priority');
  const activityNotifications = notifications.filter((n) => n.importance === 'activity');

  const displayedNotifications =
    activeTab === 'priority'
      ? priorityNotifications
      : activeTab === 'activity'
      ? activityNotifications
      : notifications;

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
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

  return (
    <div className={styles.notificationDropdown} ref={dropdownRef}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.unreadCountBadge}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className={styles.markAllBtn}>
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'priority' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('priority')}
        >
          Priority ({priorityNotifications.length})
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
        {loading && notifications.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted">
            Loading notifications...
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💜</div>
            <p className={styles.emptyText}>
              {activeTab === 'priority'
                ? 'No priority notifications'
                : activeTab === 'activity'
                ? 'No activity updates yet'
                : 'Your notification center is clear!'}
            </p>
          </div>
        ) : (
          displayedNotifications.map((n) => {
            const isPriority = n.importance === 'priority';
            const actorName = n.actor?.name || 'Usly';

            return (
              <div
                key={n._id}
                onClick={() => handleItemClick(n)}
                className={`${styles.item} ${!n.isRead ? styles.unreadItem : ''} ${
                  isPriority ? styles.priorityItem : styles.activityItem
                }`}
              >
                {/* Actor Avatar */}
                <div className={styles.actorAvatar}>
                  {n.actor?.avatar ? (
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

                  {isPriority && (
                    <span className={styles.priorityTag}>Priority</span>
                  )}
                  {n.isExpired && (
                    <span className={styles.expiredTag}>Expired</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
