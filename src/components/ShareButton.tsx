'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  onClick: () => void;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function ShareButton({ onClick, variant = 'icon', className }: ShareButtonProps) {
  if (variant === 'full') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full',
          'hover:bg-black/70 transition-colors text-white text-sm font-medium',
          className
        )}
        aria-label="Share event"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm',
        'flex items-center justify-center hover:bg-black/70 transition-colors',
        className
      )}
      aria-label="Share event"
    >
      <Share2 className="w-5 h-5 text-white" />
    </button>
  );
}
