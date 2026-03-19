/* eslint-disable cypress/unsafe-to-chain-command */
import { Logger } from '../utils/Logger';

/**
 * BasePage — Abstract base class for all Page Objects.
 */
export abstract class BasePage {
  protected readonly log: Logger;
  protected readonly pageName: string;

  constructor(pageName: string) {
    this.pageName = pageName;
    this.log = new Logger(pageName);
  }

  abstract visit(): Cypress.Chainable<Cypress.AUTWindow>;
  abstract isLoaded(): Cypress.Chainable<void>;

  protected getElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.debug(`Getting element: ${selector}`);
    return cy.get(selector);
  }

  protected getByTestId(testId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`[data-testid="${testId}"]`);
  }

  protected getByRole(role: string, name?: string): Cypress.Chainable<JQuery<HTMLElement>> {
    if (name) return cy.get(`[role="${role}"][aria-label="${name}"]`);
    return cy.get(`[role="${role}"]`);
  }

  protected smartClick(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.debug(`Smart click: ${selector}`);
    return cy.get(selector).scrollIntoView().should('be.visible').and('not.be.disabled').click();
  }

  protected smartType(selector: string, text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.debug(`Smart type: ${selector} → "${text}"`);
    return cy.get(selector).scrollIntoView().should('be.visible').clear().type(text, { delay: 0 });
  }

  protected selectOption(selector: string, value: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector).should('be.visible').select(value);
  }

  protected hover(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector).scrollIntoView().trigger('mouseover');
  }

  protected waitForVisible(selector: string, timeout = 10_000): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.debug(`Waiting for visible: ${selector}`);
    return cy.get(selector, { timeout }).should('be.visible');
  }

  protected waitForHidden(selector: string, timeout = 10_000): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.debug(`Waiting for hidden: ${selector}`);
    return cy.get(selector, { timeout }).should('not.be.visible');
  }

  /**
   * Wait for a spinner/loading element to disappear.
   */
  protected waitForLoadingToFinish(spinnerSelector = '[data-testid="loading-spinner"]'): Cypress.Chainable<void> {
    return cy.get('body').then(($body) => {
      if ($body.find(spinnerSelector).length > 0) {
        this.waitForHidden(spinnerSelector, 30_000);
      }
      return undefined;
    }) as unknown as Cypress.Chainable<void>;
  }

  /**
   * Wait for a named network request alias.
   * Usage: cy.intercept(...).as('alias') then page.waitForRequest('alias')
   */
  protected waitForRequest(alias: string, timeout = 15_000): Cypress.Chainable<any> {
    this.log.debug(`Waiting for request: @${alias}`);
    return cy.wait(`@${alias}`, { timeout });
  }

  protected assertText(selector: string, text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector).should('contain.text', text);
  }

  protected assertAttribute(selector: string, attr: string, value: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector).should('have.attr', attr, value);
  }

  protected assertUrl(expected: string | RegExp): Cypress.Chainable<string> {
    if (typeof expected === 'string') return cy.url().should('include', expected);
    return cy.url().should('match', expected);
  }

  protected assertTitle(expected: string): Cypress.Chainable<string> {
    return cy.title().should('eq', expected);
  }

  protected takeScreenshot(name: string): void {
    cy.screenshot(`${this.pageName}/${name}`, { overwrite: true });
  }

  protected scrollToElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector).scrollIntoView();
  }

  getText(selector: string): Cypress.Chainable<string> {
    return cy.get(selector).invoke('text');
  }

  elementExists(selector: string): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => cy.wrap($body.find(selector).length > 0));
  }
}
