import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { EnvConfig } from '../../utils/EnvConfig';
import { Logger } from '../../utils/Logger';

/**
 * Login UI Test Suite
 * Tags: smoke, regression, ui
 * Target: https://the-internet.herokuapp.com/login
 */

const log = new Logger('LoginTest');

interface UserFixture {
  username: string;
  password: string;
}

interface UsersFixture {
  validUser: UserFixture;
  invalidUser: UserFixture;
}

describe('Login | UI Tests', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  let validUser: UserFixture;
  let invalidUser: UserFixture;

  before(() => {
    log.info('Setting up login test suite');
  });

  beforeEach(() => {
    cy.fixture('users').then((users: UsersFixture) => {
      validUser = users.validUser;
      invalidUser = users.invalidUser;
    });
  });

  it('[smoke] should login successfully with valid credentials', () => {
    log.step('TC-001: Valid login');

    loginPage.visit();
    loginPage.isLoaded();

    loginPage.login(validUser.username, validUser.password);

    dashboardPage.assertOnDashboard();
    dashboardPage.assertWelcomeHeaderVisible();
    dashboardPage.assertLoginSuccessFlash();
    cy.url().should('include', '/secure');
    cy.screenshot('TC-001_successful_login');
  });

  it('[regression] should redirect to /secure page after successful login', () => {
    log.step('TC-002: URL after login');

    loginPage.visit();
    loginPage.fillUsername(validUser.username).fillPassword(validUser.password).clickLoginButton();

    cy.url().should('include', '/secure');
    dashboardPage.assertWelcomeHeaderVisible();
  });

  it('[smoke] should show error message with invalid credentials', () => {
    log.step('TC-003: Invalid credentials');

    loginPage.visit();
    loginPage.login(invalidUser.username, invalidUser.password);

    loginPage.assertErrorMessage('Your username is invalid');
    loginPage.assertOnLoginPage();
  });

  it('[regression] should show error for wrong password with valid username', () => {
    log.step('TC-004: Wrong password');

    loginPage.visit();
    loginPage.login(validUser.username, 'WrongPassword!');

    loginPage.assertErrorMessage('Your password is invalid');
    loginPage.assertOnLoginPage();
  });

  it('[regression] should not login with empty username', () => {
    log.step('TC-005: Empty username');

    loginPage.visit();
    loginPage.fillPassword(validUser.password).clickLoginButton();

    loginPage.assertErrorMessage('Your username is invalid');
    loginPage.assertOnLoginPage();
  });

  it('[regression] should not login with empty password', () => {
    log.step('TC-006: Empty password');

    loginPage.visit();
    loginPage.fillUsername(validUser.username).clickLoginButton();

    loginPage.assertErrorMessage('Your password is invalid');
    loginPage.assertOnLoginPage();
  });

  it('[smoke] should logout successfully and redirect to login page', () => {
    log.step('TC-007: Logout flow');

    loginPage.visit();
    loginPage.login(validUser.username, validUser.password);
    dashboardPage.assertOnDashboard();

    dashboardPage.clickLogout();

    loginPage.assertOnLoginPage();
    loginPage.assertFlashMessageVisible();
  });

  it('[regression] should use session caching to avoid repeated login overhead', () => {
    log.step('TC-008: Cached session re-use');

    const creds = EnvConfig.getCredentials();
    cy.loginWithSession(creds.username, creds.password);

    cy.visit('/secure');
    dashboardPage.assertWelcomeHeaderVisible();
  });
});
