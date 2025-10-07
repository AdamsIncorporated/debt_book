// server.js (or server.ts)
const fs = require("fs");
const toml = require("toml");
const http = require("http");
const snowflake = require("snowflake-sdk");

// Read and parse TOML
const tomlData = fs.readFileSync("./secrets.toml", "utf-8");
const config = toml.parse(tomlData).snowflake;

// Create Snowflake connection
const connection = snowflake.createConnection({
    account: config.account,
    username: config.user,
    password: process.env.SNOWFLAKE_PASSWORD,
    authenticator: "externalbrowser",
    warehouse: config.warehouse,
    database: config.database,
    schema: config.schema,
    role: config.role,
});

// Connect
connection.connect((err: any) => {
    if (err) console.error("Unable to connect:", err.message);
    else console.log("Connected to Snowflake!");
});

// Simple HTTP server
const server = http.createServer((req: any, res: any) => {
    if (req.url === "/api/data") {
        connection.execute({
            sqlText: "SELECT CURRENT_VERSION()",
            complete: (err: any, stmt: any, rows: any) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: err.message }));
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(rows));
                }
            },
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
