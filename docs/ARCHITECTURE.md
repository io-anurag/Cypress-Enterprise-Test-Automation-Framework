# Framework Architecture

> Comprehensive guide to the design decisions and folder structure of the Cypress TypeScript Enterprise Framework.

---

## Folder Map

```
d:\Cypress_Workspace\
│
├── cypress/                          # All test code lives here
│   ├── e2e/                          # Test specifications
│   │   ├── ui/                       # Browser-driven UI tests
│   │   │   └── login.cy.ts
│   │   └── api/                      # API tests via cy.request
│   │       └── users.cy.ts
│   │
│   ├── pages/                        # Page Object Model (POM) layer
│   │   ├── BasePage.ts               # Abstract base — smart interactions
│   │   ├── LoginPage.ts              # Login page POM
│   │   └── DashboardPage.ts          # Dashboard / secure area POM
│   │
│   ├── api/                          # API client layer
│   │   ├── ApiClient.ts              # Abstract base (get/post/put/patch/delete)
│   │   └── UsersApiClient.ts         # /users endpoint domain client
│   │
│   ├── support/                      # Cypress support/config files
│   │   ├── e2e.ts                    # Global hooks + command imports
│   │   ├── commands.d.ts             # TypeScript declarations for commands
│   │   └── commands/
│   │       ├── auth.commands.ts      # cy.login / cy.loginWithSession
│   │       ├── ui.commands.ts        # cy.smartClick / cy.waitForElement
│   │       └── api.commands.ts       # cy.apiGet / cy.apiPost etc.
│   │
│   ├── factories/                    # Dynamic test data generation
│   │   └── UserFactory.ts            # Faker-powered user builder
│   │
│   ├── fixtures/                     # Static test data (JSON)
│   │   ├── users.json                # User roles and credentials
│   │   └── products.json             # Product catalog data
│   │
│   ├── utils/                        # Framework utilities
│   │   ├── EnvConfig.ts              # Typed env variable accessor
│   │   ├── Logger.ts                 # Structured logger (DEBUG/INFO/WARN/ERROR)
│   │   ├── RetryHelper.ts            # Retry-until + API retry with backoff
│   │   └── DataSeeder.ts            # API-based data setup and teardown
│   │
│   └── types/
│       └── index.ts                  # All shared TypeScript interfaces
│
├── config/
│   ├── env/                          # Per-environment configuration
│   │   ├── dev.env.json
│   │   ├── qa.env.json
│   │   ├── staging.env.json
│   │   └── prod.env.json
│   └── allure.config.js              # Allure categories + environment panel
│
├── .github/
│   └── workflows/
│       └── cypress-ci.yml            # GitHub Actions pipeline
│
├── .gitlab-ci.yml                    # GitLab CI pipeline
├── Jenkinsfile                       # Jenkins declarative pipeline
│
├── cypress.config.ts                 # Main Cypress configuration
├── tsconfig.json                     # TypeScript strict config + path aliases
├── .eslintrc.json                    # ESLint rules
├── .prettierrc                       # Prettier formatting rules
├── .husky/pre-commit                 # Pre-commit hook (lint + type-check)
├── .env.example                      # Secrets template
├── package.json                      # Dependencies + scripts
│
├── docs/
│   ├── ARCHITECTURE.md               # This file
│   └── HOW_TO_WRITE_TESTS.md         # Onboarding guide
│
├── README.md                         # Setup and usage guide
```

---

## Architectural Layers

