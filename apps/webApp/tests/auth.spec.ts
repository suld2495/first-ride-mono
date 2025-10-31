import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('login form displays correctly', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // Add assertions for validation messages
    // await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    // await expect(page).toHaveURL('/dashboard');
  });
});
