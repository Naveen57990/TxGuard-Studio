# Product Requirements Document (PRD)
## TxGuard Studio: Interactive Web3 Transaction Decompiler & Smart Contract Security Studio

### 1. Executive Summary
- **Product Name**: TxGuard Studio
- **Version**: v1.0.0
- **Target Competition**: 3rd-Web-Hack on Devpost ($750 USDT Prize Pool)
- **Primary Problem**: Over 95% of Web3 phishing drains, exploits, and losses stem from "Blind Signing" and unverified smart contract logic. Users are prompted with obscure hex payloads, while independent builders lack rapid, in-browser static analysis tools to verify invariant safety before deployment.
- **Core Value Proposition**: An entirely interactive, client-side Web3 studio that decompiles arbitrary raw EVM calldata into plain-English explanations, performs multi-invariant Solidity static audits, and simulates transaction execution state diffs and gas costs with zero wallet lock-in.

---

### 2. User Persona & Problem Scenarios
1. **Web3 End Users & DAO Signers**:
   - *Pain Point*: Blindly approving transactions on MetaMask without knowing if it's an innocent swap or an unlimited permit drain.
   - *Solution*: Paste raw hex calldata into TxGuard to receive instant plain-English translation ("⚠️ Warning: Grants unlimited allowance to transfer all your USDC").
2. **Smart Contract Developers & Auditors**:
   - *Pain Point*: Need a zero-friction environment to test Solidity contracts for reentrancy, `tx.origin` vulnerabilities, and zero-slippage sandwich risks without configuring local nodes or deploying to testnets.
   - *Solution*: Interactive code workspace with line-by-line findings, live security scoring, and 1-click automated remediation patches.
3. **Hackathon Judges (Rishabh Jain)**:
   - *Expectation*: A complete, production-ready web application where they can test their **own** custom contracts and hex payloads—not a static, hardcoded dashboard mockup.

---

### 3. Core Functional Modules

#### Module A: EVM Calldata Decompiler (Zero Blind Signatures)
- **4-Byte Selector Extraction**: Automatically parses the leading 8 hex characters (`0x...`) and matches against standard ERC-20, ERC-721, Uniswap V2/V3 Router, EIP-2612 Permit, and Gnosis Safe methods.
- **32-Byte Parameter Unpacking**: Decodes padded ABI arguments (addresses, uint256 token amounts, timestamps, ECDSA signatures) into structured tables.
- **Plain-English Human Translation**: Generates concise, non-jargon explanations of what the transaction actually does.
- **Threat Detection**: Flags unlimited token allowances (`type(uint256).max`), permit phishing signatures, and unindexed spender addresses.

#### Module B: Solidity Smart Contract Studio
- **Interactive Code Workspace**: Syntax-aware code editor supporting free typing, custom snippet pasting, and `.sol` file uploads.
- **Static Invariant Engine**: Client-side AST analysis checking for:
  1. Checks-Effects-Interactions (CEI) violations (Reentrancy)
  2. Insecure authorization via `tx.origin`
  3. Unchecked ERC-20 return values (USDT non-standard transfers)
  4. Zero minimum output bounds in AMM swaps (MEV sandwich risk)
  5. Missing zero-address guards on privileged addresses
- **Dynamic Scoring Meter**: Real-time 0–100 security health score with clear tier badges (SECURE, WARNING, CRITICAL RISK).
- **1-Click Patch Diff Engine**: Generates and applies OpenZeppelin-compliant remediation directly to the workspace.

#### Module C: Execution Flow & Gas Simulator
- **Dynamic Parameter Controls**: Interactive sliders for Base Gas Price (Gwei: 5–150), Slippage Tolerance (0.1%–10.0%), and Attack Mode toggle.
- **State Transition Summary**: Real-time calculation of gas costs in USD and ETH.
- **Net Token Balance Sheet Delta**: Clear tabular view of assets sent, received, or drained.
- **Step-by-Step Execution Trace**: Visual DAG of signature verification, allowance checks, AMM constant-product routing, and event emissions.

---

### 4. Technical Specifications
- **Client Runtime**: Pure modern ES6+ JavaScript, CSS3, HTML5
- **Styling & Design System**: Tailwind CSS with custom obsidian palette (`#07090e`), JetBrains Mono for code elements, Plus Jakarta Sans for UI
- **Deployment**: Vercel Serverless Static Edge (Global CDN)
- **Testing**: Python automated test suite (`unittest`) + Playwright headless browser test suite
