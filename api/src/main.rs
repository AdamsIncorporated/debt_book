use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, post, web};
use anyhow::{Context, Result};
use odbc_api::ConnectionOptions;
use odbc_api::Cursor;
use odbc_api::Environment;
use odbc_api::Nullable;
use serde::Deserialize;
use std::fs;
use std::sync::Arc;
use tokio::task;

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
}

impl Config {
    fn from_file(path: &str) -> Result<Self> {
        let s = fs::read_to_string(path)
            .with_context(|| format!("Failed to read config file: {}", path))?;
        let cfg: Config = toml::from_str(&s).context("Failed to parse TOML config")?;
        Ok(cfg)
    }

    /// Build an ODBC connection string for Snowflake using the provided fields.
    fn to_connection_string(&self) -> String {
        let server = format!("{}.snowflakecomputing.com", self.snowflake.account);

        format!(
            "Driver={{{}}};Server={};UID={};Role={};Authenticator={};PWD={};",
            self.snowflake.driver,
            server,
            self.snowflake.user,
            self.snowflake.role,
            self.snowflake.authenticator,
            self.snowflake.password
        )
    }
}

/// Shared app state: store the ODBC environment and optionally an open connection handle.
/// For reliability, we use the environment and create connections per request or use a pool.
#[derive(Clone)]
struct AppState {
    env: Arc<Environment>,
    conn_str: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    // Load configuration (change path if needed).
    let secrets = Config::from_file("./secrets.toml")
        .expect("Failed to load config.toml; ensure file exists and is valid TOML");

    let conn_str = secrets.to_connection_string();
    log::info!("ODBC connection string built (driver & server shown; password hidden).");

    // Initialize ODBC environment
    let env = Environment::new().expect("Failed to initialize ODBC environment");
    let state = AppState {
        env: Arc::new(env),
        conn_str: conn_str.clone(),
    };

    // Try a quick connection test on startup (in blocking thread to avoid blocking the async runtime)
    let test_state = state.clone();
    let startup_result = task::spawn_blocking(move || {
        // connect -> run a small query to ensure credentials & driver are OK
        match test_connection_and_run_test(&test_state) {
            Ok(v) => Ok(v),
            Err(e) => Err(e),
        }
    })
    .await
    .expect("Startup join error");

    match startup_result {
        Ok(ver) => log::info!("Connected to Snowflake (startup test). Result: {}", ver),
        Err(e) => {
            log::error!("Startup connection test failed: {:?}", e);
            // decide to continue or exit. Here we exit so operator notices config problem.
            panic!("Startup failed: {:?}", e);
        }
    }

    // Start HTTP server
    let shared_data = web::Data::new(state);

    let cors = Cors::default()
        .allow_any_origin()
        .allow_any_method()
        .allow_any_header()
        .max_age(3600);

    HttpServer::new(move || {
        App::new()
            .wrap(cors)
            .app_data(shared_data.clone())
            .service(run_query)
    })
    .bind(("127.0.0.1", 5000))?
    .run()
    .await
}

fn test_connection_and_run_test(state: &AppState) -> Result<bool> {
    // Connect synchronously via ODBC and run a simple query
    let conn = state
        .env
        .connect_with_connection_string(&state.conn_str, ConnectionOptions::default())
        .context("ODBC connect failed")?;

    // Example: Snowflake has CURRENT_VERSION() function or use SELECT CURRENT_VERSION()
    let sql = "SELECT CURRENT_VERSION()";
    if let Some(mut cursor) = conn
        .execute(&sql, (), Some(5))
        .context("Failed to execute test query")?
    {
        // Fetch the first row using the iterator
        if let Some(mut row) = cursor.next_row()? {
            let mut field = Nullable::<i32>::null();
            let val = row.get_data(0, &mut field);
            let x = val.is_ok();
            return Ok(x);
        }
    }
    return Ok(false);
}

/// JSON body for query requests: { "sql": "SELECT ... LIMIT 10" }
#[derive(Deserialize)]
struct QueryRequest {
    sql: String,
}

#[post("/query")]
async fn run_query(req: web::Json<QueryRequest>, state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok().finish()
}
