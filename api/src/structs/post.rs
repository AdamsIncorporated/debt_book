use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPost {
    pub series_name: String,
    pub structure: String,
    pub is_tax_exempt: i8,
    pub cost_of_issuance: Option<f64>,
    pub use_of_proceeds: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtPricingPost {
    pub series_id: i64,        // parent series must exist in DB after Post
    pub maturity_date: String, // YYYY-MM-DD
    pub amount: f64,
    pub coupon_rate: f64,
    pub yield_rate: f64,
    pub price: f64,
    pub premium_discount: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtServicePost {
    pub series_id: i64,       // parent series must exist in DB after Post
    pub payment_date: String, // YYYY-MM-DD
    pub principal: Option<f64>,
    pub interest: Option<f64>,
}
