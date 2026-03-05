use crate::AppState;
use crate::structs::patch::{DebtPricingPatch, DebtSeriesPatch, DebtServicePatch};
use actix_web::{HttpResponse, Responder, patch, web};
use anyhow::Context;
use serde_json::json;

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

            let mut sql = "UPDATE DebtSeries SET ".to_string();
            let mut params: Vec<&dyn odbc_api::parameter::Parameter> = Vec::new();

            if let Some(series_name) = &payload.series_name {
                sql.push_str("series_name = ?, ");
                params.push(series_name);
            }
            if let Some(is_tax_exempt) = payload.is_tax_exempt {
                sql.push_str("is_tax_exempt = ?, ");
                params.push(&is_tax_exempt);
            }
            if let Some(par_amount) = payload.par_amount {
                sql.push_str("par_amount = ?, ");
                params.push(&par_amount);
            }
            if let Some(premium) = payload.premium {
                sql.push_str("premium = ?, ");
                params.push(&premium);
            }
            if let Some(cost_of_issuance) = payload.cost_of_issuance {
                sql.push_str("cost_of_issuance = ?, ");
                params.push(&cost_of_issuance);
            }

            if params.is_empty() {
                anyhow::bail!("No fields provided to update");
            }

            // remove last comma
            sql.truncate(sql.len() - 2);
            sql.push_str(" WHERE id = ?");
            params.push(&payload.id);

            conn.execute(&sql, &params)
                .context("Failed to update DebtSeries")?;
            Ok("DebtSeries updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtSeries patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtSeries patch failed")
        }
    }
}

#[patch("/patch_debt_pricing")]
pub async fn patch_debt_pricing(
    state: web::Data<AppState>,
    payload: web::Json<DebtPricingPatch>,
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

            let mut sql = "UPDATE DebtPricing SET ".to_string();
            let mut params: Vec<&dyn odbc_api::parameter::Parameter> = Vec::new();

            if let Some(maturity_date) = &payload.maturity_date {
                sql.push_str("maturity_date = ?, ");
                params.push(maturity_date);
            }
            if let Some(amount) = payload.amount {
                sql.push_str("amount = ?, ");
                params.push(&amount);
            }
            if let Some(coupon_rate) = payload.coupon_rate {
                sql.push_str("coupon_rate = ?, ");
                params.push(&coupon_rate);
            }
            if let Some(yield_rate) = payload.yield_rate {
                sql.push_str("yield_rate = ?, ");
                params.push(&yield_rate);
            }
            if let Some(price) = payload.price {
                sql.push_str("price = ?, ");
                params.push(&price);
            }
            if let Some(premium_discount) = payload.premium_discount {
                sql.push_str("premium_discount = ?, ");
                params.push(&premium_discount);
            }
            if let Some(created_at) = &payload.created_at {
                sql.push_str("created_at = ?, ");
                params.push(created_at);
            }

            if params.is_empty() {
                anyhow::bail!("No fields provided to update");
            }

            sql.truncate(sql.len() - 2); // remove last comma
            sql.push_str(" WHERE id = ?");
            params.push(&payload.id);

            conn.execute(&sql, &params)
                .context("Failed to update DebtPricing")?;
            Ok("DebtPricing updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtPricing patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtPricing patch failed")
        }
    }
}

#[patch("/patch_debt_service")]
pub async fn patch_debt_service(
    state: web::Data<AppState>,
    payload: web::Json<DebtServicePatch>,
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

            let mut sql = "UPDATE DebtService SET ".to_string();
            let mut params: Vec<&dyn odbc_api::parameter::Parameter> = Vec::new();

            if let Some(payment_date) = &payload.payment_date {
                sql.push_str("payment_date = ?, ");
                params.push(payment_date);
            }
            if let Some(principal) = payload.principal {
                sql.push_str("principal = ?, ");
                params.push(&principal);
            }
            if let Some(interest) = payload.interest {
                sql.push_str("interest = ?, ");
                params.push(&interest);
            }
            if let Some(created_at) = &payload.created_at {
                sql.push_str("created_at = ?, ");
                params.push(created_at);
            }

            if params.is_empty() {
                anyhow::bail!("No fields provided to update");
            }

            sql.truncate(sql.len() - 2); // remove last comma
            sql.push_str(" WHERE id = ?");
            params.push(&payload.id);

            conn.execute(&sql, &params)
                .context("Failed to update DebtService")?;
            Ok("DebtService updated successfully".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        Ok(msg) => HttpResponse::Ok().json(json!({ "message": msg })),
        Err(e) => {
            log::error!("DebtService patch failed: {:?}", e);
            HttpResponse::InternalServerError().body("DebtService patch failed")
        }
    }
}
