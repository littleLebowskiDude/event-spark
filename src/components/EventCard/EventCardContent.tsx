'use client';

import { Event } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface EventCardContentProps {
  event: Event;
}

/**
 * The bottom content section of an event card showing title, date, time, venue, and price.
 */
export default function EventCardContent({ event }: EventCardContentProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2">{event.title}</h2>

      <div className="flex flex-col gap-2 text-white/80 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{formatDate(event.start_date)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{formatTime(event.start_date)}</span>
        </div>

        {event.venue_name && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{event.venue_name}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mt-4">
        {event.is_free ? (
          <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            Free
          </span>
        ) : (
          event.price && (
            <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">
              {event.price}
            </span>
          )
        )}
      </div>
    </div>
  );
}
