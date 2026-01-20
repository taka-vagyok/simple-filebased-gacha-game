// Helper to skip animations and network delays
async function mockGachaApis(page, gachaConfig, items) {
  // Mock getGachaData
  await page.route('/api/getGachaData*', async route => {
    const yaml = require('js-yaml');

    const response = {
      success: true,
      gachaYaml: yaml.dump(gachaConfig),
      itemsYaml: yaml.dump(items)
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });

  // Mock getItemAsset
  await page.route('/api/getItemAsset*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        mdContent: '# Mock Item\nDescription'
      })
    });
  });
}

// Must be called AFTER page.goto because gacha.html defines 'wait' globally, overwriting any initScript
async function skipAnimations(page) {
  await page.evaluate(() => {
    window.wait = (ms) => Promise.resolve();
  });
}

async function mockMathRandom(page) {
    // Mock Math.random to always return 0
    await page.addInitScript(() => {
        Math.random = () => 0;
    });
}

module.exports = { mockGachaApis, skipAnimations, mockMathRandom };
