use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SeriesNameList {
    pub name: String,
}

#[derive(Serialize, Deserialize)]
pub struct DebtSeriesPatchJson {
    pub debt_series: Vec<DebtSeries>,
    pub debt_pricing: Vec<DebtPricing>,
    pub debt_service: Vec<DebtService>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtSeries {
    pub id: Option<i64>,
    pub series_name: String,
    pub is_tax_exempt: Option<bool>,
    pub par_amount: f64,
    pub premium: Option<f64>,
    pub cost_of_issuance: Option<f64>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtPricing {
    pub id: Option<i64>, // optional for inserts
    pub series_id: i64,
    pub maturity_date: String, // YYYY-MM-DD
    pub amount: f64,
    pub coupon_rate: f64,
    pub yield_rate: f64,
    pub price: f64,
    pub premium_discount: Option<f64>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct DebtService {
    pub id: Option<i64>, // optional for inserts
    pub series_id: i64,
    pub payment_date: String, // YYYY-MM-DD
    pub principal: Option<f64>,
    pub interest: Option<f64>,
    pub created_at: Option<String>,
}
