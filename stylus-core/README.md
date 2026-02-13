# Stylus Core — Asset Valuation Engine (Rust → WASM)

> CollateralX on-chain valuation for PYMES collateral on Arbitrum Stylus

## Architecture

```
src/
├── valuation.rs   ← Pure business logic (testable natively)
└── lib.rs         ← Stylus contract wrapper (#[public] → Solidity ABI)
```

## Depreciation Model

- **Linear** over 10 years with **10% residual floor**
- **High-risk discount**: additional 10% off when `risk_score > 50`
- **Safe arithmetic**: all ops use `checked_sub`/`checked_mul`

## Solidity Interface

```solidity
calculateCurrentValue(uint8, uint64, uint64, uint8, uint64) → uint256
batchValuate(uint64[], uint64[], uint8[], uint64) → uint256[]
getDepreciationSchedule(uint64, uint8) → uint256[]
```

## Commands

```bash
# Test (native, no WASM host needed)
cargo test --no-default-features

# Build WASM for deployment
cargo build --release --target wasm32-unknown-unknown

# Deploy (requires cargo-stylus + funded wallet)
cargo stylus deploy --private-key <KEY>
```

## Tech Stack

| Component | Version |
|-----------|---------|
| Rust | nightly-2025-06-01 |
| stylus-sdk | 0.10.0 |
| alloy-primitives | 1.0.1 |
| Target | wasm32-unknown-unknown |
