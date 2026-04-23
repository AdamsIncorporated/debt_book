use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPatch {
    pub id: i64,
    pub series_name: String,
    pub structure: String,
    pub is_tax_exempt: i8,
    pub cost_of_issuance: Option<f64>,
    pub use_of_proceeds: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtPricingPatches {
    pub patches: Vec<DebtPricingPatch>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtPricingPatch {
    pub id: i64,
    pub maturity_date: String,
    pub amount: f64,
    pub coupon_rate: f64,
    pub yield_rate: f64,
    pub price: Option<f64>,
    pub premium_discount: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtServicePatches {
    pub patches: Vec<DebtServicePatch>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtServicePatch {
    pub id: i64,
    pub payment_date: String,
    pub principal: f64,
    pub interest: Option<f64>,
}
