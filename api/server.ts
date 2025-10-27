// server.ts
import fs from "fs";
import http, { IncomingMessage, ServerResponse } from "http";
import toml from "toml";
import { Pool, PoolClient, QueryResult } from "pg";

// --- Define types for TOML config ---
interface PostgresConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

interface AppConfig {
  postgres: PostgresConfig;
}

// --- Read and parse TOML config ---
const tomlData = fs.readFileSync("./secrets.toml", "utf-8");
const parsedConfig = toml.parse(tomlData) as AppConfig;
const config = parsedConfig.postgres;

// --- Create PostgreSQL connection pool ---
const pool = new Pool({
  host: config.host,
  port: config.port ?? 5432,
  user: config.user,
  password: config.password,
  database: config.database,
  ssl: config.ssl ?? false,
});

// --- Verify connection ---
(async () => {
  try {
    const client: PoolClient = await pool.connect();
    console.log("✅ Connected to PostgreSQL!");
    client.release();
  } catch (err: any) {
    console.error("❌ Unable to connect:", err.message);
  }
})();

// --- Create HTTP server ---
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === "/api/data" && req.method === "GET") {
    try {
      const result: QueryResult = await pool.query("SELECT * FROM tbl_debt_maturity LIMIT 10;");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// --- Start the server ---
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
