const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "url_shortener",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    console.error("👉 Check your DB_PASSWORD in server/.env");
  } else {
    console.log("✅ PostgreSQL connected successfully");
    release();
  }
});

module.exports = pool;
