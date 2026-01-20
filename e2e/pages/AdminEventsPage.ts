import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Admin Events List page (/admin/events).
 * Handles interactions with the events table and management actions.
 */
export class AdminEventsPage extends BasePage {
  // Selectors based on admin/events/page.tsx
  private readonly pageHeaderSelector = 'h1:has-text("Events")';
  private readonly addEventButtonSelector = 'a:has-text("Add Event")';
  private readonly searchInputSelector = 'input[placeholder="Search events..."]';
  private readonly eventTableSelector = 'table';
  private readonly eventRowSelector = 'tbody tr';
  private readonly editButtonSelector = 'a[title="Edit"]';
  private readonly deleteButtonSelector = 'button[title="Delete"]';
  private readonly deleteModalSelector = '.fixed.inset-0.bg-black\\/50';
  private readonly confirmDeleteButtonSelector = 'button:has-text("Delete"):not([title="Delete"])';
  private readonly cancelDeleteButtonSelector = 'button:has-text("Cancel")';
  private readonly loadingSpinnerSelector = '.animate-spin';
  private readonly errorStateSelector = 'text=Unable to Load Events';
  private readonly retryButtonSelector = 'text=Try Again';
  private readonly noEventsSelector = 'text=No events found.';
  private readonly deleteErrorSelector = '.bg-red-500\\/10 .text-red-400';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the admin events page.
   */
  async goto(): Promise<void> {
    await super.goto('/admin/events');
  }

  /**
   * Gets locator for all event table rows.
   * @returns Locator for all event rows
   */
  getEventRows(): Locator {
    return this.page.locator(this.eventRowSelector);
  }

  /**
   * Gets the count of events in the table.
   * @returns Number of event rows
   */
  async getEventCount(): Promise<number> {
    const rows = this.getEventRows();
    return rows.count();
  }

  /**
   * Fills the search input to filter events.
   * @param query - The search query
   */
  async searchEvents(query: string): Promise<void> {
    const searchInput = this.page.locator(this.searchInputSelector);
    await searchInput.fill(query);
    // Wait for filtering to apply (useMemo should be instant)
    await this.page.waitForTimeout(100);
  }

  /**
   * Clears the search input.
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator(this.searchInputSelector);
    await searchInput.clear();
    await this.page.waitForTimeout(100);
  }

  /**
   * Gets the current search query value.
   * @returns The search input value
   */
  async getSearchValue(): Promise<string> {
    const searchInput = this.page.locator(this.searchInputSelector);
    return searchInput.inputValue();
  }

  /**
   * Clicks the "Add Event" button to navigate to create form.
   */
  async clickAddEvent(): Promise<void> {
    await this.page.locator(this.addEventButtonSelector).click();
    await this.waitForPageLoad();
  }

