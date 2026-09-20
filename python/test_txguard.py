"""
Automated Test Suite for TxGuard Studio
Tests Calldata Decompiler, Smart Contract Auditor, and Transaction Simulator.
"""

import unittest
from txguard_core import CalldataDecompiler, SmartContractAuditor, TransactionSimulator

class TestTxGuardCore(unittest.TestCase):

    def test_approve_decompiler_unlimited(self):
        # approve(0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45, type(uint256).max)
        calldata = "0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        res = CalldataDecompiler.decompile(calldata)
        self.assertTrue(res["success"])
        self.assertEqual(res["name"], "approve")
        self.assertEqual(len(res["risks"]), 1)
        self.assertEqual(res["risks"][0]["severity"], "CRITICAL")
        self.assertIn("unlimited", res["plain_english"].lower())

    def test_transfer_decompiler(self):
        # transfer(0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 1000000)
        calldata = "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000f4240"
        res = CalldataDecompiler.decompile(calldata)
        self.assertTrue(res["success"])
        self.assertEqual(res["name"], "transfer")
        self.assertIn("1000000", res["plain_english"])

    def test_permit_signature_decompiler(self):
        calldata = "0xd505accf00000000000000000000000011111111111111111111111111111111111111110000000000000000000000002222222222222222222222222222222222222222ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        res = CalldataDecompiler.decompile(calldata)
        self.assertTrue(res["success"])
        self.assertEqual(res["name"], "permit")
        self.assertTrue(any(r["severity"] == "CRITICAL" for r in res["risks"]))

    def test_short_invalid_calldata(self):
        calldata = "0x123"
        res = CalldataDecompiler.decompile(calldata)
        self.assertFalse(res["success"])
        self.assertIn("at least 4 bytes", res["error"])

    def test_auditor_detects_reentrancy(self):
        vulnerable_code = """
        contract VulnerableVault {
            mapping(address => uint256) public balances;
            
            function withdraw() public {
                uint256 amount = balances[msg.sender];
                (bool sent, ) = msg.sender.call{value: amount}("");
                require(sent, "Failed to send Ether");
                balances[msg.sender] = 0;
            }
        }
        """
        audit = SmartContractAuditor.analyze(vulnerable_code)
        self.assertGreaterEqual(audit["findings_count"], 1)
        self.assertTrue(any(f["category"] == "Reentrancy Vulnerability" for f in audit["findings"]))
        self.assertLess(audit["security_score"], 80)

    def test_auditor_detects_tx_origin(self):
        vulnerable_code = """
        contract InsecureWallet {
            address public owner;
            function transferOwnership(address newOwner) public {
                require(tx.origin == owner, "Not owner");
                owner = newOwner;
            }
        }
        """
        audit = SmartContractAuditor.analyze(vulnerable_code)
        self.assertTrue(any(f["category"] == "Access Control Flaw" for f in audit["findings"]))

    def test_auditor_detects_zero_slippage(self):
        vulnerable_code = """
        contract BadSwap {
            function swap(uint256 amountIn) external {
                router.swapExactTokensForTokens(amountIn, 0, path, msg.sender, block.timestamp);
            }
        }
        """
        # zero slippage pattern: amountOutMin: 0
        test_code = "router.swap(amountIn, minTokens: 0);"
        audit = SmartContractAuditor.analyze(test_code)
        self.assertTrue(any("Zero Minimum Output" in f["title"] for f in audit["findings"]))

    def test_auditor_clean_code(self):
        secure_code = """
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;
        
        contract SecureVault {
            mapping(address => uint256) private _balances;
            
            function deposit() external payable {
                require(msg.value > 0, "Zero deposit");
                _balances[msg.sender] += msg.value;
            }
        }
        """
        audit = SmartContractAuditor.analyze(secure_code)
        self.assertEqual(audit["findings_count"], 0)
        self.assertEqual(audit["security_score"], 100)
        self.assertEqual(audit["security_tier"], "SECURE")

    def test_simulator_normal_execution(self):
        sim = TransactionSimulator.simulate(action="swap", gas_price_gwei=30.0, slippage_percent=0.5, simulate_attack=False)
        self.assertEqual(sim["status"], "CONFIRMED")
        self.assertGreater(sim["gas_cost_usd"], 0)
        self.assertEqual(len(sim["balance_deltas"]), 2)

    def test_simulator_attack_execution(self):
        sim = TransactionSimulator.simulate(action="swap", gas_price_gwei=30.0, slippage_percent=0.5, simulate_attack=True)
        self.assertEqual(sim["status"], "EXPLOITED")
        self.assertIn("Reentrant", sim["state_summary"])

if __name__ == "__main__":
    unittest.main()
