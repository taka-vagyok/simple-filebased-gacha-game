const { test, expect } = require('@playwright/test');
const { mockGachaApis, skipAnimations, mockMathRandom } = require('./utils');

test.describe('Deterministic Gacha Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await mockMathRandom(page);
  });

  test('Rainbow Promotion Scenario', async ({ page }) => {
    const gachaConfig = {
      name: "Test Gacha",
      grades: {
        blue: { color: "blue", promotion: { rate: 1.0, next_grade: "gold" } },
        gold: { color: "gold", promotion: { rate: 1.0, next_grade: "rainbow" } },
        rainbow: { color: "rainbow" }
      }
    };

    const items = [
        { id: "dummy", name: "Dummy Blue", grade: "blue", image: "dummy.png", description: "dummy.md" },
        { id: "item1", name: "Rainbow Sword", grade: "rainbow", image: "img1.png", description: "desc1.md" }
    ];

    await mockGachaApis(page, gachaConfig, items);

    await page.goto('/');

    // Skip animations AFTER page load
    await skipAnimations(page);

    await page.click('#btn-pull');

    await expect(page.locator('#item-name')).toHaveText('Rainbow Sword');
  });

  test('Fake Promotion Scenario', async ({ page }) => {
    const gachaConfig = {
        name: "Fake Gacha",
        grades: {
            blue: {
                color: "blue",
                promotion: { rate: 0.0, next_grade: "gold", fake_rate: 1.0 }
            },
            gold: { color: "gold" }
        }
    };

    const items = [
        { id: "item1", name: "Blue Shield", grade: "blue", image: "img.png", description: "desc.md" }
    ];

    await mockGachaApis(page, gachaConfig, items);

    await page.goto('/');

    // Skip animations AFTER page load
    await skipAnimations(page);

    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.click('#btn-pull');

    await expect(page.locator('#item-name')).toHaveText('Blue Shield');

    await expect(() => {
        expect(logs).toContain('Fake Promotion Triggered!');
    }).toPass();
  });
});
