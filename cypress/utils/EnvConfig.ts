import * as fs from 'fs';
import * as path from 'path';
import type { EnvConfiguration } from '../types';

const VALID_ENVIRONMENTS = ['dev', 'qa', 'staging', 'prod'] as const;
type ValidEnvironment = (typeof VALID_ENVIRONMENTS)[number];

/**
 * Loads and validates environment-specific configuration from JSON files.
 * Called at Node.js time (in cypress.config.ts) before any browser code runs.
 *
 * @param env - Environment name: dev | qa | staging | prod
 * @returns Validated EnvConfiguration object
 */
export function loadEnvConfig(env: string): EnvConfiguration {
  if (!VALID_ENVIRONMENTS.includes(env as ValidEnvironment)) {
    throw new Error(
      `Invalid environment "${env}". Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`,
    );
  }

  const configPath = path.resolve(process.cwd(), `config/env/${env}.env.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Environment config file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as EnvConfiguration;

  if (process.env['CYPRESS_USERNAME']) {
    config.credentials.username = process.env['CYPRESS_USERNAME'];
  }
  if (process.env['CYPRESS_PASSWORD']) {
    config.credentials.password = process.env['CYPRESS_PASSWORD'];
  }

  return config;
}

/**
 * Browser-side typed accessor for Cypress.env() values.
 * Use inside Cypress tests/commands (not in Node.js setup).
 */
export const EnvConfig = {
  getBaseUrl(): string {
    return Cypress.config('baseUrl') as string;
  },

  getApiBaseUrl(): string {
    return Cypress.env('API_BASE_URL') as string;
  },

  getEnvironment(): string {
    return Cypress.env('ENVIRONMENT') as string;
  },

  getCredentials(): { username: string; password: string } {
    const creds = Cypress.env('credentials') as { username: string; password: string };
    return {
      username: (Cypress.env('CYPRESS_USERNAME') as string | undefined) ?? creds.username,
      password: (Cypress.env('CYPRESS_PASSWORD') as string | undefined) ?? creds.password,
    };
  },

  isFeatureEnabled(flag: string): boolean {
    const flags = Cypress.env('featureFlags') as Record<string, boolean> | undefined;
    return flags?.[flag] ?? false;
  },

  get<T>(key: string): T {
    return Cypress.env(key) as T;
  },
};
