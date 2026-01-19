# Event Spark Test Cases

This document contains detailed test cases for the key user flows in Event Spark.

---

## 1. Swipe Flow Test Cases

### TC-SWIPE-001: Swipe Right to Save Event

**Preconditions:**
- App is loaded with at least 2 events
- localStorage is empty (no saved events)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe the top card in the stack | First event card is displayed with event details |
| 2 | Drag the card to the right past threshold (100px) | "SAVE" indicator appears in green |
| 3 | Release the card | Card animates off-screen to the right |
| 4 | Wait for animation to complete | Next event card moves to top position |
| 5 | Check localStorage | Event ID is added to 'event-spark-saved-events' |

**Priority:** P1
**Type:** Smoke

---

### TC-SWIPE-002: Swipe Left to Dismiss Event

**Preconditions:**
- App is loaded with at least 2 events
- localStorage is empty

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe the top card in the stack | First event card is displayed |
| 2 | Drag the card to the left past threshold (100px) | "PASS" indicator appears in red |
| 3 | Release the card | Card animates off-screen to the left |
| 4 | Wait for animation to complete | Next event card moves to top position |
| 5 | Check localStorage | Event ID is added to 'event-spark-dismissed-events' |

**Priority:** P1
**Type:** Smoke

---

### TC-SWIPE-003: Button Swipe - Save

**Preconditions:**
- App is loaded with at least 1 event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the heart button below the card stack | Green-bordered heart button is visible |
| 2 | Click the heart button | "SAVE" indicator appears on card |
| 3 | Wait for animation | Card animates off-screen to the right |
| 4 | Verify event saved | Event ID appears in localStorage saved events |

**Priority:** P1
**Type:** Feature

---

### TC-SWIPE-004: Button Swipe - Pass

**Preconditions:**
- App is loaded with at least 1 event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the X button below the card stack | Red-bordered X button is visible |
| 2 | Click the X button | "PASS" indicator appears on card |
| 3 | Wait for animation | Card animates off-screen to the left |
| 4 | Verify event dismissed | Event ID appears in localStorage dismissed events |

**Priority:** P1
**Type:** Feature

---

### TC-SWIPE-005: Keyboard Navigation - Arrow Keys

**Preconditions:**
- App is loaded with at least 1 event
- SwipeStack container has focus

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus the SwipeStack container | Container receives focus (outline visible) |
| 2 | Press ArrowRight key | "SAVE" indicator appears, card swipes right |
| 3 | Wait for next card | Next event card is displayed |
| 4 | Press ArrowLeft key | "PASS" indicator appears, card swipes left |

**Priority:** P2
**Type:** Feature (Accessibility)

---

### TC-SWIPE-006: Keyboard Navigation - Enter for Details

**Preconditions:**
- App is loaded with at least 1 event
- SwipeStack container has focus

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus the SwipeStack container | Container has focus |
| 2 | Press Enter key | Event detail modal opens |
| 3 | Verify modal content | Modal shows current event details |

**Priority:** P2
**Type:** Feature (Accessibility)

---

### TC-SWIPE-007: Swipe Below Threshold

**Preconditions:**
- App is loaded with at least 1 event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Drag card slightly right (< 100px) | Card follows finger/mouse |
| 2 | Release card | Card springs back to center position |
| 3 | Verify event not saved | localStorage unchanged |

**Priority:** P2
**Type:** Edge Case

---

### TC-SWIPE-008: Empty State After All Events Swiped

**Preconditions:**
- App is loaded with exactly 2 events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Swipe first event in any direction | Second event appears |
| 2 | Swipe second event in any direction | Empty state appears |
| 3 | Verify empty state content | "No more events" message displayed |
| 4 | Click "Start Over" button | First event reappears |
| 5 | Verify index reset | currentIndex is reset to 0 |

**Priority:** P2
**Type:** Edge Case

---

### TC-SWIPE-009: Prevent Double-Swipe During Animation

**Preconditions:**
- App is loaded with at least 2 events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click save button | Animation starts |
| 2 | Immediately click save button again | Second click is ignored |
| 3 | Wait for animation to complete | Only one event was swiped |

**Priority:** P2
**Type:** Edge Case

---

## 2. Event Detail Modal Test Cases

### TC-DETAIL-001: Open Detail from Card Tap

**Preconditions:**
- App is loaded with at least 1 event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap/click on the top event card | Detail modal slides up from bottom |
| 2 | Verify modal content | Event image, title, date, location displayed |
| 3 | Verify action buttons | "Pass" and "Save" buttons visible |

**Priority:** P1
**Type:** Smoke

---

### TC-DETAIL-002: Close Detail Modal

