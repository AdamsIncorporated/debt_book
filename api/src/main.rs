use actix_cors::Cors;
use actix_web::{App, HttpServer, http, web};
use odbc_api::Environment;
use std::sync::Arc;
use tokio::task;
pub mod config;
pub mod endpoints;
pub mod structs;
use crate::config::{AppState, Config};
use endpoints::scopes::{delete_scope, get_scope, patch_scope, post_scope, test_connection};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    let config = Config::from_file("./secrets.toml").expect("Failed to load secrets.toml");
    let conn_str = config.to_connection_string();

    let env = Arc::new(Environment::new().expect("Failed to initialize ODBC environment"));
    let state = AppState { env, conn_str };

    // Startup test
    let testing_state = state.clone();
    task::spawn_blocking(move || test_connection(&testing_state))
        .await
        .expect("Startup join error")
        .expect("Startup connection test failed");

    let shared_data = web::Data::new(state);

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allowed_methods(["POST", "GET", "DELETE", "PATCH"])
                    .allowed_headers([http::header::CONTENT_TYPE, http::header::ACCEPT])
                    .max_age(3600),
            )
            .app_data(shared_data.clone())
            .service(get_scope())
            .service(post_scope())
            .service(patch_scope())
            .service(delete_scope())
    })
    .bind(("127.0.0.1", 5000))?
    .run()
    .await
}