  /**
   * Clicks the edit button for an event at the specified index.
   * @param index - Zero-based index of the event row
   */
  async clickEditEvent(index: number): Promise<void> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const editButton = row.locator(this.editButtonSelector);
    await editButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Clicks the delete button for an event at the specified index.
   * Opens the delete confirmation modal.
   * @param index - Zero-based index of the event row
   */
  async clickDeleteEvent(index: number): Promise<void> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const deleteButton = row.locator(this.deleteButtonSelector);
    await deleteButton.click();
    await this.waitForAnimation();
  }

  /**
   * Confirms the delete action in the modal.
   */
  async confirmDelete(): Promise<void> {
    const confirmButton = this.page.locator(this.confirmDeleteButtonSelector);
    await confirmButton.click();
    await this.waitForAnimation();
  }

  /**
   * Cancels the delete action in the modal.
   */
  async cancelDelete(): Promise<void> {
    const cancelButton = this.page.locator(this.cancelDeleteButtonSelector);
    await cancelButton.click();
    await this.waitForAnimation();
  }

  /**
   * Checks if the delete confirmation modal is open.
   * @returns True if modal is visible
   */
  async isDeleteModalOpen(): Promise<boolean> {
    const modal = this.page.locator(this.deleteModalSelector);
    return modal.isVisible();
  }

  /**
   * Gets the delete confirmation modal locator.
   * @returns Locator for the modal
   */
  getDeleteModal(): Locator {
    return this.page.locator(this.deleteModalSelector);
  }

  /**
   * Gets the error message from the delete modal (if any).
   * @returns Error message or empty string
   */
  async getDeleteError(): Promise<string> {
    const errorElement = this.page.locator(this.deleteErrorSelector);
    if (await errorElement.isVisible()) {
      return errorElement.textContent() ?? '';
    }
    return '';
  }

  /**
   * Gets the title of an event at the specified row index.
   * @param index - Zero-based index of the event row
   * @returns The event title
   */
  async getEventTitle(index: number): Promise<string> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const titleCell = row.locator('p.font-medium.truncate').first();
    return titleCell.textContent() ?? '';
  }

  /**
   * Gets the venue of an event at the specified row index.
   * @param index - Zero-based index of the event row
   * @returns The venue name
   */
  async getEventVenue(index: number): Promise<string> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const venueCell = row.locator('p.text-muted.truncate');
    return venueCell.textContent() ?? '';
  }

  /**
   * Gets the date of an event at the specified row index.
   * @param index - Zero-based index of the event row
   * @returns The formatted date
   */
  async getEventDate(index: number): Promise<string> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const dateCell = row.locator('td').nth(1);
    return dateCell.textContent() ?? '';
  }

  /**
   * Gets the category of an event at the specified row index.
   * @param index - Zero-based index of the event row
   * @returns The category label
   */
  async getEventCategory(index: number): Promise<string> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const categoryBadge = row.locator('.rounded-full.text-xs');
    return categoryBadge.textContent() ?? '';
  }

  /**
   * Gets the price info of an event at the specified row index.
   * @param index - Zero-based index of the event row
   * @returns "Free" or the price string
   */
  async getEventPrice(index: number): Promise<string> {
    const rows = this.getEventRows();
    const row = rows.nth(index);
    const priceCell = row.locator('td').nth(3);
    return priceCell.textContent() ?? '';
  }

  /**
   * Checks if the loading state is displayed.
   * @returns True if loading
   */
  async isLoading(): Promise<boolean> {
    const spinner = this.page.locator(this.loadingSpinnerSelector);
    return spinner.isVisible();
  }

  /**
   * Checks if the error state is displayed.
   * @returns True if error visible
   */
  async isErrorState(): Promise<boolean> {
    const errorState = this.page.locator(this.errorStateSelector);
    return errorState.isVisible();
  }

  /**
   * Clicks the retry button on error state.
   */
  async clickRetryButton(): Promise<void> {
    await this.page.locator(this.retryButtonSelector).click();
    await this.waitForPageLoad();
  }

  /**
   * Checks if "No events found" message is displayed.
   * @returns True if no events message visible
   */
  async hasNoEvents(): Promise<boolean> {
    const noEvents = this.page.locator(this.noEventsSelector);
    return noEvents.isVisible();
  }

  /**
   * Waits for the events table to load.
   * @param timeout - Maximum time to wait (default: 10000)
   */
  async waitForEventsToLoad(timeout: number = 10000): Promise<void> {
    // Wait for either table, empty state, or error
    await Promise.race([
      this.page.waitForSelector(this.eventTableSelector, { state: 'visible', timeout }),
      this.page.waitForSelector(this.errorStateSelector, { state: 'visible', timeout }),
    ]);
    // Additional wait for rows to populate
    await this.page.waitForTimeout(200);
  }

  /**
   * Gets the page header locator.
   * @returns Locator for page header
   */
  getPageHeader(): Locator {
    return this.page.locator(this.pageHeaderSelector);
  }

  /**
   * Gets the add event button locator.
   * @returns Locator for add button
   */
  getAddEventButton(): Locator {
    return this.page.locator(this.addEventButtonSelector);
  }

  /**
   * Gets the search input locator.
   * @returns Locator for search input
   */
  getSearchInput(): Locator {
    return this.page.locator(this.searchInputSelector);
  }

  /**
   * Gets an event row at the specified index.
   * @param index - Zero-based index
   * @returns Locator for the row
   */
  getEventRow(index: number): Locator {
    return this.getEventRows().nth(index);
  }

  /**
   * Gets all event titles from the table.
   * @returns Array of event titles
   */
  async getAllEventTitles(): Promise<string[]> {
    const rows = this.getEventRows();
    const count = await rows.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const title = await this.getEventTitle(i);
      titles.push(title);
    }

    return titles;
  }
}
