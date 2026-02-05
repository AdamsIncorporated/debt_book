use crate::AppState;
use crate::structs::post::DebtSeriesPostJson;
use actix_web::{HttpResponse, Responder, post, web};
use anyhow::{Context, Ok};
use odbc_api::IntoParameter;
use tokio::task;

#[post("/debt/insert")]
pub async fn insert_debt(
    state: web::Data<AppState>,
    payload: web::Json<DebtSeriesPostJson>,
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

            let sql = "CALL USP_DEBT_INSERT_OBJECTS(parse_json(?))";
            conn.execute(sql, &json_str.into_parameter(), None)
                .context("Failed to call USP_DEBT_INSERT_OBJECTS")?;

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
