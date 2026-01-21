'use client';

import { motion } from 'framer-motion';
import { Event, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import { formatDateRange, cn } from '@/lib/utils';
import { Calendar, MapPin, ExternalLink, X, Heart, XCircle } from 'lucide-react';
import { isEventSaved, saveEventId, removeEventId } from '@/lib/storage';
import { useState } from 'react';
import { useShare } from '@/hooks/useShare';
import ShareButton from './ShareButton';
import ShareSheet from './ShareSheet';
import OptimizedImage from '@/components/OptimizedImage';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onSave?: () => void;
  onPass?: () => void;
  showActions?: boolean;
}

export default function EventDetail({ event, onClose, onSave, onPass, showActions = true }: EventDetailProps) {
  // Initialize state directly from localStorage to avoid useEffect
  // This is safe because isEventSaved is a synchronous localStorage read
  const [isSaved, setIsSaved] = useState(() => isEventSaved(event.id));
  const {
    isShareSheetOpen,
    isCopied,
    shareUrl,
    socialUrls,
    share,
    copy,
    closeShareSheet,
  } = useShare(event);

  const handleSave = () => {
    if (isSaved) {
      removeEventId(event.id);
      setIsSaved(false);
    } else {
      saveEventId(event.id);
      setIsSaved(true);
      onSave?.();
    }
  };

  const categoryColor = event.category ? CATEGORY_COLORS[event.category] : 'bg-gray-500';
  const categoryLabel = event.category ? CATEGORY_LABELS[event.category] : 'Event';

  const mapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96">
        <OptimizedImage
          src={event.image_url}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ShareButton onClick={share} />
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold text-white', categoryColor)}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-32 -mt-16 relative">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

        {/* Date & Time */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-medium">{formatDateRange(event.start_date, event.end_date)}</p>
            <p className="text-sm text-muted">Add to calendar</p>
          </div>
        </div>

        {/* Location */}
        {(event.venue_name || event.location) && (
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              {event.venue_name && <p className="font-medium">{event.venue_name}</p>}
              {event.location && (
                mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    {event.location}
                  </a>
                ) : (
                  <p className="text-sm text-muted">{event.location}</p>
                )
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mb-6">
          {event.is_free ? (
            <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
              Free Event
            </span>
          ) : event.price && (
            <span className="inline-block px-4 py-2 bg-card text-foreground rounded-full text-sm font-semibold">
              {event.price}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* External Link */}
        {event.ticket_url && (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-accent hover:underline mb-6"
          >
            <ExternalLink className="w-4 h-4" />
            <span>More info / Tickets</span>
          </a>
        )}
      </div>

      {/* Bottom Actions */}
      {showActions && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex gap-4 max-w-md mx-auto">
            {onPass && (
              <button
                onClick={() => {
                  onPass();
                  onClose();
                }}
                className="flex-1 py-3 px-6 bg-card border border-red-500/50 text-red-500 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Pass
              </button>
            )}
            <button
              onClick={handleSave}
              className={cn(
                'flex-1 py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors',
                isSaved
                  ? 'bg-green-500 text-black'
                  : 'bg-card border border-green-500/50 text-green-500 hover:bg-green-500/10'
              )}
            >
              <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={closeShareSheet}
        socialUrls={socialUrls}
        shareUrl={shareUrl}
        isCopied={isCopied}
        onCopy={copy}
      />
    </motion.div>
  );
}
