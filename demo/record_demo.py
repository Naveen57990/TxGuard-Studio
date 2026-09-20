"""
Automated 1080p Screen Recording for TxGuard Studio using Playwright and ffmpeg.
Times all UI interactions to match the 101-second voiceover narration.
"""

import os
import time
import subprocess
from playwright.sync_api import sync_playwright

def record():
    demo_dir = os.path.abspath(os.path.dirname(__file__))
    web_dir = os.path.abspath(os.path.join(demo_dir, "..", "web"))
    html_path = f"file://{os.path.join(web_dir, 'index.html')}"
    raw_video_dir = os.path.join(demo_dir, "raw_recordings")
    os.makedirs(raw_video_dir, exist_ok=True)

    print("Launching Playwright browser with 1080p viewport...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=raw_video_dir,
            record_video_size={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        page.goto(html_path)
        page.wait_for_timeout(1500)

        # Scene 1: Introduction (0 - 15s)
        print("Scene 1: Introduction & App Overview...")
        page.mouse.move(960, 300)
        page.wait_for_timeout(4000)
        page.mouse.wheel(0, 200)
        page.wait_for_timeout(4000)
        page.mouse.wheel(0, -200)
        page.wait_for_timeout(5500)

        # Scene 2: Calldata Decompiler in Action (15 - 42s)
        print("Scene 2: Calldata Decompiler...")
        # Show plain english box and risk alert
        page.mouse.move(960, 480)
        page.wait_for_timeout(3000)
        page.mouse.wheel(0, 300)
        page.wait_for_timeout(4000)

        # Select EIP-2612 Permit Drain
        page.select_option("#calldata-presets", "permit_phishing_drain")
        page.wait_for_timeout(3500)
        page.mouse.wheel(0, 150)
        page.wait_for_timeout(4000)

        # Type custom calldata
        page.mouse.wheel(0, -450)
        page.wait_for_timeout(1000)
        custom_hex = "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000f4240"
        page.fill("#calldata-input", custom_hex)
        page.wait_for_timeout(1500)
        page.click("#decode-btn")
        page.wait_for_timeout(5000)

        # Scene 3: Smart Contract Studio (42 - 75s)
        print("Scene 3: Smart Contract Studio & 1-Click Patching...")
        page.click("#tab-contract-btn")
        page.wait_for_timeout(3000)

        # Highlight code editor and findings
        page.mouse.move(500, 450)
        page.wait_for_timeout(4000)
        page.mouse.move(1400, 350)
        page.wait_for_timeout(4000)

        # Apply security patch!
        page.click("#apply-patch-btn")
        page.wait_for_timeout(4000)

        # Switch to tx.origin scenario
        page.select_option("#contract-presets", "insecure_tx_origin")
        page.wait_for_timeout(3500)
        page.click("#apply-patch-btn")
        page.wait_for_timeout(4000)

        # Click export report
        page.click("#export-report-btn")
        page.wait_for_timeout(4500)

        # Scene 4: Visual Execution & Gas Simulator (75 - 98s)
        print("Scene 4: Execution Flow & Gas Simulator...")
        page.click("#tab-simulator-btn")
        page.wait_for_timeout(3000)

        # Adjust gas slider
        page.fill("#gas-slider", "85")
        page.wait_for_timeout(3500)

        # Adjust slippage slider
        page.fill("#slippage-slider", "2.5")
        page.wait_for_timeout(3500)

        # Toggle Attack Mode!
        page.evaluate("document.getElementById('attack-toggle').click()")
        page.wait_for_timeout(4500)
        page.mouse.wheel(0, 300)
        page.wait_for_timeout(4500)

        # Toggle Attack Mode off
        page.evaluate("document.getElementById('attack-toggle').click()")
        page.wait_for_timeout(4000)

        # Scene 5: Outro & Conclusion (98 - 103s)
        print("Scene 5: Outro & Open Source...")
        page.click("#tab-calldata-btn")
        page.mouse.wheel(0, -300)
        page.wait_for_timeout(5000)

        # Close page and context to finalize video recording
        video_path = page.video.path()
        page.close()
        context.close()
        browser.close()

    print(f"Playwright video recorded at: {video_path}")

    # Merge video and audio with ffmpeg
    final_output = os.path.join(demo_dir, "txguard_demo.mp4")
    audio_path = os.path.join(demo_dir, "voiceover.mp3")

    print(f"Merging video and voiceover into {final_output}...")
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        final_output
    ]
    subprocess.run(cmd, check=True)
    print(f"FINAL DEMO VIDEO READY: {final_output}")

if __name__ == "__main__":
    record()
