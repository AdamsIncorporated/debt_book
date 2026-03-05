use crate::AppState;
use crate::structs::delete::DebtSeriesDeleteJson;
use actix_web::{HttpResponse, Responder, put, web};
use anyhow::{Context, Ok};
use odbc_api::IntoParameter;
use tokio::task;

#[put("/delete_all_series")]
pub async fn delete_all_series(
    state: web::Data<AppState>,
    payload: web::Json<DebtSeriesDeleteJson>,
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

            let sql_statements = [
                "DELETE FROM TBL_DEBT_SERIES WHERE ID = ?",
                "DELETE FROM TBL_DEBT_PRICING WHERE SERIES_ID = ?",
                "DELETE FROM TBL_DEBT_SERVICE WHERE SERIES_ID = ?",
            ];

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
