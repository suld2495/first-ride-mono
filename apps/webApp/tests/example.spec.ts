import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/First Ride/);
});

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');

  // Add navigation tests based on your app structure
  // Example:
  // await page.click('[data-testid="nav-link"]');
  // await expect(page).toHaveURL('/target-page');
});
