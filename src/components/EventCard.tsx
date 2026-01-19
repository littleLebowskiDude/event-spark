/**
 * Re-export EventCard from the EventCard folder for backward compatibility.
 * The component has been split into smaller sub-components:
 * - EventCard/index.tsx - Main component
 * - EventCard/SwipeIndicator.tsx - SAVE/PASS overlay
 * - EventCard/EventCardBadges.tsx - Category and date badges
 * - EventCard/EventCardContent.tsx - Bottom content section
 */
export { default } from './EventCard/index';
