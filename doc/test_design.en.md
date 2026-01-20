# Test Design Document

This document describes the test strategy and verification procedures for quality assurance of this project.

## 1. Test Strategy
This application operates in two different environments: Docker container and Google Apps Script (GAS).
Testing in the Docker environment (local execution) will primarily focus on **End-to-End (E2E) testing**.

By automating or manually verifying scenarios similar to actual user operations in a browser, we guarantee the integration of the frontend and backend (`server.js`).

## 2. Test Environment
Tests will generally be conducted against the **Docker Compose environment**, which is equivalent to production.

### Execution Procedure
```bash
cd docker
docker-compose up -d
# Target URL: http://localhost:8000
```

## 3. Test Scenarios
The following items are subject to verification.

### 3.1. Initial Display Confirmation (Smoke Test)
*   **Goal**: Confirm that the application starts correctly and resources are loaded.
*   **Checkpoints**:
    *   HTTP status 200 is returned.
    *   Title defined in `gacha.yaml` (e.g., "Legendary Equipment Gacha") is displayed.
    *   Gacha machine SVG image (`#machine`) is displayed.
    *   No errors in the console.

### 3.2. Data Loading and API Integration
*   **Goal**: Confirm that the frontend can communicate with the backend API (`/api/getGachaData`).
*   **Checkpoints**:
    *   Immediately after page load, "Spin Gacha!" button is **disabled**.
    *   After API communication completes, the button switches to **enabled**.
    *   Configuration from `gacha.yaml` and `items.yaml` mounted via `docker-compose` is correctly loaded.

### 3.3. Gacha Execution Flow & Chain Promotion
*   **Goal**: Confirm user interaction, animation loops, and result consistency.
*   **Procedure**:
    1.  Click "Spin Gacha!" button.
*   **Checkpoints**:
    *   **Animation Loop**:
        *   Machine shakes (`.animate-shake`) -> Capsule appears.
        *   If promoted: "Promotion Chance!" text/effect appears -> The machine's lamps and energy glow flash rapidly -> Capsule disappears -> Loop restarts.
        *   The color of the capsule changes according to the promoted grade (e.g., Blue -> Red).
    *   **Final Result**:
        *   Result screen (`#result-area`) appears eventually.
        *   Item name, image, and description match the final grade's configuration.

### 3.4. Promotion Probability Verification (Manual/Statistical)
*   **Goal**: Verify that promotion occurs roughly according to the rates defined in `gacha.yaml`.
*   **Procedure**:
    *   Modify `gacha.yaml` to set promotion rate to 1.0 (100%) for testing.
    *   Verify that promotion always occurs.
    *   Set rate to 0.0 (0%) and verify that promotion never occurs.

### 3.5. Security Tests (v3.0.1 Added)
Verification cases to ensure application robustness and vulnerability mitigation.

#### Case: Path Traversal (Server)
*   **Verification**:
    *   Send requests to `api/getGachaData` with `folder=../docker`.
    *   Send requests to `api/getItemAsset` with `image=../../../etc/passwd`.
*   **Expected Result**:
    *   Server returns an error (JSON or 400/500 status) and does NOT return raw file content.
    *   Access attempt is logged (optional).

#### Case: Static File Access Restriction (Server)
*   **Verification**:
    *   Access `/docker/server.js` or `/package.json` directly from the browser.
*   **Expected Result**:
    *   HTTP 404 Not Found is returned.

#### Case: XSS Prevention (Client)
*   **Verification**:
    *   Inject malicious data containing `<script>alert('XSS')</script>` into `items.yaml` or Markdown files (via mock or file edit).
    *   Trigger gacha and view result.
*   **Expected Result**:
    *   No alert dialog is shown.
    *   `<script>` tags are removed or escaped in the DOM.

## 4. Automated Testing Implementation Guide (Recommended)
For future integration into CI/CD pipelines, use **Playwright**.

### Sample Code (Python/Playwright)
```python
from playwright.sync_api import sync_playwright, expect
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Access
        page.goto("http://localhost:8000")

        # 2. Initial State
        btn = page.locator("#btn-pull")
        expect(btn).not_to_be_disabled(timeout=5000)

        # 3. Execute
        btn.click()

        # 4. Animation Check
        machine = page.locator("#machine")
        expect(machine).to_have_class(re.compile(r"animate-shake"))

        # 5. Result Wait
        result = page.locator("#result-content")
        expect(result).to_be_visible(timeout=10000)

        browser.close()

if __name__ == "__main__":
    run()
```
