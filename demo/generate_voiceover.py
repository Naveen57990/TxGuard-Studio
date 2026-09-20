"""
Generates neural voiceover narration for TxGuard Studio demo video using edge-tts.
"""

import asyncio
import os
import edge_tts

SCRIPT = """
Welcome to TxGuard Studio, the interactive Web3 transaction decompiler and smart contract security studio built for the 3rd-Web-Hack.

Over ninety-five percent of crypto phishing drains happen because of blind signing. Users see confusing hex strings in MetaMask without understanding what permissions they are granting.

TxGuard eliminates blind signing. In our Calldata Decompiler, judges and users can paste any raw EVM calldata hex. TxGuard instantly decodes the four-byte selector, unpacks all thirty-two byte parameters, and gives a crystal clear, plain-English translation. When a malicious contract asks for an unlimited allowance to drain your tokens, TxGuard flags it with an immediate critical threat alert.

Next, explore the Smart Contract Studio. Unlike static dashboards, you can type your own Solidity code, paste custom contracts, or upload a dot-sol file directly. Our client-side static engine checks for reentrancy, dangerous tx-origin authentication, and zero-slippage sandwich risks. In just milliseconds, TxGuard pinpoints the exact line number, calculates a security health score, and provides a one-click automated patch to secure your contract.

Finally, test the Execution Flow and Gas Simulator. Adjust live gas prices, tune slippage bounds, and toggle attack simulations to observe reentrancy state corruption and token balance deltas in real time.

TxGuard Studio is completely open-source, fully tested with ten out of ten passing automated tests, and ready to protect the decentralized web. Thank you.
"""

VOICE = "en-US-ChristopherNeural"  # Professional, confident, clear voice

async def main():
    output_path = os.path.join(os.path.dirname(__file__), "voiceover.mp3")
    print(f"Generating voiceover using {VOICE}...")
    communicate = edge_tts.Communicate(SCRIPT, VOICE, rate="+3%", pitch="+0Hz")
    await communicate.save(output_path)
    print(f"Voiceover saved to: {output_path}")

if __name__ == "__main__":
    asyncio.run(main())
