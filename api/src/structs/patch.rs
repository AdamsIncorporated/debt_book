use serde::{Deserialize, Serialize};

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
    pub id: i64,
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
}

/// PATCH version of DebtService (child table)
#[derive(Serialize, Deserialize)]
pub struct DebtServicePatch {
    pub id: i64,
    pub series_id: i64,

    pub payment_date: Option<String>,
    pub principal: Option<f64>,
    pub interest: Option<f64>,
    pub created_at: Option<String>,
}
