import { EnvConfig } from '../utils/EnvConfig';
import { Logger } from '../utils/Logger';
import type { ApiRequestOptions } from '../types';


/**
 * ApiClient — Base class for all API clients in the framework.
 * Wraps cy.request with a consistent interface: auth injection,
 * base URL resolution, logging, and configurable error handling.
 *
 * Extend this class for each API domain (UsersApiClient, OrdersApiClient, etc.)
 */
export abstract class ApiClient {
  protected readonly baseUrl: string;
  protected readonly log: Logger;
  private authToken?: string;

  constructor(clientName: string) {
    this.baseUrl = EnvConfig.getApiBaseUrl();
    this.log = new Logger(clientName);
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  // ─── Request Builders ─────────────────────────────────────────────────────────

  protected get<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Cypress.Chainable<Cypress.Response<T>> {
    this.log.info(`GET ${this.baseUrl}${path}`);
    return cy.request<T>({
      method: 'GET',
      url: `${this.baseUrl}${path}`,
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 15_000,
      failOnStatusCode: options.failOnStatusCode ?? true,
    });
  }

  protected post<T>(
    path: string,
    body: unknown,
    options: ApiRequestOptions = {},
  ): Cypress.Chainable<Cypress.Response<T>> {
    this.log.info(`POST ${this.baseUrl}${path}`);
    return cy.request<T>({
      method: 'POST',
      url: `${this.baseUrl}${path}`,
      body: body as Cypress.RequestBody,
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 15_000,
      failOnStatusCode: options.failOnStatusCode ?? true,
    });
  }

  protected put<T>(
    path: string,
    body: unknown,
    options: ApiRequestOptions = {},
  ): Cypress.Chainable<Cypress.Response<T>> {
    this.log.info(`PUT ${this.baseUrl}${path}`);
    return cy.request<T>({
      method: 'PUT',
      url: `${this.baseUrl}${path}`,
      body: body as Cypress.RequestBody,
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 15_000,
      failOnStatusCode: options.failOnStatusCode ?? true,
    });
  }

  protected patch<T>(
    path: string,
    body: unknown,
    options: ApiRequestOptions = {},
  ): Cypress.Chainable<Cypress.Response<T>> {
    this.log.info(`PATCH ${this.baseUrl}${path}`);
    return cy.request<T>({
      method: 'PATCH',
      url: `${this.baseUrl}${path}`,
      body: body as Cypress.RequestBody,
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 15_000,
      failOnStatusCode: options.failOnStatusCode ?? true,
    });
  }

  protected delete<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Cypress.Chainable<Cypress.Response<T>> {
    this.log.info(`DELETE ${this.baseUrl}${path}`);
    return cy.request<T>({
      method: 'DELETE',
      url: `${this.baseUrl}${path}`,
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 15_000,
      failOnStatusCode: options.failOnStatusCode ?? true,
    });
  }

  // ─── Assertions ──────────────────────────────────────────────────────────────

  /**
   * Assert a response has expected status code.
   */
  protected assertStatus<T>(
    response: Cypress.Response<T>,
    expectedStatus: number,
  ): Cypress.Response<T> {
    expect(response.status, `Expected HTTP ${expectedStatus}`).to.equal(expectedStatus);
    return response;
  }

  /**
   * Assert that a response body contains a property with a given value.
   */
  protected assertBodyProperty<T extends Record<string, unknown>>(
    response: Cypress.Response<T>,
    property: keyof T,
    expectedValue: unknown,
  ): Cypress.Response<T> {
    expect(response.body[property], `Property "${String(property)}"`).to.deep.equal(expectedValue);
    return response;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    };

    const apiKey = EnvConfig.getApiKey();
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }
}
