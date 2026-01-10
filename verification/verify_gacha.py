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
                // Simulate success after a short delay if needed,
                // but for initial state verification we don't need to call the callback immediately.
                // If we want to verify the button becomes enabled, we can simulate it later.
                setTimeout(() => {
                    if (this.successHandler) {
                         this.successHandler({
                            success: true,
                            yaml: "- id: 1\\n  name: Test Item\\n  weight: 10\\n  image: test.png\\n  description: test.md"
                         });
                    }
                }, 1000);
              },
              getItemAsset: function(folder, img, desc) {
                 console.log('getItemAsset called');
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
    button = page.get_by_role("button", name="ガチャを回す！")
    expect(button).to_be_disabled()
    print("Button initial state verified (disabled).")

    # Take screenshot of initial state
    page.screenshot(path="verification/initial_state.png")

    # 3. Verify Button Enabled after Data Load (simulated by mock)
    # The mock will call successHandler after 1000ms
    expect(button).to_be_enabled(timeout=2000)
    print("Button enabled state verified.")

    # Take screenshot of enabled state
    page.screenshot(path="verification/enabled_state.png")

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
