import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Admin Login page (/admin/login).
 * Handles authentication flows for the admin section.
 */
export class AdminLoginPage extends BasePage {
  // Selectors based on admin/login/page.tsx
  private readonly emailInputSelector = 'input#email';
  private readonly passwordInputSelector = 'input#password';
  private readonly loginButtonSelector = 'button[type="submit"]';
  private readonly errorMessageSelector = '.bg-red-500\\/10 .text-sm';
  private readonly loadingSpinnerSelector = '.animate-spin';
  private readonly demoModeSelector = 'text=Development Mode';
  private readonly pageHeaderSelector = 'h2:has-text("Admin Login")';
  private readonly logoSelector = '.flex.items-center.gap-2';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the admin login page.
   */
  async goto(): Promise<void> {
    await super.goto('/admin/login');
  }

  /**
   * Fills the email input field.
   * @param email - The email address to enter
   */
  async fillEmail(email: string): Promise<void> {
    const emailInput = this.page.locator(this.emailInputSelector);
    await emailInput.fill(email);
  }

  /**
   * Fills the password input field.
   * @param password - The password to enter
   */
  async fillPassword(password: string): Promise<void> {
    const passwordInput = this.page.locator(this.passwordInputSelector);
    await passwordInput.fill(password);
  }

  /**
   * Clicks the login/sign in button.
   */
  async clickLogin(): Promise<void> {
    const loginButton = this.page.locator(this.loginButtonSelector);
    await loginButton.click();
  }

  /**
   * Performs a complete login flow with the given credentials.
   * @param email - The email address
   * @param password - The password
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Gets the error message displayed on login failure.
   * @returns The error message text or empty string
   */
  async getErrorMessage(): Promise<string> {
    const errorElement = this.page.locator(this.errorMessageSelector);
    if (await errorElement.isVisible()) {
      return (await errorElement.textContent()) ?? '';
    }
    return '';
  }

  /**
   * Checks if an error message is displayed.
   * @returns True if error is visible
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.page.locator(this.errorMessageSelector);
    return errorElement.isVisible();
  }

  /**
   * Checks if the user has been redirected after successful login.
   * Successful login redirects to /admin or /admin/events.
   * @returns True if user appears to be logged in (redirected)
   */
  async isLoggedIn(): Promise<boolean> {
    const currentUrl = this.getUrl();
    // Check if we've been redirected away from login page
    return currentUrl.includes('/admin') && !currentUrl.includes('/login');
  }

  /**
   * Waits for redirect after successful login.
   * @param timeout - Maximum time to wait (default: 5000)
   */
  async waitForLoginRedirect(timeout: number = 5000): Promise<void> {
    await this.page.waitForURL(/\/admin(?!\/login)/, { timeout });
  }

  /**
   * Checks if the login form is loading (submitting).
   * @returns True if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    const spinner = this.page.locator(this.loadingSpinnerSelector);
    return spinner.isVisible();
  }

  /**
   * Checks if development/demo mode notice is displayed.
   * @returns True if demo mode notice is visible
   */
  async isDemoMode(): Promise<boolean> {
    const demoNotice = this.page.locator(this.demoModeSelector);
    return demoNotice.isVisible();
  }

  /**
   * Gets demo credentials displayed on the page (if in demo mode).
   * @returns Object with email and password, or null if not in demo mode
   */
  async getDemoCredentials(): Promise<{ email: string; password: string } | null> {
    const demoNotice = this.page.locator('.bg-yellow-500\\/10');
    if (!(await demoNotice.isVisible())) {
      return null;
    }

    // Extract credentials from the demo notice
    const monoText = demoNotice.locator('.font-mono');
    const credentialsText = await monoText.textContent();

    if (credentialsText) {
      // Format: "admin@example.com / admin"
      const parts = credentialsText.split('/').map(s => s.trim());
      if (parts.length === 2) {
        return { email: parts[0], password: parts[1] };
      }
    }

    return null;
  }

  /**
   * Gets the email input locator.
   * @returns Locator for email input
   */
  getEmailInput(): Locator {
    return this.page.locator(this.emailInputSelector);
  }

  /**
   * Gets the password input locator.
   * @returns Locator for password input
   */
  getPasswordInput(): Locator {
    return this.page.locator(this.passwordInputSelector);
  }

  /**
   * Gets the login button locator.
   * @returns Locator for login button
   */
  getLoginButton(): Locator {
    return this.page.locator(this.loginButtonSelector);
  }

  /**
   * Gets the page header locator.
   * @returns Locator for page header
   */
  getPageHeader(): Locator {
    return this.page.locator(this.pageHeaderSelector);
  }

  /**
   * Clears the email input field.
   */
  async clearEmail(): Promise<void> {
    const emailInput = this.page.locator(this.emailInputSelector);
    await emailInput.clear();
  }

  /**
   * Clears the password input field.
   */
  async clearPassword(): Promise<void> {
    const passwordInput = this.page.locator(this.passwordInputSelector);
    await passwordInput.clear();
  }

  /**
   * Gets the current value of the email input.
   * @returns The email input value
   */
  async getEmailValue(): Promise<string> {
    const emailInput = this.page.locator(this.emailInputSelector);
    return emailInput.inputValue();
  }

  /**
   * Gets the current value of the password input.
   * @returns The password input value
   */
  async getPasswordValue(): Promise<string> {
    const passwordInput = this.page.locator(this.passwordInputSelector);
    return passwordInput.inputValue();
  }

  /**
   * Checks if the login button is enabled.
   * @returns True if the button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    const loginButton = this.page.locator(this.loginButtonSelector);
    return loginButton.isEnabled();
  }
}
