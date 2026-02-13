// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Mock stablecoin for testing the CollateralX lending pool.
///         Uses 6 decimals to match real USDC behavior.
contract MockUSDC is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Mint 10M USDC to deployer for initial liquidity
        _mint(msg.sender, 10_000_000 * 10 ** _DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Allows the owner to mint additional tokens (for testing)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
