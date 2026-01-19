export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const formattedStart = formatDate(startDate);
  const formattedStartTime = formatTime(startDate);

  if (!endDate) {
    return `${formattedStart} at ${formattedStartTime}`;
  }

  const end = new Date(endDate);
  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return `${formattedStart}, ${formattedStartTime} - ${formatTime(endDate)}`;
  }

  return `${formattedStart} - ${formatDate(endDate)}`;
}

export function isUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function getDaysUntil(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRelativeDate(dateString: string): string {
  const days = getDaysUntil(dateString);

  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'Next week';
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
  return formatDate(dateString);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
