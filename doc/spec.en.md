# Specification: Kids' Gacha App (v3.0)

This document defines the behavior of the Gacha App utilizing Google Apps Script (GAS) and Google Drive.

## Terminology
- **Client**: Web application on the browser (HTML/JS)
- **Server**: Google Apps Script (GAS) or Node.js server within a Docker container
- **Drive**: Google Drive (Data Source)

---

# Feature: Data Structure and File Organization
  The app loads settings and resources from a folder structure on Google Drive.

  Spec: File Organization
    Each gacha folder (e.g., `gacha1/`) must have the following two configuration files:
    1. **`gacha.yaml`**: Defines "rules" such as gacha metadata, grade definitions, and promotion rates.
    2. **`items.yaml`**: Defines the list of items to be dispensed and the grade to which each item belongs.

---

# Feature: App Initialization and Data Loading
  When the user opens the gacha screen, the Server loads the configuration from the specified gacha folder.
  The UI displays a gacha machine drawn with inline SVG.

  Scenario: Loading configuration files (getGachaData)
    If the API `getGachaData('gacha1')` is called
    Then the Server reads `gacha.yaml` and `items.yaml` in the `gacha1` folder
    And returns an object in the following format:
    ```json
    {
      "success": true,
      "gachaYaml": "...(content of gacha.yaml)...",
      "itemsYaml": "...(content of items.yaml)..."
    }
    ```

    If the Client receives the response
    Then it parses the two YAML files and combines the grade settings and item list to build an internal database.

---

# Feature: Gacha Execution Flow (v3.2 Update)
  Coordination flow between user actions and animations.

  **Phase 1: Lottery Action**
  1. **Knob Rotation**: When the user clicks the knob, it rotates and the machine body shakes.
  2. **Energy Charge**: The internal light (`#energy-glow`) flickers.

  **Phase 2: Capsule Dispense**
  1. **Appearance**: A new capsule is generated from the exit hole (`#exit-hole`).
  2. **Rolling Animation**: The capsule rotates and enlarges as it moves to the center foreground.

  **Phase 3: Opening and Promotion Check**
  1. **Wait**: The capsule stops at the center and waits for the user's click.
  2. **Opening Action**:
     * **Normal**: Clicking opens the capsule and displays the item.
     * **Promotion**:
       1. Upon clicking, the capsule does not open but shakes.
       2. A crack effect appears on the capsule, and light leaks out.
       3. With sound effects, the capsule color changes (e.g., Blue -> Gold), and the background switches to a luxurious effect.
       4. **Chain Promotion Check**: After the color change, a promotion check for an even higher grade is performed. If won, steps 1-3 repeat (e.g., Blue -> Gold -> Rainbow).
       5. The final grade capsule opens, and the item is displayed.

---

# Feature: Gacha Lottery Logic
  Performs lottery and promotion checks based on probability settings defined in `gacha.yaml`.

  Scenario: Internal Lottery Processing
    If the user spins the gacha
    Then an initial item and grade are determined based on `weight` in `items.yaml` (e.g., "G1").

    In Phase 3 (Opening Action), execute the following loop:
    1. Check the `promotion` setting of the current grade.
    2. Perform a promotion check based on the probability.
    3. **Win**: Execute promotion animation, update the grade, and continue the loop.
    4. **Lose**: Perform a fake promotion check. If a fake win occurs, execute the animation only and end the loop.
    5. **Lose and No Fake**: End the loop and open.

    Based on the finally determined grade, re-draw the item (or maintain if the initial item belongs to the same grade).

---

# Feature: Gacha Animation
  Performs animations based on `color` definitions and grades in `gacha.yaml`.

  Spec: Machine Internal Capsule Display
    Multiple capsules must always be displayed inside the dome of the gacha machine.
    These capsules are predefined colorfully within the SVG asset, and no dynamic refresh processing is performed on the app side.

---

# Note for Engineers
*   **GAS / Node.js Compatibility**: `getGachaData` must maintain the same interface in both the GAS environment and the local Node.js environment.
*   **Asynchronous Processing**: Pay attention to the timing control of animation and data fetching (Promise control).

# Feature: Security (v3.0.1 Added)
  Implement the following security measures to enhance application robustness.

  Spec: Path Traversal Protection (Server)
    The Server must verify the requested file path in `getGachaData` and `getItemAsset` APIs.

    If parameters (`folder`, `image`, etc.) contain parent directory traversal (`..`) or attempt access outside `DATA_ROOT`
    Then the Server returns an error and must not return the file content.

  Spec: Static File Access Restriction (Server)
    The Server exposes only resources under `gacha_data/` and minimal JS files required for app operation.
    Direct access to server source code (`server.js`) or configuration files (`package.json`) is prohibited (404 Not Found).

  Spec: XSS (Cross-Site Scripting) Protection (Client)
    The Client must always sanitize when displaying HTML converted from Markdown.

    If `items.yaml` or Markdown files contain malicious code such as `<script>` tags
    Then use `DOMPurify` or similar to neutralize them and prevent script execution.

# Feature: Documentation Generation
  Automatically generate demo materials (GIF animation) used for README, etc., as part of the development process.

  Spec: GIF Animation Generation
    Prepare a script that uses the E2E test framework (Playwright) to record gacha animations on the browser and save them in GIF format.
    The `npm run generate-gif` command enables regeneration of `doc/gacha_demo.gif`.
