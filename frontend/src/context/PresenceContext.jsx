import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import presenceApiService from '../services/presence.service.js';

// Centralized configuration intervals
const PRESENCE_HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
const PRESENCE_POLLING_INTERVAL_MS = 15 * 1000;   // 30 seconds
const PRESENCE_ONLINE_THRESHOLD_MS = 90 * 1000;  // 90 seconds

const PresenceContext = createContext({
  isOnline: false,
  lastSeenAt: null,
  loading: true,
  refreshPartnerPresence: () => {},
});

export const PresenceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [partnerPresence, setPartnerPresence] = useState({
    isOnline: false,
    lastSeenAt: null,
  });
  const [loading, setLoading] = useState(true);

  const heartbeatTimerRef = useRef(null);
  const pollingTimerRef = useRef(null);

  // Send a heartbeat to the server
  const sendHeartbeat = useCallback(async () => {
    if (!isAuthenticated) return;
    await presenceApiService.sendHeartbeat();
  }, [isAuthenticated]);

  // Fetch the partner's presence from the server
  const fetchPartnerPresence = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await presenceApiService.getPartnerPresence();
    if (data) {
      setPartnerPresence({
        isOnline: Boolean(data.isOnline),
        lastSeenAt: data.lastSeenAt || null,
      });
    }
    setLoading(false);
  }, [isAuthenticated]);

  // Start periodic heartbeat and polling intervals
  const startTimers = useCallback(() => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    heartbeatTimerRef.current = setInterval(() => {
      sendHeartbeat();
    }, PRESENCE_HEARTBEAT_INTERVAL_MS);

    pollingTimerRef.current = setInterval(() => {
      fetchPartnerPresence();
    }, PRESENCE_POLLING_INTERVAL_MS);
  }, [sendHeartbeat, fetchPartnerPresence]);

  // Stop periodic intervals (e.g. when app is backgrounded or user logs out)
  const stopTimers = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      stopTimers();
      setPartnerPresence({ isOnline: false, lastSeenAt: null });
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial heartbeat and partner presence fetch upon becoming active
    sendHeartbeat();
    fetchPartnerPresence();

    // Start background intervals if tab is currently visible
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      startTimers();
    }

    // Page visibility change handler: stop intervals when hidden, resume & ping immediately when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
        fetchPartnerPresence();
        startTimers();
      } else {
        stopTimers();
      }
    };

    // Network status online handler: reconnect immediately when network restored
    const handleOnline = () => {
      sendHeartbeat();
      fetchPartnerPresence();
      if (document.visibilityState === 'visible') {
        startTimers();
      }
    };

    // Network status offline handler: stop timers to avoid wasted requests
    const handleOffline = () => {
      stopTimers();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      stopTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, user, sendHeartbeat, fetchPartnerPresence, startTimers, stopTimers]);

  // Derive dynamic isOnline status against threshold in case local time expires between polling ticks
  const isOnlineDerived = Boolean(
    partnerPresence.isOnline &&
    partnerPresence.lastSeenAt &&
    Date.now() - new Date(partnerPresence.lastSeenAt).getTime() <= PRESENCE_ONLINE_THRESHOLD_MS
  );

  return (
    <PresenceContext.Provider
      value={{
        isOnline: isOnlineDerived,
        lastSeenAt: partnerPresence.lastSeenAt,
        loading,
        refreshPartnerPresence: fetchPartnerPresence,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};

export const usePartnerPresence = () => {
  return useContext(PresenceContext);
};

export const usePresence = usePartnerPresence;

export default PresenceContext;
