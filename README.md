# Cypress Enterprise Test Automation Framework

[![Cypress](https://img.shields.io/badge/Cypress-15.x-04C38E?logo=cypress)](https://cypress.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![ESLint](https://img.shields.io/badge/ESLint-Configured-4B32C3?logo=eslint)](https://eslint.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cypress Enterprise Framework — CI](https://github.com/io-anurag/Cypress-Enterprise-Test-Automation-Framework/actions/workflows/cypress-ci.yml/badge.svg)](https://github.com/io-anurag/Cypress-Enterprise-Test-Automation-Framework/actions/workflows/cypress-ci.yml)

A **production-ready, enterprise-grade** end-to-end test automation framework built with Cypress 15 and TypeScript. Supports UI tests, API tests, multi-environment execution, dual reporting, and CI/CD pipeline integration.

> See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full project design guide.
> See [HOW_TO_WRITE_TESTS.md](./docs/HOW_TO_WRITE_TESTS.md) to onboard and write your first test.

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Chrome | Latest |

### 1. Clone and Install

```bash
git clone <your-repo-url> cypress-framework
cd cypress-framework
npm install
```

### 2. Configure Environment

```bash
# Copy the secrets template
cp .env.example .env

# Edit .env with your environment values
CYPRESS_ENV=qa
CYPRESS_USERNAME=tomsmith
CYPRESS_PASSWORD=SuperSecretPassword!
```

### 3. Run Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cy:open

# Run all tests headlessly
npm run cy:run:headless

# Run only smoke tests
npm run cy:run:smoke

# Run only regression tests
npm run cy:run:regression

# Run against a specific environment
npm run cy:run:qa
npm run cy:run:staging
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `cy:open` | Launch interactive Cypress runner |
| `cy:run` | Run all tests |
| `cy:run:headless` | Run headlessly in Chrome |
| `cy:run:smoke` | Run `@smoke` tagged tests only |
| `cy:run:regression` | Run `@regression` tagged tests only |
| `cy:run:api` | Run all API tests |
| `cy:run:ui` | Run all UI tests |
| `cy:run:dev` | Run against `dev` environment |
| `cy:run:qa` | Run against `qa` environment |
| `cy:run:staging` | Run against `staging` environment |
| `report:merge` | Merge Mochawesome JSON + generate HTML |
| `report:allure` | Serve Allure report locally |
| `report:allure:generate` | Generate static Allure HTML report |
| `lint` | Run ESLint on all TypeScript files |
| `lint:fix` | Auto-fix ESLint issues |
| `format` | Format all files with Prettier |
| `type-check` | TypeScript type check (no emit) |

---

## Multi-Environment Setup

Switch environments using the `CYPRESS_ENV` variable:

```bash
# Via npm scripts
npm run cy:run:qa
npm run cy:run:staging

# Via environment variable directly
CYPRESS_ENV=prod npx cypress run --headless
```

Environment config files are located in `config/env/`:

- `dev.env.json`
- `qa.env.json`
- `staging.env.json`
- `prod.env.json`

> ⚠️ **Never commit real credentials** — use `CYPRESS_USERNAME` and `CYPRESS_PASSWORD` environment variables for CI/CD, or inject via your secrets manager.

---

## 🏷️ Test Tagging

Tests are tagged using the `tags` property in test metadata and filtered by `--env tags=<tag>`:

```typescript
it('should login', { tags: '@smoke' }, () => { ... });
```

| Tag | Purpose |
|-----|---------|
| `@smoke` | Fast critical path tests — run on every build |
| `@regression` | Full regression suite — run nightly or on release |
| `@api` | API-only tests — no browser needed |
| `@ui` | UI/browser tests |
| `@critical` | Business-critical tests — never skip |

---

## 📊 Reporting

### Mochawesome (HTML)

Generated automatically after each run.

```bash
npm run report:merge
# Opens: cypress/reports/mochawesome/html/<timestamp>.html
```

### Allure (Trends + Categories)

```bash
npm run report:allure:generate   # Generate static report
npm run report:allure            # Serve report on localhost
```

> Allure provides **trend graphs**, **failure categorization**, and **test history** across runs.

---

## 🔧 Code Quality

Pre-commit hooks run automatically (via Husky + lint-staged):

```bash
# Set up Husky (runs automatically on npm install)
npm run prepare

# Run manually
npm run lint
npm run type-check
npm run format:check
```

---

## 🧩 Project Structure

```
cypress/
├── e2e/
│   ├── ui/         # UI end-to-end tests
│   └── api/        # API tests (via cy.request)
├── pages/          # Page Object Model classes
├── api/            # API client classes
├── factories/      # Dynamic test data (Faker-based)
├── fixtures/       # Static test data (JSON)
├── support/        # Commands + global hooks
├── utils/          # Logger, EnvConfig, RetryHelper, DataSeeder
└── types/          # Shared TypeScript interfaces
config/
├── env/            # Per-environment JSON configs
└── allure.config.js
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/my-new-test`
2. Write tests following [HOW_TO_WRITE_TESTS.md](./docs/HOW_TO_WRITE_TESTS.md)
3. Run lint + type-check: `npm run lint && npm run type-check`
4. Open a pull request — CI will run automatically

---

## 📎 Stack

| Layer | Tool |
|-------|------|
| Test Runner | Cypress 15 |
| Language | TypeScript 5 (strict) |
| Test Data | @faker-js/faker 8 |
| Reporting | Mochawesome + Allure |
| Linting | ESLint + @typescript-eslint |
| Formatting | Prettier |
| Pre-commit | Husky + lint-staged |
| CI/CD | GitHub Actions, GitLab CI, Jenkins |
