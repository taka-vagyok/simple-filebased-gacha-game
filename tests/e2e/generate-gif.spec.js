const { test } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const GIFEncoder = require("gif-encoder-2");
const { PNG } = require("pngjs");

test("Generate Gacha GIF", async ({ page }) => {
	// 1. Set Viewport (Mobile-like) and Navigate
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");

	// Helper to check state
	const getGachaState = async () => {
		return await page.evaluate(() => document.body.dataset.gachaStatus);
	};

	// Wait for idle state (loaded)
	await page.waitForFunction(() => document.body.dataset.gachaStatus === 'idle');

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
	const btn = page.locator("#btn-pull");
	await btn.click();

	// 4. Capture Loop (State-Driven)
	console.log("Starting capture...");
	const frames = [];
	const delays = [];
	const startTime = Date.now();
	let lastFrameTime = startTime;

	let hasShaken = false;
	let hasAppeared = false;
	const POST_RESULT_FRAMES = 10; // Frames to capture after result is shown
	let postResultCount = 0;

	// Loop until 'result_shown' + buffer
	while (true) {
		const state = await getGachaState();

		// Optional: Only start recording when 'processing' or 'shaking' starts?
		// But capturing the click reaction is good.

		const buffer = await page.screenshot();
		const now = Date.now();
		const delay = now - lastFrameTime;
		lastFrameTime = now;

		frames.push(buffer);
		delays.push(delay);

		if (state === 'shaking') hasShaken = true;
		if (state === 'capsule_appearing') hasAppeared = true;

		// New Interaction: Click capsule to open
		if (state === 'waiting_for_open') {
			// Click the active capsule
			try {
				await page.click('.active-capsule', { timeout: 1000 });
				console.log("Clicked active capsule.");
			} catch (e) {
				// Might have already clicked or transition fast
			}
		}

		if (state === 'result_shown') {
			postResultCount++;
			if (postResultCount > POST_RESULT_FRAMES) {
				console.log("Result shown and buffer captured. Stopping.");
				break;
			}
		}

		// Timeout safety (20s)
		if (now - startTime > 20000) {
			console.log("Timeout reached.");
			break;
		}
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

	for (let i = 0; i < frames.length; i++) {
		const png = PNG.sync.read(frames[i]);
		const delayMs = delays[i];
		encoder.setDelay(delayMs);
		encoder.addFrame(png.data);
	}

	encoder.finish();
	console.log(`GIF saved to ${outputFilePath}`);
});
