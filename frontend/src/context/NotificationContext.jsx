import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationApiService from '../services/notification.service.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

/**
 * Utility to convert base64 VAPID key to Uint8Array required by PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array();
  const cleanKey = base64String.trim().replace(/^["']|["']$/g, '');
  const padding = '='.repeat((4 - (cleanKey.length % 4)) % 4);
  const base64 = (cleanKey + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Check Web Push browser support & permission on mount
  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setPushSupported(isSupported);

    if (isSupported) {
      setPushPermission(Notification.permission);
      // Register service worker if supported
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            setPushSubscribed(!!sub);
          });
        })
        .catch((err) => {
          console.warn('[SW Registration Notice]', err.message);
        });
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationApiService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Non-critical background polling failure
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationApiService.getNotifications(params);
      setNotifications(data);
      await fetchUnreadCount();
    } catch (error) {
      console.error('[NotificationContext] fetchNotifications error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Initial load and periodic unread count polling (every 60s when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 60000);

      const handleFocus = () => fetchUnreadCount();
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      const updated = await notificationApiService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: updated.readAt } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationContext] markAsRead error:', error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApiService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationContext] markAllAsRead error:', error.message);
    }
  };

  /**
   * Explicit user-triggered action to request notification permission & subscribe to Web Push
   */
  const requestAndEnablePush = async () => {
    if (!pushSupported) {
      throw new Error('Web Push is not supported on this browser or platform.');
    }

    // 1. Request permission explicitly
    const permission = await Notification.requestPermission();
    setPushPermission(permission);

    if (permission !== 'granted') {
      throw new Error('Notification permission was denied. Please enable notifications in your browser settings.');
    }

    // 2. Fetch server public VAPID key
    const publicKey = await notificationApiService.getVapidPublicKey();
    if (!publicKey) {
      throw new Error('Server VAPID public key is not configured. Please check VAPID_PUBLIC_KEY in backend environment variables.');
    }

    // 3. Ensure Service Worker registration is ready
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    } catch {
      registration = await navigator.serviceWorker.ready;
    }

    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    // 4. Always unsubscribe any existing subscription first to prevent Chrome Key Mismatch push service errors
    let existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      console.log('[Web Push] Unsubscribing previous subscription to ensure clean key registration...');
      await existingSub.unsubscribe().catch((err) => {
        console.warn('[Web Push] Unsubscribe notice:', err.message);
      });
    }

    // 5. Subscribe freshly under active VAPID key
    let subscription;
    try {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      } catch (err) {
        console.warn('[Push Subscribe Retry] Uint8Array failed, trying ArrayBuffer view:', err.message);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey.buffer,
        });
      }
    } catch (err) {
      console.error('[Web Push Registration Error]', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
        throw new Error('Notification permission was denied. Please enable notifications in your browser settings.');
      }
      throw new Error(
        'Browser Push Service Error: Please verify Windows/OS notification settings are enabled, you are not in Incognito mode, and no firewall/ad-blocker is blocking Google FCM push services.'
      );
    }

    // 6. Send subscription JSON payload to backend
    await notificationApiService.subscribePush(subscription.toJSON());
    setPushSubscribed(true);
    return true;
  };

  /**
   * Disable push notifications on current device
   */
  const disablePush = async () => {
    if (!pushSupported) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await notificationApiService.unsubscribePush(subscription.endpoint);
      await subscription.unsubscribe();
    }

    setPushSubscribed(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        pushSupported,
        pushPermission,
        pushSubscribed,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        requestAndEnablePush,
        disablePush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
