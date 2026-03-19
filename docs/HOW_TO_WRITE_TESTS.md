# How to Write Tests

> A step-by-step guide for QA engineers joining the framework. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the big picture.

---

## Table of Contents

1. [Writing a UI Test](#1-writing-a-ui-test)
2. [Writing an API Test](#2-writing-an-api-test)
3. [Creating a New Page Object](#3-creating-a-new-page-object)
4. [Creating a New API Client](#4-creating-a-new-api-client)
5. [Using Test Data](#5-using-test-data)
6. [Tagging Tests](#6-tagging-tests)
7. [Custom Commands Reference](#7-custom-commands-reference)
8. [Best Practices](#8-best-practices)
9. [Common Mistakes to Avoid](#9-common-mistakes-to-avoid)

---

## 1. Writing a UI Test

UI tests live in `cypress/e2e/ui/`. File names must end with `.cy.ts`.

```typescript
// cypress/e2e/ui/my-feature.cy.ts
import { MyFeaturePage } from '../../pages/MyFeaturePage';

describe('My Feature | UI Tests', { tags: ['@smoke', '@ui'] }, () => {
  const featurePage = new MyFeaturePage();

  beforeEach(() => {
    // Use session-based login to avoid UI login on every test
    cy.loginWithSession();
    featurePage.visit();
    featurePage.isLoaded();
  });

  it('should do something useful', { tags: '@smoke' }, () => {
    featurePage.clickSomeButton();
    featurePage.assertSomeText('Expected result');
  });
});
```

**Rules:**

- Always call `page.isLoaded()` in `beforeEach` after navigation.
- Prefer `cy.loginWithSession()` over `cy.login()` to avoid repeated UI logins.
- One `describe` per feature area. One `it` per test case.

---

## 2. Writing an API Test

API tests live in `cypress/e2e/api/`. They use domain-specific API client classes.

```typescript
// cypress/e2e/api/orders.cy.ts
import { OrdersApiClient } from '../../api/OrdersApiClient';
import { UserFactory } from '../../factories/UserFactory';

describe('Orders API | CRUD', { tags: ['@smoke', '@api'] }, () => {
  const ordersApi = new OrdersApiClient();

  it('should create an order and return 201', { tags: '@smoke' }, () => {
    const payload = { product: 'Laptop', qty: 1 };

    ordersApi.createOrder(payload).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
    });
  });
});
```

**Rules:**

- API tests should not visit pages — no `cy.visit()`.
- Always type the response body with an interface from `cypress/types/index.ts`.
- Use `failOnStatusCode: false` when testing error scenarios (4xx, 5xx).

---

## 3. Creating a New Page Object

```typescript
// cypress/pages/CheckoutPage.ts
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  private readonly selectors = {
    placeOrderButton: '[data-testid="place-order"]',
    orderSummary: '[data-testid="order-summary"]',
    totalAmount: '[data-testid="total"]',
  } as const;

  constructor() {
    super('CheckoutPage'); // Name used in logs
  }

  visit(): Cypress.Chainable<Cypress.AUTWindow> {
    return cy.visit('/checkout');
  }

  isLoaded(): Cypress.Chainable<void> {
    return this.waitForVisible(this.selectors.orderSummary).then(() => {
      this.log.info('Checkout page loaded');
    });
  }

  placeOrder(): this {
    this.log.step('Placing order');
    this.smartClick(this.selectors.placeOrderButton);
    return this;
  }

  assertTotal(expectedTotal: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.assertText(this.selectors.totalAmount, expectedTotal);
  }
}
```

**Key rules for page objects:**

- Extend `BasePage` — never call `cy.get()` directly in tests.
- Selectors go in a `private readonly selectors` object at the top.
- Prefer `[data-testid="..."]` selectors over CSS classes or text.
- Interactions return `this` for fluent chaining.
- Assertions return `Cypress.Chainable<JQuery<HTMLElement>>`.

---

## 4. Creating a New API Client

```typescript
// cypress/api/OrdersApiClient.ts
import { ApiClient } from './ApiClient';
import type { Order, CreateOrderPayload, ApiRequestOptions } from '../types';

export class OrdersApiClient extends ApiClient {
  private readonly endpoint = '/orders';

  constructor() {
    super('OrdersApiClient');
  }

  createOrder(payload: CreateOrderPayload, options?: ApiRequestOptions) {
    this.log.step(`Creating order for: ${payload.product}`);
    return this.post<Order>(this.endpoint, payload, options);
  }

  getOrder(id: number, options?: ApiRequestOptions) {
    return this.get<Order>(`${this.endpoint}/${id}`, options);
  }

  deleteOrder(id: number, options?: ApiRequestOptions) {
    return this.delete<void>(`${this.endpoint}/${id}`, options);
  }
}
```

**Key rules for API clients:**

- Extend `ApiClient` — never call `cy.request()` directly in tests.
- Add domain interfaces to `cypress/types/index.ts` first.
- Log each action with `this.log.step(...)` for traceability.

---

## 5. Using Test Data

### Static Data (fixtures)

Use fixtures for **stable, reference data** (e.g., login credentials, enum values):

```typescript
// Inside a test
cy.fixture('users').then((users) => {
  const admin = users.validUser;
  cy.login(admin.username, admin.password);
});
```

### Dynamic Data (factories)

Use factories for **data that must be unique per run** (e.g., new user creation):

```typescript
import { UserFactory } from '../../factories/UserFactory';

const newUser = UserFactory.build();               // Random user
const admin   = UserFactory.buildAdmin();          // Admin role
const users   = UserFactory.buildMany(5);          // 5 random users
const payload = UserFactory.buildApiPayload();     // { name, job } for reqres.in
```

### Seeding via API (DataSeeder)

For data that must exist in the backend before tests:

```typescript
import { DataSeeder } from '../../utils/DataSeeder';

describe('My Suite', () => {
  const seeder = new DataSeeder();

  before(() => {
    seeder.createUser({ name: 'Test User', job: 'QA Engineer' });
  });

  after(() => {
    seeder.cleanup(); // Deletes all resources created by seeder
  });
});
```

---

## 6. Tagging Tests

Tags filter which tests run in CI. Apply tags at both `describe` and `it` level:

```typescript
describe('Suite', { tags: ['@smoke', '@regression'] }, () => {
  it('fast check', { tags: '@smoke' }, () => { ... });
  it('detailed check', { tags: '@regression' }, () => { ... });
});
```

**Run by tag:**

```bash
npm run cy:run:smoke       # Only @smoke tests
npm run cy:run:regression  # Only @regression tests

# Or directly:
npx cypress run --env tags=api
```

---

## 7. Custom Commands Reference

| Command | Description |
|---------|-------------|
| `cy.login(user, pass)` | Full UI login flow |
| `cy.loginByApi(user, pass)` | API login, injects token |
| `cy.loginWithSession(user?, pass?)` | Cached session login (fast) |
| `cy.logout()` | Click logout, assert redirect |
| `cy.smartClick(selector)` | Scroll + wait + click |
| `cy.smartType(selector, text)` | Clear + type |
| `cy.waitForElement(selector, timeout?)` | Wait for element to appear |
| `cy.assertVisible(selector)` | Assert element is visible |
| `cy.assertHidden(selector)` | Assert element is hidden |
| `cy.assertText(selector, text)` | Assert text content |
| `cy.waitForUrl(fragment, timeout?)` | Wait for URL to match |
| `cy.clearState()` | Clear cookies + localStorage + sessionStorage |
| `cy.interceptAndAlias(method, url, alias)` | Setup cy.intercept with alias |
| `cy.apiGet<T>(path, options?)` | Typed GET request |
| `cy.apiPost<T>(path, body, options?)` | Typed POST request |
| `cy.apiPut<T>(path, body, options?)` | Typed PUT request |
| `cy.apiPatch<T>(path, body, options?)` | Typed PATCH request |
| `cy.apiDelete<T>(path, options?)` | Typed DELETE request |

---

## 8. Best Practices

✅ **Do:**

- Keep each `it()` block focused on one behavior (single responsibility).
- Use `beforeEach` for setup, `afterEach` / `after` for cleanup.
- Prefer `cy.intercept()` to wait for API responses instead of `cy.wait(ms)`.
- Add `[data-testid]` attributes in the app for resilient selectors.
- Run `npm run lint && npm run type-check` before pushing.
- Give every test a clear, descriptive, sentence-style name.
- Log key steps with `log.step('...')` for debugging visibility.

---

## 9. Common Mistakes to Avoid

❌ **Don't:**

- Use `cy.wait(3000)` — use smart waits or `cy.intercept()` instead.
- Put selectors directly in test files — always go through a Page Object.
- Skip tags — testers depend on tag filtering for focused CI runs.
- Ignore test isolation — each test must be able to run independently.
- Use `any` types — TypeScript strict mode is enforced via ESLint.
- Commit `.env` files — only commit `.env.example`.
- Hardcode URLs in tests — use `EnvConfig.getBaseUrl()` or `cy.visit('/path')`.
