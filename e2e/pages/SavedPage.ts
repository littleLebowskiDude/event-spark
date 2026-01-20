import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Saved Events page (/saved).
 * Handles interactions with the list of saved events.
 */
export class SavedPage extends BasePage {
  // Selectors based on saved/page.tsx and SavedEventsList.tsx
  private readonly pageHeaderSelector = 'h1:has-text("Saved Events")';
  private readonly savedEventCardSelector = '.bg-card.rounded-xl.p-4.flex.gap-4';
  private readonly emptyStateSelector = 'text=No Saved Events';
  private readonly emptyStateMessageSelector = '.text-muted';
  private readonly loadingSpinnerSelector = '.animate-spin';
  private readonly errorStateSelector = 'text=Unable to Load Saved Events';
  private readonly retryButtonSelector = 'text=Try Again';
  private readonly removeButtonSelector = 'button[aria-label="Remove from saved"]';
  private readonly eventTitleSelector = 'h4.font-semibold';
  private readonly dateGroupHeaderSelector = 'h3.text-sm.font-semibold.text-muted';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the saved events page.
   */
  async goto(): Promise<void> {
    await super.goto('/saved');
  }

  /**
   * Gets locator for all saved event cards.
   * @returns Locator for all saved event cards
   */
  getSavedEvents(): Locator {
    return this.page.locator(this.savedEventCardSelector);
  }

  /**
   * Gets the count of saved events displayed.
   * @returns Number of saved event cards
   */
  async getSavedEventCount(): Promise<number> {
    const events = this.getSavedEvents();
    return events.count();
  }

  /**
   * Checks if the empty state is displayed.
   * @returns True if empty state is visible
   */
  async isEmptyState(): Promise<boolean> {
    const emptyState = this.page.locator(this.emptyStateSelector);
    return emptyState.isVisible();
  }

  /**
   * Gets the empty state message text.
   * @returns The empty state message
   */
  async getEmptyStateMessage(): Promise<string> {
    const emptyContainer = this.page.locator('.flex.flex-col.items-center.justify-center');
    const messageElement = emptyContainer.locator('p.text-muted');
    return messageElement.textContent() ?? '';
  }

  /**
   * Clicks on an event card at the specified index to open its detail.
   * @param index - Zero-based index of the event to click
   */
  async clickEvent(index: number): Promise<void> {
    const events = this.getSavedEvents();
    const event = events.nth(index);
    await event.click();
    await this.waitForAnimation();
  }

  /**
   * Clicks the remove (trash) button for an event at the specified index.
   * @param index - Zero-based index of the event to remove
   */
  async removeEvent(index: number): Promise<void> {
    const events = this.getSavedEvents();
    const event = events.nth(index);
    const removeButton = event.locator(this.removeButtonSelector);
    await removeButton.click();
    await this.waitForAnimation();
  }

  /**
   * Gets the title of an event at the specified index.
   * @param index - Zero-based index of the event
   * @returns The event title
   */
  async getEventTitle(index: number): Promise<string> {
    const events = this.getSavedEvents();
    const event = events.nth(index);
    const title = event.locator(this.eventTitleSelector);
    return title.textContent() ?? '';
  }

  /**
   * Gets all event titles.
   * @returns Array of event titles
   */
  async getAllEventTitles(): Promise<string[]> {
    const events = this.getSavedEvents();
    const count = await events.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const title = await this.getEventTitle(i);
      titles.push(title);
    }

    return titles;
  }

  /**
   * Gets the venue name of an event at the specified index.
   * @param index - Zero-based index of the event
   * @returns The venue name or empty string
   */
  async getEventVenue(index: number): Promise<string> {
    const events = this.getSavedEvents();
    const event = events.nth(index);
    // Venue is shown with MapPin icon
    const venueElement = event.locator('.text-muted .line-clamp-1').last();
    return venueElement.textContent() ?? '';
  }

  /**
   * Gets the time of an event at the specified index.
   * @param index - Zero-based index of the event
   * @returns The event time
   */
  async getEventTime(index: number): Promise<string> {
    const events = this.getSavedEvents();
    const event = events.nth(index);
    // Time is shown with Calendar icon
    const timeElement = event.locator('.text-muted span').first();
    return timeElement.textContent() ?? '';
  }

  /**
   * Checks if the loading state is displayed.
   * @returns True if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    const spinner = this.page.locator(this.loadingSpinnerSelector);
    return spinner.isVisible();
  }

  /**
   * Checks if the error state is displayed.
   * @returns True if error state is visible
   */
  async isErrorState(): Promise<boolean> {
    const errorState = this.page.locator(this.errorStateSelector);
    return errorState.isVisible();
  }

  /**
   * Gets the error message text.
   * @returns The error message
   */
  async getErrorMessage(): Promise<string> {
    const errorContainer = this.page.locator('.flex.flex-col.items-center.justify-center');
    const messageElement = errorContainer.locator('p.text-muted');
    return messageElement.textContent() ?? '';
  }

  /**
   * Clicks the retry button on the error state.
   */
  async clickRetryButton(): Promise<void> {
    await this.page.locator(this.retryButtonSelector).click();
    await this.waitForPageLoad();
  }

  /**
   * Gets all date group headers.
   * @returns Array of date strings
   */
  async getDateGroups(): Promise<string[]> {
    const headers = this.page.locator(this.dateGroupHeaderSelector);
    const count = await headers.count();
    const dates: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) dates.push(text);
    }

    return dates;
  }

  /**
   * Waits for the saved events to be loaded.
   * @param timeout - Maximum time to wait (default: 10000)
   */
  async waitForEventsToLoad(timeout: number = 10000): Promise<void> {
    // Wait for either events to load, empty state, or error
    await Promise.race([
      this.page.waitForSelector(this.savedEventCardSelector, { state: 'visible', timeout }),
      this.page.waitForSelector(this.emptyStateSelector, { state: 'visible', timeout }),
      this.page.waitForSelector(this.errorStateSelector, { state: 'visible', timeout }),
    ]);
    await this.waitForAnimation();
  }

  /**
   * Gets the page header locator.
   * @returns Locator for the page header
   */
  getPageHeader(): Locator {
    return this.page.locator(this.pageHeaderSelector);
  }

  /**
   * Gets an event card locator at the specified index.
   * @param index - Zero-based index of the event
   * @returns Locator for the event card
   */
  getEventCard(index: number): Locator {
    return this.getSavedEvents().nth(index);
  }

  /**
   * Gets the remove button for an event at the specified index.
   * @param index - Zero-based index of the event
   * @returns Locator for the remove button
   */
  getRemoveButton(index: number): Locator {
    const event = this.getEventCard(index);
    return event.locator(this.removeButtonSelector);
  }
}
