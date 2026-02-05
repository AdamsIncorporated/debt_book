use serde::{Deserialize, Serialize};

/// Top-level PATCH payload for DebtSeries
#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPatchJson {
    /// Existing series to update (no inserts allowed at top level)
    pub debt_series: Vec<DebtSeriesPatch>,

    /// Child pricing operations: insert/update/delete allowed
    pub debt_pricing: Vec<DebtPricingPatch>,

    /// Child service operations: insert/update/delete allowed
    pub debt_service: Vec<DebtServicePatch>,
}

/// PATCH version of DebtSeries (top-level)
#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPatch {
    /// Must exist for PATCH
    pub id: i64,

    /// Optional fields: PATCH only modifies provided fields
    pub series_name: Option<String>,
    pub is_tax_exempt: Option<bool>,
    pub par_amount: Option<f64>,
    pub premium: Option<f64>,
    pub cost_of_issuance: Option<f64>,
}

/// PATCH version of DebtPricing (child table)
#[derive(Serialize, Deserialize)]
pub struct DebtPricingPatch {
    /// Optional for insert, required for update/delete
    pub id: Option<i64>,
    pub series_id: i64,

    /// Optional fields for PATCH
    pub maturity_date: Option<String>,
    pub amount: Option<f64>,
    pub coupon_rate: Option<f64>,
    pub yield_rate: Option<f64>,
    pub price: Option<f64>,
    pub premium_discount: Option<f64>,

    /// Optional: for auditing / read-only
    pub created_at: Option<String>,

    /// Operation type: "insert" | "update" | "delete"
    pub op: String,
}

/// PATCH version of DebtService (child table)
#[derive(Serialize, Deserialize)]
pub struct DebtServicePatch {
    pub id: Option<i64>, // optional for insert
    pub series_id: i64,

    pub payment_date: Option<String>,
    pub principal: Option<f64>,
    pub interest: Option<f64>,
    pub created_at: Option<String>,

    /// Operation type: "insert" | "update" | "delete"
    pub op: String,
}
