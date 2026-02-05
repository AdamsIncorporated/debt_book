use serde::{Deserialize, Serialize};

/// Top-level PATCH payload for DebtSeries
#[derive(Serialize, Deserialize)]
pub struct DebtSeriesDeleteJson {
    pub series_id: i64,
}
