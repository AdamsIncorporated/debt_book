use anyhow::Result;
use odbc_api::Environment;
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub env: Arc<Environment>,
    pub conn_str: String,
}

#[derive(Deserialize)]
pub struct SnowflakeConfig {
    pub driver: String,
    pub account: String,
    pub user: String,
    pub authenticator: String,
    pub role: String,
    pub database: String,
    pub schema: String,
    pub warehouse: String,
}

#[derive(Deserialize)]
pub struct Config {
    pub snowflake: HashMap<String, SnowflakeConfig>, // keys: prod, test, dev
}

impl Config {
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let contents = std::fs::read_to_string(path)?;
        let config: Config = toml::from_str(&contents)?;
        Ok(config)
    }

    pub fn to_connection_string(&self) -> String {
        // Example: pick the "dev" environment
        let cfg = &self.snowflake["dev"];
        format!(
            "Driver={{{}}};\
            Server={}.snowflakecomputing.com;\
            UID={};\
            AUTHENTICATOR=externalbrowser;\
            ROLE={};\
            DATABASE={};\
            SCHEMA={};\
            WAREHOUSE={};",
            cfg.driver, cfg.account, cfg.user, cfg.role, cfg.database, cfg.schema, cfg.warehouse,
        )
    }
}
