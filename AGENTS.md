# AGENTS.md — Cypress Enterprise Test Automation Framework

## Architecture Overview

Four-layer system where each layer has a strict role:

```
Tests (cypress/e2e/**/*.cy.ts)
  └── Page Objects (cypress/pages/) · API Clients (cypress/api/)
        └── Custom Commands (cypress/support/commands/)
              └── Cypress built-ins (cy.request / cy.get)
```

- **Never call `cy.get()` directly in tests** — use Page Object methods.
- **Never call `cy.request()` directly in tests** — use API Client methods or `cy.apiGet/apiPost`.
- UI tests live in `cypress/e2e/ui/`, API tests in `cypress/e2e/api/`.

## Key Files

| File | Purpose |
|------|---------|
| `cypress/types/index.ts` | **All** shared TypeScript interfaces — add new types here first |
| `cypress/utils/EnvConfig.ts` | Dual-context: `loadEnvConfig()` for Node.js (config time), `EnvConfig.*` for browser (test time) |
| `cypress/support/e2e.ts` | Global hooks — auto-screenshot on failure, logs env on every test |
| `cypress/support/commands.d.ts` | TypeScript declarations for every custom command |
| `config/env/*.env.json` | Per-environment JSON configs (`dev`, `qa`, `staging`, `prod`) |

## Developer Commands

```bash
npm run cy:open               # Interactive runner (local dev)
npm run cy:run:qa             # Headless against QA env
npm run cy:run:smoke          # Only @smoke-tagged tests
npm run cy:run:api            # Only cypress/e2e/api/** specs
npm run type-check            # tsc --noEmit (no build output)
npm run lint:fix              # Auto-fix ESLint issues
npm run report:merge          # Merge Mochawesome JSONs → HTML
npm run report:allure         # Serve Allure report locally
```

Environment is set via `CYPRESS_ENV` (defaults to `qa`). Credentials override via `CYPRESS_USERNAME` / `CYPRESS_PASSWORD` env vars, not in JSON files.

## Project-Specific Patterns

### Page Objects
Extend `BasePage`, store selectors in a `private readonly selectors` object, prefer `[data-testid="..."]`. Interaction methods return `this` (fluent); assertion methods return `Cypress.Chainable<JQuery<HTMLElement>>`.

```typescript
export class CheckoutPage extends BasePage {
  private readonly selectors = { btn: '[data-testid="place-order"]' } as const;
  constructor() { super('CheckoutPage'); }
  placeOrder(): this { this.smartClick(this.selectors.btn); return this; }
}
```

### API Clients
Extend `ApiClient` (not raw `cy.request`). Log each action with `this.log.step(...)`. Pass `{ failOnStatusCode: false }` only for intentional error-path tests.

### Test Data Strategy
- **Static / reference data** → `cypress/fixtures/*.json` loaded with `cy.fixture()`
- **Unique per-run data** → `UserFactory.build()` / `UserFactory.buildMany(5)` (uses `@faker-js/faker`)
- **Backend pre-conditions** → `DataSeeder` utility (API-based setup/teardown)

### Auth
Always use `cy.loginWithSession()` (session caching via `cy.session`). Use `cy.login()` only when explicitly testing the login flow itself.

### Tagging
Apply tags at both `describe` and `it` level:
```typescript
describe('Feature', { tags: ['@smoke', '@ui'] }, () => {
  it('case', { tags: '@smoke' }, () => { ... });
});
```
Run with `--env tags=smoke` or via `npm run cy:run:smoke`.

## Adding New Components

1. **New page** → create `cypress/pages/MyPage.ts` extending `BasePage`
2. **New API domain** → create `cypress/api/MyApiClient.ts` extending `ApiClient`; add interfaces to `cypress/types/index.ts`
3. **New custom command** → implement in `cypress/support/commands/`, register import in `cypress/support/e2e.ts`, declare in `cypress/support/commands.d.ts`
4. **New environment** → add `config/env/<name>.env.json` matching `EnvConfiguration` interface; add npm script in `package.json`

## CI/CD

Three pipelines exist: `.github/workflows/cypress-ci.yml` (GitHub Actions), `.gitlab-ci.yml` (GitLab), `Jenkinsfile` (Jenkins). Pre-commit hook (Husky + lint-staged) runs ESLint + Prettier on staged `.ts` files automatically.

