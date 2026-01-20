import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Form data interface for creating/editing events.
 */
export interface EventFormData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venueName?: string;
  location?: string;
  category?: string;
  isFree?: boolean;
  price?: string;
  imageUrl?: string;
  ticketUrl?: string;
}

/**
 * Page Object for the Admin Event Form page.
 * Handles both /admin/events/new (create) and /admin/events/[id] (edit).
 */
export class AdminEventFormPage extends BasePage {
  // Selectors based on EventForm.tsx
  private readonly titleInputSelector = 'input#title';
  private readonly descriptionInputSelector = 'textarea#description';
  private readonly startDateInputSelector = 'input#start_date';
  private readonly endDateInputSelector = 'input#end_date';
  private readonly venueInputSelector = 'input#venue_name';
  private readonly locationInputSelector = 'input#location';
  private readonly categorySelectSelector = 'select#category';
  private readonly isFreeCheckboxSelector = 'input#is_free';
  private readonly priceInputSelector = 'input#price';
  private readonly imageUrlInputSelector = 'input[name="image_url"]';
  private readonly ticketUrlInputSelector = 'input#ticket_url';
  private readonly submitButtonSelector = 'button[type="submit"]';
  private readonly cancelButtonSelector = 'button:has-text("Cancel")';
  private readonly loadingSpinnerSelector = '.animate-spin';
  private readonly formErrorSelector = '.bg-red-500\\/10.p-4';
  private readonly fieldErrorSelector = '.text-red-500.text-sm';
  private readonly imagePreviewSelector = '.w-32.h-32';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the event form page.
   * @param id - Event ID for editing, omit for new event
   */
  async goto(id?: string): Promise<void> {
    if (id) {
      await super.goto(`/admin/events/${id}`);
    } else {
      await super.goto('/admin/events/new');
    }
  }

  /**
   * Fills the event title field.
   * @param title - The event title
   */
  async fillTitle(title: string): Promise<void> {
    const input = this.page.locator(this.titleInputSelector);
    await input.fill(title);
  }

  /**
   * Fills the event description field.
   * @param description - The event description
   */
  async fillDescription(description: string): Promise<void> {
    const textarea = this.page.locator(this.descriptionInputSelector);
    await textarea.fill(description);
  }

  /**
   * Fills the start date/time field.
   * @param date - Date string in datetime-local format (YYYY-MM-DDTHH:mm)
   */
  async fillStartDate(date: string): Promise<void> {
    const input = this.page.locator(this.startDateInputSelector);
    await input.fill(date);
  }

  /**
   * Fills the end date/time field.
   * @param date - Date string in datetime-local format (YYYY-MM-DDTHH:mm)
   */
  async fillEndDate(date: string): Promise<void> {
    const input = this.page.locator(this.endDateInputSelector);
    await input.fill(date);
  }

  /**
   * Fills the venue name field.
   * @param venue - The venue name
   */
  async fillVenue(venue: string): Promise<void> {
    const input = this.page.locator(this.venueInputSelector);
    await input.fill(venue);
  }

  /**
   * Fills the location/address field.
   * @param location - The address
   */
  async fillLocation(location: string): Promise<void> {
    const input = this.page.locator(this.locationInputSelector);
    await input.fill(location);
  }

  /**
   * Fills the image URL field.
   * @param url - The image URL
   */
  async fillImageUrl(url: string): Promise<void> {
    const input = this.page.locator(this.imageUrlInputSelector);
    await input.fill(url);
  }

  /**
   * Fills the ticket/info URL field.
   * @param url - The ticket URL
   */
  async fillTicketUrl(url: string): Promise<void> {
    const input = this.page.locator(this.ticketUrlInputSelector);
    await input.fill(url);
  }

  /**
   * Selects a category from the dropdown.
   * @param category - The category value (e.g., 'music', 'food', 'arts')
   */
  async selectCategory(category: string): Promise<void> {
    const select = this.page.locator(this.categorySelectSelector);
    await select.selectOption(category);
  }

  /**
   * Sets the "is free" checkbox state.
   * @param isFree - True to check, false to uncheck
   */
  async setIsFree(isFree: boolean): Promise<void> {
    const checkbox = this.page.locator(this.isFreeCheckboxSelector);
    const isChecked = await checkbox.isChecked();

    if (isFree !== isChecked) {
      await checkbox.click();
    }
  }

