/**
 * Presence Configuration Constants
 */

// Frequency at which active clients ping the server
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds

// Maximum time window since last heartbeat for a user to be considered online
export const PRESENCE_ONLINE_THRESHOLD_MS = 90 * 1000; // 90 seconds
