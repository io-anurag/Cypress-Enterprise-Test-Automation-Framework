/**
 * RetryHelper — Retries a synchronous boolean function until truthy or timeout.
 */
export interface RetryOptions {
  timeout?: number;
  interval?: number;
  errorMessage?: string;
}

export class RetryHelper {
  static retryUntil(fn: () => boolean, options: RetryOptions = {}): Cypress.Chainable<void> {
    const { timeout = 10_000, interval = 500, errorMessage = 'Retry timed out' } = options;
    const startTime = Date.now();

    function attempt(): Cypress.Chainable<void> {
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) throw new Error(`${errorMessage} (waited ${elapsed}ms)`);
      if (fn()) return cy.wrap(null as unknown as void);
      return cy.wait(interval).then(() => attempt());
    }

    return attempt();
  }

  static retryRequest(
    requestFn: () => Cypress.Chainable<Cypress.Response<unknown>>,
    maxRetries = 3,
    baseDelayMs = 1_000,
  ): Cypress.Chainable<Cypress.Response<unknown>> {
    let attempt = 0;
    function execute(): Cypress.Chainable<Cypress.Response<unknown>> {
      return requestFn().then((response) => {
        if (response.status >= 500 && attempt < maxRetries) {
          attempt++;
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          cy.log(`[RetryHelper] Retrying (attempt ${attempt}/${maxRetries}) after ${delay}ms`);
          return cy.wait(delay).then(() => execute());
        }
        return cy.wrap(response);
      });
    }
    return execute();
  }
}
