'use client';

interface EventCardSkeletonProps {
  /** Number of stacked skeleton cards to show */
  count?: number;
}

/**
 * Skeleton loader that matches the EventCard layout.
 * Shows a shimmer animation to indicate loading state.
 */
export default function EventCardSkeleton({ count = 2 }: EventCardSkeletonProps) {
  return (
    <div className="relative w-full h-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="absolute w-full h-full"
          style={{
            scale: 1 - index * 0.05,
            top: index * 10,
            zIndex: 10 - index,
          }}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-card shadow-2xl">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />

            {/* Category badge skeleton */}
            <div className="absolute top-4 left-4">
              <div className="w-20 h-6 rounded-full bg-gray-700 animate-pulse" />
            </div>

            {/* Date badge skeleton */}
            <div className="absolute top-4 right-4">
              <div className="w-16 h-6 rounded-full bg-gray-700 animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Title skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-7 bg-gray-700 rounded-lg w-3/4 animate-pulse" />
                <div className="h-7 bg-gray-700 rounded-lg w-1/2 animate-pulse" />
              </div>

              {/* Meta info skeletons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-700 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-700 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-700 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-40 animate-pulse" />
                </div>
              </div>

              {/* Price badge skeleton */}
              <div className="mt-4">
                <div className="w-16 h-7 rounded-full bg-gray-700 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for the action buttons below the card stack
 */
export function ActionButtonsSkeleton() {
  return (
    <div className="flex justify-center gap-8 py-6">
      <div className="w-16 h-16 rounded-full bg-card border-2 border-gray-700 animate-pulse" />
      <div className="w-16 h-16 rounded-full bg-card border-2 border-gray-700 animate-pulse" />
    </div>
  );
}

/**
 * Full swipe stack skeleton including cards and buttons
 */
export function SwipeStackSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 mx-4">
        <EventCardSkeleton count={2} />
      </div>
      <ActionButtonsSkeleton />
    </div>
  );
}
