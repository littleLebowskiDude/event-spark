import { Page, Locator } from '@playwright/test';

/**
 * Component Object for the Bottom Navigation bar.
 * Handles navigation between Discover and Saved pages.
 */
export class BottomNav {
  private readonly page: Page;

  // Selectors based on BottomNav.tsx
  private readonly navSelector = 'nav.fixed.bottom-0';
  private readonly discoverLinkSelector = 'a[href="/"]';
  private readonly savedLinkSelector = 'a[href="/saved"]';
  private readonly activeLinkClass = 'text-accent';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Gets the navigation bar locator.
   * @returns Locator for the nav element
   */
  getNav(): Locator {
    return this.page.locator(this.navSelector);
  }

  /**
   * Clicks the Discover navigation link.
   */
  async clickDiscover(): Promise<void> {
    const link = this.page.locator(this.discoverLinkSelector);
    await link.click();
  }

  /**
   * Clicks the Saved navigation link.
   */
  async clickSaved(): Promise<void> {
    const link = this.page.locator(this.savedLinkSelector);
    await link.click();
  }

  /**
   * Checks if the Discover link is in active state.
   * @returns True if Discover is active
   */
  async isDiscoverActive(): Promise<boolean> {
    const link = this.page.locator(this.discoverLinkSelector);
    const classes = await link.getAttribute('class');
    return classes?.includes(this.activeLinkClass) ?? false;
  }

  /**
   * Checks if the Saved link is in active state.
   * @returns True if Saved is active
   */
  async isSavedActive(): Promise<boolean> {
    const link = this.page.locator(this.savedLinkSelector);
    const classes = await link.getAttribute('class');
    return classes?.includes(this.activeLinkClass) ?? false;
  }

  /**
   * Gets the Discover link locator.
   * @returns Locator for Discover link
   */
  getDiscoverLink(): Locator {
    return this.page.locator(this.discoverLinkSelector);
  }

  /**
   * Gets the Saved link locator.
   * @returns Locator for Saved link
   */
  getSavedLink(): Locator {
    return this.page.locator(this.savedLinkSelector);
  }

  /**
   * Checks if the navigation bar is visible.
   * @returns True if visible
   */
  async isVisible(): Promise<boolean> {
    return this.getNav().isVisible();
  }

  /**
   * Gets the text label for the Discover link.
   * @returns Label text
   */
  async getDiscoverLabel(): Promise<string> {
    const link = this.page.locator(this.discoverLinkSelector);
    const label = link.locator('span.text-xs');
    return (await label.textContent()) ?? '';
  }

  /**
   * Gets the text label for the Saved link.
   * @returns Label text
   */
  async getSavedLabel(): Promise<string> {
    const link = this.page.locator(this.savedLinkSelector);
    const label = link.locator('span.text-xs');
    return (await label.textContent()) ?? '';
  }

  /**
   * Waits for the navigation to be visible.
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForVisible(timeout: number = 5000): Promise<void> {
    await this.getNav().waitFor({ state: 'visible', timeout });
  }

  /**
   * Gets the current active page based on link state.
   * @returns 'discover' | 'saved' | null
   */
  async getActivePage(): Promise<'discover' | 'saved' | null> {
    if (await this.isDiscoverActive()) {
      return 'discover';
    }
    if (await this.isSavedActive()) {
      return 'saved';
    }
    return null;
  }

  /**
   * Navigates to a page using the bottom nav.
   * @param page - 'discover' or 'saved'
   */
  async navigateTo(pageName: 'discover' | 'saved'): Promise<void> {
    if (pageName === 'discover') {
      await this.clickDiscover();
    } else {
      await this.clickSaved();
    }
  }
}
