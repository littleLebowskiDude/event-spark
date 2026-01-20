import { Page, Route } from '@playwright/test';
import { Event } from '../fixtures/events.fixture';

/**
 * Supabase API URL pattern for events table
 * Matches requests to the events endpoint
 */
const EVENTS_API_PATTERN = '**/rest/v1/events**';

/**
 * Alternative API patterns for different Supabase configurations
 */
const EVENTS_API_PATTERNS = [
  '**/rest/v1/events**',
  '**/api/events**',
  '**supabase.co/rest/v1/events**',
];

/**
 * Mock handler type for route interception
 */
type MockHandler = (route: Route) => Promise<void>;

/**
 * Creates a successful events API response.
 *
 * @param page - Playwright page object
 * @param events - Array of events to return
 * @param options - Optional configuration
 * @param options.delay - Artificial delay in milliseconds (default: 0)
 */
export async function mockEventsSuccess(
  page: Page,
  events: Event[],
  options: { delay?: number } = {}
): Promise<void> {
  const { delay = 0 } = options;

  const handler: MockHandler = async (route) => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(events),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  // Set up route handlers for all patterns
  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Mocks an API error response.
 *
 * @param page - Playwright page object
 * @param status - HTTP status code (default: 500)
 * @param message - Error message (default: 'Internal Server Error')
 */
export async function mockEventsError(
  page: Page,
  status: number = 500,
  message: string = 'Internal Server Error'
): Promise<void> {
  const handler: MockHandler = async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        error: message,
        message: message,
        code: status.toString(),
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Mocks an empty events response.
 *
 * @param page - Playwright page object
 */
export async function mockEmptyEvents(page: Page): Promise<void> {
  await mockEventsSuccess(page, []);
}

/**
 * Mocks a network error (simulates connection failure).
 *
 * @param page - Playwright page object
 */
export async function mockNetworkError(page: Page): Promise<void> {
  const handler: MockHandler = async (route) => {
    await route.abort('connectionfailed');
  };

  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Mocks a timeout scenario.
 *
 * @param page - Playwright page object
 * @param timeout - Timeout duration in milliseconds (default: 30000)
 */
export async function mockEventsTimeout(
  page: Page,
  timeout: number = 30000
): Promise<void> {
  const handler: MockHandler = async (route) => {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    await route.abort('timedout');
  };

  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Mocks a slow API response (for testing loading states).
 *
 * @param page - Playwright page object
 * @param events - Array of events to return
 * @param delay - Delay in milliseconds (default: 2000)
 */
export async function mockSlowEventsResponse(
  page: Page,
  events: Event[],
  delay: number = 2000
): Promise<void> {
  await mockEventsSuccess(page, events, { delay });
}

/**
 * Mocks a 404 Not Found response.
 *
 * @param page - Playwright page object
 */
export async function mockEventsNotFound(page: Page): Promise<void> {
  await mockEventsError(page, 404, 'Not Found');
}

/**
 * Mocks an unauthorized (401) response.
 *
 * @param page - Playwright page object
 */
export async function mockEventsUnauthorized(page: Page): Promise<void> {
  await mockEventsError(page, 401, 'Unauthorized');
}

/**
 * Mocks a rate limited (429) response.
 *
 * @param page - Playwright page object
 * @param retryAfter - Retry-After header value in seconds (default: 60)
 */
export async function mockEventsRateLimited(
  page: Page,
  retryAfter: number = 60
): Promise<void> {
  const handler: MockHandler = async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Clears all event API mocks.
 *
 * @param page - Playwright page object
 */
export async function clearEventMocks(page: Page): Promise<void> {
  for (const pattern of EVENTS_API_PATTERNS) {
    await page.unroute(pattern);
  }
}

/**
 * Mocks events with conditional responses based on query parameters.
 *
 * @param page - Playwright page object
 * @param responseMap - Map of query string patterns to event arrays
 */
export async function mockEventsConditional(
  page: Page,
  responseMap: Map<string, Event[]>
): Promise<void> {
  const handler: MockHandler = async (route) => {
    const url = route.request().url();

    for (const [pattern, events] of Array.from(responseMap.entries())) {
      if (url.includes(pattern)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(events),
        });
        return;
      }
    }

    // Default: return empty array
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  };

  for (const pattern of EVENTS_API_PATTERNS) {
    await page.route(pattern, handler);
  }
}

/**
 * Captures and records API requests for verification.
 *
 * @param page - Playwright page object
 * @returns Object with methods to access captured requests
 */
export function captureEventRequests(page: Page): {
  getRequests: () => { url: string; method: string; body?: string }[];
  clear: () => void;
} {
  const requests: { url: string; method: string; body?: string }[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (
      EVENTS_API_PATTERNS.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(url);
      })
    ) {
      requests.push({
        url: request.url(),
        method: request.method(),
        body: request.postData() ?? undefined,
      });
    }
  });

  return {
    getRequests: () => [...requests],
    clear: () => {
      requests.length = 0;
    },
  };
}

/**
 * Waits for an event API request to be made.
 *
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForEventRequest(
  page: Page,
  timeout: number = 5000
): Promise<void> {
  await page.waitForRequest(
    (request) => {
      const url = request.url();
      return EVENTS_API_PATTERNS.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(url);
      });
    },
    { timeout }
  );
}

/**
 * Waits for an event API response.
 *
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForEventResponse(
  page: Page,
  timeout: number = 5000
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      return EVENTS_API_PATTERNS.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(url);
      });
    },
    { timeout }
  );
}
