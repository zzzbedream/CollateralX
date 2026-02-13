// CollateralX — Pure Valuation Engine
// No Stylus/WASM dependencies — fully testable natively.

extern crate alloc;

// ─────────────────────────────────────────────────────────────────────────────
// Constants — Depreciation & Risk Parameters
// ─────────────────────────────────────────────────────────────────────────────

/// Seconds in one year (365.25 days, accounting for leap years)
pub const SECONDS_PER_YEAR: u64 = 31_557_600;

/// Maximum useful life in years for linear depreciation
pub const MAX_USEFUL_LIFE_YEARS: u64 = 10;

/// Residual value floor as a percentage (10%)
pub const RESIDUAL_PERCENT: u64 = 10;

/// Additional discount when `risk_score > 50`
pub const HIGH_RISK_DISCOUNT_PERCENT: u64 = 10;

/// Threshold above which an asset is considered "high risk"
pub const HIGH_RISK_THRESHOLD: u8 = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Core Valuation Functions
// ─────────────────────────────────────────────────────────────────────────────

/// Calculates the current depreciated and risk-adjusted value of an asset.
///
/// # Depreciation Model
/// ```text
/// elapsed_years = (now - purchase_date) / SECONDS_PER_YEAR
/// capped_years  = min(elapsed_years, MAX_USEFUL_LIFE_YEARS)
/// depreciable   = initial_value × (100 - RESIDUAL%) / 100
/// depreciation  = depreciable × capped_years / MAX_USEFUL_LIFE_YEARS
/// base_value    = initial_value - depreciation
/// final_value   = if risk_score > 50: base_value × 90% else: base_value
/// ```
///
/// Returns `0` on arithmetic overflow (fail-safe).
pub fn compute_current_value(
    _asset_type: u8,
    initial_value: u64,
    purchase_date: u64,
    risk_score: u8,
    current_timestamp: u64,
) -> u64 {
    // 1. Elapsed seconds (safe subtraction)
    let elapsed_seconds = match current_timestamp.checked_sub(purchase_date) {
        Some(v) => v,
        None => return 0,
    };

    // 2. Convert to years (integer floor)
    let elapsed_years = elapsed_seconds / SECONDS_PER_YEAR;

    // 3. Cap at maximum useful life
    let capped_years = if elapsed_years > MAX_USEFUL_LIFE_YEARS {
        MAX_USEFUL_LIFE_YEARS
    } else {
        elapsed_years
    };

    // 4. Depreciable portion = initial × 90 / 100
    let depreciable_amount = match initial_value.checked_mul(100 - RESIDUAL_PERCENT) {
        Some(v) => v / 100,
        None => return 0,
    };

    // 5. Linear depreciation
    let depreciation = match depreciable_amount.checked_mul(capped_years) {
        Some(v) => v / MAX_USEFUL_LIFE_YEARS,
        None => return 0,
    };

    // 6. Base value (always ≥ residual floor)
    let base_value = match initial_value.checked_sub(depreciation) {
        Some(v) => v,
        None => return 0,
    };

    // 7. High-risk discount
    if risk_score > HIGH_RISK_THRESHOLD {
        match base_value.checked_mul(100 - HIGH_RISK_DISCOUNT_PERCENT) {
            Some(v) => v / 100,
            None => 0,
        }
    } else {
        base_value
    }
}

/// Batch-valuate multiple assets. Returns one value per asset.
pub fn compute_batch(
    initial_values: &[u64],
    purchase_dates: &[u64],
    risk_scores: &[u8],
    current_timestamp: u64,
) -> alloc::vec::Vec<u64> {
    let len = initial_values.len();
    let mut results = alloc::vec::Vec::with_capacity(len);
    for i in 0..len {
        if i >= purchase_dates.len() || i >= risk_scores.len() {
            results.push(0);
            continue;
        }
        results.push(compute_current_value(
            0,
            initial_values[i],
            purchase_dates[i],
            risk_scores[i],
            current_timestamp,
        ));
    }
    results
}

/// Returns a year-by-year depreciation schedule (year 0..=MAX_USEFUL_LIFE_YEARS).
pub fn compute_depreciation_schedule(initial_value: u64, risk_score: u8) -> alloc::vec::Vec<u64> {
    let mut schedule = alloc::vec::Vec::with_capacity((MAX_USEFUL_LIFE_YEARS + 1) as usize);
    for year in 0..=MAX_USEFUL_LIFE_YEARS {
        let ts = year * SECONDS_PER_YEAR;
        schedule.push(compute_current_value(0, initial_value, 0, risk_score, ts));
    }
    schedule
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_depreciation_at_purchase() {
        let ts = 1_700_000_000u64;
        assert_eq!(compute_current_value(0, 1_000_000, ts, 30, ts), 1_000_000);
    }

    #[test]
    fn full_depreciation_after_max_life() {
        let purchase = 1_000_000_000u64;
        let current = purchase + 15 * SECONDS_PER_YEAR;
        assert_eq!(compute_current_value(0, 1_000_000, purchase, 30, current), 100_000);
    }

    #[test]
    fn half_life_depreciation() {
        let purchase = 1_000_000_000u64;
        let current = purchase + 5 * SECONDS_PER_YEAR;
        assert_eq!(compute_current_value(0, 1_000_000, purchase, 30, current), 550_000);
    }

    #[test]
    fn high_risk_discount() {
        let purchase = 1_000_000_000u64;
        let current = purchase + 5 * SECONDS_PER_YEAR;
        assert_eq!(compute_current_value(0, 1_000_000, purchase, 80, current), 495_000);
    }

    #[test]
    fn future_purchase_returns_zero() {
        assert_eq!(compute_current_value(0, 1_000_000, 2_000_000_000, 30, 1_000_000_000), 0);
    }

    #[test]
    fn zero_initial_value() {
        assert_eq!(compute_current_value(0, 0, 1_000_000_000, 30, 1_500_000_000), 0);
    }

    #[test]
    fn boundary_risk_50_no_discount() {
        let ts = 1_000_000_000u64;
        assert_eq!(compute_current_value(0, 1_000_000, ts, 50, ts), 1_000_000);
    }

    #[test]
    fn boundary_risk_51_applies_discount() {
        let ts = 1_000_000_000u64;
        assert_eq!(compute_current_value(0, 1_000_000, ts, 51, ts), 900_000);
    }

    #[test]
    fn batch_valuation() {
        let ts = 1_000_000_000u64 + 5 * SECONDS_PER_YEAR;
        let results = compute_batch(
            &[1_000_000, 2_000_000],
            &[1_000_000_000, 1_000_000_000],
            &[30, 80],
            ts,
        );
        assert_eq!(results, vec![550_000, 990_000]);
    }

    #[test]
    fn depreciation_schedule() {
        let schedule = compute_depreciation_schedule(1_000_000, 30);
        assert_eq!(schedule.len(), 11);
        assert_eq!(schedule[0], 1_000_000);
        assert_eq!(schedule[10], 100_000);
    }
}
