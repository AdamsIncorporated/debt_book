use crate::AppState;
use crate::structs::get::DebtPricing;
use crate::structs::get::DebtSeries;
use crate::structs::get::DebtService;
use crate::structs::get::SeriesNameList;
use actix_web::{HttpResponse, Responder, get, web};
use anyhow::{Context, Ok, Result};
use odbc_api::buffers::Indicator;
use odbc_api::parameter::VarChar;
use odbc_api::{ConnectionOptions, Cursor, Nullable};
use tokio::task;

// USP_DEBT_GET_SERIES_ID_BY_NAME
#[get("/get_series_id_by_name")]
pub async fn get_series_id_by_name(
    state: web::Data<AppState>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const SERIES_NAME_CAPACITY: usize = 100;
    const SQL_COMMAND: &str = "CALL USP_DEBT_GET_SERIES_ID_BY_NAME(?);";

    let series_name = match query.get("series_name") {
        Some(v) => v.clone(),
        None => {
            return HttpResponse::BadRequest().body("series_name is required");
        }
    };

    let result: anyhow::Result<Option<i64>> = actix_web::rt::task::spawn_blocking({
        let state = state.clone();

        move || -> anyhow::Result<Option<i64>> {
            let mut buffer = [0u8; SERIES_NAME_CAPACITY];

            let bytes = series_name.as_bytes();
            let len = bytes.len().min(SERIES_NAME_CAPACITY);
            buffer[..len].copy_from_slice(&bytes[..len]);

            let param = VarChar::from_buffer(buffer, Indicator::Length(len));

            let conn = state
                .env
                .connect_with_connection_string(
                    &state.conn_str,
                    odbc_api::ConnectionOptions::default(),
                )
                .context("ODBC connect failed")?;

            if let Some(mut cursor) = conn.execute(SQL_COMMAND, (&param,), None)? {
                if let Some(mut row) = cursor.next_row()? {
                    let mut id = 0i64;
                    row.get_data(COLUMN_ID, &mut id)?;
                    Ok(Some(id))
                } else {
                    Ok(None)
                }
            } else {
                Ok(None)
            }
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(Some(id)) => HttpResponse::Ok().json(serde_json::json!({
            "id": id
        })),
        std::result::Result::Ok(None) => HttpResponse::NotFound().body("Series not found"),
        Err(e) => {
            log::error!("Error fetching series ID: {:?}", e);
            HttpResponse::InternalServerError().body("Failed to fetch series ID")
        }
    }
}

// USP_DEBT_GET_ALL_DEBT_SERIES
#[get("/get_all_series")]
pub async fn get_all_debt_series(state: web::Data<AppState>) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_NAME: u16 = 2;
    const COLUMN_IS_TAX_EXEMPT: u16 = 3;
    const COLUMN_DELIVERY_DATE: u16 = 4;
    const COLUMN_DATED_DATE: u16 = 5;
    const COLUMN_PAR_AMOUNT: u16 = 6;
    const COLUMN_PREMIUM: u16 = 7;
    const COLUMN_STRUCTURE: u16 = 8;
    const COLUMN_COST_OF_ISSUANCE: u16 = 9;
    const COLUMN_IS_STRAIGHT_LINE: u16 = 10;
    const COLUMN_USE_OF_PROCEEDS: u16 = 11;
    const COLUMN_CREATED_AT: u16 = 12;

    const SERIES_NAME_CAPACITY: usize = 100;
    const DELIVERY_DATE_CAPACITY: usize = 100;
    const DATED_DATE_CAPACITY: usize = 100;
    const STRUCTURE_CAPACITY: usize = 100;
    const USE_OF_PROCEEDS_CAPACITY: usize = 100;
    const CREATED_AT_CAPACITY: usize = 50;

    const SQL_GET_ALL_SERIES: &str = "CALL usp_debt_get_all_debt_series();";

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
                .context("Failed to get all debt series.")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    let mut id_buf = 0i64;
                    row.get_data(COLUMN_ID, &mut id_buf)?;
                    let id = id_buf;

                    let mut series_name_buf = Vec::<u8>::with_capacity(SERIES_NAME_CAPACITY);
                    row.get_text(COLUMN_SERIES_NAME, &mut series_name_buf)?;
                    let series_name = String::from_utf8(series_name_buf)?;

                    let mut is_tax_exempt_buf = Nullable::<u8>::null();
                    row.get_data(COLUMN_IS_TAX_EXEMPT, &mut is_tax_exempt_buf)?;
                    let is_tax_exempt: Option<bool> = is_tax_exempt_buf.into_opt().map(|v| v != 0);

                    let mut delivery_date_buf = Vec::<u8>::with_capacity(DELIVERY_DATE_CAPACITY);
                    row.get_text(COLUMN_DELIVERY_DATE, &mut delivery_date_buf)?;
                    let delivery_date = String::from_utf8(delivery_date_buf)?;

                    let mut dated_date_buf = Vec::<u8>::with_capacity(DATED_DATE_CAPACITY);
                    row.get_text(COLUMN_DATED_DATE, &mut dated_date_buf)?;
                    let dated_date = String::from_utf8(dated_date_buf)?;

                    let mut par_amount_buf = 0f64;
                    row.get_data(COLUMN_PAR_AMOUNT, &mut par_amount_buf)?;
                    let par_amount = par_amount_buf;

                    let mut premium_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_PREMIUM, &mut premium_buf)?;
                    let premium = premium_buf.into_opt();

                    let mut structure_buf = Vec::<u8>::with_capacity(STRUCTURE_CAPACITY);
                    row.get_text(COLUMN_STRUCTURE, &mut structure_buf)?;
                    let structure = String::from_utf8(structure_buf)?;

                    let mut cost_of_issuance_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_COST_OF_ISSUANCE, &mut cost_of_issuance_buf)?;
                    let cost_of_issuance = cost_of_issuance_buf.into_opt();

                    let mut is_straight_line_buf = Nullable::<u8>::null();
                    row.get_data(COLUMN_IS_STRAIGHT_LINE, &mut is_straight_line_buf)?;
                    let is_straight_line: bool =
                        is_straight_line_buf.into_opt().map_or(false, |v| v != 0);

                    let mut use_of_proceeds_buf =
                        Vec::<u8>::with_capacity(USE_OF_PROCEEDS_CAPACITY);
                    row.get_text(COLUMN_USE_OF_PROCEEDS, &mut use_of_proceeds_buf)?;
                    let use_of_proceeds = String::from_utf8(use_of_proceeds_buf)?;

                    let mut created_at_buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                    row.get_text(COLUMN_CREATED_AT, &mut created_at_buf)?;
                    let created_at = String::from_utf8(created_at_buf).ok();

                    rows_out.push(DebtSeries {
                        id,
                        series_name,
                        is_tax_exempt,
                        delivery_date,
                        dated_date,
                        par_amount,
                        premium,
                        structure,
                        cost_of_issuance,
                        is_straight_line,
                        use_of_proceeds,
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

// USP_DEBT_GET_DEBT_SERIES_ID
#[get("/get_debt_series_by_id/{id}")]
pub async fn get_debt_series_by_id(
    state: web::Data<AppState>,
    path: web::Path<i64>,
) -> impl Responder {
    const COLUMN_ID: u16 = 1;
    const COLUMN_SERIES_NAME: u16 = 2;
    const COLUMN_IS_TAX_EXEMPT: u16 = 3;
    const COLUMN_DELIVERY_DATE: u16 = 4;
    const COLUMN_DATED_DATE: u16 = 5;
    const COLUMN_PAR_AMOUNT: u16 = 6;
    const COLUMN_PREMIUM: u16 = 7;
    const COLUMN_STRUCTURE: u16 = 8;
    const COLUMN_COST_OF_ISSUANCE: u16 = 9;
    const COLUMN_IS_STRAIGHT_LINE: u16 = 10;
    const COLUMN_USE_OF_PROCEEDS: u16 = 11;
    const COLUMN_CREATED_AT: u16 = 12;

    const SERIES_NAME_CAPACITY: usize = 100;
    const DELIVERY_DATE_CAPACITY: usize = 100;
    const DATED_DATE_CAPACITY: usize = 100;
    const STRUCTURE_CAPACITY: usize = 100;
    const USE_OF_PROCEEDS_CAPACITY: usize = 100;
    const CREATED_AT_CAPACITY: usize = 50;

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
            let series_id: i64 = path.into_inner();
            let sql = format!("CALL USP_DEBT_GET_DEBT_SERIES_BY_ID({})", &series_id);

            if let Some(mut cursor) = conn
                .execute(&sql, (), None)
                .context("Failed to get all debt series.")?
            {
                while let Some(mut row) = cursor.next_row()? {
                    let mut id_buf = 0i64;
                    row.get_data(COLUMN_ID, &mut id_buf)?;
                    let id = id_buf;

                    let mut series_name_buf = Vec::<u8>::with_capacity(SERIES_NAME_CAPACITY);
                    row.get_text(COLUMN_SERIES_NAME, &mut series_name_buf)?;
                    let series_name = String::from_utf8(series_name_buf)?;

                    let mut is_tax_exempt_buf = Nullable::<u8>::null();
                    row.get_data(COLUMN_IS_TAX_EXEMPT, &mut is_tax_exempt_buf)?;
                    let is_tax_exempt: Option<bool> = is_tax_exempt_buf.into_opt().map(|v| v != 0);

                    let mut delivery_date_buf = Vec::<u8>::with_capacity(DELIVERY_DATE_CAPACITY);
                    row.get_text(COLUMN_DELIVERY_DATE, &mut delivery_date_buf)?;
                    let delivery_date = String::from_utf8(delivery_date_buf)?;

                    let mut dated_date_buf = Vec::<u8>::with_capacity(DATED_DATE_CAPACITY);
                    row.get_text(COLUMN_DATED_DATE, &mut dated_date_buf)?;
                    let dated_date = String::from_utf8(dated_date_buf)?;

                    let mut par_amount_buf = 0f64;
                    row.get_data(COLUMN_PAR_AMOUNT, &mut par_amount_buf)?;
                    let par_amount = par_amount_buf;

                    let mut premium_buf = 0f64;
                    row.get_data(COLUMN_PREMIUM, &mut premium_buf)?;
                    let premium = Some(premium_buf);

                    let mut structure_buf = Vec::<u8>::with_capacity(STRUCTURE_CAPACITY);
                    row.get_text(COLUMN_STRUCTURE, &mut structure_buf)?;
                    let structure = String::from_utf8(structure_buf)?;

                    let mut cost_of_issuance_buf = Nullable::<f64>::null();
                    row.get_data(COLUMN_COST_OF_ISSUANCE, &mut cost_of_issuance_buf)?;
                    let cost_of_issuance = cost_of_issuance_buf.into_opt();

                    let mut is_straight_line_buf = Nullable::<u8>::null();
                    row.get_data(COLUMN_IS_STRAIGHT_LINE, &mut is_straight_line_buf)?;
                    let is_straight_line: bool =
                        is_straight_line_buf.into_opt().map_or(false, |v| v != 0);

                    let mut use_of_proceeds_buf =
                        Vec::<u8>::with_capacity(USE_OF_PROCEEDS_CAPACITY);
                    row.get_text(COLUMN_USE_OF_PROCEEDS, &mut use_of_proceeds_buf)?;
                    let use_of_proceeds = String::from_utf8(use_of_proceeds_buf)?;

                    let mut created_at_buf = Vec::<u8>::with_capacity(CREATED_AT_CAPACITY);
                    row.get_text(COLUMN_CREATED_AT, &mut created_at_buf)?;
                    let created_at = String::from_utf8(created_at_buf).ok();

                    rows_out.push(DebtSeries {
                        id,
                        series_name,
                        is_tax_exempt,
                        delivery_date,
                        dated_date,
                        par_amount,
                        premium,
                        structure,
                        cost_of_issuance,
                        is_straight_line,
                        use_of_proceeds,
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

// USP_DEBT_GET_DEBT_SERVICE_BY_SERIES_ID
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
    const SQL_COMMAND: &str = "CALL USP_DEBT_GET_DEBT_SERVICE_BY_SERIES_ID(?)";

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

// USP_DEBT_GET_DEBT_PRICING_BY_SERIES_ID
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
    const SQL_COMMAND: &str = "CALL USP_DEBT_GET_DEBT_PRICING_BY_SERIES_ID(?);";

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

// USP_DEBT_GET_DISTINCT_DEBT_SERIES_NAMES
#[get("/get_all_series_names")]
pub async fn get_all_series_names(state: web::Data<AppState>) -> impl Responder {
    let result: Result<Vec<SeriesNameList>> = task::spawn_blocking({
        let state = state.clone();
        move || {
            let conn = state
                .env
                .connect_with_connection_string(&state.conn_str, ConnectionOptions::default())
                .context("ODBC connect failed")?;

            let sql = "CALL USP_DEBT_GET_DISTINCT_DEBT_SERIES_NAMES(?);";

            let mut names = Vec::new();

            if let Some(mut cursor) = conn.execute(sql, (), None)? {
                while let Some(mut row) = cursor.next_row()? {
                    let mut buffer = Vec::new();
                    let got_text = row.get_text(1, &mut buffer)?; // returns bool
                    if got_text {
                        // convert buffer (Vec<u8>) to String
                        let name = String::from_utf8(buffer).unwrap_or_else(|_| "".to_string()); // fallback for invalid UTF-8
                        names.push(SeriesNameList { series_name: name });
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
