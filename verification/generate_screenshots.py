import re
from playwright.sync_api import sync_playwright, expect
import time
import os

def generate_screenshots(page):
    # Enable console logging
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
    page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

    # Navigate to the local server
    print("Navigating to localhost:8000...")
    page.goto("http://localhost:8000")

    # 1. Wait for Title
    heading = page.get_by_role("heading", level=1)
    expect(heading).to_have_text("お楽しみガチャ")

    # Check if machine-container exists
    if page.locator("#machine-container").count() == 0:
        print("ERROR: #machine-container not found in DOM")
    else:
        print("#machine-container found")

    # Wait for Machine SVG to be injected
    print("Waiting for svg#machine...")
    # Increase timeout to 30s just in case
    try:
        machine_svg = page.locator("svg#machine")
        expect(machine_svg).to_be_visible(timeout=10000)
        print("svg#machine is visible!")
    except Exception as e:
        print("Timeout waiting for svg#machine.")
        # Debug: dump html of container
        print("Container inner HTML:")
        print(page.locator("#machine-container").inner_html())
        raise e

    # Wait for data load (button enabled)
    button = page.locator("#btn-pull")
    expect(button).to_be_enabled(timeout=10000)

    # Screenshot
    machine_container = page.locator("#machine-container")
    time.sleep(1)
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
