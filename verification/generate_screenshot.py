from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Access
        page.goto("http://localhost:8000")

        # 2. Wait for Load
        expect(page.locator("#btn-pull")).not_to_be_disabled(timeout=10000)

        # 3. Click
        page.click("#btn-pull")

        # 4. Wait for Result (Give time for animation)
        try:
            expect(page.locator("#result-content")).to_be_visible(timeout=15000)
        except:
            print("Timeout waiting for result")
            page.screenshot(path="verification/timeout.png")
            return

        # 5. Take Screenshot
        page.screenshot(path="verification/result.png")
        print("Screenshot saved to verification/result.png")

        browser.close()

if __name__ == "__main__":
    run()
