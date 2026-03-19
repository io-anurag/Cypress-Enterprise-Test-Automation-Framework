import { faker } from '@faker-js/faker';
import type { User, UserRole, CreateUserPayload } from '../types';

/**
 * UserFactory — generates realistic test data using @faker-js/faker.
 * Always use the factory for dynamic data; use fixtures for static reference data.
 *
 * Usage:
 *   const user = UserFactory.build();
 *   const admin = UserFactory.buildAdmin();
 *   const users = UserFactory.buildMany(5);
 *   const payload = UserFactory.buildApiPayload();
 */
export class UserFactory {
  /**
   * Build a single User object with random data.
   * @param overrides — Partial<User> to override specific fields.
   */
  static build(overrides: Partial<User> = {}): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: false }) + '!A1',
      role: 'viewer',
      avatar: faker.image.avatar(),
      ...overrides,
    };
  }

  /**
   * Build a user with admin role.
   */
  static buildAdmin(overrides: Partial<User> = {}): User {
    return UserFactory.build({ role: 'admin', ...overrides });
  }

  /**
   * Build a user with editor role.
   */
  static buildEditor(overrides: Partial<User> = {}): User {
    return UserFactory.build({ role: 'editor', ...overrides });
  }

  /**
   * Build a user with buyer role.
   */
  static buildBuyer(overrides: Partial<User> = {}): User {
    return UserFactory.build({ role: 'buyer', ...overrides });
  }

  /**
   * Build multiple users at once.
   * @param count - Number of users to generate.
   * @param role  - Optional role override for all users.
   */
  static buildMany(count: number, role?: UserRole): User[] {
    return Array.from({ length: count }, () =>
      UserFactory.build(role ? { role } : {}),
    );
  }

  /**
   * Build a payload specifically for the reqres.in POST /users API.
   * Returns { name, job } format as expected by that API.
   */
  static buildApiPayload(overrides: Partial<CreateUserPayload> = {}): CreateUserPayload {
    return {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      job: faker.person.jobTitle(),
      ...overrides,
    };
  }

  /**
   * Build a user with a specific, deterministic email for stable test cases.
   * Useful for tests that need predictable data (e.g., fixture-style usage).
   */
  static buildWithEmail(email: string, overrides: Partial<User> = {}): User {
    const [localPart] = email.split('@');
    const parts = (localPart ?? 'test.user').split('.');

    return UserFactory.build({
      firstName: parts[0] ?? 'Test',
      lastName: parts[1] ?? 'User',
      email,
      ...overrides,
    });
  }
}
