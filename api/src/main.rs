use actix_cors::Cors;
use actix_web::{App, HttpServer, http, web};
use anyhow::{Context, Result};
use odbc_api::Environment;
use serde::Deserialize;
use std::{fs, sync::Arc};
use tokio::task;
pub mod endpoints;
pub mod structs;
use endpoints::scopes::{delete_scope, get_scope, patch_scope, post_scope, test_connection};

#[derive(Debug, Deserialize, Clone)]
struct Config {
    snowflake: SnowflakeConfig,
}

#[derive(Debug, Deserialize, Clone)]
struct SnowflakeConfig {
    driver: String,
    account: String,
    user: String,
    authenticator: String,
    role: String,
    password: String,
    database: String,
    schema: String,
    warehouse: String,
}

impl Config {
    fn from_file(path: &str) -> Result<Self> {
        let s = fs::read_to_string(path)
            .with_context(|| format!("Failed to read config file: {}", path))?;
        Ok(toml::from_str(&s).context("Failed to parse TOML config")?)
    }

    fn to_connection_string(&self) -> String {
        format!(
            "Driver={{{}}};Server={}.snowflakecomputing.com;UID={};Role={};Authenticator={};PWD={};Database={};Schema={};Warehouse={};",
            self.snowflake.driver,
            self.snowflake.account,
            self.snowflake.user,
            self.snowflake.role,
            self.snowflake.authenticator,
            self.snowflake.password,
            self.snowflake.database,
            self.snowflake.schema,
            self.snowflake.warehouse
        )
    }
}

#[derive(Clone)]
pub struct AppState {
    env: Arc<Environment>,
    conn_str: String,
}

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