**Preconditions:**
- Event detail modal is open

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the X button in top-right corner | Modal slides down and closes |
| 2 | Verify return to stack | SwipeStack is visible again |

**Priority:** P1
**Type:** Feature

---

### TC-DETAIL-003: Save Event from Detail Modal

**Preconditions:**
- Event detail modal is open for an unsaved event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Save" button | Button changes to "Saved" state |
| 2 | Verify button styling | Green background, filled heart icon |
| 3 | Check localStorage | Event ID added to saved events |
| 4 | Close and reopen modal | "Saved" state persists |

**Priority:** P1
**Type:** Feature

---

### TC-DETAIL-004: Unsave Event from Detail Modal

**Preconditions:**
- Event detail modal is open for a saved event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Saved" button | Button changes to "Save" state |
| 2 | Verify button styling | Green border, unfilled heart |
| 3 | Check localStorage | Event ID removed from saved events |

**Priority:** P1
**Type:** Feature

---

### TC-DETAIL-005: Pass Event from Detail Modal

**Preconditions:**
- Event detail modal is open from SwipeStack view

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Pass" button | Modal closes |
| 2 | Verify event dismissed | Event ID in dismissed events |
| 3 | Verify stack updated | Next event card is shown |

**Priority:** P1
**Type:** Feature

---

### TC-DETAIL-006: External Links in Detail Modal

**Preconditions:**
- Event detail modal is open for an event with ticket_url and location

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click location link | Google Maps opens in new tab with location |
| 2 | Click "More info / Tickets" link | Ticket URL opens in new tab |

**Priority:** P2
**Type:** Feature

---

### TC-DETAIL-007: Detail Modal Without Actions

**Preconditions:**
- Viewing saved events page
- Event detail modal opened from saved events list

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open event detail from saved list | Modal opens |
| 2 | Verify action buttons | Only close button visible (no Pass/Save) |

**Priority:** P2
**Type:** Feature

---

## 3. Saved Events Page Test Cases

### TC-SAVED-001: View Saved Events List

**Preconditions:**
- User has previously saved 3 events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Saved page | Saved events page loads |
| 2 | Verify list content | All 3 saved events displayed in list |
| 3 | Verify sort order | Events sorted by start date (earliest first) |

**Priority:** P1
**Type:** Smoke

---

### TC-SAVED-002: Empty Saved Events State

**Preconditions:**
- No events have been saved (localStorage empty)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Saved page | Empty state displayed |
| 2 | Verify empty state content | Heart icon, "No Saved Events" heading |
| 3 | Verify help text | Instructions to swipe right to save |

**Priority:** P1
**Type:** Edge Case

---

### TC-SAVED-003: Remove Event from Saved List

**Preconditions:**
- Saved events list has at least 2 events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click remove button on an event | Event removed from list |
| 2 | Verify visual update | Event no longer visible |
| 3 | Check localStorage | Event ID removed from saved events |
| 4 | Other events remain | Remaining events still displayed |

**Priority:** P1
**Type:** Feature

---

### TC-SAVED-004: View Event Detail from Saved List

**Preconditions:**
- Saved events list has at least 1 event

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap/click on saved event card | Detail modal opens |
| 2 | Verify modal content | Full event details displayed |
| 3 | Close modal | Returns to saved list |

**Priority:** P1
**Type:** Feature

---

### TC-SAVED-005: Saved Event Deleted from Database

**Preconditions:**
- User has saved an event
- Event is deleted from Supabase database

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Saved page | API call made |
| 2 | Verify behavior | Deleted event not displayed (graceful handling) |
| 3 | Other saved events | Still displayed normally |

**Priority:** P2
**Type:** Edge Case

---

### TC-SAVED-006: Loading State

**Preconditions:**
- User has saved events
- Slow network connection simulated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Saved page | Loading spinner displayed |
| 2 | Wait for load | Spinner replaced with event list |

**Priority:** P2
**Type:** Feature

---

### TC-SAVED-007: Error State

**Preconditions:**
- User has saved events
- API returns error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Saved page | Error state displayed |
| 2 | Verify error content | Error icon, message, "Try Again" button |
| 3 | Click "Try Again" | New API call made |

**Priority:** P2
**Type:** Edge Case

---

## 4. Admin Event Creation Test Cases

### TC-ADMIN-001: Create Valid Event

**Preconditions:**
- Admin is logged in
- On new event form page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill in title: "Test Event" | Title field populated |
| 2 | Fill in start date | Date/time picker filled |
| 3 | Select category: "Music" | Category dropdown updated |
| 4 | Check "This is a free event" | Checkbox checked, price field hidden |
| 5 | Click "Create Event" | Form submits |
| 6 | Verify redirect | Redirected to event list |
| 7 | Verify event created | New event appears in list |

