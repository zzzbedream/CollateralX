// ABI fragments for CollateralX contracts
// Only the functions we actually call from the frontend

export const LENDING_POOL_ABI = [
    {
        name: 'depositCollateralAndBorrow',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: 'loanId', type: 'uint256' }],
    },
    {
        name: 'repayAndWithdraw',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'loanId', type: 'uint256' }],
        outputs: [],
    },
    {
        name: 'poolLiquidity',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'totalLoans',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'loans',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '', type: 'uint256' }],
        outputs: [
            { name: 'borrower', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'collateralValue', type: 'uint256' },
            { name: 'loanAmount', type: 'uint256' },
            { name: 'timestamp', type: 'uint64' },
            { name: 'active', type: 'bool' },
        ],
    },
] as const

export const STYLUS_VALUATOR_ABI = [
    {
        name: 'calculateCurrentValue',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'assetType', type: 'uint8' },
            { name: 'initialValue', type: 'uint64' },
            { name: 'purchaseDate', type: 'uint64' },
            { name: 'riskScore', type: 'uint8' },
            { name: 'currentTimestamp', type: 'uint64' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const

export const NFT_ABI = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        name: 'assetMetadata',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [
            { name: 'assetType', type: 'uint8' },
            { name: 'initialValue', type: 'uint64' },
            { name: 'purchaseDate', type: 'uint64' },
            { name: 'riskScore', type: 'uint8' },
        ],
    },
] as const

// ── Contract Addresses (Arbitrum Sepolia — deployed Feb 14, 2026) ──
// LendingPool now points to the REAL Stylus/Rust valuator (not deployer placeholder)
export const CONTRACTS = {
    LENDING_POOL: '0xFc9f8c4107c6d4c2AFBdB7D25A30447FaB63b9bC' as `0x${string}`,
    STYLUS_VALUATOR: '0x023223d7b651a007dc42980cb9ca75f1e795eee1' as `0x${string}`,
    MOCK_USDC: '0x265e31a371eFdDC5E6922E68dEaf5045E57f8429' as `0x${string}`,
    MOCK_NFT: '0xAb78688e3B83f56c58bDf7D2520F5cA590EcDB2d' as `0x${string}`,
}
