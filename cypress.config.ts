import { defineConfig } from 'cypress';
import { loadEnvConfig } from './cypress/utils/EnvConfig';
import * as path from 'path';

// Load environment-specific configuration
const env = process.env['CYPRESS_ENV'] ?? 'qa';
const envConfig = loadEnvConfig(env);

export default defineConfig({
  // ─── E2E Configuration ───────────────────────────────────────────────────────
  e2e: {
    baseUrl: envConfig.baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',

    // ─── Retries ─────────────────────────────────────────────────────────────
    retries: {
      runMode: 2, // Retry twice in CI
      openMode: 0, // No retries when developing locally
    },

    // ─── Timeouts ────────────────────────────────────────────────────────────
    defaultCommandTimeout: 10_000,
    requestTimeout: 15_000,
    responseTimeout: 15_000,
    pageLoadTimeout: 30_000,
    execTimeout: 60_000,
    taskTimeout: 60_000,

    // ─── Viewport ────────────────────────────────────────────────────────────
    viewportWidth: 1440,
    viewportHeight: 900,

    // ─── Video & Screenshots ─────────────────────────────────────────────────
    video: true,
    videosFolder: 'cypress/reports/videos',
    videoCompression: 32,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/reports/screenshots',
    trashAssetsBeforeRuns: true,

    // ─── Environment Variables ────────────────────────────────────────────────
    env: {
      ...envConfig,
      ENVIRONMENT: env,
      // Expose full API base URL to tests
      API_BASE_URL: envConfig.apiBaseUrl,
      apiKey: envConfig.apiKey ?? '',
      TAGS: process.env['CYPRESS_TAGS'] ?? '',
    },

    // ─── Plugin Setup ─────────────────────────────────────────────────────────
    setupNodeEvents(on, config) {
      // Mochawesome reporter
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('cypress-mochawesome-reporter/plugin')(on);

      // Allure reporter
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@shelex/cypress-allure-plugin/writer')(on, config);

      // Task: custom Node-side logging
      on('task', {
        log(message: string) {
          console.info(`[CYPRESS TASK] ${message}`);
          return null;
        },
        table(data: Record<string, unknown>[]) {
          console.table(data);
          return null;
        },
      });

      // Task: read environment config from Node side
      on('task', {
        getEnvConfig() {
          return envConfig;
        },
      });

      return config;
    },
  },

  // ─── Reporter Configuration ───────────────────────────────────────────────
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Cypress Enterprise Framework – Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: 'cypress/reports/mochawesome',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss',
  },

  // ─── Resolved Path Config ────────────────────────────────────────────────
  chromeWebSecurity: false,
  watchForFileChanges: false,
  numTestsKeptInMemory: 10,
});
