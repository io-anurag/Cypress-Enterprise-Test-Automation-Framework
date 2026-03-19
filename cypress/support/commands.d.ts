/// <reference types="cypress" />

/**
 * TypeScript declarations for all custom Cypress commands.
 * This file is the single source of truth for command signatures.
 * Import this via cypress/support/e2e.ts (auto-included by Cypress).
 */
declare namespace Cypress {
  interface Chainable {
    /**
     * Full UI login — fills form + submits, waits for /secure URL.
     * @example cy.login('tomsmith', 'SuperSecretPassword!')
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * Login via API — injects auth token into Cypress.env('authToken').
     * Use when you want to set up auth state without UI interaction.
     * @example cy.loginByApi('eve.holt@reqres.in', 'cityslicka')
     */
    loginByApi(username: string, password: string): Chainable<void>;

    /**
     * Login using Cypress Sessions — caches auth state across tests.
     * Significantly reduces test suite execution time.
     * @example cy.loginWithSession()
     * @example cy.loginWithSession('admin@example.com', 'password')
     */
    loginWithSession(username?: string, password?: string): Chainable<void>;

    /**
     * Click the logout link and verify redirect to /login.
     */
    logout(): Chainable<void>;

    /**
     * Scroll-into-view + wait for visible + wait for enabled + click.
     * Replaces raw cy.get(selector).click() with retryable smart click.
     * @example cy.smartClick('#submit-button')
     */
    smartClick(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Scroll-into-view + clear + type. Avoids stale input issues.
     * @example cy.smartType('#email', 'user@example.com')
     */
    smartType(selector: string, text: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Wait for element to become visible with configurable timeout.
     * @example cy.waitForElement('[data-testid="modal"]', 15000)
     */
    waitForElement(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;

    /**
     * Assert element is visible.
     * @example cy.assertVisible('.success-banner')
     */
    assertVisible(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Assert element is not visible.
     * @example cy.assertHidden('.loading-spinner')
     */
    assertHidden(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Assert element contains expected text.
     * @example cy.assertText('h1', 'Welcome')
     */
    assertText(selector: string, text: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Wait for URL to contain a specific fragment.
     * @example cy.waitForUrl('/dashboard')
     */
    waitForUrl(urlFragment: string, timeout?: number): Chainable<string>;

    /**
     * Scroll element into viewport.
     * @example cy.scrollToElement('.footer')
     */
    scrollToElement(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Clear all browser state (cookies, localStorage, sessionStorage).
     * @example cy.clearState()
     */
    clearState(): Chainable<void>;

    /**
     * Intercept a network request and assign an alias in one command.
     * @example cy.interceptAndAlias('GET', '/api/users', 'getUsers')
     * @example cy.wait('@getUsers')
     */
    interceptAndAlias(method: string, urlPattern: string, alias: string): Chainable<void>;

    /**
     * Typed GET request with auto-injected base URL and auth token.
     * @example cy.apiGet<User[]>('/users').its('body').should('have.length.gt', 0)
     */
    apiGet<T = unknown>(path: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;

    /**
     * Typed POST request with auto-injected base URL and auth token.
     * @example cy.apiPost<CreateUserResponse>('/users', { name: 'Test', job: 'QA' })
     */
    apiPost<T = unknown>(
      path: string,
      body: unknown,
      options?: Partial<RequestOptions>,
    ): Chainable<Response<T>>;

    /**
     * Typed PUT request with auto-injected base URL and auth token.
     */
    apiPut<T = unknown>(
      path: string,
      body: unknown,
      options?: Partial<RequestOptions>,
    ): Chainable<Response<T>>;

    /**
     * Typed PATCH request with auto-injected base URL and auth token.
     */
    apiPatch<T = unknown>(
      path: string,
      body: unknown,
      options?: Partial<RequestOptions>,
    ): Chainable<Response<T>>;

    /**
     * Typed DELETE request with auto-injected base URL and auth token.
     */
    apiDelete<T = unknown>(path: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;
  }
}
