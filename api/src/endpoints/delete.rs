use crate::AppState;
use crate::structs::delete::RowDeleteJson;
use actix_web::{HttpResponse, Responder, delete, web};
use anyhow::{Context, Ok};
use odbc_api::IntoParameter;
use tokio::task;

#[delete("/delete_debt_pricing")]
pub async fn delete_debt_pricing(
    state: web::Data<AppState>,
    payload: web::Json<RowDeleteJson>,
) -> impl Responder {
    let json_str: String = serde_json::to_string(&payload.into_inner()).unwrap_or_default();

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

            let sql_statements = ["DELETE FROM TBL_DEBT_PRCING WHERE ID = ?"];

            for sql in &sql_statements {
                let cloned_json_str = json_str.clone();
                let param = cloned_json_str.into_parameter();
                conn.execute(sql, &param, None)
                    .context("Failed to call USP_DEBT_DELETE_OBJECTS")?;
            }

            Ok("Delete completed".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(msg) => HttpResponse::Ok().body(msg),
        Err(e) => {
            log::error!("Error deleting debt: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}

#[delete("/delete_debt_service")]
pub async fn delete_debt_service(
    state: web::Data<AppState>,
    payload: web::Json<RowDeleteJson>,
) -> impl Responder {
    let json_str: String = serde_json::to_string(&payload.into_inner()).unwrap_or_default();

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

            let sql_statements = ["DELETE FROM TBL_DEBT_SERVICE WHERE ID = ?"];

            for sql in &sql_statements {
                let cloned_json_str = json_str.clone();
                let param = cloned_json_str.into_parameter();
                conn.execute(sql, &param, None)
                    .context("Failed to call USP_DEBT_DELETE_OBJECTS")?;
            }

            Ok("Delete completed".to_string())
        }
    })
    .await
    .unwrap_or_else(|e| Err(anyhow::anyhow!(e)));

    match result {
        std::result::Result::Ok(msg) => HttpResponse::Ok().body(msg),
        Err(e) => {
            log::error!("Error deleting debt: {:?}", e);
            HttpResponse::InternalServerError().body(format!("Error: {:?}", e))
        }
    }
}
