/**
 * Formats a date string or timestamp into a human-readable relative time string.
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Format status key into human-readable label
 */
export function formatStatus(status) {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'open':
      return 'Open';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  }
}

/**
 * Format category key into human-readable label
 */
export function formatCategory(category) {
  if (!category) return '';
  switch (category) {
    case 'wifi':
      return 'Wi-Fi';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}