  /**
   * Fills the price field (only visible when not free).
   * @param price - The price string (e.g., "$25 per person")
   */
  async fillPrice(price: string): Promise<void> {
    // Ensure "is free" is unchecked first
    await this.setIsFree(false);

    const input = this.page.locator(this.priceInputSelector);
    await input.fill(price);
  }

  /**
   * Clicks the submit button to save the event.
   */
  async clickSubmit(): Promise<void> {
    const button = this.page.locator(this.submitButtonSelector);
    await button.click();
  }

  /**
   * Clicks the cancel button to return to events list.
   */
  async clickCancel(): Promise<void> {
    const button = this.page.locator(this.cancelButtonSelector);
    await button.click();
    await this.waitForPageLoad();
  }

  /**
   * Gets all validation error messages displayed on the form.
   * @returns Array of error message strings
   */
  async getValidationErrors(): Promise<string[]> {
    const errorElements = this.page.locator(this.fieldErrorSelector);
    const count = await errorElements.count();
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent();
      if (text) errors.push(text);
    }

    return errors;
  }

  /**
   * Gets the form-level error message (if any).
   * @returns Error message or empty string
   */
  async getFormError(): Promise<string> {
    const errorElement = this.page.locator(this.formErrorSelector);
    if (await errorElement.isVisible()) {
      return errorElement.textContent() ?? '';
    }
    return '';
  }

  /**
   * Checks if a specific field has a validation error.
   * @param fieldName - The field name (title, description, etc.)
   * @returns True if field has error
   */
  async hasFieldError(fieldName: string): Promise<boolean> {
    // Field errors appear as siblings to the input
    const fieldContainer = this.page.locator(`#${fieldName}`).locator('..');
    const error = fieldContainer.locator(this.fieldErrorSelector);
    return error.isVisible();
  }

  /**
   * Gets the validation error for a specific field.
   * @param fieldName - The field name
   * @returns Error message or empty string
   */
  async getFieldError(fieldName: string): Promise<string> {
    const fieldContainer = this.page.locator(`#${fieldName}`).locator('..');
    const error = fieldContainer.locator(this.fieldErrorSelector);
    if (await error.isVisible()) {
      return error.textContent() ?? '';
    }
    return '';
  }

  /**
   * Fills the entire event form with provided data.
   * @param data - Partial event form data
   */
  async fillEventForm(data: EventFormData): Promise<void> {
    if (data.title !== undefined) {
      await this.fillTitle(data.title);
    }
    if (data.description !== undefined) {
      await this.fillDescription(data.description);
    }
    if (data.startDate !== undefined) {
      await this.fillStartDate(data.startDate);
    }
    if (data.endDate !== undefined) {
      await this.fillEndDate(data.endDate);
    }
    if (data.venueName !== undefined) {
      await this.fillVenue(data.venueName);
    }
    if (data.location !== undefined) {
      await this.fillLocation(data.location);
    }
    if (data.category !== undefined) {
      await this.selectCategory(data.category);
    }
    if (data.isFree !== undefined) {
      await this.setIsFree(data.isFree);
    }
    if (data.price !== undefined && !data.isFree) {
      await this.fillPrice(data.price);
    }
    if (data.imageUrl !== undefined) {
      await this.fillImageUrl(data.imageUrl);
    }
    if (data.ticketUrl !== undefined) {
      await this.fillTicketUrl(data.ticketUrl);
    }
  }

  /**
   * Checks if the form is currently submitting.
   * @returns True if loading spinner visible
   */
  async isSubmitting(): Promise<boolean> {
    const spinner = this.page.locator(this.submitButtonSelector).locator(this.loadingSpinnerSelector);
    return spinner.isVisible();
  }

  /**
   * Waits for form submission to complete (redirect to events list).
   * @param timeout - Maximum time to wait (default: 10000)
   */
  async waitForSubmitSuccess(timeout: number = 10000): Promise<void> {
    await this.page.waitForURL('/admin/events', { timeout });
  }

  /**
   * Gets the title input locator.
   * @returns Locator for title input
   */
  getTitleInput(): Locator {
    return this.page.locator(this.titleInputSelector);
  }

  /**
   * Gets the description textarea locator.
   * @returns Locator for description input
   */
  getDescriptionInput(): Locator {
    return this.page.locator(this.descriptionInputSelector);
  }

  /**
   * Gets the start date input locator.
   * @returns Locator for start date input
   */
  getStartDateInput(): Locator {
    return this.page.locator(this.startDateInputSelector);
  }

  /**
   * Gets the end date input locator.
   * @returns Locator for end date input
   */
  getEndDateInput(): Locator {
    return this.page.locator(this.endDateInputSelector);
  }

  /**
   * Gets the venue input locator.
   * @returns Locator for venue input
   */
  getVenueInput(): Locator {
    return this.page.locator(this.venueInputSelector);
  }

  /**
   * Gets the location input locator.
   * @returns Locator for location input
   */
  getLocationInput(): Locator {
    return this.page.locator(this.locationInputSelector);
  }

  /**
   * Gets the category select locator.
   * @returns Locator for category select
   */
  getCategorySelect(): Locator {
    return this.page.locator(this.categorySelectSelector);
  }

  /**
   * Gets the "is free" checkbox locator.
   * @returns Locator for checkbox
   */
  getIsFreeCheckbox(): Locator {
    return this.page.locator(this.isFreeCheckboxSelector);
  }

  /**
   * Gets the price input locator.
   * @returns Locator for price input
   */
  getPriceInput(): Locator {
    return this.page.locator(this.priceInputSelector);
  }

  /**
   * Gets the image URL input locator.
   * @returns Locator for image URL input
   */
  getImageUrlInput(): Locator {
    return this.page.locator(this.imageUrlInputSelector);
  }

  /**
   * Gets the ticket URL input locator.
   * @returns Locator for ticket URL input
   */
  getTicketUrlInput(): Locator {
    return this.page.locator(this.ticketUrlInputSelector);
  }

  /**
   * Gets the submit button locator.
   * @returns Locator for submit button
   */
  getSubmitButton(): Locator {
    return this.page.locator(this.submitButtonSelector);
  }

  /**
   * Gets the cancel button locator.
   * @returns Locator for cancel button
   */
  getCancelButton(): Locator {
    return this.page.locator(this.cancelButtonSelector);
  }

  /**
   * Gets the image preview locator.
   * @returns Locator for image preview element
   */
  getImagePreview(): Locator {
    return this.page.locator(this.imagePreviewSelector);
  }

  /**
   * Checks if price input is visible (not free).
   * @returns True if price input is visible
   */
  async isPriceInputVisible(): Promise<boolean> {
    const priceInput = this.page.locator(this.priceInputSelector);
    return priceInput.isVisible();
  }

  /**
   * Gets the current title value.
   * @returns Title input value
   */
  async getTitleValue(): Promise<string> {
    const input = this.page.locator(this.titleInputSelector);
    return input.inputValue();
  }

  /**
   * Gets the current description value.
   * @returns Description input value
   */
  async getDescriptionValue(): Promise<string> {
    const textarea = this.page.locator(this.descriptionInputSelector);
    return textarea.inputValue();
  }

  /**
   * Gets the current category value.
   * @returns Selected category value
   */
  async getCategoryValue(): Promise<string> {
    const select = this.page.locator(this.categorySelectSelector);
    return select.inputValue();
  }

  /**
   * Checks if the "is free" checkbox is checked.
   * @returns True if checked
   */
  async isFreeChecked(): Promise<boolean> {
    const checkbox = this.page.locator(this.isFreeCheckboxSelector);
    return checkbox.isChecked();
  }

  /**
   * Checks if this is the edit form (vs new).
   * @returns True if editing an existing event
   */
  isEditForm(): boolean {
    return this.getUrl().includes('/admin/events/') && !this.getUrl().includes('/new');
  }

  /**
   * Gets the submit button text (changes based on edit vs create).
   * @returns Button text
   */
  async getSubmitButtonText(): Promise<string> {
    const button = this.page.locator(this.submitButtonSelector);
    return button.textContent() ?? '';
  }
}
