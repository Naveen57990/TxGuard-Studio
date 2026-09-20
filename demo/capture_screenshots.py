"""
Captures high-resolution presentation screenshots for Devpost gallery and README.
"""

import os
from playwright.sync_api import sync_playwright

def capture():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out_dir = os.path.join(base_dir, "submission_images")
    os.makedirs(out_dir, exist_ok=True)
    html_path = f"file://{os.path.join(base_dir, 'web', 'index.html')}"

    print(f"Capturing presentation screenshots from {html_path}...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(html_path)
        page.wait_for_timeout(1000)

        # 1. Calldata Decompiler Tab
        page.screenshot(path=os.path.join(out_dir, "01_calldata_decompiler.png"))
        print("Captured 01_calldata_decompiler.png")

        # 2. Smart Contract Studio Tab
        page.click("#tab-contract-btn")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(out_dir, "02_contract_studio.png"))
        print("Captured 02_contract_studio.png")

        # 3. Execution Flow Simulator Tab
        page.click("#tab-simulator-btn")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(out_dir, "03_execution_simulator.png"))
        print("Captured 03_execution_simulator.png")

        # 4. Thumbnail (Square 600x600)
        thumb_page = browser.new_page(viewport={"width": 800, "height": 800})
        thumb_page.goto(html_path)
        thumb_page.wait_for_timeout(500)
        thumb_page.screenshot(path=os.path.join(out_dir, "txguard_thumbnail.png"))
        print("Captured txguard_thumbnail.png")

        browser.close()
    print("All screenshots generated successfully in submission_images/")

if __name__ == "__main__":
    capture()
