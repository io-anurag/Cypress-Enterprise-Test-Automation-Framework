import './commands/auth.commands';
import './commands/ui.commands';
import './commands/api.commands';
import '@shelex/cypress-allure-plugin';
import 'cypress-mochawesome-reporter/register';

beforeEach(() => {
  const testTitle = Cypress.currentTest.titlePath.join(' > ');
  cy.log(`▶ Starting: ${testTitle}`);
  cy.log(`🌍 Environment: ${Cypress.env('ENVIRONMENT') as string}`);
});

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    const screenshotName = Cypress.currentTest.titlePath
      .join('__')
      .split(' ')
      .join('_')
      .split('/')
      .join('-');
    cy.document().should('exist');
    cy.screenshot(`FAILED__${screenshotName}`, { capture: 'fullPage' });
  }
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});
