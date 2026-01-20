import { Page, Locator } from '@playwright/test';

/**
 * Default animation duration for framer-motion (in milliseconds)
 */
export const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Swipe threshold distance (in pixels) - matches typical swipe detection
 */
export const SWIPE_THRESHOLD = 150;

/**
 * Waits for framer-motion animations to complete.
 *
 * @param page - Playwright page object
 * @param ms - Duration to wait in milliseconds (default: 300ms)
 */
export async function waitForAnimation(
  page: Page,
  ms: number = DEFAULT_ANIMATION_DURATION
): Promise<void> {
  await page.waitForTimeout(ms);
}

/**
 * Waits for all animations to settle using a more reliable method.
 * Uses requestAnimationFrame to ensure animations are complete.
 *
 * @param page - Playwright page object
 */
export async function waitForAnimationsToSettle(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });
  // Additional buffer for framer-motion
  await page.waitForTimeout(100);
}

/**
 * Simulates a swipe right gesture on an element.
 * Used for "save" actions on event cards.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to swipe
 * @param distance - Distance to swipe in pixels (default: SWIPE_THRESHOLD + 50)
 */
export async function simulateSwipeRight(
  page: Page,
  element: Locator,
  distance: number = SWIPE_THRESHOLD + 50
): Promise<void> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX + distance;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  // Move in steps for smoother gesture simulation
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    await page.mouse.move(currentX, startY);
    await page.waitForTimeout(10);
  }

  await page.mouse.up();

  // Wait for animation to complete
  await waitForAnimation(page);
}

/**
 * Simulates a swipe left gesture on an element.
 * Used for "dismiss" actions on event cards.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to swipe
 * @param distance - Distance to swipe in pixels (default: SWIPE_THRESHOLD + 50)
 */
export async function simulateSwipeLeft(
  page: Page,
  element: Locator,
  distance: number = SWIPE_THRESHOLD + 50
): Promise<void> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX - distance;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  // Move in steps for smoother gesture simulation
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    await page.mouse.move(currentX, startY);
    await page.waitForTimeout(10);
  }

  await page.mouse.up();

  // Wait for animation to complete
  await waitForAnimation(page);
}

/**
 * Simulates a swipe up gesture on an element.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to swipe
 * @param distance - Distance to swipe in pixels
 */
export async function simulateSwipeUp(
  page: Page,
  element: Locator,
  distance: number = 200
): Promise<void> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endY = startY - distance;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentY = startY + (endY - startY) * progress;
    await page.mouse.move(startX, currentY);
    await page.waitForTimeout(10);
  }

  await page.mouse.up();
  await waitForAnimation(page);
}

/**
 * Simulates a swipe down gesture on an element.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to swipe
 * @param distance - Distance to swipe in pixels
 */
export async function simulateSwipeDown(
  page: Page,
  element: Locator,
  distance: number = 200
): Promise<void> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endY = startY + distance;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentY = startY + (endY - startY) * progress;
    await page.mouse.move(startX, currentY);
    await page.waitForTimeout(10);
  }

  await page.mouse.up();
  await waitForAnimation(page);
}

/**
 * Simulates a tap (quick click) on an element.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to tap
 */
export async function simulateTap(page: Page, element: Locator): Promise<void> {
  await element.click();
  await waitForAnimation(page, 100);
}

/**
 * Simulates a long press on an element.
 *
 * @param page - Playwright page object
 * @param element - Locator for the element to long press
 * @param duration - Duration of the press in milliseconds (default: 500)
 */
export async function simulateLongPress(
  page: Page,
  element: Locator,
  duration: number = 500
): Promise<void> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(duration);
  await page.mouse.up();
  await waitForAnimation(page);
}

/**
 * Waits for an element to be visible and stable.
 *
 * @param element - Locator for the element
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForElementStable(
  element: Locator,
  timeout: number = 5000
): Promise<void> {
  await element.waitFor({ state: 'visible', timeout });
  // Wait for position to stabilize
  const page = element.page();
  await page.waitForTimeout(100);
}

/**
 * Scrolls an element into view and waits for it to be visible.
 *
 * @param element - Locator for the element
 */
export async function scrollIntoViewAndWait(element: Locator): Promise<void> {
  await element.scrollIntoViewIfNeeded();
  await waitForElementStable(element);
}

/**
 * Takes a screenshot with a timestamp for debugging.
 *
 * @param page - Playwright page object
 * @param name - Name prefix for the screenshot
 */
export async function takeDebugScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `./e2e/screenshots/${name}-${timestamp}.png` });
}

/**
 * Waits for network requests to settle (no pending requests).
 *
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = 5000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Gets the computed style of an element.
 *
 * @param element - Locator for the element
 * @param property - CSS property to get
 * @returns The computed style value
 */
export async function getComputedStyle(
  element: Locator,
  property: string
): Promise<string> {
  return element.evaluate((el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }, property);
}

/**
 * Checks if an element has a specific CSS class.
 *
 * @param element - Locator for the element
 * @param className - Class name to check
 * @returns True if the element has the class
 */
export async function hasClass(
  element: Locator,
  className: string
): Promise<boolean> {
  const classes = await element.getAttribute('class');
  return classes?.split(' ').includes(className) ?? false;
}
