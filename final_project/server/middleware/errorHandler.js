const errorHandler = (err, req, res, next) => {
  // Always log the full error for debugging
  console.error("🔴 ERROR:", err.message);
  console.error("Stack:", err.stack);

  if (err.code === "23505") {
    return res.status(409).json({ success: false, message: "A record with that value already exists." });
  }
  if (err.code === "23503") {
    return res.status(400).json({ success: false, message: "Referenced record does not exist." });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

const notFound = (req, res, next) => {
  // Don't 404 on API routes - only on unknown paths
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
  }
  next();
};

module.exports = { errorHandler, notFound };
