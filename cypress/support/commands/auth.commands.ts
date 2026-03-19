/* eslint-disable cypress/unsafe-to-chain-command */
import { EnvConfig } from '../../utils/EnvConfig';
import { Logger } from '../../utils/Logger';

const log = new Logger('AuthCommands');

/**
 * Authentication commands — login via UI or API session injection.
 * Register in cypress/support/e2e.ts
 */

Cypress.Commands.add('login', (username: string, password: string) => {
  log.step(`UI Login as: ${username}`);
  cy.visit('/login');
  cy.get('#username').should('be.visible').clear().type(username, { delay: 0 });
  cy.get('#password').should('be.visible').clear().type(password, { delay: 0 });
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/secure');
});

Cypress.Commands.add('loginByApi', (username: string, password: string) => {
  log.step(`API Login as: ${username}`);
  const apiBaseUrl = EnvConfig.getApiBaseUrl();

  cy.request({
    method: 'POST',
    url: `${apiBaseUrl}/login`,
    body: { email: username, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body) {
      const body = response.body as { token?: string };
      if (body.token) {
        // Inject token for subsequent requests
        Cypress.env('authToken', body.token);
        log.info(`Auth token obtained and stored`);
      }
    } else {
      log.warn(`API login returned status ${response.status} — proceeding without token`);
    }
  });
});

Cypress.Commands.add('loginWithSession', (username?: string, password?: string) => {
  const credentials = EnvConfig.getCredentials();
  const user = username ?? credentials.username;
  const pass = password ?? credentials.password;

  cy.session(
    [user, pass],
    () => {
      log.step(`Creating new session for: ${user}`);
      cy.request({
        method: 'POST',
        url: '/authenticate',
        form: true,
        body: { username: user, password: pass },
        followRedirect: true,
      });
    },
    {
      validate() {
        cy.request({ url: '/secure', failOnStatusCode: false }).its('status').should('eq', 200);
      },
      cacheAcrossSpecs: false,
    },
  );
});

Cypress.Commands.add('logout', () => {
  log.step('Logging out');
  cy.get('a[href="/logout"]').click();
  cy.url().should('include', '/login');
});
