use crate::AppState;
use crate::structs::post::{DebtPricingPost, DebtSeriesPost, DebtServicePost};
use actix_web::{HttpResponse, Responder, post, web};
use anyhow::{Context, Ok};
use odbc_api::IntoParameter;
use tokio::task;

#[post("/post_series")]
pub async fn post_series(
    state: web::Data<AppState>,
    payload: web::Json<DebtSeriesPost>,
) -> impl Responder {
    let payload = payload.into_inner();
    let result: anyhow::Result<String> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let sql = "
                CALL INSERT_DEBT_SERIES(
                    P_SERIES_NAME => ?,
                    P_IS_TAX_EXEMPT => ?,
                    P_DELIVERY_DATE => ?,
                    P_DATED_DATE => ?,
                    P_PAR_AMOUNT => ?,
                    P_PREMIUM => ?,
                    P_STRUCTURE => ?,
                    P_COST_OF_ISSUANCE => ?,
                    P_IS_STRAIGHT_LINE => ?,
                    P_USE_OF_PROCEEDS => ?
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
            );
            conn.execute(sql, params, None)
                .context("Failed to post debt series.")?;

            Ok("Insert completed".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(msg) => HttpResponse::Ok().body(msg),
        Err(e) => {
            log::error!("Error inserting debt: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}

#[post("/post_debt_pricing")]
pub async fn post_debt_pricing(
    state: web::Data<AppState>,
    payload: web::Json<DebtPricingPost>,
) -> impl Responder {
    let result: anyhow::Result<String> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let sql = "
                CALL INSERT_DEBT_PRICING(
                    P_SERIES_ID => ?,
                    P_MATURITY_DATE => ?,
                    P_AMOUNT => ?,
                    P_COUPON_RATE => ?,
                    P_YIELD => ?,
                    P_PRICE => ?,
                    P_PREMIUM_DISCOUNT => ?
                );
            ";
            let params = (
                &payload.series_id.into_parameter(),
                &payload.maturity_date.clone().into_parameter(),
                &payload.amount.into_parameter(),
                &payload.coupon_rate.into_parameter(),
                &payload.yield_rate.into_parameter(),
                &payload.price.into_parameter(),
                &payload.premium_discount.into_parameter(),
            );
            conn.execute(sql, params, None)
                .context("Failed to post debt pricing.")?;
            Ok("Insert completed".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(msg) => HttpResponse::Ok().body(msg),
        Err(e) => {
            log::error!("Error inserting debt: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}

#[post("/post_debt_service")]
pub async fn post_debt_service(
    state: web::Data<AppState>,
    payload: web::Json<DebtServicePost>,
) -> impl Responder {
    let result: anyhow::Result<String> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let sql = "
                CALL INSERT_DEBT_SERVICE(
                    P_SERIES_ID => ?,
                    P_PAYMENT_DATE => ?,
                    P_PRINCIPAL => ?,
                    P_INTEREST => ?
                );
            ";
            let params = (
                &payload.series_id.into_parameter(),
                &payload.payment_date.clone().into_parameter(),
                &payload.principal.into_parameter(),
                &payload.interest.into_parameter(),
            );
            conn.execute(sql, params, None)
                .context("Failed to post debt service.")?;

            Ok("Insert completed".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(msg) => HttpResponse::Ok().body(msg),
        Err(e) => {
            log::error!("Error inserting debt: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}
