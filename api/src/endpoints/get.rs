use crate::AppState;
use crate::structs::get::DebtPricing;
use crate::structs::get::DebtSeries;
use crate::structs::get::DebtService;
use crate::structs::get::SeriesNameList;
use actix_web::{HttpResponse, Responder, get, web};
use anyhow::{Context, Ok, Result};
use odbc_api::{ConnectionOptions, Cursor, Nullable};
use tokio::task;

#[get("/get_all_series")]
pub async fn get_all_debt_series(state: web::Data<AppState>) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_NAME: u16 = 2;
    const COLUMN_IS_TAX_EXEMPT: u16 = 3;
    const COLUMN_PAR_AMOUNT: u16 = 4;
    const COLUMN_PREMIUM: u16 = 5;
    const COLUMN_COST_OF_ISSUANCE: u16 = 6;
    const COLUMN_CREATED_AT: u16 = 7;

    const SERIES_NAME_CAPACITY: usize = 100;
    const CREATED_AT_CAPACITY: usize = 50;

    const SQL_GET_ALL_SERIES: &str = "CALL USP_DEBT_GET_ALL_SERIES()";

    let result: anyhow::Result<Vec<DebtSeries>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let mut rows_out: Vec<DebtSeries> = Vec::new();

            if let Some(mut cursor) = conn
                .execute(SQL_GET_ALL_SERIES, (), None)
                .context("Failed to call USP_DEBT_GET_ALL_SERIES")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    /* -------- column 1: id (Option<i64>) -------- */
                    let mut id_buf = 0i64;
                    row.get_data(COLUMN_ID, &mut id_buf)?;
                    let id = id_buf;

                    /* -------- column 2: series_name (Vec<u8>, NOT NULL) -------- */
                    let mut series_name_buf = Vec::<u8>::with_capacity(SERIES_NAME_CAPACITY);
                    row.get_text(COLUMN_SERIES_NAME, &mut series_name_buf)?;
                    let series_name = String::from_utf8(series_name_buf)?;

                    /* -------- column 3: is_tax_exempt (Option<bool>) -------- */
                    let mut is_tax_exempt_buf = Nullable::<u8>::null();
                    row.get_data(COLUMN_IS_TAX_EXEMPT, &mut is_tax_exempt_buf)?;
                    let is_tax_exempt: Option<bool> = is_tax_exempt_buf.into_opt().map(|v| v != 0);

                    /* -------- column 4: par_amount (f64, NOT NULL) -------- */
                    let mut par_amount_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_PAR_AMOUNT, &mut par_amount_buf)?;
                    let par_amount = par_amount_buf
                        .into_opt()
                        .expect("par_amount must not be NULL");

                    /* -------- column 5: premium (Option<f64>) -------- */
                    let mut premium_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_PREMIUM, &mut premium_buf)?;
                    let premium = premium_buf.into_opt();

                    /* -------- column 6: cost_of_issuance (Option<f64>) -------- */
                    let mut cost_of_issuance_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_COST_OF_ISSUANCE, &mut cost_of_issuance_buf)?;
                    let cost_of_issuance = cost_of_issuance_buf.into_opt();

                    /* -------- column 7: created_at (Option<String>) -------- */
                    let mut created_at_buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                    row.get_text(COLUMN_CREATED_AT, &mut created_at_buf)?;
                    let created_at = String::from_utf8(created_at_buf).ok();

                    rows_out.push(DebtSeries {
                        id,
                        series_name,
                        is_tax_exempt,
                        par_amount,
                        premium,
                        cost_of_issuance,
                        created_at,
                    });
                }
            }

            Ok(rows_out)
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            log::error!("Error fetching debt series: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch debt series")
        }
    }
}

