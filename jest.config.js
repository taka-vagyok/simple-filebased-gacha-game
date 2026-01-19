module.exports = {
	testEnvironment: "jsdom",
	collectCoverage: true,
	coverageDirectory: "coverage",
	collectCoverageFrom: ["gacha-logic.js"],
	testPathIgnorePatterns: ["/node_modules/", "/verification/e2e/"],
};
