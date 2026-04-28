use crate::AppState;
use crate::structs::patch::{DebtPricingPatch, DebtSeriesPatch, DebtServicePatch};
use actix_web::{HttpResponse, Responder, patch, web};
use anyhow::Context;
use odbc_api::IntoParameter;

#[patch("/patch_debt_series")]
pub async fn patch_debt_series(
    state: web::Data<AppState>,
    payload: web::Json<DebtSeriesPatch>,
) -> impl Responder {
    let payload = payload.into_inner();

    let result: anyhow::Result<String> = tokio::task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            // SQL with all columns
            let sql = "
                UPDATE TBL_DEBT_SERIES 
                SET 
                    SERIES_NAME = ?,
                    STRUCTURE = ?,
                    IS_TAX_EXEMPT = ?, 
                    COST_OF_ISSUANCE = ?,
                    USE_OF_PROCEEDS = ?
                WHERE ID = ?";

            let params = (
                &payload.series_name.into_parameter(),
                &payload.structure.into_parameter(),
                &payload.is_tax_exempt.into_parameter(),
                &payload.cost_of_issuance.into_parameter(),
                &payload.use_of_proceeds.into_parameter(),
                &payload.id.into_parameter(),
            );

            conn.execute(sql, params, None)?;
            Ok("DebtSeries updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(serde_json::json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtSeries patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtSeries patch failed")
        }
    }
}

#[patch("/patch_debt_service")]
pub async fn patch_debt_service(
    state: web::Data<AppState>,
    payload: web::Json<DebtServicePatch>,
) -> impl Responder {
    let result: anyhow::Result<String> = tokio::task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            // SQL with all columns
            let sql = "
                UPDATE TBL_DEBT_SERVICE 
                SET 
                    PAYMENT_DATE = ?, 
                    PRINCIPAL = ?, 
                    INTEREST = ?
                WHERE ID = ?";

            let params = (
                &payload.payment_date.clone().into_parameter(),
                &payload.principal.into_parameter(),
                &payload.interest.into_parameter(),
                &payload.id.into_parameter(),
            );
            conn.execute(sql, params, None)?;
            Ok("DebtService updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(serde_json::json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtService patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtService patch failed")
        }
    }
}

#[patch("/patch_debt_pricing")]
pub async fn patch_debt_pricing(
    state: web::Data<AppState>,
    payload: web::Json<DebtPricingPatch>,
) -> impl Responder {
    let result: anyhow::Result<String> = tokio::task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            // SQL with all columns
            let sql = "
                UPDATE TBL_DEBT_PRICING
                SET 
                    MATURITY_DATE = ?,
                    AMOUNT = ?, 
                    COUPON_RATE = ?, 
                    YIELD = ?, 
                    PRICE = ?, 
                    PREMIUM_DISCOUNT = ?
                WHERE ID = ?";

            let params = (
                &payload.maturity_date.clone().into_parameter(),
                &payload.amount.into_parameter(),
                &payload.coupon_rate.into_parameter(),
                &payload.yield_rate.into_parameter(),
                &payload.price.into_parameter(),
                &payload.premium_discount.into_parameter(),
                &payload.id.into_parameter(),
            );
            conn.execute(sql, params, None)?;

            Ok("DebtPricing updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(serde_json::json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtPricing patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtPricing patch failed")
        }
    }
}
