/**
 * This project was created by Generative AI.
 * このプロジェクトは生成AIによって作成されました。
 */
((root, factory) => {
	if (typeof module === "object" && module.exports) {
		// Node.js
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.GachaLogic = factory();
	}
})(typeof self !== "undefined" ? self : this, () => {
	function drawItemByWeight(items) {
		if (!items || items.length === 0) return null;

		const totalWeight = items.reduce(
			(sum, item) => sum + (item.weight !== undefined ? item.weight : 1),
			0,
		);

		// Handle case where total weight is 0 (all items weight 0?)
		// Fallback to equal probability or first item
		if (totalWeight <= 0) return items[0];

		let random = Math.random() * totalWeight;

		for (const item of items) {
			random -= item.weight !== undefined ? item.weight : 1;
			if (random < 0) return item;
		}
		return items[0];
	}

	function checkPromotion(gradeConfig) {
		if (!gradeConfig.promotion) return null;
		const rate = gradeConfig.promotion.rate;
		if (Math.random() < rate) {
			return gradeConfig.promotion.next_grade;
		}
		return null;
	}

	function checkFakePromotion(gradeConfig) {
		if (!gradeConfig.promotion || !gradeConfig.promotion.fake_rate) return false;
		const rate = gradeConfig.promotion.fake_rate;
		return Math.random() < rate;
	}

	return {
		drawItemByWeight: drawItemByWeight,
		checkPromotion: checkPromotion,
		checkFakePromotion: checkFakePromotion,
	};
});
