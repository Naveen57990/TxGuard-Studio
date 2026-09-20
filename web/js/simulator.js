// TxGuard Studio - Execution Flow & Dynamic State Simulator
window.TxGuardSimulator = {
  state: {
    gasPriceGwei: 28,
    slippagePct: 0.5,
    attackMode: false,
    inputAmount: 2500,
    ethPriceUsd: 2850
  },

  simulate() {
    const isAttack = this.state.attackMode;
    const baseGas = isAttack ? 210000 : 135000;
    const gasEth = (baseGas * this.state.gasPriceGwei) / 1e9;
    const gasUsd = gasEth * this.state.ethPriceUsd;

    const ethOutput = (this.state.inputAmount / this.state.ethPriceUsd) * (1 - this.state.slippagePct / 100);

    let balanceSheet = [];
    let stateStatus = "CONFIRMED";
    let statusClass = "text-emerald-400 bg-emerald-950/60 border-emerald-800";
    let summaryText = `Atomic transaction finalized within ${this.state.slippagePct}% maximum slippage bound.`;

    if (isAttack) {
      stateStatus = "EXPLOITED";
      statusClass = "text-rose-400 bg-rose-950/60 border-rose-800";
      summaryText = "CRITICAL: Reentrant call hijacked control flow during token transfer, draining vault reserves.";
      balanceSheet = [
        {
          asset: "USDC",
          direction: "DRAINED",
          amount: "-10,000.00 USDC",
          actor: "Attacker Contract (0x71C...b89)",
          deltaClass: "text-rose-400"
        },
        {
          asset: "WETH",
          direction: "DRAINED",
          amount: "-3.50 WETH",
          actor: "Attacker Contract (0x71C...b89)",
          deltaClass: "text-rose-400"
        },
        {
          asset: "ETH Gas",
          direction: "BURNT",
          amount: `-${gasEth.toFixed(5)} ETH ($${gasUsd.toFixed(2)})`,
          actor: "Network Base Fee",
          deltaClass: "text-slate-400"
        }
      ];
    } else {
      balanceSheet = [
        {
          asset: "USDC",
          direction: "SENT",
          amount: `-${this.state.inputAmount.toLocaleString()} USDC`,
          actor: "Uniswap V3 Pool",
          deltaClass: "text-slate-300"
        },
        {
          asset: "WETH",
          direction: "RECEIVED",
          amount: `+${ethOutput.toFixed(4)} WETH`,
          actor: "Caller (0x3a4...921)",
          deltaClass: "text-emerald-400 font-bold"
        },
        {
          asset: "ETH Gas",
          direction: "BURNT",
          amount: `-${gasEth.toFixed(5)} ETH ($${gasUsd.toFixed(2)})`,
          actor: "Ethereum Validators",
          deltaClass: "text-slate-400"
        }
      ];
    }

    const traceSteps = [
      {
        id: 1,
        title: "Signature & Nonce Verification",
        gasUsed: "21,000",
        state: "SUCCESS",
        details: "EIP-1559 transaction signed by verified private key."
      },
      {
        id: 2,
        title: "Spender Allowance Check",
        gasUsed: "14,500",
        state: "SUCCESS",
        details: `Caller verified balance >= ${this.state.inputAmount} USDC.`
      },
      {
        id: 3,
        title: isAttack ? "Malicious Fallback Hook Triggered" : "AMM Constant Product Route",
        gasUsed: isAttack ? "112,000" : "68,000",
        state: isAttack ? "HIJACKED" : "SUCCESS",
        details: isAttack
          ? "Target contract triggered untrusted fallback on msg.sender before writing storage."
          : `Swapped USDC for WETH with oracle quote protection.`
      },
      {
        id: 4,
        title: isAttack ? "Vault Reserves Bypassed" : "Final State Balance Reconciliation",
        gasUsed: isAttack ? "62,500" : "31,500",
        state: isAttack ? "REVERT_FAILED" : "SUCCESS",
        details: isAttack
          ? "Recursive call extracted remaining ETH pool balance."
          : "Emitted Transfer(from, to, amount) & Sync events."
      }
    ];

    return {
      status: stateStatus,
      statusClass: statusClass,
      gasUnits: baseGas.toLocaleString(),
      gasEth: gasEth.toFixed(5),
      gasUsd: gasUsd.toFixed(2),
      summaryText: summaryText,
      balanceSheet: balanceSheet,
      traceSteps: traceSteps
    };
  }
};
