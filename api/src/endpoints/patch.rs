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
                CALL UPDATE_DEBT_SERIES(
                    P_SERIES_NAME => ?,
                    P_IS_TAX_EXEMPT => ?,
                    P_DELIVERY_DATE => ?,
                    P_DATED_DATE => ?,
                    P_PAR_AMOUNT => ?,
                    P_PREMIUM => ?,
                    P_STRUCTURE => ?,
                    P_COST_OF_ISSUANCE => ?,
                    P_IS_STRAIGHT_LINE => ?,
                    P_USE_OF_PROCEEDS => ?,
                    P_ID => ?
                );
            ";

            let params = (
                &payload.series_name.into_parameter(),
                &payload.is_tax_exempt.into_parameter(),
                &payload.delivery_date.into_parameter(),
                &payload.dated_date.into_parameter(),
                &payload.par_amount.into_parameter(),
                &payload.premium.into_parameter(),
                &payload.structure.into_parameter(),
                &payload.cost_of_issuance.into_parameter(),
                &payload.is_straight_line.into_parameter(),
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
                CALL UPDATE_DEBT_SERVICE(
                    P_PAYMENT_DATE => ?,
                    P_PRINCIPAL => ?,
                    P_INTEREST => ?,
                    P_ID => ?
                );
            ";

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
               CALL UPDATE_DEBT_PRICING(
                P_MATURITY_DATE => ?,
                P_AMOUNT => ?,
                P_COUPON_RATE => ?,
                P_YIELD => ?,
                P_PRICE => ?,
                P_PREMIUM_DISCOUNT => ?,
                P_ID => ?
            );
            ";

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
