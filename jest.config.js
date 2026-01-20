module.exports = {
	testEnvironment: "jsdom",
	collectCoverage: true,
	coverageDirectory: "coverage",
	collectCoverageFrom: ["gacha-logic.js"],
	testMatch: ["**/tests/unit/**/*.test.js"],
	testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/"],
};
