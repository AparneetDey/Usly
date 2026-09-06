/**
 * Format a lastSeenAt ISO string / timestamp into human-friendly relative/calendar text
 * Uses the user's local device timezone
 */
export const formatLastSeen = (dateInput) => {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If in the future or under 1 minute
  if (diffMs < 60 * 1000) {
    return "Last online just now";
  }

  // Under 60 minutes
  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.floor(diffMs / (60 * 1000));
    return mins <= 1 ? "Last online 1 minute ago" : `Last online ${mins} minutes ago`;
  }

  // Format local time (e.g., "8:42 PM")
  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Today
  if (isSameDay(date, now)) {
    return `Last online today at ${timeStr}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Last seen yesterday at ${timeStr}`;
  }

  // Current year (e.g., "6 Sep at 11:15 PM")
  if (date.getFullYear() === now.getFullYear()) {
    const dayMonth = date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
    return `Last seen ${dayMonth} at ${timeStr}`;
  }

  // Past years (e.g., "6 Sep 2025 at 11:15 PM")
  const fullDate = date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Last seen ${fullDate} at ${timeStr}`;
};

export default formatLastSeen;
