const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const app = express();
const port = 8000;

// Configurable data path (defaults to ../gacha_data relative to this script)
const DATA_ROOT =
	process.env.DATA_ROOT || path.join(__dirname, "../gacha_data");

// Request Logging Middleware (Before static files)
app.use((req, _res, next) => {
	console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
	next();
});

app.use(express.static(path.join(__dirname, "..")));

// Enable JSON parsing
app.use(express.json());

// API: Get Gacha Data (gacha.yaml & items.yaml)
app.get("/api/getGachaData", (req, res) => {
	const folderName = req.query.folder || "gacha1";
	const gachaYamlPath = path.join(DATA_ROOT, folderName, "gacha.yaml");
	const itemsYamlPath = path.join(DATA_ROOT, folderName, "items.yaml");

	try {
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

	const folderPath = path.join(DATA_ROOT, folderName);
	const imgPath = path.join(folderPath, imgName);
	const mdPath = path.join(folderPath, mdName);

	try {
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

// Serve gacha.html as root
app.get("/", (_req, res) => {
	res.sendFile(path.join(__dirname, "../gacha.html"));
});

app.listen(port, () => {
	console.log(`Gacha server listening at http://localhost:${port}`);
	console.log(`Data Root: ${DATA_ROOT}`);
});
