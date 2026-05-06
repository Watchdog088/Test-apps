export function timeAgo(date) {
  if (!date) return '';
  const ts = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60)    return 'now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return ts.toLocaleDateString();
}
