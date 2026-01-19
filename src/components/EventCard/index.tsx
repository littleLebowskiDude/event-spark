'use client';

import { useRef, useLayoutEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimate, PanInfo } from 'framer-motion';
import { Event, SwipeDirection } from '@/lib/types';
import { getRelativeDate, cn } from '@/lib/utils';
import SwipeIndicator from './SwipeIndicator';
import EventCardBadges from './EventCardBadges';
import EventCardContent from './EventCardContent';

interface EventCardProps {
  event: Event;
  /** Called when user drags the card past threshold */
  onDragSwipe: (direction: SwipeDirection) => void;
  /** Called after programmatic swipe animation completes */
  onAnimationComplete: (direction: SwipeDirection) => void;
  onTap: () => void;
  isTop: boolean;
  index: number;
  /** When set, triggers a programmatic animated swipe (from button/keyboard) */
  exitDirection?: SwipeDirection | null;
}

const SWIPE_THRESHOLD = 100;
const EXIT_X = 400; // Distance to animate off-screen

/**
 * A draggable event card that can be swiped left (pass) or right (save).
 * Supports both drag gestures and programmatic animations via exitDirection.
 */
export default function EventCard({
  event,
  onDragSwipe,
  onAnimationComplete,
  onTap,
  isTop,
  index,
  exitDirection,
}: EventCardProps) {
  const x = useMotionValue(0);
  const [scope, animate] = useAnimate();

  // Track animation state without triggering re-renders via ref
  const isAnimatingRef = useRef(false);
  const lastExitDirectionRef = useRef<SwipeDirection | null>(null);

  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Indicator overlays - show based on x position during drag
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Handle programmatic swipes (button/keyboard) with animation
  // Using useLayoutEffect to avoid visual flicker
  useLayoutEffect(() => {
    if (!exitDirection || !isTop || isAnimatingRef.current) return;
    if (lastExitDirectionRef.current === exitDirection) return; // Prevent re-triggering same animation

    isAnimatingRef.current = true;
    lastExitDirectionRef.current = exitDirection;
    const targetX = exitDirection === 'right' ? EXIT_X : -EXIT_X;

    // Animate the card off-screen, then notify parent
    animate(
      scope.current,
      {
        x: targetX,
        rotate: exitDirection === 'right' ? 15 : -15,
        opacity: 0,
      },
      {
        duration: 0.3,
        ease: 'easeOut',
      }
    ).then(() => {
      // Notify parent that animation completed
      onAnimationComplete(exitDirection);
      isAnimatingRef.current = false;
    });
  }, [exitDirection, isTop, animate, scope, onAnimationComplete]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onDragSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onDragSwipe('left');
    }
  };

  const imageUrl = event.image_url || '/placeholder-event.svg';
  const relativeDate = getRelativeDate(event.start_date);

  // Show indicator during programmatic animation
  const showSaveIndicator = exitDirection === 'right' && isTop;
  const showPassIndicator = exitDirection === 'left' && isTop;

  return (
    <motion.div
      ref={scope}
      className={cn(
        'absolute w-full h-full cursor-grab active:cursor-grabbing',
        !isTop && 'pointer-events-none'
      )}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale: 1 - index * 0.05,
        y: index * 10,
        zIndex: 10 - index,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      onClick={() => isTop && onTap()}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 },
      }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-card shadow-2xl">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={`Event image for ${event.title}`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Swipe Indicators - only show on top card */}
        {isTop && (
          <>
            <SwipeIndicator
              direction="right"
              dragOpacity={likeOpacity}
              isAnimatingOut={showSaveIndicator}
            />
            <SwipeIndicator
              direction="left"
              dragOpacity={nopeOpacity}
              isAnimatingOut={showPassIndicator}
            />
          </>
        )}

        {/* Badges */}
        <EventCardBadges category={event.category} relativeDate={relativeDate} />

        {/* Content */}
        <EventCardContent event={event} />

        {/* Tap hint */}
        {isTop && (
          <div className="absolute bottom-4 right-4 text-white/40 text-xs">Tap for details</div>
        )}
      </div>
    </motion.div>
  );
}
