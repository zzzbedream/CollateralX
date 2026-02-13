// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IStylusValuator.sol";
import "./mocks/MockNFT.sol";

/// @title LendingPool
/// @author CollateralX
/// @notice NFT-collateralized lending pool for PYMES on Arbitrum.
///         Uses the Stylus/Rust valuator for on-chain asset depreciation.
///
/// @dev Flow:
///   1. User approves this contract to transfer their NFT
///   2. User calls `depositCollateralAndBorrow(tokenId)`
///   3. Contract transfers NFT to itself as collateral
///   4. Contract calls the Stylus valuator to get current USD value
///   5. Contract calculates loan = value × LTV (60%)
///   6. Contract transfers USDC to the user
contract LendingPool is IERC721Receiver, Ownable, ReentrancyGuard {
    // ─── State ───────────────────────────────────────────────────────────

    /// @notice The USDC (or mock) stablecoin used for loan disbursement
    IERC20 public immutable stablecoin;

    /// @notice The collateral NFT contract
    MockNFT public immutable collateralNFT;

    /// @notice The Stylus valuator contract (Rust/WASM on Arbitrum)
    IStylusValuator public immutable stylusValuator;

    /// @notice Loan-to-Value ratio in basis points (6000 = 60%)
    uint256 public constant LTV_BPS = 6000;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    // ─── Loan Tracking ───────────────────────────────────────────────────

    struct Loan {
        address borrower;       // Who deposited the NFT
        uint256 tokenId;        // The collateral NFT token ID
        uint256 collateralValue; // Valuator's assessment (in stablecoin minor units)
        uint256 loanAmount;     // USDC disbursed to borrower
        uint64  timestamp;      // When the loan was created
        bool    active;         // Whether the loan is still outstanding
    }

    /// @notice All loans, indexed by loan ID
    Loan[] public loans;

    /// @notice Maps tokenId → loanId (for lookup)
    mapping(uint256 => uint256) public tokenToLoan;

    /// @notice Maps borrower → array of loan IDs
    mapping(address => uint256[]) public borrowerLoans;

    // ─── Events ──────────────────────────────────────────────────────────

    /// @notice Emitted when a user deposits an NFT as collateral
    event CollateralDeposited(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed tokenId,
        uint256 collateralValue
    );

    /// @notice Emitted when a loan is disbursed to the borrower
    event LoanDisbursed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 loanAmount
    );

    /// @notice Emitted when a borrower repays and reclaims their NFT
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 repaidAmount
    );

    // ─── Errors ──────────────────────────────────────────────────────────

    error InsufficientPoolLiquidity(uint256 required, uint256 available);
    error ValuationTooLow(uint256 valuationResult);
    error LoanNotActive(uint256 loanId);
    error NotBorrower(uint256 loanId, address caller);

    // ─── Constructor ─────────────────────────────────────────────────────

    /// @param _stablecoin     Address of the USDC/mock token
    /// @param _collateralNFT  Address of the collateral NFT contract
    /// @param _stylusValuator Address of the deployed Stylus valuator
    constructor(
        address _stablecoin,
        address _collateralNFT,
        address _stylusValuator
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        collateralNFT = MockNFT(_collateralNFT);
        stylusValuator = IStylusValuator(_stylusValuator);
    }

    // ─── Core Logic ──────────────────────────────────────────────────────

    /// @notice Deposit an NFT as collateral and receive a USDC loan.
    /// @param tokenId The NFT token ID to deposit
    /// @return loanId The ID of the newly created loan
    ///
    /// @dev Requires:
    ///   - User has approved this contract to transfer the NFT
    ///   - Pool has enough USDC liquidity
    ///   - Stylus valuator returns a non-zero value
    function depositCollateralAndBorrow(uint256 tokenId)
        external
        nonReentrant
        returns (uint256 loanId)
    {
        // 1. Transfer the NFT from the user to this contract
        collateralNFT.safeTransferFrom(msg.sender, address(this), tokenId);

        // 2. Read asset metadata from the NFT contract
        (
            uint8 assetType,
            uint64 initialValue,
            uint64 purchaseDate,
            uint8 riskScore
        ) = collateralNFT.assetMetadata(tokenId);

        // 3. Call the Stylus valuator for current value
        uint256 currentValue = stylusValuator.calculateCurrentValue(
            assetType,
            initialValue,
            purchaseDate,
            riskScore,
            uint64(block.timestamp)
        );

        if (currentValue == 0) {
            revert ValuationTooLow(currentValue);
        }

        // 4. Calculate loan amount: value × LTV (60%)
        uint256 loanAmount = (currentValue * LTV_BPS) / BPS_DENOMINATOR;

        // 5. Check pool has enough liquidity
        uint256 poolBalance = stablecoin.balanceOf(address(this));
        if (poolBalance < loanAmount) {
            revert InsufficientPoolLiquidity(loanAmount, poolBalance);
        }

        // 6. Create the loan record
        loanId = loans.length;
        loans.push(Loan({
            borrower: msg.sender,
            tokenId: tokenId,
            collateralValue: currentValue,
            loanAmount: loanAmount,
            timestamp: uint64(block.timestamp),
            active: true
        }));

        tokenToLoan[tokenId] = loanId;
        borrowerLoans[msg.sender].push(loanId);

        // 7. Emit events
        emit CollateralDeposited(loanId, msg.sender, tokenId, currentValue);

        // 8. Transfer USDC to the borrower
        require(stablecoin.transfer(msg.sender, loanAmount), "USDC transfer failed");
        emit LoanDisbursed(loanId, msg.sender, loanAmount);
    }

    /// @notice Repay a loan and reclaim the collateral NFT.
    /// @param loanId The loan to repay
    /// @dev Borrower must approve this contract for the repayment amount first.
    function repayAndWithdraw(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];

        if (!loan.active) revert LoanNotActive(loanId);
        if (loan.borrower != msg.sender) revert NotBorrower(loanId, msg.sender);

        loan.active = false;

        // Transfer repayment from borrower to pool
        require(
            stablecoin.transferFrom(msg.sender, address(this), loan.loanAmount),
            "Repayment transfer failed"
        );

        // Return the NFT to the borrower
        collateralNFT.safeTransferFrom(address(this), msg.sender, loan.tokenId);

        emit LoanRepaid(loanId, msg.sender, loan.loanAmount);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /// @notice Get the total number of loans
    function totalLoans() external view returns (uint256) {
        return loans.length;
    }

    /// @notice Get all loan IDs for a borrower
    function getLoansByBorrower(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    /// @notice Get pool USDC balance (available liquidity)
    function poolLiquidity() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }

    // ─── ERC721 Receiver ─────────────────────────────────────────────────

    /// @notice Required to receive ERC-721 tokens via safeTransferFrom
    function onERC721Received(address, address, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }
}
