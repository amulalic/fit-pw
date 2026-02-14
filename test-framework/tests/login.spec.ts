import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginDataFactory } from '../utils/factories/LoginDataFactory';
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    const validCredentials = LoginDataFactory.validCredentials();
    await loginPage.login(validCredentials.username, validCredentials.password);
    await expect(page).toHaveURL("/inventory.html");
  });

  test('should display error with invalid username', async ({ page }) => {
    const validCredentials = LoginDataFactory.validCredentials();
    const invalidCredentials = LoginDataFactory.invalidCredentials();
    await loginPage.login(invalidCredentials.username, validCredentials.password);
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
  });

  test('should display error with invalid password', async ({ page }) => {
    const validCredentials = LoginDataFactory.validCredentials();
    const invalidCredentials = LoginDataFactory.invalidCredentials();
    await loginPage.login(validCredentials.username, invalidCredentials.password);
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
  });

  test('should display error with empty credentials', async ({ page }) => {
    await loginPage.clickLoginButton();
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Epic sadface: Username is required');
  });
});
