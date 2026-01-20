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
		const totalWeight = items.reduce(
			(sum, item) => sum + (item.weight || 1),
			0,
		);
		let random = Math.random() * totalWeight;

		for (const item of items) {
			random -= item.weight || 1;
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
