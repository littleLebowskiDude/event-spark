'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Event, SwipeDirection } from '@/lib/types';
import { saveEventId, dismissEventId } from '@/lib/storage';
import EventCard from './EventCard';
import { Heart, X, RefreshCw } from 'lucide-react';

// Re-export SwipeDirection for consumers that import from SwipeStack
export type { SwipeDirection } from '@/lib/types';

interface SwipeStackProps {
  events: Event[];
  onEventTap: (event: Event) => void;
  onEmpty?: () => void;
}

export default function SwipeStack({ events, onEventTap, onEmpty }: SwipeStackProps) {
  // FIX: Replace Set-based tracking with simple index to prevent memory leak
  // The Set would grow unbounded as users swipe through events
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track programmatic swipe direction for button/keyboard animations
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);

  // Ref for keyboard focus management
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs to avoid stale closures in event handlers
  const stateRef = useRef({ currentIndex, exitDirection });
  stateRef.current = { currentIndex, exitDirection };

  // Calculate visible events using only index-based slicing (no Set filtering)
  const visibleEvents = events.slice(currentIndex, currentIndex + 3);
  const currentEvent = visibleEvents[0];
  const hasMoreEvents = currentIndex < events.length;

  // Handle swipe completion (from drag or programmatic)
  // Called after card animation finishes
  const handleSwipeComplete = (direction: SwipeDirection) => {
    const event = events[stateRef.current.currentIndex];
    if (!event) return;

    if (direction === 'right') {
      saveEventId(event.id);
    } else {
      dismissEventId(event.id);
    }

    // Move to next card
    setCurrentIndex(prev => prev + 1);

    // Reset exit direction after swipe is complete
    setExitDirection(null);

    // Check if we've run out of events
    if (stateRef.current.currentIndex >= events.length - 1) {
      onEmpty?.();
    }
  };

  // Handle drag-based swipes (immediate completion since card handles its own exit)
  const handleDragSwipe = (direction: SwipeDirection) => {
    handleSwipeComplete(direction);
  };

  // Handle button-triggered swipes with animation
  // Sets exit direction which triggers EventCard's animated exit
  const handleButtonSwipe = (direction: SwipeDirection) => {
    const event = events[stateRef.current.currentIndex];
    if (!event || stateRef.current.exitDirection !== null) return; // Prevent double-swipes

    // Set exit direction to trigger animated exit in EventCard
    setExitDirection(direction);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setExitDirection(null);
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if container or its children are focused
      if (!containerRef.current?.contains(document.activeElement) &&
          document.activeElement !== containerRef.current) {
        return;
      }

      const event = events[stateRef.current.currentIndex];

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleButtonSwipe('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleButtonSwipe('right');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (event) {
            onEventTap(event);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, onEventTap]);

  // Focus container on mount for immediate keyboard interaction
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  if (!hasMoreEvents || visibleEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mb-6">
          <RefreshCw className="w-10 h-10 text-muted" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No more events</h3>
        <p className="text-muted mb-6">You&apos;ve seen all the events for now. Check back later for more!</p>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent/90 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col outline-none"
      tabIndex={0}
      role="application"
      aria-label="Event card stack. Use arrow keys to swipe left or right, Enter or Space to view details."
      aria-live="polite"
    >
      {/* Screen reader announcement for current card */}
      <div className="sr-only" aria-atomic="true">
        Showing event {currentIndex + 1} of {events.length}: {currentEvent?.title}
      </div>

      {/* Card Stack */}
      <div className="relative flex-1 mx-4">
        <AnimatePresence>
          {visibleEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              onDragSwipe={handleDragSwipe}
              onAnimationComplete={handleSwipeComplete}
              onTap={() => onEventTap(event)}
              isTop={index === 0}
              index={index}
              exitDirection={index === 0 ? exitDirection : null}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-8 py-6">
        <button
          onClick={() => handleButtonSwipe('left')}
          className="w-16 h-16 rounded-full bg-card border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Pass on this event"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          onClick={() => handleButtonSwipe('right')}
          className="w-16 h-16 rounded-full bg-card border-2 border-green-500/50 flex items-center justify-center hover:bg-green-500/20 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Save this event"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="text-center text-xs text-muted pb-2 hidden sm:block">
        Use arrow keys to swipe, Enter to view details
      </div>
    </div>
  );
}
