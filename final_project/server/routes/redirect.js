const express = require("express");
const router = express.Router();
const { redirect } = require("../controllers/redirectController");

// Only match short codes - must NOT start with 'api'
router.get("/:code([a-zA-Z0-9_-]{3,20})", (req, res, next) => {
  const code = req.params.code;
  // Skip if this looks like an API or static path
  if (code === "api" || code === "health" || code === "static") {
    return next();
  }
  redirect(req, res, next);
});

module.exports = router;
