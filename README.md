# 🛡️ TxGuard Studio

> **Interactive Web3 Transaction Decompiler & Smart Contract Security Studio**  
> *Built for 3rd-Web-Hack on Devpost ($750 USDT Prize Pool)*

[![Live Web App](https://img.shields.io/badge/Live%20App-Vercel-6366f1?style=for-the-badge&logo=vercel)](https://txguard-studio.vercel.app)
[![Automated Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-10b981?style=for-the-badge&logo=githubactions)](https://github.com/Naveen57990/TxGuard-Studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🎯 What is TxGuard Studio?

Over 95% of Web3 exploits and phishing drains stem from **"Blind Signing"** and **unverified smart contract logic**. When signing transactions in MetaMask or hardware wallets, users are confronted with cryptic hex payloads or low-level signatures without understanding what tokens will leave their balance.

**TxGuard Studio** is a client-side Web3 developer and user security suite that eliminates blind signing and catches smart contract vulnerabilities before deployment:

1. **🔍 Calldata Decompiler**: Paste any raw EVM calldata hex (`0x...`) to decompile 4-byte method selectors, extract structured 32-byte arguments, and read a plain-English human translation of what the transaction actually does.
2. **🛡️ Smart Contract Studio**: Type or paste any Solidity contract (or upload `.sol` files) to run in-browser static invariant audits, detect Reentrancy, `tx.origin` phishing, and MEV sandwich risks, and apply 1-click automated security patches.
3. **⚡ Execution Flow & Gas Simulator**: Adjust gas price and slippage sliders in real time, toggle reentrancy attack simulations, and view dynamic token balance sheet deltas.

---

## 🚀 Key Features

* **Zero Wallet Barrier / Guest Mode**: No browser wallet connection or testnet gas required. Works instantly for all users and judges.
* **100% Interactive User Testing**: Full freedom to input custom calldata hex, paste custom Solidity contracts, or upload local files.
* **Human-Centered Explanations**: Zero unnecessary cryptographic jargon. Explains security risks in plain language.
* **1-Click Remediation**: Side-by-side patch generator that automatically refactors vulnerable Solidity patterns into secure code.
* **Downloadable Security Audit Reports**: Export comprehensive Markdown reports with line-pinpointed findings.

---

## 🧪 Automated Test Results

The core Python engine and JavaScript modules are verified with automated unit and integration test suites:

```bash
python3 -m unittest discover -s txguard/python -p "test_*.py" -v
```

```
test_approve_decompiler_unlimited ... ok
test_auditor_clean_code ... ok
test_auditor_detects_reentrancy ... ok
test_auditor_detects_tx_origin ... ok
test_auditor_detects_zero_slippage ... ok
test_permit_signature_decompiler ... ok
test_short_invalid_calldata ... ok
test_simulator_attack_execution ... ok
test_simulator_normal_execution ... ok
test_transfer_decompiler ... ok

----------------------------------------------------------------------
Ran 10 tests in 0.000s

OK
```

---

## 📦 Project Structure

```
txguard/
├── web/
│   ├── index.html            # Core interactive single-page studio application
│   ├── js/
│   │   ├── app.js            # Reactive application state & DOM coordinator
│   │   ├── decompiler.js     # 4-byte EVM calldata decompiler & ABI decoder
│   │   ├── analyzer.js       # In-browser Solidity AST static security analyzer
│   │   ├── simulator.js      # Execution flow & balance sheet simulator
│   │   └── templates.js      # Curated exploit benchmarks & vulnerable contracts
│   ├── css/
│   │   └── studio.css        # Luxury typography (JetBrains Mono) & styling
│   ├── package.json
│   └── vercel.json
├── python/
│   ├── txguard_core.py       # Standalone Python CLI & analysis engine
│   └── test_txguard.py       # Automated Python test suite (10/10 passed)
├── demo/
│   ├── record_demo.py        # Playwright script for automated 1080p screen capture
│   └── generate_voiceover.py # Edge-TTS natural voice narration script
├── submission/
│   ├── devpost_submission.md # Complete Devpost submission form
│   ├── devpost_submission_brief.md # Quick copy-paste format
│   └── AI_DISCLOSURE.md      # Transparent AI usage disclosure
├── ARCHITECTURE.md
├── PRD.md
└── LICENSE
```

---

## 💻 Quick Start & Local Execution

### 1. View Web Studio
Open `txguard/web/index.html` directly in any modern web browser or serve via:
```bash
python3 -m http.server 3000 --directory txguard/web
```
Navigate to `http://localhost:3000`.

### 2. Run Test Suite
```bash
python3 -m unittest discover -s txguard/python -p "test_*.py"
```

---

## 📜 License
MIT License. Created by [Naveen (Naveen57990)](https://github.com/Naveen57990).
