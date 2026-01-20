import { Event } from './types';
import { formatDate } from './utils';

/**
 * Generate the full shareable URL for an event
 */
export function generateShareUrl(eventId: string): string {
  // Use window.location.origin in browser, fallback for SSR
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://eventspark.app';

  return `${baseUrl}/event/${eventId}`;
}

/**
 * Generate the share text for an event
 */
export function generateShareText(event: Event): string {
  const dateStr = formatDate(event.start_date);
  const venue = event.venue_name || event.location || '';

  if (venue) {
    return `Check out ${event.title} on ${dateStr} at ${venue}!`;
  }

  return `Check out ${event.title} on ${dateStr}!`;
}

/**
 * Social media share URL generators
 */
export interface SocialShareUrls {
  facebook: string;
  twitter: string;
  whatsapp: string;
  email: string;
}

export function getSocialShareUrls(event: Event, url: string): SocialShareUrls {
  const text = generateShareText(event);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

/**
 * Check if the Web Share API is available
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' &&
         'share' in navigator &&
         typeof navigator.share === 'function';
}

/**
 * Share using the native Web Share API
 */
export async function shareNative(event: Event, url: string): Promise<boolean> {
  if (!canUseWebShare()) {
    return false;
  }

  try {
    await navigator.share({
      title: event.title,
      text: generateShareText(event),
      url: url,
    });
    return true;
  } catch (error) {
    // User cancelled or share failed
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled - this is not an error
      return true;
    }
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
