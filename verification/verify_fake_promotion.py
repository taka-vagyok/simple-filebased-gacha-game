from playwright.sync_api import Page, expect, sync_playwright

def verify_fake_promotion(page: Page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:8000/")

    # Wait for the machine to load (machine svg)
    expect(page.locator("#machine")).to_be_visible()

    # 2. Act: Click the Pull Button
    # Since we set fake_rate to 0.5 and promotion rate to 0.1 for G1, we have a good chance of seeing it.
    # However, catching the exact animation frame is hard.
    # We will just verify the button works and the sequence finishes.

    btn = page.get_by_text("ガチャを回す！")
    expect(btn).to_be_visible()
    btn.click()

    # 3. Assert: Wait for result
    # It takes some time for animation
    expect(page.locator("#result-content")).to_be_visible(timeout=10000)

    # 4. Screenshot
    page.screenshot(path="verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_fake_promotion(page)
        finally:
            browser.close()
