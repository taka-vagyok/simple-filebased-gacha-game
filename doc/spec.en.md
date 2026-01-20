# Specification: Kids Gacha App (v3.0)

This document defines the behavior of the Gacha App using Google Apps Script (GAS) and Google Drive.

## Terminology
- **Client**: Web app in the browser (HTML/JS)
- **Server**: Google Apps Script (GAS) or Node.js server in Docker container
- **Drive**: Google Drive (Data source)

---

# Feature: Data Structure and File Organization
  The app loads settings and resources from a folder structure on Google Drive.

  Spec: File Organization
    Each gacha folder (e.g., `gacha1/`) must contain the following two configuration files:
    1. **`gacha.yaml`**: Defines "rules" such as gacha metadata, grade definitions, and promotion probabilities.
    2. **`items.yaml`**: Defines the list of items to be discharged and the grade each item belongs to.

---

# Feature: Initial Display and Data Loading
  When the user opens the gacha screen, the Server loads the configuration from the specified gacha folder.

  Scenario: Loading Configuration Files (getGachaData)
    IF API `getGachaData('gacha1')` is called
    THEN Server reads `gacha.yaml` and `items.yaml` in the `gacha1` folder
    AND returns an object in the following format:
    ```json
    {
      "success": true,
      "gachaYaml": "...(content of gacha.yaml)...",
      "itemsYaml": "...(content of items.yaml)..."
    }
    ```

    IF Client receives the response
    THEN Parse the two YAMLs and combine grade settings and item lists to build the internal database

---

# Feature: Gacha Lottery Logic (Chain Promotion)
  Perform lottery and promotion judgment based on probability settings defined in `gacha.yaml`.

  Scenario: Lottery Execution Flow
    GIVEN `promotion` (next_grade, rate) is defined for each grade in `gacha.yaml`

    IF User spins the gacha
    # 1. Base Lottery
    THEN Provisionally select one item based on `weight` in `items.yaml`
    AND Get the `grade` of that item (e.g., "G1")

    # 2. Chain Promotion Loop (Synchronized with Animation)
    Loop Start:
      Execute animation (capsule discharge) corresponding to the current grade

      IF `promotion` setting exists for the current grade
      THEN Perform promotion judgment based on `rate` (probability)

      IF Promotion is won
      THEN Show "Promotion Effect"
      AND Change grade to `next_grade` (e.g., "G2")
      AND Return to the start of the loop and redo animation with the new grade

      IF Promotion is lost
      THEN Perform fake promotion judgment (`fake_rate`)

      IF Fake promotion is won
      THEN Show "Promotion Effect" (but capsule color does not change, and grade is maintained)
      AND End loop and proceed to result display

      IF Fake promotion is also lost
      THEN End loop and proceed to result display

    # 3. Item Re-selection
    IF Final grade is determined (e.g., promoted from G1 -> G3)
    THEN Randomly re-select an item belonging to the confirmed grade ("G3") from `items.yaml` based on `weight`
    AND Use that item as the final result

---

# Feature: Gacha Animation
  Perform animation based on `color` definition and grade in `gacha.yaml`.
  Do not hardcode capsule colors; use settings values from YAML.

  Scenario: Dynamic Animation Settings (Loop Animation)
    IF Lottery result (initial) is "G1" (blue) and later promoted to "G2" (red)

    1. Machine shakes, and a blue capsule ("blue") is discharged
    2. "Promotion" effect occurs just before the capsule opens
       * The machine's lamps and energy glow flash rapidly
    3. Capsule disappears (reset), and machine starts shaking again
    4. This time, a red capsule ("red") is discharged
    5. (If no further promotion) Capsule opens, and item is displayed

---

# Note to Engineers
*   **GAS / Node.js Dual Support**: `getGachaData` must maintain the same interface in both GAS environment and local Node.js environment.
*   **Async Processing**: Pay attention to timing control of animation and data fetching (Promise control).

# Feature: Security (v3.0.1 Added)
  To enhance the robustness of the application, the following security measures are implemented.

  Spec: Path Traversal Prevention (Server)
    The Server must validate the requested file path in `getGachaData` and `getItemAsset` APIs.

    IF parameters (`folder`, `image`, etc.) contain parent directory traversal (`..`) or attempt to access outside `DATA_ROOT`
    THEN Server must return an error and must not return the file content.

  Spec: Static File Access Restriction (Server)
    The Server must only expose resources under `gacha_data/` and the minimal JS files necessary for the app to run.
    Direct access to server source code (`server.js`) or configuration files (`package.json`) must be prohibited (404 Not Found).

  Spec: XSS (Cross-Site Scripting) Prevention (Client)
    The Client must sanitize the HTML converted from Markdown before displaying it.

    IF `items.yaml` or Markdown files contain malicious code such as `<script>` tags
    THEN `DOMPurify` or similar must be used to neutralize them and prevent script execution.
