import { BasePage } from './BasePage';

/**
 * DashboardPage — Page Object for the secure area after login.
 * Target: https://the-internet.herokuapp.com/secure
 */
export class DashboardPage extends BasePage {
  private readonly selectors = {
    welcomeHeader: 'h2',
    logoutButton: 'a[href="/logout"]',
    successFlash: '#flash.success',
    contentArea: '.example',
  } as const;

  private readonly PATH = '/secure';
  private readonly EXPECTED_HEADER = 'Secure Area';

  constructor() {
    super('DashboardPage');
  }

  visit(): Cypress.Chainable<Cypress.AUTWindow> {
    this.log.step('Navigating to Dashboard');
    return cy.visit(this.PATH);
  }

  isLoaded(): Cypress.Chainable<void> {
    return cy
      .get(this.selectors.welcomeHeader, { timeout: 10_000 })
      .should('contain.text', this.EXPECTED_HEADER)
      .then(() => {
        this.log.info('Dashboard fully loaded');
      }) as unknown as Cypress.Chainable<void>;
  }

  clickLogout(): this {
    this.log.step('Clicking Logout');
    this.smartClick(this.selectors.logoutButton);
    return this;
  }

  assertWelcomeHeaderVisible(): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.info('Asserting welcome header');
    return cy
      .contains(this.selectors.welcomeHeader, this.EXPECTED_HEADER)
      .should('be.visible') as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
  }

  assertSecureAreaText(expectedText: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.contentArea).should('contain.text', expectedText);
  }

  assertOnDashboard(): Cypress.Chainable<string> {
    return this.assertUrl('/secure');
  }

  assertLoginSuccessFlash(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .get(this.selectors.successFlash)
      .should('be.visible')
      .and('contain.text', 'You logged into a secure area');
  }

  getWelcomeText(): Cypress.Chainable<string> {
    return this.getText(this.selectors.welcomeHeader);
  }
}
