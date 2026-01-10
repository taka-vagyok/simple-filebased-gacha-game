import re
from playwright.sync_api import sync_playwright, expect
import time

def verify_gacha_frontend(page):
    # Inject mock for google.script.run
    page.add_init_script("""
        window.google = {
          script: {
            run: {
              withSuccessHandler: function(successHandler) {
                this.successHandler = successHandler;
                return this;
              },
              withFailureHandler: function(failureHandler) {
                this.failureHandler = failureHandler;
                return this;
              },
              getGachaData: function(folder) {
                console.log('getGachaData called with', folder);
                setTimeout(() => {
                    if (this.successHandler) {
                         this.successHandler({
                            success: true,
                            yaml: "- id: 1\\n  name: 伝説の剣\\n  weight: 10\\n  image: sword.png\\n  description: sword.md\\n- id: 2\\n  name: 回復薬\\n  weight: 90\\n  image: potion.png\\n  description: potion.md"
                         });
                    }
                }, 500);
              },
              getItemAsset: function(folder, img, desc) {
                 console.log('getItemAsset called with', folder, img, desc);
                 // Delay must be less than animation time (2000ms) to test synchronization
                 // Or we can test if it waits for 2000ms even if data is fast
                 setTimeout(() => {
                    if (this.successHandler) {
                         this.successHandler({
                            success: true,
                            imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                            mdContent: "# アイテム詳細\\nこれは**素晴らしい**アイテムです。"
                         });
                    }
                 }, 500);
              }
            }
          }
        };
    """)

    # Navigate to the page
    page.goto("http://localhost:8000/gacha.html")

    # 1. Verify Title
    heading = page.get_by_role("heading", level=1)
    expect(heading).to_have_text("お楽しみガチャ")
    print("Title verified.")

    # 2. Verify SVG Machine Presence
    machine_svg = page.locator("svg#machine")
    expect(machine_svg).to_be_visible()
    print("SVG Machine verified.")

    # 3. Verify Button Initial State (Disabled)
    button = page.locator("#btn-pull")
    expect(button).to_have_text("ガチャを回す！")
    expect(button).to_be_disabled()
    print("Button initial state verified (disabled).")

    # Take screenshot of initial state
    page.screenshot(path="verification/initial_state.png")

    # 4. Verify Button Enabled after Data Load (simulated by mock)
    expect(button).to_be_enabled(timeout=2000)
    print("Button enabled state verified.")

    # Take screenshot of enabled state
    page.screenshot(path="verification/enabled_state.png")

    # --- Animation & Logic Verification ---

    # 5. Click Spin Button
    start_time = time.time()
    button.click()
    print("Button clicked.")

    # 6. Verify Immediate State (Animation Started)
    expect(button).to_be_disabled()

    machine = page.locator("#machine")
    expect(machine).to_have_class(re.compile(r"animate-shake"))

    capsule = page.locator("#capsule")
    expect(capsule).to_have_class(re.compile(r"capsule-appear"))

    loading = page.locator("#loading")
    expect(loading).to_be_visible()

    print("Animation started verified.")
    page.screenshot(path="verification/animating_state.png")

    # 7. Verify Wait (Should wait at least 2 seconds)
    # Check at 1.5s: animation should still be active
    time.sleep(1.5)
    expect(capsule).to_have_class(re.compile(r"capsule-appear"))
    print("Animation persistence verified.")

    # 8. Verify Completion (After ~2s + small buffer)
    # The JS logic waits 2000ms.
    # We allow some buffer for playwright check.

    # Wait for result content to appear
    result_content = page.locator("#result-content")
    expect(result_content).to_be_visible(timeout=5000) # Give enough buffer

    elapsed = time.time() - start_time
    print(f"Result appeared after {elapsed:.2f} seconds")

    if elapsed < 2.0:
        raise Exception("Animation finished too early! It should wait at least 2 seconds.")

    # Verify final state
    expect(machine).not_to_have_class(re.compile(r"animate-shake"))
    expect(capsule).not_to_have_class(re.compile(r"capsule-appear"))
    expect(loading).to_be_hidden()

    # Verify Smoke Class (it might disappear quickly, but let's check if it was added)
    # Smoke animation is 0.5s. It might be hard to catch if we are late, but we can check if the element exists.
    smoke = page.locator("#smoke")
    # In the JS, we add 'smoke-pop' class.
    expect(smoke).to_have_class(re.compile(r"smoke-pop"))

    item_name = page.locator("#item-name")
    expect(item_name).to_have_text(re.compile(r"伝説の剣|回復薬"))

    expect(button).to_be_enabled()
    expect(button).to_have_text("もう一度回す")

    print("Result state verified.")
    page.screenshot(path="verification/result_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_gacha_frontend(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
