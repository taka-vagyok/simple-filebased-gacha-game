import re
from playwright.sync_api import sync_playwright, expect

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
                 setTimeout(() => {
                    if (this.successHandler) {
                         this.successHandler({
                            success: true,
                            imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                            mdContent: "# アイテム詳細\\nこれは**素晴らしい**アイテムです。"
                         });
                    }
                 }, 1000);
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

    # 2. Verify Button Initial State (Disabled)
    button = page.locator("#btn-pull")
    expect(button).to_have_text("ガチャを回す！")
    expect(button).to_be_disabled()
    print("Button initial state verified (disabled).")

    # Take screenshot of initial state
    page.screenshot(path="verification/initial_state.png")

    # 3. Verify Button Enabled after Data Load (simulated by mock)
    expect(button).to_be_enabled(timeout=2000)
    print("Button enabled state verified.")

    # Take screenshot of enabled state
    page.screenshot(path="verification/enabled_state.png")

    # --- Feature #2 Verification ---

    # 4. Click Spin Button
    button.click()
    print("Button clicked.")

    # 5. Verify Immediate State (Animation, Disabled, Loading)
    expect(button).to_be_disabled()

    machine = page.locator("#machine")
    expect(machine).to_have_class(re.compile(r"animate-shake"))

    loading = page.locator("#loading")
    expect(loading).to_be_visible()

    print("Spinning state verified.")
    page.screenshot(path="verification/spinning_state.png")

    # 6. Verify Result State (after delay)
    # The mock waits 1000ms.
    result_content = page.locator("#result-content")
    expect(result_content).to_be_visible(timeout=3000)

    expect(machine).not_to_have_class(re.compile(r"animate-shake"))
    expect(loading).to_be_hidden()

    item_name = page.locator("#item-name")
    name_text = item_name.text_content()
    # Should be one of the mocked items
    assert name_text in ["伝説の剣", "回復薬"], f"Unexpected item name: {name_text}"

    item_img = page.locator("#item-img")
    expect(item_img).to_have_attribute("src", re.compile(r"^data:image/"))

    item_desc = page.locator("#item-desc")
    # Verify markdown was rendered (check for HTML tag or text content)
    # The mock returns "**素晴らしい**". marked should render it as <strong> or similar?
    # Or just check text.
    expect(item_desc).to_contain_text("素晴らしいアイテム")

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
