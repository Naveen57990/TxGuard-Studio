# AI Disclosure Statement — TxGuard Studio

## 3rd-Web-Hack Devpost Compliance

### 1. How AI Was Utilized
AI tools (specifically LLM-assisted pair programming) were utilized to assist with:
- Rapid prototyping of regex patterns for EVM 4-byte selector decoding and Solidity Checks-Effects-Interactions (CEI) static analysis.
- Drafting initial UI component wireframes with Tailwind CSS.
- Structuring the test suite and documentation outlines.

### 2. Original Human Contribution & Intellectual Ownership
- **Architecture & System Design**: Conceptualized the three-module security workflow (Calldata Decompiler, Smart Contract Studio, Execution Simulator) and the plain-English translation mechanics.
- **Custom Invariant Rules**: Authored the exact security detection logic for Reentrancy, `tx.origin` phishing, and zero-slippage MEV protection.
- **Interactive Testing Paradigm**: Implemented the live sandbox allowing users and judges to paste custom contracts, upload `.sol` files, and test custom hex calldata.
- **Verification & Deployment**: Executed full manual and automated verification, created the deployment pipeline on Vercel, and authored all project presentations.

### 3. Ethical Statement
All source code and logic in this repository have been independently verified, tested, and validated. No confidential third-party code was copied.
