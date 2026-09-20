// TxGuard Studio - Main Application Controller
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabCalldataBtn = document.getElementById("tab-calldata-btn");
  const tabContractBtn = document.getElementById("tab-contract-btn");
  const tabSimulatorBtn = document.getElementById("tab-simulator-btn");

  const tabCalldata = document.getElementById("tab-calldata");
  const tabContract = document.getElementById("tab-contract");
  const tabSimulator = document.getElementById("tab-simulator");

  // Calldata Elements
  const calldataInput = document.getElementById("calldata-input");
  const decodeBtn = document.getElementById("decode-btn");
  const calldataPresets = document.getElementById("calldata-presets");
  const decodedResultBox = document.getElementById("decoded-result-box");
  const methodBadge = document.getElementById("method-badge");
  const methodSig = document.getElementById("method-sig");
  const methodCategory = document.getElementById("method-category");
  const plainEnglishBox = document.getElementById("plain-english-box");
  const riskAlertBox = document.getElementById("risk-alert-box");
  const paramsTbody = document.getElementById("params-tbody");
  const bytesCountBadge = document.getElementById("bytes-count-badge");

  // Contract Elements
  const contractTextarea = document.getElementById("contract-textarea");
  const auditBtn = document.getElementById("audit-btn");
  const contractPresets = document.getElementById("contract-presets");
  const fileUploadInput = document.getElementById("sol-file-upload");
  const uploadBtn = document.getElementById("upload-sol-btn");
  const securityScoreBadge = document.getElementById("security-score-badge");
  const securityTierBadge = document.getElementById("security-tier-badge");
  const findingsList = document.getElementById("findings-list");
  const patchSection = document.getElementById("patch-section");
  const applyPatchBtn = document.getElementById("apply-patch-btn");
  const exportReportBtn = document.getElementById("export-report-btn");

  // Simulator Elements
  const gasSlider = document.getElementById("gas-slider");
  const gasValueText = document.getElementById("gas-value-text");
  const slippageSlider = document.getElementById("slippage-slider");
  const slippageValueText = document.getElementById("slippage-value-text");
  const attackToggle = document.getElementById("attack-toggle");
  const reSimulateBtn = document.getElementById("resimulate-btn");
  const simStatusBadge = document.getElementById("sim-status-badge");
  const simGasUsd = document.getElementById("sim-gas-usd");
  const simGasEth = document.getElementById("sim-gas-eth");
  const simSummary = document.getElementById("sim-summary");
  const balanceSheetBody = document.getElementById("balance-sheet-body");
  const traceStepsContainer = document.getElementById("trace-steps-container");

  // --- Tab Navigation ---
  function switchTab(target) {
    [tabCalldataBtn, tabContractBtn, tabSimulatorBtn].forEach(b => b.classList.remove("active-tab", "border-indigo-500", "text-indigo-400"));
    [tabCalldata, tabContract, tabSimulator].forEach(t => t.classList.add("hidden"));

    if (target === "calldata") {
      tabCalldataBtn.classList.add("active-tab", "border-indigo-500", "text-indigo-400");
      tabCalldata.classList.remove("hidden");
    } else if (target === "contract") {
      tabContractBtn.classList.add("active-tab", "border-indigo-500", "text-indigo-400");
      tabContract.classList.remove("hidden");
    } else if (target === "simulator") {
      tabSimulatorBtn.classList.add("active-tab", "border-indigo-500", "text-indigo-400");
      tabSimulator.classList.remove("hidden");
      runSimulation();
    }
  }

  tabCalldataBtn.addEventListener("click", () => switchTab("calldata"));
  tabContractBtn.addEventListener("click", () => switchTab("contract"));
  tabSimulatorBtn.addEventListener("click", () => switchTab("simulator"));

  // --- Calldata Decompiler Logic ---
  function runDecompile() {
    const raw = calldataInput.value.trim();
    if (!raw) return;

    const res = window.TxGuardDecompiler.decompile(raw);
    if (!res.success) {
      alert("Decompile Error: " + res.error);
      return;
    }

    decodedResultBox.classList.remove("hidden");
    methodBadge.textContent = res.name;
    methodSig.textContent = res.signature;
    methodCategory.textContent = res.category;
    bytesCountBadge.textContent = `${res.rawBytesCount} Bytes (${res.chunkCount} Words)`;

    plainEnglishBox.innerHTML = res.plainEnglish;

    // Risks
    if (res.risks && res.risks.length > 0) {
      riskAlertBox.classList.remove("hidden");
      riskAlertBox.innerHTML = res.risks.map(r => `
        <div class="p-3 bg-rose-950/70 border border-rose-800 rounded-lg flex items-start space-x-3">
          <i class="fa-solid fa-triangle-exclamation text-rose-400 text-lg mt-0.5"></i>
          <div>
            <div class="text-rose-200 font-bold text-sm">${r.title}</div>
            <div class="text-rose-300 text-xs mt-1 leading-relaxed">${r.description}</div>
          </div>
        </div>
      `).join("");
    } else {
      riskAlertBox.classList.add("hidden");
    }

    // Decoded Parameters Table
    if (res.decodedParams && res.decodedParams.length > 0) {
      paramsTbody.innerHTML = res.decodedParams.map(p => `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
          <td class="px-4 py-3 text-xs font-mono text-indigo-400">${p.name}</td>
          <td class="px-4 py-3 text-xs font-mono text-slate-400">${p.type}</td>
          <td class="px-4 py-3 text-xs text-slate-300">${p.label || "-"}</td>
          <td class="px-4 py-3 text-xs font-mono break-all ${p.isUnlimited ? 'text-rose-400 font-bold' : p.isAddress ? 'text-cyan-300 font-semibold' : 'text-slate-100'}">
            ${p.value}
          </td>
        </tr>
      `).join("");
    } else {
      paramsTbody.innerHTML = `<tr><td colspan="4" class="px-4 py-4 text-center text-xs text-slate-500">No structured parameters found.</td></tr>`;
    }
  }

  decodeBtn.addEventListener("click", runDecompile);
  calldataInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      runDecompile();
    }
  });

  // Preset Selector
  calldataPresets.addEventListener("change", () => {
    const key = calldataPresets.value;
    if (key && window.TXGUARD_TEMPLATES.calldata[key]) {
      calldataInput.value = window.TXGUARD_TEMPLATES.calldata[key].calldata;
      runDecompile();
    }
  });

  // --- Smart Contract Auditor Logic ---
  let lastAuditResult = null;

  function runContractAudit() {
    const code = contractTextarea.value.trim();
    if (!code) return;

    const res = window.TxGuardAnalyzer.analyze(code);
    lastAuditResult = res;

    securityScoreBadge.textContent = `${res.score} / 100`;
    securityTierBadge.textContent = res.tier;
    securityTierBadge.className = `px-2.5 py-0.5 rounded text-xs font-bold border ${res.badgeBg}`;

    if (res.findings.length === 0) {
      findingsList.innerHTML = `
        <div class="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center">
          <i class="fa-solid fa-circle-check text-emerald-400 text-3xl mb-2"></i>
          <div class="text-emerald-200 font-bold text-sm">Zero Vulnerabilities Detected</div>
          <p class="text-slate-400 text-xs mt-1">This contract adheres to Checks-Effects-Interactions and access-control security invariants.</p>
        </div>
      `;
      patchSection.classList.add("hidden");
    } else {
      findingsList.innerHTML = res.findings.map(f => `
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-xs font-bold ${f.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
              ${f.severity}
            </span>
            <span class="text-xs text-slate-500 font-mono">Line ${f.line}</span>
          </div>
          <div class="text-sm font-bold text-white">${f.title}</div>
          <div class="text-xs font-mono bg-black/50 p-2 rounded border border-slate-800 text-rose-300">
            ${f.snippet}
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">${f.description}</p>
          <div class="pt-2 border-t border-slate-800 text-xs text-emerald-400 flex items-start space-x-1.5">
            <i class="fa-solid fa-wrench mt-0.5"></i>
            <span><strong>Fix:</strong> ${f.remediation}</span>
          </div>
        </div>
      `).join("");

      patchSection.classList.remove("hidden");
    }
  }

  auditBtn.addEventListener("click", runContractAudit);

  // Contract Presets
  contractPresets.addEventListener("change", () => {
    const key = contractPresets.value;
    if (key && window.TXGUARD_TEMPLATES.contracts[key]) {
      contractTextarea.value = window.TXGUARD_TEMPLATES.contracts[key].code;
      runContractAudit();
    }
  });

  // Upload .sol File
  uploadBtn.addEventListener("click", () => fileUploadInput.click());
  fileUploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        contractTextarea.value = event.target.result;
        runContractAudit();
      };
      reader.readAsText(file);
    }
  });

  // Apply Patch Button
  applyPatchBtn.addEventListener("click", () => {
    const currentCode = contractTextarea.value;
    const patched = window.TxGuardAnalyzer.generateRemediationPatch(currentCode);
    contractTextarea.value = patched;
    runContractAudit();
  });

  // Export Audit Report
  exportReportBtn.addEventListener("click", () => {
    if (!lastAuditResult) runContractAudit();
    const code = contractTextarea.value;
    const report = `# 🛡️ TxGuard Studio - Security Audit Report
Generated: ${new Date().toISOString()}
Target Contract: Custom In-Browser Deployment
Security Score: ${lastAuditResult.score}/100 (${lastAuditResult.tier})

## Executive Summary
- Total Lines Audited: ${lastAuditResult.linesCount}
- Critical Invariant Violations: ${lastAuditResult.findings.length}

## Detected Invariant Findings
${lastAuditResult.findings.map(f => `
### [${f.severity}] ${f.title} (Line ${f.line})
- **Category**: ${f.category}
- **Code Snippet**: \`${f.snippet}\`
- **Impact**: ${f.description}
- **Remediation**: ${f.remediation}
`).join("\n")}

