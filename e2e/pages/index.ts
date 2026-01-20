/**
 * Page Objects for Event-Spark E2E Tests
 *
 * Re-exports all page objects for convenient importing:
 * import { DiscoverPage, SavedPage, EventDetailModal } from '../pages';
 */

// Base page class
export { BasePage } from './BasePage';

// Public-facing pages
export { DiscoverPage } from './DiscoverPage';
export { SavedPage } from './SavedPage';
export { EventDetailModal } from './EventDetailModal';

// Admin pages
export { AdminLoginPage } from './AdminLoginPage';
export { AdminEventsPage } from './AdminEventsPage';
export { AdminEventFormPage } from './AdminEventFormPage';
export type { EventFormData } from './AdminEventFormPage';

// Component objects
export { BottomNav } from './components/BottomNav';
