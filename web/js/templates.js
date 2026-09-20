// TxGuard Studio - Preset Benchmarks & Real-World Exploit Scenarios
window.TXGUARD_TEMPLATES = {
  calldata: {
    unlimited_usdc_approve: {
      name: "Phishing Drain: Unlimited Spender Approval",
      category: "High Risk",
      target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (USDC)",
      calldata: "0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      description: "Grants 0x68b346... unlimited allowance (type(uint256).max) to spend all caller USDC tokens."
    },
    permit_phishing_drain: {
      name: "EIP-2612 Gasless Permit Signature Drain",
      category: "Critical Risk",
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7 (USDT)",
      calldata: "0xd505accf000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000065000000000000000000000000000000000000000000000000000000000000000000001b",
      description: "Permit authorization allowing an external relayer to transfer all owner assets gaslessly."
    },
    uniswap_multicall_swap: {
      name: "Uniswap V3 Multicall Swap",
      category: "DeFi",
      target: "0xE592427A0AEce92De3Edee1F18E0157C05861564 (SwapRouter)",
      calldata: "0x5ae401dc000000000000000000000000000000000000000000000000000000006512345600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001",
      description: "Batched router call executing an atomic token swap with deadline protection."
    },
    normal_erc20_transfer: {
      name: "Standard ERC-20 Transfer",
      category: "Safe",
      target: "0x6B175474E89094C44Da98b954EedeAC495271d0F (DAI)",
      calldata: "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000f4240",
      description: "Standard peer-to-peer transfer of 1,000,000 base units to vitalik.eth."
    }
  },

  contracts: {
    reentrancy_vault: {
      name: "The Classic Reentrancy Vault (Vulnerable)",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableEtherVault
 * @notice Classic Checks-Effects-Interactions violation leading to fund drainage.
 */
contract VulnerableEtherVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE: External call before state variable deduction
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // Flaw: State balance deducted AFTER sending Ether
        balances[msg.sender] = 0;
    }
}`
    },

    insecure_tx_origin: {
      name: "Phishing Access Control (tx.origin)",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InsecureTreasury
 * @notice Uses tx.origin instead of msg.sender for authorization.
 */
contract InsecureTreasury {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // VULNERABLE: Insecure authentication allowing phishing contract exploits
    function emergencyDrain(address payable recipient) external {
        require(tx.origin == owner, "Only owner can authorize emergency drain");
        recipient.transfer(address(this).balance);
    }
}`
    },

    sandwich_dex_swap: {
      name: "Zero Slippage Swap (MEV Sandwich Attack)",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract VulnerableSwapExecutor {
    IUniswapV2Router public router;

    // VULNERABLE: amountOutMin set to 0 invites 100% MEV sandwich extraction
    function executeSwap(uint256 amountIn, address[] calldata path) external {
        router.swapExactTokensForTokens(
            amountIn,
            0, // FLAW: 0 slippage threshold
            path,
            msg.sender,
            block.timestamp + 300
        );
    }
}`
    },

    secure_audited_vault: {
      name: "Audited ReentrancyGuard Vault (Secure)",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract SecureEtherVault is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // SECURE: Checks-Effects-Interactions + nonReentrant modifier
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // 1. Effects: State updated BEFORE external call
        balances[msg.sender] = 0;

        // 2. Interaction: Low level call
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}`
    }
  }
};
