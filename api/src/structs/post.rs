use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPost {
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
