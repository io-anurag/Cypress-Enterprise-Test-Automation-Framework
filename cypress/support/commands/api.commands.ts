import { EnvConfig } from '../../utils/EnvConfig';
import { Logger } from '../../utils/Logger';

const log = new Logger('ApiCommands');

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = Cypress.env('authToken') as string | undefined;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

Cypress.Commands.add('apiGet', (path: string, options: Partial<Cypress.RequestOptions> = {}) => {
  const url = `${EnvConfig.getApiBaseUrl()}${path}`;
  log.info(`API GET: ${url}`);
  return cy.request({
    method: 'GET',
    url,
    headers: buildHeaders(),
    failOnStatusCode: true,
    ...options,
  });
});

Cypress.Commands.add(
  'apiPost',
  (path: string, body: unknown, options: Partial<Cypress.RequestOptions> = {}) => {
    const url = `${EnvConfig.getApiBaseUrl()}${path}`;
    log.info(`API POST: ${url}`);
    return cy.request({
      method: 'POST',
      url,
      body: body as Cypress.RequestBody,
      headers: buildHeaders(),
      failOnStatusCode: true,
      ...options,
    });
  },
);

Cypress.Commands.add(
  'apiPut',
  (path: string, body: unknown, options: Partial<Cypress.RequestOptions> = {}) => {
    const url = `${EnvConfig.getApiBaseUrl()}${path}`;
    log.info(`API PUT: ${url}`);
    return cy.request({
      method: 'PUT',
      url,
      body: body as Cypress.RequestBody,
      headers: buildHeaders(),
      failOnStatusCode: true,
      ...options,
    });
  },
);

Cypress.Commands.add(
  'apiPatch',
  (path: string, body: unknown, options: Partial<Cypress.RequestOptions> = {}) => {
    const url = `${EnvConfig.getApiBaseUrl()}${path}`;
    log.info(`API PATCH: ${url}`);
    return cy.request({
      method: 'PATCH',
      url,
      body: body as Cypress.RequestBody,
      headers: buildHeaders(),
      failOnStatusCode: true,
      ...options,
    });
  },
);

Cypress.Commands.add('apiDelete', (path: string, options: Partial<Cypress.RequestOptions> = {}) => {
  const url = `${EnvConfig.getApiBaseUrl()}${path}`;
  log.info(`API DELETE: ${url}`);
  return cy.request({
    method: 'DELETE',
    url,
    headers: buildHeaders(),
    failOnStatusCode: true,
    ...options,
  });
});