#[get("/get_debt_series_by_id/{id}")]
pub async fn get_debt_series_by_id(
    state: web::Data<AppState>,
    path: web::Path<i64>,
) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_NAME: u16 = 2;
    const COLUMN_IS_TAX_EXEMPT: u16 = 3;
    const COLUMN_PAR_AMOUNT: u16 = 4;
    const COLUMN_PREMIUM: u16 = 5;
    const COLUMN_COST_OF_ISSUANCE: u16 = 6;
    const COLUMN_CREATED_AT: u16 = 7;

    const SERIES_NAME_CAPACITY: usize = 100;
    const CREATED_AT_CAPACITY: usize = 50;

    const SQL_GET_ALL_SERIES: &str = "CALL USP_DEBT_GET_DEBT_SERIES_BY_ID(?)";

    let result: anyhow::Result<Vec<DebtSeries>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let mut rows_out: Vec<DebtSeries> = Vec::new();
            let series_id = path.into_inner();

            if let Some(mut cursor) = conn
                .execute(SQL_GET_ALL_SERIES, (&series_id,), None)
                .context("Failed to call USP_DEBT_GET_DEBT_SERIES_BY_ID")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    let id: i64 = {
                        let mut buf = 0i64;
                        row.get_data(COLUMN_ID, &mut buf)?;
                        buf
                    };

                    let series_name: String = {
                        let mut buf = Vec::<u8>::with_capacity(SERIES_NAME_CAPACITY);
                        row.get_text(COLUMN_SERIES_NAME, &mut buf)?;
                        if buf.is_empty() {
                            anyhow::bail!("series_name is NULL but required")
                        }
                        String::from_utf8(buf).context("series_name contains invalid UTF-8")?
                    };

                    let is_tax_exempt: Option<bool> = {
                        let mut buf = Nullable::<u8>::null();
                        row.get_data(COLUMN_IS_TAX_EXEMPT, &mut buf)?;
                        buf.into_opt().map(|v| v != 0)
                    };

                    let par_amount: f64 = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_PAR_AMOUNT, &mut buf)?;
                        buf.into_opt().context("par_amount is NULL but required")?
                    };

                    let premium: Option<f64> = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_PREMIUM, &mut buf)?;
                        buf.into_opt()
                    };

                    let cost_of_issuance: Option<f64> = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_COST_OF_ISSUANCE, &mut buf)?;
                        buf.into_opt()
                    };

                    let created_at: Option<String> = {
                        let mut buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                        row.get_text(COLUMN_CREATED_AT, &mut buf)?;
                        if buf.is_empty() {
                            None
                        } else {
                            Some(
                                String::from_utf8(buf)
                                    .context("created_at contains invalid UTF-8")?,
                            )
                        }
                    };

                    rows_out.push(DebtSeries {
                        id,
                        series_name,
                        is_tax_exempt,
                        par_amount,
                        premium,
                        cost_of_issuance,
                        created_at,
                    });
                }
            }

            Ok(rows_out)
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            log::error!("Error fetching debt series: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch debt series")
        }
    }
}

#[get("/get_debt_series_service_by_id/{id}")]
pub async fn get_debt_series_service_by_id(
    state: web::Data<AppState>,
    path: web::Path<i64>,
) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_ID: u16 = 2;
    const COLUMN_PAYMENT_DATE: u16 = 3;
    const COLUMN_PRINCIPAL: u16 = 4;
    const COLUMN_INTEREST: u16 = 5;
    const COLUMN_CREATED_AT: u16 = 6;

    const PAYMENT_DATE_CAPACITY: usize = 50;
    const CREATED_AT_CAPACITY: usize = 50;
    const SQL_COMMAND: &str = "CALL USP_DEBT_GET_DEBT_SERIES_SERVICE_BY_ID(?)";

    let result: anyhow::Result<Vec<DebtService>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let mut rows_out: Vec<DebtService> = Vec::new();
            let series_id = path.into_inner();

            if let Some(mut cursor) = conn
                .execute(SQL_COMMAND, (&series_id,), None)
                .context("Failed to call USP_DEBT_GET_DEBT_SERIES_SERVICE_BY_ID")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    let id: i64 = {
                        let mut buf = 0i64;
                        row.get_data(COLUMN_ID, &mut buf)?;
                        buf
                    };

                    let series_id: i64 = {
                        let mut buf = Nullable::<i64>::null();
                        row.get_data(COLUMN_SERIES_ID, &mut buf)?;
                        buf.into_opt().context("series_id is NULL but required")?
                    };

                    let payment_date: String = {
                        let mut buf = Vec::<u8>::with_capacity(PAYMENT_DATE_CAPACITY);
                        row.get_text(COLUMN_PAYMENT_DATE, &mut buf)?;
                        if buf.is_empty() {
                            anyhow::bail!("payment_date is NULL but required");
                        }
                        String::from_utf8(buf).context("payment_date contains invalid UTF-8")?
                    };

                    let principal: Option<f64> = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_PRINCIPAL, &mut buf)?;
                        buf.into_opt()
                    };

                    let interest: Option<f64> = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_INTEREST, &mut buf)?;
                        buf.into_opt()
                    };

                    let created_at: Option<String> = {
                        let mut buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                        row.get_text(COLUMN_CREATED_AT, &mut buf)?;
                        if buf.is_empty() {
                            None
                        } else {
                            Some(
                                String::from_utf8(buf)
                                    .context("created_at contains invalid UTF-8")?,
                            )
                        }
                    };

                    rows_out.push(DebtService {
                        id,
                        series_id,
                        payment_date,
                        principal,
                        interest,
                        created_at,
                    });
                }
            }

            Ok(rows_out)
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            log::error!("Error fetching debt service: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch debt service")
        }
    }
}

