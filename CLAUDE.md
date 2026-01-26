# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Unit Tests (Vitest)
npm run test             # Watch mode
npm run test:run         # Run once
npm run test:coverage    # With coverage report

# E2E Tests (Playwright)
npm run test:e2e         # Run headless
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:debug   # Debug mode
npm run test:e2e:ui      # Interactive UI mode
```

## Architecture

### App Structure (Next.js App Router)

- **`/`** - Discover page with swipeable event cards (SwipeStack component)
- **`/saved`** - User's saved events list
- **`/event/[id]`** - Public event detail page (SSR)
- **`/admin/*`** - Protected admin routes (login, CRUD for events)

### Key Directories

- `src/app/` - Next.js pages and layouts
- `src/components/` - React components (EventCard/, EventForm, EventDetail, etc.)
- `src/lib/` - Utilities: `supabase.ts` (DB ops), `types.ts` (Zod schemas), `storage.ts` (localStorage)
- `src/hooks/` - Custom hooks (useShare)
- `e2e/` - Playwright tests with Page Object Model in `e2e/pages/`

### Data Layer

**Supabase** is the backend. Key functions in `src/lib/supabase.ts`:
- `getEvents()`, `getEventById(id)`, `createEvent()`, `updateEvent()`, `deleteEvent()`

**Result Pattern** - All DB functions return `{ success: true, data } | { success: false, error }`. Always check `result.success` before accessing data.

**localStorage Keys**:
- `event-spark-saved-events` - Saved event IDs
- `event-spark-dismissed-events` - Dismissed (swiped left) event IDs

### Demo Mode

When `NEXT_PUBLIC_E2E_DEMO_MODE=true` or Supabase is unconfigured:
- Database operations use localStorage (`demo_events_storage`)
- Auth accepts `admin@example.com` / `admin` (stored in sessionStorage)
- Used for E2E tests and development without Supabase credentials

### Testing Patterns

**Vitest**: Unit tests in `*.test.ts` files. Setup mocks localStorage, matchMedia, ResizeObserver in `src/__tests__/setup.ts`.

**Playwright**: E2E tests in `e2e/*.e2e.ts`. Uses:
- Page objects in `e2e/pages/` (AdminLoginPage, DiscoverPage, etc.)
- Custom fixtures in `e2e/fixtures/base.fixture.ts` for seeding saved/dismissed events
- Demo mode for isolated testing without real database

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Optional:
```
NEXT_PUBLIC_E2E_DEMO_MODE=true  # Enable demo mode
```
