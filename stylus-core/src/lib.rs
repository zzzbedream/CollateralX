// Copyright 2026, CollateralX
// SPDX-License-Identifier: MIT
//
// CollateralX — Asset Valuation Engine for PYMES
// Built on Arbitrum Stylus SDK (Rust → WASM)
//
// Architecture:
//   valuation.rs — Pure business logic (testable natively)
//   lib.rs       — Stylus contract wrapper (WASM runtime only, behind "contract" feature)

// Only compile as WASM when the contract feature is active and we're not exporting ABI
#![cfg_attr(
    all(feature = "contract", not(feature = "export-abi")),
    no_main
)]

extern crate alloc;

pub mod valuation;

// ─────────────────────────────────────────────────────────────────────────────
// Stylus On-Chain Contract (only compiled with "contract" feature)
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(feature = "contract")]
mod contract {
    use crate::valuation::*;
    use stylus_sdk::prelude::*;
    use alloy_primitives::U256;

    sol_storage! {
        #[entrypoint]
        pub struct CollateralValuation {
            /// Reserved for future on-chain asset registry
            uint64 next_id;
        }
    }

    /// Public methods exposed to Solidity callers.
    /// Each is auto-exported with a Solidity-compatible selector.
    #[public]
    impl CollateralValuation {
        /// `calculateCurrentValue(uint8,uint64,uint64,uint8,uint64) → uint256`
        pub fn calculate_current_value(
            &self,
            asset_type: u8,
            initial_value: u64,
            purchase_date: u64,
            risk_score: u8,
            current_timestamp: u64,
        ) -> U256 {
            U256::from(compute_current_value(
                asset_type, initial_value, purchase_date, risk_score, current_timestamp,
            ))
        }

        /// `batchValuate(uint64[],uint64[],uint8[],uint64) → uint256[]`
        pub fn batch_valuate(
            &self,
            initial_values: Vec<u64>,
            purchase_dates: Vec<u64>,
            risk_scores: Vec<u8>,
            current_timestamp: u64,
        ) -> Vec<U256> {
            compute_batch(&initial_values, &purchase_dates, &risk_scores, current_timestamp)
                .into_iter()
                .map(U256::from)
                .collect()
        }

        /// `getDepreciationSchedule(uint64,uint8) → uint256[]`
        pub fn get_depreciation_schedule(
            &self,
            initial_value: u64,
            risk_score: u8,
        ) -> Vec<U256> {
            compute_depreciation_schedule(initial_value, risk_score)
                .into_iter()
                .map(U256::from)
                .collect()
        }
    }
}
