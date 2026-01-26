import { test, expect, DEMO_CREDENTIALS, ADMIN_ROUTES, loginAsAdmin } from './fixtures';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminEventFormPage, EventFormData } from './pages/AdminEventFormPage';

/**
 * Admin CRUD E2E Tests
 *
 * Tests for admin authentication and event management (Create, Read, Update, Delete).
 * Uses demo credentials: admin@example.com / admin
 */

test.describe('Admin CRUD Operations', () => {
  /**
   * ============================================
   * AUTHENTICATION TESTS
   * ============================================
   */
  test.describe('Authentication', () => {
    test('should display login form on /admin/login', async ({ page }) => {
      const loginPage = new AdminLoginPage(page);
      await loginPage.goto();

      // Verify login form elements are visible
      await expect(loginPage.getPageHeader()).toBeVisible();
      await expect(loginPage.getEmailInput()).toBeVisible();
      await expect(loginPage.getPasswordInput()).toBeVisible();
      await expect(loginPage.getLoginButton()).toBeVisible();

      // Verify email input has correct placeholder
      await expect(loginPage.getEmailInput()).toHaveAttribute('placeholder', 'admin@example.com');

      // Verify password input is of type password
      await expect(loginPage.getPasswordInput()).toHaveAttribute('type', 'password');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new AdminLoginPage(page);
      await loginPage.goto();

      // Attempt login with invalid credentials
      await loginPage.login('wrong@example.com', 'wrongpassword');

      // Wait for error to appear (with proper waiting instead of fixed timeout)
      await loginPage.waitForError();

      // Verify error message is displayed
      const hasError = await loginPage.hasError();
      expect(hasError).toBe(true);

      // Verify we're still on the login page
      expect(page.url()).toContain('/admin/login');
    });

    test('should redirect to admin dashboard after successful login', async ({ page }) => {
      const loginPage = new AdminLoginPage(page);
      await loginPage.goto();

      // Login with valid demo credentials
      await loginPage.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);

      // Wait for redirect
      await loginPage.waitForLoginRedirect();

      // Verify we've been redirected away from login
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);

      // Verify URL is the admin dashboard
      expect(page.url()).toMatch(/\/admin\/?$/);
    });

    test('should redirect to login when accessing /admin/events without auth', async ({ page }) => {
      // Clear any existing session first
      await page.goto('/');
      await page.evaluate(() => {
        sessionStorage.removeItem('demo_admin_session');
      });

      // Try to access protected admin events page directly
      await page.goto(ADMIN_ROUTES.events);

      // Wait for redirect to login page (instead of fixed timeout)
      await page.waitForURL('**/admin/login', { timeout: 10000 });

      // Verify we're on the login page
      expect(page.url()).toContain('/admin/login');
    });
  });

  /**
   * ============================================
   * EVENTS LIST (READ) TESTS
   * ============================================
   */
  test.describe('Events List (Read)', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to events page
      await loginAsAdmin(page, { navigateTo: ADMIN_ROUTES.events });
    });

    test('should display events table after login', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.waitForEventsToLoad();

      // Verify page header is visible
      await expect(eventsPage.getPageHeader()).toBeVisible();

      // Verify Add Event button is visible
      await expect(eventsPage.getAddEventButton()).toBeVisible();

      // Verify search input is visible
      await expect(eventsPage.getSearchInput()).toBeVisible();

      // Check if either events table has rows or "No events found" is displayed
      const eventCount = await eventsPage.getEventCount();
      const hasNoEvents = await eventsPage.hasNoEvents();

      // One of these should be true
      expect(eventCount > 0 || hasNoEvents).toBe(true);
    });

    test('should show event columns (title, date, category)', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Verify table headers exist
      const tableHeaders = page.locator('thead th');
      await expect(tableHeaders.nth(0)).toContainText('Event');
      await expect(tableHeaders.nth(1)).toContainText('Date');
      await expect(tableHeaders.nth(2)).toContainText('Category');
      await expect(tableHeaders.nth(3)).toContainText('Price');
      await expect(tableHeaders.nth(4)).toContainText('Actions');

      // If there are events, verify the first row has expected data structure
      const eventCount = await eventsPage.getEventCount();
      if (eventCount > 0) {
        const title = await eventsPage.getEventTitle(0);
        const date = await eventsPage.getEventDate(0);
        const category = await eventsPage.getEventCategory(0);

        // Title should not be empty
        expect(title.length).toBeGreaterThan(0);
        // Date should contain numbers (day)
        expect(date).toMatch(/\d/);
        // Category should not be empty
        expect(category.length).toBeGreaterThan(0);
      }
    });

    test('should filter events by search query', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Get initial event count
      const initialCount = await eventsPage.getEventCount();

      // Skip test if no events exist
      if (initialCount === 0) {
        test.skip();
        return;
      }

      // Get the title of the first event
      const firstEventTitle = await eventsPage.getEventTitle(0);

      // Search for that event
      await eventsPage.searchEvents(firstEventTitle.slice(0, 5));

      // Wait for filter to apply
      await page.waitForTimeout(200);

      // Get filtered count
      const filteredCount = await eventsPage.getEventCount();

      // Filtered results should include events matching the search
      expect(filteredCount).toBeGreaterThan(0);

      // Search for non-existent event
      await eventsPage.searchEvents('ZZZZNONEXISTENTEVENT12345');
      await page.waitForTimeout(200);

      // Should show no events or "No events found"
      const noMatchCount = await eventsPage.getEventCount();
      const hasNoEvents = await eventsPage.hasNoEvents();
      expect(noMatchCount === 0 || hasNoEvents).toBe(true);

      // Clear search
      await eventsPage.clearSearch();
      await page.waitForTimeout(200);

      // Should show all events again
      const restoredCount = await eventsPage.getEventCount();
      expect(restoredCount).toBe(initialCount);
    });
  });

  /**
   * ============================================
   * CREATE EVENT TESTS
   * ============================================
   */
  test.describe('Create Event', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should navigate to new event form via Add Event button', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Click Add Event button
      await eventsPage.clickAddEvent();

      // Verify we're on the new event form
      expect(page.url()).toContain('/admin/events/new');

      // Verify form elements are visible
      const formPage = new AdminEventFormPage(page);
      await expect(formPage.getTitleInput()).toBeVisible();
      await expect(formPage.getStartDateInput()).toBeVisible();
      await expect(formPage.getSubmitButton()).toBeVisible();
      await expect(formPage.getCancelButton()).toBeVisible();
    });

    test('should validate required fields (title, start_date)', async ({ page }) => {
      const formPage = new AdminEventFormPage(page);
      await formPage.goto(); // Navigate to /admin/events/new

      // Clear any default values
      await formPage.getTitleInput().clear();

      // Try to submit empty form
      await formPage.clickSubmit();

      // Wait for validation
      await page.waitForTimeout(300);

      // Check for validation errors
      const errors = await formPage.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);

      // We should still be on the form page
      expect(page.url()).toContain('/admin/events/new');

      // Title error should be shown
      const titleError = await formPage.getFieldError('title');
      expect(titleError.length).toBeGreaterThan(0);
    });

    test('should create event and redirect to events list', async ({ page }) => {
      const formPage = new AdminEventFormPage(page);
      await formPage.goto();

      // Generate unique event title with timestamp
      const uniqueTitle = `E2E Test Event ${Date.now()}`;

      // Fill in required fields
      const eventData: EventFormData = {
        title: uniqueTitle,
        description: 'This is a test event created by E2E tests',
        startDate: getFutureDateString(7), // 7 days from now
        venueName: 'E2E Test Venue',
        location: '123 Test Street, Test City',
        category: 'community',
        isFree: true,
      };

      await formPage.fillEventForm(eventData);

      // Submit the form
      await formPage.clickSubmit();

      // Wait for redirect to events list
      await formPage.waitForSubmitSuccess();

      // Verify we're on the events list page
      expect(page.url()).toContain('/admin/events');
      expect(page.url()).not.toContain('/new');

      // Verify the new event appears in the list
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.waitForEventsToLoad();

      // Search for the created event
      await eventsPage.searchEvents(uniqueTitle);
      await page.waitForTimeout(300);

      // Verify event was created
      const eventCount = await eventsPage.getEventCount();
      expect(eventCount).toBeGreaterThan(0);

      const firstTitle = await eventsPage.getEventTitle(0);
      expect(firstTitle).toContain(uniqueTitle);
    });
  });

  /**
   * ============================================
   * UPDATE EVENT TESTS
   * ============================================
   */
  test.describe('Update Event', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should navigate to edit form via edit button', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Check if there are events to edit
      const eventCount = await eventsPage.getEventCount();
      if (eventCount === 0) {
        // Create an event first if none exist
        const formPage = new AdminEventFormPage(page);
        await formPage.goto();
        await formPage.fillEventForm({
          title: `E2E Edit Test Event ${Date.now()}`,
          startDate: getFutureDateString(7),
          isFree: true,
        });
        await formPage.clickSubmit();
        await formPage.waitForSubmitSuccess();

        // Go back to events list
        await eventsPage.goto();
        await eventsPage.waitForEventsToLoad();
      }

      // Click edit on the first event
      await eventsPage.clickEditEvent(0);

      // Verify we're on an edit form (URL contains /admin/events/<id>)
      // Regex accepts UUIDs (a-f0-9-) and demo IDs (alphanumeric with hyphens)
      expect(page.url()).toMatch(/\/admin\/events\/[\w-]+$/i);

      // Verify form elements are visible
      const formPage = new AdminEventFormPage(page);
      await expect(formPage.getTitleInput()).toBeVisible();
      await expect(formPage.getSubmitButton()).toBeVisible();
    });

    test('should pre-populate form with existing event data', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Skip if no events
      const eventCount = await eventsPage.getEventCount();
      if (eventCount === 0) {
        test.skip();
        return;
      }

      // Get the title of the first event before editing
      const originalTitle = await eventsPage.getEventTitle(0);

      // Click edit
      await eventsPage.clickEditEvent(0);

      // Verify form is pre-populated
      const formPage = new AdminEventFormPage(page);
      await page.waitForTimeout(500); // Wait for form to load

      const formTitle = await formPage.getTitleValue();

      // Title should match the original event
      expect(formTitle.trim()).toBe(originalTitle.trim());

      // Verify other form elements have values (not empty for a complete event)
      const startDateInput = formPage.getStartDateInput();
      const startDateValue = await startDateInput.inputValue();
      expect(startDateValue.length).toBeGreaterThan(0);
    });

    test('should update event and redirect to events list', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Skip if no events
      const eventCount = await eventsPage.getEventCount();
      if (eventCount === 0) {
        test.skip();
        return;
      }

      // Click edit on first event
      await eventsPage.clickEditEvent(0);

      // Update the title
      const formPage = new AdminEventFormPage(page);
      await page.waitForTimeout(500);

      const updatedTitle = `Updated Event ${Date.now()}`;
      await formPage.fillTitle(updatedTitle);

      // Submit the form
      await formPage.clickSubmit();

      // Wait for redirect
      await formPage.waitForSubmitSuccess();

      // Verify we're back on the events list
      expect(page.url()).toContain('/admin/events');
      // Verify we're NOT on an edit form (no ID in URL)
      expect(page.url()).not.toMatch(/\/admin\/events\/[\w-]+$/i);

      // Search for the updated event
      await eventsPage.waitForEventsToLoad();
      await eventsPage.searchEvents(updatedTitle);
      await page.waitForTimeout(300);

      // Verify the updated title is in the list
      const updatedCount = await eventsPage.getEventCount();
      expect(updatedCount).toBeGreaterThan(0);

      const firstTitle = await eventsPage.getEventTitle(0);
      expect(firstTitle).toContain(updatedTitle);
    });
  });

  /**
   * ============================================
   * DELETE EVENT TESTS
   * ============================================
   */
  test.describe('Delete Event', () => {
    let createdEventTitle: string;

    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);

      // Create a test event to delete
      const formPage = new AdminEventFormPage(page);
      await formPage.goto();

      createdEventTitle = `Delete Test Event ${Date.now()}`;
      await formPage.fillEventForm({
        title: createdEventTitle,
        startDate: getFutureDateString(7),
        isFree: true,
      });
      await formPage.clickSubmit();
      await formPage.waitForSubmitSuccess();
    });

    test('should open confirmation modal when clicking delete', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Find the event we created by searching
      await eventsPage.searchEvents(createdEventTitle);
      await page.waitForTimeout(300);

      // Click delete on the first event
      await eventsPage.clickDeleteEvent(0);

      // Verify modal is open
      const isModalOpen = await eventsPage.isDeleteModalOpen();
      expect(isModalOpen).toBe(true);

      // Verify modal has confirmation text
      const modal = eventsPage.getDeleteModal();
      await expect(modal).toContainText('Delete Event');
      await expect(modal).toContainText('Are you sure');

      // Verify Cancel and Delete buttons are visible
      const cancelButton = page.locator('button:has-text("Cancel")');
      const deleteButton = page.locator('.fixed.inset-0 button:has-text("Delete"):not([title="Delete"])');
      await expect(cancelButton).toBeVisible();
      await expect(deleteButton).toBeVisible();
    });

    test('should cancel deletion when clicking Cancel', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Find the event we created
      await eventsPage.searchEvents(createdEventTitle);
      await page.waitForTimeout(300);

      const initialCount = await eventsPage.getEventCount();

      // Click delete
      await eventsPage.clickDeleteEvent(0);

      // Verify modal is open
      expect(await eventsPage.isDeleteModalOpen()).toBe(true);

      // Click Cancel
      await eventsPage.cancelDelete();

      // Wait for modal to close
      await page.waitForTimeout(300);

      // Verify modal is closed
      expect(await eventsPage.isDeleteModalOpen()).toBe(false);

      // Verify event still exists (count unchanged)
      const afterCount = await eventsPage.getEventCount();
      expect(afterCount).toBe(initialCount);
    });

    test('should delete event when confirming', async ({ page }) => {
      const eventsPage = new AdminEventsPage(page);
      await eventsPage.goto();
      await eventsPage.waitForEventsToLoad();

      // Find the event we created
      await eventsPage.searchEvents(createdEventTitle);
      await page.waitForTimeout(300);

      const initialCount = await eventsPage.getEventCount();
      expect(initialCount).toBeGreaterThan(0);

      // Click delete
      await eventsPage.clickDeleteEvent(0);

      // Confirm deletion
      await eventsPage.confirmDelete();

      // Wait for deletion to complete
      await page.waitForTimeout(500);

      // Verify modal is closed
      expect(await eventsPage.isDeleteModalOpen()).toBe(false);

      // Clear search to see all events
      await eventsPage.clearSearch();
      await page.waitForTimeout(300);

      // Search for the deleted event
      await eventsPage.searchEvents(createdEventTitle);
      await page.waitForTimeout(300);

      // Verify event no longer exists
      const afterCount = await eventsPage.getEventCount();
      const hasNoEvents = await eventsPage.hasNoEvents();
      expect(afterCount === 0 || hasNoEvents).toBe(true);
    });
  });
});

/**
 * Helper function to generate a future date string in datetime-local format
 * @param daysFromNow - Number of days from today
 * @returns Date string in YYYY-MM-DDTHH:mm format
 */
function getFutureDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(18, 0, 0, 0); // Set to 6 PM

  // Format as YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
