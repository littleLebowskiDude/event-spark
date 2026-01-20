import { Page, Locator } from '@playwright/test';
import { waitForAnimation, waitForNetworkIdle, takeDebugScreenshot } from '../utils';

/**
 * Base Page Object class that provides common functionality
 * for all page objects in the Event-Spark E2E tests.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a path relative to the baseURL.
   * @param path - The path to navigate to (e.g., '/saved', '/admin/login')
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Waits for the page to reach network idle state.
   * Useful for ensuring all API calls have completed.
   * @param timeout - Maximum time to wait in milliseconds (default: 10000)
   */
  async waitForPageLoad(timeout: number = 10000): Promise<void> {
    await waitForNetworkIdle(this.page, timeout);
  }

  /**
   * Waits for framer-motion animations to complete.
   * @param ms - Duration to wait in milliseconds (default: 300)
   */
  async waitForAnimation(ms: number = 300): Promise<void> {
    await waitForAnimation(this.page, ms);
  }

  /**
   * Returns a locator for an element with the given data-testid attribute.
   * @param id - The test ID to locate
   * @returns Playwright Locator for the element
   */
  getByTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  /**
   * Takes a debug screenshot with a timestamp.
   * Screenshots are saved to ./e2e/screenshots/
   * @param name - Name prefix for the screenshot file
   */
  async takeScreenshot(name: string): Promise<void> {
    await takeDebugScreenshot(this.page, name);
  }

  /**
   * Gets the page title.
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Gets the current URL of the page.
   * @returns The current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Waits for a specific URL pattern.
   * @param urlPattern - URL string or RegExp to match
   * @param timeout - Maximum time to wait (default: 10000)
   */
  async waitForUrl(urlPattern: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Checks if an element is visible on the page.
   * @param locator - The locator to check
   * @returns True if the element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Waits for an element to be visible.
   * @param locator - The locator to wait for
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for an element to be hidden.
   * @param locator - The locator to wait for
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForHidden(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }
}
