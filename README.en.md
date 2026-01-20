# Kids Gacha App (v3.0)

![Gacha Machine](doc/gacha_machine.png)

A simple and fun Web Gacha App enjoyable for kids and adults.
It can be easily run in a container environment (Docker) or integrated with Google Drive data using Google Apps Script (GAS).

## Features
*   **New Machine Design (v3.1)**: Rich SVG-based machine design with enhanced visual effects like flashing LEDs!
*   **Animation**: SVG-drawn gacha machine moves! Spins! Pops out!
*   **Configurable Rules**: Define rules, grades, and promotion rates in `gacha.yaml`.
*   **Simple Item Management**: Just list items in `items.yaml` and assign them to grades.
*   **Markdown Support**: Item descriptions can be written in Markdown for rich text display.
*   **Hybrid Architecture**: Supports both local execution in Docker containers and serverless GAS operation.
*   **Enhanced Security (v3.0.1)**: Robustness based on OWASP guidelines, including protection against Path Traversal and XSS.

## How to Play (Docker / Local Execution)

You can spin the gacha on your PC immediately using Docker.

### 1. Preparation
Clone this repository.

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Data Setup
Configure the gacha contents in the `gacha_data/gacha1/` folder.
Sample data (Sword, Potion, etc.) is included by default.

*   **`gacha.yaml`**: Define grades (G1, G2...) and promotion rules.
*   **`items.yaml`**: Define the list of items and their grades.
*   Place image files (`.jpg`/`.png`) and description files (`.md`) in the same folder.

**gacha.yaml Example:**
```yaml
name: "Legendary Gacha"
grades:
  G1:
    color: "blue"
    promotion:
      next_grade: "G2"
      rate: 0.1
```

**items.yaml Example:**
```yaml
- id: 1
  name: "Potion"
  grade: "G1"
  image: "potion.jpg"
  description: "potion.md"
  weight: 100
```

### 3. Launch
Start using Docker Compose.

```bash
cd docker
docker-compose up
```

Access `http://localhost:8000` in your browser.

## How to Play (Google Apps Script)

Procedure for using files on Google Drive as a data source.

1.  **Google Drive Preparation**:
    *   Create a folder named `MyGachaApp` in the root.
    *   Create a `gacha1` folder inside it and upload `gacha.yaml`, `items.yaml`, and images.
2.  **Deploy**:
    *   Push `gacha.js` and `gacha.html` to the GAS project using `clasp` or similar tools.
3.  **Execute**:
    *   Deploy as a Web App and access the issued URL.

## Developer Information

### Directory Structure
```
.
├── gacha.html        # Frontend (Vanilla JS + Tailwind)
├── gacha-logic.js    # Core Logic (Probability/Promotion) - Unit Tested
├── gacha_data/       # Data folder for local execution
│   └── gacha1/       # Gacha Set 1
├── docker/           # Docker related files
│   ├── Dockerfile
│   └── server.js     # Simple server for local execution
├── gacha.js          # Backend code for GAS
├── tests/            # Test Codes (Unit: Jest / E2E: Playwright)
└── doc/              # Documents & Specs
```

### How to Run Tests
```bash
# Install Dependencies
npm install

# Unit Tests (Jest)
npm test

# E2E Tests (Playwright)
# Requires docker-compose up in docker/ directory beforehand
npm run test:e2e
```

### Technical Stack
*   **Frontend**: HTML5, Tailwind CSS, SVG Animation, js-yaml
*   **Backend (Local)**: Node.js, Express
*   **Backend (Cloud)**: Google Apps Script
