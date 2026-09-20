# TxGuard Studio — Quick Copy-Paste Devpost Form

## Project Title
TxGuard Studio: Interactive Web3 Transaction Decompiler & Smart Contract Security Studio

## Tagline
Eliminating blind signing and logic vulnerabilities through in-browser transaction decompilation, real-time invariant auditing, and execution simulation.

---

## Inspiration
Every day, Web3 users and DAOs lose millions of dollars to phishing drainers and smart contract logic flaws. In almost every incident, the root cause is "Blind Signing": when a prompt appears in MetaMask or a hardware wallet, users are greeted with cryptic hex strings or obscure methods. They click "Sign" without understanding what tokens will leave their balance or what perpetual permissions they are granting. Independent builders also lack zero-setup tools to test contract logic before deployment. We built TxGuard Studio to bridge this gap with an intuitive, fully interactive, in-browser workspace.

## What it does
TxGuard Studio is a complete, client-side Web3 transaction decompiler and smart contract security workspace:
1. Zero-Blind-Signing Calldata Decompiler: Paste any raw EVM calldata hex (0x...). Instantly decodes 4-byte selectors, unpacks 32-byte arguments into structured tables, and generates plain-English human translations while flagging unlimited approvals and permit drains.
2. In-Browser Solidity Smart Contract Studio: Paste custom code or upload .sol files. Runs client-side static invariant audits for Reentrancy (CEI violations), insecure tx.origin authorization, non-standard ERC-20 transfers, and zero-slippage sandwich risks. Provides real-time 0–100 security scores and 1-click automated remediation patches.
3. Dynamic Execution Flow & Gas Simulator: Adjust gas price and slippage sliders in real time, toggle reentrancy attack simulations, and inspect dynamic net balance sheet deltas and visual trace steps.

## How we built it
Built with modern ES6+ JavaScript, HTML5, and Tailwind CSS. The analytical decompiler and AST static analyzer run entirely in the browser with sub-10ms response times, zero server latency, and 100% data privacy. The simulator calculates dynamic EIP-1559 gas economics and token deltas. The architecture is backed by an automated 10-test Python test suite and Playwright browser validation tests, deployed globally on Vercel.

## Challenges we ran into
Parsing dynamic ABI encodings across arbitrary calldata payloads, translating raw parameters into accurate plain-English context without sounding robotic, and creating a zero-lag code editor with line-by-line vulnerability pinpointing and instant patch diffing.

## Accomplishments that we're proud of
Delivering a truly interactive user experience where judges can test their own Solidity code and raw calldata hex rather than viewing a static mockup; implementing a 1-click automated security patch generator; and achieving 10/10 passing automated tests.

## What we learned
Gained deeper insight into EIP-2612 gasless permit attack vectors and reinforced the principle that effective security tools must communicate risks in clear, human language rather than overwhelming users with cryptographic jargon.

## What's next for TxGuard Studio
Developing a browser extension to intercept and explain MetaMask signatures inline, adding multi-chain RPC forks (Anvil/Tenderly) for live mainnet state simulation, and expanding static auditing to Vyper and Solana Anchor programs.

## Built With
JavaScript, HTML5, Tailwind CSS, Python, Playwright, Edge-TTS, Vercel, Git, GitHub
