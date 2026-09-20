// TxGuard Studio - In-Browser Solidity AST & Security Invariant Analyzer
window.TxGuardAnalyzer = {
  rules: [
    {
      id: "TXG-SEC-01",
      category: "Reentrancy Vulnerability",
      severity: "CRITICAL",
      scorePenalty: 40,
      title: "Checks-Effects-Interactions Violation (Reentrancy)",
      detect(code) {
        const lines = code.split("\n");
        let externalCallLine = -1;
        let findings = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/\.(call|send|transfer)\s*\(|\.call\{/.test(line)) {
            externalCallLine = i + 1;
          } else if (externalCallLine > 0 && /(=|\+=|-=)/.test(line) && !/(==|!=|<=|>=)/.test(line)) {
            // Check if ReentrancyGuard is absent
            if (!/nonReentrant|ReentrancyGuard/.test(code)) {
              findings.push({
                line: i + 1,
                snippet: line.trim(),
                externalCallLine: externalCallLine,
                description: "State balances updated after low-level external call, enabling reentrant fund drainage."
              });
              break;
            }
          }
        }
        return findings;
      },
      remediation: "Apply OpenZeppelin ReentrancyGuard (`nonReentrant` modifier) and deduct balances BEFORE sending funds."
    },
    {
      id: "TXG-SEC-02",
      category: "Access Control Flaw",
      severity: "HIGH",
      scorePenalty: 25,
      title: "Insecure Authentication via tx.origin",
      detect(code) {
        const lines = code.split("\n");
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("tx.origin")) {
            findings.push({
              line: i + 1,
              snippet: lines[i].trim(),
              description: "Use of tx.origin allows intermediate phishing contracts to impersonate authorized signers."
            });
            break;
          }
        }
        return findings;
      },
      remediation: "Replace `tx.origin` with `msg.sender` for strict authorization."
    },
    {
      id: "TXG-SEC-03",
      category: "Token Transfer Safety",
      severity: "MEDIUM",
      scorePenalty: 15,
      title: "Unchecked ERC-20 Return Value (USDT Incompatibility)",
      detect(code) {
        const lines = code.split("\n");
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (/\b(IERC20|ERC20)\b.*\.(transfer|transferFrom)\(/.test(lines[i]) && !lines[i].includes("safeTransfer")) {
            findings.push({
              line: i + 1,
              snippet: lines[i].trim(),
              description: "Tokens omitting standard boolean return values (like USDT) will revert or fail silently."
            });
            break;
          }
        }
        return findings;
      },
      remediation: "Import OpenZeppelin `SafeERC20` and utilize `safeTransfer()` and `safeTransferFrom()`."
    },
    {
      id: "TXG-SEC-04",
      category: "MEV Slippage Risk",
      severity: "HIGH",
      scorePenalty: 20,
      title: "Zero Minimum Output Allowed in Swap",
      detect(code) {
        const lines = code.split("\n");
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (/amountOutMin\s*:\s*0|amountOutMinimum\s*:\s*0|minTokens\s*:\s*0/.test(lines[i])) {
            findings.push({
              line: i + 1,
              snippet: lines[i].trim(),
              description: "0 slippage allows frontrunning searchers to sandwich trade for 100% loss."
            });
            break;
          }
        }
        return findings;
      },
      remediation: "Enforce dynamic minimum output bounds based on trusted decentralized oracles."
    },
    {
      id: "TXG-SEC-05",
      category: "Validation Oversight",
      severity: "LOW",
      scorePenalty: 10,
      title: "Missing Zero-Address Guard for Critical Recipient",
      detect(code) {
        const lines = code.split("\n");
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (/function\s+\w+.*address\s+(\w+)/.test(lines[i]) && /(owner|recipient|admin)/.test(lines[i])) {
            const context = lines.slice(i, Math.min(lines.length, i + 5)).join("\n");
            if (!context.includes("address(0)") && !context.includes("0x0")) {
              findings.push({
                line: i + 1,
                snippet: lines[i].trim(),
                description: "Function accepts address parameters without verifying `recipient != address(0)`."
              });
              break;
            }
          }
        }
        return findings;
      },
      remediation: "Add `require(targetAddress != address(0), 'Zero address prohibited');` check."
    }
  ],

  analyze(solidityCode) {
    if (!solidityCode || solidityCode.trim().length === 0) {
      return {
        score: 100,
        tier: "EMPTY",
        findings: [],
        linesCount: 0
      };
    }

    const lines = solidityCode.split("\n");
    let score = 100;
    const detected = [];

    this.rules.forEach(rule => {
      const match = rule.detect(solidityCode);
      if (match && match.length > 0) {
        score -= rule.scorePenalty;
        detected.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          line: match[0].line,
          snippet: match[0].snippet,
          description: match[0].description,
          remediation: rule.remediation
        });
      }
    });

    score = Math.max(0, score);
    let tier = "SECURE";
    let tierColor = "text-emerald-400";
    let badgeBg = "bg-emerald-950 border-emerald-800 text-emerald-300";

    if (score < 60) {
      tier = "CRITICAL RISK";
      tierColor = "text-rose-400";
      badgeBg = "bg-rose-950 border-rose-800 text-rose-300";
    } else if (score < 85) {
      tier = "WARNING";
      tierColor = "text-amber-400";
      badgeBg = "bg-amber-950 border-amber-800 text-amber-300";
    }

    return {
      score: score,
      tier: tier,
      tierColor: tierColor,
      badgeBg: badgeBg,
      findings: detected,
      linesCount: lines.length
    };
  },

  generateRemediationPatch(solidityCode) {
    let patched = solidityCode;

    // 1. Fix tx.origin
    patched = patched.replace(/tx\.origin/g, "msg.sender");

    // 2. Fix reentrancy if found
    if (patched.includes("(bool success, ) = msg.sender.call{value: amount}(\"\");") && patched.includes("balances[msg.sender] = 0;")) {
      patched = patched.replace(
        "        (bool success, ) = msg.sender.call{value: amount}(\"\");\n        require(success, \"Transfer failed\");\n\n        // Flaw: State balance deducted AFTER sending Ether\n        balances[msg.sender] = 0;",
        "        // 1. Effects: Balance cleared BEFORE external call\n        balances[msg.sender] = 0;\n\n        // 2. Interaction: Low-level call protected against reentrancy\n        (bool success, ) = msg.sender.call{value: amount}(\"\");\n        require(success, \"Transfer failed\");"
      );
    }

    // 3. Fix 0 slippage
    patched = patched.replace("0, // FLAW: 0 slippage threshold", "amountIn * 995 / 1000, // Enforced 0.5% max slippage");

    return patched;
  }
};