#[get("/get_debt_series_pricing_by_id/{id}")]
pub async fn get_debt_series_pricing_by_id(
    state: web::Data<AppState>,
    path: web::Path<i64>,
) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_ID: u16 = 2;
    const COLUMN_MATURITY_DATE: u16 = 3;
    const COLUMN_AMOUNT: u16 = 4;
    const COLUMN_COUPON_RATE: u16 = 5;
    const COLUMN_YIELD: u16 = 6;
    const COLUMN_PRICE: u16 = 7;
    const COLUMN_PREMIUM_DISCOUNT: u16 = 8;
    const COLUMN_CREATED_AT: u16 = 9;

    const MATURITY_DATE_DATE_CAPACITY: usize = 50;
    const CREATED_AT_CAPACITY: usize = 50;
    const SQL_COMMAND: &str = "CALL USP_DEBT_GET_DEBT_SERIES_PRICING_BY_ID(?)";

    let result: anyhow::Result<Vec<DebtPricing>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            let mut rows_out: Vec<DebtPricing> = Vec::new();
            let series_id = path.into_inner();

            if let Some(mut cursor) = conn
                .execute(SQL_COMMAND, (&series_id,), None)
                .context("Failed to call USP_DEBT_GET_DEBT_SERIES_PRICING_BY_ID")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    let id: i64 = {
                        let mut buf = 0i64;
                        row.get_data(COLUMN_ID, &mut buf)?;
                        buf
                    };

                    let series_id: i64 = {
                        let mut buf = 0i64;
                        row.get_data(COLUMN_SERIES_ID, &mut buf)?;
                        buf
                    };

                    let maturity_date: String = {
                        let mut buf = Vec::<u8>::with_capacity(MATURITY_DATE_DATE_CAPACITY);
                        row.get_text(COLUMN_MATURITY_DATE, &mut buf)?;
                        if buf.is_empty() {
                            anyhow::bail!("maturity_date is NULL but required");
                        }
                        String::from_utf8(buf).context("maturity_date contains invalid UTF-8")?
                    };

                    let amount: f64 = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_AMOUNT, &mut buf)?;
                        buf.into_opt().context("amount is NULL but required")?
                    };

                    let coupon_rate: f64 = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_COUPON_RATE, &mut buf)?;
                        buf.into_opt().context("coupon_rate is NULL but required")?
                    };

                    let yield_rate: f64 = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_YIELD, &mut buf)?;
                        buf.into_opt().context("yield_rate is NULL but required")?
                    };

                    let price: f64 = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_PRICE, &mut buf)?;
                        buf.into_opt().context("price is NULL but required")?
                    };

                    let premium_discount: Option<f64> = {
                        let mut buf = Nullable::<f64>::null();
                        row.get_data(COLUMN_PREMIUM_DISCOUNT, &mut buf)?;
                        buf.into_opt()
                    };

                    let created_at: Option<String> = {
                        let mut buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                        row.get_text(COLUMN_CREATED_AT, &mut buf)?;
                        if buf.is_empty() {
                            None
                        } else {
                            Some(
                                String::from_utf8(buf)
                                    .context("created_at contains invalid UTF-8")?,
                            )
                        }
                    };

                    rows_out.push(DebtPricing {
                        id,
                        series_id,
                        maturity_date,
                        amount,
                        coupon_rate,
                        yield_rate,
                        price,
                        premium_discount,
                        created_at,
                    });
                }
            }

            Ok(rows_out)
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            log::error!("Error fetching debt pricing: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch debt pricing")
        }
    }
}

#[get("/get_series_names")]
pub async fn get_series_names(state: web::Data<AppState>) -> impl Responder {
    let result: Result<Vec<SeriesNameList>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(&state.conn_str, ConnectionOptions::default())
                .context("ODBC connect failed")?;

            let sql = r#"CALL USP_DEBT_GET_SERIES_NAMES()"#;

            let mut names = Vec::new();

            if let Some(mut cursor) = conn.execute(sql, (), None)? {
                while let Some(mut row) = cursor.next_row()? {
                    let mut buffer = Vec::new();
                    let got_text = row.get_text(1, &mut buffer)?; // returns bool
                    if got_text {
                        // convert buffer (Vec<u8>) to String
                        let name = String::from_utf8(buffer).unwrap_or_else(|_| "".to_string()); // fallback for invalid UTF-8
                        names.push(SeriesNameList { name });
                    }
                }
            }

            Ok(names)
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(names) => HttpResponse::Ok().json(names),
        Err(e) => {
            log::error!("Error fetching series names: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}
