const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	testIgnore: "**/unit/**", // Ignore Jest unit tests
	timeout: 30000,
	expect: {
		timeout: 5000,
	},
	use: {
		baseURL: "http://localhost:8000",
		headless: true,
		viewport: { width: 1280, height: 720 },
		ignoreHTTPSErrors: true,
		screenshot: "only-on-failure",
	},
});
