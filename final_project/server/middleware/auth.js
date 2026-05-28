const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in DB
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    // 4. Attach user to request
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

module.exports = { protect };
