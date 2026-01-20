/**
 * This project was created by Generative AI.
 * このプロジェクトは生成AIによって作成されました。
 */
const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const app = express();
const port = 8000;

// Configurable data path (defaults to ../gacha_data relative to this script)
const DATA_ROOT =
	process.env.DATA_ROOT || path.join(__dirname, "../gacha_data");

// Helper: Resolve Safe Path to prevent traversal
function resolveSafePath(base, ...parts) {
	const resolvedBase = path.resolve(base);
	const resolvedTarget = path.resolve(base, ...parts);

	// Ensure the resolved target starts with the resolved base directory + separator
	// This prevents partial matches (e.g., /data matching /database)
	const safeBase = resolvedBase.endsWith(path.sep)
		? resolvedBase
		: resolvedBase + path.sep;

	if (!resolvedTarget.startsWith(safeBase) && resolvedTarget !== resolvedBase) {
		throw new Error("Invalid path: Traversal detected");
	}
	return resolvedTarget;
}

// Request Logging Middleware (Before static files)
app.use((req, _res, next) => {
	console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
	next();
});

// Serve specific static files securely
// 1. gacha-logic.js (Required by frontend)
app.get("/gacha-logic.js", (_req, res) => {
	res.sendFile(path.join(__dirname, "../gacha-logic.js"));
});

// 2. gacha_data directory (Required for assets)
app.use("/gacha_data", express.static(DATA_ROOT));

// Enable JSON parsing
app.use(express.json());

// API: Get Gacha Data (gacha.yaml & items.yaml)
app.get("/api/getGachaData", (req, res) => {
	const folderName = req.query.folder || "gacha1";

	try {
		// Security Check
		const folderPath = resolveSafePath(DATA_ROOT, folderName);
		const gachaYamlPath = resolveSafePath(folderPath, "gacha.yaml");
		const itemsYamlPath = resolveSafePath(folderPath, "items.yaml");

		if (!fs.existsSync(gachaYamlPath) || !fs.existsSync(itemsYamlPath)) {
			throw new Error(`Config files not found in: ${folderName}`);
		}
		const gachaYamlContent = fs.readFileSync(gachaYamlPath, "utf8");
		const itemsYamlContent = fs.readFileSync(itemsYamlPath, "utf8");

		// Simulate network delay
		setTimeout(() => {
			res.json({
				success: true,
				gachaYaml: gachaYamlContent,
				itemsYaml: itemsYamlContent,
			});
		}, 500);
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

// API: Get Item Asset (Image & Markdown)
app.get("/api/getItemAsset", (req, res) => {
	const folderName = req.query.folder || "gacha1";
	const imgName = req.query.image;
	const mdName = req.query.description;

	if (!imgName || !mdName) {
		return res.json({ success: false, error: "Missing parameters" });
	}

	try {
		// Security Check
		const folderPath = resolveSafePath(DATA_ROOT, folderName);
		const imgPath = resolveSafePath(folderPath, imgName);
		const mdPath = resolveSafePath(folderPath, mdName);

		if (!fs.existsSync(imgPath) || !fs.existsSync(mdPath)) {
			throw new Error("Assets not found");
		}

		const imgBuffer = fs.readFileSync(imgPath);
		const base64Img = imgBuffer.toString("base64");
		const mimeType = "image/png"; // Simply assuming png for simplicity, or use checking logic if needed

		const mdContent = fs.readFileSync(mdPath, "utf8");

		// Simulate delay
		setTimeout(() => {
			res.json({
				success: true,
				imageData: `data:${mimeType};base64,${base64Img}`,
				mdContent: mdContent,
			});
		}, 500);
	} catch (e) {
		res.json({ success: false, error: e.message });
	}
});

// Serve gacha.html as root and explicitly
app.get("/", (_req, res) => {
	res.sendFile(path.join(__dirname, "../gacha.html"));
});
app.get("/gacha.html", (_req, res) => {
	res.sendFile(path.join(__dirname, "../gacha.html"));
});

app.listen(port, () => {
	console.log(`Gacha server listening at http://localhost:${port}`);
	console.log(`Data Root: ${DATA_ROOT}`);
});
