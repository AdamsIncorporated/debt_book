use crate::AppState;
use crate::structs::post::{DebtPricingPosts, DebtSeriesPost, DebtServicePosts};
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

            let sql = "INSERT INTO TBL_DEBT_SERIES (SERIES_NAME, IS_TAX_EXEMPT, PAR_AMOUNT, PREMIUM, COST_OF_ISSUANCE) VALUES (?, ?, ?, ?, ?)";
            let params = (
                &payload.series_name.into_parameter(),
                &payload.is_tax_exempt.into_parameter(),
                &payload.par_amount.into_parameter(), 
                &payload.premium.into_parameter(),
                &payload.cost_of_issuance.unwrap_or(0.0).into_parameter(),
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
    payload: web::Json<DebtPricingPosts>,
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
                INSERT INTO TBL_DEBT_PRICING 
                (
                    SERIES_ID, 
                    MATURITY_DATE, 
                    AMOUNT, 
                    COUPON_RATE, 
                    YIELD, 
                    PRICE, 
                    PREMIUM_DISCOUNT
                ) VALUES (?, ?, ?, ?, ?, ?, ?)";
            for post in payload.posts {
            
            let params = (
                &post.series_id.into_parameter(),
                &post.maturity_date.into_parameter(),
                &post.amount.into_parameter(), 
                &post.coupon_rate.into_parameter(),
                &post.yield_rate.into_parameter(),
                &post.price.into_parameter(),
                &post.premium_discount.into_parameter(),
            );
            conn.execute(sql, params, None)
                .context("Failed to post debt pricing.")?;
        }
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
    payload: web::Json<DebtServicePosts>,
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
                INSERT INTO TBL_DEBT_SERIES 
                (
                    SERIES_NAME, 
                    IS_TAX_EXEMPT, 
                    PAR_AMOUNT, 
                    PREMIUM, 
                    COST_OF_ISSUANCE
                ) VALUES (?, ?, ?, ?, ?)";
            for post in payload.posts {
                let params = (
                    &post.series_id.into_parameter(),
                    &post.payment_date.into_parameter(),
                    &post.principal.into_parameter(),
                    &post.interest.into_parameter(),
                );
                conn.execute(sql, params, None)
                    .context("Failed to post debt service.")?;
            }

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
