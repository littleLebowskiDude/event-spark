import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { simulateSwipeRight, simulateSwipeLeft, waitForAnimation } from '../utils';

/**
 * Page Object for the Discover page (main swipe/browse page).
 * Handles event card interactions including swipe gestures,
 * button clicks, and keyboard navigation.
 */
export class DiscoverPage extends BasePage {
  // Selectors based on SwipeStack.tsx and EventCard implementation
  private readonly cardStackSelector = '[role="application"]';
  private readonly eventCardSelector = '.absolute.w-full.h-full.cursor-grab';
  private readonly passButtonSelector = 'button[aria-label="Pass on this event"]';
  private readonly saveButtonSelector = 'button[aria-label="Save this event"]';
  private readonly emptyStateSelector = 'text=No more events';
  private readonly noEventsSelector = 'text=No Events Found';
  private readonly startOverButtonSelector = 'text=Start Over';
  private readonly loadingSkeletonSelector = '.animate-pulse';
  private readonly errorStateSelector = 'text=Unable to Load Events';
  private readonly retryButtonSelector = 'text=Try Again';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the discover page (home page).
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * Gets the locator for the current (top) event card.
   * @returns Locator for the top event card
   */
  getCurrentCard(): Locator {
    // The top card has z-index 10 and is draggable
    return this.page.locator(this.eventCardSelector).first();
  }

  /**
   * Gets the title of the current event card.
   * @returns The event title text
   */
  async getCardTitle(): Promise<string> {
    const card = this.getCurrentCard();
    // The title is in the EventCardContent component
    const titleElement = card.locator('h2').first();
    return (await titleElement.textContent()) ?? '';
  }

  /**
   * Gets the card stack container locator.
   * @returns Locator for the card stack
   */
  getCardStack(): Locator {
    return this.page.locator(this.cardStackSelector);
  }

  /**
   * Clicks the save (heart) button to save the current event.
   */
  async clickSaveButton(): Promise<void> {
    await this.page.locator(this.saveButtonSelector).click();
    await this.waitForAnimation();
  }

  /**
   * Clicks the pass (X) button to dismiss the current event.
   */
  async clickPassButton(): Promise<void> {
    await this.page.locator(this.passButtonSelector).click();
    await this.waitForAnimation();
  }

  /**
   * Performs a swipe right gesture on the current card to save it.
   * @param distance - Distance to swipe in pixels (default: 200)
   */
  async swipeRight(distance: number = 200): Promise<void> {
    const card = this.getCurrentCard();
    await simulateSwipeRight(this.page, card, distance);
  }

  /**
   * Performs a swipe left gesture on the current card to pass on it.
   * @param distance - Distance to swipe in pixels (default: 200)
   */
  async swipeLeft(distance: number = 200): Promise<void> {
    const card = this.getCurrentCard();
    await simulateSwipeLeft(this.page, card, distance);
  }

  /**
   * Taps the current card to open the event detail modal.
   */
  async tapCard(): Promise<void> {
    const card = this.getCurrentCard();
    await card.click();
    await this.waitForAnimation();
  }

  /**
   * Presses the right arrow key to save the current event.
   * Requires the card stack to be focused.
   */
  async pressArrowRight(): Promise<void> {
    // Focus the card stack first
    await this.getCardStack().focus();
    await this.page.keyboard.press('ArrowRight');
    await this.waitForAnimation();
  }

  /**
   * Presses the left arrow key to pass on the current event.
   * Requires the card stack to be focused.
   */
  async pressArrowLeft(): Promise<void> {
    // Focus the card stack first
    await this.getCardStack().focus();
    await this.page.keyboard.press('ArrowLeft');
    await this.waitForAnimation();
  }

  /**
   * Presses Enter or Space to open event details (when focused).
   */
  async pressEnterToOpenDetail(): Promise<void> {
    await this.getCardStack().focus();
    await this.page.keyboard.press('Enter');
    await this.waitForAnimation();
  }

  /**
   * Checks if the empty state (no more events) is displayed.
   * @returns True if empty state is visible
   */
  async isEmptyState(): Promise<boolean> {
    const emptyState = this.page.locator(this.emptyStateSelector);
    const noEvents = this.page.locator(this.noEventsSelector);
    return (await emptyState.isVisible()) || (await noEvents.isVisible());
  }

  /**
   * Gets the empty state message text.
   * @returns The empty state message
   */
  async getEmptyStateMessage(): Promise<string> {
    // Check for "No more events" state first
    const emptyState = this.page.locator(this.emptyStateSelector);
    if (await emptyState.isVisible()) {
      return (await emptyState.textContent()) ?? '';
    }
    // Check for "No Events Found" state
    const noEvents = this.page.locator(this.noEventsSelector);
    if (await noEvents.isVisible()) {
      return (await noEvents.textContent()) ?? '';
    }
    return '';
  }

  /**
   * Clicks the "Start Over" button to reset the card stack.
   */
  async clickStartOver(): Promise<void> {
    await this.page.locator(this.startOverButtonSelector).click();
    await this.waitForAnimation();
  }

  /**
   * Checks if the loading skeleton is displayed.
   * @returns True if loading state is visible
   */
  async isLoading(): Promise<boolean> {
    const skeleton = this.page.locator(this.loadingSkeletonSelector);
    const count = await skeleton.count();
    return count > 0;
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
    const errorContainer = this.page.locator('.text-red-500').first();
    const parentSection = errorContainer.locator('..').locator('..');
    const messageElement = parentSection.locator('p.text-muted');
    return (await messageElement.textContent()) ?? '';
  }

  /**
   * Clicks the retry button on the error state.
   */
  async clickRetryButton(): Promise<void> {
    await this.page.locator(this.retryButtonSelector).click();
    await this.waitForPageLoad();
  }

  /**
   * Gets the count of visible event cards in the stack.
   * @returns Number of visible cards
   */
  async getVisibleCardCount(): Promise<number> {
    const cards = this.page.locator(this.eventCardSelector);
    return cards.count();
  }

  /**
   * Waits for event cards to be loaded and visible.
   * @param timeout - Maximum time to wait (default: 10000)
   */
  async waitForCardsToLoad(timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(this.eventCardSelector, {
      state: 'visible',
      timeout
    });
    await this.waitForAnimation();
  }

  /**
   * Gets the pass button locator.
   * @returns Locator for the pass button
   */
  getPassButton(): Locator {
    return this.page.locator(this.passButtonSelector);
  }

  /**
   * Gets the save button locator.
   * @returns Locator for the save button
   */
  getSaveButton(): Locator {
    return this.page.locator(this.saveButtonSelector);
  }

  /**
   * Gets the category badge text from the current card.
   * @returns The category text or empty string
   */
  async getCardCategory(): Promise<string> {
    const card = this.getCurrentCard();
    const badge = card.locator('.rounded-full.text-xs').first();
    return (await badge.textContent()) ?? '';
  }

  /**
   * Gets the venue name from the current card.
   * @returns The venue name or empty string
   */
  async getCardVenue(): Promise<string> {
    const card = this.getCurrentCard();
    // Venue is in EventCardContent with MapPin icon
    const venueElement = card.locator('text=/.*MapPin.*|.*/').locator('xpath=following-sibling::span').first();
    // Alternative: look for the text after the map pin icon
    const contentArea = card.locator('.absolute.bottom-0');
    const venueSpan = contentArea.locator('span').last();
    return (await venueSpan.textContent()) ?? '';
  }
}
