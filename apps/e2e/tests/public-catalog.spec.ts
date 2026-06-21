import { expect, test } from '@playwright/test';

test.describe('public catalog', () => {
  test('renders home, discovery, project, and platform surfaces', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: /an open home for minecraft projects/i,
      }),
    ).toBeVisible();

    await page.getByRole('button', { name: /explore projects/i }).click();
    await expect(page).toHaveURL(/\/mods$/);
    await expect(page.getByLabel(/search mods/i)).toBeVisible();
    await expect(page.getByText(/\d+ results?/)).toBeVisible();

    await page.getByLabel(/search mods/i).fill('optimization');
    await expect(page.getByText(/\d+ results?/)).toBeVisible();

    const firstProject = page.getByRole('link', { name: /^Open / }).first();
    await expect(firstProject).toBeVisible();
    await firstProject.click();
    await expect(page).toHaveURL(/[?&]project=/);

    await page.getByRole('link', { name: 'Platform' }).click();
    await expect(page).toHaveURL(/\/platform$/);
    await expect(page.getByRole('heading', { name: 'Platform' })).toBeVisible();
  });

  test('opens auth when a protected page is requested', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', { name: /sign in to open your dashboard/i }),
    ).toBeVisible();

    await page
      .getByRole('button', { name: /sign in/i })
      .first()
      .click();
    await expect(page.getByLabel(/username or email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });
});
