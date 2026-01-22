# Test Design Document

This document describes the testing policy and verification procedures for quality assurance in this project.

## 1. Testing Policy
This application guarantees quality through two layers: **Unit Tests** (logic verification) and **E2E Tests** (UI/Integration verification).
The CI/CD pipeline (GitHub Actions) automatically executes these tests upon code changes.

## 2. Test Environment

Directory Structure:
- `tests/unit`: Unit test code
- `tests/e2e`: E2E test code

### 2.1. Unit Test Environment
*   **Target**: `gacha-logic.js` (Core logic such as probability calculation and promotion checks)
*   **Tool**: **Jest**
*   **Execution**:
    ```bash
    npm test
    ```
    * Coverage reports are generated automatically.

### 2.2. E2E Test Environment
*   **Target**: Entire application (Frontend + Backend integration)
*   **Tool**: **Playwright** (Node.js)
*   **Execution Environment**: Local server via Docker Compose (`http://localhost:8000`)
*   **Execution**:
    ```bash
    # Start Application
    cd docker && docker-compose up -d --build

    # Run Tests
    npm run test:e2e
    ```

**Faster & Deterministic Testing**:
E2E tests utilize the following techniques to improve stability and execution speed.
- **API Mocking**: Mocks server responses to eliminate latency and allow testing of arbitrary gacha data.
- **Animation Skipping**: Overrides the `window.wait` function to skip animation wait times.
- **Randomness Override**: Mocks `Math.random` to test probabilistic behaviors (like promotions) deterministically.
- **State Tracking Hooks**: Monitors the `data-gacha-status` attribute of the `body` element (e.g., `idle`, `shaking`, `result_shown`) to perform stable captures and validations based on animation progress.

## 3. Test Scenarios

### 3.1. Unit Tests (Logic)
*   **Weighted Draw (`drawItemByWeight`)**:
    *   Verifies if items are selected according to probability based on weights (using `Math.random` mock).
    *   Behavior in edge cases (empty lists, total weight 0, etc.).
*   **Promotion Check (`checkPromotion`)**:
    *   Verifies if promotion occurs below the set probability.
    *   Verifies if promotion does not occur above the probability.

### 3.2. E2E Tests (UI/Integration)
#### Scenario: Standard Gacha Execution Flow
1.  **Initial Display**:
    *   **Logic File Loading Verification**: `gacha-logic.js` is loaded successfully (Status 200).
    *   Title "Legendary Equipment Gacha" is displayed.
    *   Gacha machine (SVG) is loaded and displayed.
    *   "Spin Gacha" button is enabled (data loading complete).
2.  **Execution**:
    *   After button press, the button is disabled.
    *   Machine shaking animation (`.animate-shake`) occurs.
    *   (On Promotion) Machine lamps and energy light flash intensely.
3.  **Result Display**:
    *   After a set time, the result screen is displayed.
    *   Item name and image are displayed.
    *   "Spin Again" button is displayed.

### 3.3. Security Tests (v3.0.1 Added)
Test cases to verify application vulnerabilities.

#### Test Case: Path Traversal (Server)
*   **Verification Content**:
    *   Send request like `folder=../docker` to `api/getGachaData`.
    *   Send request like `image=../../../etc/passwd` to `api/getItemAsset`.
*   **Expected Result**:
    *   Server returns an error (JSON format or 400/500 series error) and does not return raw file data.
    *   Unauthorized access is recorded in console logs (optional).

#### Test Case: Static File Access Restriction (Server)
*   **Verification Content**:
    *   Directly access `/docker/server.js` or `/package.json` from the browser.
*   **Expected Result**:
    *   HTTP 404 Not Found is returned.

#### Test Case: XSS Protection (Client)
*   **Verification Content**:
    *   Inject data containing `<script>alert('XSS')</script>` into `items.yaml` or Markdown as a mock.
    *   Display the gacha result screen.
*   **Expected Result**:
    *   The alert is not displayed.
    *   The `<script>` tag is removed or escaped in the DOM.

## 4. CI/CD (GitHub Actions)
The following workflows are defined (`.github/workflows/test.yml`).

1.  **Unit Tests**: Execute `npm test`.
2.  **Docker Setup**: Start server with `docker-compose`.
3.  **E2E Tests**: Execute `npm run test:e2e`.
4.  **Artifacts**: Save screenshots and coverage reports on test failure.
