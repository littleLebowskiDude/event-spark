'use client';

import { Event } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { removeEventId } from '@/lib/storage';

interface SavedEventsListProps {
  events: Event[];
  onEventTap: (event: Event) => void;
  onRemove: (eventId: string) => void;
}

export default function SavedEventsList({ events, onEventTap, onRemove }: SavedEventsListProps) {
  const handleRemove = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    removeEventId(eventId);
    onRemove(eventId);
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
        <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-muted" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved events</h3>
        <p className="text-muted">Swipe right on events you like to save them here.</p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const date = formatDate(event.start_date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  return (
    <div className="pb-24">
      <AnimatePresence>
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-semibold text-muted px-4 mb-2 sticky top-0 bg-background py-2">
              {date}
            </h3>
            <div className="space-y-2 px-4">
              {dateEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  onClick={() => onEventTap(event)}
                  className="bg-card rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-card-hover transition-colors"
                >
                  {/* Thumbnail */}
                  <div
                    className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${event.image_url || '/placeholder-event.svg'})` }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1 line-clamp-1">{event.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTime(event.start_date)}</span>
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center gap-1 text-sm text-muted">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{event.venue_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(e, event.id)}
                    className="p-2 text-muted hover:text-red-500 transition-colors self-center"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
