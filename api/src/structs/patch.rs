use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPatch {
    pub id: i64,
    pub series_name: String,
    pub is_tax_exempt: i8,
    pub delivery_date: String,
    pub dated_date: String,
    pub par_amount: f64,
    pub premium: Option<f64>,
    pub structure: String,
    pub cost_of_issuance: f64,
    pub is_straight_line: i8,
    pub use_of_proceeds: String,
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
pub struct DebtServicePatch {
    pub id: i64,
    pub payment_date: String,
    pub principal: f64,
    pub interest: Option<f64>,
}
