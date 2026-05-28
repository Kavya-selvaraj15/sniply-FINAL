const pool = require("../config/db");

// ── GET /:code ─────────────────────────────────────────────────────────────────
// This is the core redirect handler. Runs on every short URL click.
const redirect = async (req, res, next) => {
  try {
    const { code } = req.params;

    // 1. Find URL by short code
    const result = await pool.query(
      `SELECT id, original_url, expires_at
       FROM urls
       WHERE short_code = $1`,
      [code],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }

    const url = result.rows[0];

    // 2. Check expiry
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: "This link has expired.",
      });
    }

    // 3. Record visit asynchronously (don't await — don't block the redirect)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    pool
      .query(
        `INSERT INTO visits (url_id, ip_address, user_agent) VALUES ($1, $2, $3)`,
        [url.id, ip, userAgent],
      )
      .catch((err) => console.error("Visit tracking error:", err.message));

    // 4. Increment click counter asynchronously
    pool
      .query(
        `UPDATE urls SET total_clicks = total_clicks + 1, updated_at = NOW() WHERE id = $1`,
        [url.id],
      )
      .catch((err) => console.error("Click count update error:", err.message));

    // 5. Redirect immediately
    return res.redirect(301, url.original_url);
  } catch (err) {
    next(err);
  }
};

module.exports = { redirect };