```
┌─────────────────────────────────────────┐
│                  TESTS                  │  cypress/e2e/**/*.cy.ts
│     (test cases, describe/it blocks)    │
└───────────────────┬─────────────────────┘
                    │ uses
        ┌───────────┴──────────┐
        ▼                      ▼
┌───────────────┐    ┌─────────────────────┐
│  PAGE OBJECTS │    │    API CLIENTS       │
│  (POM layer)  │    │  (cy.request layer)  │
└───────┬───────┘    └──────────┬──────────┘
        │                       │
        └──────────┬────────────┘
                   │ both built on
        ┌──────────▼────────────┐
        │   CUSTOM COMMANDS     │  cypress/support/commands/
        │ + SUPPORT UTILITIES   │  cypress/utils/
        └──────────┬────────────┘
                   │
        ┌──────────▼────────────┐
        │   CYPRESS CONFIG      │  cypress.config.ts
        │   ENV CONFIG          │  config/env/*.json
        └───────────────────────┘
```

---

## Design Decisions

### Why Page Object Model (POM)?

POM was chosen over App Actions or Screenplay because:

- **Familiarity**: Nearly all QA engineers know POM — minimal onboarding friction.
- **Encapsulation**: Selectors and interactions live in one place, not scattered in tests.
- **Fluent API**: Pages return `this`, enabling readable chaining: `loginPage.fillUsername().fillPassword().clickLogin()`.
- **Screenplay** adds value for very large teams but introduces concepts (Actors, Tasks) that increase ramp-up time.

### Why Abstract Base Classes?

Both `BasePage` and `ApiClient` are abstract classes:

- **DRY**: Common patterns (smart click, auth injection, logging) defined once.
- **SOLID/Liskov**: Subclasses can extend without modifying the base.
- **TypeScript enforcement**: `abstract` forces subclasses to implement `visit()` and `isLoaded()`.

### Why Dual Reporting (Mochawesome + Allure)?

| Reporter | Best For |
|----------|----------|
| **Mochawesome** | Quick run-by-run HTML snapshots, embedded screenshots, CI artifact links |
| **Allure** | Historical trends, failure categorization, retries timeline, suite analytics |

Both serve different stakeholder needs — devs use Mochawesome, managers use Allure.

### Why Faker (not hardcoded data)?

- Hardcoded data causes **test coupling** — one test's data can conflict with another's.
- Faker generates **unique, realistic data** per test run, eliminating implicit dependencies.
- Use **fixtures** for stable reference data (e.g., login credentials for the-internet.herokuapp.com).
- Use **factories** for data that should be unique per test run (e.g., creating a new user via API).

### Why Cypress Sessions for Auth?

`cy.session()` caches the browser state (cookies, localStorage) after the first login:

- **Before sessions**: Every test re-runs the login UI = slow and brittle.
- **After sessions**: First test logs in; subsequent tests reuse cached state = 70–90% faster suites.

---

## Environment Configuration Flow

```
CYPRESS_ENV=qa (env var)
        │
        ▼
cypress.config.ts: loadEnvConfig('qa')
        │
        ▼
config/env/qa.env.json (base config)
        │
CYPRESS_USERNAME / CYPRESS_PASSWORD (override if set in CI)
        │
        ▼
Cypress.env() values (available in all tests + commands)
```

---

## Path Aliases

TypeScript path aliases are defined in `tsconfig.json` and resolve at compile time:

| Alias | Resolves to |
|-------|------------|
| `@pages/*` | `cypress/pages/*` |
| `@api/*` | `cypress/api/*` |
| `@utils/*` | `cypress/utils/*` |
| `@factories/*` | `cypress/factories/*` |
| `@fixtures/*` | `cypress/fixtures/*` |

---

## Scaling Guidelines

| Growth Stage | Recommendation |
|-------------|----------------|
| New page | Add `XxxPage.ts` extending `BasePage` |
| New API domain | Add `XxxApiClient.ts` extending `ApiClient` |
| New test data type | Add `XxxFactory.ts` to `factories/` |
| New environment | Add `xxx.env.json` to `config/env/` |
| New tag category | Add to test metadata + update CI filter scripts |
| Org-wide shared commands | Extract to a shared npm package |
| 1000+ tests | Enable Cypress Cloud sharding (replace matrix with Cloud parallelization) |
