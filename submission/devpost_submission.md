# 3rd-Web-Hack Devpost Submission: TxGuard Studio

**Tagline**: The Interactive Web3 Transaction Decompiler & Smart Contract Security Studio

---

## Inspiration

Every day, crypto users and decentralized autonomous organizations (DAOs) lose millions of dollars to phishing drainers and smart contract logic flaws. In almost every incident, the root cause is **"Blind Signing"**: when a transaction prompt appears in MetaMask or a hardware wallet, the user is greeted with a cryptic 68-character hex string or an opaque contract method. Users click "Sign" without understanding what tokens are leaving their balance or what perpetual permissions they are granting.

At the same time, independent Web3 builders and solo developers often lack lightweight, zero-setup tools to test their Solidity contract invariants before deployment. Setting up heavy local testnets or paying mainnet gas to test simple edge cases creates unnecessary friction. 

We built **TxGuard Studio** to bridge this gap: an intuitive, fully interactive, in-browser studio that transforms cryptic EVM transactions into plain, understandable English and provides instant security audits for Solidity code—empowering both everyday users and smart contract developers with total visibility and control.

---

## What it does

TxGuard Studio is a complete, client-side Web3 transaction decompiler and smart contract security workspace featuring three dedicated tools:

1. **🔍 Zero-Blind-Signing Calldata Decompiler**:
   - **Any Raw Calldata Input**: Users and judges can paste any raw EVM hex string (`0x...`) from Etherscan, MetaMask, or suspicious prompts.
   - **Method Selector & ABI Decoding**: Instantly extracts the 4-byte selector (e.g., `approve`, `transfer`, `permit`, `multicall`) and unrolls 32-byte arguments into structured, readable tables.
   - **Plain-English Human Translation**: Translates complex transaction logic into natural human language (e.g., *"Grants address 0x68b3... unlimited permission to withdraw all your USDC tokens"*).
   - **Threat Warning Engine**: Flags critical phishing signatures like unlimited token allowances (`type(uint256).max`) and gasless EIP-2612 permit drainers.

2. **🛡️ In-Browser Solidity Smart Contract Studio**:
   - **Custom Code Workspace**: Judges and developers can type directly, paste custom Solidity snippets, or upload `.sol` files from their computers.
   - **Static Invariant Audit**: Automatically inspects source code for 5 critical security invariants: Reentrancy (Checks-Effects-Interactions violations), insecure `tx.origin` authentication, unchecked ERC-20 return values (USDT non-standard transfers), zero-address parameter oversights, and zero-slippage MEV sandwich vulnerabilities.
   - **Interactive Security Health Score**: Real-time 0–100 score meter with visual risk tiers (SECURE, WARNING, CRITICAL RISK).
   - **1-Click Auto Remediation**: Generates a side-by-side patch diff and applies secure refactorings with one click.
   - **Downloadable Audit Reports**: Exports full markdown security assessment documents.

3. **⚡ Dynamic Execution Flow & Gas Simulator**:
   - **Real-Time Parameter Controls**: Interactive sliders to adjust Base Gas Price (Gwei) and Slippage Tolerance (0.1% to 10.0%).
   - **Reentrancy Attack Mode Toggle**: Allows judges to toggle attack simulations and witness reentrant balance drainage and trace corruption live.
   - **Net Balance Sheet Delta**: Clear tabular view of assets sent, received, drained, and gas fees in USD and ETH.
   - **Visual Execution Trace**: Step-by-step DAG tracking signature validation, balance verification, router execution, and event emissions.

---

## How we built it

- **Client Architecture**: Built with modern vanilla ES6+ JavaScript, HTML5, and Tailwind CSS. By keeping the core analytical engines entirely in-browser without external server dependencies, TxGuard delivers sub-10ms response times, zero cold starts, and absolute privacy (no sensitive contract drafts or transaction data leaves the browser).
- **Decompiler Engine (`decompiler.js`)**: Implements BigInt-based 32-byte chunk splitting, selector hashing, and pattern recognition for ERC-20, ERC-721, ERC-1155, Uniswap V2/V3 Router, EIP-2612 Permit, and Gnosis Safe multi-sig methods.
- **Static Invariant Engine (`analyzer.js`)**: AST and regex-based pattern matching verifying Checks-Effects-Interactions call order, authorization variables, and token transfer safety.
- **Simulation Engine (`simulator.js`)**: Calculates dynamic EIP-1559 gas economics, slippage tolerances, and token balance deltas across simulated actors.
- **Automated Verification**: Backed by a 10-test automated Python test suite (`test_txguard.py`) and Playwright headless browser test suites ensuring 100% functional reliability.
- **Deployment**: Deployed globally on Vercel Edge CDN.

---

## Challenges we ran into

1. **Handling Padded ABI Encodings**: Correctly parsing dynamic ABI encodings (such as arrays in `path` or variable-length byte arrays in `multicall`) in a pure client-side environment required careful 32-byte boundary alignments and BigInt conversions.
2. **Plain-English Context Generation**: Translating raw function parameters into meaningful human explanations was nuanced. We had to ensure that warnings clearly distinguished between standard transfers, safe allowances, and catastrophic unlimited approvals without sounding robotic.
3. **Seamless File Handling & Editing**: Implementing a zero-lag textarea editor that supports drag-and-drop `.sol` file uploads while continuously updating the security score and pinpointing exact line numbers without freezing the DOM.

---

## Accomplishments that we're proud of

- **Truly Interactive Judge Experience**: Rather than a static prototype with hardcoded values, judges can test their **own** Solidity code, upload their own `.sol` files, and paste their own raw calldata hex strings.
- **Zero-Barrier Accessibility**: Created a fully functional Guest Mode with preloaded real-world exploit benchmarks so anyone can test the app immediately without connecting a browser wallet or paying testnet gas.
- **Sub-10ms In-Browser Audit**: Delivering instant vulnerability analysis and 1-click remediation without requiring local compiler chains or heavy dependencies.
- **10/10 Test Suite**: Comprehensive automated verification covering all decompiler cases, security rules, and state simulations.

---

## What we learned

- **EIP-2612 Permit Mechanics**: Deepened our understanding of gasless permit signatures and why they have become the weapon of choice for modern phishing drainers.
- **Human-Centric Security**: Security tools fail when they drown users in mathematical formulas or cryptographic jargon. Clear, actionable, and visual feedback is essential for real-world safety.

---

## What's next for TxGuard Studio

- **Browser Extension Integration**: Porting the TxGuard decompiler into a Chrome/Brave extension that automatically intercepts MetaMask signature popups and presents the plain-English risk breakdown inline.
- **Multi-Chain RPC Simulation**: Connecting to Tenderly or local Anvil forks to simulate arbitrary mainnet contract states directly from transaction hashes.
- **Vyper & Rust (Solana) Support**: Expanding the static analysis engine to audit Vyper smart contracts and Solana Anchor programs.

---

## Built With

- `JavaScript (ES6+)`
- `HTML5`
- `Tailwind CSS`
- `Python 3.14`
- `Playwright`
- `Edge-TTS`
- `Vercel`
- `Git / GitHub`
