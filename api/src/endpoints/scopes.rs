use crate::AppState;
use crate::endpoints::delete::delete_all_series;
use crate::endpoints::get::{
    get_all_debt_series, get_debt_series_by_id, get_debt_series_pricing_by_id,
    get_debt_series_service_by_id, get_series_id_by_name, get_series_names,
};
use crate::endpoints::patch::{patch_debt_pricing, patch_debt_series, patch_debt_service};
use crate::endpoints::post::post_series;
use actix_web::{Scope, web};
use anyhow::{Context, Ok, Result};
use odbc_api::{ConnectionOptions, Cursor};

pub fn delete_scope() -> Scope {
    web::scope("/delete").service(delete_all_series)
}

pub fn get_scope() -> Scope {
    web::scope("/get")
        .service(get_series_id_by_name)
        .service(get_all_debt_series)
        .service(get_series_names)
        .service(get_debt_series_pricing_by_id)
        .service(get_debt_series_service_by_id)
        .service(get_debt_series_by_id)
}

pub fn patch_scope() -> Scope {
    web::scope("/patch")
        .service(patch_debt_series)
        .service(patch_debt_pricing)
        .service(patch_debt_service)
}

pub fn post_scope() -> Scope {
    web::scope("/post").service(post_series)
}

pub fn test_connection(state: &AppState) -> Result<()> {
    let conn = state
        .env
        .connect_with_connection_string(&state.conn_str, ConnectionOptions::default())?;
    let sql = "SELECT CURRENT_VERSION()";

    if let Some(mut cursor) = conn
        .execute(sql, (), Some(1))
        .context("Failed to execute test query")?
    {
        // cursor.next_row() -> Result<Option<CursorRow>, Error>
        if cursor.next_row()?.is_some() {
            log::info!("Connected to Snowflake successfully.");
            return Ok(());
        }
    }

    anyhow::bail!("Test query returned no rows");
}
