// TxGuard Studio - EVM Calldata Decompiler & ABI Dissector
window.TxGuardDecompiler = {
  selectors: {
    "0xa9059cbb": {
      name: "transfer",
      signature: "transfer(address to, uint256 amount)",
      params: [
        { name: "to", type: "address", label: "Recipient Address" },
        { name: "amount", type: "uint256", label: "Token Units" }
      ],
      category: "ERC-20 Token Transfer",
      riskLevel: "LOW",
      description: "Direct token balance transfer to a designated external or contract account."
    },
    "0x095ea7b3": {
      name: "approve",
      signature: "approve(address spender, uint256 amount)",
      params: [
        { name: "spender", type: "address", label: "Spender Contract" },
        { name: "amount", type: "uint256", label: "Allowance Amount" }
      ],
      category: "ERC-20 Allowance",
      riskLevel: "EVALUATE",
      description: "Grants permission for a spender address to transfer tokens from caller's balance."
    },
    "0x23b872dd": {
      name: "transferFrom",
      signature: "transferFrom(address from, address to, uint256 amount)",
      params: [
        { name: "from", type: "address", label: "Source Owner" },
        { name: "to", type: "address", label: "Destination Recipient" },
        { name: "amount", type: "uint256", label: "Token Units" }
      ],
      category: "ERC-20 Allowance Transfer",
      riskLevel: "MEDIUM",
      description: "Transfers tokens using a previously granted allowance."
    },
    "0xd505accf": {
      name: "permit",
      signature: "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
      params: [
        { name: "owner", type: "address", label: "Token Owner" },
        { name: "spender", type: "address", label: "Approved Spender" },
        { name: "value", type: "uint256", label: "Permitted Value" },
        { name: "deadline", type: "uint256", label: "Expiration Timestamp" },
        { name: "v", type: "uint8", label: "ECDSA Recovery ID" },
        { name: "r", type: "bytes32", label: "ECDSA R Parameter" },
        { name: "s", type: "bytes32", label: "ECDSA S Parameter" }
      ],
      category: "EIP-2612 Gasless Permit",
      riskLevel: "HIGH",
      description: "Off-chain cryptographically signed permission allowing arbitrary spenders to drain balance without gas."
    },
    "0x38ed1739": {
      name: "swapExactTokensForTokens",
      signature: "swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
      params: [
        { name: "amountIn", type: "uint256", label: "Input Token Amount" },
        { name: "amountOutMin", type: "uint256", label: "Minimum Acceptable Output" },
        { name: "path", type: "address[]", label: "Routing Path" },
        { name: "to", type: "address", label: "Output Recipient" },
        { name: "deadline", type: "uint256", label: "Execution Deadline" }
      ],
      category: "DEX Swap Protocol",
      riskLevel: "MEDIUM",
      description: "Trades a fixed amount of input tokens for variable output tokens on an AMM pool."
    },
    "0x5ae401dc": {
      name: "multicall",
      signature: "multicall(uint256 deadline, bytes[] data)",
      params: [
        { name: "deadline", type: "uint256", label: "Batch Deadline" },
        { name: "data", type: "bytes[]", label: "Batched Calldata Payloads" }
      ],
      category: "Uniswap V3 Batch Execution",
      riskLevel: "EVALUATE",
      description: "Atomic batch of multiple swaps, mints, or fee collections."
    }
  },

  MAX_UINT256_HEX: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",

  decompile(rawInput) {
    let clean = (rawInput || "").trim().toLowerCase();
    if (clean.startsWith("0x")) {
      clean = clean.slice(2);
    }

    if (clean.length < 8) {
      return {
        success: false,
        error: "Calldata must contain at least 4 bytes (8 hex characters) for the method selector."
      };
    }

    const selector = "0x" + clean.slice(0, 8);
    const payload = clean.slice(8);

    const meta = this.selectors[selector] || {
      name: `Custom Method (${selector})`,
      signature: `unknown_${selector.slice(2)}(...)`,
      params: [],
      category: "Unindexed Contract Method",
      riskLevel: "EVALUATE",
      description: "Custom smart contract method call."
    };

    // Split into 32-byte chunks (64 hex characters)
    const chunks = [];
    for (let i = 0; i < payload.length; i += 64) {
      const chunk = payload.slice(i, i + 64);
      if (chunk.length > 0) chunks.push(chunk);
    }

    const decodedParams = [];
    const risks = [];
    let plainEnglish = "";
    let riskLevel = meta.riskLevel;

    if (meta.name === "approve") {
      const spenderRaw = chunks[0] || "0".repeat(64);
      const spender = "0x" + spenderRaw.slice(-40);
      const amountHex = chunks[1] || "0";
      const isUnlimited = amountHex.toLowerCase() === this.MAX_UINT256_HEX;

      decodedParams.push({
        name: "spender",
        type: "address",
        label: "Spender Contract",
        value: spender,
        isAddress: true
      });

      decodedParams.push({
        name: "amount",
        type: "uint256",
        label: "Authorized Units",
        value: isUnlimited ? "Unlimited (type(uint256).max)" : this.formatHexInt(amountHex),
        isUnlimited: isUnlimited
      });

      if (isUnlimited) {
        riskLevel = "CRITICAL";
        risks.push({
          severity: "CRITICAL",
          title: "Unlimited Spender Allowance Detected",
          description: `This transaction grants ${spender} perpetual authorization to drain all tokens from your balance without your signature.`
        });
        plainEnglish = `⚠️ WARNING: This transaction gives address <span class="font-mono text-cyan-300 font-semibold">${spender}</span> unlimited permission to transfer all of your tokens at any moment.`;
      } else {
        riskLevel = "LOW";
        plainEnglish = `Authorizes <span class="font-mono text-cyan-300 font-semibold">${spender}</span> to withdraw up to ${this.formatHexInt(amountHex)} tokens.`;
      }
    } else if (meta.name === "transfer") {
      const toRaw = chunks[0] || "0".repeat(64);
      const to = "0x" + toRaw.slice(-40);
      const amountHex = chunks[1] || "0";
      const formattedAmount = this.formatHexInt(amountHex);

      decodedParams.push({
        name: "to",
        type: "address",
        label: "Recipient Address",
        value: to,
        isAddress: true
      });

      decodedParams.push({
        name: "amount",
        type: "uint256",
        label: "Transfer Amount",
        value: formattedAmount
      });

      plainEnglish = `Transfers exactly <span class="text-emerald-400 font-bold">${formattedAmount}</span> base units directly to <span class="font-mono text-cyan-300">${to}</span>.`;
    } else if (meta.name === "permit") {
      const owner = "0x" + (chunks[0] || "0".repeat(64)).slice(-40);
      const spender = "0x" + (chunks[1] || "0".repeat(64)).slice(-40);
      const valueHex = chunks[2] || "0";
      const isUnlimited = valueHex.toLowerCase() === this.MAX_UINT256_HEX;

      decodedParams.push(
        { name: "owner", type: "address", label: "Token Owner", value: owner, isAddress: true },
        { name: "spender", type: "address", label: "Approved Spender", value: spender, isAddress: true },
        { name: "value", type: "uint256", label: "Permitted Amount", value: isUnlimited ? "Unlimited" : this.formatHexInt(valueHex), isUnlimited: isUnlimited }
      );

      riskLevel = "CRITICAL";
      risks.push({
        severity: "CRITICAL",
        title: "Gasless EIP-2612 Phishing Permit Signature",
        description: "Permit signatures can be executed by third-party relayer bots to bypass hardware wallet prompts and drain reserves."
      });

      plainEnglish = `🚨 CRITICAL RISK: An off-chain signature authorizing <span class="font-mono text-cyan-300">${spender}</span> to withdraw assets on behalf of <span class="font-mono text-slate-300">${owner}</span>.`;
    } else {
      chunks.forEach((chunk, index) => {
        decodedParams.push({
          name: `param_${index}`,
          type: "bytes32",
          label: `Argument #${index + 1}`,
          value: "0x" + chunk
        });
      });
      plainEnglish = `Invokes method <span class="font-mono text-indigo-300">${meta.signature}</span> with ${chunks.length} encoded parameters.`;
    }

    return {
      success: true,
      selector: selector,
      name: meta.name,
      signature: meta.signature,
      category: meta.category,
      riskLevel: riskLevel,
      description: meta.description,
      decodedParams: decodedParams,
      plainEnglish: plainEnglish,
      risks: risks,
      rawBytesCount: clean.length / 2,
      chunkCount: chunks.length
    };
  },

  formatHexInt(hexStr) {
    try {
      if (!hexStr || hexStr === "0") return "0";
      const big = BigInt("0x" + hexStr);
      return big.toLocaleString();
    } catch (e) {
      return "0x" + hexStr;
    }
  }
};
