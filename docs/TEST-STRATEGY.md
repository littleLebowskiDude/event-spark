# Event Spark Test Strategy

## Overview

This document outlines the comprehensive test strategy for Event Spark, a Next.js 15 application with swipe-based event discovery. The application uses Framer Motion for animations, Supabase for backend services, and Zod for validation.

---

## 1. Unit Test Strategy

### 1.1 Scope
Unit tests focus on isolated pieces of functionality, testing individual functions, hooks, and pure components.

### 1.2 Technologies
- **Framework**: Vitest
- **Assertion Library**: Vitest built-in + @testing-library/jest-dom
- **Component Testing**: @testing-library/react
- **Mocking**: Vitest mocks

### 1.3 What to Unit Test

#### Utility Functions (`src/lib/utils.ts`)
| Function | Test Cases |
|----------|------------|
| `formatDate` | Valid date string, Invalid date, Edge cases (year boundaries) |
| `formatTime` | Morning/afternoon/midnight times, 12-hour format validation |
| `formatDateRange` | Same day events, Multi-day events, No end date |
| `isUpcoming` | Future dates, Past dates, Today |
| `getDaysUntil` | Positive days, Negative days, Same day |
| `getRelativeDate` | Today, Tomorrow, Within week, Within month, Far future, Past |
| `cn` | Multiple classes, Falsy values, Mixed booleans |

#### Storage Functions (`src/lib/storage.ts`)
| Function | Test Cases |
|----------|------------|
| `getSavedEventIds` | Empty storage, Existing IDs, SSR (window undefined) |
| `saveEventId` | New ID, Duplicate prevention, Persistence |
| `removeEventId` | Existing ID, Non-existent ID |
| `isEventSaved` | Saved event, Unsaved event |
| `getDismissedEventIds` | Empty storage, Existing IDs |
| `dismissEventId` | New ID, Duplicate prevention |
| `clearDismissed` | Clears all dismissed |

#### Zod Schemas (`src/lib/types.ts`)
| Schema | Test Cases |
|--------|------------|
| `EventCategorySchema` | Valid categories, Invalid category |
| `EventSchema` | Valid event, Missing required fields, Invalid URL, Field length limits |
| `CreateEventSchema` | Valid creation, Price required for paid events, End date validation |
| `EventFormSchema` | Form validation, Cross-field validation |

### 1.4 Coverage Targets
- **Utility Functions**: 100% line coverage
- **Storage Functions**: 100% line coverage
- **Zod Schemas**: 100% of validation rules tested
- **Pure Components**: 80% line coverage

---

## 2. Integration Test Strategy

### 2.1 Scope
Integration tests verify that multiple units work together correctly, focusing on data flows and component interactions.

### 2.2 Key Integration Points

#### Component + State Integration
| Test Area | Description |
|-----------|-------------|
| SwipeStack + Storage | Swiping right saves to localStorage, Swiping left dismisses |
| EventDetail + Storage | Save/unsave toggles correctly update storage |
| SavedEventsList + Storage | Removing events updates both UI and storage |
| EventForm + Validation | Form submission triggers Zod validation |

#### Data Flow Tests
| Flow | Test Cases |
|------|------------|
| Events Loading | Success state, Error state, Empty state |
| Saved Events Loading | Fetches IDs from storage, Queries Supabase, Handles missing events |
| Event Creation | Form data transforms to API format, Validation errors display |

### 2.3 Mock Strategy
- **Supabase**: Mock at the client level to test data transformation
- **localStorage**: Use in-memory mock (provided in setup.ts)
- **Router**: Mock Next.js navigation functions

---

## 3. E2E Test Strategy

### 3.1 Scope
End-to-end tests verify complete user flows from a user perspective.

### 3.2 Recommended Tool
Playwright (to be implemented in future iteration)

### 3.3 Critical User Flows

#### Flow 1: Event Discovery
```
1. User opens app
2. Events load and display as swipeable cards
3. User swipes right to save an event
4. Event animates off-screen with "SAVE" indicator
5. Next event appears
6. User swipes left to dismiss an event
7. Event animates off-screen with "PASS" indicator
```

#### Flow 2: View Saved Events
```
1. User navigates to Saved page
2. Previously saved events display in a list
3. User taps an event to view details
4. Event detail modal opens
5. User closes modal and returns to list
6. User removes an event from saved
7. Event disappears from list
```

#### Flow 3: Admin Event Creation
```
1. Admin logs into admin panel
2. Admin navigates to event management
3. Admin clicks "New Event"
4. Admin fills out form (valid data)
5. Admin submits form
6. Event is created successfully
7. Admin redirected to event list
```

#### Flow 4: Admin Event Creation (Validation)
```
1. Admin opens new event form
2. Admin submits empty form
3. Validation errors appear for required fields
4. Admin enters invalid URL
5. URL validation error appears
6. Admin marks event as paid but no price
7. Price required error appears
```

