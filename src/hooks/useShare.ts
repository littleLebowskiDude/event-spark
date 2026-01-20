'use client';

import { useState, useCallback } from 'react';
import { Event } from '@/lib/types';
import {
  generateShareUrl,
  canUseWebShare,
  shareNative,
  copyToClipboard,
  getSocialShareUrls,
  SocialShareUrls,
} from '@/lib/share';

interface UseShareReturn {
  /** Whether the Web Share API is available */
  canShare: boolean;
  /** Whether the share sheet is currently open */
  isShareSheetOpen: boolean;
  /** Whether the URL was just copied */
  isCopied: boolean;
  /** The shareable URL for the event */
  shareUrl: string;
  /** Social media share URLs */
  socialUrls: SocialShareUrls;
  /** Trigger the share action (native or fallback) */
  share: () => Promise<void>;
  /** Copy the share URL to clipboard */
  copy: () => Promise<boolean>;
  /** Open the fallback share sheet */
  openShareSheet: () => void;
  /** Close the fallback share sheet */
  closeShareSheet: () => void;
}

export function useShare(event: Event): UseShareReturn {
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = generateShareUrl(event.id);
  const socialUrls = getSocialShareUrls(event, shareUrl);
  const canShare = canUseWebShare();

  const share = useCallback(async () => {
    if (canShare) {
      const success = await shareNative(event, shareUrl);
      if (!success) {
        // Fallback to share sheet if native share fails
        setIsShareSheetOpen(true);
      }
    } else {
      setIsShareSheetOpen(true);
    }
  }, [event, shareUrl, canShare]);

  const copy = useCallback(async (): Promise<boolean> => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      // Reset after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    }
    return success;
  }, [shareUrl]);

  const openShareSheet = useCallback(() => {
    setIsShareSheetOpen(true);
  }, []);

  const closeShareSheet = useCallback(() => {
    setIsShareSheetOpen(false);
  }, []);

  return {
    canShare,
    isShareSheetOpen,
    isCopied,
    shareUrl,
    socialUrls,
    share,
    copy,
    openShareSheet,
    closeShareSheet,
  };
}
