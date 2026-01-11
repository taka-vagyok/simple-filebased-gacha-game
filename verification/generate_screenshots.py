import re
from playwright.sync_api import sync_playwright, expect
import time
import os

def generate_screenshots(page):
    # Navigate to the local server
    page.goto("http://localhost:8000")

    # 1. Wait for Title and Machine
    heading = page.get_by_role("heading", level=1)
    expect(heading).to_have_text("お楽しみガチャ")

    machine_svg = page.locator("svg#machine")
    expect(machine_svg).to_be_visible()

    # Wait for data load (button enabled)
    button = page.locator("#btn-pull")
    expect(button).to_be_enabled(timeout=5000)

    # Screenshot of the Gacha Machine area specifically
    # We can take a screenshot of the machine element or the whole page
    # The requirement is "include gacha machine image" in readme.
    # Let's take a screenshot of the machine container.

    # Locate the container for the machine (parent div of svg)
    machine_container = page.locator("#machine").locator("..")

    # Ensure fonts are loaded/rendering
    time.sleep(1)

    # Take screenshot
    output_path = "doc/gacha_machine.png"
    machine_container.screenshot(path=output_path)
    print(f"Screenshot saved to {output_path}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            generate_screenshots(page)
        except Exception as e:
            print(f"Screenshot generation failed: {e}")
            raise e
        finally:
            browser.close()