**Priority:** P1
**Type:** Smoke

---

### TC-ADMIN-002: Validation - Empty Required Fields

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave title empty | - |
| 2 | Leave start date empty | - |
| 3 | Click "Create Event" | Form does not submit |
| 4 | Verify title error | "Title is required" message |
| 5 | Verify start date error | "Start date is required" message |

**Priority:** P1
**Type:** Feature

---

### TC-ADMIN-003: Validation - Invalid URLs

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter invalid image URL: "not-a-url" | - |
| 2 | Enter invalid ticket URL: "also-bad" | - |
| 3 | Click "Create Event" | Form does not submit |
| 4 | Verify image URL error | "Invalid image URL" message |
| 5 | Verify ticket URL error | "Invalid ticket URL" message |

**Priority:** P1
**Type:** Feature

---

### TC-ADMIN-004: Validation - Paid Event Without Price

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill in valid title and date | Required fields filled |
| 2 | Uncheck "This is a free event" | Price field appears |
| 3 | Leave price field empty | - |
| 4 | Click "Create Event" | Form does not submit |
| 5 | Verify price error | "Price is required for paid events" |

**Priority:** P1
**Type:** Feature

---

### TC-ADMIN-005: Validation - End Date Before Start Date

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter start date: Jan 25, 2026 2:00 PM | Start date set |
| 2 | Enter end date: Jan 25, 2026 10:00 AM | End date set (before start) |
| 3 | Click "Create Event" | Form does not submit |
| 4 | Verify end date error | "End date must be after start date" |

**Priority:** P1
**Type:** Feature

---

### TC-ADMIN-006: Edit Existing Event

**Preconditions:**
- Admin is logged in
- At least one event exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to event list | Events displayed |
| 2 | Click edit on an event | Edit form opens |
| 3 | Verify form pre-filled | All fields populated with event data |
| 4 | Change title | Title field updated |
| 5 | Click "Update Event" | Form submits |
| 6 | Verify redirect | Redirected to event list |
| 7 | Verify changes saved | Updated title appears |

**Priority:** P1
**Type:** Feature

---

### TC-ADMIN-007: Character Limit Validation

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter title with 201 characters | - |
| 2 | Click "Create Event" | Form does not submit |
| 3 | Verify error | "Title must be 200 characters or less" |
| 4 | Enter description with 5001 characters | - |
| 5 | Click "Create Event" | Form does not submit |
| 6 | Verify error | "Description must be 5000 characters or less" |

**Priority:** P2
**Type:** Feature

---

### TC-ADMIN-008: Image Preview

**Preconditions:**
- Admin on new event form

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe image preview area | Placeholder icon displayed |
| 2 | Enter valid image URL | - |
| 3 | Observe preview | Image loads and displays |
| 4 | Enter invalid URL | - |
| 5 | Observe preview | Placeholder or broken image shown |

**Priority:** P3
**Type:** Feature

---

### TC-ADMIN-009: Form Cancel

**Preconditions:**
- Admin on new event form with data entered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter some form data | Fields populated |
| 2 | Click "Cancel" button | Navigation triggered |
| 3 | Verify navigation | Returns to previous page |
| 4 | Navigate back to form | Form is empty (data not persisted) |

**Priority:** P3
**Type:** Feature

---

### TC-ADMIN-010: Error Handling - API Failure

**Preconditions:**
- Admin on new event form
- API configured to return error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill in valid form data | All fields valid |
| 2 | Click "Create Event" | API call fails |
| 3 | Verify error display | Error message shown at top of form |
| 4 | Verify form state | Form data preserved, can retry |

**Priority:** P2
**Type:** Edge Case

---

## Test Execution Checklist

### Smoke Tests (Run on every deployment)
- [ ] TC-SWIPE-001: Swipe Right to Save
- [ ] TC-SWIPE-002: Swipe Left to Dismiss
- [ ] TC-DETAIL-001: Open Detail from Card
- [ ] TC-SAVED-001: View Saved Events List
- [ ] TC-ADMIN-001: Create Valid Event

### Regression Tests (Run weekly or on major changes)
- [ ] All Smoke Tests
- [ ] TC-SWIPE-003 through TC-SWIPE-009
- [ ] TC-DETAIL-002 through TC-DETAIL-007
- [ ] TC-SAVED-002 through TC-SAVED-007
- [ ] TC-ADMIN-002 through TC-ADMIN-010

### Accessibility Tests (Run monthly)
- [ ] TC-SWIPE-005: Keyboard Navigation - Arrow Keys
- [ ] TC-SWIPE-006: Keyboard Navigation - Enter
- [ ] Screen reader testing for all major flows
- [ ] Color contrast verification
- [ ] Focus management verification
