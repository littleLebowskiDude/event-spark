'use client';

import { EventCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EventCardBadgesProps {
  category: EventCategory | null;
  relativeDate: string;
}

/**
 * Renders the category and relative date badges positioned at the top of the card.
 */
export default function EventCardBadges({ category, relativeDate }: EventCardBadgesProps) {
  const categoryColor = category ? CATEGORY_COLORS[category] : 'bg-gray-500';
  const categoryLabel = category ? CATEGORY_LABELS[category] : 'Event';

  return (
    <>
      {/* Category Badge */}
      <div className="absolute top-4 left-4">
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold text-white', categoryColor)}>
          {categoryLabel}
        </span>
      </div>

      {/* Relative Date Badge */}
      <div className="absolute top-4 right-4">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            relativeDate === 'Today'
              ? 'bg-green-500 text-white'
              : relativeDate === 'Tomorrow'
              ? 'bg-yellow-500 text-black'
              : 'bg-white/20 text-white backdrop-blur-sm'
          )}
        >
          {relativeDate}
        </span>
      </div>
    </>
  );
}
