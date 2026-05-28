const pool = require("./db");

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ── Users table ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100)  NOT NULL,
        email       VARCHAR(255)  NOT NULL UNIQUE,
        password    VARCHAR(255)  NOT NULL,
        created_at  TIMESTAMP     DEFAULT NOW(),
        updated_at  TIMESTAMP     DEFAULT NOW()
      );
    `);
    console.log("✅ users table ready");

    // ── URLs table ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_url  TEXT          NOT NULL,
        short_code    VARCHAR(20)   NOT NULL UNIQUE,
        custom_alias  VARCHAR(50)   UNIQUE,
        total_clicks  INTEGER       DEFAULT 0,
        expires_at    TIMESTAMP     DEFAULT NULL,
        created_at    TIMESTAMP     DEFAULT NOW(),
        updated_at    TIMESTAMP     DEFAULT NOW()
      );
    `);
    console.log("✅ urls table ready");

    // ── Visits table ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url_id      UUID          NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
        ip_address  VARCHAR(50),
        user_agent  TEXT,
        visited_at  TIMESTAMP     DEFAULT NOW()
      );
    `);
    console.log("✅ visits table ready");

    // ── Indexes for performance ───────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_urls_short_code  ON urls(short_code);
      CREATE INDEX IF NOT EXISTS idx_urls_user_id     ON urls(user_id);
      CREATE INDEX IF NOT EXISTS idx_visits_url_id    ON visits(url_id);
      CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
    `);
    console.log("✅ Indexes created");

    await client.query("COMMIT");
    console.log("\n🎉 All tables and indexes created successfully!\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch(() => process.exit(1));
