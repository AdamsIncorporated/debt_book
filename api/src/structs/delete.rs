use serde::{Deserialize, Serialize};

/// Top-level DELETE payload for DebtSeries
#[derive(Serialize, Deserialize)]
pub struct RowDeleteJson {
    pub id: i64,
}
