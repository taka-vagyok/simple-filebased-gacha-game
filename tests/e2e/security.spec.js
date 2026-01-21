const { test, expect } = require('@playwright/test');
const { mockGachaApis, skipAnimations } = require('./utils');

test.describe('Security Tests', () => {

  test('Path Traversal: Attempt to access parent directory', async ({ request }) => {
    // Try to access ../docker/server.js via the getGachaData API
    // Note: The API takes a 'folder' parameter which is joined with DATA_ROOT
    const response = await request.get('/api/getGachaData', {
      params: { folder: '../docker' }
    });

    // Expecting 200 OK with success: false (handled error)
    // OR 500 depending on server implementation detail,
    // but definitely NOT the content of server files.
    // The current implementation catches error and returns JSON { success: false, error: ... }

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Traversal detected');
  });

  test('Static File Access: Attempt to access sensitive files directly', async ({ request }) => {
    // Access /package.json
    const response1 = await request.get('/package.json');
    expect(response1.status()).toBe(404);

    // Access /docker/server.js
    const response2 = await request.get('/docker/server.js');
    expect(response2.status()).toBe(404);
  });

  test('XSS Prevention: Script Injection in Item Description', async ({ page }) => {
    const gachaConfig = { name: "XSS Gacha", grades: { G1: { color: "blue" } } };
    const items = [
      {
        id: "xss",
        name: "XSS Item",
        grade: "G1",
        image: "dummy.png",
        // Inject script in Markdown/Description
        description: "This is a <script>window.xssTriggered = true;</script> test."
      }
    ];

    await mockGachaApis(page, gachaConfig, items);

    // Override getItemAsset to return the actual description for XSS test
    await page.route('/api/getItemAsset*', async route => {
        const url = new URL(route.request().url());
        const descParam = url.searchParams.get('description');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                mdContent: descParam || 'Default'
            })
        });
    });

    await page.goto('/');

    // Setup a flag to detect XSS execution
    await page.evaluate(() => { window.xssTriggered = false; });

    await skipAnimations(page);
    await page.click('#btn-pull');

    // Open capsule
    await page.locator('.active-capsule').click();

    // Check result
    const resultDesc = page.locator('#item-desc');
    await expect(resultDesc).toBeVisible();

    // Verify script tag is NOT in the DOM or sanitized
    const html = await resultDesc.innerHTML();
    expect(html).not.toContain('<script>');

    // Verify script did NOT execute
    const isTriggered = await page.evaluate(() => window.xssTriggered);
    expect(isTriggered).toBe(false);
  });
});
