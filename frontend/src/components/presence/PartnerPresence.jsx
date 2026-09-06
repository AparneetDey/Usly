import React from 'react';
import { usePartnerPresence } from '../../context/PresenceContext.jsx';
import { formatLastSeen } from '../../utils/formatLastSeen.js';
import Skeleton from '../ui/Skeleton/Skeleton.jsx';
import styles from './PartnerPresence.module.css';

/**
 * Reusable component to display partner'"'"'s online status or last seen timestamp
 */
export const PartnerPresence = ({
  partner,
  showAvatar = false,
  showName = false,
  className = '',
}) => {
  const { isOnline, lastSeenAt, loading } = usePartnerPresence();

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`} aria-busy="true">
        <Skeleton width="65px" height="12px" borderRadius="4px" />
      </div>
    );
  }

  const formattedLastSeen = formatLastSeen(lastSeenAt);

  return (
    <div className={`${styles.container} ${className}`}>
      {showAvatar && partner && (
        <div className={styles.avatarWrapper}>
          {partner.avatar ? (
            <img src={partner.avatar} alt={partner.name} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>
              {partner.name ? partner.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          {isOnline && <span className={styles.avatarOnlineDot} aria-hidden="true" />}
        </div>
      )}

      <div className={styles.contentWrapper}>
        {showName && partner && (
          <span className={styles.partnerName}>{partner.name}</span>
        )}

        <div
          className={`${styles.presenceBadge} ${isOnline ? styles.online : styles.offline}`}
          title={isOnline ? "Online right now" : (formattedLastSeen || "Offline")}
        >
          {isOnline ? (
            <>
              <span className={styles.onlineDot} aria-hidden="true" />
              <span className={styles.statusText}>Online</span>
            </>
          ) : (
            <span className={styles.statusText}>
              {formattedLastSeen || "Offline"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerPresence;
