use crate::AppState;
use crate::structs::patch::{DebtPricingPatches, DebtSeriesPatch, DebtServicePatches};
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
                    IS_TAX_EXEMPT = ?, 
                    PAR_AMOUNT = ?, 
                    PREMIUM = ?, 
                    COST_OF_ISSUANCE = ?
                WHERE ID = ?";

            let params = (
                &payload.series_name.into_parameter(),
                &payload.is_tax_exempt.into_parameter(),
                &payload.par_amount.into_parameter(),
                &payload.premium.into_parameter(),
                &payload.cost_of_issuance.into_parameter(),
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
    payload: web::Json<DebtServicePatches>,
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
                UPDATE TBL_DEBT_SERVICE 
                SET 
                    PAYMENT_DATE = ?, 
                    PRINCIPAL = ?, 
                    INTEREST = ?, 
                WHERE ID = ?";

            for patch in payload.patches {
                let params = (
                    &patch.payment_date.into_parameter(),
                    &patch.principal.into_parameter(),
                    &patch.interest.into_parameter(),
                    &patch.id.into_parameter(),
                );
                conn.execute(sql, params, None)?;
            }
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
    payload: web::Json<DebtPricingPatches>,
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
                UPDATE TBL_DEBT_PRICING
                SET 
                    MARURITY_DATE = ?,
                    AMOUNT = ?, 
                    COUPON_RATE = ?, 
                    YIELD_RATE = ?, 
                    PRICE = ?, 
                    PREMIUM_DISCOUNT = ?, 
                WHERE ID = ?";

            for patch in payload.patches {
                let params = (
                    &patch.maturity_date.into_parameter(),
                    &patch.amount.into_parameter(),
                    &patch.coupon_rate.into_parameter(),
                    &patch.yield_rate.into_parameter(),
                    &patch.price.into_parameter(),
                    &patch.premium_discount.into_parameter(),
                    &patch.id.into_parameter(),
                );
                conn.execute(sql, params, None)?;
            }

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
