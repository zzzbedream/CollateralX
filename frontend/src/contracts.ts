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

// ── Contract Addresses ──
// Replace these with actual deployed addresses from deployments.json
export const CONTRACTS = {
    LENDING_POOL: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    STYLUS_VALUATOR: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    MOCK_USDC: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    MOCK_NFT: '0x0000000000000000000000000000000000000000' as `0x${string}`,
}
