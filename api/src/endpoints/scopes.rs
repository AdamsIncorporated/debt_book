use crate::AppState;
use crate::endpoints::get::{get_all_debt_series, get_series_names};
use actix_web::{Scope, web};
use anyhow::{Context, Ok, Result};
use odbc_api::{ConnectionOptions, Cursor};

pub fn delete_scope() -> Scope {
    web::scope("/delete")
}

pub fn get_scope() -> Scope {
    web::scope("/get")
        .service(get_all_debt_series)
        .service(get_series_names)
}

pub fn patch_scope() -> Scope {
    web::scope("/patch")
}

pub fn post_scope() -> Scope {
    web::scope("/post")
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
