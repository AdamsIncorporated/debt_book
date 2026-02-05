use crate::AppState;
use crate::structs::delete::DebtSeriesDeleteJson;
use actix_web::{HttpResponse, Responder, put, web};
use anyhow::{Context, Ok};
use odbc_api::IntoParameter;
use tokio::task;

#[put("/debt/delete")]
pub async fn delete(
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

            let sql = "CALL USP_DEBT_DELETE_OBJECTS(parse_json(?))";
            conn.execute(sql, &json_str.into_parameter(), None)
                .context("Failed to call USP_DEBT_DELETE_OBJECTS")?;

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