---
*Verified by TxGuard Studio v1.0.0 — 3rd-Web-Hack Devpost Edition*
`;

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "txguard_audit_report.md";
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Transaction Simulator Logic ---
  function runSimulation() {
    window.TxGuardSimulator.state.gasPriceGwei = parseFloat(gasSlider.value);
    window.TxGuardSimulator.state.slippagePct = parseFloat(slippageSlider.value);
    window.TxGuardSimulator.state.attackMode = attackToggle.checked;

    const res = window.TxGuardSimulator.simulate();

    simStatusBadge.textContent = res.status;
    simStatusBadge.className = `px-3 py-1 rounded-full text-xs font-bold border ${res.statusClass}`;

    simGasUsd.textContent = `$${res.gasUsd}`;
    simGasEth.textContent = `${res.gasEth} ETH (${res.gasUnits} units)`;
    simSummary.textContent = res.summaryText;

    // Balance Sheet
    balanceSheetBody.innerHTML = res.balanceSheet.map(b => `
      <tr class="border-b border-slate-800/80">
        <td class="px-4 py-3 text-xs font-bold text-white">${b.asset}</td>
        <td class="px-4 py-3 text-xs">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${b.direction === 'DRAINED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : b.direction === 'RECEIVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'}">
            ${b.direction}
          </span>
        </td>
        <td class="px-4 py-3 text-xs font-mono ${b.deltaClass}">${b.amount}</td>
        <td class="px-4 py-3 text-xs font-mono text-slate-400">${b.actor}</td>
      </tr>
    `).join("");

    // Trace Steps
    traceStepsContainer.innerHTML = res.traceSteps.map(s => `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold flex items-center justify-center text-indigo-400">
            ${s.id}
          </div>
          <div>
            <div class="text-xs font-semibold text-white">${s.title}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${s.details}</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.state === 'HIJACKED' || s.state === 'REVERT_FAILED' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
            ${s.state}
          </span>
          <div class="text-[10px] font-mono text-slate-500 mt-0.5">${s.gasUsed} gas</div>
        </div>
      </div>
    `).join("");
  }

  gasSlider.addEventListener("input", () => {
    gasValueText.textContent = `${gasSlider.value} Gwei`;
    runSimulation();
  });

  slippageSlider.addEventListener("input", () => {
    slippageValueText.textContent = `${slippageSlider.value}%`;
    runSimulation();
  });

  attackToggle.addEventListener("change", runSimulation);
  if (reSimulateBtn) {
    reSimulateBtn.addEventListener("click", runSimulation);
  }

  // Initialize Default Views
  calldataInput.value = window.TXGUARD_TEMPLATES.calldata.unlimited_usdc_approve.calldata;
  runDecompile();

  contractTextarea.value = window.TXGUARD_TEMPLATES.contracts.reentrancy_vault.code;
  runContractAudit();
});