### 3.4 E2E Test Priorities
| Priority | Flow | Reason |
|----------|------|--------|
| P1 | Event Discovery + Save | Core user value |
| P1 | View Saved Events | Core user value |
| P2 | Admin Event Creation | Content management |
| P2 | Form Validation | Data integrity |
| P3 | Keyboard Navigation | Accessibility |
| P3 | Empty/Error States | Edge cases |

---

## 4. Accessibility Testing Approach

### 4.1 Automated Testing
- **axe-core**: Integrate with Vitest for component-level a11y checks
- **Playwright axe**: E2E accessibility scanning

### 4.2 Manual Testing Checklist

#### Keyboard Navigation
- [ ] SwipeStack: Arrow keys navigate (left=pass, right=save)
- [ ] SwipeStack: Enter/Space opens event detail
- [ ] EventDetail: Escape closes modal
- [ ] EventForm: Tab order is logical
- [ ] All buttons: Focusable and activatable via keyboard

#### Screen Reader
- [ ] SwipeStack announces current card position
- [ ] Swipe actions are announced
- [ ] Form errors are announced
- [ ] Loading states are announced

#### Visual
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Text is scalable
- [ ] Animations respect prefers-reduced-motion

### 4.3 ARIA Implementation Review
| Component | Required ARIA |
|-----------|---------------|
| SwipeStack | `role="application"`, `aria-label`, `aria-live` |
| EventCard | `role="img"` for background image |
| EventDetail | Modal semantics, close button label |
| EventForm | Label associations, error announcements |

---

## 5. Test Organization

### 5.1 Directory Structure
```
src/
  __tests__/
    setup.ts                    # Global test setup
    fixtures/                   # Shared test data
      events.ts
  lib/
    utils.test.ts              # Unit tests alongside source
    storage.test.ts
    types.test.ts
  components/
    SwipeStack.test.tsx
    EventCard/
      EventCard.test.tsx
      EventCardBadges.test.tsx
```

### 5.2 Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Spec files (E2E): `*.spec.ts`
- Test descriptions: Use clear, behavior-focused language
  - Good: `should save event ID to localStorage when swiping right`
  - Bad: `test saveEventId function`

---

## 6. Continuous Integration

### 6.1 Test Pipeline
```yaml
# Recommended CI configuration
test:
  - npm run lint
  - npm run test:run
  - npm run build
```

### 6.2 Quality Gates
| Metric | Threshold |
|--------|-----------|
| Unit Test Pass Rate | 100% |
| Coverage (utils/storage) | 90% |
| Coverage (components) | 70% |
| No Console Errors | Required |

---

## 7. Test Data Management

### 7.1 Fixtures
Create reusable test fixtures in `src/__tests__/fixtures/`:
- Valid event objects
- Invalid event objects (for testing validation)
- Edge case dates
- Various category types

### 7.2 Factory Functions
Use factory functions to generate test data with overrides:
```typescript
function createTestEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'test-uuid',
    title: 'Test Event',
    // ... defaults
    ...overrides,
  };
}
```

---

## 8. Risk Areas and Testing Focus

### 8.1 High-Risk Areas
| Area | Risk | Testing Focus |
|------|------|---------------|
| Swipe Gestures | Complex animation state | Unit test state transitions, manual E2E |
| localStorage Sync | Data loss/corruption | Thorough edge case testing |
| Zod Validation | User data rejection | Comprehensive schema testing |
| Date Formatting | Timezone issues | Test multiple timezones |
| Supabase Integration | Network failures | Error state handling |

### 8.2 Known Edge Cases
1. **Swipe during animation**: Prevent double-swipes
2. **Empty event list**: Show appropriate message
3. **Deleted event in saved list**: Handle gracefully
4. **Very long event titles**: Truncation works
5. **Invalid dates from API**: Validation catches issues

---

## 9. Implementation Phases

### Phase 1 (Current)
- [x] Set up Vitest and React Testing Library
- [x] Unit tests for `utils.ts`
- [x] Unit tests for `storage.ts`
- [x] Unit tests for Zod schemas in `types.ts`

### Phase 2 (Next)
- [ ] Component tests for SwipeStack
- [ ] Component tests for EventCard
- [ ] Component tests for EventForm
- [ ] Integration tests for save/dismiss flows

### Phase 3 (Future)
- [ ] Set up Playwright for E2E
- [ ] Implement critical user flow tests
- [ ] Add accessibility automation with axe-core
- [ ] Set up CI pipeline with test gates

---

## 10. Maintenance Guidelines

### Adding New Tests
1. Follow naming conventions
2. Add to appropriate location (unit vs integration)
3. Include in relevant test suite
4. Update coverage expectations if needed

### Updating Tests
1. When implementation changes, update tests first
2. Red-green-refactor: ensure tests fail before fixing
3. Avoid testing implementation details

### Flaky Test Policy
- Flaky tests must be fixed within 48 hours
- If not fixable, quarantine with `test.skip` and create issue
- Do not ignore flaky tests
