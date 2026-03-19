/* eslint-disable cypress/unsafe-to-chain-command */
import { Logger } from '../../utils/Logger';

const log = new Logger('UICommands');

/**
 * UI-focused custom commands that extend cy.* with smart interactions.
 * These replace raw cy.get().click() with resilient, logged alternatives.
 */

Cypress.Commands.add('smartClick', (selector: string) => {
  log.debug(`smartClick: ${selector}`);
  cy.get(selector)
    .scrollIntoView()
    .should('be.visible')
    .and('not.be.disabled')
    .click();
});

Cypress.Commands.add('smartType', (selector: string, text: string) => {
  log.debug(`smartType: ${selector} → "${text}"`);
  cy.get(selector)
    .scrollIntoView()
    .should('be.visible')
    .clear()
    .type(text, { delay: 0 });
});

Cypress.Commands.add('waitForElement', (selector: string, timeout = 10_000) => {
  log.debug(`waitForElement: ${selector} | timeout: ${timeout}ms`);
  cy.get(selector, { timeout }).should('be.visible');
});

Cypress.Commands.add('assertVisible', (selector: string) => {
  cy.get(selector).should('be.visible');
});

Cypress.Commands.add('assertHidden', (selector: string) => {
  cy.get(selector).should('not.be.visible');
});

Cypress.Commands.add('assertText', (selector: string, text: string) => {
  cy.get(selector).should('contain.text', text);
});

Cypress.Commands.add('waitForUrl', (urlFragment: string, timeout = 10_000) => {
  log.debug(`waitForUrl: "${urlFragment}"`);
  cy.url({ timeout }).should('include', urlFragment);
});

Cypress.Commands.add('scrollToElement', (selector: string) => {
  cy.get(selector).scrollIntoView();
});

Cypress.Commands.add('clearState', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
  log.debug('Cleared all browser state');
});

Cypress.Commands.add(
  'interceptAndAlias',
  (method: string, urlPattern: string, alias: string) => {
    log.debug(`Intercepting ${method} ${urlPattern} as @${alias}`);
    cy.intercept(method, urlPattern).as(alias);
  },
);
