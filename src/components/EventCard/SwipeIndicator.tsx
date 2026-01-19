'use client';

import { motion, MotionValue } from 'framer-motion';
import type { SwipeDirection } from '@/lib/types';

interface SwipeIndicatorProps {
  /** Direction this indicator represents */
  direction: SwipeDirection;
  /** Motion value for drag-based opacity */
  dragOpacity: MotionValue<number>;
  /** Whether this direction is currently animating out */
  isAnimatingOut: boolean;
}

/**
 * Swipe indicator overlay that shows SAVE or PASS during drag or button swipes.
 * Displays in the top corner of the card with a rotated label.
 */
export default function SwipeIndicator({
  direction,
  dragOpacity,
  isAnimatingOut,
}: SwipeIndicatorProps) {
  const isRight = direction === 'right';

  return (
    <motion.div
      className={`absolute top-8 ${isRight ? 'left-8' : 'right-8'} px-4 py-2 border-4 ${
        isRight ? 'border-green-500 rotate-[-20deg]' : 'border-red-500 rotate-[20deg]'
      } rounded-lg`}
      style={{ opacity: isAnimatingOut ? 1 : dragOpacity }}
      animate={isAnimatingOut ? { opacity: 1 } : undefined}
    >
      <span className={`text-3xl font-black ${isRight ? 'text-green-500' : 'text-red-500'}`}>
        {isRight ? 'SAVE' : 'PASS'}
      </span>
    </motion.div>
  );
}
