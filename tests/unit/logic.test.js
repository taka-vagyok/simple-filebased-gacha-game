const GachaLogic = require("../../gacha-logic.js");

describe("GachaLogic", () => {
	describe("drawItemByWeight", () => {
		test("should return an item based on weights", () => {
			const items = [
				{ id: 1, weight: 100 },
				{ id: 2, weight: 0 },
			];
			// Mock Math.random to always pick the first item
			jest.spyOn(Math, "random").mockReturnValue(0.1);
			const result = GachaLogic.drawItemByWeight(items);
			expect(result.id).toBe(1);
			jest.restoreAllMocks();
		});

		test("should handle edge case where random selects the last item", () => {
			const items = [
				{ id: 1, weight: 1 },
				{ id: 2, weight: 1 },
			];
			// Total weight 2. Random 0.99 * 2 = 1.98 -> Second item
			jest.spyOn(Math, "random").mockReturnValue(0.99);
			const result = GachaLogic.drawItemByWeight(items);
			expect(result.id).toBe(2);
			jest.restoreAllMocks();
		});

		test("should return first item if weight calculation fails (fallback)", () => {
			const items = [{ id: 1, weight: 1 }];
			jest.spyOn(Math, "random").mockReturnValue(1.5); // Out of bounds effectively, though logic handles it by loop finish
			const result = GachaLogic.drawItemByWeight(items);
			// The logic returns items[0] if loop finishes
			expect(result.id).toBe(1);
			jest.restoreAllMocks();
		});

		test("should return null if items list is empty", () => {
			expect(GachaLogic.drawItemByWeight([])).toBeNull();
			expect(GachaLogic.drawItemByWeight(null)).toBeNull();
		});

		test("should return first item if total weight is 0", () => {
			const items = [{ id: 1, weight: 0 }, { id: 2, weight: 0 }];
			expect(GachaLogic.drawItemByWeight(items).id).toBe(1);
		});
	});

	describe("checkPromotion", () => {
		test("should return next_grade if random < rate", () => {
			const config = {
				promotion: { rate: 0.5, next_grade: "gold" },
			};
			jest.spyOn(Math, "random").mockReturnValue(0.4);
			expect(GachaLogic.checkPromotion(config)).toBe("gold");
			jest.restoreAllMocks();
		});

		test("should return null if random >= rate", () => {
			const config = {
				promotion: { rate: 0.5, next_grade: "gold" },
			};
			jest.spyOn(Math, "random").mockReturnValue(0.5);
			expect(GachaLogic.checkPromotion(config)).toBeNull();
			jest.restoreAllMocks();
		});

		test("should return null if no promotion config", () => {
			expect(GachaLogic.checkPromotion({})).toBeNull();
		});
	});

	describe("checkFakePromotion", () => {
		test("should return true if random < fake_rate", () => {
			const config = {
				promotion: { fake_rate: 0.3 },
			};
			jest.spyOn(Math, "random").mockReturnValue(0.2);
			expect(GachaLogic.checkFakePromotion(config)).toBe(true);
			jest.restoreAllMocks();
		});

		test("should return false if random >= fake_rate", () => {
			const config = {
				promotion: { fake_rate: 0.3 },
			};
			jest.spyOn(Math, "random").mockReturnValue(0.3);
			expect(GachaLogic.checkFakePromotion(config)).toBe(false);
			jest.restoreAllMocks();
		});

		test("should return false if fake_rate is missing", () => {
			const config = {
				promotion: { rate: 0.5 },
			};
			expect(GachaLogic.checkFakePromotion(config)).toBe(false);
		});

		test("should return false if promotion config is missing", () => {
			expect(GachaLogic.checkFakePromotion({})).toBe(false);
		});
	});
});
