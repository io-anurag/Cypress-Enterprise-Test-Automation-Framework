import { EnvConfig } from './EnvConfig';
import { Logger } from './Logger';
import type { User, CreateUserPayload } from '../types';

const log = new Logger('DataSeeder');

/**
 * DataSeeder — utilities for setting up and tearing down test data
 * via the API before/after test suites. Keeps tests isolated and deterministic.
 *
 * Usage (in beforeEach/afterEach):
 *   const seeder = new DataSeeder();
 *   const user = seeder.createUser({ name: 'Test User', job: 'QA' });
 *   after(() => seeder.cleanup());
 */
export class DataSeeder {
  private readonly apiBaseUrl: string;
  private readonly createdResourceUrls: string[] = [];

  constructor() {
    this.apiBaseUrl = EnvConfig.getApiBaseUrl();
  }

  /**
   * Creates a user via the API and tracks it for cleanup.
   */
  createUser(payload: CreateUserPayload): Cypress.Chainable<{ id: string; name: string; job: string }> {
    log.info(`Seeding user: ${payload.name}`);

    return cy
      .request({
        method: 'POST',
        url: `${this.apiBaseUrl}/users`,
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        const createdUser = response.body as { id: string; name: string; job: string };
        const resourceUrl = `${this.apiBaseUrl}/users/${createdUser.id}`;
        this.createdResourceUrls.push(resourceUrl);
        log.info(`Seeded user with ID: ${createdUser.id}`);
        return createdUser;
      });
  }

  /**
   * Builds a User object for UI-based data seeding (without API calls).
   */
  buildUserData(overrides: Partial<User> = {}): User {
    return {
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      email: overrides.email ?? `test+${Date.now()}@example.com`,
      password: overrides.password ?? 'Test@1234!',
      role: overrides.role ?? 'viewer',
      ...overrides,
    };
  }

  /**
   * Deletes all resources created during the test session.
   * Call in afterEach() or after() hooks.
   */
  cleanup(): void {
    if (this.createdResourceUrls.length === 0) {
      log.debug('No seeded resources to clean up.');
      return;
    }

    log.info(`Cleaning up ${this.createdResourceUrls.length} seeded resource(s)...`);

    this.createdResourceUrls.forEach((url) => {
      cy.request({
        method: 'DELETE',
        url,
        failOnStatusCode: false,
      }).then((response) => {
        log.debug(`Deleted ${url} — status: ${response.status}`);
      });
    });

    this.createdResourceUrls.length = 0;
  }
}
