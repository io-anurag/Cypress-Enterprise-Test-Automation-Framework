import { BasePage } from './BasePage';

/**
 * LoginPage — Page Object for the login flow.
 * Target: https://the-internet.herokuapp.com/login
 */
export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameInput: '#username',
    passwordInput: '#password',
    loginButton: 'button[type="submit"]',
    errorMessage: '#flash.error',
    successMessage: '#flash.success',
    flashMessage: '#flash',
  } as const;

  private readonly PATH = '/login';

  constructor() {
    super('LoginPage');
  }

  visit(): Cypress.Chainable<Cypress.AUTWindow> {
    this.log.step('Navigating to Login page');
    return cy.visit(this.PATH);
  }

  isLoaded(): Cypress.Chainable<void> {
    return this.waitForVisible(this.selectors.loginButton).then(() => {
      this.log.info('Login page fully loaded');
    }) as unknown as Cypress.Chainable<void>;
  }

  fillUsername(username: string): this {
    this.log.step(`Entering username: ${username}`);
    this.smartType(this.selectors.usernameInput, username);
    return this;
  }

  fillPassword(password: string): this {
    this.log.step('Entering password');
    this.smartType(this.selectors.passwordInput, password);
    return this;
  }

  clickLoginButton(): this {
    this.log.step('Clicking the Login button');
    this.smartClick(this.selectors.loginButton);
    return this;
  }

  login(username: string, password: string): this {
    this.log.startGroup('Executing login flow');
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLoginButton();
    this.log.endGroup();
    return this;
  }

  assertErrorMessage(expectedText: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.info(`Asserting error: "${expectedText}"`);
    return cy
      .get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain.text', expectedText);
  }

  assertSuccessMessage(expectedText: string): Cypress.Chainable<JQuery<HTMLElement>> {
    this.log.info(`Asserting success: "${expectedText}"`);
    return cy
      .get(this.selectors.successMessage)
      .should('be.visible')
      .and('contain.text', expectedText);
  }

  assertFlashMessageVisible(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.flashMessage).should('be.visible');
  }

  assertOnLoginPage(): Cypress.Chainable<string> {
    return this.assertUrl('/login');
  }

  getErrorMessage(): Cypress.Chainable<string> {
    return this.getText(this.selectors.errorMessage);
  }

  getFlashMessage(): Cypress.Chainable<string> {
    return this.getText(this.selectors.flashMessage);
  }
}
