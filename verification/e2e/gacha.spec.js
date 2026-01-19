const { test, expect } = require('@playwright/test');

test.describe('Gacha App E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the app
        await page.goto('/');
    });

    test('Initial display (Smoke Test)', async ({ page }) => {
        // Check Title
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('お楽しみガチャ');

        // Check Machine SVG loaded
        const machine = page.locator('#machine');
        await expect(machine).toBeVisible({ timeout: 10000 });

        // Check Button enabled (implies data loaded)
        const btn = page.locator('#btn-pull');
        await expect(btn).toBeEnabled({ timeout: 10000 });
    });

    test('Gacha Execution Flow', async ({ page }) => {
        const btn = page.locator('#btn-pull');
        await expect(btn).toBeEnabled({ timeout: 10000 });

        // Click
        await btn.click();
        await expect(btn).toBeDisabled();

        // Check Animation (Machine Shake)
        const machine = page.locator('#machine');
        // We look for the class addition. Playwright's toHaveClass is strict or regex.
        // The class is added and then removed. We need to catch it or just wait for result.
        // It's safer to wait for the result area to appear.

        const resultArea = page.locator('#result-area');
        await expect(resultArea).toBeVisible();

        const resultContent = page.locator('#result-content');
        // Wait for result content (loading finishes)
        await expect(resultContent).toBeVisible({ timeout: 20000 });

        // Verify content
        const itemName = page.locator('#item-name');
        await expect(itemName).not.toBeEmpty();

        const itemImg = page.locator('#item-img');
        await expect(itemImg).toBeVisible();

        // Button should be re-enabled
        await expect(btn).toBeEnabled();
        await expect(btn).toHaveText('もう一度回す');
    });
});
