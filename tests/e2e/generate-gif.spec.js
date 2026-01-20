const { test } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const GIFEncoder = require("gif-encoder-2");
const { PNG } = require("pngjs");

test("Generate Gacha GIF", async ({ page }) => {
	// 1. Navigate to the page
	await page.goto("/");

	// Wait for the button to be enabled, which signifies data is loaded
	const btn = page.locator("#btn-pull");
	await btn.waitFor({ state: "visible", timeout: 10000 });

	// Ensure it's not disabled (data loaded)
	// We might need to wait a bit if it starts disabled
	await test.expect(btn).toBeEnabled({ timeout: 10000 });

	// Wait for machine to appear
	await page.locator("#machine").waitFor({ state: "visible", timeout: 10000 });

	// 2. Force Grade 5 (Rainbow) Result
	// We override the gachaItems to only contain one G5 item.
	await page.evaluate(() => {
		window.gachaItems = [
			{
				id: 999,
				name: "Rainbow Legend",
				grade: "G5",
				image: "dummy.png",
				description: "dummy.md",
				weight: 100
			}
		];
		console.log("Forced Gacha Items to G5 only");
	});

	// 3. Prepare for recording
	const frames = [];
	const duration = 3000; // 3 seconds recording time
	const interval = 100; // Capture every 100ms
	const startTime = Date.now();

	// 4. Trigger Action
	await btn.click();

	// 5. Capture Loop
	console.log("Starting capture...");
	while (Date.now() - startTime < duration) {
		const buffer = await page.screenshot();
		frames.push(buffer);
		await page.waitForTimeout(interval);
	}
	console.log(`Captured ${frames.length} frames.`);

	// 6. Generate GIF
	console.log("Encoding GIF...");

	if (frames.length === 0) {
		throw new Error("No frames captured!");
	}

	const firstFrame = PNG.sync.read(frames[0]);
	const encoder = new GIFEncoder(firstFrame.width, firstFrame.height);
	const outputFilePath = path.join(__dirname, "../../doc/gacha_demo.gif");

	const fileStream = fs.createWriteStream(outputFilePath);
	encoder.createReadStream().pipe(fileStream);

	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(interval);
	encoder.setQuality(10);

	for (const frameBuffer of frames) {
		const png = PNG.sync.read(frameBuffer);
		encoder.addFrame(png.data);
	}

	encoder.finish();
	console.log(`GIF saved to ${outputFilePath}`);
});
