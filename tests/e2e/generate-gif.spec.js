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
	await test.expect(btn).toBeEnabled({ timeout: 10000 });

	// Wait for machine to appear
	await page.locator("#machine").waitFor({ state: "visible", timeout: 10000 });

	// Note: We no longer manually inject colors because the app now handles it (Spec-Driven).
	// But we should verify they are colorful in a real test?
	// For GIF generation, we just trust the app.

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

	// 3. Trigger Action
	console.log("Starting action...");
	await btn.click();

	// 4. Capture Loop
	console.log("Starting capture...");
	const frames = [];
	const delays = []; // Track actual delay per frame
	const startTime = Date.now();
	let lastFrameTime = startTime;

	// Loop controls
	let capsuleAppeared = false;
	let appearTime = 0;
	const POST_APPEAR_DURATION = 1500; // Capture 1.5s after capsule appears to show it settling
	const MAX_DURATION = 8000; // Safety timeout

	while (true) {
		const now = Date.now();
		if (now - startTime > MAX_DURATION) {
			console.log("Max duration exceeded.");
			break;
		}

		// Check if capsule has appeared
		const isAppeared = await page.evaluate(() => {
			const c = document.getElementById('capsule');
			return c && c.classList.contains('capsule-appear');
		});

		if (isAppeared && !capsuleAppeared) {
			console.log("Capsule appearance detected!");
			capsuleAppeared = true;
			appearTime = now;
		}

		// Stop condition: 1.5s after appearance
		if (capsuleAppeared && (now - appearTime > POST_APPEAR_DURATION)) {
			console.log("Post-appear duration captured.");
			break;
		}

		// Capture Frame
		const buffer = await page.screenshot(); // This takes time!
		frames.push(buffer);

		// Calculate delay for this frame (time since last frame start)
		const frameEnd = Date.now();
		const delay = frameEnd - lastFrameTime;
		delays.push(delay);
		lastFrameTime = frameEnd;
	}
	console.log(`Captured ${frames.length} frames.`);

	// 5. Generate GIF
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
	encoder.setQuality(10);

	// Add frames with their dynamic delays
	for (let i = 0; i < frames.length; i++) {
		const png = PNG.sync.read(frames[i]);
		const delayMs = delays[i];
		// gif-encoder-2 takes delay in ms
		encoder.setDelay(delayMs);
		encoder.addFrame(png.data);
	}

	encoder.finish();
	console.log(`GIF saved to ${outputFilePath}`);
});
