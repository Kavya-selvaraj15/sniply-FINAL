const pool = require("../config/db");
const { nanoid } = require("nanoid");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// ── Helper: generate unique short code ───────────────────────────────────────
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = nanoid(6); // e.g. "aB3xYz"
    const result = await pool.query(
      "SELECT id FROM urls WHERE short_code = $1",
      [code],
    );
    exists = result.rows.length > 0;
  }
  return code;
};

// ── POST /api/url/shorten ─────────────────────────────────────────────────────
const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id;

    let shortCode;

    if (customAlias) {
      // Check if alias is already taken
      const aliasCheck = await pool.query(
        "SELECT id FROM urls WHERE short_code = $1 OR custom_alias = $1",
        [customAlias],
      );
      if (aliasCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This custom alias is already taken.",
        });
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueCode();
    }

    const result = await pool.query(
      `INSERT INTO urls (user_id, original_url, short_code, custom_alias, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, original_url, short_code, custom_alias, total_clicks, expires_at, created_at`,
      [userId, originalUrl, shortCode, customAlias || null, expiresAt || null],
    );

    const url = result.rows[0];

    res.status(201).json({
      success: true,
      message: "URL shortened successfully.",
      data: {
        ...url,
        shortUrl: `${BASE_URL}/${url.short_code}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/url/my-urls ──────────────────────────────────────────────────────
const getMyUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, original_url, short_code, custom_alias, total_clicks, expires_at, created_at
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM urls WHERE user_id = $1",
      [userId],
    );

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: result.rows.map((url) => ({
        ...url,
        shortUrl: `${BASE_URL}/${url.short_code}`,
        isExpired: url.expires_at
          ? new Date(url.expires_at) < new Date()
          : false,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/url/analytics/:id ────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify URL belongs to this user
    const urlResult = await pool.query(
      `SELECT id, original_url, short_code, custom_alias, total_clicks, expires_at, created_at
       FROM urls WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (urlResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "URL not found." });
    }

    const url = urlResult.rows[0];

    // Last visited time
    const lastVisitResult = await pool.query(
      "SELECT visited_at FROM visits WHERE url_id = $1 ORDER BY visited_at DESC LIMIT 1",
      [id],
    );

    // Recent 20 visits
    const recentVisitsResult = await pool.query(
      `SELECT id, ip_address, user_agent, visited_at
       FROM visits WHERE url_id = $1
       ORDER BY visited_at DESC LIMIT 20`,
      [id],
    );

    // Daily clicks for the last 30 days
    const dailyClicksResult = await pool.query(
      `SELECT
         DATE(visited_at) AS date,
         COUNT(*)::INTEGER AS clicks
       FROM visits
       WHERE url_id = $1
         AND visited_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(visited_at)
       ORDER BY date ASC`,
      [id],
    );

    res.status(200).json({
      success: true,
      data: {
        url: {
          ...url,
          shortUrl: `${BASE_URL}/${url.short_code}`,
          isExpired: url.expires_at
            ? new Date(url.expires_at) < new Date()
            : false,
        },
        lastVisited: lastVisitResult.rows[0]?.visited_at || null,
        recentVisits: recentVisitsResult.rows,
        dailyClicks: dailyClicksResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/url/:id ───────────────────────────────────────────────────────
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "URL not found or unauthorized." });
    }

    res
      .status(200)
      .json({ success: true, message: "URL deleted successfully." });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/url/:id ──────────────────────────────────────────────────────────
const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalUrl, expiresAt } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE urls
       SET original_url = COALESCE($1, original_url),
           expires_at   = COALESCE($2::TIMESTAMP, expires_at),
           updated_at   = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, original_url, short_code, custom_alias, total_clicks, expires_at, created_at`,
      [originalUrl || null, expiresAt || null, id, userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "URL not found or unauthorized." });
    }

    res.status(200).json({
      success: true,
      message: "URL updated successfully.",
      data: {
        ...result.rows[0],
        shortUrl: `${BASE_URL}/${result.rows[0].short_code}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { shortenUrl, getMyUrls, getAnalytics, deleteUrl, updateUrl };
