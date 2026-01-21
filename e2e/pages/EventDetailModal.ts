import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Event Detail Modal.
 * Handles interactions with the full-screen event detail view
 * that opens when tapping an event card.
 */
export class EventDetailModal extends BasePage {
  // Selectors based on EventDetail.tsx
  private readonly modalSelector = '.fixed.inset-0.z-50';
  private readonly closeButtonSelector = 'button[aria-label="Close"]';
  private readonly titleSelector = 'h1.text-3xl';
  private readonly dateTimeSelector = '.flex.items-start.gap-3';
  private readonly saveButtonSelector = 'button:has-text("Save"), button:has-text("Saved")';
  private readonly passButtonSelector = 'button:has-text("Pass")';
  private readonly shareButtonSelector = 'button[aria-label="Share event"]';
  private readonly descriptionSelector = '.whitespace-pre-wrap';
  private readonly categoryBadgeSelector = '.rounded-full.text-xs.font-semibold';
  private readonly priceSelector = '.bg-green-500\\/20, .bg-card';
  private readonly venueSectionSelector = '.flex.items-start.gap-3';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Checks if the event detail modal is currently open.
   * @returns True if the modal is visible
   */
  async isOpen(): Promise<boolean> {
    const modal = this.page.locator(this.modalSelector);
    return modal.isVisible();
  }

  /**
   * Waits for the modal to be visible.
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForOpen(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.modalSelector).waitFor({
      state: 'visible',
      timeout
    });
    await this.waitForAnimation();
  }

  /**
   * Waits for the modal to close.
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForClose(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.modalSelector).waitFor({
      state: 'hidden',
      timeout
    });
    await this.waitForAnimation();
  }

  /**
   * Closes the modal by clicking the close button.
   */
  async close(): Promise<void> {
    await this.page.locator(this.closeButtonSelector).click();
    await this.waitForAnimation();
  }

  /**
   * Gets the event title from the modal.
   * @returns The event title text
   */
  async getTitle(): Promise<string> {
    const title = this.page.locator(this.titleSelector);
    return (await title.textContent()) ?? '';
  }

  /**
   * Gets the date/time text from the modal.
   * @returns The formatted date/time string
   */
  async getDateTime(): Promise<string> {
    // Find the date section (first flex container with Calendar icon)
    const dateSection = this.page.locator(this.dateTimeSelector).first();
    const dateText = dateSection.locator('p.font-medium');
    return (await dateText.textContent()) ?? '';
  }

  /**
   * Gets the venue name from the modal.
   * @returns The venue name or empty string if not present
   */
  async getVenue(): Promise<string> {
    // Venue section is the second flex container (after date)
    // It contains the MapPin icon
    const venueSections = this.page.locator(this.venueSectionSelector);
    // The venue section should have venue_name as font-medium
    const count = await venueSections.count();

    for (let i = 0; i < count; i++) {
      const section = venueSections.nth(i);
      const venueText = section.locator('p.font-medium');
      const text = await venueText.textContent();
      // Skip the date section (contains date format)
      if (text && !text.includes('AM') && !text.includes('PM') && !text.includes('at')) {
        return text;
      }
    }

    return '';
  }

  /**
   * Gets the event description text.
   * @returns The description text or empty string
   */
  async getDescription(): Promise<string> {
    const description = this.page.locator(this.descriptionSelector);
    if (await description.isVisible()) {
      return (await description.textContent()) ?? '';
    }
    return '';
  }

  /**
   * Gets the category badge text.
   * @returns The category label
   */
  async getCategory(): Promise<string> {
    const badge = this.page.locator(this.categoryBadgeSelector).first();
    return (await badge.textContent()) ?? '';
  }

  /**
   * Clicks the Save button in the modal.
   */
  async clickSave(): Promise<void> {
    // Find the save button (contains Heart icon and "Save" or "Saved" text)
    const saveButton = this.page.locator('button').filter({
      has: this.page.locator('text=Save')
    }).first();
    await saveButton.click();
    await this.waitForAnimation();
  }

  /**
   * Clicks the Pass button in the modal.
   */
  async clickPass(): Promise<void> {
    const passButton = this.page.locator(this.passButtonSelector);
    await passButton.click();
    await this.waitForAnimation();
  }

  /**
   * Checks if the event is currently saved (button shows "Saved").
   * @returns True if the event is saved
   */
  async isSaved(): Promise<boolean> {
    const savedButton = this.page.locator('button:has-text("Saved")');
    return savedButton.isVisible();
  }

  /**
   * Clicks the share button.
   */
  async clickShareButton(): Promise<void> {
    const shareButton = this.page.locator(this.shareButtonSelector);
    await shareButton.click();
    await this.waitForAnimation();
  }

  /**
   * Gets the price information from the modal.
   * @returns Price text (e.g., "Free Event" or "$25 per person")
   */
  async getPrice(): Promise<string> {
    // Check for free event badge
    const freeEvent = this.page.locator('text=Free Event');
    if (await freeEvent.isVisible()) {
      return 'Free Event';
    }

    // Check for price display
    const priceElement = this.page.locator('.bg-card.text-foreground.rounded-full');
    if (await priceElement.isVisible()) {
      return (await priceElement.textContent()) ?? '';
    }

    return '';
  }

  /**
   * Gets the location/address text.
   * @returns The address or empty string
   */
  async getLocation(): Promise<string> {
    // Location is the link or text below venue name
    const locationLink = this.page.locator('a.text-accent').first();
    if (await locationLink.isVisible()) {
      return (await locationLink.textContent()) ?? '';
    }

    const locationText = this.page.locator('.text-sm.text-muted').filter({
      hasNot: this.page.locator('text=Add to calendar')
    });
    const count = await locationText.count();
    if (count > 0) {
      return (await locationText.first().textContent()) ?? '';
    }

    return '';
  }

  /**
   * Checks if the Pass button is visible (only shown when coming from discover).
   * @returns True if Pass button is visible
   */
  async hasPassButton(): Promise<boolean> {
    const passButton = this.page.locator(this.passButtonSelector);
    return passButton.isVisible();
  }

  /**
   * Clicks the external link for tickets/more info.
   */
  async clickTicketLink(): Promise<void> {
    const ticketLink = this.page.locator('a:has-text("More info / Tickets")');
    await ticketLink.click();
  }

  /**
   * Checks if ticket link is visible.
   * @returns True if ticket link exists
   */
  async hasTicketLink(): Promise<boolean> {
    const ticketLink = this.page.locator('a:has-text("More info / Tickets")');
    return ticketLink.isVisible();
  }

  /**
   * Gets the modal locator for advanced assertions.
   * @returns Locator for the modal element
   */
  getModal(): Locator {
    return this.page.locator(this.modalSelector);
  }

  /**
   * Gets the save button locator.
   * @returns Locator for the save button
   */
  getSaveButton(): Locator {
    return this.page.locator(this.saveButtonSelector);
  }

  /**
   * Gets the pass button locator.
   * @returns Locator for the pass button
   */
  getPassButton(): Locator {
    return this.page.locator(this.passButtonSelector);
  }

  /**
   * Gets the close button locator.
   * @returns Locator for the close button
   */
  getCloseButton(): Locator {
    return this.page.locator(this.closeButtonSelector);
  }
}
