const { test, expect } = require("@playwright/test");
const { skipAnimations } = require("./utils");

test.describe("Gacha App E2E (Real Data)", () => {
	// Removed beforeEach skipAnimations as it needs to be called after goto

	test("Initial display (Smoke Test)", async ({ page }) => {
		const logicResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes("gacha-logic.js") && response.status() === 200,
		);

		await page.goto("/");
		await logicResponsePromise;

        // Skip animations for this test (though not strictly needed for static check)
        await skipAnimations(page);

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"伝説の装備ガチャ",
		);

		const machine = page.locator("#machine");
		await expect(machine).toBeVisible({ timeout: 10000 });

		// Verify that capsules are present in the machine (static definition)
		const capsuleCount = await page.evaluate(() => {
			const svg = document.getElementById("machine");
			if (!svg) return 0;
			// Simple check for presence of internal capsules
			const uses = svg.querySelectorAll('g[clip-path] use');
			return uses.length;
		});
		expect(capsuleCount).toBeGreaterThan(0);

		const btn = page.locator("#btn-pull");
		await expect(btn).toBeEnabled({ timeout: 10000 });

		const machineContainer = page.locator("#machine-container");
		await machineContainer.screenshot({ path: "doc/gacha_machine.png" });
	});

	test("Gacha Execution Flow", async ({ page }) => {
		await page.goto("/");

        // Skip animations for speed
        await skipAnimations(page);

		const btn = page.locator("#btn-pull");
		await expect(btn).toBeEnabled({ timeout: 10000 });

		await btn.click();
		await expect(btn).toBeDisabled();

		const resultArea = page.locator("#result-area");
		await expect(resultArea).toBeVisible();

		const resultContent = page.locator("#result-content");
		await expect(resultContent).toBeVisible({ timeout: 20000 });

		const itemName = page.locator("#item-name");
		await expect(itemName).not.toBeEmpty();

		const itemImg = page.locator("#item-img");
		await expect(itemImg).toBeVisible();

		await expect(btn).toBeEnabled();
		await expect(btn).toHaveText("もう一度回す");
	});
});
